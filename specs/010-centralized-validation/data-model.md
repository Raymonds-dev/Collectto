# Centralized Validation - Data Model

**Spec:** 010-centralized-validation  
**Phase:** 1 (Data Model Definition)  
**Status:** Complete  
**Date:** 2026-05-25  

## Overview

This document defines the data models, types, and schemas for the centralized validation utility. It details the input shapes, output formats, and the exact constraints applied to each field.

---

## Type: ValidationResult

### Description
The standardized output format returned by all validator functions. Represented as a TypeScript tuple.

### Fields / Elements

| Index | Name | Type | Description |
|-------|------|------|-------------|
| `0` | `isValid` | `boolean` | `true` if input satisfies all criteria; `false` otherwise. |
| `1` | `errorMessage` | `string \| null` | Human-readable error message if `isValid` is false; otherwise `null`. |

### TypeScript Definition
```typescript
export type ValidationResult = [isValid: boolean, errorMessage: string | null];
```

---

## Type: ValidatorFunction

### Description
The common type signature representing any field validator function.

### TypeScript Definition
```typescript
export type ValidatorFunction<T = string> = (value: T) => ValidationResult;
```

---

## Entity: Email Address

### Inputs
- `email`: `string` (raw user input)

### Validation Rules
1. **Trim**: The input is stripped of leading and trailing whitespace.
2. **Presence**: Must not be empty.
3. **Format**: Must match the Unicode-enabled email regex.
   - Regex: `/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[\p{L}0-9](?:[\p{L}0-9-]{0,61}[\p{L}0-9])?(?:\.[\p{L}0-9](?:[\p{L}0-9-]{0,61}[\p{L}0-9])?)*$/u`
   - Supports IDNs (Internationalized Domain Names) like `user@example.中国`.

### Error Outcomes

| Condition | Error Message |
|-----------|---------------|
| Empty input (after trim) | `"Invalid email format"` |
| Failed regex match | `"Invalid email format"` |

---

## Entity: Username

### Inputs
- `username`: `string` (raw user input)

### Validation Rules
1. **Presence**: Must not be empty.
2. **Length**: Must be between 3 and 20 characters (inclusive).
3. **Character Set**: Must consist only of lowercase letters (`a-z`), numbers (`0-9`), and underscores (`_`). No spaces or uppercase characters allowed anywhere.
   - Regex: `/^[a-z0-9_]+$/`

### Error Outcomes

| Condition | Error Message |
|-----------|---------------|
| Empty input | `"Username must be 3-20 characters"` |
| Length < 3 or > 20 | `"Username must be 3-20 characters"` |
| Contains invalid characters (e.g. spaces, uppercase, symbols) | `"Username must be lowercase letters, numbers, and underscores only"` |

---

## Entity: Password

### Inputs
- `password`: `string` (raw user input)

### Validation Rules
1. **Presence**: Must not be empty.
2. **Length**: Must be at least 8 characters long.
3. **Whitespace Check**: Must not consist entirely of whitespace characters.

### Error Outcomes

| Condition | Error Message |
|-----------|---------------|
| Empty input / length < 8 | `"Password must be at least 8 characters"` |
| Consists entirely of spaces | `"Password must be at least 8 characters"` |

---

## Entity: Date (Generic)

### Inputs
- `dateStr`: `string` (raw user input)

### Validation Rules
1. **Format**: Must match `yyyy-MM-dd` layout.
   - Regex: `/^\d{4}-\d{2}-\d{2}$/`
2. **Existence**: Must represent a valid calendar date (e.g., rejecting February 30th).
   - Validation logic: Parse year, month, and day, construct a Date object in UTC, and verify the components match the input.

### Error Outcomes

| Condition | Error Message |
|-----------|---------------|
| Format mismatch (e.g., `MM/DD/YYYY`) | `"Invalid date format. Use yyyy-MM-dd"` |
| Invalid calendar date | `"Invalid date format. Use yyyy-MM-dd"` |

---

## Entity: Birthday (Age Verification)

### Inputs
- `birthdayStr`: `string` (raw user input)

### Validation Rules
1. **Format/Existence**: Must first pass generic date validation.
2. **Minimum Age**: The user must be at least 13 years old as of the current UTC date.
   - Age calculation is performed in UTC to prevent timezone shifts at midnight boundaries.

### Error Outcomes

| Condition | Error Message |
|-----------|---------------|
| Failed date validation | `"Invalid date format. Use yyyy-MM-dd"` |
| Age < 13 years | `"You must be at least 13 years old"` |
