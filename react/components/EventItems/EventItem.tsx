import React, { FC, memo, useCallback, useMemo } from "react";
import Animated from "react-native-reanimated";
import { Text, StyleSheet } from "react-native";
import { Stack } from "@react-native-material/core";

import { colors } from "../../../constants/colors";

import getColorByEventType from "../../helpers/getColorByEventType";
import { EventInformationType } from "../../types/eventInformationType";
import { eventsEnum } from "../../types/eventsEnum";
import { convertCameraDirectionToCameraID, convertCameraIDToCameraDirection } from "../../helpers/convertCameraDirectionToCameraID";
import { useTypedSelector } from "../../hooks/useRedux";
import { cameraDirection } from "../../types/cameraDirectionEnum";
import { FontAwesome, MaterialCommunityIcons} from "@expo/vector-icons";
import PressableArea from "../../UI/PressableArea";

type EventItemPropsType = {
    event: EventInformationType;
    index: number;
    onPressHandler: (event: any) => void;
    selected: boolean;
    disabled?: boolean;
    theme: "dark" | "light";
}

const EventItem: FC<EventItemPropsType> = ({ index, event, onPressHandler, selected, theme, disabled }) => {
    const color = useMemo(() => getColorByEventType(event.type), [event]); 
    const { cameras } = useTypedSelector(state => state.settingsReducer)
    const getLabelField = useCallback((event: EventInformationType) => {
        switch (event.type) {
            case eventsEnum.plateRecognition:
                return <FontAwesome name="car" size={24} color={getTextColor(theme)} />
            case eventsEnum.blacklistAudit:
                return <FontAwesome name="warning" size={24} color={getTextColor(theme)} />
                // return getLabelByValue(event.type)
            default: return <MaterialCommunityIcons name="face-recognition" size={24} color={getTextColor(theme)} />
        }
    }, [event]) 

    const shortText = (text : string, limit: number = 10) => {
        return text.length <= limit ? text : text.slice(0, limit - 3) + "..."
    } 

    return (
        <Animated.View>
            <PressableArea
                disabled={disabled}
                onPress={() => onPressHandler(event)}>
                <Stack direction="row" style={[
                    styles.itemWrapper, 
                    { borderLeftColor: color },
                    selected && styles.selected,
                    selected && { backgroundColor: color },
                    disabled && styles.disabled
                ]}>
                    <Text style={[styles.text, styles.cameraIcon]}>{convertCameraIDToCameraDirection("icon", event.trackID, cameras, theme === "dark" ? colors.white : colors.black)}</Text>
                    <Text style={[styles.text, styles.eventIcon, { color: getTextColor(theme) }]}>
                        {getLabelField(event)}
                    </Text>
                    {event.type === eventsEnum.plateRecognition || event.type === eventsEnum.blacklistAudit ?
                            <Text style={[styles.text, styles.plateNumber, { color: getTextColor(theme) }]}>{event.plateNumber}</Text> : null}
                    {event.type === eventsEnum.plateRecognition && event.trackID == convertCameraDirectionToCameraID(cameraDirection.Top, cameras) ?
                            <Text style={[styles.text, styles.speed, { color: getTextColor(theme) }]}>{event.speed + " км/ч"}</Text> : null}
                    {event.type === eventsEnum.faceMatch ?
                            <Text style={[styles.text, styles.alarmText, { color: getTextColor(theme) }]}>{shortText(event.alarmText || event.name, 60)}</Text> : null}
                    {event.type === eventsEnum.blacklistAudit ?
                            <Text style={[styles.text, styles.description, { color: getTextColor(theme) }]}>{shortText(event.description || "Машина в розыске", 35)}</Text> : null}                    
                </Stack>
            </PressableArea>
        </Animated.View>
    )
};

export default memo(EventItem);

const getTextColor = (theme: "dark" | "light") => theme === "dark" ? colors.white : colors.black

const styles = StyleSheet.create({
    text: {
        fontSize: 18,
        marginLeft: 15
    },
    itemWrapper: {
        width: "95%",
        height: 70,
        borderRadius: 10,
        marginVertical: 7,
        paddingHorizontal: 10,
        paddingVertical: 7,
        marginLeft: 10,
        display: "flex",
        alignItems: "center",
        borderWidth: 1,
        borderLeftWidth: 12,
        borderTopColor: colors.lightgrey,
        borderRightColor: colors.lightgrey,
        borderBottomColor: colors.lightgrey,
    },
    selected: {
        borderWidth: 0
    },
    disabled: {
        opacity: 0.5
    },
    cameraIcon: {
        marginLeft: 0,
        width: 30
    },
    eventIcon: {
        marginLeft: 10
    },
    plateNumber: {
        width: 100
    },
    speed: {
        width: 90
    },
    alarmText: {
        width: "90%"
    },
    description: {
        width: "60%",
        marginLeft: 5
    }
})