package com.alexshatokhin.videoEvents

import android.util.Log
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class HikVisionPackage : ReactPackage {

    companion object {
        const val TAG = "HikVisionPackage"
    }

    init {
        Log.e(TAG, "🚀 HikVisionPackage class loaded!")
        println("🚀 HikVisionPackage class loaded - console output!")
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }

    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        Log.e(TAG, "🔧 createNativeModules called")
        println("🔧 createNativeModules called - console output!")
        
        try {
            Log.e(TAG, "Creating AppLauncherModule...")
            val launcherModule = AppLauncherModule(reactContext)
            Log.e(TAG, "✅ SUCCESS: Created AppLauncherModule with name: ${launcherModule.name}")
            println("✅ SUCCESS: Created AppLauncherModule with name: ${launcherModule.name}")


            return listOf(launcherModule)
        } catch (e: Exception) {
            Log.e(TAG, "❌ ERROR creating HikVisionModule: ${e.message}")
            Log.e(TAG, "❌ Stack trace: ${e.stackTrace.joinToString("\n")}")
            println("❌ ERROR creating HikVisionModule: ${e.message}")
            throw e
        }
    }
}