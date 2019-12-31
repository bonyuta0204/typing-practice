export function saveObject(key, obj) {
  console.log(key);
  console.log(JSON.stringify(obj))
  localStorage.setItem(key, JSON.stringify(obj));
}

export function loadObject(key) {
  return JSON.parse(localStorage.getItem(key));
}

