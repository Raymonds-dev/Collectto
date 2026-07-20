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
      expect(validateEmail('userexample.com')).toEqual([false, 'Formato de e-mail inválido']);
      expect(validateEmail('@example.com')).toEqual([false, 'Formato de e-mail inválido']);
      expect(validateEmail('user@')).toEqual([false, 'Formato de e-mail inválido']);
      expect(validateEmail('')).toEqual([false, 'Formato de e-mail inválido']);
      expect(validateEmail('   ')).toEqual([false, 'Formato de e-mail inválido']);
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
      expect(validateUsername('ab')).toEqual([
        false,
        'Nome de usuário deve conter de 3-20 caracteres',
      ]);
      expect(validateUsername('')).toEqual([
        false,
        'Nome de usuário deve conter de 3-20 caracteres',
      ]);
      expect(validateUsername('a'.repeat(21))).toEqual([
        false,
        'Nome de usuário deve conter de 3-20 caracteres',
      ]);
    });

    it('should reject usernames with uppercase letters, spaces, or special characters', () => {
      expect(validateUsername('John_Doe')).toEqual([
        false,
        'O nome de usuário deve conter apenas letras minúsculas, números e sublinhados',
      ]);
      expect(validateUsername('john doe')).toEqual([
        false,
        'O nome de usuário deve conter apenas letras minúsculas, números e sublinhados',
      ]);
      expect(validateUsername('john-doe')).toEqual([
        false,
        'O nome de usuário deve conter apenas letras minúsculas, números e sublinhados',
      ]);
      expect(validateUsername('john.doe')).toEqual([
        false,
        'O nome de usuário deve conter apenas letras minúsculas, números e sublinhados',
      ]);
    });
  });

  describe('validatePassword', () => {
    it('should accept passwords with at least 8 characters', () => {
      expect(validatePassword('Mypassword')).toEqual([true, null]);
      expect(validatePassword('1234567A')).toEqual([true, null]);
      expect(validatePassword('  a  b  c  D ')).toEqual([true, null]); // has non-spaces, >= 8 chars, and uppercase
    });

    it('should reject passwords that are too short', () => {
      expect(validatePassword('Short')).toEqual([
        false,
        'Senha deve conter pelo menos 8 caracteres',
      ]);
      expect(validatePassword('')).toEqual([false, 'Senha deve conter pelo menos 8 caracteres']);
    });

    it('should reject passwords that consist only of whitespace', () => {
      expect(validatePassword('        ')).toEqual([
        false,
        'Senha deve conter pelo menos 8 caracteres',
      ]);
    });

    it('should accept passwords without uppercase letters', () => {
      expect(validatePassword('mypassword')).toEqual([true, null]);
      expect(validatePassword('12345678')).toEqual([true, null]);
    });
  });

  describe('validateDate', () => {
    it('should accept valid ISO dates (yyyy-MM-dd)', () => {
      expect(validateDate('2026-05-25')).toEqual([true, null]);
      expect(validateDate('2000-01-01')).toEqual([true, null]);
      expect(validateDate('2024-02-29')).toEqual([true, null]); // leap year
    });

    it('should reject wrong formats', () => {
      expect(validateDate('05/25/2026')).toEqual([false, 'Formato Inválido. Use yyyy-MM-dd']);
      expect(validateDate('2026-5-25')).toEqual([false, 'Formato Inválido. Use yyyy-MM-dd']);
      expect(validateDate('2026-05-2')).toEqual([false, 'Formato Inválido. Use yyyy-MM-dd']);
      expect(validateDate('invalid-date')).toEqual([false, 'Formato Inválido. Use yyyy-MM-dd']);
      expect(validateDate('')).toEqual([false, 'Formato Inválido. Use yyyy-MM-dd']);
    });

    it('should reject invalid calendar dates', () => {
      expect(validateDate('2026-02-30')).toEqual([false, 'Formato Inválido. Use yyyy-MM-dd']);
      expect(validateDate('2026-04-31')).toEqual([false, 'Formato Inválido. Use yyyy-MM-dd']);
      expect(validateDate('2025-02-29')).toEqual([false, 'Formato Inválido. Use yyyy-MM-dd']); // not leap year
      expect(validateDate('2026-13-10')).toEqual([false, 'Formato Inválido. Use yyyy-MM-dd']);
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
        'Você deve ter pelo menos 13 anos de idade',
      ]);
      expect(validateBirthday(getPastDateStr(13, 1))).toEqual([
        false,
        'Você deve ter pelo menos 13 anos de idade',
      ]); // 1 day under 13
    });

    it('should reject invalid date formats', () => {
      expect(validateBirthday('invalid')).toEqual([false, 'Formato Inválido. Use yyyy-MM-dd']);
      expect(validateBirthday('05/25/2026')).toEqual([false, 'Formato Inválido. Use yyyy-MM-dd']);
      expect(validateBirthday('2026-02-30')).toEqual([false, 'Formato Inválido. Use yyyy-MM-dd']);
    });
  });
});
