import React, {FC} from "react"
import { StyleSheet } from "react-native"
import { Text } from "@react-native-material/core"

type CategoryNamePropsType = {
    children: string
}

const CategoryName : FC<CategoryNamePropsType> = ({children}) => {
    return <Text style = {styles.bold}>{children}</Text>
}

export default CategoryName

const styles = StyleSheet.create({
    bold: {
        fontWeight: "bold"
    }
})