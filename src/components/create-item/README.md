# Item Creation Components

This directory contains components responsible for the item and collection creation flow in Collectto, structured into modular subdomains.

## Directory Structure

```text
src/components/create-item/
├── index.ts                      # Public API barrel export
├── CreateItemFlow.tsx            # Main flow orchestrator
├── CreateItemStepper.tsx         # Multi-step progress bar
│
├── photos/                       # 📸 Step 1: Media Capture & Permissions
│   ├── index.ts
│   ├── PhotoPicker.tsx
│   ├── PhotoGallery.tsx
│   ├── PhotoPreview.tsx
│   ├── PermissionGate.tsx
│   └── PermissionRequest.tsx
│
├── form/                         # 📝 Step 2: Item Metadata Form
│   ├── index.ts
│   ├── ItemMetadataForm.tsx
│   ├── ItemForm.tsx
│   ├── SaveButton.tsx
│   └── UncategorizedIndicator.tsx
│
├── collection/                   # 📁 Inline Collection Selection & Creation
│   ├── index.ts
│   ├── CollectionSelector.tsx
│   ├── CollectionListItem.tsx
│   ├── CollectionCreator.tsx
│   ├── CollectionCreationForm.tsx
│   ├── CollectionCoverPreview.tsx
│   └── CollectionCreationSuccess.tsx
│
├── preview/                      # 👁️ Step 3: Review Preview
│   ├── index.ts
│   └── CreateItemPreviewStep.tsx
│
└── feedback/                     # ✅ Save Progress & Success States
    ├── index.ts
    ├── ItemSaveFlow.tsx
    └── SuccessConfirmation.tsx
```

## Public API Usage

Screens and external features import components directly from `@/components/create-item`:

```tsx
import { CreateItemFlow } from '@/components/create-item';
```
