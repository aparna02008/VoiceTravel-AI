export interface OTPRequest {
  phoneNumber: string;
}

export interface VerifyOTPRequest {
  phoneNumber: string;
  otp: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    phoneNumber: string;
    name?: string;
    email?: string;
    preferredLanguage: string;
  };
}

export interface VoiceTranscriptionRequest {
  audioFile: File;
  language?: string;
}

export interface IntentDetectionRequest {
  text: string;
  language?: string;
  context?: any;
}

export interface BookingSearchRequest {
  bookingType: 'train' | 'flight' | 'bus';
  from: string;
  to: string;
  date: string;
  passengers: number;
  returnDate?: string;
}

export interface BookingResponse {
  id: string;
  pnr?: string;
  status: string;
  fromLocation: string;
  toLocation: string;
  totalPrice: number;
  currency: string;
}
