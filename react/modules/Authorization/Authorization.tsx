import React, { useState, FC, useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import AuthorizationInput from "./components/AuthorizationInput";
import AuthorizationSwitch from "./components/AuthorizationSwitch";
import CustomButton from "../../UI/CustomButton";
import { Stack, ActivityIndicator, Snackbar, Switch } from "@react-native-material/core";
import { useTypedSelector, useTypedDispatch } from "../../hooks/useRedux";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/RootStackParamList";
import getAuthorizationStatus from "./api/getAuthorizationStatus";
import { colors } from "../../../constants/colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useWebSocket } from "../Websocket/websocket";
import { useIsFocused, useRoute } from "@react-navigation/native";
import * as Network from 'expo-network';
import { RouteProp } from "@react-navigation/native";
import Label from "../../UI/Label";
import { setIP, setPassword, setServerIP, setUsername } from "./slice/AuthorizationSlice";

type AuthorizationPropsType = NativeStackScreenProps<RootStackParamList, 'AuthorizationPage'>;

const Authorization: FC<AuthorizationPropsType> = ({ navigation }) => {

    const [snackbarMessage, setSnackbarMessage] = useState<string>("Заполните все поля!");
    const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
    const [loadingStatus, setLoadingStatus] = useState<"loading" | "idle" | "success" | "error">("idle");
    const [connectionMode, setConnectionMode] = useState<"wifi" | "4g">("wifi");
    const { userName, password, ip, serverIP } = useTypedSelector(state => state.authorizationReducer);
    const [inputIp, setInputIp] = useState(ip)
    const [inputServerIp, setInputServerIp] = useState(serverIP)
    const { autoLogin, theme } = useTypedSelector(state => state.settingsReducer)
    const route = useRoute<RouteProp<RootStackParamList, 'AuthorizationPage'>>();
    const isConnected = useWebSocket()?.isConnected;
    const disconnect = useWebSocket()?.disconnect;

    const dispatch = useTypedDispatch();
    const isFocused = useIsFocused();

    useEffect(() => {
        if(autoLogin){
            loginHandler(userName, password, ip, serverIP)
        }
    }, [])

    useEffect(() => {
        if (route.params?.message) {
            setShowSnackbar(true);
            setSnackbarMessage(route.params.message);
            setTimeout(() => setShowSnackbar(false), 2000);
        }
    }, [route]);

    useEffect(() => {
        if (connectionMode === "wifi") {
            const detectNetwork = async () => {
                const deviceIp = await Network.getIpAddressAsync();
                const gatewayIp = deviceIp.split('.').slice(0, 3).join('.') + '.1';
                console.log("Device IP:", deviceIp);
                console.log("Gateway IP:", gatewayIp);
                setInputIp(gatewayIp);
                setServerIP(`${deviceIp}:8080`);
            };
            detectNetwork();
        }
    }, [connectionMode]);

    useEffect(() => {
        if (isFocused) {
            if (isConnected && disconnect) {
                console.log("disconnect from server....");
                disconnect();
            }
        }
    }, [isFocused]);

    const usernameHandler = (val: string) => dispatch(setUsername(val))
    const passwordHandler = (val: string) => dispatch(setPassword(val))
    const ipHandler = (val: string) => setInputIp(val)
    const serverIpHandler = (val: string) => setInputServerIp(val)

    const loginHandler = async (userName: string, password: string, ip: string, serverIP: string) => {
        if (userName === "" || password === "") {
            setSnackbarMessage("Заполните все поля!");
            setShowSnackbar(true);
            setTimeout(() => setShowSnackbar(false), 2000);
            return;
        }

        setLoadingStatus("loading");
        const loginStatus = await getAuthorizationStatus(userName, password, ip, serverIP);
        setLoadingStatus(loginStatus ? "success" : "error");
        setTimeout(() => setLoadingStatus("idle"), 1000);

        dispatch(setIP(ip))
        dispatch(setServerIP(serverIP))

        if (loginStatus) {
            setTimeout(() => {
                navigation.navigate("EventPage");
                setLoadingStatus("idle");
            }, 1100);
        }
        setTimeout(() => {
            navigation.navigate("EventPage");
        }, 2000)
    };

    const getButtonValue = () => {
        switch (loadingStatus) {
            case "idle": return "Войти";
            case "loading": return <ActivityIndicator size="large" color={colors.lightblue} />;
            case "success": return <AntDesign name="check" color={colors.black} size={30} />;
            case "error": return <AntDesign name="close" color={colors.black} size={30} />;
        }
    };

    const getButtonStyle = () => {
        switch (loadingStatus) {
            case "idle": return theme === "dark" ? {} : { backgroundColor: colors.lightblue, borderColor: colors.lightblue };
            case "loading": return theme === "dark" ? {} : { backgroundColor: colors.white, borderColor: colors.lightblue };
            case "success": return ({ backgroundColor: colors.green, borderColor: colors.green });
            case "error": return ({ backgroundColor: colors.red, borderColor: colors.red });
        }
    };

    return (
        <View>
            <Stack direction="row" style={styles.connectionToggle}>
                <Label
                    text="Wi-Fi"
                    style={[
                        styles.connectionLabel,
                        connectionMode === "wifi" ? styles.connectionLabelActive : styles.connectionLabelInactive,
                        theme === "light" ? { color: connectionMode === "wifi" ? colors.black : colors.lightgrey } : {},
                    ]}
                />
                <Switch
                    value={connectionMode === "4g"}
                    onValueChange={(val: boolean) => setConnectionMode(val ? "4g" : "wifi")}
                    trackColor={{ false: colors.lightgrey, true: colors.deepblue }}
                    thumbColor={colors.lightblue}
                />
                <Label
                    text="4G"
                    style={[
                        styles.connectionLabel,
                        connectionMode === "4g" ? styles.connectionLabelActive : styles.connectionLabelInactive,
                        theme === "light" ? { color: connectionMode === "4g" ? colors.black : colors.lightgrey } : {},
                    ]}
                />
            </Stack>

            <Stack style={{ marginTop: 0 }} direction="row">
                <Stack style={styles.marginLeft}>
                    <AuthorizationInput 
                        onChange={usernameHandler} 
                        value={userName} 
                        theme={theme || "light"} 
                        id="userName" 
                        label="Логин" />
                    <AuthorizationInput 
                        onChange={passwordHandler} 
                        value={password} 
                        theme={theme || "light"} 
                        id="password" 
                        label="Пароль" />

                    {connectionMode === "4g" && (
                        <>
                            <AuthorizationInput 
                                value={inputIp}
                                onChange={ipHandler}
                                theme={theme || "light"} 
                                id="ip" 
                                label="IP устройства" />

                            <AuthorizationInput 
                                value={inputServerIp}
                                onChange={serverIpHandler}                            
                                theme={theme || "light"} 
                                id="serverIP" 
                                label="IP сервера" />
                        </>
                    )}
                </Stack>
            </Stack>

            <AuthorizationSwitch theme={theme || "light"} id="autoLogin" label="Запомнить меня" />

            <View style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 40 }}>
                <Text>
                    <CustomButton
                        buttonStyle={[{ width: 350 }, getButtonStyle()]}
                        label={getButtonValue()}
                        onPress={() => loginHandler(userName, password, inputIp, inputServerIp)} />
                </Text>
            </View>
            {showSnackbar ? <Snackbar style={styles.snackbar} message={snackbarMessage} /> : null}
        </View>
    );
};

export default Authorization;

const styles = StyleSheet.create({
    marginLeft: {
        marginLeft: 20
    },
    title: {
        fontWeight: "bold",
        color: colors.white,
        textAlign: "center",
        fontSize: 30
    },
    snackbar: {
        position: "absolute",
        bottom: 40,
        width: 370,
        backgroundColor: colors.red,
        opacity: 0.8
    },
    connectionToggle: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 15,
        gap: 10,
    },
    connectionLabel: {
        fontSize: 16,
        fontWeight: "bold",
    },
    connectionLabelActive: {
        color: colors.white,
        opacity: 1,
    },
    connectionLabelInactive: {
        color: colors.lightgrey,
        opacity: 0.5,
    },
});
