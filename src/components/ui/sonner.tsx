import { Toaster as SonnerToaster, type ToasterProps } from 'sonner';
import { useTheme } from '../../context/ThemeContext';

const Toaster = (props: ToasterProps) => {
  const { theme } = useTheme();
  return (
    <SonnerToaster
      theme={theme}
      className="toaster group"
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            'group toast rounded-2xl border font-body-sm text-[13px] shadow-xl group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-rose-100 dark:group-[.toaster]:bg-[#140b0f] dark:group-[.toaster]:text-rose-50 dark:group-[.toaster]:border-rose-950/40',
          description: 'group-[.toast]:text-slate-500 dark:group-[.toast]:text-rose-300/70',
          actionButton: 'group-[.toast]:bg-[#e11d48] group-[.toast]:text-white group-[.toast]:rounded-xl',
          cancelButton: 'group-[.toast]:bg-rose-100 group-[.toast]:text-rose-700 group-[.toast]:rounded-xl dark:group-[.toast]:bg-rose-950/40',
          error: 'group-[.toaster]:border-red-300 dark:group-[.toaster]:border-red-900/50',
          success: 'group-[.toaster]:border-emerald-300 dark:group-[.toaster]:border-emerald-900/50',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
