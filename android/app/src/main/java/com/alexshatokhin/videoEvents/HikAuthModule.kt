package com.alexshatokhin.videoEvents

import android.widget.Toast
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.hikvision.Control.SDKGuider
import android.util.Log

class HikAuthModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "HikAuth"

    @ReactMethod
    fun login(promise: Promise){
        try {
            val isNetInit = SDKGuider()
            val dmGuider = SDKGuider.g_sdkGuider.m_comDMGuider


            val deviceItem = dmGuider.DeviceItem()
            deviceItem.m_szDevName = "Данный регистратор"
            deviceItem.m_struNetInfo = dmGuider.DevNetInfo(
                    "192.168.177.1",
                    "8000",
                    "admin",
                    "Odmin13579!"
            )

            dmGuider.setCurrSelectDevIndex(0)

            Log.e("HikDebug", "NET_DVR_Init status: $isNetInit")

            for(item in dmGuider.getDevList()){
                Log.e("HikDebug", "Dev Name: ${item.m_szDevName} IP: ${item.m_struNetInfo.m_szIp}")
            }

            Log.e("HikDebug", "Попытка входа для IP: ${deviceItem.m_struNetInfo.m_szIp}")
            if (dmGuider.login_v40_jna("Данный регистратор", deviceItem.m_struNetInfo)) {
                val deviceInfo = SDKGuider.g_sdkGuider.m_comDMGuider.getCurrSelectDev()
                if(deviceInfo == null){
                    Log.e("HikDebug", "Получение информации о устройстве (logId) безуспешно")
                    return
                }

                SDKGuider.g_sdkGuider.m_iLogID = deviceInfo.m_lUserID
                promise.resolve(deviceInfo.m_lUserID)
            } else {
                val errorCode = SDKGuider.g_sdkGuider.GetLastError_jni()
                promise.reject("LOGIN_ERROR", "Ошибка авторизации! Код: $errorCode")
            }
        } catch (e : Exception) {
            promise.reject("EXCEPTION", e.message)
        }
    }

}