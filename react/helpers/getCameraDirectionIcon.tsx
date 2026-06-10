import React from "react";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { cameraDirection } from "../types/cameraDirectionEnum";
import { colors } from "../../constants/colors";
import { DirectionIconType } from "react/types/DirectionIconType";


export const getCameraDirectionIcon = (direction : cameraDirection | unknown, color: string) => {
    switch (direction) {
        case cameraDirection.Back:
            return <Feather name="arrow-down" size={30} color={color} />;
        case cameraDirection.BackLeft:
            return <Feather name="arrow-down-left" size={30} color={color} />;
        case cameraDirection.BackRight:
            return <Feather name="arrow-down-right" size={30} color={color} />;
        case cameraDirection.Top:
            return <Feather name="arrow-up" size={30} color={color} />;
        case cameraDirection.TopLeft:
            return <Feather name="arrow-up-left" size={30} color={color} />;
        case cameraDirection.TopRight:
            return <Feather name="arrow-up-right" size={30} color={color} />;
        default:
            return <FontAwesome name="arrows" size={30} color={color} />;
    }
}


export const getCameraDirectionIconExperimental = (direction : cameraDirection | unknown) => {
    switch (direction) {
        case cameraDirection.Back:
            return ({size = 30, color = colors.black} : DirectionIconType) => <Feather name="arrow-down" size={size} color={color} />;
        case cameraDirection.BackLeft:
            return ({size = 30, color = colors.black} : DirectionIconType) => <Feather name="arrow-down-left" size={size} color={color} />;
        case cameraDirection.BackRight:
            return ({size = 30, color = colors.black} : DirectionIconType) => <Feather name="arrow-down-right" size={size} color={color} />;
        case cameraDirection.Top:
            return ({size = 30, color = colors.black} : DirectionIconType) => <Feather name="arrow-up" size={size} color={color} />;
        case cameraDirection.TopLeft:
            return ({size = 30, color = colors.black} : DirectionIconType) => <Feather name="arrow-up-left" size={size} color={color} />;
        case cameraDirection.TopRight:
            return ({size = 30, color = colors.black} : DirectionIconType) => <Feather name="arrow-up-right" size={size} color={color} />;
        default:
            return ({size = 30, color = colors.black} : DirectionIconType) => <FontAwesome name="arrows" size={size} color={color} />;
    }
}