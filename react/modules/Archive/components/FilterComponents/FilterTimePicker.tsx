import React, { useCallback } from "react"
import RNDateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker"
import { colors } from "../../../../../constants/colors"

interface FilterTimePickerProps {
    changeVisibility: () => void;
    onReset?: () => void;
    handlePickTime: (event: DateTimePickerEvent) => void;
}

const FilterTimePicker = ({handlePickTime, changeVisibility, onReset} : FilterTimePickerProps) => {
    
    const handleTimePicker = useCallback((event: DateTimePickerEvent) => {
        if (event.type === "dismissed") {
            changeVisibility();
            return;
        }
        if (event.type === "set") {
            handlePickTime(event);
            onReset?.();
            changeVisibility();
        }
    }, [handlePickTime, onReset, changeVisibility]);
    
    return (
        <RNDateTimePicker
            negativeButton={{ label: "Закрыть", textColor: "red" }}
            positiveButton={{ label: "Выбрать", textColor: colors.black }}
            is24Hour
            display="spinner"
            onChange={handleTimePicker}
            mode="time"
            value={new Date} /> 
    )
}

export default React.memo(FilterTimePicker)