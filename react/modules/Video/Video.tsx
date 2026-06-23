import { ActivityIndicator, LayoutAnimation, Platform, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
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
import { setActiveVideoName, setVideos, toggleFilterVisibility } from './slice/videoSlice';

const URL = require("../../../assets/video.mp4")

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
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isVideoLoading, setIsVideoLoading] = useState(false);
	const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

	useEffect(() => {
		return () => {
			if (hideControlsTimeoutRef.current) {
				clearTimeout(hideControlsTimeoutRef.current);
			}
		};
	}, []);

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
		dispatch(toggleFilterVisibility())
	}, [loadRange]);

	const handleRangeCardPress = useCallback((range: RecordRange) => {
		if (Platform.OS === 'android') {
			LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		}
		setIsVideoLoading(true);
		setIsPlaying(true)
		dispatch(setActiveVideoName(range.name))
	}, []);


	const setFullscreen = useCallback((value: boolean) => {
		if (Platform.OS === 'android') {
			LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		}
		setIsFullscreen(value);
	}, []);

	const handleToggleFullscreen = useCallback(() => {
		setFullscreen(!isFullscreen);
	}, [isFullscreen, setFullscreen]);


	const handlePlayPause = useCallback(() => {
		setIsPlaying((prev) => !prev);

	}, [isFullscreen]);

	const handleLoad = useCallback((data: OnLoadData) => {
		setDuration(data.duration);
		setIsVideoLoading(false);
	}, []);

	const handleVideoError = useCallback(() => {
		setIsVideoLoading(false);
	}, []);

	const handleProgress = useCallback((data: OnProgressData) => {
		if (!isSeeking) {
			setCurrentTime(data.currentTime);
		}
	}, [isSeeking]);

	const handleSliderDragging = useCallback((value: number) => {
		setIsSeeking(true);
		setSeekValue((value / 100) * duration);
		if (isFullscreen) {
			if (hideControlsTimeoutRef.current) {
				clearTimeout(hideControlsTimeoutRef.current);
			}
		}
	}, [duration, isFullscreen]);

	const handleSliderComplete = useCallback((value: number) => {
		const time = (value / 100) * duration;
		videoRef.current?.seek(time);
		setCurrentTime(time);
		setIsSeeking(false);

	}, [duration, isFullscreen]);

	const handleSheetChanges = useCallback((index: number) => {
		if (index === 0) {
			bottomSheetRef.current?.snapToIndex(0);
		}
	}, []);	

	const activeButton = isPlaying
		? <PlayerActionButton size={38} type="pause" onPress={handlePlayPause} />
		: <PlayerActionButton size={38} type="play" onPress={handlePlayPause} />;

	const fullscreenButton = (
		<PlayerActionButton
			size={28}
			type={isFullscreen ? 'fullscreen-exit' : 'fullscreen'}
			onPress={handleToggleFullscreen}
		/>
	);

	const controlsContent = (
		<>
			<View style={[styles.playerContainer, styles.sliderRow]}>
				{!isFilterOpen && <Slider
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
						<View style={styles.playerTimeContainer}>
							<Text style={styles.playerTimeText}>{formatTime(displayPosition)}</Text>
							<Text style={styles.playerTimeText}> / </Text>
							<Text style={styles.playerTimeText}>{formatTime(duration)}</Text>
						</View>						
					</View>
				</View>

				<View style={styles.fullscreenButtonContainer}>
					{fullscreenButton}
				</View>
			</View>
		</>
	);

	return (
		<View style={styles.container}>
			<View style={isFullscreen ? styles.fullscreenWrapper : styles.playerColumn}>
				<View style={isFullscreen ? styles.fullscreenVideoTouchArea : styles.playerVideoArea}>
					<Video
						ref={videoRef}
						source={activeVideoName !== null ? URL : "" }
						style={isFullscreen ? styles.videoViewFullscreen : styles.videoView}
						paused={!isPlaying}
						onLoad={handleLoad}
						onProgress={handleProgress}
						onError={handleVideoError}
						progressUpdateInterval={250}
						resizeMode="contain"
					/>
					{activeVideoName !== null && isVideoLoading && (
						<View style={styles.loadingOverlay}>
							<ActivityIndicator size="large" color={colors.lightblue} />
							<Text style={styles.loadingText}>Инициализация видео...</Text>
						</View>
					)}
				</View>
				<View style={isFullscreen ? styles.fullscreenControlsOverlay : styles.controlsWrapper}>
					{controlsContent}
				</View>
			</View>

			{!isFullscreen && (
				<View style={styles.listWrapper}>
					<Text style={styles.rangeCardsTitle}>ДОСТУПНЫЕ ЗАПИСИ</Text>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.scrollContent}
					>
						{displayedRanges.length === 0 ? 
						<Text>Записей пока нет...</Text>
						: displayedRanges.map((range) => (
							<RecordedRangeCard
								key={range.name}
								range={range}
								isActive={activeVideoName === range.name}
								onPress={handleRangeCardPress}
							/>
						))}
					</ScrollView>
				</View>
			)}

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
		flexDirection: "column",
		justifyContent: "flex-start",
		alignItems: "stretch",
		width: "100%",
		height: "100%",
	},
	playerColumn: {
		width: "100%",
		flex: 1,
		justifyContent: "center",
		position: "relative",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	playerVideoArea: {
		width: "100%",
		height: "80%",
		backgroundColor: colors.black,
		position: "relative",
	},
	videoView: {
		width: "100%",
		height: "100%",
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
		alignItems: "center",
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
	fullscreenButtonContainer: {
		justifyContent: 'center',
		alignItems: 'center',
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
		paddingVertical: 8,
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	contentContainer: {
		flex: 1,
		padding: 36,
		alignItems: 'center',
		zIndex: 1000,
		elevation: 100,
	},
	rangeCardsTitle: {
		color: colors.lightblue,
		fontSize: 10,
		fontWeight: '800',
		letterSpacing: 1,
		opacity: 0.9,
	},
	listWrapper: {
		width: "100%",
		height: 110,
		flexDirection: "column",
		backgroundColor: 'rgba(20, 20, 25, 0.5)',
		borderTopWidth: 1,
		borderTopColor: 'rgba(255, 255, 255, 0.1)',
		paddingTop: 6,
		paddingLeft: 12,
	},
	videoViewFullscreen: {
		width: "100%",
		height: "100%",
	},
	fullscreenWrapper: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		width: "100%",
		height: "100%",
		backgroundColor: '#000',
		zIndex: 999,
		elevation: 999,
	},
	fullscreenVideoTouchArea: {
		width: "100%",
		height: "100%",
		position: "relative",
	},
	fullscreenControlsOverlay: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		paddingTop: 16,
		paddingBottom: 12,
		paddingHorizontal: 10,
		backgroundColor: 'rgba(0, 0, 0, 0.55)',
	},
	loadingOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: 'rgba(0, 0, 0, 0.45)',
		gap: 10,
	},
	loadingText: {
		color: colors.white,
		fontSize: 14,
	},
});