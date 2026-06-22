import { LayoutAnimation, Platform, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Slider from '@react-native-community/slider';
import Video, { OnProgressData, OnLoadData } from 'react-native-video';
import { colors } from '../../../constants/colors';
import { PlayerActionButton } from './components/PlayerActionButton';
import { formatTime } from './utils/date';
import { ScrollView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import VideoFilter from './components/VideoFilter';
import { useTypedDispatch, useTypedSelector } from '../../hooks/useRedux';
import { RecordRange } from './types/RecordRange';
import { RecordedRangeCard } from './components/RecordedRangeCard';
import { setActiveVideoName, setVideos } from './slice/videoSlice';

const URL = require("../../../assets/video_1.mp4")

export default function VideoScreen() {
	const { isFilterOpen, videos, activeVideoName } =
		useTypedSelector(state => state.videoReducer);
	const bottomSheetRef = useRef<BottomSheet>(null);
	const dispatch = useTypedDispatch()

	const videoRef = useRef<any>(null);

	const [isPlaying, setIsPlaying] = useState(false);
	const [duration, setDuration] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);
	const [isSeeking, setIsSeeking] = useState(false);
	const [seekValue, setSeekValue] = useState(0);

	const displayPosition = isSeeking ? seekValue : currentTime;
	const sliderValue = duration > 0 ? (displayPosition / duration) * 100 : 0;

	const displayedRanges = useMemo<RecordRange[]>(() => {
		return videos && videos.length > 0 ? (videos as RecordRange[]) : [];
	}, [videos]);

	useEffect(() => {
		if (isFilterOpen) {
			bottomSheetRef.current?.snapToIndex(0);
		} else {
			bottomSheetRef.current?.close();
		}
	}, [isFilterOpen]);

	const loadRange = () => {
		const testData = [
			{
				startTime: "22-06-2026T08:50:00",
				endTime: "22-06-2026T09:50:00",
				size: 202929,
				name: "ch_2020202"				
			},
			{
				startTime: "22-06-2026T08:50:00",
				endTime: "22-06-2026T08:55:00",
				size: 202929,
				name: "ch_212020202"
			},
			{
				startTime: "22-06-2026T08:50:00",
				endTime: "22-06-2026T10:20:00",
				size: 202929,
				name: "ch_202022202"
			},			
		]
		dispatch(setVideos(testData))
	}

	const handleApplyFilter = useCallback(() => {
		loadRange();
	}, [loadRange]);

	const handleRangeCardPress = useCallback((range: RecordRange) => {
		if (Platform.OS === 'android') {
			LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		}
		setIsPlaying(true)
		dispatch(setActiveVideoName(range.name))
	}, []);


	const handlePlayPause = useCallback(() => {
		setIsPlaying((prev) => !prev);
	}, []);

	const handleLoad = useCallback((data: OnLoadData) => {
		setDuration(data.duration);
	}, []);

	const handleProgress = useCallback((data: OnProgressData) => {
		if (!isSeeking) {
			setCurrentTime(data.currentTime);
		}
	}, [isSeeking]);

	const handleSliderDragging = useCallback((value: number) => {
		setIsSeeking(true);
		setSeekValue((value / 100) * duration);
	}, [duration]);

	const handleSliderComplete = useCallback((value: number) => {
		const time = (value / 100) * duration;
		videoRef.current?.seek(time);
		setCurrentTime(time);
		setIsSeeking(false);
	}, [duration]);

	const handleSheetChanges = useCallback((index: number) => {
		if (index === 0) {
			bottomSheetRef.current?.snapToIndex(0);
		}
	}, []);	

	const activeButton = isPlaying
		? <PlayerActionButton size={38} type="pause" onPress={handlePlayPause} />
		: <PlayerActionButton size={38} type="play" onPress={handlePlayPause} />;


	return (
		<View style={styles.container}>
			<View style={styles.playerColumn}>
				<Video
					ref={videoRef}
					source={{ uri: activeVideoName !== null ? URL : "" }}
					style={styles.videoView}
					paused={!isPlaying}
					onLoad={handleLoad}
					onProgress={handleProgress}
					progressUpdateInterval={250}
					resizeMode="contain"
				/>
				<View style={styles.controlsWrapper}>
					<View style={[styles.playerContainer, styles.sliderRow]}>
					{<Slider
							style={styles.slider}
							step={0.1}
							minimumValue={0}
							maximumValue={100}
							value={sliderValue}
							onValueChange={handleSliderDragging}
							onSlidingComplete={handleSliderComplete}
							minimumTrackTintColor={colors.lightblue}
							maximumTrackTintColor={colors.deepblue}
							thumbTintColor={colors.lightblue}
						/>}
					</View>

					<View style={styles.controlsRow}>
						<View style={[styles.playerContainer, styles.buttonsGroup]}>
							<View style={styles.buttonsRow}>
								{activeButton}
								{/* <PlayerActionButton type="download" onPress={download} /> */}
							</View>
						</View>
						<View style={styles.playerTimeContainer}>
							<Text style={styles.playerTimeText}>{formatTime(displayPosition)}</Text>
							<Text style={styles.playerTimeText}> / </Text>
							<Text style={styles.playerTimeText}>{formatTime(duration)}</Text>
						</View>
					</View>
				</View>
			</View>

			<View style={styles.listWrapper}>
				<View style={styles.rangeCardsContainer}>
					<Text style={styles.rangeCardsTitle}>ДОСТУПНЫЕ ЗАПИСИ</Text>
					<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
						{displayedRanges.map((range) => (
							<RecordedRangeCard
								key={range.name}
								range={range}
								isActive={activeVideoName === range.name}
								onPress={handleRangeCardPress}
							/>
						))}
					</ScrollView>
				</View>
			</View>

			<BottomSheet
				ref={bottomSheetRef}
				index={-1}
				snapPoints={["100%"]}
				onChange={handleSheetChanges}
			>
				<BottomSheetView style={styles.contentContainer}>
					<VideoFilter apply={handleApplyFilter} />
				</BottomSheetView>
			</BottomSheet>
		</View>
	);

}

const styles = StyleSheet.create({
	container: {
		position: "relative",
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
		height: "100%",
	},
	playerColumn: {
		width: "70%",
	},
	videoView: {
		width: "100%",
		height: 380,
	},
	controlsWrapper: {
		paddingHorizontal: 10,
	},
	sliderRow: {
		width: "100%",
		marginTop: 10,
	},
	slider: {
		flex: 1,
	},
	controlsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
		paddingHorizontal: 10,
	},
	buttonsGroup: {
		marginTop: 10,
		width: "40%",
	},
	buttonsRow: {
		flexDirection: "row",
		gap: 25,
		justifyContent: "center",
		alignItems: "center",
	},
	playerContainer: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
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
	scrollContent: {
		paddingHorizontal: 10,
		paddingBottom: 20,
		gap: 8,
	},	
	contentContainer: {
		flex: 1,
		padding: 36,
		alignItems: 'center',
		zIndex: 1000,
		elevation: 100,
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
	listWrapper: {
		width: "30%",
		height: "100%",
		backgroundColor: 'rgba(20, 20, 25, 0.4)',
		borderLeftWidth: 1,
		borderLeftColor: 'rgba(255, 255, 255, 0.1)',
		paddingTop: 10,
	},		
});