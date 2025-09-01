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