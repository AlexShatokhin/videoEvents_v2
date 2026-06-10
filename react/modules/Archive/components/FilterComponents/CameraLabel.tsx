import React, { FC } from "react"
import { Stack } from "@react-native-material/core"
import { StyleProp, StyleSheet, Text, TextStyle } from "react-native"
import { getCameraDirectionIcon } from "../../../../helpers/getCameraDirectionIcon"

type CameraLabelPropsType =  {
    label: string, 
    color: string,
    textStyle: StyleProp<TextStyle>
}

const CameraLabel : FC<CameraLabelPropsType> = ({label, color, textStyle}) => {
    return (
        <Stack direction="row" style={styles.container}>
            {getCameraDirectionIcon(label, color)}
            <Text style={textStyle}>
                {label}
            </Text>
        </Stack>
    )
}

export default React.memo(CameraLabel)

const styles = StyleSheet.create({
    container: {
        display: "flex",
        columnGap: 10,
        alignItems: "center"
    }
})