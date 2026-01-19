/**
 * Mock localStorage implementation for testing
 * Provides a clean, isolated storage instance for each test
 */
export class MockStorage {
  constructor() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }

  /**
   * Get all stored keys (helper for testing)
   */
  keys() {
    return Object.keys(this.store);
  }

  /**
   * Check if a key exists (helper for testing)
   */
  has(key) {
    return key in this.store;
  }

  /**
   * Get all stored data as object (helper for testing)
   */
  toObject() {
    return { ...this.store };
  }
}

/**
 * Create a fresh mock localStorage instance
 */
export function createMockStorage() {
  return new MockStorage();
}
