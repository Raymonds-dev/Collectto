# Centralized Validation - Research & Design Decisions

**Spec:** 010-centralized-validation  
**Phase:** 0 (Research Consolidation)  
**Status:** Complete  
**Date:** 2026-05-25  

## Overview

This document consolidates research and design decisions for implementing centralized input validation for Authentication (signup, login) and User Profile screens in the Collectto application. Each section outlines the decision, rationale, and alternatives considered.

---

## 1. Email Validation Strategy (RFC 5322 & IDN Support)

### Decision
Use a Unicode-aware regular expression with the JavaScript `/u` flag to support both standard ASCII email addresses and Internationalized Domain Names (IDNs) like `user@example.中国` or `user@example.рф`.
The validation regex is:
```typescript
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[\p{L}0-9](?:[\p{L}0-9-]{0,61}[\p{L}0-9])?(?:\.[\p{L}0-9](?:[\p{L}0-9-]{0,61}[\p{L}0-9])?)*$/u;
```
Before matching, the input string will be trimmed of leading and trailing whitespace.

### Rationale
- **Internationalization Support**: Modern mobile apps must support international domain names (IDN/Punycode) natively. The `\p{L}` Unicode property matches any letter in any language.
- **Hermes Compatibility**: The React Native Hermes engine (used in this project with React Native 0.81.5) fully supports ES2018 Unicode property escapes.
- **Accidental Whitespace**: Users frequently copy-paste emails with trailing or leading spaces (especially during autofill on mobile). Trimming avoids frustrating validation errors while preserving strict validation on the actual email format.

### Alternatives Considered
1. **ASCII-Only Regex**: E.g., `/^\S+@\S+\.\S+$/`. Too permissive on format, but fails on international non-ASCII domains (violates FR-001).
2. **External Punycode Library**: Resolving IDN domains by translating to ASCII representation. Rejected to keep validation as a zero-dependency pure utility file and prevent performance overhead.

---

## 2. Username Validation Rules

### Decision
Validate username length (3-20 characters) and character set (lowercase letters, numbers, and underscores only). Do not allow spaces of any kind (even leading/trailing spaces make it fail). Consecutive underscores (e.g., `john__doe`) are permitted.
The validation regex is:
```typescript
const USERNAME_REGEX = /^[a-z0-9_]+$/;
```

### Rationale
- **Consistent Constraints**: The constraints align with standard backend identifiers, ensuring that username is a safe slug for profile routes.
- **No Automatic Trimming**: For usernames, spaces are prohibited outright. If a user inputs `" john_doe "`, validation should fail rather than silently modifying their username, helping the user understand the exact system constraints.
- **Consecutive Underscores**: Allowed because they do not pose database or route issues, and enforcing a rule against them would overcomplicate the validator without functional necessity.

### Alternatives Considered
1. **Reject consecutive underscores**: E.g., `(?!.*__)`. Adds complexity to the regex without clear product or engineering value.
2. **Auto-trimming**: Quietly fixing leading/trailing spaces. Rejected because it can cause confusion on what the registered username actually is.

---

## 3. Password Requirements & Whitespace Handling

### Decision
Validate passwords to be at least 8 characters long. Passwords that consist entirely of whitespace or become shorter than 8 characters after stripping outer spaces will be rejected.
The implementation checks:
```typescript
if (!password || password.length < 8) {
  return [false, 'Password must be at least 8 characters'];
}
```
If a password contains only spaces, it will fail the minimum 8-character check.

### Rationale
- **Basic Security Baseline**: Minimum 8 characters is a standard industry baseline for password complexity.
- **Spaces-Only Rejection**: A password of only spaces (e.g. `"        "`) offers near-zero real-world security. Checking length of trimmed password or rejecting if it has only spaces prevents weak passwords while keeping the code simple.
- **Extensibility**: The function signature is designed to be easily extensible for future complexity checks (e.g., uppercase, special characters) without changing the call sites in screens.

### Alternatives Considered
1. **Enforce uppercase/special characters immediately**: Rejected because the current spec only mandates the 8-character minimum. We want to avoid over-engineering until requested.
2. **Allow spaces-only passwords**: Rejected due to poor security.

---

## 4. Date & Age Validation (UTC Timezone Boundaries)

### Decision
Implement two validation functions:
1. `validateDate`: Validates that a string matches the `yyyy-MM-dd` format and represents a real calendar date.
2. `validateBirthday`: Wraps `validateDate` and ensures the parsed date indicates an age of 13 years or older in UTC.

Timezone boundaries are addressed by parsing the date parts manually and comparing using UTC to avoid client device timezone offsets shifting the birth date.

```typescript
const parts = dateStr.split('-');
const birthYear = parseInt(parts[0], 10);
const birthMonth = parseInt(parts[1], 10) - 1;
const birthDay = parseInt(parts[2], 10);

const today = new Date();
const currentYear = today.getUTCFullYear();
const currentMonth = today.getUTCMonth();
const currentDate = today.getUTCDate();

let age = currentYear - birthYear;
if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDate < birthDay)) {
  age--;
}
return age >= 13;
```

### Rationale
- **Deterministic Validation**: Parsing using native local Date constructor (`new Date(dateStr)`) shifts dates by the local timezone offset, potentially making a user born on a UTC boundary appear underage or invalid. Manual parsing and UTC comparison guarantee identical results worldwide.
- **Double Validation**: Separating general date formatting from the age check allows reusing the date validator for other non-birthday fields in the future.

### Alternatives Considered
1. **Using Moment.js / Day.js**: Rejected because the project has no such dependencies, and native JS handles this efficiently in a few lines of code.
2. **Local time comparison**: Leads to bugs where a user's birthday validation differs depending on whether they are in Tokyo or New York.

---

## 5. UI Component Refactoring Strategy

### Decision
Extract all validation logic from `LoginScreen`, `UserCreateScreen`, and `AccountScreen`. Import the pure validation functions from `src/utils/validation.ts` and map validation failures directly to UI state.

### Rationale
- **Single Source of Truth**: Changes to validation rules are isolated to a single file, eliminating copy-paste validation errors across screens.
- **Testability**: Pure functions are trivially unit-tested with 100% code coverage.
- **Consistent UX**: Guarantees that the login screen, signup screen, and profile screens apply the identical validation parameters to the same entity properties.

### Alternatives Considered
1. **Validation hook**: Encapsulating validation in a React hook. Rejected because validation doesn't require React lifecycle/state; pure synchronous functions are simpler and more versatile.
