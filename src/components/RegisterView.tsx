import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { ARGENTINA_CITIES } from '../data/mockData';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { updateProfile, replacePrompts, uploadPhoto, listInterests } from '../lib/api/profile';
import { redeemCode } from '../lib/api/wallet';
import { ApiError } from '../lib/apiClient';
import type { Gender } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { GoogleAuthButton } from './GoogleAuthButton';
import type { GooglePrefill } from './LoginView';

interface RegisterViewProps {
  onGoToLogin: () => void;
  googlePrefill?: GooglePrefill | null;
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'WOMAN', label: 'Mujer' },
  { value: 'MAN', label: 'Hombre' },
  { value: 'NON_BINARY', label: 'No binario' },
  { value: 'OTHER', label: 'Otro' },
];

function isAdult(dateOfBirth: string): boolean {
  if (!dateOfBirth) return false;
  const dob = new Date(dateOfBirth);
  const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  return age >= 18;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onGoToLogin, googlePrefill }) => {
  const { isLight } = useTheme();
  const { register, refreshUser, loginWithGoogle, registerWithGoogle } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState(1);

  const goToStep = (next: 1 | 2 | 3) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  // Step 1
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<Gender>('WOMAN');
  const [seeking, setSeeking] = useState<Gender[]>(['MAN']);
  const [city, setCity] = useState(ARGENTINA_CITIES[0]);
  const [job, setJob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step1Error, setStep1Error] = useState('');
  const [googleData, setGoogleData] = useState<GooglePrefill | null>(googlePrefill ?? null);

  useEffect(() => {
    if (!googlePrefill) return;
    setGoogleData(googlePrefill);
    setEmail(googlePrefill.email);
    setName((prev) => prev || (googlePrefill.name ?? ''));
  }, [googlePrefill]);

  const handleGoogleCredential = async (idToken: string) => {
    setStep1Error('');
    sounds.playClick();
    try {
      const result = await loginWithGoogle(idToken);
      if (result.needsProfile) {
        setGoogleData({ pendingToken: result.pendingToken, email: result.email, name: result.name });
        setEmail(result.email);
        setName((prev) => prev || (result.name ?? ''));
      }
      // Si needsProfile es false ya existe una cuenta vinculada a ese Google: loginWithGoogle
      // ya dejó la sesión iniciada y App.tsx va a sacarnos de este formulario solo.
    } catch (err) {
      setStep1Error(
        err instanceof ApiError ? err.message : 'No pudimos conectar con Google. Probá de nuevo.',
      );
    }
  };

  // Step 2
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Step 3
  const [bio, setBio] = useState('');
  const [availableInterests, setAvailableInterests] = useState<{ id: string; slug: string; name: string }[]>([]);
  const [selectedInterestIds, setSelectedInterestIds] = useState<string[]>([]);
  const [promptQ, setPromptQ] = useState('Mi cita ideal no negociable...');
  const [promptA, setPromptA] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    listInterests()
      .then(setAvailableInterests)
      .catch(() => undefined);
  }, []);

  const toggleSeeking = (g: Gender) => {
    sounds.playClick();
    setSeeking((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const toggleInterest = (id: string) => {
    sounds.playClick();
    setSelectedInterestIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 6) return prev;
      return [...prev, id];
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAvatarFile(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleStep1Continue = () => {
    setStep1Error('');
    if (!name.trim() || !dateOfBirth || !email.trim() || (!googleData && !password)) {
      setStep1Error('Completá todos los campos obligatorios.');
      return;
    }
    if (!isAdult(dateOfBirth)) {
      setStep1Error('MELY es exclusivamente para mayores de 18 años.');
      return;
    }
    if (!seeking.length) {
      setStep1Error('Elegí a quién te gustaría conocer.');
      return;
    }
    sounds.playClick();
    goToStep(2);
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!acceptTerms || !acceptPrivacy) return;

    setIsIssuing(true);
    sounds.playStamp();
    try {
      if (googleData) {
        await registerWithGoogle({
          pendingToken: googleData.pendingToken,
          dateOfBirth,
          acceptTerms: true,
          acceptPrivacy: true,
        });
      } else {
        await register({
          email: email.trim(),
          password,
          dateOfBirth,
          acceptTerms: true,
          acceptPrivacy: true,
        });
      }

      await updateProfile({
        displayName: name.trim(),
        gender,
        seeking,
        lookingFor: 'UNSURE',
        bio: bio.trim() || undefined,
        city,
        job: job.trim() || undefined,
        interestIds: selectedInterestIds,
      });

      if (promptA.trim()) {
        await replacePrompts([{ question: promptQ.trim() || 'Mi cita ideal...', answer: promptA.trim() }]);
      }

      if (avatarFile) {
        await uploadPhoto(avatarFile).catch(() => undefined);
      }

      await redeemCode('WELCOME').catch(() => undefined);
      await refreshUser();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.code === 'EMAIL_TAKEN'
            ? 'Ese correo ya tiene una cuenta registrada. Iniciá sesión.'
            : err.message
          : 'No pudimos completar el registro. Probá de nuevo.';
      setSubmitError(message);
      setIsIssuing(false);
    }
  };

  const stepTitle = step === 1 ? 'Creá tu cuenta' : step === 2 ? 'Tu foto' : 'Bio e intereses';
  const stepSubtitle =
    step === 1
      ? 'Sumate a MELY y empezá a conocer gente real, verificada.'
      : step === 2
      ? 'Elegí una foto clara donde se te vea bien. Podés cambiarla después.'
      : 'Contá un poco de vos para romper el hielo.';

  const slideVariants: Variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 24 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
    exit: (dir: number) => ({ opacity: 0, x: dir * -24, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`w-full max-w-[420px] mx-auto min-h-screen py-6 px-6 flex flex-col pb-12 ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}
    >
      {/* Back + step dots, onboarding chrome */}
      <div className="flex items-center gap-3.5 mb-6">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            if (step > 1) {
              goToStep((step - 1) as 1 | 2 | 3);
            } else {
              onGoToLogin();
            }
          }}
          className={`w-9 h-9 -ml-1.5 rounded-full flex items-center justify-center focus:outline-none cursor-pointer ${
            isLight ? 'text-[#0f172a] hover:bg-[#f2f2f4]' : 'text-[#fff1f2] hover:bg-white/8'
          }`}
          aria-label="Volver"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div className="flex items-center gap-1.5">
          <span className={`h-1 rounded-full transition-all duration-300 ${step >= 1 ? 'w-[22px] bg-[#e11d48]' : `w-[22px] ${isLight ? 'bg-[#e7e7ea]' : 'bg-white/12'}`}`} />
          <span className={`h-1 rounded-full transition-all duration-300 ${step >= 2 ? 'w-[22px] bg-[#e11d48]' : `w-[22px] ${isLight ? 'bg-[#e7e7ea]' : 'bg-white/12'}`}`} />
          <span className={`h-1 rounded-full transition-all duration-300 ${step >= 3 ? 'w-[22px] bg-[#e11d48]' : `w-[22px] ${isLight ? 'bg-[#e7e7ea]' : 'bg-white/12'}`}`} />
        </div>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`header-${step}`}
          custom={direction}
          initial={{ opacity: 0, x: direction * 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="font-headline-md text-[22px] font-bold block">{stepTitle}</span>
          <p className={`text-[13.5px] mt-1.5 mb-7 leading-relaxed ${isLight ? 'text-[#64748b]' : 'text-[#a89a9e]'}`}>{stepSubtitle}</p>
        </motion.div>
      </AnimatePresence>

      <form onSubmit={handleCompleteRegistration} className="flex flex-col gap-4">
       <AnimatePresence mode="wait" custom={direction}>
        {/* STEP 1: Personal Identification */}
        {step === 1 && (
          <motion.div
            key="step-1"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex flex-col gap-4"
          >
            {step1Error && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[11px]">{step1Error}</div>
            )}

            <div>
              <Label className="mb-1 block">Nombre</Label>
              <Input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Mariel Juárez" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label className="mb-1 block">Fecha de nacimiento</Label>
                <Input type="date" required value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
              </div>

              <div>
                <Label className="mb-1 block">Ciudad</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="text-[12px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ARGENTINA_CITIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label className="mb-1 block">Género</Label>
                <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
                  <SelectTrigger className="text-[12px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-1 block">Ocupación</Label>
                <Input type="text" value={job} onChange={(e) => setJob(e.target.value)} placeholder="Opcional" />
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block">Buscás conocer a</Label>
              <div className="flex flex-wrap gap-1.5">
                {GENDER_OPTIONS.map((g) => {
                  const isSelected = seeking.includes(g.value);
                  return (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => toggleSeeking(g.value)}
                      className={`px-3 py-1.5 rounded-full text-[12px] transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-bold border-transparent'
                          : isLight
                          ? 'bg-[#f7f7f8] text-[#475569] border-[#e7e7ea] hover:border-[#e11d48]/40'
                          : 'bg-white/5 text-[#a89a9e] border-white/10 hover:border-[#e11d48]/40'
                      }`}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="mb-1 block">Email</Label>
              <Input
                type="email"
                required
                readOnly={Boolean(googleData)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu.correo@mely.app"
                className={googleData ? 'opacity-70' : ''}
              />
            </div>

            {googleData ? (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 text-[#059669] text-[11px]">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Cuenta verificada con Google. No necesitás contraseña.</span>
              </div>
            ) : (
              <div>
                <Label className="mb-1 block">Contraseña</Label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres, letras y números"
                />
              </div>
            )}

            <Button type="button" variant="cherry" onClick={handleStep1Continue} className="mt-1 w-full normal-case tracking-normal text-[15px]">
              Continuar
            </Button>

            {!googleData && (
              <>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`flex-1 h-px ${isLight ? 'bg-[#e7e7ea]' : 'bg-white/10'}`} />
                  <span className={`text-[12px] ${isLight ? 'text-[#6b7280]' : 'text-[#a89a9e]'}`}>o continuá con</span>
                  <span className={`flex-1 h-px ${isLight ? 'bg-[#e7e7ea]' : 'bg-white/10'}`} />
                </div>
                <GoogleAuthButton onCredential={handleGoogleCredential} text="signup_with" />
              </>
            )}
          </motion.div>
        )}

        {/* STEP 2: Photo */}
        {step === 2 && (
          <motion.div
            key="step-2"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col items-center gap-3 py-2">
              <div className={`w-28 h-28 rounded-full overflow-hidden border ${isLight ? 'border-[#e7e7ea] bg-[#f7f7f8]' : 'border-white/10 bg-white/5'} flex items-center justify-center`}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="material-symbols-outlined text-[44px] text-[#e11d48]">person</span>
                )}
              </div>
              <label
                className={`px-4 py-2 rounded-full border cursor-pointer text-[13px] font-bold ${
                  isLight ? 'bg-[#f7f7f8] border-[#e7e7ea] text-[#e11d48]' : 'bg-white/5 border-white/10 text-[#fb7185]'
                }`}
              >
                {avatarFile ? 'Cambiar foto' : 'Subir foto'}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
              </label>
              <p className={`text-[11.5px] text-center max-w-[280px] ${isLight ? 'text-[#64748b]' : 'text-[#a89a9e]'}`}>
                Podés subirla ahora o después desde tu perfil.
              </p>
            </div>

            <Button
              type="button"
              variant="cherry"
              onClick={() => {
                sounds.playClick();
                goToStep(3);
              }}
              className="mt-1 w-full normal-case tracking-normal text-[15px]"
            >
              Continuar
            </Button>
          </motion.div>
        )}

        {/* STEP 3: Bio, Prompts, Interests, and Terms */}
        {step === 3 && (
          <motion.div
            key="step-3"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex flex-col gap-4"
          >
            {submitError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[11px]">{submitError}</div>
            )}

            <div>
              <Label className="mb-1 block">Bio</Label>
              <Textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Contá tus afinidades, gustos y lo que buscás compartir en un encuentro..."
              />
            </div>

            <div>
              <Label className="mb-1.5 block">Intereses ({selectedInterestIds.length}/6)</Label>
              <div className="flex flex-wrap gap-1.5">
                {availableInterests.map((interest) => {
                  const isSelected = selectedInterestIds.includes(interest.id);
                  return (
                    <button
                      key={interest.id}
                      type="button"
                      onClick={() => toggleInterest(interest.id)}
                      className={`px-3 py-1 rounded-full text-[11.5px] transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-bold border-transparent'
                          : isLight
                          ? 'bg-[#f7f7f8] text-[#475569] border-[#e7e7ea] hover:border-[#e11d48]/40'
                          : 'bg-white/5 text-[#a89a9e] border-white/10 hover:border-[#e11d48]/40'
                      }`}
                    >
                      {interest.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="mb-1 block">Un prompt para romper el hielo (opcional)</Label>
              <Input
                type="text"
                value={promptQ}
                onChange={(e) => setPromptQ(e.target.value)}
                className="mb-1.5 font-medium text-[#e11d48] dark:text-[#fb7185]"
              />
              <Input type="text" value={promptA} onChange={(e) => setPromptA(e.target.value)} placeholder="Tu respuesta..." />
            </div>

            {/* Single combined consent block, not a wall of checkboxes */}
            <div className="flex flex-col gap-2.5">
              <Label className="flex items-start gap-2.5 cursor-pointer select-none normal-case tracking-normal text-[12px] font-normal leading-relaxed text-slate-600 dark:text-[#a89a9e]">
                <Checkbox required checked={acceptTerms} onCheckedChange={(v) => setAcceptTerms(v === true)} className="mt-0.5 shrink-0" />
                <span>Acepto los <strong>Términos y condiciones</strong> de MELY.</span>
              </Label>
              <Label className="flex items-start gap-2.5 cursor-pointer select-none normal-case tracking-normal text-[12px] font-normal leading-relaxed text-slate-600 dark:text-[#a89a9e]">
                <Checkbox required checked={acceptPrivacy} onCheckedChange={(v) => setAcceptPrivacy(v === true)} className="mt-0.5 shrink-0" />
                <span>Acepto la <strong>Política de privacidad</strong> y la verificación presencial en cada encuentro.</span>
              </Label>
            </div>

            <Button
              id="register-submit-btn"
              type="submit"
              variant="cherry"
              size="lg"
              disabled={isIssuing || !acceptTerms || !acceptPrivacy}
              className="w-full mt-1 normal-case tracking-normal text-[15px]"
            >
              {isIssuing ? (
                <span className="inline-flex items-center gap-2">
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  Creando tu cuenta...
                </span>
              ) : (
                'Crear cuenta'
              )}
            </Button>
          </motion.div>
        )}
       </AnimatePresence>
      </form>

      <div className="mt-8 flex items-center justify-center gap-1.5">
        <span className={`text-[13.5px] ${isLight ? 'text-[#6b7280]' : 'text-[#a89a9e]'}`}>¿Ya tenés cuenta?</span>
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onGoToLogin();
          }}
          className="text-[13.5px] font-bold text-[#e11d48] hover:underline cursor-pointer"
        >
          Iniciá sesión
        </button>
      </div>
    </motion.div>
  );
};
