import { useCallback, useEffect, useRef, useState } from 'react';
import { findNodeHandle, NativeModules, UIManager } from 'react-native';
import { cameraDirectionToChannel } from '../utils/camera-direction';
import { formatDisplayTime, parseLocalDateTimeToUnix } from '../utils/date';
import type { RecordRange } from '../types/RecordRange';

const { HikAuth, HikGetFile } = NativeModules;

export enum PlayerStatus {
	PLAYING,
	PAUSED,
	STOPPED,
}

interface UseVideoPlayerArgs {
	cameraDirection: any;
	onVideosLoaded: (videos: RecordRange[]) => void;
	onActiveVideoChange: (name: string) => void;
}

export function useVideoPlayer({ cameraDirection, onVideosLoaded, onActiveVideoChange }: UseVideoPlayerArgs) {
	const [logId, setLogId] = useState<number>(0);
	const [status, setStatus] = useState<PlayerStatus>(PlayerStatus.STOPPED);
	const [currentPosition, setCurrentPosition] = useState<number>(0);
	const [startTime, setStartTime] = useState<number>(0);
	const [endTime, setEndTime] = useState<number>(0);

	const videoPlayerRef = useRef(null);

	const channel = cameraDirectionToChannel(cameraDirection);

	const sendCommand = useCallback((command: string, args: any[] = []) => {
		const handle = findNodeHandle(videoPlayerRef.current);
		if (handle == null) {
			console.warn(`[VideoPlayer] Команда "${command}" не отправлена: нет handle нативного компонента`);
			return;
		}
		UIManager.dispatchViewManagerCommand(handle, command, args);
	}, []);

	const login = useCallback(async () => {
		try {
			const data = await HikAuth.login();
            console.log(data)
			if (typeof data === 'number') {
				setLogId(data);
			} else {
				console.warn('[VideoPlayer] Авторизация Hik вернула неуспех:', data);
			}
		} catch (e: any) {
			console.error('[VideoPlayer] Ошибка авторизации:', e?.message ?? e);
		}
	}, []);

	const loadFiles = useCallback(
		async (startTimeStr: string, endTimeStr: string) => {
			try {
				const files = await HikGetFile.getFiles(channel, startTimeStr, endTimeStr);
				onVideosLoaded(files ?? []);
			} catch (e) {
				console.error('[VideoPlayer] Ошибка поиска файлов:', e);
				onVideosLoaded([]);
			}
		},
		[channel, onVideosLoaded]
	);

	const loadRange = useCallback(
		(dateStr: string, timeFromStr: string, timeToStr: string) => {
			const startTimeStr = `${dateStr}T${timeFromStr}:00`;
			const endTimeStr = `${dateStr}T${timeToStr}:00`;

			const startTs = parseLocalDateTimeToUnix(startTimeStr);
			const endTs = parseLocalDateTimeToUnix(endTimeStr);

			setStartTime(startTs);
			setEndTime(endTs);
			setCurrentPosition(startTs);

			loadFiles(formatDisplayTime(startTs), formatDisplayTime(endTs));
		},
		[loadFiles]
	);

	const play = useCallback(() => {
		sendCommand('play');
		setStatus(PlayerStatus.PLAYING);
	}, [sendCommand]);

	const pause = useCallback(() => {
		sendCommand('pause');
		setStatus(PlayerStatus.PAUSED);
	}, [sendCommand]);

	const resume = useCallback(() => {
		sendCommand('continue');
		setStatus(PlayerStatus.PLAYING);
	}, [sendCommand]);

	const stop = useCallback(() => {
		sendCommand('stop');
		setStatus(PlayerStatus.STOPPED);
	}, [sendCommand]);

	const download = useCallback(() => {
		sendCommand('download');
	}, [sendCommand]);

	const onProgress = (event: any) => {
		const progress = +event?.nativeEvent?.currentProgress;
		console.log(progress)
		if (typeof progress === 'number') {
			setCurrentPosition(progress);
		}
	};

	const seekTo = useCallback(
		(time: number, newEndTime?: number) => {
			setCurrentPosition(time);
			const effectiveEnd = newEndTime ?? endTime;
			console.log(formatDisplayTime(time), formatDisplayTime(effectiveEnd))
			sendCommand('seekTo', [formatDisplayTime(time), formatDisplayTime(effectiveEnd)]);
		},
		[endTime, sendCommand]
	);

	const playRange = useCallback(
		(range: RecordRange) => {
			const rangeStartTs = parseLocalDateTimeToUnix(range.startTime);
			const rangeEndTs = parseLocalDateTimeToUnix(range.endTime);

			setStartTime(rangeStartTs);
			setEndTime(rangeEndTs);
			setCurrentPosition(rangeStartTs);
			setStatus(PlayerStatus.PLAYING);

			onActiveVideoChange(range.name);
			sendCommand('playVideo', [channel, formatDisplayTime(rangeStartTs), formatDisplayTime(rangeEndTs)]);
		},
		[channel, onActiveVideoChange, sendCommand]
	);

	useEffect(() => {
		login();
	}, [login]);

	return {
		videoPlayerRef,
		logId,
		status,
		currentPosition,
		startTime,
		endTime,
		play,
		pause,
		resume,
		stop,
		download,
		onProgress,
		seekTo,
		playRange,
		loadRange,
		setCurrentPosition
	};
}