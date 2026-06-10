import React, { useCallback, useEffect, useState } from "react";
import { Stack, Text } from "@react-native-material/core";
import { colors } from "../../../../../constants/colors";

import { LocaleConfig } from "react-native-calendars";

import { useTypedDispatch, useTypedSelector } from "../../../../hooks/useRedux";
import { changeFilterValue } from "./FilterSlice";
import { StyleSheet, View } from "react-native";
import useToggle from "../../../../hooks/useToggle";
import { getCalendarDate } from "../../helpers/getCalendarDate";
import DateChip from "./DateChip";
import FilterCalendar from "./FilterCalendar";
import FilterTimePicker from "./FilterTimePicker";
import CustomButton from "../../../../UI/CustomButton";
import { ScrollView } from "react-native-gesture-handler";
import LinearGradient from 'react-native-linear-gradient';
import { generateDateRange, generateTimeRange } from "../../helpers/dateHelper";
import { DateTimePickerEvent } from "@react-native-community/datetimepicker";


LocaleConfig.locales['ru'] = {
    monthNames: [
        'Январь',
        'Февраль',
        'Март',
        'Апрель',
        'Май',
        'Июнь',
        'Июль',
        'Август',
        'Сентябрь',
        'Октябрь',
        'Ноябрь',
        'Декабрь'
    ],
    monthNamesShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июль', 'Авг', 'Сент', 'Окт', 'Нояб', 'Дек'],
    dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    today: 'Сегодня'
};

LocaleConfig.defaultLocale = 'ru';

type ChipItemType = {
    label: string,
    value: string,
    callback: () => void
}


const DateTimePicker = () => {
    const {dateFrom, dateTo, timeFrom, timeTo, isOpen} = useTypedSelector(state => state.filterReducer)
    const [isShowCalendarFrom, toggleIsShowCalendarFrom] = useToggle(false);
    const [isShowCalendarTo, toggleIsShowCalendarTo] = useToggle(false);
    const [isShowTimePickerFrom, toggleIsShowTimePickerFrom] = useToggle(false);
    const [isShowTimePickerTo, toggleIsShowTimePickerTo] = useToggle(false);
    const [selectedChip, setSelectedChip] = useState("")
    const dispatch = useTypedDispatch();

    const setDateTimeRange = useCallback(({dateFrom, dateTo, timeFrom, timeTo} : {dateFrom:string, dateTo:string, timeFrom:string, timeTo:string}) => {
        dispatch(changeFilterValue({key: "dateFrom", value: dateFrom}))
        dispatch(changeFilterValue({key: "dateTo", value: dateTo}))

        dispatch(changeFilterValue({key: "timeFrom", value: timeFrom.toString()}))
        dispatch(changeFilterValue({key: "timeTo", value: timeTo.toString()}))
    }, [dispatch]);

    const handlePickTime = (event: DateTimePickerEvent, key: "From" | "To") => {
        dispatch(changeFilterValue({ key: `time${key}`, value: event.nativeEvent.timestamp.toString() }))
    }
    

    const chipValues : ChipItemType[] = [
    {
        label: "Последние 5 минут", 
        value: "5min",
        callback: () => {
            setDateTimeRange(
                generateTimeRange(0, 5)
            )
        }
    }, 
    {
        label: "Последние 10 минут", 
        value: "10min",
        callback: () => {
            setDateTimeRange(
                generateTimeRange(0, 10)
            )
        }
    },
    {
        label: "Последний час", 
        value:  "1h",
        callback: () => {
            setDateTimeRange(
                generateTimeRange(1, 0)
            )
        }
    }, 
    {
        label: "Сегодня", 
        value: "today",
        callback: () => {
            setDateTimeRange(
                 generateDateRange(0)
            )
        }        
    }, 
    {
        label: "Вчера", 
        value: "yesterday",
        callback: () => {
            setDateTimeRange(
                generateDateRange(1)
            )
        }          
    },
    {
        label: "3 дня назад", 
        value:  "3d",
        callback: () => {
            setDateTimeRange(
                generateDateRange(3)
            )        
        }          
    },

    {
        label: "7 дней назад", 
        value:  "7d",
        callback: () => {
            setDateTimeRange(
                generateDateRange(7)
            )       
        }          
    }
]

    useEffect(() => {
        setSelectedChip("")
    }, [isOpen])


    const handleChip = useCallback((chipItem : ChipItemType) => {
        setSelectedChip(chipItem.value);
        chipItem.callback()
    }, []);

    const handleResetChip = () => setSelectedChip("")

    return (
        <View>
           <View style={styles.chipScrollContainer}>
               <ScrollView 
                    bounces
                    overScrollMode="always"
                    showsHorizontalScrollIndicator = {false}
                    horizontal 
                    contentContainerStyle={styles.chipScrollContent}>
                    {
                        chipValues.map(item => (
                            <DateChip
                                onPress={() => handleChip(item)} 
                                label={item.label} 
                                key={item.label} 
                                value={item.value} 
                                selected={selectedChip === item.value}/>
                        ))
                    }
                </ScrollView>
                <LinearGradient
                    colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientLeft}
                />
                <LinearGradient
                    colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientRight}
                />
            </View>
            <Stack direction="row" style={styles.dateTimeRow}>
                <Stack direction="row" style={styles.dateTimeStack}>
                    <Text style={styles.dateTimeLabel}>с</Text>
                    <CustomButton 
                        onPress={toggleIsShowCalendarFrom} 
                        label={dateFrom}
                        buttonStyle={styles.dateButtonFrom}/>
                    <CustomButton 
                        onPress={toggleIsShowTimePickerFrom} 
                        label={timeFrom}
                        buttonStyle={styles.timeButtonFrom}
                        textStyle={styles.timeButtonText}/>
                </Stack>
                <Stack direction="row" style={styles.dateTimeStack}>
                    <Text style={styles.dateTimeLabel}>по</Text>
                    <CustomButton 
                        onPress={toggleIsShowCalendarTo} 
                        label={dateTo}
                        buttonStyle={styles.dateButtonTo}/>
                    <CustomButton 
                        onPress={toggleIsShowTimePickerTo} 
                        label={timeTo}
                        buttonStyle={styles.timeButtonTo}
                        textStyle={styles.timeButtonText}/>
                </Stack>
  


            </Stack>            
            <View style={styles.fullWidth}>

                <FilterCalendar 
                    visible={isShowCalendarFrom}
                    changeVisibility={toggleIsShowCalendarFrom}
                    type="From"
                    label='Диапазон "С"'
                    onReset={handleResetChip}/>

                <FilterCalendar 
                    visible={isShowCalendarTo}
                    changeVisibility={toggleIsShowCalendarTo}
                    type="To"
                    label='Диапазон "По"'
                    onReset={handleResetChip}/>

                {isShowTimePickerFrom && 
                <FilterTimePicker 
                    handlePickTime={(event) => handlePickTime(event, "From")}
                    changeVisibility={toggleIsShowTimePickerFrom}
                    onReset={handleResetChip}/>
                }

                {isShowTimePickerTo && 
                <FilterTimePicker 
                    handlePickTime={(event) => handlePickTime(event, "To")}
                    changeVisibility={toggleIsShowTimePickerTo}
                    onReset={handleResetChip}/>
                }             
            </View>

        </View>
   
    )
}

export default React.memo(DateTimePicker);

const styles = StyleSheet.create({
    chipScrollContainer: {
        position: 'relative'
    },
    chipScrollContent: {
        justifyContent: "flex-start",
        display: "flex",
        gap: 10,
        paddingBottom: 10,
        paddingHorizontal: 10,
        paddingRight: 40
    },
    gradientLeft: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 10,
        width: 30,
        pointerEvents: 'none'
    },
    gradientRight: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 10,
        width: 30,
        pointerEvents: 'none'
    },
    dateTimeRow: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        gap: 20,
        marginTop: 20
    },
    dateTimeStack: {
        alignItems: "center",
        display: "flex"
    },
    dateTimeLabel: {
        fontSize: 20,
        fontWeight: "600"
    },
    dateButtonFrom: {
        backgroundColor: colors.lightblue,
        borderColor: colors.lightblue,
        marginLeft: 10
    },
    dateButtonTo: {
        backgroundColor: colors.lightblue,
        borderColor: colors.lightblue,
        marginLeft: 10
    },
    timeButtonFrom: {
        backgroundColor: 'transparent',
        borderColor: colors.lightblue,
        marginLeft: 10
    },
    timeButtonTo: {
        backgroundColor: 'transparent',
        borderColor: colors.lightblue,
        marginLeft: 10
    },
    timeButtonText: {
        color: colors.lightblue
    },
    fullWidth: {
        width: "100%"
    }
});