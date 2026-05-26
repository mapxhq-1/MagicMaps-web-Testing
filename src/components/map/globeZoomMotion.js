import { FIXED_GLOBE_ZOOM_TUNING } from "./globeZoomSettings";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (min, max, t) => min + (max - min) * t;

export function mapSettingsToMotionConfig(settings = {}) {
  const scrollStrength = clamp(Number(settings.scrollStrength) ?? 62, 0, 100) / 100;
  const inputSmoothing = FIXED_GLOBE_ZOOM_TUNING.inputSmoothing / 100;
  const acceleration = FIXED_GLOBE_ZOOM_TUNING.acceleration / 100;
  const glideSmoothness = FIXED_GLOBE_ZOOM_TUNING.glideSmoothness / 100;
  const coastDecay = FIXED_GLOBE_ZOOM_TUNING.coastDecay / 100;

  const strengthT = scrollStrength * scrollStrength;

  return {
    scrollGain: lerp(0.2, 3.5, strengthT),
    wheelTargetBump: lerp(0, 0.4, scrollStrength),
    inputSmoothingAlpha: lerp(0.1, 0.5, inputSmoothing),
    maxAccel: lerp(0.35, 2.2, acceleration) * lerp(1, 2.5, scrollStrength),
    glideK: lerp(1, 9, glideSmoothness),
    coastDecayK: lerp(0.5, 5, coastDecay),
    stopVelocityEpsilon: 0.00003,
    stopZoomEpsilon: 0.00015,
    wheelIdleMs: 100,
  };
}

function normalizeWheelDelta(event) {
  let deltaY = event.deltaY;
  if (event.deltaMode === 1) deltaY *= 16;
  if (event.deltaMode === 2) deltaY *= window.innerHeight;
  return Math.sign(deltaY) * Math.min(Math.abs(deltaY) / 120, 1);
}

export function createGlobeWheelMotionController(getMap) {
  const state = {
    displayZoom: null,
    targetZoom: null,
    velocity: 0,
    smoothedWheel: 0,
    lastWheelTs: 0,
    rafId: null,
    lastFrameTs: 0,
    onWheel: null,
    attachedCanvas: null,
    attached: false,
    config: mapSettingsToMotionConfig(),
  };

  const detach = () => {
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
    if (state.attachedCanvas && state.onWheel) {
      state.attachedCanvas.removeEventListener("wheel", state.onWheel);
    }
    state.velocity = 0;
    state.smoothedWheel = 0;
    state.displayZoom = null;
    state.targetZoom = null;
    state.onWheel = null;
    state.attachedCanvas = null;
    state.attached = false;
    state.lastFrameTs = 0;
  };

  const ensureZoomState = (map) => {
    if (state.displayZoom == null) {
      const z = map.getZoom();
      state.displayZoom = z;
      state.targetZoom = z;
    }
  };

  const stopIfSettled = (cfg) => {
    const zoomGap = Math.abs(state.targetZoom - state.displayZoom);
    if (
      Math.abs(state.velocity) < cfg.stopVelocityEpsilon &&
      zoomGap < cfg.stopZoomEpsilon
    ) {
      state.velocity = 0;
      state.smoothedWheel = 0;
      state.rafId = null;
      return true;
    }
    return false;
  };

  const step = (ts) => {
    const map = getMap();
    if (!map) return;

    const cfg = state.config;
    ensureZoomState(map);
    if (!state.lastFrameTs) state.lastFrameTs = ts;
    const dt = clamp((ts - state.lastFrameTs) / 1000, 0.001, 0.05);
    state.lastFrameTs = ts;

    const minZoom = map.getMinZoom();
    const maxZoom = map.getMaxZoom();
    const wheelActive = ts - state.lastWheelTs < cfg.wheelIdleMs;

    const desiredVelocity = wheelActive ? state.smoothedWheel * cfg.scrollGain : 0;
    const maxDeltaV = cfg.maxAccel * dt;
    state.velocity += clamp(desiredVelocity - state.velocity, -maxDeltaV, maxDeltaV);

    if (!wheelActive) {
      state.velocity *= Math.exp(-cfg.coastDecayK * dt);
      state.smoothedWheel *= Math.exp(-cfg.coastDecayK * dt);
    }

    state.targetZoom = clamp(state.targetZoom + state.velocity * dt, minZoom, maxZoom);

    const glideBlend = 1 - Math.exp(-cfg.glideK * dt);
    state.displayZoom += (state.targetZoom - state.displayZoom) * glideBlend;
    state.displayZoom = clamp(state.displayZoom, minZoom, maxZoom);

    if (Math.abs(state.displayZoom - map.getZoom()) > 0.000005) {
      map.jumpTo({ zoom: state.displayZoom });
    }

    if (!stopIfSettled(cfg)) {
      state.rafId = requestAnimationFrame(step);
    }
  };

  const attach = () => {
    const map = getMap();
    if (!map) return;
    const canvas = map.getCanvas();
    if (!canvas) return;
    if (state.attached && state.attachedCanvas === canvas && state.onWheel) return;

    detach();
    map.scrollZoom?.disable();

    state.displayZoom = map.getZoom();
    state.targetZoom = state.displayZoom;
    state.lastFrameTs = 0;

    const onWheel = (event) => {
      const mapInstance = getMap();
      if (!mapInstance) return;
      event.preventDefault();

      ensureZoomState(mapInstance);

      const normalized = normalizeWheelDelta(event);
      const alpha = state.config.inputSmoothingAlpha;
      state.smoothedWheel = state.smoothedWheel * (1 - alpha) + normalized * alpha;
      state.lastWheelTs = performance.now();

      const bump = normalized * state.config.wheelTargetBump;
      if (bump !== 0) {
        const minZoom = mapInstance.getMinZoom();
        const maxZoom = mapInstance.getMaxZoom();
        state.targetZoom = clamp(state.targetZoom + bump, minZoom, maxZoom);
      }

      if (!state.rafId) {
        state.rafId = requestAnimationFrame(step);
      }
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    state.onWheel = onWheel;
    state.attachedCanvas = canvas;
    state.attached = true;
  };

  return {
    applySettings(settings) {
      state.config = mapSettingsToMotionConfig(settings);
    },
    isAttached() {
      return state.attached;
    },
    attach,
    detach,
  };
}
