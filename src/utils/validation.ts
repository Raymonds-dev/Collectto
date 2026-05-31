/**
 * Centralized Validation Utilities
 *
 * Implements the validation contract for authentication and user input fields.
 * All functions are pure, synchronous, and return a [isValid, errorMessage] tuple.
 */

export type ValidationResult = [isValid: boolean, errorMessage: string | null];

export type ValidatorFunction = (value: string) => ValidationResult;

/**
 * Email Address Validator
 *
 * Validates format, presence, and supports Internationalized Domain Names (IDNs).
 * Input is automatically trimmed of leading/trailing whitespace before checks.
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = (email || '').trim();
  if (!trimmed) {
    return [false, 'Invalid email format'];
  }

  // Regex supporting Unicode letters in domain and international formats
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[\p{L}0-9](?:[\p{L}0-9-]{0,61}[\p{L}0-9])?(?:\.[\p{L}0-9](?:[\p{L}0-9-]{0,61}[\p{L}0-9])?)+$/u;
  if (!emailRegex.test(trimmed)) {
    return [false, 'Invalid email format'];
  }

  return [true, null];
}

/**
 * Username Validator
 *
 * Enforces length limits (3-20 characters) and allowed characters (lowercase letters,
 * numbers, and underscores). Spaces are strictly prohibited. Consecutive underscores
 * are allowed.
 */
export function validateUsername(username: string): ValidationResult {
  const name = username || '';
  if (name.length < 3 || name.length > 20) {
    return [false, 'Username must be 3-20 characters'];
  }

  const allowedRegex = /^[a-z0-9_]+$/;
  if (!allowedRegex.test(name)) {
    return [false, 'Username must be lowercase letters, numbers, and underscores only'];
  }

  return [true, null];
}

/**
 * Password Validator
 *
 * Validates that the password meets the minimum length requirement of 8 characters.
 * Ensures the password is not consisting solely of whitespace characters.
 */
export function validatePassword(password: string): ValidationResult {
  const pass = password || '';
  const trimmed = pass.trim();

  // Must be at least 8 characters (actual characters, excluding spaces-only)
  if (trimmed.length < 8 || pass.length < 8) {
    return [false, 'Password must be at least 8 characters'];
  }

  // Must contain at least one uppercase letter
  const hasUppercase = /[A-Z]/.test(pass);
  if (!hasUppercase) {
    return [
      false,
      'Password must be at least 8 characters and contain at least one uppercase letter',
    ];
  }

  return [true, null];
}

/**
 * Helper to check if a year is a leap year
 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Generic Date Validator
 *
 * Validates that a date matches the YYYY-MM-DD ISO format and represents a real calendar date.
 * Does not check age limits.
 */
export function validateDate(dateStr: string): ValidationResult {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(dateStr)) {
    return [false, 'Invalid date format. Use yyyy-MM-dd'];
  }

  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (month < 1 || month > 12) {
    return [false, 'Invalid date format. Use yyyy-MM-dd'];
  }

  const daysInMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  const maxDays = daysInMonth[month - 1];
  if (day < 1 || day > maxDays) {
    return [false, 'Invalid date format. Use yyyy-MM-dd'];
  }

  return [true, null];
}

/**
 * Birthday (Age Verification) Validator
 *
 * Ensures the input represents a valid calendar date in YYYY-MM-DD format and the user is
 * at least 13 years old. Calculations are performed in UTC to prevent client device
 * timezone offset bugs.
 */
export function validateBirthday(birthdayStr: string): ValidationResult {
  const dateVal = validateDate(birthdayStr);
  if (!dateVal[0]) {
    return dateVal;
  }

  const [yearStr, monthStr, dayStr] = birthdayStr.split('-');
  const birthYear = parseInt(yearStr, 10);
  const birthMonth = parseInt(monthStr, 10);
  const birthDay = parseInt(dayStr, 10);

  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth(); // 0-11
  const currentDate = now.getUTCDate();

  let age = currentYear - birthYear;
  // If current month is before birth month, or is birth month but current date is before birth date, subtract 1 year
  if (
    currentMonth < birthMonth - 1 ||
    (currentMonth === birthMonth - 1 && currentDate < birthDay)
  ) {
    age--;
  }

  if (age < 13) {
    return [false, 'You must be at least 13 years old'];
  }

  return [true, null];
}
