import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React, { FC, useEffect, useRef, useState } from 'react'
import { RootStackParamList } from '../../types/RootStackParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Stack } from '@react-native-material/core';
import { useTypedDispatch, useTypedSelector } from '../../hooks/useRedux';
import getAuthorizationStatus from './api/getAuthorizationStatus';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors } from '../../../constants/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';

import * as Network from 'expo-network';
import HiddenPressableElements from './HiddenPressableElements';
import PressableArea from '../../UI/PressableArea';
import { setIP, setServerIP } from './slice/AuthorizationSlice';

const STATE_MAP = {
	loading: 0,
	again: 0,
	success: 1,
	error: 2,
};

type AutoAuthorizationPropsType = NativeStackScreenProps<RootStackParamList, 'AutoAuthorizationPage'>;

const AutoAuthorization: FC<AutoAuthorizationPropsType> = ({ navigation }) => {
	const [loadingStatus, setLoadingStatus] = useState<"loading" | "again" | "success" | "error">("loading");
	const [authorizationMessage, setAuthorizationMessage] = useState<string>("");
	const backgroundColorValue = useSharedValue(0);
	const {ip, serverIP, userName, password} = useTypedSelector(state => state.authorizationReducer)
	const dispatch = useTypedDispatch()

const errorTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const routeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	const animatedStyle = useAnimatedStyle(() => ({
		backgroundColor: interpolateColor(
			backgroundColorValue.value,
			[STATE_MAP.loading, STATE_MAP.success, STATE_MAP.error],
			[colors.grey, colors.green, colors.red]
		)
	}));

	useEffect(() => {
		const target = STATE_MAP[loadingStatus] ?? 0;
		backgroundColorValue.value = withTiming(target, { duration: 200 });
	}, [loadingStatus]);

	useEffect(() => {
		handleReload()

		return () => {
			if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
			if (routeTimerRef.current) clearTimeout(routeTimerRef.current);
		};
	}, []);

	const getLoginDataAndInit = async () => {
		setLoadingStatus("loading");
		try {
			const deviceIp = await Network.getIpAddressAsync();
			const gatewayIp = deviceIp.split('.').slice(0, 3).join('.') + '.1';
			const serverIp = `${deviceIp}:8080`;
			
			dispatch(setIP(gatewayIp));
			dispatch(setServerIP(serverIp));
			
			await loginHandler(userName, password, gatewayIp, serverIp);
		} catch (error) {
			setLoadingStatus("error");
			setAuthorizationMessage("Не удалось получить данные сети");
		}
	};

	const loginHandler = async (userName: string, password: string, ip: string, serverIp: string) => {
		setAuthorizationMessage("Авторизация...")
		setLoadingStatus("loading");
		const loginStatus = await getAuthorizationStatus(userName, password, ip, serverIp);
		setLoadingStatus(loginStatus ? "success" : "error");


		if (loginStatus) {
			setAuthorizationMessage("Успешная авторизация");
			routeTimerRef.current = setTimeout(() => {
				navigation.navigate("EventPage");
				setLoadingStatus("again");
			}, 2000);
		} else {
			setAuthorizationMessage("");
			errorTimerRef.current = setTimeout(() => {
				setLoadingStatus("again");
				setAuthorizationMessage("Ошибка авторизации, попробуйте снова");
			}, 2000)
		}
	}

	const handleReload = () => {
		if (ip.length === 0 || serverIP.length === 0) {
			getLoginDataAndInit();
		} else {
			loginHandler(userName, password, ip, serverIP);
		}
	};

	const getAuthorizationStatusElement = () => {
		switch (loadingStatus) {
			case "loading":
				return <ActivityIndicator size={90} color={colors.white} />;
			case "success":
				return <AntDesign name="check" size={90} color={colors.white} />;
			case "error":
				return <AntDesign name="close" size={90} color={colors.white} />;
			default:
				return (
					<PressableArea onPress={handleReload}>
						<Ionicons name="reload-outline" size={90} color={colors.white} />
					</PressableArea>
				);
		}
	};

	return (
		<Animated.View style={[styles.container, animatedStyle]}>
			<HiddenPressableElements navigation={navigation} loadingStatus={loadingStatus} />
			<Stack style={{ marginBottom: 50 }}>
				<View>{getAuthorizationStatusElement()}</View>
			</Stack>
			<Text style={[styles.text, { color: colors.white }]}>{authorizationMessage}</Text>
		</Animated.View>
	)
}

export default AutoAuthorization

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		height: "100%",
	},
	text: {
		fontSize: 35,
		fontWeight: "bold",
		textAlign: 'center'
	},
})