import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {persistReducer} from "redux-persist"

import authorizationReducer from "../react/modules/Authorization/slice/AuthorizationSlice"
import filterReducer from "../react/modules/Archive/components/FilterComponents/FilterSlice"
import archiveReducer from "../react/modules/Archive/slice/archiveSlice"
import eventsReducer from "../react/modules/Events/slice/EventsSlice"
import videoReducer from "../react/modules/Video/slice/videoSlice"
import settingsReducer from "../react/modules/Settings/slice/settingsSlice"
import { mmkvStorage } from "../react/services/mmkvStorage";
import { secureStorage } from "../react/services/secureStore";
import persistStore from "redux-persist/es/persistStore";

const settingPersistConfig = {
    key: "settings",
    storage: mmkvStorage
}

const authPersistConfig = {
    key: "auth",
    storage: secureStorage,
    whitelist: ["userName", "password", "ip", "serverIP"], 
}

const rootReducer = combineReducers({
    authorizationReducer: persistReducer(authPersistConfig, authorizationReducer),
    settingsReducer: persistReducer(settingPersistConfig, settingsReducer),
    filterReducer,
    archiveReducer,
    eventsReducer,
    videoReducer,
})

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false})
})

export default store;

export const persistor = persistStore(store)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch