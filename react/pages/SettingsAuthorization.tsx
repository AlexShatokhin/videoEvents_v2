import { StyleSheet, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import Input from '../UI/Input'
import CustomButton from '../UI/CustomButton'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '../types/RootStackParamList'
import { useTypedSelector } from '../hooks/useRedux'
import getColorByTheme from '../helpers/getColorByTheme'
import { colors } from '../../constants/colors'

const SettingsAuthorization = () => {
	const navigation = useNavigation<NavigationProp<RootStackParamList>>();
	const [password, setPassword] = useState<string>('');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleLogin = () => {
		console.log('Logging in with password:', password);
		if(password === "Admin12345"){
			setErrorMessage(null);
			navigation.navigate("SettingsPage");
		} else {
			setErrorMessage("Пароль неверный!");
		}
	}
	
	const {theme} = useTypedSelector(state => state.settingsReducer);
    const backgroundColor = useSharedValue(getColorByTheme(theme));
    const animatedStyle = useAnimatedStyle(() => {
        return {
            backgroundColor:  backgroundColor.value,
        };
    });
    useEffect(() => {
        backgroundColor.value = withTiming(getColorByTheme(theme), {duration: 100});
    }, [theme])

	return (
		<Animated.View style={[styles.wrapper, animatedStyle]}>
			<Text style={[styles.title, {color: theme === "dark" ? colors.white : colors.black}]}>Авторизация</Text>
			<Input theme={theme} style={{width: 300, marginBottom: 20}} password placeholder='Введите пароль' value={password} onChangeText={setPassword} />
			<CustomButton theme={theme} buttonStyle={{width: 300}} label="Войти" onPress={handleLogin} />
			{errorMessage && <Text style={{marginTop: 10}}>{errorMessage}</Text>}
		</Animated.View>
  )
}

export default SettingsAuthorization

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 50,
        paddingVertical: 20,
    },
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		color: "black"
	}
})