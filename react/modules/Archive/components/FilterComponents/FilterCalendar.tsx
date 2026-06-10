import React, { useCallback, useMemo } from "react";
import { useTypedDispatch, useTypedSelector } from "../../../../hooks/useRedux";
import { getCalendarDate } from "../../helpers/getCalendarDate";
import { changeFilterValue } from "./FilterSlice";
import { CustomCalendar } from "../../../../components/Calendar/CustomCalendar";


const FilterCalendar = ({visible, type, changeVisibility, onReset, label} : {visible: boolean, type: "From" | "To", changeVisibility: () => void, onReset?: () => void, label: string}) => {
    const {dateFrom, dateTo} = useTypedSelector(state => state.filterReducer)
    const dispatch = useTypedDispatch()

    const handleDateTimePicker = useCallback((timestamp: number, key : "From" | "To") => {
        const value = getCalendarDate(timestamp);
        const valueNum = +value.replaceAll("-", "");
        const dateFromNum = +dateFrom.replaceAll("-", "");
        const dateToNum = +dateTo.replaceAll("-", "");
        console.log(value)

        if(key === "To" && valueNum < dateFromNum){
            return;
        }

        if(key === "From" && valueNum > dateToNum){
            return;
        }

        dispatch(changeFilterValue({ key: `date${key}`, value }))
        onReset?.();
                
    }, [dateFrom, dateTo, dispatch, onReset, type]);
    


    return (
        <CustomCalendar 
            dateFrom={dateFrom}
            dateTo={dateTo}
            visible={visible}
            changeVisibility={changeVisibility}
            onChoose={(day) => handleDateTimePicker(day, type)}
            label={label}
        />
    )
}

export default React.memo(FilterCalendar);
