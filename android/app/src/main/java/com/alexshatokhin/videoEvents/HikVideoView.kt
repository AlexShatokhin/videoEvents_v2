package com.alexshatokhin.videoEvents

import android.content.Context
import android.graphics.SurfaceTexture
import android.view.TextureView
import android.view.Surface
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

import com.hikvision.netsdk.*
import java.util.*

class HikVideoView(context: Context) : TextureView(context), TextureView.SurfaceTextureListener {

    private var fileName : String = "ch01_00000200372000100"
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
    private var startTime = "";
    private var endTime = "";

    // Surface link
    private var mSurface: Surface? = null

    init {
        surfaceTextureListener = this
    }

    fun setLogId(logId: Int) {
        this.mLogId = logId
    }

    fun setFileName(fileName: String) {
        this.mFileName = fileName
    }

    fun checkAndStart(channel: Int, startTime : String, stopTime: String){
        Log.e("HikDebug", "Сработал метод проверки")
        Log.e("HikDebug", "FileName:" + mFileName)
        Log.e("HikDebug", "LogId: " + mLogId)
        Log.e("HikDebug", "isSurfaceready: " + isSurfaceReady)
        if(mFileName.isNotEmpty() && mLogId != -1 && isSurfaceReady){
            stopPlay()
            startPlaybackByTime(channel, startTime, stopTime)
        }

    }

    private fun isPlaybackExists() : Boolean{
        if(playbackId == -1){
            Log.e("HikDebug","Запись не запущена")
            Log.e("HikDebug", "Возникла ошибка (${SDKGuider.g_sdkGuider.GetLastError_jni()})")
            return false
        }
        return true
    }

    fun startPlaybackByTime(channel: Int, startTimeString: String, endTimeString: String) {
        if (mSurface == null || !mSurface!!.isValid) {
            Log.e("HikDebug", "Ошибка: Surface не готов для воспроизведения")
            return
        }

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
                hWnd = mSurface
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
                this.channel = channel
                this.startTime = startTimeString
                this.endTime = endTimeString
                startTimer()
            }

        } catch (e: Exception) {
            Log.e("HikDebug", "Исключение при запуске Playback: ${e.message}")
        }
    }


    fun startPlay(logId: Int, fileName: String, surface: Surface){
        Log.d("HikDebug", "Surface valid: ${surface.isValid}")

        playbackLock.withLock {
            playbackId = SDKGuider.g_sdkGuider.m_comPBGuider.PlayBackByName_jni(logId, fileName, surface)
            if(isPlaybackExists())
                Log.i("HikDebug", "Playback найден (${playbackId})")

            if(playbackId != -1){
                startTimer()
            }
        }
    }

    fun continuePlay(){
        Log.i("HikDebug", "Продолжение")
        if(!isPlaybackExists()) return
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
        if(!isPlaybackExists()) return

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
        if(!isPlaybackExists()) return

        playbackLock.withLock {
            val result = SDKGuider.g_sdkGuider.m_comPBGuider.StopPlayBack_jni(playbackId)
            if(result){
                Log.i("HikDebug","Запись остановлена")
                playbackId = -1
                this.startTime = ""
                this.endTime = ""
                this.channel = -1
                stopTimer()
            } else {
                Log.e("HikDebug","Ошибка остановки " + SDKGuider.g_sdkGuider.GetLastError_jni())
            }
        }
    }

    fun seekTo(time : String, stopTime: String){
        Log.i("HikDebug", "Перемотка на $time до $stopTime")
        val savedChannel = channel
        stopPlay()
        startPlaybackByTime(savedChannel, time, stopTime)
    }

    fun download(){
        Log.i("HikDebug", "Скачивание")
        if(this.startTime == "" || this.endTime == "" || this.channel == -1){
            Log.e("HikDebug", "Ошибка скачивания, параметры записи не найдены")
            return
        }

        if(downloadHandle != -1){
            downloadLock.withLock {
                SDKGuider.g_sdkGuider.m_comPBGuider.StopGetFile_jni(downloadHandle);
                downloadHandle = -1;
                return;
            }
        }


        val timeStart = NET_DVR_TIME()
        val timeStop = NET_DVR_TIME()
        val sdf = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.CHINA)
        try {
            val startDoc = sdf.parse(this.startTime)
            val endDoc = sdf.parse(this.endTime)

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
            val strFileName = "SMART-PATROL_" + date
            downloadHandle = SDKGuider.g_sdkGuider.m_comPBGuider.GetFileByTime_jni(mLogId, this.channel, timeStart, timeStop, "/mnt/sdcard/download/"+strFileName+".mp4")

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
            if (playbackId == -1) return
            progress = SDKGuider.g_sdkGuider.m_comPBGuider.GetPlayBackPos_jni(playbackId)
            Log.i("HikDebug", "Прогресс: ${progress}")
            if(progress < 0) return

            val event = Arguments.createMap()
            event.putInt("currentProgress", progress)

            val reactContext = context as ReactContext
            reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(
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
                downloadHandle = -1
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

    fun startTimer() { handler.post(progressRunnable) }
    fun stopTimer() { handler.removeCallbacks(progressRunnable) }
    fun startDownload(){ handler.post(downloadProgressRunnable) }
    fun stopDownload(){ handler.removeCallbacks(downloadProgressRunnable) }


    // === 5. РЕАЛИЗАЦИЯ МЕТОДОВ TextureView.SurfaceTextureListener ===

    override fun onSurfaceTextureAvailable(surfaceTexture: SurfaceTexture, width: Int, height: Int) {
        // Создаем Surface на основе полученной текстуры
        mSurface = Surface(surfaceTexture)
        isSurfaceReady = true

    }

    override fun onSurfaceTextureSizeChanged(surfaceTexture: SurfaceTexture, width: Int, height: Int) {
        // Игнорируем или обрабатываем ресайз, если необходимо
    }

    override fun onSurfaceTextureDestroyed(surfaceTexture: SurfaceTexture): Boolean {
        isSurfaceReady = false
        stopTimer()
        stopPlay()

        // Освобождаем нативный Surface
        mSurface?.release()
        mSurface = null

        return true // Система сама очистит внутренний SurfaceTexture
    }

    override fun onSurfaceTextureUpdated(surfaceTexture: SurfaceTexture) {
        // Вызывается при обновлении кадров, оставляем пустым
    }
}