import { afterEach, describe, expect, it, vi } from 'vitest';
import { saveObject, loadObject } from '../lib/LocalStorageUtils.js';

afterEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

describe('local storage', () => {
  it('round-trips a result and returns null for a missing key', () => {
    expect(loadObject('missing')).toBeNull();
    expect(saveObject('test', [{ wpm: 42 }])).toBe(true);
    expect(loadObject('test')).toEqual([{ wpm: 42 }]);
  });
  it('does not crash when browser storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('unavailable'); });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('unavailable'); });
    expect(saveObject('test', {})).toBe(false);
    expect(loadObject('test')).toBeNull();
  });
});
