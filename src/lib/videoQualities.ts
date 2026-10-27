export const VIDEO_QUALITIES = ["360p", "480p", "720p", "1080p"] as const;

export type VideoQuality = (typeof VIDEO_QUALITIES)[number];

export function isVideoQuality(value: string | null): value is VideoQuality {
  return VIDEO_QUALITIES.some((quality) => quality === value);
}
