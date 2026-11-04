import React, { useId } from "react";

/**
 * Directional (anisotropic) motion blur. Blurs only along the axis of travel,
 * like a camera shutter: pass the element's velocity in px/frame.
 */
export const DirBlur: React.FC<{
  vx?: number;
  vy?: number;
  strength?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ vx = 0, vy = 0, strength = 0.5, style, children }) => {
  const id = `db${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const bx = Math.min(Math.abs(vx) * strength, 120);
  const by = Math.min(Math.abs(vy) * strength, 120);
  const active = bx > 0.3 || by > 0.3;
  return (
    <>
      {active ? (
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} />
          </filter>
        </svg>
      ) : null}
      <div style={{ ...style, filter: active ? `url(#${id})` : undefined }}>{children}</div>
    </>
  );
};
