import { Pressable, StyleSheet} from 'react-native'
import React, { FC, useEffect, useState } from 'react'

type HiddenPressableElementsPropsType = {
	navigation: any;
	loadingStatus: "loading" | "again" | "success" | "error";
}

const HiddenPressableElements : FC<HiddenPressableElementsPropsType> = ({navigation, loadingStatus}) => {
	const [pressedBlocks, setPressedBlocks] = useState<string[]>([]);
	
	useEffect(() => {
		const isAllBlocksPressedCorrectly = pressedBlocks.length === 4 && pressedBlocks.includes("12") && pressedBlocks.includes("23") && pressedBlocks.includes("34") && pressedBlocks.includes("41");
		if (isAllBlocksPressedCorrectly) {
			navigation.navigate("AuthorizationPage", {message: "Вы попали на страницу авторизации!"});
			setPressedBlocks([]);
		}
		if(pressedBlocks.length === 4){
			setPressedBlocks([]);
		}
	}, [pressedBlocks])

	useEffect(() => {
		setPressedBlocks([]);
	}, [loadingStatus]);

	return (
		<>
			<Pressable style={[styles.pressableBlock, styles.block1]} onPress={() => setPressedBlocks([...pressedBlocks, "12"])}/>
			<Pressable style={[styles.pressableBlock, styles.block2]} onPress={() => setPressedBlocks([...pressedBlocks, "23"])}/>
			<Pressable style={[styles.pressableBlock, styles.block3]} onPress={() => setPressedBlocks([...pressedBlocks, "34"])}/>
			<Pressable style={[styles.pressableBlock, styles.block4]} onPress={() => setPressedBlocks([...pressedBlocks, "41"])}/>	
		</>
	)
}

export default HiddenPressableElements

const styles = StyleSheet.create({
	pressableBlock: {
		width: 400,
		height: 300,
		borderWidth: 0,
		borderColor: "transparent",
		backgroundColor: "transparent",
	},
	block1: {
		position: "absolute",
		top: 0,
		left: 0,
	},
	block2: {
		position: "absolute",
		top: 0,
		right: 0,
	},
	block3: {
		position: "absolute",
		bottom: 0,
		left: 0,
	},
	block4: {
		position: "absolute",
		bottom: 0,
		right: 0,
	},
})