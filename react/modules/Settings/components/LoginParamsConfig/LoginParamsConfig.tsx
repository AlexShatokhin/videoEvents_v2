import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Input from '../../../../UI/Input'
import CustomButton from '../../../../UI/CustomButton'
import { colors } from '../../../../../constants/colors'
import { useTypedDispatch, useTypedSelector } from '../../../../hooks/useRedux'
import { setPassword, setUsername } from '../../../../modules/Authorization/slice/AuthorizationSlice';

const LoginParamsConfig = () => {

	const {userName, password} = useTypedSelector(state => state.authorizationReducer)
	const {theme} = useTypedSelector(state => state.settingsReducer);
	const dispatch = useTypedDispatch();

	const saveData = async () => {
		dispatch(setUsername(userName))
		dispatch(setPassword(password))
	}

	const handleLogin = (login: string) => {
		dispatch(setUsername(login));
	}

	const handlePassword = (password: string) => {
		dispatch(setPassword(password));
	}

	return (
		<View style={styles.wrapper}>
			<View>
				<View style={styles.inputBlock}>
					<Text style={[styles.label, {color: theme === "dark" ? colors.white : colors.black}]}>Логин</Text>
					<Input theme={theme} value={userName} onChangeText={handleLogin} placeholder='Новый логин'/>
				</View>
				<View style={styles.inputBlock}>
					<Text style={[styles.label, {color: theme === "dark" ? colors.white : colors.black}]}>Пароль</Text>
					<Input theme={theme} value={password} onChangeText={handlePassword} placeholder='Новый пароль'/>
				</View>
			</View>

			<CustomButton theme={theme} label='Сохранить логин и пароль' onPress={saveData} />
		</View>
	)
}

export default LoginParamsConfig

const styles = StyleSheet.create({
	label: {
		fontSize: 18,
		color: colors.black,
		marginBottom: 5,
		marginLeft: 10
	},
	inputBlock: {
		marginBottom: 20,
		width: "100%"
	},
	wrapper: {
		maxWidth: 400
	}
})