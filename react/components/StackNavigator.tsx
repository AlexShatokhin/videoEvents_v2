import React from "react";
import { Stack } from "@react-native-material/core";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/RootStackParamList";
import { colors } from "../../constants/colors";
import { useTypedSelector } from "../hooks/useRedux";

import AuthorizationPage from "../pages/AuthorizationPage";
import EventPage from "../pages/EventPage";
import FilterPopup from "./Filter/FilterPopup/FilterPopup";

import GeneralButtonsBlock from "./GeneralButtonsBlock";
import getColorByTheme from "../helpers/getColorByTheme";
import AutoAuthorization from "../modules/Authorization/AutoAuthorization";
import SettingsPage from "../pages/SettingsPage";
import SettingsAuthorization from "../pages/SettingsAuthorization";
import VideoPage from "../pages/VideoPage";
import { StyleSheet } from "react-native";
import ArchivePage from "../pages/ArchivePage";

const NativeStackNavigator = createNativeStackNavigator<RootStackParamList>();

const StackNavigator = () => {
    const { theme } = useTypedSelector(state => state.settingsReducer);
    return (
        <NativeStackNavigator.Navigator initialRouteName='AutoAuthorizationPage'>
            <NativeStackNavigator.Screen
                name="AutoAuthorizationPage"
                component={AutoAuthorization}
                options={{
                    headerShown: false
                }} />
            <NativeStackNavigator.Screen
                name="AuthorizationPage"
                component={AuthorizationPage}
                options={{
                    headerShown: false
                }} />
            <NativeStackNavigator.Screen
                name="EventPage"
                component={EventPage}
                options={({ navigation }) => ({
                    headerShown: true,
                    headerTitle: 'Отслеживание событий',
                    headerBackVisible: false,
                    headerStyle: { backgroundColor: getColorByTheme(theme) },
                    headerTintColor: theme === "dark" ? colors.white : colors.black,
                    headerRight: () => (
                        <Stack direction='row' style={styles.wrapper}>
                            <GeneralButtonsBlock showSpeedLimit showArchive showVideo navigation={navigation} />
                        </Stack>
                    )
                })} />
            <NativeStackNavigator.Screen
                name="ArchivePage"
                component={ArchivePage}
                options={({ navigation }) => ({
                    headerShown: true,
                    headerTitle: 'Архив',
                    headerBackVisible: true,
                    navigationBarColor: colors.black,
                    headerStyle: { backgroundColor: getColorByTheme(theme) },
                    headerTintColor: theme === "dark" ? colors.white : colors.black,
                    headerRight: () =>
                        <Stack direction='row' style={styles.wrapper}>
                            <FilterPopup type="archive" />
                            <GeneralButtonsBlock showVideo navigation={navigation} />
                        </Stack>
                })} />
            <NativeStackNavigator.Screen
                name="VideoPage"
                component={VideoPage}
                options={({ navigation }) => ({
                    headerShown: true,
                    headerTitle: 'Видеоархив',
                    headerBackVisible: true,
                    navigationBarColor: colors.black,
                    headerStyle: { backgroundColor: getColorByTheme(theme) },
                    headerTintColor: theme === "dark" ? colors.white : colors.black,
                    headerRight: () =>
                        <Stack direction='row' style={styles.wrapper}>
                            <FilterPopup type="video" />
                            <GeneralButtonsBlock showArchive navigation={navigation} />
                        </Stack>
                })} />
            <NativeStackNavigator.Screen
                name="SettingsPage"
                component={SettingsPage}
                options={() => ({
                    headerShown: true,
                    headerTitle: 'Конфигурация приложения',
                    headerBackVisible: true,
                    navigationBarColor: colors.black,
                    headerStyle: { backgroundColor: getColorByTheme(theme) },
                    headerTintColor: theme === "dark" ? colors.white : colors.black,
                })} />
            <NativeStackNavigator.Screen
                name="SettingsAuthorizationPage"
                component={SettingsAuthorization}
                options={() => ({
                    headerShown: true,
                    headerTitle: 'Настройки',
                    headerBackVisible: true,
                    navigationBarColor: colors.black,
                    headerStyle: { backgroundColor: getColorByTheme(theme) },
                    headerTintColor: theme === "dark" ? colors.white : colors.black,
                })} />
        </NativeStackNavigator.Navigator>
    )
}

export default StackNavigator;

const styles = StyleSheet.create({
    wrapper: {
        display: "flex", 
        alignItems: "center",
        justifyContent: "center",
        columnGap: 20,
    }
})