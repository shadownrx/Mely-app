import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

type GoogleCredentialResponse = { credential: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, string>) => void;
        };
      };
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('No se pudo cargar Google')));
        return;
      }
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('No se pudo cargar Google'));
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

interface GoogleAuthButtonProps {
  onCredential: (idToken: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
}

/** Botón oficial "Sign in with Google" (Google Identity Services). No renderiza nada si no hay VITE_GOOGLE_CLIENT_ID configurado. */
export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ onCredential, text = 'continue_with' }) => {
  const { isLight } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const onCredentialRef = useRef(onCredential);
  onCredentialRef.current = onCredential;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !containerRef.current) return;
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => onCredentialRef.current(response.credential),
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: isLight ? 'outline' : 'filled_black',
          size: 'large',
          text,
          shape: 'pill',
          width: '320',
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [isLight, text]);

  if (!GOOGLE_CLIENT_ID || failed) return null;

  return <div ref={containerRef} className="w-full flex justify-center [&>div]:w-full" />;
};
