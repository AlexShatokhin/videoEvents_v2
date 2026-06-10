import React, { useEffect, useState, FC } from "react"
import { Stack } from "@react-native-material/core"
import { colors } from "../../../constants/colors"
import { useTypedSelector } from "../../hooks/useRedux"

import { StyleSheet, Modal, View, Text, Alert } from "react-native"
import logic from "../../modules/logic/logic"
import convertUriToImageType from "../../helpers/convertUriToImageType"
import GalleryImageItem from "../Gallery/GalleryImageItem"
import getAllImages from "../../modules/Archive/helpers/getAllImages"
import ImageViewing from "../../modules/Archive/components/ImageViewing/ImageViewing"
import ModalInformation from "../../UI/ModalInformation"
import formatDateToFetch from "../../helpers/formatDateToFetch"
import { Pressable, ScrollView } from "react-native-gesture-handler"
import NotFoundText from "../../UI/NotFoundText"
import ShakedText from "../../UI/ShakedText"
import ModalEventWrapper from "./ModalEventWrapper"

import { EventInformationType } from "../../types/eventInformationType"
import { ImageResponseType } from "../../types/imageResponseType"
import { ImageEventType } from "../../types/dateItemsType"
import { convertCameraIDToCameraDirection } from "../../helpers/convertCameraDirectionToCameraID"
import { eventsEnum } from "../../types/eventsEnum"
import { ActivityIndicator } from "react-native"

import getLabelByValue from "../../helpers/getLabelByValue"
import { downloadAllImages } from "./utils/saveImages"
import getColorByEventType from "../../helpers/getColorByEventType"
import { MaterialIcons } from "@expo/vector-icons"

import MapView from 'react-native-maps';

type ModalEventPropsType = {
    selectedEventItem: EventInformationType | undefined,
    toggleItemsDisabling: () => any
}

const ModalEvent : FC<ModalEventPropsType> = ({selectedEventItem, toggleItemsDisabling}) => {
    const [content, setContent] = useState<ImageEventType[]>([]);
    const [imageLoadingStatus, setImageLoadingStatus] = useState<"loading" | "idle">("idle");
    const [imageVisibleState, setImageVisibleState] = useState<boolean>(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
    const [downloadProgress, setDownloadProgress] = useState<{visible: boolean, current: number, total: number}>({
        visible: false,
        current: 0,
        total: 0
    });
    const {ip, password, userName} = useTypedSelector(state => state.authorizationReducer);
    const {cameras} = useTypedSelector(state => state.settingsReducer)
    const {search, getFile} = logic(ip, userName, password);

    useEffect(() => {
        if(selectedEventItem === undefined) return;
        getImages();
    }, [selectedEventItem])

    const handleImagesDownloading = async () => {
        try {
            // Показываем прогресс
            setDownloadProgress({ visible: true, current: 0, total: content.length });
            
            // Скачиваем с отображением прогресса
            await downloadAllImages(content, (current, total) => {
                setDownloadProgress({ visible: true, current, total });
            });
            
            // Скрываем прогресс
            setDownloadProgress({ visible: false, current: 0, total: 0 });
        } catch (error) {
            console.error('Ошибка загрузки изображений:', error);
            setDownloadProgress({ visible: false, current: 0, total: 0 });
        }
    }

    const getImages = async (interval = 0, count = 0) => {
        let images : string[] = [];
        if(count === 5){
            setContent([])
            setImageLoadingStatus("idle");
            toggleItemsDisabling();
            return;
        }
        console.log(selectedEventItem);
        setImageLoadingStatus("loading");
        if(interval === 0)
            toggleItemsDisabling();

        if(selectedEventItem === undefined) return;

        if(selectedEventItem.images && selectedEventItem.images.length > 0){

            images = await Promise.all(selectedEventItem.images.map(async uri => await getFile(uri)));

        } else {
            let dateFrom : string = formatDateToFetch(new Date(new Date(`${selectedEventItem.date}T${selectedEventItem.time}`).getTime()-interval));
            let dateTo : string = formatDateToFetch(new Date(new Date(`${selectedEventItem.date}T${selectedEventItem.time}`).getTime()+interval));

            const cameraID = selectedEventItem.trackID;
            const plateNumber = selectedEventItem.type === eventsEnum.plateRecognition || selectedEventItem.type === eventsEnum.blacklistAudit ? selectedEventItem.plateNumber : "";

            const response : ImageResponseType = await search(selectedEventItem.type, dateFrom, dateTo, cameraID === -1 ? [] : [cameraID], 0, plateNumber);
            images = response.res;
        }

        const content = convertUriToImageType(images);
        if(content.length === 0) {
            getImages(interval + 1000, count + 1);
        } else {
            setContent(content)
            setImageLoadingStatus("idle");
            toggleItemsDisabling();
        }
    }

    const onPressImageHandler = (index : number) => {
        setImageVisibleState(true); 
        setSelectedImageIndex(index)
    }

    const editImage = (newImage : ImageEventType, uri : string) => {
        const newContent = content.map(item => item.indexOf(uri) !== -1 ? newImage : item);
        setContent(newContent)
    }

    const renderImagePreview = () => {
        return content.map((item, index) => {
            return <GalleryImageItem 
                editImage={editImage}
                onPress = {() => onPressImageHandler(index)}
                key = {index} 
                image={item}
                imageStyle = {{width: 150, height: 150}}/>
        })
    }

    if(selectedEventItem === undefined)
        return (
            <ModalEventWrapper>
                <Stack direction="column" style = {{display: "flex", alignItems: "center", justifyContent: "center", height: "100%"}}>
                    <ShakedText>
                        <NotFoundText>Выберите событие</NotFoundText>
                    </ShakedText>
                </Stack>
            </ModalEventWrapper>
    );

    const getModalInformation = () => ({
        "Камера": convertCameraIDToCameraDirection("text",selectedEventItem.trackID, cameras, colors.black),
        "Время": selectedEventItem.time,
        "Тип": getLabelByValue(selectedEventItem.type),
        ...getAdditionalInformation(selectedEventItem)
    })
    const getAdditionalInformation = (event: EventInformationType) : {[key: string]: string} => {
        switch (event.type) {
            case eventsEnum.faceMatch:
                return {
                    "Схожесть": `${(event.similarity*100).toString().slice(0, 5)}%`,
                    "Имя": event.name,
                    "Причина": event.alarmText || "Не указана"
                };
            case eventsEnum.plateRecognition:
                return {
                    "Номер  машины": event.plateNumber,
                    "Скорость": `${event.speed} км/ч`
                };
            case eventsEnum.blacklistAudit:
                return {
                    "Номер машины": event.plateNumber,
                    "Причина": event.description || "Не указана"
                };
            default:
                return {};
        }
    };

    return (
        <>
            <ModalEventWrapper>
                    <Stack direction="column">
                        <View style={{height: "60%", position: "relative"}}>
                            <ScrollView contentContainerStyle={{paddingBottom: 80}} style={{flex: 1}}>
                                {
                                    imageLoadingStatus === "loading" ? 
                                    //@ts-ignore
                                    <ActivityIndicator size={50} color = {colors.deepblue}/>
                                    : 
                                    <Stack direction="row" style = {styles.imagesLocation}>
                                        {renderImagePreview()}
                                    </Stack>
                                }
                            </ScrollView>

                            <Pressable 
                                onPress={handleImagesDownloading}
                                style={{width: 40, height: 40, backgroundColor: getColorByEventType(selectedEventItem.type), opacity: 0.8, borderRadius: 5, position: "absolute", bottom: 10, left: 10, alignItems: "center", justifyContent: "center"}}>
                                <MaterialIcons name="download" size={28} color={colors.white} />
                            </Pressable>
                            {/* <Pressable 
                                onPress={() => Alert.alert("GPS координаты", selectedEventItem.gps)}
                                style={{width: 40, height: 40, backgroundColor: getColorByEventType(selectedEventItem.type), opacity: 0.8, borderRadius: 5, position: "absolute", bottom: 10, right: 10, alignItems: "center", justifyContent: "center"}}>
                                <MaterialIcons name="place" size={28} color={colors.white} />
                            </Pressable>                             */}
                        </View>

                        <ModalInformation 
                            information={getModalInformation()}
                            type = {selectedEventItem.type}/>
                    </Stack>

            </ModalEventWrapper>

            
            {/* Модальное окно прогресса загрузки */}
            <Modal
                transparent={true}
                visible={downloadProgress.visible}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.progressContainer}>
                        <ActivityIndicator size={50} color={colors.deepblue} />
                        <Text style={styles.progressText}>
                            Загрузка изображений...
                        </Text>
                        <Text style={styles.progressCount}>
                            {downloadProgress.current} из {downloadProgress.total}
                        </Text>
                    </View>
                </View>
            </Modal>
            
            <ImageViewing 
                images={getAllImages((content))}
                chosenImageIndex={selectedImageIndex}
                visible = {imageVisibleState}
                onClose={() => {setImageVisibleState(false)}}/> 
        </>

    )
}

export default ModalEvent;


const styles = StyleSheet.create({
    imagesLocation: {
        flexWrap: "wrap", 
        display: "flex", 
        justifyContent: "space-around",
        width: "100%"
    },
    skeletonItem: {
        width: 150, 
        height: 150, 
        borderRadius: 10, 
        backgroundColor: colors.lightgrey
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        minWidth: 200,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    progressText: {
        marginTop: 15,
        fontSize: 16,
        fontWeight: '600',
        color: colors.deepblue,
        textAlign: 'center',
    },
    progressCount: {
        marginTop: 8,
        fontSize: 14,
        color: colors.grey,
        textAlign: 'center',
    }
})