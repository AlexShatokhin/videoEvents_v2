import React from "react"
import { Stack } from "@react-native-material/core"
import { PropsWithChildren } from "react"
import { StyleSheet, Text, View } from "react-native"
import { colors } from "../../../../constants/colors"


const FilterField = ({title, subtitle, children}: PropsWithChildren<{title: string, subtitle?: string}>) => {
    return (
        <Stack direction="column" style={styles.fieldContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            <View style={styles.contentContainer}>
                {children}
            </View>
        </Stack>
    )
}

export default React.memo(FilterField);

const styles = StyleSheet.create({
    title: {
        fontWeight: "700",
        fontSize: 22,
    },
    subtitle: {
        fontWeight: "400",
        fontSize: 18,
        color: colors.lightgrey
    },
    contentContainer: {
        width: "100%",
        marginTop: 10
    },
    fieldContainer: {
        marginBottom: 10,
        borderBottomColor: colors.lightgrey,
        borderBottomWidth: 0,
        paddingBottom: 20
    }
})