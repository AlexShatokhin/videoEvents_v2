package com.hikvision.Control;

import android.util.Log;

import com.hikvision.jna.HCNetSDKJNAInstance;
import com.hikvision.netsdk.HCNetSDK;
import com.hikvision.netsdk.INT_PTR;

public class SDKGuider{
    static public SDKGuider g_sdkGuider = new SDKGuider();
    public int m_iLogID = -1;
    //ISAPI协议透传接口
    public DevTransportGuider m_comTransportGuider = new com.hikvision.Control.DevTransportGuider();
    //串口透传接口
    public DevPassThroughGuider m_comSerialTransGuider = new com.hikvision.Control.DevPassThroughGuider();
    //设备管理接口
    public com.hikvision.Control.DevManageGuider m_comDMGuider = new com.hikvision.Control.DevManageGuider();
    //设备报警接口
    public DevAlarmGuider m_comDevAlarmGuider = new DevAlarmGuider();
    //关于回放接口
    public com.hikvision.Control.DevPlayBackGuider m_comPBGuider = new com.hikvision.Control.DevPlayBackGuider();
    //预览相关接口
    public com.hikvision.Control.DevPreviewGuider m_comPreviewGuider = new com.hikvision.Control.DevPreviewGuider();
    //SDK初始化
    public SDKGuider(){
        initNetSdk_jna();
    }
    //清理
    public void finalize()
    {
        cleanupNetSdk_jna();
    }

    /**
     * @fn GetLastError_jni
     * @param
     * @return 返回错误码
     * @brief 获取SDK错误码
     */
    public int GetLastError_jni()
    {
        return HCNetSDK.getInstance().NET_DVR_GetLastError();
    }

    public String GetErrorMsg_jni(INT_PTR errorCode)
    {
        return HCNetSDK.getInstance().NET_DVR_GetErrorMsg(errorCode);
    }

    /**
     * @fn initNetSdk_jni
     * @param
     * @return 成功初始化NetSDK,返回True,否则False
     * @brief NetSDK初始化.
     */
    private boolean initNetSdk_jni()
    {
        // init net sdk
        if (!HCNetSDK.getInstance().NET_DVR_Init())
        {
            Log.e("[NetSDKSimpleDemo]", "HCNetSDK init is failed!");
            return false;
        }
        HCNetSDK.getInstance().NET_DVR_SetLogToFile(3, "/mnt/sdcard/sdklog/", true);
        return true;
    }

    /**
     * @fn initNetSdk_jna
     * @param
     * @return 成功初始化NetSDK,返回True,否则False
     * @brief NetSDK初始化.
     */
    private boolean initNetSdk_jna()
    {
        // init net sdk
        if (!HCNetSDKJNAInstance.getInstance().NET_DVR_Init())
        {
            Log.e("[NetSDKSimpleDemo]", "HCNetSDK init is failed!");
            return false;
        }
        HCNetSDKJNAInstance.getInstance().NET_DVR_SetLogToFile(3, "/mnt/sdcard/sdklog/", true);
        return true;
    }

    /**
     * @fn cleanupNetSdk_jni
     * @param
     * @return 成功返回True,否则False
     * @brief NetSDK反初始化.
     */
    private boolean cleanupNetSdk_jni()
    {
        // init net sdk
        if (!HCNetSDK.getInstance().NET_DVR_Cleanup())
        {
            Log.e("[NetSDKSimpleDemo]", "HCNetSDK cleanup is failed!");
            return false;
        }
        return true;
    }

    /**
     * @fn cleanupNetSdk_jna
     * @param
     * @return 成功返回True,否则False
     * @brief NetSDK反初始化.
     */
    private boolean cleanupNetSdk_jna()
    {
        // init net sdk
        if (!HCNetSDKJNAInstance.getInstance().NET_DVR_Cleanup())
        {
            Log.e("[NetSDKSimpleDemo]", "HCNetSDK cleanup is failed!");
            return false;
        }
        return true;
    }
}
