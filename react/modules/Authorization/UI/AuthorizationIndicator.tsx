import React, {FC} from "react";
import { Image, StyleSheet } from "react-native";
import success from "../../../../assets/success.gif"
import error from "../../../../assets/error.gif"

type ActivityIndicatorPropsType = {
    type: "success" | "error"
}

const AuthorizationIndicator : FC<ActivityIndicatorPropsType> = ({type}) => {
    return <Image 
        source={type === "success" ? success : error}
        style = {type === "success" ? styles.success : styles.error}/>
}

export default AuthorizationIndicator;

const styles = StyleSheet.create({
    success: {
        width: 90,
        height: 90
    },
    error: {
        width: 150,
        height: 150
    }
})