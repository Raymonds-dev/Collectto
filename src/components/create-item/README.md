# Item Creation Components

This directory contains components responsible for the item and collection creation flow in Collectto.

## Component Hierarchy

- **CreateItemFlow.tsx**: Main entry point and orchestrator for the creation process.
  - **PermissionGate.tsx**: Guards access behind camera and gallery permissions.
    - **PermissionRequest.tsx**: UI for requesting specific permissions.
  - **ItemMetadataForm.tsx**: Main form combining photos and item details.
    - **PhotoPicker.tsx**: Buttons to trigger camera/gallery selection.
    - **PhotoGallery.tsx**: Horizontal list of selected photos.
      - **PhotoPreview.tsx**: Single photo thumbnail with remove action.
    - **ItemForm.tsx**: Inputs for name and description.
    - **CollectionCreationForm.tsx**: Inline collection selector and creator.
      - **CollectionSelector.tsx**: List of existing collections.
        - **CollectionListItem.tsx**: Selectable collection item.
      - **CollectionCreator.tsx**: Inline form to create a new collection.
        - **CollectionCoverPreview.tsx**: Preview for new collection cover.
      - **CollectionCreationSuccess.tsx**: Success feedback for inline creation.
  - **ItemSaveFlow.tsx**: Orchestrates the final save operation (upload + persistence).
    - **SaveButton.tsx**: Triggers the save action with loading state.
    - **SuccessConfirmation.tsx**: Final success screen after item is saved.
    - **UncategorizedIndicator.tsx**: Badge for items saved without a collection.

## State Management

- **useItemCreation**: Custom hook managing the shared form state (photos, name, description, collection).
- **useItemSave**: Hook for item persistence logic.
- **useCollectionCreation**: Hook for collection creation logic.
- **usePhotoPermissions**: Hook for managing device permissions.

## Key Workflows

1. **Permission Check**: Handled by `PermissionGate` before showing the form.
2. **Photo Selection**: Supports multiple photo selection from gallery or single capture from camera.
3. **Inline Collection Creation**: Users can create a collection without leaving the item creation flow.
4. **Save Transaction**: Both collection (if new) and item are saved as a coordinated unit.
