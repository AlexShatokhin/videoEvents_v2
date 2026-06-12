package com.alexshatokhin.videoEvents

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.alexshatokhin.videoEvents.HikVideoView
import android.util.Log

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.MapBuilder

class HikVideoManager : SimpleViewManager<HikVideoView>() {
    override fun getName() : String {
        return "HikVideoView"
    }

    override fun createViewInstance(reactContext: ThemedReactContext) : HikVideoView {
        return HikVideoView(reactContext)
    }

    @ReactProp(name = "logId", defaultInt = -1)
    fun setLogId(view: HikVideoView, logId: Int){
        Log.e("HikDebug", "Получен пропс logId ${logId}")
        view.setLogId(logId)
    }

    @ReactProp(name = "fileName")
    fun setFileName(view: HikVideoView, fileName: String?){
        Log.e("HikDebug", "Получен пропс filename ${fileName}")
        if(fileName != null) {
            view.setFileName(fileName)
        } else {
            view.setFileName("ch01_00000200517000000")
        }

    }

    override fun receiveCommand(view : HikVideoView, commandId: String, args: ReadableArray?){

        when (commandId){
            "play" -> {
                Log.i("HikDebug", "PLAY")
                view.checkAndStart()
            }
            "continue" -> {
                view.continuePlay()
            }
            "pause" -> {
                view.pausePlay()
            }
            "download" -> {
                view.download()
            }
            "getVideo" -> {
                val timeFrom = args?.getString(0)
                val timeTo = args?.getString(1)
                Log.i("HikDebug", "Получение видео " + timeFrom + " - " + timeTo)
                if(timeFrom != null && timeTo != null){
                    view.checkAndStart()
                }

            }
            "seekTo" -> {
                val time = args?.getString(0)
                val stopTime = args?.getString(1) // Получаем второй аргумент
                if (time != null && stopTime != null) {
                    view.seekTo(time, stopTime)
                } else {
                    // Если аргументы отсутствуют, можно логировать ошибку или использовать значения по умолчанию
                    Log.e("HikDebug", "Ошибка: seekTo вызван без необходимых аргументов времени.")
                }
            }
            else -> super.receiveCommand(view, commandId, args)
        }
    }
    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any>? {
        @Suppress("UNCHECKED_CAST")
        return MapBuilder.builder<String, Any>()
            .put("topVideoProgress", MapBuilder.of("registrationName", "onProgress"))
            .build() as MutableMap<String, Any>?
    }
}
