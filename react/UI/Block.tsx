import React, {FC} from "react";
import { colors } from "../../constants/colors";
import { View, StyleSheet, StyleProp } from "react-native";

type BlockPropsType = {
    style?: StyleProp<any>
}

const Block : FC<BlockPropsType> = ({style}) => {
    return (
        <View style = {[styles.block, style]}>

        </View>
    )
}

export default Block;

const styles = StyleSheet.create({
    block: {
        width: 200,
        height: 200,
        backgroundColor: colors.lightgrey,
        margin: 10
    }
})