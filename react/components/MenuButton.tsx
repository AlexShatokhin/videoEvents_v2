import React, {FC} from "react"
import PressableArea from "../UI/PressableArea"

type MenuButtonPropsType = {
    navigationPath: string,
    navigation: any,
    children: React.ReactNode,
    onPress?: () => void
}

const MenuButton : FC<MenuButtonPropsType> = ({navigationPath, children, navigation, onPress}) => {
    return (
        <PressableArea  onPress={onPress ? onPress : () => navigation.navigate(navigationPath)}>
            {children}
        </PressableArea>
    )
}

export default MenuButton