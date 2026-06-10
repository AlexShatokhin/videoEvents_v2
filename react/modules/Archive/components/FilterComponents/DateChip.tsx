import React from "react"
import { Chip } from "@react-native-material/core"
import { StyleSheet } from "react-native"
import { colors } from "../../../../../constants/colors"


const DateChip = ({value, label, selected = false, onPress} : {value: string, label: string, selected?: boolean, onPress: (value: string) => void} ) => {
    return (
        <Chip 
            onPress={() => onPress(value)} 
            labelStyle={styles.chipLabel} 
            variant={selected ? "filled" : "outlined"} 
            label={label} 
            color={colors.lightblue}/>
    )
}

export default React.memo(DateChip)

const styles = StyleSheet.create({
    chipLabel: {
        fontSize: 16
    }
})