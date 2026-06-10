import React from "react";
import { View } from "react-native";
import SettingsItem from "./components/SettingsItem/SettingsItem";
import CameraConfig from "./components/CameraConfig/CameraConfig";
import LoginParamsConfig from "./components/LoginParamsConfig/LoginParamsConfig";
import FilterConfig from "./components/ExtraConfig/FilterConfig";


const Settings = () => {
    return (
        <View style={{marginVertical: 20}}>
            <View>
                <SettingsItem title="Настройки авторизации">
                    <LoginParamsConfig />
                </SettingsItem>
                <SettingsItem title="Настройки камер">
                    <CameraConfig />
                </SettingsItem>
                <SettingsItem title="Настройки фильтра">
                    <FilterConfig />
                </SettingsItem>                
            </View>
        </View>
    )
}

export default Settings;