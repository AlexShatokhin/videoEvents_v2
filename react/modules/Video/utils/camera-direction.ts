import { cameraDirection as cameraDirectionEnum } from '../../../types/cameraDirectionEnum';

const CAMERA_DIRECTION_TO_CHANNEL: Record<string, number> = {
	[cameraDirectionEnum.Top]: 34,
	[cameraDirectionEnum.Back]: 33,
	[cameraDirectionEnum.TopLeft]: 35,
	[cameraDirectionEnum.BackLeft]: 36,
	[cameraDirectionEnum.TopRight]: 37,
	[cameraDirectionEnum.BackRight]: 38,
};

const DEFAULT_CHANNEL = 34;

export function cameraDirectionToChannel(direction: typeof cameraDirectionEnum[keyof typeof cameraDirectionEnum]): number {
	return CAMERA_DIRECTION_TO_CHANNEL[direction] ?? DEFAULT_CHANNEL;
}