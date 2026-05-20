# Quickstart: Implementing Collection & Item Edit (Debug mode)

Steps to begin implementation and test locally in Debug mode:

1. Install dependencies

```bash
npm install
```

2. Start the app in Debug mode (project uses env/build flags). If you use the provided scripts:

```bash
npm run start
# or to run on device
npm run android
npm run ios
```

3. Ensure DEBUG mode is active in your environment so the `DebugProvider` is used.

4. Use the screens:

- `EditCollectionScreen` — full-screen editor for collections (to be created).
- `EditItemScreen` — reuse creation UI and pre-fill values.

5. To validate contract mapping locally:

- Use the helper `normalizeItemForUpdate()` to create an `UpdateItemRequest` object from the form state.
- Use `normalizeCollectionForUpdate()` to create an `UpdateCollectionRequest`.
- Use `DeleteItemRequest` and `DeleteCollectionRequest` contracts in service interfaces, even if API adapter is pending endpoint availability.
- Use `MoveItemCommand` in Debug adapter only.

6. Debug-first behavior to verify manually:

- Edit item and collection using update contracts.
- Delete item and collection in DEBUG mode.
- Move item (single and bulk) in DEBUG mode.
- Confirm fallback to `Sem categoria` fixed system collection.

7. API integration readiness checks (future):

- Update endpoints already mapped (`PATCH /items/update`, `PATCH /collections/update`).
- Delete endpoints required from backend before enabling API adapter delete.
- Move endpoint required from backend before enabling API adapter move.

8. Tests:

- Create unit tests for normalizers and debug-service adapters. Run:

```bash
npm run test
```
