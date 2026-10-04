export function saveObject(key, obj) {
  try {
    localStorage.setItem(key, JSON.stringify(obj));
    return true;
  } catch {
    // The game should still work when storage is unavailable or full.
    return false;
  }
}

export function loadObject(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}
