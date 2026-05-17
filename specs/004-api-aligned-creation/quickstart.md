# Quickstart: API-Aligned Creation

## Components

### 1. DatePicker (`src/components/ui/DatePicker.tsx`)
Refactored from `user_create.tsx`. Use this for `acquisitionDate` and `lastUsedDate`.
```tsx
import { DatePicker } from '@/components/ui/DatePicker';

<DatePicker 
  label="Data de Aquisição" 
  value={acquisitionDate} 
  onChange={setAcquisitionDate} 
/>
```

### 2. TagInput (`src/components/ui/TagInput.tsx`)
Interactive chip-based tag input.
```tsx
import { TagInput } from '@/components/ui/TagInput';

<TagInput 
  tags={tags} 
  onTagsChange={setTags} 
/>
```

### 3. AttributeInput (`src/components/ui/AttributeInput.tsx`)
Dynamic key-value row management.
```tsx
import { AttributeInput } from '@/components/ui/AttributeInput';

<AttributeInput 
  attributes={attributes} 
  onChange={setAttributes} 
/>
```

## Data Integration

Update `CreateItemFlow.tsx` and `CollectionCreator.tsx` to handle the expanded state. Ensure `Debug Mode` mocks in `src/mocks/` are updated to persist these new fields.

## Validation Checklist
- [ ] `DatePicker` refactored and working in Registration.
- [ ] `ItemForm` includes all new API fields.
- [ ] `CollectionCreationForm` includes visibility and tags.
- [ ] Debug Mode persists all data correctly.
- [ ] UI is responsive and follows Visual First principles.
