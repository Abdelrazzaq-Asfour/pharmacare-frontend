// // Strict input validation and sanitization utilities
export const validators = {
  isPositiveNumber: (val) => !isNaN(val) && Number(val) > 0,
  sanitizeInput: (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/[<>]/g, ''); // Basic XSS mitigation filter
  }
};