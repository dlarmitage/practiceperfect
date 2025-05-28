/**
 * Device detection utility for PWA installation guidance
 */

export type DeviceType = 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' | 'Unknown';

/**
 * Detects the user's device type to provide appropriate PWA installation instructions
 */
export const detectDevice = (): DeviceType => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // iOS detection
  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
    return 'iOS';
  }
  
  // Android detection
  if (/android/i.test(userAgent)) {
    return 'Android';
  }
  
  // Windows detection
  if (/Win/.test(navigator.platform)) {
    return 'Windows';
  }
  
  // macOS detection
  if (/Mac/.test(navigator.platform)) {
    return 'macOS';
  }
  
  // Linux detection
  if (/Linux/.test(navigator.platform)) {
    return 'Linux';
  }
  
  return 'Unknown';
};

/**
 * Checks if the app is running as an installed PWA
 */
export const isRunningAsPWA = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};
