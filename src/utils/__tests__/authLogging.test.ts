import { authLogger, authSanitizer } from '../authLogging';

describe('AuthLogger & Sanitizer', () => {
  beforeEach(() => {
    authLogger.clearLogs();
  });

  describe('Sanitizer - redactText', () => {
    it('should redact JWT tokens', () => {
      const jwt =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const text = `Received token: Bearer ${jwt}`;
      const redacted = authSanitizer.redactText(text);
      expect(redacted).not.toContain(jwt);
      expect(redacted).toBe('Received token: [REDACTED_JWT]');
    });

    it('should redact emails', () => {
      const email = 'user@example.com';
      const text = `User logged in with email: ${email}`;
      const redacted = authSanitizer.redactText(text);
      expect(redacted).not.toContain(email);
      expect(redacted).toBe('User logged in with email: [REDACTED_EMAIL]');
    });

    it('should redact base64 credentials', () => {
      const base64 = 'dXNlcm5hbWU6cGFzc3dvcmQ='; // username:password
      const text = `Basic ${base64}`;
      const redacted = authSanitizer.redactText(text);
      expect(redacted).not.toContain(base64);
      expect(redacted).toBe('[REDACTED_CREDENTIALS]');
    });
  });

  describe('Sanitizer - redactObject', () => {
    it('should redact sensitive keys recursively', () => {
      const payload = {
        password: 'super-secret-password',
        nested: {
          token: 'token-value',
          normalKey: 'normal-value',
        },
        array: [{ email: 'user@example.com' }, { clean: 'clean-value' }],
      };

      const redacted = authSanitizer.redactObject(payload) as any;

      expect(redacted.password).toBe('[REDACTED]');
      expect(redacted.nested.token).toBe('[REDACTED]');
      expect(redacted.nested.normalKey).toBe('normal-value');
      expect(redacted.array[0].email).toBe('[REDACTED]');
      expect(redacted.array[1].clean).toBe('clean-value');
    });

    it('should hash/anonymize user ID keys', () => {
      const payload = {
        userId: '12345',
        nested: {
          user_id: '98765',
        },
      };

      const redacted = authSanitizer.redactObject(payload) as any;

      expect(redacted.userId).toContain('hashed_');
      expect(redacted.userId).not.toBe('12345');
      expect(redacted.nested.user_id).toContain('hashed_');
      expect(redacted.nested.user_id).not.toBe('98765');
    });
  });

  describe('AuthLogger functionality', () => {
    it('should log operations as pending, then success/failure', async () => {
      const logId = authLogger.startOperation({
        module: 'TestModule',
        action: 'testAction',
      });

      let logs = authLogger.getLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].id).toBe(logId);
      expect(logs[0].status).toBe('pending');
      expect(logs[0].module).toBe('TestModule');
      expect(logs[0].action).toBe('testAction');
      expect(logs[0].severity).toBe('info');

      authLogger.completeOperation({
        id: logId,
        status: 'success',
      });

      logs = authLogger.getLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].status).toBe('success');
      expect(logs[0].duration).toBeDefined();
    });

    it('should log failures with redacted/sanitized error messages', () => {
      const logId = authLogger.startOperation({
        module: 'TestModule',
        action: 'testAction',
      });

      const error = new Error('Failure logging in for user@example.com with password secret');
      authLogger.completeOperation({
        id: logId,
        status: 'failed',
        errorType: 'unauthorized',
        error,
      });

      const logs = authLogger.getLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].status).toBe('failed');
      expect(logs[0].severity).toBe('error');
      expect(logs[0].errorType).toBe('unauthorized');
      expect(logs[0].sanitizedError).not.toContain('user@example.com');
      expect(logs[0].sanitizedError).not.toContain('secret');
      expect(logs[0].sanitizedError).toContain('[REDACTED_EMAIL]');
    });

    it('should respect FIFO buffer limits of exactly 100 entries', () => {
      for (let i = 0; i < 120; i++) {
        authLogger.startOperation({
          module: 'TestModule',
          action: `action_${i}`,
        });
      }

      const logs = authLogger.getLogs();
      expect(logs.length).toBe(100);
      expect(logs[0].action).toBe('action_20');
      expect(logs[99].action).toBe('action_119');
    });

    it('should flag slow operations >= 1000ms as warnings', async () => {
      // Mock date change
      const realDateNow = Date.now;
      let count = 0;
      Date.now = () => {
        if (count === 0) {
          count++;
          return 1000000;
        }
        return 1001500; // 1500ms duration
      };

      const logId = authLogger.startOperation({
        module: 'TestModule',
        action: 'slowAction',
      });

      authLogger.completeOperation({
        id: logId,
        status: 'success',
      });

      Date.now = realDateNow; // Restore

      const logs = authLogger.getLogs();
      expect(logs[0].duration).toBe(1500);
      expect(logs[0].severity).toBe('warn');
    });

    it('should track operations automatically using the track wrapper', async () => {
      const result = await authLogger.track(
        { module: 'TestModule', action: 'trackAction' },
        async () => {
          return 'resolved-value';
        }
      );

      expect(result).toBe('resolved-value');
      const logs = authLogger.getLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].action).toBe('trackAction');
      expect(logs[0].status).toBe('success');
    });
  });
});
