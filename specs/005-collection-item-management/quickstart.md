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

6. Tests:
- Create unit tests for normalizers and debug-service adapters. Run:

```bash
npm run test
```
