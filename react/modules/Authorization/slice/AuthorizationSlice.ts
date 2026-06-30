import { createSlice, PayloadAction } from "@reduxjs/toolkit";
//@ts-ignore
import {APP_USERNAME, PASSWORD, IP, SERVER_IP, CONNECTION_TYPE} from "@env"


type initialStateType = {
    userName: string,
    password: string,
    ip: string,
    serverIP: string,
    connectionType: "wifi" | "4g"
}

const initialState: initialStateType = {
    userName: APP_USERNAME,
    password: PASSWORD,
    ip: IP,
    serverIP: SERVER_IP,
    connectionType: CONNECTION_TYPE
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
       setConnectionType: (state, action : PayloadAction<"wifi" | "4g">) => {
            state.connectionType = action.payload
       },          
    }
})

const {actions, reducer} = authorizationSlice;

export default reducer;
export const {setUsername, setPassword, setIP, setServerIP, setConnectionType} = actions;