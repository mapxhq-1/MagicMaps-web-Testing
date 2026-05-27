export const FIXED_GLOBE_ZOOM_TUNING = {
  inputSmoothing: 0,
  acceleration: 100,
  glideSmoothness: 0,
  coastDecay: 0,
};

export const DEFAULT_GLOBE_ZOOM_SETTINGS = {
  scrollStrength: 10,
  galaxySmoothness: 0,
  galaxyIntensity: 10,
  ...FIXED_GLOBE_ZOOM_TUNING,
};
