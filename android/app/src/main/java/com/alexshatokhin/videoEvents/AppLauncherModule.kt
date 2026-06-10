package com.alexshatokhin.videoEvents

import android.content.ComponentName
import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AppLauncherModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AppLauncher"
    }

    @ReactMethod
    fun openHikDemo() {
        val intent = Intent().apply {
            component = ComponentName(
                "com.hik.netsdk.SimpleDemo",
                "com.hik.netsdk.SimpleDemo.View.MainActivity"
            )
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        reactContext.startActivity(intent)
    }
}
