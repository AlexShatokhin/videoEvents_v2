import { findNodeHandle, NativeModules, requireNativeComponent, StyleSheet, Text, View, UIManager, LayoutAnimation, Platform } from 'react-native'
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import Slider from '@react-native-community/slider';
import { colors } from '../../../constants/colors';
import { PlayerActionButton } from './components/PlayerActionButton';
import { format, fromUnixTime } from 'date-fns';
import { useTypedDispatch, useTypedSelector } from '../../hooks/useRedux';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import VideoFilter from './components/VideoFilter';
import { RecordedRangeCard } from './components/RecordedRangeCard';
import { setVideos, setActiveVideoName } from './slice/videoSlice';
import { ScrollView } from 'react-native-gesture-handler';
import {cameraDirection as cameraDirectionEnum} from "../../types/cameraDirectionEnum"

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
    startTime: string;
    endTime: string;
	size: number;
	name: string;
}


export default function Video() {
	const {isFilterOpen, date, timeFrom, timeTo, videos, activeVideoName, cameraDirection} = useTypedSelector(state => state.videoReducer)
	const [logId, setLogId] = useState<number>(0);
	const [activePlayerStatus, setActivePlayerStatus] = useState<Commands>(Commands.START);
	const [currentPosition, setCurrentPosition] = useState<number>(0); 
	const [startTime, setStartTime] = useState<number>(0); 
	const [endTime, setEndTime] = useState<number>(0);    
	const [showRangeCards, setShowRangeCards] = useState<boolean>(false); 
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

		setShowRangeCards(true); 
		loadFiles(startTimeStr.replace('T', ' '), endTimeStr.replace('T', ' '))
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


	const convertCameraDirectionToNum = () => {
		switch(cameraDirection){
			case cameraDirectionEnum.Top: return 34;
			case cameraDirectionEnum.Back: return 33;
			case cameraDirectionEnum.TopLeft: return 35;
			case cameraDirectionEnum.BackLeft: return 36;
			case cameraDirectionEnum.TopRight: return 37;
			case cameraDirectionEnum.BackRight: return 38;
			default: return 34;

		}
	}

	const loadFiles = async (startTime: string, endTime: string) => {
		try {
			const files = await HikGetFile.getFiles(convertCameraDirectionToNum(), startTime, endTime); // канал №1
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
		if (Platform.OS === 'android') {
			LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		}

		const rangeStartTs = new Date(range.startTime.replace(' ', 'T')).getTime() / 1000;
		const rangeEndTs = new Date(range.endTime.replace(' ', 'T')).getTime() / 1000;

		setStartTime(rangeStartTs);
		setEndTime(rangeEndTs);
		setCurrentPosition(rangeStartTs);
		
		dispatch(setActiveVideoName((range as any).name));
		sendCommand('playVideo', [convertCameraDirectionToNum(), formatDisplayTime(rangeStartTs), formatDisplayTime(rangeEndTs)]);
	};

	const displayedRanges = useMemo(() => {
		if (videos && videos.length > 0) {
			return videos as RecordRange[];
		}
		return []
	}, [videos]);

	// Определяем, находится ли плеер в режиме "фокуса" (когда уже выбрано видео)
	const isFocusMode = !!activeVideoName;

	const handleSheetChanges = useCallback((index: number) => {
		if(index === 0){
			bottomSheetRef.current?.snapToIndex(0)
		}
	}, []);

	return (
		<View style={styles.container}>
			<View style={{width: "70%"}}>
				<HikVideoView 
					ref={videoPlayerRef} 
					style={{width: "100%", height: 380}} 
					fileName = {activeVideoName} 
					logId = {logId}
					onProgress = {onVideoProgress} />
				<View style={{paddingHorizontal: 10}}>
					<View style={[styles.playerContainer, {width: "100%", marginTop: 10}]}>
						<Slider 
							style={{flex: 1}} 
							step={0.1}
							minimumValue={0}
							maximumValue={100}
							value={endTime - startTime > 0 ? ((currentPosition - startTime) / (endTime - startTime)) * 100 : 0}
							onValueChange={(value) => {
								// Рассчитываем время на основе процента для обновления текстовых меток
								const targetTime = startTime + (value / 100) * (endTime - startTime);
								setCurrentPosition(targetTime);
							}}
							onSlidingComplete={(value) => {
								const targetTime = startTime + (value / 100) * (endTime - startTime);
								handleTimelineSeek(targetTime); 
							}}
							minimumTrackTintColor={colors.lightblue}
							maximumTrackTintColor={colors.deepblue}
							thumbTintColor={colors.lightblue}
						/>
					</View>

					<View style={{display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", paddingHorizontal: 10}}>
						<View style={[styles.playerContainer, {marginTop: 10, width: "40%"}]}>
							<View style={{display: "flex", flexDirection: "row", gap: 25, justifyContent: "center", alignItems: "center"}}>
								{renderActiveButton()} 
								<PlayerActionButton type="download" onPress={() => sendCommand('download')}/>                                       
							</View>                               
						</View>
						<View style={[styles.playerTimeContainer, {marginTop: 0}]}>
							<Text style={styles.playerTimeText}>{formatTime(currentPosition)}</Text>
							<Text style={styles.playerTimeText}> / </Text>
							<Text style={styles.playerTimeText}>{formatTime(endTime)}</Text>
						</View>						
					</View>

				</View>
			</View>
			<View style={[styles.listWrapper]}>
				{showRangeCards && displayedRanges.length > 0 && (
					<View style={styles.rangeCardsContainer}>
						<Text style={styles.rangeCardsTitle}>
							ДОСТУПНЫЕ ЗАПИСИ
						</Text>
						<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>								
							{displayedRanges.map((range, index) => (
								<RecordedRangeCard 
									key={index} 
									range={range} 
									isActive={activeVideoName === (range as any).name}
									onPress={handleRangeCardPress} 
								/>
							))}
						</ScrollView>
					</View>
				)}
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
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
		height: "100%",
		flexDirection: "row"
	},
	playerContainer: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
	},
	listWrapper: {
		width: "30%",
		height: "100%",
		backgroundColor: 'rgba(20, 20, 25, 0.4)',
		borderLeftWidth: 1,
		borderLeftColor: 'rgba(255, 255, 255, 0.1)',
		paddingTop: 10,
	},
	listWrapperActive: {
		backgroundColor: 'rgba(10, 10, 15, 0.95)',
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
        flex: 1,
    },
    rangeCardsTitle: {
        color: colors.lightblue,
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1.2,
        marginLeft: 15,
        marginBottom: 15,
        opacity: 0.9,
    },
	scrollContent: {
		paddingHorizontal: 10,
		paddingBottom: 20,
		gap: 8
	},
	
})