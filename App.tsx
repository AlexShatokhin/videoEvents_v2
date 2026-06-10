import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PortalProvider } from "@gorhom/portal"
import { StatusBar } from "expo-status-bar";
import store from "./store/store";

import StackNavigator from './react/components/StackNavigator';
import * as MediaLibrary from "expo-media-library"

import { WebSocketProvider } from './react/modules/Websocket/websocket';
import { View } from "react-native";
import { colors } from "./constants/colors";

export default function App() {
	const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

	useEffect(() => {
		ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
	}, [])

	useEffect(() => {
		const asyncPermissions = async () => {
			if (permissionResponse === null) {
				await requestPermission();
			} else if (permissionResponse.status !== 'granted') {
				await requestPermission();
			}
		}
		asyncPermissions();

		
	}, [])

	return (
		<>
			<StatusBar style="dark" translucent />
			<View style={{flex: 1, backgroundColor: colors.black}}>
				<SafeAreaView style={styles.container} edges={[]}>
					<GestureHandlerRootView>
						<PortalProvider>
							<Provider store={store}>
								<WebSocketProvider>
									<NavigationContainer>
										<StackNavigator />
									</NavigationContainer>
								</WebSocketProvider>
							</Provider>
						</PortalProvider>
					</GestureHandlerRootView>
				</SafeAreaView>	
			</View>

		</>


	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
});
