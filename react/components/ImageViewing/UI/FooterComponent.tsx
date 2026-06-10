import React, {FC} from "react";
import { Stack } from "@react-native-material/core";
import { Text, StyleSheet } from "react-native";
import { colors } from "../../../../constants/colors";

type FooterComponentPropsType = {
    index: number,
    count: number
}

const FooterComponent : FC<FooterComponentPropsType> = ({index, count}) => {
    return (
        <Stack style = {styles.wrapper}>
            <Stack style = {styles.footerElement}>
                <Text>{index + 1} / {count}</Text>
            </Stack>
        </Stack>

    )
}

export default FooterComponent;

const styles = StyleSheet.create({
    wrapper: {
        display: "flex",
        flexDirection: "row",
        marginHorizontal: "auto",
        marginBottom: 10,
    },
    footerElement: {
        width: 70, 
        height: 30, 
        borderRadius: 30,
        opacity: 0.6,
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
    },
    footerInfo: {
        width: 30, 
        marginLeft: 10,
    }
})