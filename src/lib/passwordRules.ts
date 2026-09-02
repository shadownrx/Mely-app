/**
 * Espeja las reglas de assertPassword() del backend (backend/src/lib/sanitize.ts) para
 * poder mostrarlas en vivo en el frontend — antes no había ningún feedback hasta que el
 * registro fallaba recién en el paso final con un error genérico.
 */
export type PasswordRule = { id: string; label: string; ok: boolean };

export function checkPasswordRules(password: string, email?: string): PasswordRule[] {
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const local = email?.split('@')[0]?.toLowerCase().trim();
  const resemblesEmail = Boolean(local && local.length >= 4 && password.toLowerCase().includes(local));

  return [
    { id: 'length', label: 'Al menos 8 caracteres', ok: password.length >= 8 && password.length <= 72 },
    { id: 'letters_numbers', label: 'Con letras y números', ok: hasLetter && hasNumber },
    { id: 'not_email', label: 'No se parece a tu email', ok: !resemblesEmail },
  ];
}

export function isPasswordValid(password: string, email?: string): boolean {
  return checkPasswordRules(password, email).every((rule) => rule.ok);
}
