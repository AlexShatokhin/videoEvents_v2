import { createMMKV } from 'react-native-mmkv'

const storage = createMMKV()
export const mmkvStorage = {
  setItem: (key: string, value: string) => {
    storage.set(key, value);
    console.log(`[MMKV storage] Данные по ключу ${key} установлены: ${value}`)
    return Promise.resolve(true);
  },
  getItem: (key: string) => {
    const value = storage.getString(key);
    console.log(`[MMKV storage] Данные по ключу ${key} получены: ${value}`)
    return Promise.resolve(value || null);
  },
  removeItem: (key: string) => {
    storage.remove(key);
    console.log(`[MMKV storage] Данные по ключу ${key} удалены`)
    return Promise.resolve(true);
  },
};