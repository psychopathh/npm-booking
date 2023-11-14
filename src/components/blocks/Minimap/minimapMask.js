function MiniatureMask({
  SVGMinX,
  SVGMinY,
  SVGWidth,
  SVGHeight,
  x1,
  y1,
  x2,
  y2,
}) {
  return (
    <g>
      <defs>
        <mask id={`react-svg-pan-zoom_miniature_mask_234`}>
          <rect
            x={SVGMinX}
            y={SVGMinY}
            width={SVGWidth}
            height={SVGHeight}
            fill="#ffffff"
          />
          <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} />
        </mask>
      </defs>

      <rect
        x={SVGMinX}
        y={SVGMinY}
        width={SVGWidth}
        height={SVGHeight}
        style={{
          stroke: "none",
          fill: "#000",
          mask: `url(#react-svg-pan-zoom_miniature_mask_234)`,
          opacity: 0.4,
        }}
      />
    </g>
  );
}

export default MiniatureMask;
