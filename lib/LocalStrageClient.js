export function saveObject(key, obj) {
  localStrage.setItem(key, JSON.stringfy(obj));
}

export function loadObject(key) {
  return JSON.parse(localStrage.getItem(key));
}

