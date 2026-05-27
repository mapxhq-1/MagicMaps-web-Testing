import { DEFAULT_GLOBE_ZOOM_SETTINGS } from "./globeZoomSettings";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (min, max, t) => min + (max - min) * t;

export function mapGalaxySettingsToConfig(settings = {}) {
  const smoothT = clamp(Number(settings.galaxySmoothness) ?? 0, 0, 100) / 100;
  const intensity = clamp(
    Number(settings.galaxyIntensity) ?? DEFAULT_GLOBE_ZOOM_SETTINGS.galaxyIntensity,
    0,
    100
  ) / 100;
  const intensityT = intensity * intensity;

  const baseZoomImpulse = lerp(35, 75, smoothT);

  return {
    glideK: lerp(1, 9, smoothT),
    coastDecayK: lerp(0.5, 4.5, smoothT),
    zoomImpulse: baseZoomImpulse * lerp(0.45, 2.8, intensityT),
    rotationGain: lerp(0.85, 1.35, intensity),
    starMotionGain: lerp(0.3, 1.6, intensityT),
  };
}

export const galaxyMotionConfigRef = {
  current: mapGalaxySettingsToConfig(DEFAULT_GLOBE_ZOOM_SETTINGS),
};

export function applyGalaxyMotionSettings(settings = {}) {
  galaxyMotionConfigRef.current = mapGalaxySettingsToConfig({
    ...DEFAULT_GLOBE_ZOOM_SETTINGS,
    ...settings,
  });
}
