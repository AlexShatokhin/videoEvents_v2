import { Entypo } from "@expo/vector-icons";
import { colors } from "../../../../constants/colors";
import React from "react";
import { TouchableOpacity } from "react-native";

type PlayerActionButtonProps = {
    type: 'play' | 'pause' | 'stop' | "fast-forward" | "fast-backward" | "download";
    onPress: () => void;
    size?: number;
    color?: string;
}

export const PlayerActionButton = ({ type, onPress, size, color }: PlayerActionButtonProps) => {
    
    const getIconByType = () => {
        switch (type) {
            case "play": return "controller-play";
            case "pause": return "controller-paus";
            case "stop": return "controller-stop";
            case "fast-forward": return "controller-fast-forward";
            case "fast-backward": return "controller-fast-backward";
            case "download": return "download";
            default: return "bug";
        }
    }

    return (
        <TouchableOpacity onPress={onPress}>
            <Entypo name={getIconByType()} size={size || 28} color={color || colors.white} />
        </TouchableOpacity>
    )
}

