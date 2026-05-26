import {
  validateBirthday,
  validateDate,
  validateEmail,
  validatePassword,
  validateUsername,
} from '../validation';

describe('Centralized Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should accept valid standard email addresses', () => {
      expect(validateEmail('user@example.com')).toEqual([true, null]);
      expect(validateEmail('first.last@sub.domain.co.uk')).toEqual([true, null]);
    });

    it('should accept valid international/Unicode domain names (IDNs)', () => {
      expect(validateEmail('user@example.中国')).toEqual([true, null]);
      expect(validateEmail('teste@site.com.br')).toEqual([true, null]);
    });

    it('should trim leading and trailing whitespaces and validate successfully', () => {
      expect(validateEmail('  user@example.com  ')).toEqual([true, null]);
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('userexample.com')).toEqual([false, 'Invalid email format']);
      expect(validateEmail('@example.com')).toEqual([false, 'Invalid email format']);
      expect(validateEmail('user@')).toEqual([false, 'Invalid email format']);
      expect(validateEmail('')).toEqual([false, 'Invalid email format']);
      expect(validateEmail('   ')).toEqual([false, 'Invalid email format']);
    });
  });

  describe('validateUsername', () => {
    it('should accept valid usernames (lowercase, numbers, underscores, 3-20 chars)', () => {
      expect(validateUsername('john_doe')).toEqual([true, null]);
      expect(validateUsername('user123')).toEqual([true, null]);
      expect(validateUsername('a_1')).toEqual([true, null]); // 3 chars
      expect(validateUsername('john__doe')).toEqual([true, null]); // consecutive underscores allowed
      expect(validateUsername('a'.repeat(20))).toEqual([true, null]); // 20 chars
    });

    it('should reject usernames that are too short or too long', () => {
      expect(validateUsername('ab')).toEqual([false, 'Username must be 3-20 characters']);
      expect(validateUsername('')).toEqual([false, 'Username must be 3-20 characters']);
      expect(validateUsername('a'.repeat(21))).toEqual([false, 'Username must be 3-20 characters']);
    });

    it('should reject usernames with uppercase letters, spaces, or special characters', () => {
      expect(validateUsername('John_Doe')).toEqual([
        false,
        'Username must be lowercase letters, numbers, and underscores only',
      ]);
      expect(validateUsername('john doe')).toEqual([
        false,
        'Username must be lowercase letters, numbers, and underscores only',
      ]);
      expect(validateUsername('john-doe')).toEqual([
        false,
        'Username must be lowercase letters, numbers, and underscores only',
      ]);
      expect(validateUsername('john.doe')).toEqual([
        false,
        'Username must be lowercase letters, numbers, and underscores only',
      ]);
    });
  });

  describe('validatePassword', () => {
    it('should accept passwords with at least 8 characters and at least one uppercase letter', () => {
      expect(validatePassword('Mypassword')).toEqual([true, null]);
      expect(validatePassword('1234567A')).toEqual([true, null]);
      expect(validatePassword('  a  b  c  D ')).toEqual([true, null]); // has non-spaces, >= 8 chars, and uppercase
    });

    it('should reject passwords that are too short', () => {
      expect(validatePassword('Short')).toEqual([false, 'Password must be at least 8 characters']);
      expect(validatePassword('')).toEqual([false, 'Password must be at least 8 characters']);
    });

    it('should reject passwords that consist only of whitespace', () => {
      expect(validatePassword('        ')).toEqual([
        false,
        'Password must be at least 8 characters',
      ]);
    });

    it('should reject passwords without at least one uppercase letter', () => {
      expect(validatePassword('mypassword')).toEqual([
        false,
        'Password must be at least 8 characters and contain at least one uppercase letter',
      ]);
      expect(validatePassword('12345678')).toEqual([
        false,
        'Password must be at least 8 characters and contain at least one uppercase letter',
      ]);
    });
  });

  describe('validateDate', () => {
    it('should accept valid ISO dates (yyyy-MM-dd)', () => {
      expect(validateDate('2026-05-25')).toEqual([true, null]);
      expect(validateDate('2000-01-01')).toEqual([true, null]);
      expect(validateDate('2024-02-29')).toEqual([true, null]); // leap year
    });

    it('should reject wrong formats', () => {
      expect(validateDate('05/25/2026')).toEqual([false, 'Invalid date format. Use yyyy-MM-dd']);
      expect(validateDate('2026-5-25')).toEqual([false, 'Invalid date format. Use yyyy-MM-dd']);
      expect(validateDate('2026-05-2')).toEqual([false, 'Invalid date format. Use yyyy-MM-dd']);
      expect(validateDate('invalid-date')).toEqual([false, 'Invalid date format. Use yyyy-MM-dd']);
      expect(validateDate('')).toEqual([false, 'Invalid date format. Use yyyy-MM-dd']);
    });

    it('should reject invalid calendar dates', () => {
      expect(validateDate('2026-02-30')).toEqual([false, 'Invalid date format. Use yyyy-MM-dd']);
      expect(validateDate('2026-04-31')).toEqual([false, 'Invalid date format. Use yyyy-MM-dd']);
      expect(validateDate('2025-02-29')).toEqual([false, 'Invalid date format. Use yyyy-MM-dd']); // not leap year
      expect(validateDate('2026-13-10')).toEqual([false, 'Invalid date format. Use yyyy-MM-dd']);
    });
  });

  describe('validateBirthday', () => {
    // Set a fixed mocked "today" date or mock Date.now / Date construction
    // For standard tests, we can calculate dates relative to the current actual Date
    // to guarantee they always pass, since the spec says: "Calculations are performed in UTC"
    const getPastDateStr = (yearsAgo: number, daysOffset = 0) => {
      const d = new Date();
      d.setUTCFullYear(d.getUTCFullYear() - yearsAgo);
      d.setUTCDate(d.getUTCDate() + daysOffset);
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(d.getUTCDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    it('should accept birthdays representing ages 13 and older', () => {
      expect(validateBirthday(getPastDateStr(16))).toEqual([true, null]);
      expect(validateBirthday(getPastDateStr(13))).toEqual([true, null]); // exactly 13 years old
    });

    it('should reject birthdays representing ages under 13', () => {
      expect(validateBirthday(getPastDateStr(12))).toEqual([
        false,
        'You must be at least 13 years old',
      ]);
      expect(validateBirthday(getPastDateStr(13, 1))).toEqual([
        false,
        'You must be at least 13 years old',
      ]); // 1 day under 13
    });

    it('should reject invalid date formats', () => {
      expect(validateBirthday('invalid')).toEqual([false, 'Invalid date format. Use yyyy-MM-dd']);
      expect(validateBirthday('05/25/2026')).toEqual([
        false,
        'Invalid date format. Use yyyy-MM-dd',
      ]);
      expect(validateBirthday('2026-02-30')).toEqual([
        false,
        'Invalid date format. Use yyyy-MM-dd',
      ]);
    });
  });
});
