export const MESSAGE_SOURCE = 'kitchen-sink-extension'

export const YOUTUBE_DEFAULTS = {
  forceMaxQuality: true,
  youtubeTheater: true,
}

export const TWITCH_DEFAULTS = {
  twitchForceMaxQuality: true,
  twitchMentionsPanel: true,
}

export const GOOGLE_DEFAULTS = {
  googleBlurAiOverviews: true,
}

export const DEFAULTS = {
  ...YOUTUBE_DEFAULTS,
  ...TWITCH_DEFAULTS,
  ...GOOGLE_DEFAULTS,
}
