import { useRef, useEffect } from "react";
import statusFill from "../../utils/statusFill";
import statusStroke from "../../utils/statusStroke";

const Plus = ({
  itemObject,
  mapScale,
  rotate,
  hoverItem,
  item,
  maxFontSizeCircle,
  fontCircle = false,
}) => {
  return hoverItem ? (
    <g
      cursor={"pointer"}
      transform={`translate(${
        itemObject?.focus_coordinate?.x_coordinate / mapScale
      }, ${itemObject?.focus_coordinate?.y_coordinate / mapScale})`}
    >
      <g transform={`rotate(${-rotate})`}>
        <circle r="14" fill="#1F88D4" />
        <circle r="6" fill="#ffffff" />
        <line
          x1={-4}
          y1={0}
          x2={4}
          y2={0}
          style={{ stroke: "#1F88D4", strokeWidth: "1px" }}
        />
        <line
          x1={0}
          y1={-4}
          x2={0}
          y2={4}
          style={{ stroke: "#1F88D4", strokeWidth: "1px" }}
        />
      </g>
    </g>
  ) : fontCircle ? (
    <g
      cursor={"pointer"}
      transform={`translate(${
        itemObject?.focus_coordinate?.x_coordinate / mapScale
      }, ${itemObject?.focus_coordinate?.y_coordinate / mapScale})`}
    >
      <g transform={`rotate(${-rotate})`}>
        <text
          textAnchor="middle"
          alignmentBaseline="middle"
          style={{ fontSize: maxFontSizeCircle }}
        >
          {item?.name}
        </text>
      </g>
    </g>
  ) : (
    <g
      cursor={"pointer"}
      transform={`translate(${
        itemObject?.focus_coordinate?.x_coordinate / mapScale
      }, ${itemObject?.focus_coordinate?.y_coordinate / mapScale})`}
    >
      <g transform={`rotate(${-rotate})`}>
        <circle r="14" fill={statusFill(item)} stroke={statusStroke(item)} />
        <text
          textAnchor="middle"
          alignmentBaseline="middle"
          style={{ fontSize: maxFontSizeCircle }}
        >
          {item?.name}
        </text>
      </g>
    </g>
  );
};

const Avatar = ({ itemObject, item, mapScale, rotate }) => {
  return (
    <g
      transform={`translate(${
        itemObject?.focus_coordinate?.x_coordinate / mapScale
      }, ${itemObject?.focus_coordinate?.y_coordinate / mapScale})`}
    >
      <g transform={`rotate(${-rotate})`}>
        <foreignObject
          className="rounded-full"
          width={28}
          height={28}
          x={-14}
          y={-14}
        >
          <img
            className="w-8 h-8 rounded-full"
            src={item?.reservations[0]?.user?.avatar_url}
            alt="avatar"
            width={28}
            height={28}
          />
        </foreignObject>
      </g>
    </g>
  );
};

const HoverItemStatus = ({
  itemObject,
  mapScale,
  item,
  hoverItem,
  rotate,
  maxFontSizeCircle,
}) => {
  // console.log(item);
  return item?.active && !item?.reservations?.length ? (
    <Plus
      itemObject={itemObject}
      mapScale={mapScale}
      hoverItem={hoverItem}
      rotate={rotate}
      item={item}
      maxFontSizeCircle={maxFontSizeCircle}
    />
  ) : item?.active && item?.reservations?.length ? (
    <Avatar
      itemObject={itemObject}
      item={item}
      mapScale={mapScale}
      rotate={rotate}
    />
  ) : null;
};

export default HoverItemStatus;
