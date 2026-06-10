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
            let res = null;
            parseString(convertedRequest, { explicitArray: false }, async (err, result) => {
                res = result;
                if (err) {
                    console.error('Error parsing XML:', err);
                    return { res: resulArr, ok: false, more: false, searchPosition: 0 };
                }
            });
            if (res != null) {
                if (res['CMSearchResult']['numOfMatches'] == 0)
                    return { res: resulArr, ok: true, more: false, searchPosition: 0 };
                console.log(res['CMSearchResult']['responseStatusStrg']);
                console.log(res['CMSearchResult']['numOfMatches']);
                console.log(res['CMSearchResult']['totalMatches']);
                let matches = res['CMSearchResult']['matchList']['searchMatchItem'];
                if (typeof (matches.length) === 'undefined')
                    matches = [matches];

                for (let i = 0; i < matches.length; i++) {
                    const descriptors = matches[i]['mediaSegmentDescriptor'];
                    const startTime = matches[i]['timeSpan']['startTime'];
                    const date = startTime.split('T')[0];
                    // const trackID = Number(matches[i]['trackID'])+2;

                    const lastDescriptor = descriptors[descriptors.length - 1];
                    const filename = (lastDescriptor["playbackURI"].split("&")[2].slice(9, -4))

                    const match = lastDescriptor["playbackURI"].match(/tracks\/(\d+)\//);
                    const trackID = match ? match[1] + "03" : null;
                    const type = matches[i]['metadataMatches']['metadataDescriptor'].split('/')[1];
                    const remark = matches[i]['remark'] && typeof matches[i]['remark'] === 'string' ? matches[i]['remark'] : null;
                    console.log(matches)
                    if (type === "blacklistAudit") { // eventType === "plateRecognition" || eventType === "blacklistAudit"
                        const textInfo = lastDescriptor.textInfo.split("\r\n").slice(0, -1);
                        const datetime = textInfo[0].substring(6).split(" ");
                        const plateNumber = textInfo[1].substring(13).trim();
                        const gps = textInfo[2].substring(4);
                        const speed = textInfo[3].substring(6) || "0";
                        // await getBlackListText(plateNumber)
                        resulArr.push({
                            type,
                            date: datetime[0],
                            trackID: trackID,
                            time: datetime[1],
                            description: remark || "Нет информации",
                            plateNumber,
                            gps,
                            filename,
                            speed,
                            id: uuid.v4()
                        })
                    } else {
                        if (type === "plateRecognition") {
                            const textInfo = lastDescriptor.textInfo.split("\r\n").slice(0, -1);
                            const datetime = textInfo[0].substring(6).split(" ");
                            const plateNumber = textInfo[1].substring(13).trim();
                            const gps = textInfo[2].substring(4);
                            const speed = textInfo[3].substring(6).trim() || "0";

                            const match = lastDescriptor["playbackURI"].match(/tracks\/(\d+)\//);
                            const trackID = match ? match[1] + "03" : null;

                            console.log(filename);
                            console.log(match)
                            console.log(lastDescriptor)
                            if (speed !== "0" || plateNumber !== "unknown")
                                resulArr.push({
                                    type,
                                    date: datetime[0],
                                    trackID,
                                    time: datetime[1],
                                    plateNumber,
                                    gps,
                                    filename,
                                    speed,
                                    id: uuid.v4(),
                                })
                        } else {
                            if (type === "faceMatch") {
                                const textInfo = lastDescriptor.textInfo.split("\r\n").slice(0, -1);
                                const datetime = textInfo[0].substring(6).split(" ");
                                const name = textInfo[2].substring(5);
                                const similarity = parseFloat(textInfo[1].substring(11).replace('%', '').trim()) / 100;
                                console.log(lastDescriptor);
                                console.log(name, similarity)
                                resulArr.push({
                                    type,
                                    date: datetime[0],
                                    trackID: trackID,
                                    time: datetime[1],
                                    name,
                                    similarity,
                                    filename,
                                    alarmText: remark || "Нет информации",
                                    id: uuid.v4()
                                })
                            }
                        }

                    }

                }

                if (res['CMSearchResult']['responseStatusStrg'] == 'MORE') {
                    console.log("done more")
                    if (resulArr.length <= 10) {
                        let newInfo = await getEventsInformation(eventType, dataS, dataPo, plate, cameraDirection, searchPos + maxResults, resulArr);
                        return { res: newInfo.res, ok: newInfo.ok, more: newInfo.more, searchPosition: newInfo.searchPosition }
                    }
                    else
                        return { res: resulArr, ok: true, more: true, searchPosition: searchPos + maxResults }
                }
                //return resulArr;
                //resulArr.push(getEventsInformation(eventType, dataS, dataPo, searchPos+maxResults, resulArr));
            }

        } catch (e) {
            console.error(e);
        }
        console.log("done no more")
        return { res: resulArr, ok: true, more: false, searchPosition: 0 };

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
            let res = null;
            parseString(convertedRequest, { explicitArray: false }, async (err, result) => {
                res = result;
                if (err) {
                    console.error('Error parsing XML:', err);
                    return { res: resultArr, ok: false, more: false, searchPosition: 0 };
                }
            });
            // console.log("Images result " + JSON.stringify(res));
            if (res != null) {
                console.log(res);
                let matches = [];
                if (res['CMSearchResult'] == undefined)
                    matches = res;
                if (res['CMSearchResult']['numOfMatches'] == 0)
                    return { res: resultArr, ok: true, more: false, searchPosition: 0 };

                console.log(res['CMSearchResult']['responseStatusStrg']);
                console.log(res['CMSearchResult']['numOfMatches']);
                console.log(res['CMSearchResult']['totalMatches']);
                matches = res['CMSearchResult']['matchList']['searchMatchItem'];
                if (typeof (matches.length) === 'undefined')
                    matches = [matches];
                for (let i = 0; i < matches.length; i++) {
                    const descriptors = matches[i]['mediaSegmentDescriptor'];
                    const textInfo = descriptors[descriptors.length - 1].textInfo.split("\r\n").slice(0, -1);
                    console.log(textInfo)
                    const plateNumber = textInfo[1].substring(13).trim();

                    console.log(plateNumberFind, plateNumber)
                    if (plateNumberFind !== "" && plateNumber !== plateNumberFind)
                        continue;

                    const startTime = matches[i]['timeSpan']['startTime'];
                    const date = startTime.split('T')[0];
                    const trackID = Number(matches[i]['trackID']) + 2;
                    const type = matches[i]['metadataMatches']['metadataDescriptor'].split('/')[1];
                    if (typeof (descriptors.length) === 'undefined')
                        descriptors = [descriptors];
                    for (let k = 0; k < descriptors.length; k++)
                        if (descriptors[k]['contentType'] == 'picture') {
                            const playbackURI = descriptors[k]['playbackURI'];
                            const name = new URLSearchParams(playbackURI.split('?')[1]).get('name');
                            const size = new URLSearchParams(playbackURI.split('?')[1]).get('size');
                            const downloadUri = `rtsp://${ip}/picture/Streaming/tracks/${trackID}?starttime=${startTime}&endtime=1970-01-01 00:00:00Z&name=${name}&size=${size}`;
                            const file = await getFile(downloadUri);

                            resultArr.push(file);
                        }
                }
                if (res['CMSearchResult']['responseStatusStrg'] == 'MORE') {
                    //resultArr.push(search(eventType, dataS, dataPo, searchPos+maxResults, resultArr));
                    return { res: resultArr, ok: true, more: true, searchPosition: searchPos + maxResults };
                }
            }

        } catch (e) {
            console.error(e);
        }
        return { res: resultArr, ok: true, more: false, searchPosition: 0 };
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
                return await getFile(downloadUrl, downloadUri, iteration + 1);
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
                    return { res: resultArr, ok: false, more: false, searchPosition: 0 };
                }
            });
            const regex = /\/tracks\/(\d{3})/;
            if (responseFromXml != null) {
                if (responseFromXml['CMSearchResult']['numOfMatches'] == 0)
                    return { res: resultArr, ok: true, more: false, searchPosition: 0 };

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
                        return { res: newInfo.res, ok: newInfo.ok, more: newInfo.more, searchPosition: newInfo.searchPosition }
                    }
                    else
                        return { res: resultArr, ok: true, more: true, searchPosition: searchPos + maxResults }

                return { res: resultArr, ok: true, more: false, searchPosition: 0 };
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