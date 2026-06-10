import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  setItem: async (key: string, value: any) => {
    await SecureStore.setItemAsync(key.replace(/:/g, '_'), value);
    console.log(`[Secure storage] Данные по ключу ${key} установлены: ${value}`)
    return Promise.resolve(true);
  },
  getItem: async (key: string) => {
    const value = await SecureStore.getItemAsync(key.replace(/:/g, '_'));
    console.log(`[Secure storage] Данные по ключу ${key} получены: ${value}`)
    return Promise.resolve(value ? JSON.parse(value) : null);
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key.replace(/:/g, '_'));
    console.log(`[Secure storage] Данные по ключу ${key} удалены`)
    return Promise.resolve(true);
  },
};