package com.alexshatokhin.videoEvents;

import android.content.Context
import android.graphics.PixelFormat
import android.view.SurfaceHolder
import android.view.SurfaceView

import android.util.Log
import com.hikvision.Control.SDKGuider

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter

import android.os.Handler
import android.os.Looper
import java.lang.Runnable

import java.util.concurrent.locks.ReentrantLock
import java.util.concurrent.locks.Lock
import kotlin.concurrent.withLock

import java.text.SimpleDateFormat
import java.util.Date

import java.nio.ByteBuffer
import java.nio.ByteOrder

import android.view.Surface
import com.hikvision.netsdk.*
import java.util.*

class HikVideoView(context: Context) : SurfaceView(context), SurfaceHolder.Callback {


    private var fileName : String = "ch01_00000200372000100" //ch01_00000200517000000
    private var mLogId: Int = -1
    private var mFileName: String = ""
    private var playbackId: Int = -1
    private val playbackLock: Lock = ReentrantLock(true)
    private var isSurfaceReady = false
    private var downloadHandle: Int = -1
    private val downloadLock : Lock = ReentrantLock(true)
    private var progress = 0
    private var downloadProgress = 0

    private var channel = 2

    init {
        holder.addCallback(this)
        setZOrderOnTop(true)
        holder.setFormat(PixelFormat.TRANSLUCENT)
    }


    fun setLogId(logId: Int) {
        this.mLogId = logId
        //checkAndStart()
    }

    fun setFileName(fileName: String) {
        this.mFileName = fileName
    }

    fun checkAndStart(){
        Log.e("HikDebug", "Сработал метод проверки")
        Log.e("HikDebug", "FileName:" + mFileName)
        Log.e("HikDebug", "LogId: " + mLogId)
        Log.e("HikDebug", "isSurfaceready: " + isSurfaceReady)
        if(mFileName.isNotEmpty() && mLogId != -1 && isSurfaceReady)
            startPlaybackByTime("2026-04-07 8:50:00", "2026-04-07 9:30:00")
    }
    private fun isPlaybackExists() : Boolean{
        if(playbackId == -1){
            Log.e("HikDebug","Запись не запущена")
            Log.e("HikDebug", "Возникла ошибка (${SDKGuider.g_sdkGuider.GetLastError_jni()})")
            return false
        }
        return true
    }

    fun startPlaybackByTime(startTimeString: String, endTimeString: String) {
        val deviceInfo = SDKGuider.g_sdkGuider.m_comDMGuider.getCurrSelectDev();

        val timeStart = NET_DVR_TIME()
        val timeStop = NET_DVR_TIME()

        val sdf = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.CHINA)
        Log.i("HikDebug", "UserID in device Info: " + deviceInfo.m_lUserID)
        try {
            val startDoc = sdf.parse(startTimeString)
            val endDoc = sdf.parse(endTimeString)

            if (startDoc == null || endDoc == null) {
                Log.e("HikDebug", "Ошибка: не удалось распарсить даты")
                return
            }

            val calStart = Calendar.getInstance().apply { time = startDoc }
            val calEnd = Calendar.getInstance().apply { time = endDoc }


            if (calEnd.before(calStart)) {
                Log.e("HikDebug", "Конечное время меньше начального")

                return
            }


            SDKGuider.g_sdkGuider.m_comPBGuider.ConvertToTime(timeStart, calStart)
            SDKGuider.g_sdkGuider.m_comPBGuider.ConvertToTime(timeStop, calEnd)


            val vodParam = NET_DVR_VOD_PARA().apply {
                struBeginTime = timeStart
                struEndTime = timeStop
                byStreamType = 1.toByte()
                struIDInfo.dwChannel = channel
                hWnd = holder.surface
            }


            if (playbackId != -1) {
                Log.w("HikDebug", "Воспроизведение уже запущено, сначала остановите его")
                return
            }


            playbackId = SDKGuider.g_sdkGuider.m_comPBGuider.PlayBackByTime_v40_jni(deviceInfo.m_lUserID, vodParam)

            if (playbackId < 0) {
                val error = SDKGuider.g_sdkGuider.GetLastError_jni()
                Log.e("HikDebug", "Ошибка PlayBackByTime: $error")
            } else {
                Log.d("HikDebug", "Воспроизведение по времени запущено успешно, ID: $playbackId")

            }

        } catch (e: Exception) {
            Log.e("HikDebug", "Исключение при запуске Playback: ${e.message}")
        }
    }


    fun startPlay(logId: Int, fileName: String, holder : SurfaceHolder){
        Log.d("HikDebug", "Surface valid: ${holder.surface.isValid}")

        playbackLock.withLock {
            playbackId = SDKGuider.g_sdkGuider.m_comPBGuider.PlayBackByName_jni(logId, fileName, holder.surface)
            if(isPlaybackExists())
                Log.i("HikDebug", "Playback найден (${playbackId})")

            if(playbackId != -1){
                startTimer()
            }
        }


    }
    fun continuePlay(){
        Log.i("HikDebug", "Продолжение")
        if(!isPlaybackExists()){
            return
        }
        playbackLock.withLock {
            val result = SDKGuider.g_sdkGuider.m_comPBGuider.PlayBackContinueByTime_v40_jni(mLogId, playbackId)
            if(result != -1){
                Log.i("HikDebug","Запись продолжается")
            } else {
                Log.e("HikDebug","Ошибка записи " + SDKGuider.g_sdkGuider.GetLastError_jni())
            }
        }


    }
    fun pausePlay(){
        Log.i("HikDebug", "Пауза")
        if(!isPlaybackExists()){
            return
        }

        playbackLock.withLock {
            val result = SDKGuider.g_sdkGuider.m_comPBGuider.PlayBackPauseByTime_v40_jni(mLogId, playbackId)
            if(result != -1){
                Log.i("HikDebug","Запись на паузе " + SDKGuider.g_sdkGuider.GetLastError_jni())
            } else {
                Log.e("HikDebug","Ошибка паузы " + SDKGuider.g_sdkGuider.GetLastError_jni())
            }
        }

    }
    fun stopPlay(){
        Log.i("HikDebug", "Стоп")
        if(!isPlaybackExists()){
            return
        }

        playbackLock.withLock {
            val result = SDKGuider.g_sdkGuider.m_comPBGuider.StopPlayBack_jni(playbackId)
            if(result){
                Log.i("HikDebug","Запись остановлена")
                playbackId = -1
            } else {
                Log.e("HikDebug","Ошибка остановки " + SDKGuider.g_sdkGuider.GetLastError_jni())
            }
        }

    }
    fun seekTo(time : String, stopTime: String){
        Log.i("HikDebug", "Перемотка на $time до $stopTime")
        stopPlay()
        startPlaybackByTime(time, stopTime)
    }
    fun download(){
        Log.i("HikDebug", "Скачивание")
        if(downloadHandle != -1){
            downloadLock.withLock {
                SDKGuider.g_sdkGuider.m_comPBGuider.StopGetFile_jni(downloadHandle);
                downloadHandle = -1;
            }
        }
/*
        val date = SimpleDateFormat("yyyyMMddhhssmm").format(Date())
        val strFileName = "lustra_" + date
        downloadHandle = SDKGuider.g_sdkGuider.m_comPBGuider.GetFileByName_jni(mLogId,mFileName, "/mnt/sdcard/download/"+strFileName+".mp4")
        if(downloadHandle == -1){
            Log.e("HikDebug", "Ошибка скачивания")
        } else {
            startDownload()
        }

*/
        val startTimeString = "2026-04-07 8:50:00"
        val endTimeString = "2026-04-07 9:30:00"

        val timeStart = NET_DVR_TIME()
        val timeStop = NET_DVR_TIME()

        val sdf = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.CHINA)
        try {
            val startDoc = sdf.parse(startTimeString)
            val endDoc = sdf.parse(endTimeString)

            if (startDoc == null || endDoc == null) {
                Log.e("HikDebug", "Ошибка: не удалось распарсить даты для скачивания")
                return
            }

            val calStart = Calendar.getInstance().apply { time = startDoc }
            val calEnd = Calendar.getInstance().apply { time = endDoc }


            if (calEnd.before(calStart)) {
                Log.e("HikDebug", "Конечное время меньше начального при скачивании")

                return
            }


            SDKGuider.g_sdkGuider.m_comPBGuider.ConvertToTime(timeStart, calStart)
            SDKGuider.g_sdkGuider.m_comPBGuider.ConvertToTime(timeStop, calEnd)

            val date = SimpleDateFormat("yyyyMMddhhssmm").format(Date())
            val strFileName = "lustra_" + date
            downloadHandle = SDKGuider.g_sdkGuider.m_comPBGuider.GetFileByTime_jni(mLogId, channel, timeStart, timeStop, "/mnt/sdcard/download/"+strFileName+".mp4")

            if(downloadHandle == -1){
                Log.e("HikDebug", "Ошибка скачивания")
            } else {
                startDownload()
            }

        } catch (e: Exception) {
            Log.e("HikDebug", "Исключение при запуске Playback: ${e.message}")
        }


    }

    fun emitVideoProgress() {
        playbackLock.withLock {
            progress = SDKGuider.g_sdkGuider.m_comPBGuider.GetPlayBackPos_jni(playbackId)

            if(progress < 0)
                return

            val event = Arguments.createMap()
            event.putInt("currentProgress", progress)

            val reactContext = context as ReactContext
            reactContext.getJSModule(
                RCTEventEmitter::class.java).receiveEvent(
                this.id,
                "topVideoProgress",
                event
            )
        }

    }
    fun emitVideoDownloadProgress() {
        downloadLock.withLock {
            downloadProgress = SDKGuider.g_sdkGuider.m_comPBGuider.GetDownloadPos_jni(downloadHandle)

            if(downloadProgress < 0 || downloadProgress > 100){
                Log.e("HikDebug", "Ошибка скачивания " + SDKGuider.g_sdkGuider.GetLastError_jni())
                SDKGuider.g_sdkGuider.m_comPBGuider.StopGetFile_jni(downloadHandle);
            }

            Log.i("HikDebug", "Прогресс скачивания: " + downloadProgress)

            if(downloadProgress == 100){
                SDKGuider.g_sdkGuider.m_comPBGuider.StopGetFile_jni(downloadHandle);
                Log.i("HikDebug", "Скачивание завершено успешно!")
            }

        }

    }


    private val handler = Handler(Looper.getMainLooper())
    private val progressRunnable = object : Runnable {
        override fun run() {
            if (playbackId != -1) {
                emitVideoProgress()
            }

            handler.postDelayed(this, 700)
        }
    }
    private val downloadProgressRunnable = object : Runnable {
        override fun run() {
            if (downloadHandle != -1) {
                emitVideoDownloadProgress()
            }

            handler.postDelayed(this, 1000)
        }
    }

    fun startTimer() {
        handler.post(progressRunnable)
    }

    fun stopTimer() {
        handler.removeCallbacks(progressRunnable)
    }

    fun startDownload(){
        handler.post(downloadProgressRunnable)
    }

    fun stopDownload(){
        handler.removeCallbacks(downloadProgressRunnable)
    }



    override fun surfaceChanged(
        holder: SurfaceHolder,
        format: Int,
        width: Int,
        height: Int
    ) {

    }

    override fun surfaceCreated(holder: SurfaceHolder) {
        isSurfaceReady = true
    }

    override fun surfaceDestroyed(holder: SurfaceHolder) {
        isSurfaceReady = false
        stopTimer()
        stopPlay()
    }

}
