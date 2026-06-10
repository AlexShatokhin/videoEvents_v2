import React from "react"
import { Button } from "@react-native-material/core"
import { colors } from "../../../../constants/colors"
import { StyleSheet } from "react-native"
import { Entypo } from "@expo/vector-icons"

interface ApplyButtonProps {
    onPress: () => void;
    disabled: boolean;
}

export const ApplyButton = ({ onPress, disabled }: ApplyButtonProps) => {
    return (
        <Button
            onPress={onPress}
            disabled={disabled}
            title="Применить"
            leading={<Entypo name="check" size={24} color={colors.white} />}
            style={[styles.applyButton, {backgroundColor: disabled ? colors.deepgreen : colors.green}]} />

    )
}

const styles = StyleSheet.create({
    applyButton: {
        marginRight: 10
    },
})