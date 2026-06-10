import React, { useMemo } from "react";
import { Modal, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import PressableArea from "../../UI/PressableArea";
import { Calendar } from "react-native-calendars";
import { colors } from "../../../constants/colors";

interface CustomCalendarProps {
    visible: boolean;
    changeVisibility: () => void;
    onChoose: (date: number) => void;
    label: string;
    dateFrom: string;
    dateTo: string;
}

export const CustomCalendar = ({ visible, changeVisibility, onChoose, label, dateFrom, dateTo }: CustomCalendarProps) => {
    
    const getDates = useMemo(() => {
        if (!dateFrom)
            return;
        const dates = [];
        let dateFromMilliseconds = new Date(dateFrom).getTime();
        const dateToMilliseconds = new Date(dateTo).getTime();
        while (dateFromMilliseconds < dateToMilliseconds) {
            dateFromMilliseconds += 24 * 60 * 60 * 1000;
            dates.push(new Date(dateFromMilliseconds).toISOString().split('T')[0]);
        }
        return dates;
    }, [dateFrom, dateTo]);
    

    // const disabledDates = useMemo(() => {
    //     let disabledDates: Record<string, any> = {};
    //     if (type === "To" && dateFrom) {
    //         disabledDates = generateDisabledDates(dateFrom)
    //     } else if (type === "From" && dateTo) {
    //         disabledDates = generateDisabledDates(dateTo)
    //     }
        
    //     return disabledDates;
    // }, [type, dateFrom, dateTo]);

    const selectedStyle = useMemo(() => ({
        selected: true,
        color: colors.deepblue,
        textColor: colors.white,
    }), [])
    
    return (
            <Modal visible={visible} animationType="fade" transparent>
                <TouchableWithoutFeedback onPress={changeVisibility}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)} style={styles.calendarContainer}>
                                <View style={styles.header}>
                                    <View style={styles.headerSpacer}></View> 
                                    <Text style={styles.headerTitle}>{label}</Text>
                                    <PressableArea onPress={changeVisibility} style={styles.closeButton}>
                                        <Text style={styles.closeButtonText}>ЗАКРЫТЬ</Text>                                
                                    </PressableArea> 
                                </View>                                
                                <Calendar
                                    firstDay={1}
                                    hideExtraDays
                                    enableSwipeMonths
                                    markingType={'period'}
                                    markedDates={{
                                        // ...disabledDates,
                                        [dateFrom || ""]: { selected: true, color: colors.lightblue, textColor: colors.white, startingDay: true, endingDay: dateFrom === dateTo },
                                        ...getDates?.reduce((acc, date) => ({
                                            ...acc,
                                            [date]: selectedStyle
                                        }), {}),
                                        [dateTo || ""]: { selected: true, color: colors.lightblue, textColor: colors.white, endingDay: true, startingDay: dateFrom === dateTo }
                                    }}
                                    theme={{
                                        backgroundColor: colors.white,
                                        calendarBackground: colors.white,
                                        textSectionTitleColor: colors.black,
                                        selectedDayBackgroundColor: colors.lightblue,
                                        todayTextColor: colors.lightblue,
                                        dayTextColor: colors.black,
                                        textDisabledColor: colors.lightgrey,
                                        monthTextColor: colors.black,
                                        arrowColor: colors.black,
                                    }}
                                    style={styles.calendar}
                                    onDayPress={(day: any) => {
                                        onChoose(day.timestamp);
                                    }} /> 
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    calendarContainer: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.lightblue,
        borderRadius: 10,
        overflow: "hidden",
        width: 450
    },
    header: {
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 10
    },
    headerSpacer: {
        backgroundColor: "transparent",
        width: 70
    },
    headerTitle: {
        fontWeight: "700",
        color: colors.black,
        textTransform: "uppercase",
        fontSize: 19
    },
    closeButton: {
        backgroundColor: "transparent",
        width: 90
    },
    closeButtonText: {
        color: colors.red,
        fontWeight: "500",
        textAlign: "center"
    },
    calendar: {
        width: "100%",
        zIndex: 1000
    }
});