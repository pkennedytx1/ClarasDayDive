export type GeneralContactPayload = {
  name: string;
  email: string;
  message: string;
};

export type GeneralContactConfig = {
  staffEmail: string;
  fromEmail: string;
  siteName: string;
  siteUrl?: string;
  responseTime: string;
};
