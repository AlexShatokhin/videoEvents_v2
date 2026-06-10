package com.hikvision.jna;

import com.sun.jna.Library;
import com.sun.jna.Native;

public interface PlayCtrlJNA extends Library {
    PlayCtrlJNA INSTANCE = (PlayCtrlJNA) Native.loadLibrary("PlayCtrl", PlayCtrlJNA.class);

    // nIntelType: bitmask of _PLAYM4_PRIDATA_RENDER values; bEnable=0 disables rendering
    boolean PlayM4_RenderPrivateData(int nPort, int nIntelType, int bEnable);
    boolean PlayM4_RenderPrivateDataEx(int nPort, int nIntelType, int nSubType, int bEnable);
}
