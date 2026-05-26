/**
 * Centralized Validation Contract
 * 
 * This file documents the public validation APIs, function signatures, and
 * validation error formats. It serves as a contract between the validation
 * implementation and the UI components.
 * 
 * All validation of authentication fields (email, username, password, birthday)
 * and generic dates must delegate to the functions documented in this contract.
 * 
 * @see src/utils/validation.ts (Implementation)
 */

/**
 * Standardized tuple format returned by all validator functions.
 * 
 * Elements:
 * 0: isValid (boolean) - true if the value passes all validation rules
 * 1: errorMessage (string | null) - the user-facing error message, or null if valid
 */
export type ValidationResult = [isValid: boolean, errorMessage: string | null];

/**
 * Email Address Validator
 * 
 * Validates format, presence, and supports Internationalized Domain Names (IDNs).
 * Input is automatically trimmed of leading/trailing whitespace before checks.
 * 
 * Examples:
 * ```typescript
 * validateEmail("user@example.com")    // => [true, null]
 * validateEmail("user@example.中国")   // => [true, null] (Unicode/IDN support)
 * validateEmail(" invalid_email ")     // => [false, "Invalid email format"]
 * validateEmail("")                    // => [false, "Invalid email format"]
 * ```
 * 
 * @param email - The raw input email string
 * @returns A ValidationResult tuple
 */
export function validateEmail(email: string): ValidationResult;

/**
 * Username Validator
 * 
 * Enforces length limits (3-20 characters) and allowed characters (lowercase letters, 
 * numbers, and underscores). Spaces are strictly prohibited. Consecutive underscores 
 * are allowed.
 * 
 * Examples:
 * ```typescript
 * validateUsername("john_doe")     // => [true, null]
 * validateUsername("john__doe")    // => [true, null] (consecutive underscores allowed)
 * validateUsername("ab")           // => [false, "Username must be 3-20 characters"]
 * validateUsername("John_Doe")     // => [false, "Username must be lowercase letters, numbers, and underscores only"]
 * validateUsername("john doe")     // => [false, "Username must be lowercase letters, numbers, and underscores only"]
 * ```
 * 
 * @param username - The raw input username string
 * @returns A ValidationResult tuple
 */
export function validateUsername(username: string): ValidationResult;

/**
 * Password Validator
 * 
 * Validates that the password meets the minimum length requirement of 8 characters.
 * Ensures the password is not consisting solely of whitespace characters.
 * 
 * Examples:
 * ```typescript
 * validatePassword("MySecurePass123")  // => [true, null]
 * validatePassword("1234567")           // => [false, "Password must be at least 8 characters"]
 * validatePassword("        ")          // => [false, "Password must be at least 8 characters"] (whitespace-only)
 * ```
 * 
 * @param password - The raw input password string
 * @returns A ValidationResult tuple
 */
export function validatePassword(password: string): ValidationResult;

/**
 * Generic Date Validator
 * 
 * Validates that a date matches the YYYY-MM-DD ISO format and represents a real calendar date.
 * Does not check age limits.
 * 
 * Examples:
 * ```typescript
 * validateDate("2026-05-25")  // => [true, null]
 * validateDate("2026-02-30")  // => [false, "Invalid date format. Use yyyy-MM-dd"] (Invalid calendar day)
 * validateDate("05/25/2026")  // => [false, "Invalid date format. Use yyyy-MM-dd"] (Wrong format)
 * ```
 * 
 * @param dateStr - The raw input date string
 * @returns A ValidationResult tuple
 */
export function validateDate(dateStr: string): ValidationResult;

/**
 * Birthday (Age Verification) Validator
 * 
 * Ensures the input represents a valid calendar date in YYYY-MM-DD format and the user is 
 * at least 13 years old. Calculations are performed in UTC to prevent client device 
 * timezone offset bugs.
 * 
 * Examples:
 * ```typescript
 * // Assuming today is 2026-05-25
 * validateBirthday("2008-05-25")  // => [true, null] (Exactly 18 years old)
 * validateBirthday("2013-05-25")  // => [true, null] (Exactly 13 years old - boundary)
 * validateBirthday("2015-05-25")  // => [false, "You must be at least 13 years old"]
 * validateBirthday("invalid")     // => [false, "Invalid date format. Use yyyy-MM-dd"]
 * ```
 * 
 * @param birthdayStr - The raw input birthday string
 * @returns A ValidationResult tuple
 */
export function validateBirthday(birthdayStr: string): ValidationResult;
