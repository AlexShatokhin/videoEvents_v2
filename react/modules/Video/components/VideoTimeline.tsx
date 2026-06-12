import React, { useMemo, useRef } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Text } from 'react-native';
import { format, fromUnixTime } from 'date-fns';
import { colors } from '../../../../constants/colors';

const PX_PER_SEC = 0.15; // 86400 сек * 0.15 = ~13000px. Оптимально для 24ч.
const TIMELINE_PADDING = 20; // Внутренние отступы в начале и конце

interface RecordRange {
    start: string;
    end: string;
}

interface VideoTimelineProps {
    startTime: number; // Unix timestamp в секундах
    endTime: number;   // Unix timestamp в секундах
    currentPosition: number; // Unix timestamp в секундах
    recordedRanges: RecordRange[];
    onSeek: (time: number) => void;
}

export const VideoTimeline: React.FC<VideoTimelineProps> = ({
    startTime,
    endTime,
    currentPosition,
    recordedRanges,
    onSeek,
}) => {
    const duration = endTime - startTime;
    const timelineWidth = duration * PX_PER_SEC + TIMELINE_PADDING * 2;

    const handlePress = (event: any) => {
        const touchX = event.nativeEvent.locationX;
        const relativeX = touchX - TIMELINE_PADDING;
        const seekTime = startTime + relativeX / PX_PER_SEC;
        
        // Ограничиваем выбор рамками суток
        onSeek(Math.max(startTime, Math.min(endTime, seekTime)));
    };

    const renderedRanges = useMemo(() => {
        return recordedRanges.map((range, index) => {
            // Заменяем пробел на T для корректного парсинга даты на Android
            const startTs = new Date(range.start.replace(' ', 'T')).getTime() / 1000;
            const endTs = new Date(range.end.replace(' ', 'T')).getTime() / 1000;

            const left = (startTs - startTime) * PX_PER_SEC + TIMELINE_PADDING;
            const width = (endTs - startTs) * PX_PER_SEC;

            // Не рисуем, если за пределами видимого диапазона
            if (left + width < 0 || left > timelineWidth) return null;

            return (
                <View
                    key={index}
                    style={[
                        styles.recordedSegment,
                        { left: Math.max(0, left), width: width }
                    ]}
                />
            );
        });
    }, [recordedRanges, startTime, endTime]); // Добавили endTime в зависимости

    const timeMarkers = useMemo(() => {
        const markers = [];
        const intervalMinutes = 30; // Больше меток: каждые 30 минут
        const intervalSeconds = intervalMinutes * 60;

        // Начинаем с ближайшего круглого значения после startTime
        let currentMarkerTime = Math.ceil(startTime / intervalSeconds) * intervalSeconds;

        while (currentMarkerTime < endTime) {
            const left = (currentMarkerTime - startTime) * PX_PER_SEC + TIMELINE_PADDING;
            const isHour = new Date(currentMarkerTime * 1000).getMinutes() === 0;

            if (left >= TIMELINE_PADDING && left <= timelineWidth - TIMELINE_PADDING) {
                markers.push(
                    <React.Fragment key={currentMarkerTime}>
                        <View style={[
                            styles.tick, 
                            { left: left, height: isHour ? 15 : 8, backgroundColor: isHour ? 'white' : 'rgba(255,255,255,0.3)' }
                        ]} />
                        <Text
                            style={[styles.timeMarker, { left: left - 20, opacity: isHour ? 1 : 0.6 }]}
                        >
                            {format(fromUnixTime(currentMarkerTime), 'HH:mm')}
                        </Text>
                    </React.Fragment>
                );
            }
            currentMarkerTime += intervalSeconds;
        }
        return markers;
    }, [startTime, endTime, timelineWidth]); // Добавили timelineWidth в зависимости

    const cursorPosition = (currentPosition - startTime) * PX_PER_SEC + TIMELINE_PADDING;

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ width: timelineWidth }}>
                <Pressable onPress={handlePress} style={[styles.track, { width: timelineWidth }]}>
                    {/* Фоновая полоса (пустое время) */}
                    <View style={[styles.backgroundTrack, { width: duration * PX_PER_SEC, left: TIMELINE_PADDING }]} />
                    
                    {/* Временные метки */}
                    {timeMarkers}

                    {/* Окрашенные сегменты записи */}
                    {renderedRanges}

                    {/* Курсор текущего времени */}
                    <View style={[styles.cursor, { left: cursorPosition }]} />
                </Pressable>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1, // Чтобы занимал всю доступную ширину в row-контейнере
        height: 50, // Сделали таймлайн тоньше
        backgroundColor: colors.deepblue,
        borderRadius: 8,
        overflow: 'hidden',
    },
    track: {
        height: '100%',
        position: 'relative',
    },
    backgroundTrack: {
        position: 'absolute',
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    recordedSegment: {
        position: 'absolute',
        height: '100%',
        backgroundColor: colors.orange, // Изменен цвет для лучшей видимости
        opacity: 0.8,
        zIndex: 1, // Убедимся, что сегменты отображаются поверх фоновой полосы
    },
    cursor: {
        position: 'absolute',
        width: 3,
        height: '100%',
        backgroundColor: colors.white,
        zIndex: 2, // Курсор должен быть поверх всего
    },
    tick: {
        position: 'absolute',
        top: 0, // Тики начинаются сверху
        width: 1,
        height: 8, // Уменьшили высоту тиков
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    timeMarker: {
        position: 'absolute',
        top: 30, // Располагаем метки под основной полосой и тиками
        color: colors.lightgrey,
        fontSize: 12,
        width: 40, // Ширина для текста, чтобы избежать наложения
        textAlign: 'center',
    },
});