import React, { useEffect } from "react"
import { Stack } from "@react-native-material/core"
import { colors } from "../../../../constants/colors"
import { StyleSheet, View } from "react-native"
import { ApplyButton } from "../../../components/Filter/FilterElements/ApplyButton"
import FilterField from "../../../components/Filter/FilterElements/FilterField"
import DateTimePicker from "../../../modules/Archive/components/FilterComponents/DateTimePicker"
import { CustomCalendar } from "../../../components/Calendar/CustomCalendar";
import useToggle  from "../../../hooks/useToggle";
import CustomButton from "../../../UI/CustomButton"
import FilterTimePicker from "../../../modules/Archive/components/FilterComponents/FilterTimePicker"
import { useTypedDispatch, useTypedSelector } from "../../../hooks/useRedux"
import {setCurrentFilterValues, setDate, setTime} from "../slice/videoSlice"
import { getCalendarDate } from "../../../modules/Archive/helpers/getCalendarDate"

export const VideoFilter = ({apply} : {apply: () => void}) => {
    const [calendarVisible, toggleCalendarVisibility] = useToggle()
    const [timeFromVisible, toggleTimeFromVisibility] = useToggle()
    const [timeToVisible, toggleTimeToVisibility] = useToggle()

    const { date, timeFrom, timeTo } = useTypedSelector(state => state.videoReducer)
    const dispatch = useTypedDispatch();

    useEffect(() => {
        dispatch(setCurrentFilterValues())
    }, [])

    const handleDate = (newDate : number) => {
        const value = getCalendarDate(newDate);
        console.log(value)

        dispatch(setDate(value))
    }

    const handleTime = (event: any, type: "timeFrom" | "timeTo") => {
        const selectedTime = event.nativeEvent.timestamp.toString();
        dispatch(setTime({ key: type, value: selectedTime }))
    }

    return (
        <Stack direction="column">
            <Stack direction="row" style={styles.buttonsRow}>
                <ApplyButton
                    onPress={apply}
                    disabled={false}
                />
            </Stack>
            <Stack direction="row" style={styles.fieldsWrapper}>
                <View style={styles.filterField}>
                    <FilterField title="Дата и время">
                        <CustomButton label={date} onPress={toggleCalendarVisibility} />
                        <CustomButton label={timeFrom} onPress={toggleTimeFromVisibility} />
                        <CustomButton label={timeTo} onPress={toggleTimeToVisibility} />
                        <CustomCalendar
                            label="Выбрать дату"
                            onChoose = {handleDate}
                            dateFrom={date}
                            dateTo={date}
                            visible={calendarVisible}
                            changeVisibility={toggleCalendarVisibility}
                        />
                        {timeFromVisible && 
                            <FilterTimePicker
                                handlePickTime={(event) => handleTime(event, "timeFrom")}
                                changeVisibility={toggleTimeFromVisibility}/>
                        }
        
                        {timeToVisible && 
                            <FilterTimePicker 
                                handlePickTime={(event) => handleTime(event, "timeTo")}
                                changeVisibility={toggleTimeToVisibility}/>
                        }   
                    </FilterField>
                </View>
                <View style={styles.filterField}>
                    <FilterField title="Камера">
                        <DateTimePicker />
                    </FilterField>
                </View>
            </Stack>
        </Stack>
    )
}

const styles = StyleSheet.create({
    main: {
        marginVertical: 10,
        marginHorizontal: "auto",
        justifyContent: "center",
        flexWrap: "wrap",
    },
    pickerLabel: {
        color: colors.lightgrey,
        fontSize: 22,
        marginLeft: 10,
        marginRight: 10
    },
    buttonsRow: {
        marginTop: -30,
        marginBottom: 10,
        display: "flex",
        justifyContent: "flex-end"
    },
    applyButton: {
        marginRight: 10
    },
    fieldsWrapper: {
        display: "flex", 
        justifyContent: "space-around", 
        alignItems:"center", 
        width: "100%"
    },
    filterField: {
        width: "45%"
    },
    eventColumn: {
        width: "40%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start"
    },
    dateColumn: {
        width: "55%",
        height: "100%"
    },
    plateInput: {
        backgroundColor: colors.white,
        color: colors.black,
        width: 200,
        textAlign: "center",
        height: 40,
        marginLeft: 25,
        borderRadius: 7,
        opacity: 1
    }
})