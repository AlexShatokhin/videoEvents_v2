import React, { JSX, useCallback, useMemo } from "react";
import { Stack } from "@react-native-material/core";
import { FC } from "react";
import { StyleSheet } from "react-native";
import { colors } from "../../../../../constants/colors";
import { cameraDirection } from "../../../../types/cameraDirectionEnum";
import { DirectionIconType } from "../../../../types/DirectionIconType";
import PressableArea from "../../../../UI/PressableArea";
import { eventsEnum } from "../../../../types/eventsEnum";

type CameraDirectionEvent = {
    label: (props: DirectionIconType) => JSX.Element,
    direction: cameraDirection | -1,
    value: string
}

type EventPickerPropsType = {
    events: Array<CameraDirectionEvent>,
    selected: cameraDirection[],
    onSelect: (direction: cameraDirection) => void,
    isOptionDisabled?: (direction: cameraDirection) => boolean,
    isFilterCamerasDisabled?: boolean | null
}

const CameraDirectionPicker : FC<EventPickerPropsType> = ({
    events, 
    selected, 
    onSelect, 
    isOptionDisabled, 
    isFilterCamerasDisabled = false
}) => {
    const selectedItemStyle = useMemo(() => [styles.cameraItem, styles.checked], []);
    const unselectedItemStyle = useMemo(() => [styles.cameraItem], []);
    const sortDirections = useMemo(() => {
        const directions : Array<CameraDirectionEvent>  = [];

        events.forEach(event => {
            let index = -1;
            switch(event.direction){
                case cameraDirection.TopLeft: index = 0; break;
                case cameraDirection.Top: index = 1; break;
                case cameraDirection.TopRight: index = 2; break;
                case cameraDirection.BackLeft: index = 3; break;
                case cameraDirection.Back: index = 4; break;
                case cameraDirection.BackRight: index = 5; break;
            }
            directions[index] = event;
        });

        return directions;
    }, [events]);

    const renderCameraDirections = useCallback(() => sortDirections.map((event) => {
        if(event.direction === -1){
            throw new Error("Camera direction is missing!");
        }

        const isSelected = selected.includes(event.direction);
        const isDisabled = isFilterCamerasDisabled ? isOptionDisabled?.(event.direction as cameraDirection) : false;

        return (
            <PressableArea
                disabled={isDisabled}
                key={event.value}
                style={[isSelected ? selectedItemStyle : unselectedItemStyle, isDisabled && {opacity: 0.3, backgroundColor: colors.lightgrey}]}
                onPress={() => onSelect(event.direction as cameraDirection)}>
                <event.label color={isDisabled ? colors.lightgrey: isSelected ? colors.white : colors.lightblue}/>
            </PressableArea>
        )
    }), [onSelect, events, selected, isOptionDisabled, isFilterCamerasDisabled]) 

    return (
        <Stack direction="row" style={styles.camerasContainer}>
            {renderCameraDirections()}
        </Stack>
    ) 
}

export default React.memo(CameraDirectionPicker);

const styles = StyleSheet.create({
    camerasContainer: {
        display: "flex",
        gap: 10,
        width: 260,
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: "auto"
    },
    cameraItem: {
        width: 60,
        height: 60,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.lightgrey,
        borderRadius: 8
    },
    checked: {
        backgroundColor: colors.lightblue
    }
})