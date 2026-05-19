export const getManagerButtonStyles = (hasManager: boolean) => {
  const baseStyles = "rounded-full px-3 py-1.5 font-normal border transition-colors text-sm";
  
  if (hasManager) {
    return `${baseStyles} border-[var(--color-admin-profile-border)] bg-white text-[var(--color-neutral-secondary)] hover:bg-[var(--color-admin-profile-border)]`;
  }
  
  return `${baseStyles} border-[var(--color-box-border)] bg-white text-[var(--color-neutral-light)] hover:bg-[var(--color-neutral-secondary-bg)]`;
};

