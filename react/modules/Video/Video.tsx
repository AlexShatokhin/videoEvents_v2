import { findNodeHandle, NativeModules, requireNativeComponent, StyleSheet, Text, View, UIManager } from 'react-native'
import React, { useCallback, useEffect, useRef, useState, useMemo, ScrollView } from 'react'
import Slider from '@react-native-community/slider';
import { colors } from '../../../constants/colors';
import { PlayerActionButton } from './components/PlayerActionButton';
import { format, fromUnixTime } from 'date-fns';
import { useTypedDispatch, useTypedSelector } from '../../hooks/useRedux';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import VideoFilter from './components/VideoFilter';
import { RecordedRangeCard } from './components/RecordedRangeCard';
import { setVideos } from './slice/videoSlice';

const HikVideoView = requireNativeComponent("HikVideoView");
const { HikAuth, HikGetFile } = NativeModules;


enum Commands  {
    START,
    PAUSE,
    CONTINUE,
    STOP,
    SEEK_TO
}


export interface RecordRange { 
    start: string;
    end: string;
}


export default function Video() {
	const {isFilterOpen, date, timeFrom, timeTo, videos} = useTypedSelector(state => state.videoReducer)
	const [logId, setLogId] = useState<number>(0);
	const [activePlayerStatus, setActivePlayerStatus] = useState<Commands>(Commands.STOP);
	const [currentPosition, setCurrentPosition] = useState<number>(0); // Начальное значение 0
	const [isSliding, setIsSliding] = useState<boolean>(false);
	const [startTime, setStartTime] = useState<number>(0); // Начальное значение 0
	const [endTime, setEndTime] = useState<number>(0);     // Начальное значение 0
	const [showRangeCards, setShowRangeCards] = useState<boolean>(false); // Для отображения/скрытия карточек
	const videoPlayerRef = useRef(null)
	const bottomSheetRef = useRef<BottomSheet>(null);
	const dispatch = useTypedDispatch()

	useEffect(() => {
		if(isFilterOpen)
			bottomSheetRef.current?.snapToIndex(0)
		else
			bottomSheetRef.current?.close()
	}, [isFilterOpen])

	const getNewVideo = () => {
		// Используем 'T' для кроссплатформенного парсинга даты в JS
		const startTimeStr = `${date}T${timeFrom}:00`;
		const endTimeStr = `${date}T${timeTo}:00`;

		const startTs = new Date(startTimeStr).getTime() / 1000;
		const endTs = new Date(endTimeStr).getTime() / 1000;

		setStartTime(startTs);
		setEndTime(endTs);
		setCurrentPosition(startTs);

		setShowRangeCards(true); // Показываем карточки после применения фильтра
		// Нативной части отправляем формат с пробелом, как она ожидает
		loadFiles(startTimeStr.replace('T', ' '), endTimeStr.replace('T', ' '))
		//sendCommand('getVideo', [startTimeStr.replace('T', ' '), endTimeStr.replace('T', ' ')]);
		//setActivePlayerStatus(Commands.START);
	}

	const handlePlay = () => {
		sendCommand('play');
		setActivePlayerStatus(Commands.START);
	}

	const handlePause = () => {
		sendCommand('pause');
		setActivePlayerStatus(Commands.PAUSE);
	}

	const handleContinue = () => {
		sendCommand('continue');
		setActivePlayerStatus(Commands.CONTINUE);
	}

	const handleStop = () => {
		sendCommand('stop');
		setActivePlayerStatus(Commands.STOP);
	}

	const handleLogin = async () => {
		try {
			const data = await HikAuth.login();
			console.log(data)
			setLogId(data);
			if (data.success) {
			console.log("Авторизация прошла успешно!");
			// Теперь можно показывать HikVideoView
			}
		} catch (e : any) {
			console.error("Ошибка:", e.message); // Выведет код ошибки из SDK
		}
	}


	const loadFiles = async (startTime: string, endTime: string) => {
		try {
			const files = await HikGetFile.getFiles(1, startTime, endTime); // канал №1
			console.log("Найдено файлов:", files.length);
			console.log("Первый файл:", files[0]);
			dispatch(setVideos(files))
		} catch (e) {
			console.error("Ошибка поиска:", e);
		}
	};

	useEffect(() => {
		if(process.env.NODE_ENV === "development"){
			handleLogin();
			//loadFiles();
		}
	}, [])

	const sendCommand = (command: string, args : any[] = []) => {
		UIManager.dispatchViewManagerCommand(
			findNodeHandle(videoPlayerRef.current),
			command,
			args
		)
	}

	const renderActiveButton = () => {
		switch(activePlayerStatus){
			case Commands.START:
				return <PlayerActionButton size={38} type="pause" onPress={() => handlePause()}/>;
			case Commands.PAUSE:
				return <PlayerActionButton size={38} type="play" onPress={() => handleContinue()}/>;
			case Commands.CONTINUE:
				return <PlayerActionButton size={38} type="pause" onPress={() => handlePause()}/>;
			case Commands.STOP:
				return <PlayerActionButton size={38} type="play" onPress={() => handlePlay()}/>;
			default: return <Text>Неизвестный статус проигрывания</Text>
		}
	}

	const formatTime = (seconds : number) => {
		return format(fromUnixTime(seconds), 'HH:mm:ss');
	}

	const formatDisplayTime = (seconds : number) => {
		// Используем HH для ведущего нуля, чтобы Native SDK корректно парсил время
		return format(fromUnixTime(seconds), 'yyyy-MM-dd HH:mm:ss');
	};

	// Обновленная функция для перемотки, теперь принимает endTime
	const onVideoProgress = (event : any) => {
		const currentProgress = event.nativeEvent.currentProgress;
		setCurrentPosition(currentProgress);
	};

	const handleTimelineSeek = (time: number, newEndTime?: number) => {
		setCurrentPosition(time);
		sendCommand('seekTo', [formatDisplayTime(time), formatDisplayTime(newEndTime || endTime)]);
	};

	const handleRangeCardPress = (range: RecordRange) => {
		const rangeStartTs = new Date(range.start.replace(' ', 'T')).getTime() / 1000;
		const rangeEndTs = new Date(range.end.replace(' ', 'T')).getTime() / 1000;

		setStartTime(rangeStartTs);
		setEndTime(rangeEndTs);
		setCurrentPosition(rangeStartTs);
		setShowRangeCards(false); // Скрываем карточки после выбора

		// Отправляем команду на перемотку в плеер
		sendCommand('seekTo', [formatDisplayTime(rangeStartTs), formatDisplayTime(rangeEndTs)]);
	};

	// Используем actualVideos, если они есть, иначе TEST_RECORDED_RANGES для демонстрации
	const displayedRanges = useMemo(() => {
		// Убедимся, что videos содержит объекты с полями 'start' и 'end'
		if (videos && videos.length > 0 && videos[0].start && videos[0].end) {
			return videos as RecordRange[];
		}
		return []
	}, [videos]);

	const handleSheetChanges = useCallback((index: number) => {
		if(index === 0){
			bottomSheetRef.current?.snapToIndex(0)
		}
	}, []);

	return (
		<View style={styles.container}>
			<HikVideoView 
				ref={videoPlayerRef} 
				style={{width: '100%', height: 370}} 
				fileName = "ch01_00000200372000100" 
				logId = {logId}
				onProgress = {onVideoProgress} />
			<View style={{paddingHorizontal: 10}}>
				<View style={[styles.playerContainer, {width: "100%", marginTop: 10}]}>
					<Slider 
						style={{flex: 1}} // Slider занимает всю доступную ширину
						step={1}
						minimumValue={startTime}
						maximumValue={endTime}
						currentPosition={currentPosition}
						value={currentPosition}
						onSlidingStart={() => setIsSliding(true)}
						onValueChange={(value) => setCurrentPosition(value)}
						onSlidingComplete={(value) => {
							setIsSliding(false);
							handleTimelineSeek(value); // Передаем только время начала, endTime остается текущим
						}}
						minimumTrackTintColor={colors.lightblue}
						maximumTrackTintColor={colors.deepblue}
						thumbTintColor={colors.lightblue}
					/>
				</View>
				{showRangeCards && displayedRanges.length > 0 && (
					<View style={styles.rangeCardsContainer}>
						<Text style={styles.rangeCardsTitle}>Доступные записи:</Text>
						<View >
							{displayedRanges.map((range, index) => (
								<RecordedRangeCard key={index} range={range} onPress={handleRangeCardPress} />
							))}
						</View>
					</View>
				)}
				<View style={[styles.playerTimeContainer, {marginTop: 5}]}>
					<Text style={styles.playerTimeText}>{formatTime(currentPosition)}</Text>
					<Text style={styles.playerTimeText}> / </Text>
					<Text style={styles.playerTimeText}>{formatTime(endTime)}</Text>
				</View>
				<View style={[styles.playerContainer, {marginTop: 15}]}>
					<View style={{width: "33%", display: "flex", justifyContent: "flex-start", alignItems: "center"}} />
					<View style={{width: "33%", display: "flex", flexDirection: "row", gap: 15, justifyContent: "center", alignItems: "center"}}>
						<PlayerActionButton color={colors.lightgrey} type="fast-backward" onPress={() => {}}/>
						{renderActiveButton()} 
						<PlayerActionButton color={colors.lightgrey} type="fast-forward" onPress={() => {}}/>
					</View>
					<View style={{width: "33%", display: "flex", justifyContent: "flex-end", alignItems: "flex-end"}}>
						<PlayerActionButton type="download" onPress={() => sendCommand('download')}/>                                       
					</View>                                    
				</View>
			</View>

			<BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={["100%"]}
                onChange={handleSheetChanges}>
                <BottomSheetView style={styles.contentContainer}>
                    <VideoFilter apply={getNewVideo} />
                </BottomSheetView>
            </BottomSheet>
		</View>
	)
}


const styles = StyleSheet.create({
	container: {
		position: "relative",
	},
	playerContainer: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	playerTimeContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	playerTimeText: {
		color: colors.white,
		fontSize: 16,
	},
    contentContainer: {
        flex: 1,
        padding: 36,
        alignItems: 'center',
        zIndex: 1000,
        elevation: 100
    },
    rangeCardsContainer: {
        marginTop: 15,
        marginBottom: 5,
        paddingVertical: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.05)', // Легкое выделение фона
        borderRadius: 12,
    },
    rangeCardsTitle: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 10,
        marginBottom: 8,
        opacity: 0.8,
    },
	
})