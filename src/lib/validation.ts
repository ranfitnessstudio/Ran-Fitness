export function validatePhone(phone: string): boolean {
  // Enforce exactly 10 digits starting with 6-9
  return /^[6-9]\d{9}$/.test(phone);
}

export function validateEmail(email: string): boolean {
  if (!email) return true; // Optional email fields allowed
  // Standard email format
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

export function validateName(name: string): boolean {
  if (!name) return false;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 100) return false;
  // Reject XSS tags
  if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(trimmed)) return false;
  if (/[<>]/g.test(trimmed)) return false; // Prevent raw HTML tags
  return true;
}

export function validatePassword(password: string): boolean {
  if (!password || password.length < 8) return false;
  // Enforce uppercase, lowercase, number, and special character
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return hasUppercase && hasLowercase && hasNumber && hasSpecial;
}

export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
