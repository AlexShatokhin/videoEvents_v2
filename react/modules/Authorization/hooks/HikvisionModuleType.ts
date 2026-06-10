declare module 'react-native' {
  interface NativeModulesStatic {
    HikVisionModule: HikVisionModuleInterface;
  }
}

export interface HikVisionModuleInterface {
  // Методы авторизации
  login(ip: string, port: number, username: string, password: string): Promise<LoginResult>;
  logout(): Promise<string>;
  
  // Статус и информация
  getConnectionStatus(): Promise<ConnectionStatus>;
  getCurrentUserID(): Promise<number>;
  isDeviceOnline(): Promise<boolean>;
  
  // Валидация
  validateNetworkInfo(ip: string, port: number, username: string, password: string): Promise<ValidationResult>;
  
  // Прямое воспроизведение (Live видео)
  startRealPlay(channelNumber: number): Promise<RealPlayResult>;
  stopRealPlay(): Promise<StopRealPlayResult>;
  
  // Поиск записей
  searchRecordFiles(channelNumber: number, startTime: string, endTime: string): Promise<SearchRecordResult>;
  
  // Воспроизведение записей
  startPlayback(channelNumber: number, startTime: string, endTime: string): Promise<PlaybackResult>;
  stopPlayback(playHandle: number): Promise<StopPlaybackResult>;
  pausePlayback(playHandle: number): Promise<PlaybackControlResult>;
  resumePlayback(playHandle: number): Promise<PlaybackControlResult>;
  setPlaybackSpeed(playHandle: number, speed: number): Promise<PlaybackSpeedResult>;
  getPlaybackPosition(playHandle: number): Promise<PlaybackPositionResult>;
  setPlaybackPosition(playHandle: number, position: number): Promise<PlaybackPositionSetResult>;
  
  // Управление сессиями
  getAllPlaybackSessions(): Promise<AllPlaybackSessionsResult>;
  stopAllPlayback(): Promise<StopAllPlaybackResult>;
  
  // Тестовое видео
  startTestVideo(): Promise<TestVideoResult>;
  stopTestVideo(): Promise<TestVideoResult>;
}

export interface LoginResult {
  userID: number;
  ip: string;
  port: number;
  username: string;
  deviceType: string;
  channelCount: number;
  diskCount: number;
  alarmInCount: number;
  alarmOutCount: number;
  serialNumber: string;
  firmwareVersion: string;
  firmwareBuildDate: string;
  hardwareVersion: string;
}

export interface ConnectionStatus {
  isLoggedIn: boolean;
  userID: number;
  isRealPlaying: boolean;
  isPlaybackActive: boolean;
  activePlaybackSessions: number;
  ip?: string;
  port?: string;
  username?: string;
  deviceType?: string;
  channelCount?: number;
  diskCount?: number;
  serialNumber?: string;
}

export interface ValidationResult {
  isValid: boolean;
  isValidIP: boolean;
  isValidPort: boolean;
  hasUsername: boolean;
  hasPassword: boolean;
}

// ========== ТИПЫ ДЛЯ ВИДЕО ОПЕРАЦИЙ ==========

// Прямое воспроизведение (Live видео)
export interface RealPlayResult {
  playHandle: number;
  channelNumber: number;
  streamType: string;
  status: string;
}

export interface StopRealPlayResult {
  stoppedHandle: number;
  status: string;
}

// Поиск записей
export interface RecordFileInfo {
  fileName: string;
  fileSize: number;
  startTime: string;
  endTime: string;
  fileType: number;
  isLocked: boolean;
}

// Alias для совместимости
export type RecordFile = RecordFileInfo;

export interface SearchRecordResult {
  channelNumber: number;
  startTime: string;
  endTime: string;
  totalFiles: number;
  files: RecordFileInfo[];
}

// Alias для совместимости
export type SearchResult = SearchRecordResult;

// Воспроизведение записей
export interface PlaybackResult {
  playHandle: number;
  channelNumber: number;
  startTime: string;
  endTime: string;
  status: string;
}

export interface StopPlaybackResult {
  playHandle: number;
  status: string;
  channelNumber?: number;
  startTime?: string;
  endTime?: string;
}

export interface PlaybackControlResult {
  playHandle: number;
  status: string;
}

export interface PlaybackSpeedResult {
  playHandle: number;
  speed: number;
  status: string;
}

export interface PlaybackPositionResult {
  playHandle: number;
  position: number;
  positionPercent: number;
}

export interface PlaybackPositionSetResult {
  playHandle: number;
  position: number;
  status: string;
}

// Управление сессиями
export interface PlaybackSessionInfo {
  playHandle: number;
  channelNumber: number;
  isPlaying: boolean;
  startTime: string;
  endTime: string;
}

// Alias для совместимости
export type PlaybackSession = PlaybackSessionInfo;

export interface AllPlaybackSessionsResult {
  sessions: PlaybackSessionInfo[];
  totalSessions: number;
  currentRealPlayHandle: number;
  currentPlaybackHandle: number;
}

export interface StopAllPlaybackResult {
  stoppedSessions: number;
  status: string;
}

// Тестовое видео
export interface TestVideoResult {
  status: string;
  message?: string;
}

// ========== ДОПОЛНИТЕЛЬНЫЕ ТИПЫ ==========

// Временной диапазон
export interface TimeRange {
  startTime: string;
  endTime: string;
}

// Состояние видео плеера
export interface VideoPlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  speed: number;
  position: number;
  currentTime: number;
  duration: number;
}

// Скорость воспроизведения
export type PlaybackSpeed = 1 | 2 | 4 | 8 | 16 | 0.5 | 0.25 | -2 | -4 | -8 | { value: number; label: string };

export interface DeviceInfo {
  deviceName: string;
  serialNumber: string;
  firmwareVersion: string;
  deviceType: string;
  channelCount: number;
  hdCount: number;
  supportAlarm: boolean;
  channels: Array<{
    channelId: number;
    channelName: string;
    enabled: boolean;
  }>;
}

export interface ChannelStatus {
  channelId: number;
  recording: boolean;
  online: boolean;
  bitRate: number;
  resolution: string;
  frameRate: number;
}

// События, которые может отправлять модуль
export interface HikVisionEvents {
  // События устройства
  onDeviceDisconnected: {
    userID: number;
    type: number;
    message: string;
  };
  onDeviceException: {
    userID: number;
    handle: number;
    type: number;
    message: string;
  };
  
  // События прямого воспроизведения
  onRealPlayStarted: RealPlayResult;
  onRealPlayStopped: StopRealPlayResult;
  
  // События воспроизведения записей
  onPlaybackStarted: PlaybackResult;
  onPlaybackStopped: StopPlaybackResult;
  onPlaybackPaused: PlaybackControlResult;
  onPlaybackResumed: PlaybackControlResult;
  onPlaybackSpeedChanged: PlaybackSpeedResult;
  onPlaybackPositionChanged: PlaybackPositionSetResult;
  onPlaybackException: {
    handle: number;
    type: number;
    message: string;
  };
  
  // События управления сессиями
  onAllPlaybackStopped: StopAllPlaybackResult;
}