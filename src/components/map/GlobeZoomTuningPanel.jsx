import { Box, Typography } from "@mui/material";
import { DEFAULT_GLOBE_ZOOM_SETTINGS } from "./globeZoomSettings";

export { DEFAULT_GLOBE_ZOOM_SETTINGS };

export default function GlobeZoomTuningPanel({ settings, onChange }) {
  const scrollStrength =
    settings?.scrollStrength ?? DEFAULT_GLOBE_ZOOM_SETTINGS.scrollStrength;

  return (
    <Box
      sx={{
        mt: 1,
        pt: 1,
        borderTop: "1px solid rgba(255,255,255,0.2)",
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
        minWidth: 240,
      }}
    >
      <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#e9f5ff" }}>
        Smooth scroll zoom
      </Typography>
      <label
        style={{ fontSize: "11px", display: "flex", flexDirection: "column", gap: "2px" }}
      >
        Scroll strength: {scrollStrength}
        <input
          type="range"
          min="0"
          max="100"
          value={scrollStrength}
          onChange={(e) => onChange("scrollStrength", Number(e.target.value))}
        />
      </label>
      <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#e9f5ff", mt: 0.5 }}>
        Galaxy / stars
      </Typography>
      <label
        style={{ fontSize: "11px", display: "flex", flexDirection: "column", gap: "2px" }}
      >
        Galaxy smoothness: {settings?.galaxySmoothness ?? DEFAULT_GLOBE_ZOOM_SETTINGS.galaxySmoothness}
        <input
          type="range"
          min="0"
          max="100"
          value={settings?.galaxySmoothness ?? DEFAULT_GLOBE_ZOOM_SETTINGS.galaxySmoothness}
          onChange={(e) => onChange("galaxySmoothness", Number(e.target.value))}
        />
      </label>
      <label
        style={{ fontSize: "11px", display: "flex", flexDirection: "column", gap: "2px" }}
      >
        Galaxy intensity: {settings?.galaxyIntensity ?? DEFAULT_GLOBE_ZOOM_SETTINGS.galaxyIntensity}
        <input
          type="range"
          min="0"
          max="100"
          value={settings?.galaxyIntensity ?? DEFAULT_GLOBE_ZOOM_SETTINGS.galaxyIntensity}
          onChange={(e) => onChange("galaxyIntensity", Number(e.target.value))}
        />
      </label>
    </Box>
  );
}
