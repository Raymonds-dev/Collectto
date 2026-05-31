# Centralized Validation - Developer Quickstart Guide

**Spec:** 010-centralized-validation  
**Phase:** 1 (Developer Documentation)  
**Status:** Complete  
**Date:** 2026-05-25  

This guide helps developers integrate and use the centralized validation utilities in Collectto screens.

---

## 1. Import Validation Functions

All validation logic is central to `src/utils/validation.ts`. Import only what you need:

```typescript
import { 
  validateEmail, 
  validateUsername, 
  validatePassword, 
  validateDate, 
  validateBirthday 
} from '@/utils/validation';
```

Every validator returns a `ValidationResult` tuple: `[isValid: boolean, errorMessage: string | null]`.

---

## 2. Using Validators in Screens

### Signup Screen (`UserCreateScreen`)

```typescript
import { useState } from 'react';
import { 
  validateEmail, 
  validateUsername, 
  validatePassword, 
  validateBirthday 
} from '@/utils/validation';

export default function UserCreateScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [date, setDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = () => {
    setError(null);

    // Step 1 validation
    if (step === 1) {
      const [emailOk, emailErr] = validateEmail(email);
      if (!emailOk) {
        setError(emailErr);
        return;
      }

      const [birthdayOk, birthdayErr] = validateBirthday(date || '');
      if (!birthdayOk) {
        setError(birthdayErr);
        return;
      }

      setStep(2);
      return;
    }

    // Step 2 validation
    if (step === 2) {
      const [userOk, userErr] = validateUsername(username);
      if (!userOk) {
        setError(userErr);
        return;
      }

      const [passOk, passErr] = validatePassword(password);
      if (!passOk) {
        setError(passErr);
        return;
      }

      if (password !== confirmPassword) {
        setError('As senhas não conferem.');
        return;
      }

      // Proceed with registration...
    }
  };
}
```

### Login Screen (`LoginScreen`)

```typescript
import { useState } from 'react';
import { validateEmail, validatePassword } from '@/utils/validation';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    setError(null);

    // Validate email
    const [emailOk, emailErr] = validateEmail(email);
    if (!emailOk) {
      setError(emailErr);
      return;
    }

    // Validate password
    const [passOk, passErr] = validatePassword(password);
    if (!passOk) {
      setError(passErr);
      return;
    }

    // Proceed with login API call...
  };
}
```

### Profile Edit Screen (`AccountScreen`)

```typescript
import { useState } from 'react';
import { Alert } from 'react-native';
import { validateUsername, validateBirthday } from '@/utils/validation';

export default function AccountScreen() {
  const [profileData, setProfileData] = useState({
    username: '',
    birthdayDate: ''
  });

  const handleSave = async () => {
    // Validate username
    const [userOk, userErr] = validateUsername(profileData.username);
    if (!userOk) {
      Alert.alert('Erro', userErr || 'Nome de usuário inválido.');
      return;
    }

    // Validate date if provided
    if (profileData.birthdayDate) {
      const [birthdayOk, birthdayErr] = validateBirthday(profileData.birthdayDate);
      if (!birthdayOk) {
        Alert.alert('Erro', birthdayErr || 'Data inválida.');
        return;
      }
    }

    // Proceed to update profile API...
  };
}
```

---

## 3. Extending/Modifying Rules

All validation changes must be made exclusively in `src/utils/validation.ts`. Never perform manual validation checks in screen files.

### Example: Adding a password uppercase requirement

To update the password validator to require at least one uppercase letter:

1. Open `src/utils/validation.ts`.
2. Modify `validatePassword`:

```typescript
export function validatePassword(password: string): ValidationResult {
  if (!password || password.length < 8) {
    return [false, 'Password must be at least 8 characters'];
  }
  
  const hasUppercase = /[A-Z]/.test(password);
  if (!hasUppercase) {
    return [false, 'Password must contain at least one uppercase letter'];
  }

  return [true, null];
}
```

All screens using `validatePassword` automatically receive the updated rule and error message without further modifications.
