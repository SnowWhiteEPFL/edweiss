
export type FCMMessageType = 'go_to_slide';

interface FCMMessageBase {
	type: FCMMessageType;
}

export interface FCMMessageGoToSlide extends FCMMessageBase {
	type: 'go_to_slide';
	slideIndex: number;
}

export type FCMMessage = FCMMessageGoToSlide;
