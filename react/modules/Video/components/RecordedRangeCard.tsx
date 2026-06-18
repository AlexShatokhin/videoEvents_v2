import React, { useRef } from 'react';
import { Animated, Pressable, Text, View, StyleSheet } from 'react-native';
import { format, fromUnixTime } from 'date-fns';
import { colors } from '../../../../constants/colors';
import { RecordRange } from '../Video';

interface RecordedRangeCardProps {
    range: RecordRange;
    isActive: boolean;
    onPress: (range: RecordRange) => void;
}

export const RecordedRangeCard: React.FC<RecordedRangeCardProps> = ({ range, onPress, isActive }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const startTime = new Date(range.startTime.replace(' ', 'T')).getTime() / 1000;
    const endTime = new Date(range.endTime.replace(' ', 'T')).getTime() / 1000;

    const formattedStart = format(fromUnixTime(startTime), 'HH:mm:ss');
    const formattedEnd = format(fromUnixTime(endTime), 'HH:mm:ss');

    const animateTo = (value: number) => {
        Animated.spring(scale, {
            toValue: value,
            useNativeDriver: true,
            speed: 30,
            bounciness: 4,
        }).start();
    };

    return (
        <Pressable
            onPress={() => onPress(range)}
            onPressIn={() => animateTo(0.96)}
            onPressOut={() => animateTo(1)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`Запись с ${formattedStart} до ${formattedEnd}`}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
            <Animated.View
                style={[
                    styles.card,
                    isActive ? styles.activeCard : styles.idleCard,
                    { transform: [{ scale }] },
                ]}
            >
                <View style={[styles.playIcon, isActive ? styles.playIconActive : styles.playIconIdle]} />

                <Text style={[styles.timeText, isActive ? styles.activeText : styles.idleText]}>
                    {formattedStart}
                </Text>
                <Text style={[styles.separator, isActive ? styles.activeSeparator : styles.idleSeparator]}>
                    –
                </Text>
                <Text style={[styles.timeText, isActive ? styles.activeText : styles.idleText]}>
                    {formattedEnd}
                </Text>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginHorizontal: 6,
    },
    idleCard: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.lightblue,
    },
    activeCard: {
        backgroundColor: colors.lightblue,
        shadowColor: colors.lightblue,
        shadowOpacity: 0.35,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    playIcon: {
        width: 0,
        height: 0,
        borderTopWidth: 5,
        borderBottomWidth: 5,
        borderLeftWidth: 8,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        marginRight: 8,
    },
    playIconIdle: {
        borderLeftColor: colors.lightblue,
    },
    playIconActive: {
        borderLeftColor: colors.white,
    },
    timeText: {
        fontSize: 15,
        fontWeight: '600',
        fontVariant: ['tabular-nums'],
        letterSpacing: 0.2,
    },
    separator: {
        fontSize: 14,
        marginHorizontal: 6,
    },
    idleText: {
        color: colors.lightblue,
    },
    activeText: {
        color: colors.white,
    },
    idleSeparator: {
        color: colors.lightblue,
        opacity: 0.5,
    },
    activeSeparator: {
        color: colors.white,
        opacity: 0.7,
    },
});