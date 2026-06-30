import { ActivityIndicator, LayoutAnimation, Platform, StyleSheet, Text, View } from 'react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const URL_FILE = require("../../../assets/video.mp4");

type Theme = "dark" | "light";

const getThemeColors = (theme: Theme) => ({
	background: theme === "dark" ? colors.black : colors.white,
	surface: theme === "dark" ? colors.black : colors.white,
	text: theme === "dark" ? colors.white : colors.black,
	textSecondary: theme === "dark" ? colors.white : colors.deepblue,
	accent: colors.lightblue,
	track: theme === "dark" ? colors.deepblue : colors.lightblue,
	border: theme === "dark" ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
	listBackground: theme === "dark" ? 'rgba(20, 20, 25, 0.5)' : 'rgba(230, 230, 235, 0.6)',
	loadingOverlay: theme === "dark" ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.55)',
	fullscreenControlsOverlay: theme === "dark" ? 'rgba(0, 0, 0, 0.55)' : 'rgba(255, 255, 255, 0.7)',
	fullscreenBackground: theme === "dark" ? '#000' : '#fff',
});

export default function VideoScreen() {
	const { isFilterOpen, videos, activeVideoName } =
		useTypedSelector(state => state.videoReducer);
	const theme = useTypedSelector(state => state.settingsReducer.theme) as Theme;
	const bottomSheetRef = useRef<BottomSheet>(null);
	const dispatch = useTypedDispatch();

	const videoRef = useRef<any>(null);
	const themeColors = useMemo(() => getThemeColors(theme), [theme]);
	const styles = useMemo(() => createStyles(themeColors), [themeColors]);

	const [isPlaying, setIsPlaying] = useState(false);
	const [duration, setDuration] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);
	const [isSeeking, setIsSeeking] = useState(false);
	const [seekValue, setSeekValue] = useState(0);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isVideoLoading, setIsVideoLoading] = useState(false);
	const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		let interval: ReturnType<typeof setInterval> | null = null;

		if (isPlaying && !isSeeking) {
			interval = setInterval(() => {
				setCurrentTime((prevTime) => {

					if (prevTime >= duration && duration > 0) {
						setIsPlaying(false);
						if (interval) clearInterval(interval);
						return duration;
					}

					return prevTime + 1;
				});
			}, 1000);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isPlaying, isSeeking, duration]);

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
		];
		dispatch(setVideos(testData));
	};

	const handleApplyFilter = useCallback(() => {
		loadRange();
		dispatch(toggleFilterVisibility());
	}, [dispatch]);

	const handleRangeCardPress = useCallback((range: RecordRange) => {
		if (Platform.OS === 'android') {
			LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		}
		setIsVideoLoading(true);
		setIsPlaying(true);
		setCurrentTime(0);
		dispatch(setActiveVideoName(range.name));
	}, [dispatch]);

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
	}, []);

	const handleLoad = useCallback((data: OnLoadData) => {
		setDuration(data.duration);
		setIsVideoLoading(false);
	}, []);

	const handleVideoError = useCallback(() => {
		setIsVideoLoading(false);
	}, []);

	const handleSliderDragging = useCallback((value: number) => {
		setIsSeeking(true);
		setSeekValue((value / 100) * duration);
		if (isFullscreen && hideControlsTimeoutRef.current) {
			clearTimeout(hideControlsTimeoutRef.current);
		}
	}, [duration, isFullscreen]);

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
		? <PlayerActionButton color={themeColors.text} size={38} type="pause" onPress={handlePlayPause} />
		: <PlayerActionButton color={themeColors.text} size={38} type="play" onPress={handlePlayPause} />;

	const fullscreenButton = (
		<PlayerActionButton
			color={themeColors.text}
			size={28}
			type={isFullscreen ? 'fullscreen-exit' : 'fullscreen'}
			onPress={handleToggleFullscreen}
		/>
	);

	const controlsContent = (
		<>
			<View style={[styles.playerContainer, styles.sliderRow]}>
				
				<Slider
					style={[styles.slider, isFilterOpen ? {opacity: 0, pointerEvents: "none"} : null]}
					step={0.1}
					minimumValue={0}
					maximumValue={100}
					value={sliderValue}
					onValueChange={handleSliderDragging}
					onSlidingComplete={handleSliderComplete}
					minimumTrackTintColor={themeColors.accent}
					maximumTrackTintColor={themeColors.track}
					thumbTintColor={themeColors.accent}
				/>
				
			</View>

			<View style={styles.controlsRow}>
				<View style={[styles.playerContainer, styles.buttonsGroup]}>
					<View style={styles.buttonsRow}>
						{activeButton}
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
					{activeVideoName !== null ? (
						<Video
							ref={videoRef}
							source={URL_FILE}
							style={isFullscreen ? styles.videoViewFullscreen : styles.videoView}
							paused={!isPlaying}
							onLoad={handleLoad}
							onError={handleVideoError}
							progressUpdateInterval={1000}
							resizeMode="contain"
						/>
					) : (
						<View style={[styles.videoView, { justifyContent: 'center', alignItems: 'center' }]}>
							<Text style={{ color: themeColors.text }}>Выберите запись для воспроизведения</Text>
						</View>
					)}
					{activeVideoName !== null && isVideoLoading && (
						<View style={styles.loadingOverlay}>
							<ActivityIndicator size="large" color={themeColors.accent} />
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
						{displayedRanges.length === 0 ? (
							<Text style={{ color: themeColors.text }}>Записей пока нет...</Text>
						) : (
							displayedRanges.map((range) => (
								<RecordedRangeCard
									key={range.name}
									range={range}
									isActive={activeVideoName === range.name}
									onPress={handleRangeCardPress}
								/>
							))
						)}
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

const createStyles = (themeColors: ReturnType<typeof getThemeColors>) => StyleSheet.create({
	container: {
		position: "relative",
		flexDirection: "column",
		justifyContent: "flex-start",
		alignItems: "stretch",
		width: "100%",
		height: "100%",
		backgroundColor: themeColors.background,
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
		color: themeColors.text,
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
		backgroundColor: themeColors.surface,
	},
	rangeCardsTitle: {
		color: themeColors.accent,
		fontSize: 10,
		fontWeight: '800',
		letterSpacing: 1,
		opacity: 0.9,
	},
	listWrapper: {
		width: "100%",
		height: 110,
		flexDirection: "column",
		backgroundColor: themeColors.listBackground,
		borderTopWidth: 1,
		borderTopColor: themeColors.border,
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
		backgroundColor: themeColors.fullscreenBackground,
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
		backgroundColor: themeColors.fullscreenControlsOverlay,
	},
	loadingOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: themeColors.loadingOverlay,
		gap: 10,
	},
	loadingText: {
		color: themeColors.text,
		fontSize: 14,
	},
});