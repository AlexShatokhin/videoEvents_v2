import { findNodeHandle, NativeModules, requireNativeComponent, StyleSheet, Text, View, UIManager } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Slider from '@react-native-community/slider';
import { colors } from '../../../constants/colors';
import { PlayerActionButton } from './components/PlayerActionButton';
import { format, fromUnixTime } from 'date-fns';
import { useTypedSelector } from '../../hooks/useRedux';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { VideoFilter } from './components/VideoFilter';

const HikVideoView = requireNativeComponent("HikVideoView");
const { HikAuth, HikGetFile } = NativeModules;


enum Commands  {
    START,
    PAUSE,
    CONTINUE,
    STOP,
    SEEK_TO
}


const START_TIME = new Date("2026-04-07 08:50:00").getTime() / 1000; // 2026-04-07 08:50:00
const END_TIME = new Date("2026-04-07 09:00:00").getTime() / 1000;   // 2026-04-07 09:00:00

export default function Video() {
	const {isFilterOpen, date, timeFrom, timeTo} = useTypedSelector(state => state.videoReducer)
	const [logId, setLogId] = useState<number>(0);
	const [activePlayerStatus, setActivePlayerStatus] = useState<Commands>(Commands.STOP);
	const [currentPosition, setCurrentPosition] = useState<number>(START_TIME);
	const [isSliding, setIsSliding] = useState<boolean>(false);
	const [startTime, setStartTime] = useState<number>(START_TIME);
	const [endTime, setEndTime] = useState<number>(END_TIME);
	const videoPlayerRef = useRef(null)
	const bottomSheetRef = useRef<BottomSheet>(null);

	useEffect(() => {
		if(isFilterOpen)
			bottomSheetRef.current?.snapToIndex(0)
		else
			bottomSheetRef.current?.close()
	}, [isFilterOpen])

	const getNewVideo = () => {
		const startTime = `${date} ${timeFrom}:00`;
		const endTime = `${date} ${timeTo}:00`;

		setStartTime(new Date(startTime).getTime() / 1000);
		setEndTime(new Date(endTime).getTime() / 1000);
		setCurrentPosition(new Date(startTime).getTime() / 1000);

		sendCommand('getVideo', [startTime, endTime]);
		setActivePlayerStatus(Commands.START);
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


	const loadFiles = async () => {
		try {
			const files = await HikGetFile.getFiles(1); // канал №1
			console.log("Найдено файлов:", files.length);
			console.log("Первый файл:", files[0]);
		} catch (e) {
			console.error("Ошибка поиска:", e);
		}
	};

	useEffect(() => {
		if(process.env.NODE_ENV === "development"){
			handleLogin();
			loadFiles();
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
		return format(fromUnixTime(seconds), 'yyyy-MM-dd H:mm:ss');
	};

	const onVideoProgress = (event : any) => {
		const currentProgress = event.nativeEvent.currentProgress;
		
		console.log("Текущий прогресс:", currentProgress);
		setCurrentPosition(currentProgress);
	};

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
				onProgress = {() => {}} />
			<View>
				<View style={styles.playerContainer}>
					<View style={{width: "68%"}}>
						<Slider 
							style={{zIndex: 10}}
							step={1}
							minimumValue={startTime}
							maximumValue={endTime}
							value={currentPosition}
							onSlidingStart={() => setIsSliding(true)}
							onValueChange={(value) => setCurrentPosition(value)}
							onSlidingComplete={(value) => {
								setIsSliding(false);
								sendCommand('seekTo', [formatDisplayTime(value)]);
							}}
							minimumTrackTintColor={colors.lightblue}
							maximumTrackTintColor={colors.deepblue}
							thumbTintColor={colors.lightblue}

						/>
					</View>
					<View style={[styles.playerTimeContainer, {width: "30%"}]}>
						<Text style={styles.playerTimeText}>{formatTime(currentPosition)}</Text>
						<Text style={styles.playerTimeText}> / </Text>
						<Text style={styles.playerTimeText}>{formatTime(endTime)}</Text>
					</View>
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
    }
	
})