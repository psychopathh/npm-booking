import { applyToPoints, inverse } from "transformation-matrix";
import MiniatureMask from "./minimapMask";
import { useMemo, useState } from "react";
import { useTransformEffect, useTransformInit } from "react-zoom-pan-pinch";
// import { useThrottleState } from "@better-hooks/performance";

function CustomMinimap({
  background,
  width: miniatureWidth,
  height: miniatureHeight,
  miniatureOpen,
  SVGWidth,
  SVGHeight,
  viewerWidth,
  viewerHeight,
  children,
}) {
  const [SVGMinX] = useState(0);
  const [SVGMinY] = useState(0);
  const [scale, setScale] = useState(0);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);

  useTransformEffect(({ state }) => {
    setScale(state?.scale);
    setPositionX(state?.positionX);
    setPositionY(state?.positionY);
  });

  useTransformInit(({ state }) => {
    setScale(state?.scale);
    setPositionX(state?.positionX);
    setPositionY(state?.positionY);
  });

  let ratio = SVGHeight / SVGWidth;
  const [zoomToFit, setZoomToFit] = useState(0);

  useMemo(() => {
    setZoomToFit(
      ratio >= 1 ? miniatureHeight / SVGHeight : miniatureWidth / SVGWidth
    );
  }, [ratio, miniatureHeight, SVGHeight, miniatureWidth, SVGWidth]);

  let [{ x: x1, y: y1 }, { x: x2, y: y2 }] = applyToPoints(
    inverse({ a: scale, b: 0, c: 0, d: scale, e: positionX, f: positionY }),
    [
      { x: 0, y: 0 },
      { x: viewerWidth, y: viewerHeight },
    ]
  );
  let width, height;
  if (miniatureOpen) {
    width = miniatureWidth;
    height = miniatureHeight;
  } else {
    width = 23;
    height = 23;
  }

  let style = {
    position: "absolute",
    overflow: "hidden",
    outline: "1px solid rgba(19, 20, 22, 0.90)",
    transition: "width 200ms ease, height 200ms ease, bottom 200ms ease",
    width: width + "px",
    height: height + "px",
    bottom: "6px",
    right: "6px",
    zIndex: 501,
    background,
  };

  let centerTranslation =
    ratio >= 1
      ? `translate(${
          (miniatureWidth - SVGWidth * zoomToFit) / 2 - SVGMinX * zoomToFit
        }, ${-SVGMinY * zoomToFit})`
      : `translate(${-SVGMinX * zoomToFit}, ${
          (miniatureHeight - SVGHeight * zoomToFit) / 2 - SVGMinY * zoomToFit
        })`;

  return (
    <div role="navigation" style={style}>
      <svg
        width={miniatureWidth}
        height={miniatureHeight}
        style={{ pointerEvents: "none" }}
      >
        <g transform={centerTranslation}>
          <g transform={`scale(${zoomToFit}, ${zoomToFit})`}>
            <rect
              fill={background}
              x={SVGMinX}
              y={SVGMinY}
              width={SVGWidth}
              height={SVGHeight}
            />
            <foreignObject width={SVGWidth} height={SVGHeight}>
              {children}
            </foreignObject>
            {x1 ? (
              <MiniatureMask
                SVGWidth={SVGWidth}
                SVGHeight={SVGHeight}
                SVGMinX={SVGMinX}
                SVGMinY={SVGMinY}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                zoomToFit={zoomToFit}
              />
            ) : null}
          </g>
        </g>
      </svg>
    </div>
  );
}

export default CustomMinimap;
