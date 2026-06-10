import { createSlice, PayloadAction } from "@reduxjs/toolkit";
//@ts-ignore
import {APP_USERNAME, PASSWORD, IP, SERVER_IP} from "@env"


type initialStateType = {
    userName: string,
    password: string,
    ip: string,
    serverIP: string,
}

const initialState: initialStateType = {
    userName: APP_USERNAME,
    password: PASSWORD,
    ip: IP,
    serverIP: SERVER_IP,
}

const authorizationSlice = createSlice({
    name: "authorization",
    initialState,
    reducers: {
       setUsername: (state, action : PayloadAction<string>) => {
            state.userName = action.payload
       },
       setPassword: (state, action : PayloadAction<string>) => {
            state.password = action.payload
       },
       setIP: (state, action : PayloadAction<string>) => {
            state.ip = action.payload
       },
       setServerIP: (state, action : PayloadAction<string>) => {
            state.serverIP = action.payload
       },             
    }
})

const {actions, reducer} = authorizationSlice;

export default reducer;
export const {setUsername, setPassword, setIP, setServerIP} = actions;