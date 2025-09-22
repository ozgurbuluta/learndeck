// Polyfill for setPrototypeOf which is needed by Supabase
if (typeof Object.setPrototypeOf === 'undefined') {
  Object.setPrototypeOf = function(obj, prototype) {
    obj.__proto__ = prototype;
    return obj;
  };
}

// Polyfill for structuredClone which is not available in React Native
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj: any) => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    // Handle Date
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    
    // Handle Array
    if (Array.isArray(obj)) {
      return obj.map((item) => global.structuredClone(item));
    }
    
    // Handle Object
    if (typeof obj === 'object') {
      const cloned: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = global.structuredClone(obj[key]);
        }
      }
      return cloned;
    }
    
    return obj;
  };
}

// Export empty object to make this a module
export {};

// Ensure react-native URL & crypto polyfills are loaded for libraries like supabase-js
// These imports are safe no-ops on platforms that already support them
try {
  // URL, URLSearchParams, fetch WHATWG URL behavior
  require('react-native-url-polyfill/auto');
} catch (_) {}

try {
  // window.crypto.getRandomValues for uuid/crypto usage
  require('react-native-get-random-values');
} catch (_) {}

// Ensure fetch/FormData/Headers/Request/Response are available and standards-compliant in RN
try {
  // cross-fetch provides fetch, Headers, Request, Response in JS envs
  if (typeof fetch === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const cf = require('cross-fetch');
    (global as any).fetch = cf.fetch || cf.default || fetch;
    (global as any).Headers = (global as any).Headers || cf.Headers;
    (global as any).Request = (global as any).Request || cf.Request;
    (global as any).Response = (global as any).Response || cf.Response;
  }
} catch (_) {}

try {
  // FormData polyfill used by many HTTP clients
  require('formdata-polyfill');
} catch (_) {}

// Add a simple fetch error logger (dev-only) to surface network errors early
try {
  if (process.env.NODE_ENV !== 'production' && typeof fetch === 'function') {
    const originalFetch = fetch;
    (global as any).fetch = (async (...args: any[]) => {
      try {
        return await (originalFetch as any)(...args);
      } catch (err) {
        try {
          // Avoid noisy logs by summarizing
          const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
          console.log('[fetch error]', url || 'unknown', err);
        } catch {}
        throw err;
      }
    }) as any;
  }
} catch (_) {}

// Ensure global fetch Blob.arrayBuffer exists in RN environments
try {
  if (typeof Blob !== 'undefined' && !(Blob.prototype as any).arrayBuffer) {
    (Blob.prototype as any).arrayBuffer = function () {
      return new Promise<ArrayBuffer>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result as ArrayBuffer);
        fr.onerror = reject;
        fr.readAsArrayBuffer(this as any);
      });
    };
  }
} catch (_) {
  // no-op
}