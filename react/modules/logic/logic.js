import DigestFetch from 'react-native-digest-fetch';
import { parseString } from "react-native-xml2js"
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from "expo-media-library"
import uuid from "react-native-uuid"
import { Buffer } from 'buffer';

import getSendingXML from './getSendingXML';
import * as SecureStore from 'expo-secure-store';
import { eventsEnum } from '../../types/eventsEnum';

const logic = (ip, user, password) => {

    const searchUrl = `http://${ip}/ISAPI/ContentMgmt/search`;
    const downloadUrl = `http://${ip}/ISAPI/ContentMgmt/download`;

    const parseXmlAsync = (xmlString) => {
        return new Promise((resolve, reject) => {
            parseString(xmlString, { explicitArray: false }, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    };


    const parseCameraTextInfo = (textInfoString) => {
        if (!textInfoString) return { date: "", time: "", plateNumber: "", gps: "", speed: "0" };
        
        const lines = textInfoString.split("\r\n").slice(0, -1);
        const datetime = (lines[0]?.substring(6) || "").split(" ");
        
        return {
            date: datetime[0] || "",
            time: datetime[1] || "",
            plateNumber: lines[1]?.substring(13).trim() || "unknown",
            gps: lines[2]?.substring(4) || "",
            speed: lines[3]?.substring(6).trim() || "0"
        };
    };

    //await search(ip, 'admin', 'Admin12345', dataS, dataPo, 0); // '192.168.20.192:8080'
    // Тип ответа: {res: resultArr, ok: true, more: false, searchPosition: 0}

    return { getEventsInformation, search, getFile, checkConnection, searchVideo };

    async function getEventsInformation(eventType, dataS, dataPo, plate, cameraDirection, searchPos = 0, resulArr = [], eventsCount = 25) {
        const maxResults = eventsCount;
        console.log("Events Information: ", user, password, ip, dataS, dataPo, eventType, cameraDirection)
        const sendingEventType = typeof eventType === "string" ? eventType : "allPic";
        const send = getSendingXML(sendingEventType, dataS, dataPo, cameraDirection, searchPos, maxResults, plate);
        try {
            const request = await DigestFetch(searchUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/xml; charset=UTF-8'
                },
                body: send,
                username: user,
                password: password
            })
            const convertedRequest = await request.text();
            const res = await parseXmlAsync(convertedRequest);

            if (!res || !res['CMSearchResult'] || res['CMSearchResult']['numOfMatches'] == 0) {
                return { res: resulArr, ok: true, more: false, searchPosition: 0, error: null };
            }

            console.log(res['CMSearchResult']['responseStatusStrg']);
            console.log(res['CMSearchResult']['numOfMatches']);
            console.log(res['CMSearchResult']['totalMatches']);
            let matches = res['CMSearchResult']['matchList']['searchMatchItem'];
            if (typeof (matches.length) === 'undefined')
                matches = [matches];

            for (let i = 0; i < matches.length; i++) {
                const descriptors = matches[i]['mediaSegmentDescriptor'];
                const lastDescriptor = Array.isArray(descriptors) ? descriptors[descriptors.length - 1] : descriptors;

                if (!lastDescriptor || !lastDescriptor["playbackURI"]) continue;

                const filename = lastDescriptor["playbackURI"].split("&")[2]?.slice(9, -4) || "";
                const match = lastDescriptor["playbackURI"].match(/tracks\/(\d+)\//);
                const trackID = match ? match[1] + "03" : null;
                const type = matches[i]['metadataMatches']['metadataDescriptor'].split('/')[1];
                const remark = matches[i]['remark'] && typeof matches[i]['remark'] === 'string' ? matches[i]['remark'] : null;


                console.log(matches)

                if (type === "blacklistAudit" || type === "plateRecognition") {
                    const parsedData = parseCameraTextInfo(lastDescriptor.textInfo);

                    if (type === "blacklistAudit") {
                        resulArr.push({
                            type,
                            ...parsedData,
                            trackID,
                            description: remark || "Нет информации",
                            filename,
                            id: uuid.v4()
                        });
                    } else if (parsedData.speed !== "0" || parsedData.plateNumber !== "unknown") {
                        resulArr.push({
                            type,
                            ...parsedData,
                            trackID,
                            filename,
                            id: uuid.v4()
                        });
                    }
                } else if (type === "faceMatch") {
                    const lines = (lastDescriptor.textInfo || "").split("\r\n").slice(0, -1);
                    const datetime = (lines[0]?.substring(6) || "").split(" ");
                    const name = lines[2]?.substring(5) || "";
                    const similarity = parseFloat(lines[1]?.substring(11).replace('%', '').trim() || "0") / 100;

                    resulArr.push({
                        type,
                        date: datetime[0] || "",
                        trackID,
                        time: datetime[1] || "",
                        name,
                        similarity,
                        filename,
                        alarmText: remark || "Нет информации",
                        id: uuid.v4()
                    });
                }
            }

            if (res['CMSearchResult']['responseStatusStrg'] === 'MORE' && resulArr.length <= 10) {
                return await getEventsInformation(eventType, dataS, dataPo, plate, cameraDirection, searchPos + maxResults, resulArr, eventsCount);
            }

            return { 
                res: resulArr, 
                ok: true, 
                more: res['CMSearchResult']['responseStatusStrg'] === 'MORE', 
                searchPosition: res['CMSearchResult']['responseStatusStrg'] === 'MORE' ? searchPos + maxResults : 0,
                error: null
            };
        } catch (e) {
            console.error('Error in getEventsInformation:', e);
            return { res: resulArr, ok: false, more: false, searchPosition: 0,  error: "Ошибка получения событий. \n Проверьте подключение к Wi-Fi и перезагрузите приложение" };        
        }

    }

    async function search(eventType, dataS, dataPo, cameraList = [], searchPos = 0, plateNumberFind = "") {
        const resultArr = [];
        const maxResults = 50;
        console.log("Images Information: ", user, password, ip, eventType, dataS, dataPo, cameraList, searchPos)
        const send = getSendingXML(eventType, dataS, dataPo, cameraList, searchPos, maxResults);

        try {
            const request = await DigestFetch(searchUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/xml; charset=UTF-8'
                },
                body: send,
                username: user,
                password: password
            })
            const convertedRequest = await request.text();
            const res = await parseXmlAsync(convertedRequest)

            if (!res || res['CMSearchResult'] === undefined || res['CMSearchResult']['numOfMatches'] == 0) {
                return { res: resultArr, ok: true, more: false, searchPosition: 0, error: null };
            }

            let matches = res['CMSearchResult']['matchList']['searchMatchItem'];
            if (typeof (matches.length) === 'undefined')
                matches = [matches];

  
            console.log(res);


            console.log(res['CMSearchResult']['responseStatusStrg']);
            console.log(res['CMSearchResult']['numOfMatches']);
            console.log(res['CMSearchResult']['totalMatches']);

            for (let i = 0; i < matches.length; i++) {
                let descriptors = matches[i]['mediaSegmentDescriptor'];
                if (!Array.isArray(descriptors)) {
                    descriptors = [descriptors];
                }

                const lastDescriptor = descriptors[descriptors.length - 1];
                const parsedData = parseCameraTextInfo(lastDescriptor?.textInfo);

                if (plateNumberFind !== "" && parsedData.plateNumber !== plateNumberFind) {
                    continue;
                }
                const startTime = matches[i]['timeSpan']['startTime'];
                const trackID = Number(matches[i]['trackID']) + 2;  
                    
                for (let k = 0; k < descriptors.length; k++) {
                    if (descriptors[k]['contentType'] === 'picture') {
                        const playbackURI = descriptors[k]['playbackURI'];

                        const nameMatch = playbackURI.match(/[?&]name=([^&]+)/);
                        const sizeMatch = playbackURI.match(/[?&]size=([^&]+)/);
                        
                        const name = nameMatch ? nameMatch[1] : "";
                        const size = sizeMatch ? sizeMatch[1] : "";
                        
                        const downloadUri = `rtsp://${ip}/picture/Streaming/tracks/${trackID}?starttime=${startTime}&endtime=1970-01-01 00:00:00Z&name=${name}&size=${size}`;
                        const file = await getFile(downloadUri);
                        resultArr.push(file);
                    }
                }
            }
            const isMore = res['CMSearchResult']['responseStatusStrg'] === 'MORE';
            return { res: resultArr, ok: true, more: isMore, searchPosition: isMore ? searchPos + maxResults : 0, error: null };

        } catch (e) {
            console.error('Error in search:', e);
            return { res: resultArr, ok: false, more: false, searchPosition: 0, error: "Ошибка поиска. \n Проверьте подключение к Wi-Fi и перезагрузите приложение" };
        }
    }

    async function getFile(downloadUri, iteration = 0) {
        console.log("Try to get file witn URL: " + downloadUrl + " and URI: " + downloadUri);
        try {
            const authorization = await DigestFetch(downloadUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/xml; charset=UTF-8'
                },
                body: downloadUri,
                username: user,
                password: password
            })
            const authBuffer = await authorization.arrayBuffer();
            const base64 = Buffer.from(authBuffer).toString("base64");
            console.log(authorization.status);

            return base64;
        } catch (error) {
            console.error('Error:', error);
            if (iteration < 1) {
                return await getFile(downloadUri, iteration + 1);
            } else {
                return `Error!downloadURL=${downloadUrl},downloadURI=${downloadUri}`;
            }
        }
    }

    async function searchVideo(dataS, dataPo, cameraList = [], searchPos = 0, resultArr = []) {
        const maxResults = 50;
        console.log("Video Information: ", user, password, ip, dataS, dataPo, cameraList, searchPos)
        const send = `<CMSearchDescription>
    <searchID>CB3066AD-2BA0-0001-2D41-1CE01815B430</searchID>
    <trackList>
                ${cameraList.length === 0 ?
                `                
                <trackID>101</trackID>
                <trackID>201</trackID>
                <trackID>301</trackID>
                <trackID>401</trackID>
                <trackID>501</trackID>
                <trackID>601</trackID>
                `
                :
                cameraList.map(cameraID => `<trackID>${cameraID - 2}</trackID>`).join(" ")
            }
    </trackList>
    <timeSpanList>
    <timeSpan>
    <startTime>${dataS}</startTime>
    <endTime>${dataPo}</endTime>
    </timeSpan>
    </timeSpanList>
    <maxResults>40</maxResults>
    <searchResultPostion>${searchPos}</searchResultPostion>
    <metadataList>
    <metadataDescriptor>//recordType.meta.std-cgi.com</metadataDescriptor>
    </metadataList>
    </CMSearchDescription>`;
        try {
            const response = await DigestFetch(searchUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/xml; charset=UTF-8'
                },
                body: send,
                username: user,
                password: password
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const parsedResponse = await response.text();
            let responseFromXml = null;
            parseString(parsedResponse, { explicitArray: false }, async (err, result) => {
                responseFromXml = result;
                if (err) {
                    console.error('Error parsing XML:', err);
                    return { res: resultArr, ok: false, more: false, searchPosition: 0,  error: "Ошибка парсинга XML" };
                }
            });
            const regex = /\/tracks\/(\d{3})/;
            if (responseFromXml != null) {
                if (responseFromXml['CMSearchResult']['numOfMatches'] == 0)
                    return { res: resultArr, ok: true, more: false, searchPosition: 0, error: null };

                const matches = responseFromXml['CMSearchResult']['matchList']['searchMatchItem'];
                for (let i = 0; i < matches.length; i++) {
                    let descriptors = matches[i]['mediaSegmentDescriptor'];
                    const startTime = matches[i]['timeSpan']['startTime'];
                    const endTime = matches[i]['timeSpan']['endTime'];
                    const date = startTime.split('T')[0];

                    const duration = ((new Date(endTime) - new Date(startTime)) / 1000).toFixed(0); // in minutes
                    const startTimeFormatted = startTime.split('T')[1].slice(0, -1);
                    const endTimeFormatted = endTime.split('T')[1].slice(0, -1);
                    const type = matches[i]['metadataMatches']['metadataDescriptor'].split('/')[1];
                    // const trackID = Number(matches[i]['trackID']);
                    let downloadURI = "";
                    let trackID = "";
                    if (typeof (descriptors.length) === 'undefined')
                        descriptors = [descriptors];
                    for (var k = 0; k < descriptors.length; k++)
                        if (descriptors[k]['contentType'] == 'video') {
                            const playbackURI = descriptors[k]['playbackURI'];
                            const name = new URLSearchParams(playbackURI.split('?')[1]).get('name');
                            const size = new URLSearchParams(playbackURI.split('?')[1]).get('size');
                            const filename = new URLSearchParams(playbackURI.split('?')[1]).get('filename');
                            const startTimeNoDash = startTime.replaceAll("-", "").replaceAll(":", "");
                            const endTimeNoDash = endTime.replaceAll("-", "").replaceAll(":", "");
                            console.log(startTimeNoDash, endTimeNoDash);
                            trackID = +playbackURI.match(regex)[1];
                            downloadURI = `rtsp://${user}:${password}@${ip}/Streaming/tracks/${trackID}?starttime=${startTimeNoDash}&endtime=${endTimeNoDash}`;
                        }
                    console.log(duration)
                    const videoItem = {
                        duration,
                        id: uuid.v4(),
                        trackId: trackID + 2,
                        timeFrom: startTimeFormatted,
                        timeTo: endTimeFormatted,
                        url: downloadURI
                    }
                    resultArr.push(videoItem);
                }
                if (responseFromXml['CMSearchResult']['responseStatusStrg'] == 'MORE')
                    if (resultArr.length <= 10) {
                        let newInfo = await searchVideo(dataS, dataPo, searchPos + maxResults, resultArr);
                        return { res: newInfo.res, ok: newInfo.ok, more: newInfo.more, searchPosition: newInfo.searchPosition, error: null }
                    }
                    else
                        return { res: resultArr, ok: true, more: true, searchPosition: searchPos + maxResults, error: null }

                return { res: resultArr, ok: true, more: false, searchPosition: 0, error: null };
            }
        } catch (e) {
            console.error(e);
        }
    }



    async function checkConnection() {
        try {
            const request = await DigestFetch(`http://${ip}`, {
                method: 'GET',
                username: user,
                password: password
            })
            console.log(request.status)
            return request.status === 200;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

}
export default logic;