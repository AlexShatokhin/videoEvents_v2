import React, { memo, useCallback, useEffect, useMemo, useState } from "react"
import { Stack } from "@react-native-material/core" 
import { StyleSheet, View } from "react-native"
import { colors } from "../../../../constants/colors"
import DateTimePicker from "./FilterComponents/DateTimePicker"
import { useTypedDispatch, useTypedSelector } from "../../../hooks/useRedux"
import { changeFilterValue, toggleFitlerVisibility } from "./FilterComponents/FilterSlice"

import { eventsFetch, clearContent } from "../slice/archiveSlice"
import EventPickerSingle from "../../../components/EventPicker/EventPickerSingle"
import getEventTypesAsObject from "../../../helpers/getEventTypesAsObject"
import { eventsEnum } from "../../../types/eventsEnum"
import Input from "../../../UI/Input"
import FilterField from "../../../components/Filter/FilterElements/FilterField"
import CameraDirectionPicker from "./FilterComponents/CameraDirectionPicker"
import { convertCameraIdToCameraDirectionIcon, convertCameraIdToCameraDirectionString } from "../../../helpers/convertCameraDirectionToCameraID"
import { ApplyButton } from "../../../components/Filter/FilterElements/ApplyButton"
import { cameraDirection as cameraDirectionEnum } from "../../../types/cameraDirectionEnum"

const Filters = () => {
    const {
        dateFrom,
        dateTo,
        timeFrom,
        timeTo,
        eventType,
        plate,
        cameraDirection
    } = useTypedSelector(state => state.filterReducer);
    const cameras = useTypedSelector(state => state.settingsReducer.cameras);
    const { isDisableFilterCameras } = useTypedSelector(state => state.settingsReducer);
    const dispatch = useTypedDispatch();
    const eventTypes = useMemo(() => getEventTypesAsObject(), []);
    const [isShowNumberPlate, setIsShowNumberPlate] = useState(false)

    useEffect(() => {
        setIsShowNumberPlate(eventType === eventsEnum.plateRecognition)
    }, [eventType])

    const checkDateTime = useCallback(() => {
        if (dateFrom < dateTo)
            return true;

        if (dateFrom === dateTo)
            if (timeFrom < timeTo)
                return true

        return false;
    }, [dateFrom, dateTo])

    const getCamerasWithIcon = () => {
        return cameras.map(camera => {
            return {
                ...camera,
                label: convertCameraIdToCameraDirectionIcon(+camera.value, cameras), 
                direction: convertCameraIdToCameraDirectionString(+camera.value, cameras)
            }
        })
    }

    useEffect(() => {
        dispatch(changeFilterValue({ key: "plate", value: "" }))
    }, [eventType])

    const isHasAllValues = () => !!(dateFrom && dateTo && timeFrom && timeTo && eventType && cameraDirection)

    const handleCameraSelect = useCallback((direction: cameraDirectionEnum) => {
        const isSelected = cameraDirection.includes(direction);
        const newValue = isSelected 
            ? cameraDirection.filter((d: cameraDirectionEnum) => d !== direction)
            : [...cameraDirection, direction];
        
        dispatch(changeFilterValue({ key: "cameraDirection", value: newValue }));
    }, [cameraDirection, dispatch]);

    const isCameraDisabled = useCallback((direction: cameraDirectionEnum) => {
        switch(eventType){
            case eventsEnum.blacklistAudit:
            case eventsEnum.plateRecognition: 
                return [cameraDirectionEnum.BackLeft, cameraDirectionEnum.TopLeft, cameraDirectionEnum.BackRight, cameraDirectionEnum.TopRight].includes(direction);

            case eventsEnum.faceMatch:
                return [cameraDirectionEnum.Back, cameraDirectionEnum.Top].includes(direction);
                
            default: return false;
        }
    }, [eventType]);

    const getEventTypeItems = () =>
        eventTypes.filter(item => item.value !== eventsEnum.facedetection)

    const applyHandler = () => {
        dispatch(clearContent())
        dispatch(eventsFetch(0))

        dispatch(toggleFitlerVisibility())
    } 

    return (
        <Stack direction="column">
            <Stack direction="row" style={styles.buttonsRow}>
                <ApplyButton 
                    onPress={applyHandler}
                    disabled={!isHasAllValues() || !checkDateTime()}
                />
            </Stack>

            <Stack direction="row" style={styles.fieldsWrapper}>
                <Stack direction="column" style={styles.eventColumn}>
                    <FilterField title="Событие" subtitle='Для поиска по номеру выберите "Распознавание машин"'>
                    <EventPickerSingle
                            event={eventType}
                            onChange={(value : string) => dispatch(changeFilterValue({key: "eventType", value}))}
                            eventItems={[
                                { value: eventsEnum.allPic, label: "Все" },
                                ...getEventTypeItems()
                            ]} 
                        />
                    </FilterField>

                    {isShowNumberPlate && 
                    <View>
                        <Input
                            autoCorrect = {false}
                            style={styles.plateInput}
                            placeholder="Номер ТС"
                            value={plate}
                            onChangeText={(value) => dispatch(changeFilterValue({ key: "plate", value: value }))} />
                    </View>
                    }
                </Stack>
                <Stack direction="column" style={styles.dateColumn}>
                    <FilterField title="Дата и время">
                        <DateTimePicker /> 
                    </FilterField>
                    <FilterField title="Камера">
                        <CameraDirectionPicker 
                            selected={cameraDirection}
                            events={getCamerasWithIcon()}
                            onSelect={handleCameraSelect}
                            isFilterCamerasDisabled={isDisableFilterCameras}
                            isOptionDisabled={isCameraDisabled}
                        />
                    </FilterField>     
                </Stack>                


            </Stack>
        </Stack>
    )
}

export default memo(Filters);

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