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