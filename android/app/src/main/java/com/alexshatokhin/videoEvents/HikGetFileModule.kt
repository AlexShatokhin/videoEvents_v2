package com.alexshatokhin.videoEvents

import android.util.Log
import com.facebook.react.bridge.*
import com.hikvision.Control.SDKGuider
import com.hikvision.netsdk.*
import java.text.SimpleDateFormat
import java.util.*

class HikGetFileModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "HikGetFile"

    @ReactMethod
    fun getFiles(channel: Int, startTime: String, endTime: String, promise: Promise) {
        val fileList = Arguments.createArray()

        val userID = SDKGuider.g_sdkGuider.m_iLogID
        if (userID < 0) {
            promise.reject("ERR_AUTH", "Пользователь не авторизован")
            return
        }

        val lpSearchInfo = NET_DVR_FILECOND()
        val timeStart = NET_DVR_TIME()
        val timeStop = NET_DVR_TIME()


        val sdf = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.CHINA)

        val startDoc = sdf.parse(startTime)
        val endDoc = sdf.parse(endTime)

        val calStart = Calendar.getInstance()
        val calEnd = Calendar.getInstance()
        if (startDoc != null) calStart.time = startDoc
        if (endDoc != null) calEnd.time = endDoc

        SDKGuider.g_sdkGuider.m_comPBGuider.ConvertToTime(timeStart, calStart)
        SDKGuider.g_sdkGuider.m_comPBGuider.ConvertToTime(timeStop, calEnd)

        lpSearchInfo.lChannel = channel
        lpSearchInfo.dwFileType = 0xff
        lpSearchInfo.dwIsLocked = 0xff
        lpSearchInfo.dwUseCardNo = 0
        lpSearchInfo.struStartTime = timeStart
        lpSearchInfo.struStopTime = timeStop

        val m_iFindHandle = SDKGuider.g_sdkGuider.m_comPBGuider.FindFile_V30_jni(userID, lpSearchInfo)

        if (m_iFindHandle == -1) {
            promise.reject("ERR_FIND", "Ошибка поиска: ${HCNetSDK.getInstance().NET_DVR_GetLastError()}")
            return
        }

        val struFindData = NET_DVR_FINDDATA_V30()
        var iFindNext = 0

        while (true) {
            iFindNext = SDKGuider.g_sdkGuider.m_comPBGuider.FindNextFile_V30_jni(m_iFindHandle, struFindData)

            if (iFindNext == HCNetSDK.NET_DVR_FILE_SUCCESS) {
                val fileMap = Arguments.createMap()

                // Декодируем имя файла из байтов в строку
                val fileName = getActualString(struFindData.sFileName)

                fileMap.putString("name", fileName)
                fileMap.putString("startTime", formatHikTime(struFindData.struStartTime))
                fileMap.putString("endTime", formatHikTime(struFindData.struStopTime))
                fileMap.putInt("size", struFindData.dwFileSize)

                fileList.pushMap(fileMap)
            } else if (iFindNext == HCNetSDK.NET_DVR_ISFINDING) {
                continue
            } else {
                break
            }
        }

        SDKGuider.g_sdkGuider.m_comPBGuider.FindClose_V30_jni(m_iFindHandle)
        promise.resolve(fileList)
    }


    private fun getActualString(data: ByteArray): String {
        val i = data.indexOf(0.toByte())
        val length = if (i == -1) data.size else i
        return String(data, 0, length)
    }


    private fun formatHikTime(time: NET_DVR_TIME): String {
        return String.format("%04d-%02d-%02d %02d:%02d:%02d",
            time.dwYear, time.dwMonth, time.dwDay,
            time.dwHour, time.dwMinute, time.dwSecond)
    }
}