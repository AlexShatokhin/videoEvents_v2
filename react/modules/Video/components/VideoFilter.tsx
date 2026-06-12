import React, { memo, useEffect } from "react"
import { Stack } from "@react-native-material/core"
import { colors } from "../../../../constants/colors"
import { StyleSheet } from "react-native"
import { ApplyButton } from "../../../components/Filter/FilterElements/ApplyButton"
import FilterField from "../../../components/Filter/FilterElements/FilterField"
import { CustomCalendar } from "../../../components/Calendar/CustomCalendar";
import useToggle  from "../../../hooks/useToggle";
import CustomButton from "../../../UI/CustomButton"
import FilterTimePicker from "../../../modules/Archive/components/FilterComponents/FilterTimePicker"
import { useTypedDispatch, useTypedSelector } from "../../../hooks/useRedux"
import {setCurrentFilterValues, setDate, setTime, changeVideoFilterValue} from "../slice/videoSlice"
import { getCalendarDate } from "../../../modules/Archive/helpers/getCalendarDate"
import CameraDirectionPicker from "../../Archive/components/FilterComponents/CameraDirectionPicker"
import { convertCameraIdToCameraDirectionIcon, convertCameraIdToCameraDirectionString } from "../../../helpers/convertCameraDirectionToCameraID"

const VideoFilter = ({apply} : {apply: () => void}) => {
    const [calendarVisible, toggleCalendarVisibility] = useToggle()
    const [timeFromVisible, toggleTimeFromVisibility] = useToggle()
    const [timeToVisible, toggleTimeToVisibility] = useToggle()

    const { date, timeFrom, timeTo, cameraDirection } = useTypedSelector(state => state.videoReducer)
    const cameras = useTypedSelector(state => state.settingsReducer.cameras);
    const { isDisableFilterCameras } = useTypedSelector(state => state.settingsReducer);
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

    const getCamerasWithIcon = () => {
        return cameras.map(camera => ({
            ...camera,
            label: convertCameraIdToCameraDirectionIcon(+camera.value, cameras), 
            direction: convertCameraIdToCameraDirectionString(+camera.value, cameras)
        }))
    }

    const isHasAllValues = () => !!(date && timeFrom && timeTo && cameraDirection)

    return (
        <Stack direction="column">
            <Stack direction="row" style={styles.buttonsRow}>
                <ApplyButton
                    onPress={apply}
                    disabled={!isHasAllValues()}
                />
            </Stack>
            <Stack direction="row" style={styles.fieldsWrapper}>
                <Stack direction="column" style={styles.eventColumn}>
                    <FilterField title="Дата и время">
                        <Stack direction="row" spacing={10}>
                            <CustomButton 
                                buttonStyle={styles.dateButtonFrom} 
                                label={date} 
                                onPress={toggleCalendarVisibility} />
                            <CustomButton 
                                buttonStyle={styles.timeButtonFrom} 
                                textStyle={styles.timeButtonText} 
                                label={timeFrom} 
                                onPress={toggleTimeFromVisibility} />
                            <CustomButton 
                                buttonStyle={styles.timeButtonTo} 
                                textStyle={styles.timeButtonText} 
                                label={timeTo} 
                                onPress={toggleTimeToVisibility} />
                        </Stack>
                        <CustomCalendar
                            label="Выбрать дату"
                            onChoose={handleDate}
                            dateFrom={date}
                            dateTo={date}
                            visible={calendarVisible}
                            changeVisibility={toggleCalendarVisibility}
                        />
                        {timeFromVisible && <FilterTimePicker handlePickTime={(e) => handleTime(e, "timeFrom")} changeVisibility={toggleTimeFromVisibility}/>}
                        {timeToVisible && <FilterTimePicker handlePickTime={(e) => handleTime(e, "timeTo")} changeVisibility={toggleTimeToVisibility}/>}   
                    </FilterField>
                </Stack>

                <Stack direction="column" style={styles.dateColumn}>
                    <FilterField title="Камера">
                        <CameraDirectionPicker 
                            selected={[cameraDirection]}
                            events={getCamerasWithIcon()}
                            onSelect={(value) => dispatch(changeVideoFilterValue({key: "cameraDirection", value}))}
                            isFilterCamerasDisabled={isDisableFilterCameras}
                            isOptionDisabled={() => false}
                        />
                    </FilterField>
                </Stack>
            </Stack>
        </Stack>
    )
}

export default memo(VideoFilter);

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
})