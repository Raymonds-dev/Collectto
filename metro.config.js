const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Load environment variables if available via @expo/env
try {
  require('@expo/env').load(__dirname);
} catch {
  // @expo/env might already be loaded by Expo CLI
}

const config = getDefaultConfig(__dirname);

const TARGET_API_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.collectto.app';
const PROXY_PREFIX = '/api-proxy';

/**
 * Creates a lightweight dev-only reverse proxy middleware for Metro.
 * Routes local web browser requests to the real backend without CORS preflight blocks.
 */
const createDevProxyMiddleware = (targetUrl, prefix) => {
  const target = new URL(targetUrl);
  const isHttps = target.protocol === 'https:';
  const client = isHttps ? https : http;
  const defaultPort = isHttps ? 443 : 80;

  return (req, res, next) => {
    if (!req.url || !req.url.startsWith(prefix)) {
      return next();
    }

    // Handle CORS preflight options
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': req.headers.origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD',
        'Access-Control-Allow-Headers': req.headers['access-control-request-headers'] || '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      });
      res.end();
      return;
    }

    // Compute target path including query parameters
    const subPath = req.url.slice(prefix.length) || '/';
    const targetPath =
      target.pathname.replace(/\/$/, '') + (subPath.startsWith('/') ? subPath : '/' + subPath);

    const headers = { ...req.headers };
    headers.host = target.host;
    delete headers.origin;
    delete headers.referer;

    const proxyReq = client.request(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port || defaultPort,
        method: req.method,
        path: targetPath,
        headers,
      },
      (proxyRes) => {
        const responseHeaders = { ...proxyRes.headers };
        responseHeaders['access-control-allow-origin'] = req.headers.origin || '*';
        responseHeaders['access-control-allow-credentials'] = 'true';
        responseHeaders['access-control-allow-methods'] =
          'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD';
        responseHeaders['access-control-allow-headers'] = '*';

        res.writeHead(proxyRes.statusCode || 500, responseHeaders);
        proxyRes.pipe(res, { end: true });
      }
    );

    proxyReq.on('error', (err) => {
      console.error('[Metro Dev Proxy Error]:', err.message);
      if (!res.headersSent) {
        res.writeHead(502, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': req.headers.origin || '*',
        });
        res.end(JSON.stringify({ error: 'Proxy Gateway Error', message: err.message }));
      }
    });

    req.pipe(proxyReq, { end: true });
  };
};

const devProxyMiddleware = createDevProxyMiddleware(TARGET_API_URL, PROXY_PREFIX);

config.server = {
  ...config.server,
  enhanceMiddleware: (metroMiddleware, server) => {
    return (req, res, next) => {
      devProxyMiddleware(req, res, () => {
        return metroMiddleware(req, res, next);
      });
    };
  },
};

module.exports = withNativeWind(config, { input: './src/styles/global.css' });

