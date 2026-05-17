# Research: API-Aligned Creation Flow

## Findings

### DatePicker Refactoring
The current `DatePicker` implementation in `src/app/(auth)/user_create.tsx` relies on `react-native-calendars` and `CustomPicker`. It uses a Modal to display a calendar and pickers for month/year selection.
- **Decision**: Create `src/components/ui/DatePicker.tsx` as a standalone component that encapsulates the Modal, Calendar, and Month/Year pickers.
- **Rationale**: Reusability and consistency across the app.
- **Alternatives**: Using `expo-date-picker` was considered but rejected to maintain visual consistency with the existing design and avoid new dependencies.

### Tag Input Design
- **Decision**: Implement a chip-based input where tags are added on "Enter" or comma.
- **Rationale**: Mobile-friendly and intuitive for multi-value entry.
- **Dependencies**: Uses `View`, `TextInput`, and `Pressable` from `react-native`.

### Dynamic Attributes
- **Decision**: Use a list of rows with two text inputs (Key and Value) and a delete icon.
- **Rationale**: Closest representation of the `Map<string, object>` structure required by the API.

## Data Model Updates
- **Item**: Updated to include `acquisitionDate`, `lastUsedDate`, `attributes`, and `tags`.
- **Collection**: Updated to include `visibility`, `tags`, and `coverImageUrl`.

## Contract Alignment
The interfaces in `src/types/` will be updated to match the `CreateItemRequest` and `CreateCollectionRequest` definitions from Swagger.
