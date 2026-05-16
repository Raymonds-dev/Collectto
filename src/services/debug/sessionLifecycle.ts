import { debugSession } from './debugSession';

export const startDebugSession = () => {
  debugSession.initialize();
  console.log('[DEBUG] Session initialized with seed data.');
};

export const clearDebugSession = () => {
  debugSession.clear();
  console.log('[DEBUG] Session cleared.');
};
