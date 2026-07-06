export type SocialPlatform = 'instagram' | 'facebook' | 'tiktok';

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  label: string;
}

export interface SiteSocial {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  googleBusiness?: string;
  googleMaps?: string;
}

/** Only links with a non-empty URL from the sheet are shown. */
export function getSocialLinks(social: SiteSocial): SocialLink[] {
  const candidates: Array<{ platform: SocialPlatform; url?: string; label: string }> = [
    { platform: 'instagram', url: social.instagram, label: 'Instagram' },
    { platform: 'facebook', url: social.facebook, label: 'Facebook' },
    { platform: 'tiktok', url: social.tiktok, label: 'TikTok' },
  ];

  return candidates
    .filter((item) => item.url?.trim())
    .map((item) => ({
      platform: item.platform,
      url: item.url!.trim(),
      label: item.label,
    }));
}
