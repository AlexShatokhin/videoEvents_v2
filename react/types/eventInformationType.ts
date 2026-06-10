import { eventsEnum } from "./eventsEnum"

export interface BaseEventInformationType {
    id: string;
    type: eventsEnum;
    date: string;
    time: string;
    trackID: number;
    images: string[];
    gps: string;
}

export interface FaceMatchEvent extends BaseEventInformationType {
    type: eventsEnum.faceMatch;
    similarity: number;
    name: string;
    alarmText: string;
}

export interface FaceDetectionEvent extends BaseEventInformationType {
    type: eventsEnum.facedetection;
}

export interface PlateRecognitionEvent extends BaseEventInformationType {
    type: eventsEnum.plateRecognition;
    plateNumber: string;
    speed: number;
}

export interface BlacklistAuditEvent extends BaseEventInformationType {
    type: eventsEnum.blacklistAudit;
    plateNumber: string;
    description: string;
}

export type EventInformationType =
    | FaceMatchEvent
    | FaceDetectionEvent
    | PlateRecognitionEvent
    | BlacklistAuditEvent;