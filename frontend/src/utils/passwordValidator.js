// utils/passwordValidator.js
const passwordRequirements = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: true,
  minUppercase: 1,
  minLowercase: 1,
  minNumbers: 1,
  minSymbols: 1
};

const symbolPattern = /[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\;'\/~`]/;

/**
 * Validates password against security requirements
 * @param {string} password - The password to validate
 * @returns {Object} - Validation result with isValid boolean and errors array
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      errors: ['Password is required']
    };
  }
  
  // Check minimum length
  if (password.length < passwordRequirements.minLength) {
    errors.push(`Password must be at least ${passwordRequirements.minLength} characters long`);
  }
  
  // Check maximum length
  if (password.length > passwordRequirements.maxLength) {
    errors.push(`Password must not exceed ${passwordRequirements.maxLength} characters`);
  }
  
  // Check for uppercase letters
  if (passwordRequirements.requireUppercase) {
    const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
    if (uppercaseCount < passwordRequirements.minUppercase) {
      errors.push(`Password must contain at least ${passwordRequirements.minUppercase} uppercase letter(s)`);
    }
  }
  
  // Check for lowercase letters
  if (passwordRequirements.requireLowercase) {
    const lowercaseCount = (password.match(/[a-z]/g) || []).length;
    if (lowercaseCount < passwordRequirements.minLowercase) {
      errors.push(`Password must contain at least ${passwordRequirements.minLowercase} lowercase letter(s)`);
    }
  }
  
  // Check for numbers
  if (passwordRequirements.requireNumbers) {
    const numberCount = (password.match(/[0-9]/g) || []).length;
    if (numberCount < passwordRequirements.minNumbers) {
      errors.push(`Password must contain at least ${passwordRequirements.minNumbers} number(s)`);
    }
  }
  
  // Check for symbols
  if (passwordRequirements.requireSymbols) {
    const symbolCount = (password.match(symbolPattern) || []).length;
    if (symbolCount < passwordRequirements.minSymbols) {
      errors.push(`Password must contain at least ${passwordRequirements.minSymbols} special character(s) (!@#$%^&*(),.?":{}|<>_+-=[]\\;'/~\`)`);
    }
  }
  
  // Check for common weak patterns
  const weakPatterns = [
    /(.)\1{2,}/, // Three or more consecutive identical characters
    /123456/,   // Sequential numbers
    /abcdef/i,  // Sequential letters
    /qwerty/i,  // Common keyboard patterns
    /password/i, // Contains "password"
    /admin/i,    // Contains "admin"
    /login/i     // Contains "login"
  ];
  
  for (const pattern of weakPatterns) {
    if (pattern.test(password)) {
      errors.push('Password contains common weak patterns. Please choose a more secure password');
      break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

/**
 * Calculates password strength score (0-100)
 * @param {string} password - The password to evaluate
 * @returns {Object} - Strength score and level
 */
export const calculatePasswordStrength = (password) => {
  if (!password) {
    return { score: 0, level: 'Very Weak', color: '#ff4757' };
  }
  
  let score = 0;
  
  // Length scoring (0-25 points)
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 5;
  
  // Character type scoring (0-40 points)
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (symbolPattern.test(password)) score += 10;
  
  // Complexity scoring (0-35 points)
  const uniqueChars = new Set(password.split('')).size;
  if (uniqueChars >= 8) score += 10;
  if (uniqueChars >= 12) score += 10;
  
  // Avoid common patterns (0-15 points)
  const hasNoRepeatingChars = !/(.)\1{2,}/.test(password);
  const hasNoSequential = !/123|abc|qwe/i.test(password);
  const hasNoCommonWords = !/password|admin|login/i.test(password);
  
  if (hasNoRepeatingChars) score += 5;
  if (hasNoSequential) score += 5;
  if (hasNoCommonWords) score += 5;
  
  // Determine strength level
  let level, color;
  if (score < 30) {
    level = 'Very Weak';
    color = '#ff4757';
  } else if (score < 50) {
    level = 'Weak';
    color = '#ff6b3d';
  } else if (score < 70) {
    level = 'Fair';
    color = '#ffa502';
  } else if (score < 85) {
    level = 'Good';
    color = '#3742fa';
  } else {
    level = 'Strong';
    color = '#2ed573';
  }
  
  return { score, level, color };
};

/**
 * Generates a secure password that meets all requirements
 * @param {number} length - Desired password length (default: 12)
 * @returns {string} - Generated secure password
 */
export const generateSecurePassword = (length = 12) => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*(),.?":{}|<>_+-=[]\\;/~`';
  
  // Ensure minimum requirements are met
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill remaining length with random characters from all sets
  const allChars = uppercase + lowercase + numbers + symbols;
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password to randomize the order
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

export { passwordRequirements };