
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth <= 768;
};

export const generateUPILink = (upiId: string, amount: number, note: string): string => {
  return `upi://pay?pa=${upiId}&am=${amount.toFixed(2)}&cu=GBP&tn=${encodeURIComponent(note)}`;
};
