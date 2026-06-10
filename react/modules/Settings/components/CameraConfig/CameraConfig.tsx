import React from "react";
import { View } from "react-native";
import { Stack } from "@react-native-material/core";
import { useTypedDispatch, useTypedSelector } from "../../../../hooks/useRedux";
import CameraConfigItem from "./CameraConfigItem";
import { changeCameras } from "../../slice/settingsSlice";
import { cameraDirection } from "../../../../types/cameraDirectionEnum";

const CameraConfig = () => {
    const {cameras} = useTypedSelector(state => state.settingsReducer);
    const dispatch = useTypedDispatch();

    const onChangeHandler = (text: string, label: cameraDirection) => {
        const newData = cameras.map(item => item.label === label ? {label, value: (text)} : item);
        dispatch(changeCameras(newData))
    }

    const renderCameraConfigItems = () => 
        cameras.map(({label, value}) => (
            <CameraConfigItem 
                key={label}
                cameraName={label}
                cameraId={value.toString()}
                onChange={(text) => onChangeHandler(text, label)}/>
        )
    )

    return (
        <Stack>
            <View style={{width: "100%", marginTop: 20}}>
                {renderCameraConfigItems()}                
            </View>
        </Stack>
    )
} 

export default CameraConfig;

