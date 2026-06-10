import React, { memo } from "react";
import MoreButton from "../../UI/MoreButton";
import { ActivityIndicator } from "@react-native-material/core";
import { colors } from "../../../../../constants/colors";

interface ArchiveListFooterProps {
    loadingStatus: string; 
    more: boolean; 
    onMorePress: () => void; 
} 

const ArchiveListFooter = ({ loadingStatus, more, onMorePress }: ArchiveListFooterProps) => {
    return (
        <>
            <MoreButton
                onPressHandler={onMorePress}
                visible={more && loadingStatus !== "loading"} 
            />
            {loadingStatus === "loading" && 
                <ActivityIndicator size={60} color={colors.lightblue} />
            }
        </>
    );
};

export default memo(ArchiveListFooter)