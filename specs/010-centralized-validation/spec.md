# Feature Specification: Centralize Input Validation for Auth & User

**Feature Branch**: `feature/010-centralize-auth-validation`  
**Created**: 2025-03-19  
**Status**: Draft  
**Input**: User description: "Centralize Input Validation for Auth & User"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Real-time Email Validation (Priority: P1)

When users enter an email address on the signup form, validation happens instantly using the centralized validator. The same email validation rules apply consistently across signup, login, and profile edit screens.

**Why this priority**: Email validation is critical to prevent invalid user registrations and ensure consistent user experience across all auth flows. Email is the primary identifier for user accounts.

**Independent Test**: Can be fully tested by entering various email formats (valid international domains, edge cases) on signup screen and verifying same validation rules reject/accept identical inputs on profile edit screen.

**Acceptance Scenarios**:

1. **Given** user is on signup form, **When** user enters valid email (e.g., "user@example.com"), **Then** validation passes immediately with no error message
2. **Given** user is on signup form, **When** user enters invalid email (e.g., "userexample.com"), **Then** validation fails with standardized error message "Invalid email format"
3. **Given** user is on profile edit screen, **When** user enters same valid email as step 1, **Then** validation passes with identical criteria
4. **Given** user is on signup, **When** user enters international domain email (e.g., "user@example.中国"), **Then** validation passes and accepts IDN format
5. **Given** user enters email on signup and profile edit, **When** exact same input is validated in both forms, **Then** results are identical (same validation rules applied)

---

### User Story 2 - Username Format Consistency (Priority: P1)

Signup screen validates username format according to defined rules (3-20 characters, lowercase letters/numbers/underscores only). Profile edit screen applies identical validation rules, ensuring users experience consistent validation behavior across all screens.

**Why this priority**: Username validation prevents invalid data entry and ensures data consistency. P1 because username is a key identifier for users and must be validated uniformly everywhere it appears.

**Independent Test**: Can be fully tested by entering various username formats on signup and profile edit, verifying both screens enforce identical rules (3-20 chars, lowercase/numbers/underscores, no spaces).

**Acceptance Scenarios**:

1. **Given** user is on signup, **When** user enters valid username (e.g., "john_doe"), **Then** validation passes (6 chars, lowercase + underscore = valid)
2. **Given** user is on signup, **When** user enters username with uppercase (e.g., "John_Doe"), **Then** validation fails with error "Username must be lowercase letters, numbers, and underscores only"
3. **Given** user is on signup, **When** user enters username too short (e.g., "ab"), **Then** validation fails with error "Username must be 3-20 characters"
4. **Given** user is on signup, **When** user enters username too long (e.g., "a_very_long_username_exceeds_20_chars"), **Then** validation fails with error "Username must be 3-20 characters"
5. **Given** user enters username "valid_user" on signup, **When** same username is validated on profile edit, **Then** result is identical (same rules applied)

---

### User Story 3 - Password Strength Requirements (Priority: P1)

All auth forms (signup, login password reset) validate passwords using centralized rules. Password must be minimum 8 characters. Validation is consistent across all auth flows and provides clear error messages.

**Why this priority**: P1 because password security is fundamental to user account safety. Centralized validation ensures password requirements are enforced uniformly and can be updated globally if needed.

**Independent Test**: Can be fully tested by entering various password lengths on signup and password reset forms, verifying both enforce minimum 8 character requirement with identical error messages.

**Acceptance Scenarios**:

1. **Given** user is on signup, **When** user enters valid password (e.g., "MyPass123"), **Then** validation passes (8+ chars)
2. **Given** user is on signup, **When** user enters password too short (e.g., "Short"), **Then** validation fails with error "Password must be at least 8 characters"
3. **Given** user is on password reset form, **When** user enters same valid password from step 1, **Then** validation passes with identical criteria
4. **Given** user enters password with 8 characters exactly, **When** validation runs, **Then** validation passes (boundary condition)
5. **Given** user enters password with 7 characters, **When** validation runs, **Then** validation fails with error message "Password must be at least 8 characters"

---

### User Story 4 - Age Verification with Consistent Date Validation (Priority: P2)

Birthday validation uses centralized validator on signup and profile edit forms. Validator ensures valid ISO date format (yyyy-MM-dd) and enforces minimum age requirement of 13 years. Consistent validation prevents age bypass and ensures data integrity.

**Why this priority**: P2 because age verification is important for legal/compliance reasons but less critical than core auth. Date validation is also used in other features, so centralization prevents future inconsistencies.

**Independent Test**: Can be fully tested by entering various dates and ages on signup birthday field, verifying validator accepts ages 13+ with valid ISO format and rejects underage users with consistent error messages.

**Acceptance Scenarios**:

1. **Given** user is on signup, **When** user enters valid date (e.g., "2008-03-19" - 16 years old), **Then** validation passes
2. **Given** user is on signup, **When** user enters date with underage user (e.g., "2020-03-19" - 4 years old), **Then** validation fails with error "You must be at least 13 years old"
3. **Given** user is on signup, **When** user enters invalid date format (e.g., "03/19/2008"), **Then** validation fails with error "Invalid date format. Use yyyy-MM-dd"
4. **Given** user is on profile edit, **When** user enters same valid date from step 1, **Then** validation passes with identical criteria
5. **Given** user is exactly 13 years old (boundary case), **When** validation runs, **Then** validation passes

---

### User Story 5 - Global Validation Rule Updates (Priority: P3)

When backend changes password requirements (e.g., adding complexity rules like minimum uppercase letters), developers update validation rules in a single file (`src/utils/validation.ts`). All screens automatically reflect the new rules without requiring updates to individual components.

**Why this priority**: P3 because this is an operational/maintenance benefit rather than user-facing feature. However, it delivers significant value in maintainability and reduces risk of inconsistent updates.

**Independent Test**: Can be fully tested by modifying password validator in `src/utils/validation.ts`, rebuilding application, and verifying all auth screens enforce new rules without component-level changes.

**Acceptance Scenarios**:

1. **Given** password validator in `src/utils/validation.ts` requires minimum 8 chars, **When** signup form validates password, **Then** 7-char password is rejected
2. **Given** developer adds complexity rule to password validator (e.g., "must contain uppercase"), **When** single code change is made in `src/utils/validation.ts`, **Then** all auth forms enforce new rule
3. **Given** new rule added to password validator, **When** signup, login, and password reset forms validate input, **Then** all forms enforce identical new rule
4. **Given** validator function is updated, **When** no component code is modified, **Then** all screens automatically reflect rule changes

---

### Edge Cases

- What happens when user enters email with leading/trailing whitespace (e.g., " user@example.com ")?
- How does system handle usernames with consecutive underscores (e.g., "john__doe")?
- What happens when user enters password with only spaces (e.g., "        ") - should it be valid for 8+ char requirement?
- How does system validate dates at timezone boundaries (midnight UTC vs local timezone)?
- What happens if user's device clock is wrong and calculated age is incorrect?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide pure validation function for email that accepts international domains and common email formats
- **FR-002**: System MUST provide pure validation function for username requiring 3-20 characters, lowercase letters/numbers/underscores only, no spaces
- **FR-003**: System MUST provide pure validation function for password requiring minimum 8 characters
- **FR-004**: System MUST provide pure validation function for birthday date requiring valid ISO date format (yyyy-MM-dd) and user age of 13 years or older
- **FR-005**: System MUST provide pure validation function for date in ISO format (yyyy-MM-dd)
- **FR-006**: All validators MUST return tuple format: [isValid: boolean, errorMessage: string | null]
- **FR-007**: System MUST store all validator functions in single file at `src/utils/validation.ts`
- **FR-008**: All validators MUST be pure functions with no side effects (no state mutations, no external API calls)
- **FR-009**: All validators MUST include JSDoc documentation with examples for each function
- **FR-010**: System MUST eliminate validation logic from all UI components (signup, login, profile edit forms) and delegate 100% to validators
- **FR-011**: All validators MUST execute validation checks within 100ms
- **FR-012**: System MUST ensure error messages returned by validators match error messages displayed in UI forms
- **FR-013**: System MUST allow adding new validation rules by modifying only the `src/utils/validation.ts` file

### Key Entities

- **Validation Rule**: A pure function that accepts input and returns [isValid, errorMessage] tuple. Represents a single validation concern (e.g., email format, username length)
- **Email Address**: Text input representing user email. Validated for format, internationalization support, and common email providers
- **Username**: Text input representing user identifier. Validated for length (3-20 chars), character set (lowercase/numbers/underscores), and format constraints
- **Password**: Text input representing user secret. Validated for minimum length (8 chars) and extensible for future complexity rules
- **Birthday**: Date input representing user age. Validated for ISO format (yyyy-MM-dd) and minimum age requirement (13 years)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Zero validation logic exists in UI components - 100% of validation delegated to `src/utils/validation.ts`
- **SC-002**: All 5 validators (email, username, password, birthday date, generic date) have unit test coverage of 100% (all code paths, all edge cases tested)
- **SC-003**: Validation rules are consistent across all auth screens (signup, login, profile edit) - identical inputs produce identical results
- **SC-004**: Invalid data is rejected within 100ms response time (pure functions execute instantly without network calls)
- **SC-005**: Error messages displayed in UI match exact error messages returned by validators (no transformation or rewording)
- **SC-006**: Adding new validation rule requires code changes in only 1 file (`src/utils/validation.ts`) - no component changes needed
- **SC-007**: All validator functions are documented with JSDoc including purpose, parameters, return format, and usage examples

## Assumptions

- Email validation should follow RFC 5322 standards while supporting international domain names (IDN/punycode)
- Username format constraints (3-20 chars, lowercase/numbers/underscores) are extensible and can be modified without architecture changes
- Password complexity requirements will evolve over time; 8-character minimum is initial baseline and can be extended with additional rules (uppercase, special chars, etc.)
- Birthday validation assumes server-side age verification is not available; client-side validation provides UX feedback only and is not security boundary
- All dates are treated as UTC for consistency across timezones
- Validation functions are synchronous and do not perform async operations (email verification via backend is separate concern)
- The feature assumes React Native component library is already in place for form inputs
- Existing form components can be refactored to use centralized validators without breaking changes
- Browser/native platform APIs for date parsing are available and reliable
- International domain support includes both ASCII and Unicode representations of domains
