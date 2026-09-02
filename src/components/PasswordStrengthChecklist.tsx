import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { checkPasswordRules } from '../lib/passwordRules';

interface PasswordStrengthChecklistProps {
  password: string;
  email?: string;
}

export const PasswordStrengthChecklist: React.FC<PasswordStrengthChecklistProps> = ({ password, email }) => {
  const { isLight } = useTheme();
  if (!password) return null;
  const rules = checkPasswordRules(password, email);

  return (
    <div className="flex flex-col gap-1 mt-2">
      {rules.map((rule) => (
        <div
          key={rule.id}
          className={`flex items-center gap-1.5 text-[11px] transition-colors duration-200 ${
            rule.ok ? 'text-emerald-500' : isLight ? 'text-gray-400' : 'text-white/35'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: rule.ok ? "'FILL' 1" : "'FILL' 0" }}>
            {rule.ok ? 'check_circle' : 'radio_button_unchecked'}
          </span>
          <span>{rule.label}</span>
        </div>
      ))}
    </div>
  );
};
