import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { format, fromUnixTime } from 'date-fns';
import { colors } from '../../../../constants/colors';
import { RecordRange } from '../Video';


interface RecordedRangeCardProps {
    range: RecordRange;
    isActive: boolean;
    onPress: (range: RecordRange) => void;
}

export const RecordedRangeCard: React.FC<RecordedRangeCardProps> = ({ range, onPress, isActive }) => {
    const startTime = new Date(range.startTime.replace(' ', 'T')).getTime() / 1000;
    const endTime = new Date(range.endTime.replace(' ', 'T')).getTime() / 1000;

    const formattedStart = format(fromUnixTime(startTime), 'HH:mm:ss');
    const formattedEnd = format(fromUnixTime(endTime), 'HH:mm:ss');

    return (
        <Pressable style={[styles.card, isActive && styles.activeCard]} onPress={() => onPress(range)}>
            <Text style={[styles.timeText, isActive && styles.activeText]}>{formattedStart}</Text>
            <Text style={[styles.separatorText, isActive && styles.activeText]}>-</Text>
            <Text style={[styles.timeText, isActive && styles.activeText]}>{formattedEnd}</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.lightblue,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginHorizontal: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    activeCard: {
        backgroundColor: colors.white,
        borderColor: colors.lightblue,
        borderWidth: 2,
    },
    timeText: {
        color: colors.white,
        fontSize: 14,
    },
    separatorText: {
        color: colors.white,
        fontSize: 14,
        marginHorizontal: 5,
    },
    activeText: {
        color: colors.lightblue
    }
});