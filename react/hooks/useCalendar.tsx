import React from "react";
import { StyleSheet } from "react-native";
import useToggle from "../hooks/useToggle";
import { colors } from "../../constants/colors";
import CustomButton from "../UI/CustomButton";
import { CustomCalendar } from "../components/Calendar/CustomCalendar";

export const useCalendar = (value: string) => {
    const [isShowCalendar, toggleCalendarVisibility] = useToggle()
    
    const getCalendarButton = () => (
        <CustomButton 
            onPress={toggleCalendarVisibility} 
            label={value}
            buttonStyle={styles.dateButton}/>
    )

    const getCalendar = ({label, dateFrom, dateTo, handler} : {label : string, dateFrom : string, dateTo : string, handler : (date : number) => void}) => (
        <CustomCalendar
            dateFrom={dateFrom}
            dateTo={dateTo}
            visible={isShowCalendar}
            changeVisibility={toggleCalendarVisibility}
            onChoose={handler}
            label={label}
        />
    )


    return {
        isShowCalendar,
        toggleCalendarVisibility,
        getCalendarButton,
        getCalendar
    }
}


const styles = StyleSheet.create({

    dateButton: {
        backgroundColor: colors.lightblue,
        borderColor: colors.lightblue,
        marginLeft: 10
    },

});