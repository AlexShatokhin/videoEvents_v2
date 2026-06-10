const getSendingXML = (eventType : string, dateFrom: string, dateTo: string, cameraList : string[] = [], searchResultPosition : number, maxResults : number, plate?: string) => {
    return     `<?xml version="1.0" encoding="utf-8"?>
    <CMSearchDescription>
        <searchID>CAC91F3D-19C0-0001-F43D-23401D501E67</searchID>
        <trackIDList>
            ${cameraList.length === 0 ? 
                `                
                <trackID>103</trackID>
                <trackID>203</trackID>
                <trackID>303</trackID>
                <trackID>403</trackID>
                <trackID>503</trackID>
                <trackID>603</trackID>
                ` 
                : 
                cameraList.map(cameraID => `<trackID>${cameraID}</trackID>`).join(" ")             
            }

        </trackIDList>
        <timeSpanList>
            <timeSpan>
                <startTime>${dateFrom}</startTime>
                <endTime>${dateTo}</endTime>
            </timeSpan>
        </timeSpanList>
        <contentTypeList>
            <contentType>picture</contentType>
        </contentTypeList>
        <maxResults>${maxResults}</maxResults>
        <searchResultPostion>${searchResultPosition}</searchResultPostion>
        <metadataList>
            <metadataDescriptor>//recordType.meta.std-cgi.com/${eventType}</metadataDescriptor>
            ${plate ? `<SearchProperity><plateSearchMask>${plate}</plateSearchMask></SearchProperity>` : ""}
        </metadataList>
    </CMSearchDescription>`;
}



export default getSendingXML;