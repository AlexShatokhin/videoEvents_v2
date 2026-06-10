package com.alexshatokhin.videoEvents

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfo;
import com.facebook.react.module.model.ReactModuleInfoProvider;
import com.facebook.react.uimanager.ViewManager
import com.alexshatokhin.videoEvents.HikVideoManager
import com.alexshatokhin.videoEvents.HikAuthModule
import com.alexshatokhin.videoEvents.HikGetFileModule

class HikVideoPackage : ReactPackage {
    override fun createViewManagers(reactContext: ReactApplicationContext) : List<ViewManager<*, *>> {
        return listOf(HikVideoManager())
    }

    override fun createNativeModules(reactContext: ReactApplicationContext) : List<NativeModule> {
        return listOf(HikAuthModule(reactContext), HikGetFileModule(reactContext))
    }
}