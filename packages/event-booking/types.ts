export type EventInquiryPayload = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  description: string;
  additionalInfo?: string;
};

export type InquiryConfig = {
  staffEmail: string;
  staffEmailTarget: string;
  fromEmail: string;
  siteName: string;
  responseTime: string;
};
