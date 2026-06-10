import React, {FC} from "react"
import { StyleSheet } from "react-native"
import { Text, Stack } from "@react-native-material/core"
import { colors } from "../../constants/colors"

type NotFoundTextPropsType = {
    children: string | React.ReactNode,
    autoMarginTop?: boolean
}

const NotFoundText : FC<NotFoundTextPropsType> = ({children, autoMarginTop}) => {
    if(typeof children === "string") 
        return <Text style = {[styles.not_found, autoMarginTop ? {marginTop: 70} : null]}>{children}</Text>

    return <Stack style = {[styles.not_found, autoMarginTop ? {marginTop: 70} : null]}>{children}</Stack>
}

export default NotFoundText

const styles = StyleSheet.create({
    not_found: {
        textAlign: "center",
        fontSize: 40,
        color: colors.lightgrey,
        opacity: 0.3,
        fontWeight: "bold",
        letterSpacing: 1,
        marginHorizontal: "auto"
    }
})