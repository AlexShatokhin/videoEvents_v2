import React, {FC} from "react"
import { StyleSheet } from "react-native"
import { Stack, Switch } from "@react-native-material/core"
import Label from "../../../UI/Label"

import { changeStateValue } from "../slice/AuthorizationSlice"
import { useTypedDispatch, useTypedSelector } from "../../../hooks/useRedux"

import { colors } from "../../../../constants/colors"
import { authorizationKeysType } from "../types/authorizationKeysType"

type AuthorizationSwitchPropsType = {
    id: authorizationKeysType,
    label: string,
    theme?: "light" | "dark"
}

const AuthorizationSwitch : FC<AuthorizationSwitchPropsType> = ({id, label, theme = "dark"}) => {
    const value = useTypedSelector(state => state.authorizationReducer[id]);
    const dispatch = useTypedDispatch();
    
    return (
        <Stack direction="column" style = {styles.remeberMeBlock}>
            <Label text={label} style={theme === "light" ? {color: colors.black} : {color: colors.white}}/>
            <Switch 
                value={value as boolean}
                onValueChange={(value: boolean) => {dispatch(changeStateValue({key: id, value}))}}
                trackColor={{false: colors.lightgrey, true: colors.deepblue}}
                thumbColor={colors.lightblue}/>
        </Stack>
    )
}

export default AuthorizationSwitch;

const styles = StyleSheet.create({
    remeberMeBlock: {
        width: 200,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        marginLeft: 30
    }
})