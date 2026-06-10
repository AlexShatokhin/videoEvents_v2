import * as FileSystemLegacy from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';

// Тип для callback функции обновления прогресса
type ProgressCallback = (current: number, total: number) => void;

export const saveImageToDevice = async (imageUrl: string, showAlert: boolean = true) => {
  try {
    // 1. Проверяем разрешения
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      if (showAlert) {
        Alert.alert('Ошибка', 'Разрешите доступ к фото, чтобы сохранить изображение.');
      }
      throw new Error('Permission denied');
    }
    const base64 = imageUrl.replace(/^data:image\/\w+;base64,/, "");
    const fileUri = FileSystemLegacy.cacheDirectory + "image.jpg";

    await FileSystemLegacy.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystemLegacy.EncodingType.Base64,
    });

    // 4. Сохраняем в галерею
    const asset = await MediaLibrary.createAssetAsync(fileUri);
    await MediaLibrary.createAlbumAsync('Видеорегистратор', asset, false);

    if (showAlert) {
      Alert.alert('Готово', 'Изображение сохранено в галерею 📷');
    }
  } catch (error) {
    console.error('Ошибка при сохранении изображения:', error);
    if (showAlert) {
      Alert.alert('Ошибка', 'Не удалось сохранить изображение.');
    }
    throw error;
  }
};


export const downloadAllImages = async (
  urls: string[], 
  onProgress?: ProgressCallback
) => {
  try {
    // 1. Проверяем разрешения
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Разрешите доступ к фото, чтобы сохранить изображения.');
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const total = urls.length;

    // 2. Скачиваем все изображения
    for (let i = 0; i < urls.length; i++) {
      try {
        // Обновляем прогресс
        if (onProgress) {
          onProgress(i + 1, total);
        }

        await saveImageToDevice(urls[i], false);
        successCount++;
      } catch (error) {
        console.error('Ошибка при сохранении изображения:', error);
        errorCount++;
      }
    }

    // 3. Показываем результат
    if (errorCount === 0) {
      Alert.alert('Готово', `Все изображения (${successCount}) сохранены в галерею 📁`);
    } else {
      Alert.alert(
        'Частично выполнено',
        `Сохранено: ${successCount}\nОшибок: ${errorCount}`
      );
    }
  } catch (error) {
    console.error('Ошибка при массовом сохранении:', error);
    Alert.alert('Ошибка', 'Не удалось сохранить изображения.');
  }
};
