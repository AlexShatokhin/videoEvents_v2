import { requireNativeComponent, StyleSheet, Text, View, LayoutAnimation, Platform } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Slider from '@react-native-community/slider';
import { colors } from '../../../constants/colors';
import { PlayerActionButton } from './components/PlayerActionButton';
import { useTypedDispatch, useTypedSelector } from '../../hooks/useRedux';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import VideoFilter from './components/VideoFilter';
import { RecordedRangeCard } from './components/RecordedRangeCard';
import { setVideos, setActiveVideoName } from './slice/videoSlice';
import { ScrollView } from 'react-native-gesture-handler';
import { useVideoPlayer, PlayerStatus } from './hooks/useVideoPlayer';
import { formatDisplayTime, formatTime } from './utils/date';
import type { RecordRange } from './types/RecordRange';

const HikVideoView = requireNativeComponent("HikVideoView");

export default function Video() {
	const { isFilterOpen, date, timeFrom, timeTo, videos, activeVideoName, cameraDirection } =
		useTypedSelector(state => state.videoReducer);
	const dispatch = useTypedDispatch();

	const bottomSheetRef = useRef<BottomSheet>(null);
	const handleVideosLoaded = useCallback((files: RecordRange[]) => {
		dispatch(setVideos(files));
	}, [dispatch]);

	const handleActiveVideoChange = useCallback((name: string) => {
		dispatch(setActiveVideoName(name));
	}, [dispatch]);

	const {
		videoPlayerRef,
		logId,
		status,
		currentPosition,
		startTime,
		endTime,
		pause,
		resume,
		play,
		download,
		onProgress,
		seekTo,
		playRange,
		loadRange,
		setCurrentPosition
	} = useVideoPlayer({
		cameraDirection,
		onVideosLoaded: handleVideosLoaded,
		onActiveVideoChange: handleActiveVideoChange,
	});

	useEffect(() => {
		if (isFilterOpen) {
			bottomSheetRef.current?.snapToIndex(0);
		} else {
			bottomSheetRef.current?.close();
		}
	}, [isFilterOpen]);

	const handleApplyFilter = useCallback(() => {
		loadRange(date, timeFrom, timeTo);
	}, [date, timeFrom, timeTo, loadRange]);

	const handleRangeCardPress = useCallback((range: RecordRange) => {
		if (Platform.OS === 'android') {
			LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		}
		playRange(range);
	}, [playRange]);

	const handleSheetChanges = useCallback((index: number) => {
		if (index === 0) {
			bottomSheetRef.current?.snapToIndex(0);
		}
	}, []);

	const displayedRanges = useMemo<RecordRange[]>(() => {
		return videos && videos.length > 0 ? (videos as RecordRange[]) : [];
	}, [videos]);

	const displayPosition = currentPosition;

	const sliderValue = () => {
		const duration = endTime - startTime;
		return duration > 0 ? ((displayPosition - startTime) / duration) * 100 : 0;
	};

	const sliderValueToTime = useCallback((value: number) => {
		return startTime + (value / 100) * (endTime - startTime);
	}, [startTime, endTime]);

	const handleSliderDragging = useCallback((value: number) => {
		//setDraggingPosition(sliderValueToTime(value));
		setCurrentPosition(sliderValueToTime(value))
	}, [sliderValueToTime]);

	const handleSliderComplete = useCallback((value: number) => {
		seekTo(sliderValueToTime(value), endTime);
		setCurrentPosition(value)
	}, [sliderValueToTime, seekTo, endTime]);


	const activeButton = useMemo(() => {
		switch (status) {
			case PlayerStatus.PLAYING:
				return <PlayerActionButton size={38} type="pause" onPress={pause} />;
			case PlayerStatus.PAUSED:
				return <PlayerActionButton size={38} type="play" onPress={resume} />;
			case PlayerStatus.STOPPED:
				return <PlayerActionButton size={38} type="play" onPress={play} />;
			default:
				return <Text>Неизвестный статус проигрывания</Text>;
		}
	}, [status, pause, resume, play]);

	return (
		<View style={styles.container}>
			<View style={styles.playerColumn}>
				<HikVideoView
					ref={videoPlayerRef}
					style={styles.videoView}
					fileName={activeVideoName}
					logId={logId}
					onProgress={onProgress}
				/>
				<View style={styles.controlsWrapper}>
					<View style={[styles.playerContainer, styles.sliderRow]}>
					{<Slider
							style={[styles.slider, {opacity: isFilterOpen ? 0 : 1}]}
							step={0.1}
							minimumValue={0}
							maximumValue={100}
							value={sliderValue()}
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
								<PlayerActionButton type="download" onPress={download} />
							</View>
						</View>
						<View style={styles.playerTimeContainer}>
							<Text style={styles.playerTimeText}>{formatTime(displayPosition)}</Text>
							<Text style={styles.playerTimeText}> / </Text>
							<Text style={styles.playerTimeText}>{formatTime(endTime)}</Text>
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
	listWrapper: {
		width: "30%",
		height: "100%",
		backgroundColor: 'rgba(20, 20, 25, 0.4)',
		borderLeftWidth: 1,
		borderLeftColor: 'rgba(255, 255, 255, 0.1)',
		paddingTop: 10,
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
	scrollContent: {
		paddingHorizontal: 10,
		paddingBottom: 20,
		gap: 8,
	},
});