import React, {FC, ReactNode} from "react";
import { StyleSheet, Text } from "react-native";
import { Stack } from "@react-native-material/core";
import CategoryName from "../modules/Events/UI/CategoryName";
import { eventsEnum } from "../types/eventsEnum";
import getColorByEventType from "../helpers/getColorByEventType";

type ModalInformationPropsType = {
    information: {
        [key: string]: string | ReactNode
    },
    type: eventsEnum
}

const ModalInformation : FC<ModalInformationPropsType> = ({information, type}) => {
    const renderInformation = () => {
        return Object.keys(information).map((key) => {
            return (
                <Text key={key} style = {styles.modalInformationText}>
                    <CategoryName>{key + ": "}</CategoryName> {information[key]}
                </Text>
            )
        })
    }


    return  (
        <Stack style = {[styles.informationBlockWrapper, {borderColor: getColorByEventType(type)}]}>
            <Stack style = {styles.informationBlock}>
                {renderInformation()}
            </Stack>
    </Stack>
    )
}

export default ModalInformation;

const styles = StyleSheet.create({
    modalInformationText: {
        fontSize: 18,
        marginLeft: 10
    },
    informationBlockWrapper: {
        borderTopWidth: 3, 
        height: "35%", 
        paddingHorizontal: 5,
        marginTop: 10,
        paddingTop: 10
    },

    informationBlock: {
        display: "flex", 
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between", 
        height: 80,
    }
})