

import React, { FC } from "react";
import { Stack } from "@react-native-material/core";
import { Text } from "react-native";
import Input from "../../../../UI/Input";
import { colors } from "../../../../../constants/colors";
import { useTypedSelector } from "../../../../hooks/useRedux";

const CameraConfigItem : FC<{cameraName: string, cameraId: string, onChange: (text: string) => void}> = ({cameraName, cameraId, onChange}) => {
    const {theme} = useTypedSelector(state => state.settingsReducer)
    return (
        <Stack direction="row" style={{justifyContent: "space-between", alignItems: "center", marginBottom: 20}}>
            <Text style={{fontSize: 20, color: theme === "dark" ? colors.white : colors.black, marginRight: 40}}>
                {cameraName}
            </Text>
            <Input 
                style={{width: 90, height: 40, textAlign: "center", fontSize: 20, paddingHorizontal: 5}}
                onChangeText={onChange}
                value={cameraId}/>
        </Stack>
    )
}

export default CameraConfigItem;