import Cookies from 'https://cdn.jsdelivr.net/npm/js-cookie@3.0.5/+esm'

const createStorage = (storageImpl) => ({
  set: (key, value) => {
    if (value === undefined) storageImpl.removeItem(key);
    else storageImpl.setItem(key, JSON.stringify(value));
  },
  get: (key) => {
    const value = storageImpl.getItem(key);
    if (value === null) return null;
    try { return JSON.parse(value); }
    catch { return value; }
  },
  remove: (key) => storageImpl.removeItem(key)
});

export default {
  local: createStorage(localStorage),
  session: createStorage(sessionStorage),
  cookie: Cookies
};
