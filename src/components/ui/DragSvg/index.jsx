import { useState, useEffect, useCallback, useRef } from "react";
import useStore from "../../../store";
import InlineSVG from "react-inlinesvg";
import svgFillEditMode from "../../utils/svgFillEditMode";
import svgFillNoEditMode from "../../utils/svgFillNoEditMode";
import Tooltip from "../Tooltip";
import HoverItemStatus from "../HoverItemStatus";

const DragSvg = ({
  x,
  y,
  href,
  zoomComponentActive,
  width,
  height,
  setPanningDisabled,
  setDisabledZoomComponent,
  editItem,
  item,
  deltaX,
  deltaY,
  mapScale,
  editMode,
  setShowModal,
  setSaveToggle,
  setShowEditModal,
  changeIndexObjectsArray,
  widthScreen,
  setRotateActive,
  mapSize,
  itemObject,
  maxFontSizeCircle,
}) => {
  const { setActiveItem, setActiveEditItem, setSelectItem } = useStore(
    (store) => store
  );
  const activeEditItem = useStore((store) => store.data.activeEditItem);
  const selectItem = useStore((store) => store.data.selectItem);
  const active = activeEditItem?.id === item?.id;
  const select = selectItem?.id === item?.id;
  const [position, setPosition] = useState({
    x: x,
    y: y,
    active: false,
    rotate: 0,
    offset: {},
  });
  const [load, setLoad] = useState(false);
  const [down, setDawn] = useState(false);
  const [hoverItem, setHoverItem] = useState(false);
  const [mouseDefaultPositionDown, setMouseDefaultPositionDown] = useState({
    x: 0,
    y: 0,
  });
  const ref = useRef();
  const svgRef = useRef();

  const handlePointerDown = (e) => {
    if (editMode) {
      setMouseDefaultPositionDown({
        x: e?.clientX,
        y: e?.clientY,
      });
      if (activeEditItem?.id === item.id) {
        setDawn(true);
        setPanningDisabled(true);
        setDisabledZoomComponent(true);
        const el = e.target;
        const bbox = e.target.getBoundingClientRect();
        const x = e.clientX - bbox.left;
        const y = e.clientY - bbox.top;
        el.setPointerCapture(e.pointerId);
        setPosition({
          ...position,
          active: true,
          offset: {
            x,
            y,
          },
        });
      }
    }
  };

  useEffect(() => {
    if (!editMode) {
      setActiveEditItem(null);
      setSelectItem(null);
    }
  }, [editMode]);

  const handlePointerMove = (e) => {
    const bbox = e.target.getBoundingClientRect();
    const x = e.clientX - bbox.left;
    const y = e.clientY - bbox.top;
    if (position.active) {
      setPosition({
        ...position,
        x:
          position.x - (position.offset.x - x) < 0
            ? 0
            : position.x + width - (position.offset.x - x) > mapSize?.width
            ? mapSize?.width - width
            : position.x - (position.offset.x - x),
        y:
          position.y - (position.offset.y - y) < 0
            ? 0
            : position.y + height - (position.offset.y - y) > mapSize?.height
            ? mapSize?.height - height
            : position.y - (position.offset.y - y),
      });
    }
  };
  const handlePointerUp = (e) => {
    if (down) {
      e.stopPropagation();
      setPanningDisabled(false);
      setDisabledZoomComponent(false);
      const positions = {
        x_coordinate: Math.round(position.x * mapScale - deltaX),
        y_coordinate: Math.round(position.y * mapScale - deltaY),
      };
      editItem(item, positions);
      setPosition({
        ...position,
        active: false,
      });
      setSaveToggle(true);
      setDawn(false);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (editMode) {
      changeIndexObjectsArray(item);
      if (e.detail === 1) {
        setActiveEditItem(item);
        setSelectItem(item);
      }
      if (e.detail === 2) {
        if (
          Math.round(e.clientX) - 5 < Math.round(mouseDefaultPositionDown.x) &&
          Math.round(e.clientX) + 5 > Math.round(mouseDefaultPositionDown.x) &&
          Math.round(e.clientY) - 5 < Math.round(mouseDefaultPositionDown.y) &&
          Math.round(e.clientY) + 5 > Math.round(mouseDefaultPositionDown.y)
        ) {
          setActiveItem(item);
          setSelectItem(item);
          setShowEditModal(true);
        }
      }
    } else {
      const event = new CustomEvent("openBookingModal");
      event.param = { id: item.id };
      window.document.dispatchEvent(event);
    }
  };

  const handlePointerDownRotate = useCallback(
    (e) => {
      e.stopPropagation();
      setDisabledZoomComponent(true);
      setRotateActive(true);
      document.addEventListener("mousemove", handlePointerMoveRotate);
      document.addEventListener("mouseup", mouseUpRotate);
    },
    [position]
  );

  const mouseUpRotate = useCallback(
    (e) => {
      e.stopPropagation();
      let x2 = e.clientX,
        y2 = e.clientY,
        x1 = ref.current?.getBoundingClientRect().x + width / 2,
        y1 = ref.current?.getBoundingClientRect().y + height / 2,
        angleRads = Math.atan2(y2 - y1, x2 - x1),
        angleDeg = angleRads * (180 / Math.PI) + 90 - 180;
      const positions = {
        x_coordinate: Math.round(position.x * mapScale - deltaX),
        y_coordinate: Math.round(position.y * mapScale - deltaY),
        rotate: angleDeg,
      };
      editItem(item, positions);
      document.removeEventListener("mousemove", handlePointerMoveRotate);
      document.removeEventListener("mouseup", mouseUpRotate);
    },
    [position]
  );

  const handlePointerMoveRotate = useCallback(
    (e) => {
      e.stopPropagation();
      let x2 = e.clientX,
        y2 = e.clientY,
        x1 = ref.current?.getBoundingClientRect().x + width / 2,
        y1 = ref.current?.getBoundingClientRect().y + height / 2,
        angleRads = Math.atan2(y2 - y1, x2 - x1),
        angleDeg = angleRads * (180 / Math.PI) + 90 - 180;
      setPosition({
        ...position,
        rotate: angleDeg,
      });
    },
    [position]
  );

  useEffect(() => {
    if (editMode) {
      svgFillEditMode({ svgRef, select });
    } else {
      if (svgRef?.current) {
        svgFillNoEditMode({ svgRef, item });
      }
    }
  }, [select, editMode, svgRef?.current, item]);

  const handleShowTooltip = () => {
    setHoverItem(true);
    changeIndexObjectsArray(item);
    // setPanningDisabled(true);
    // setDisabledZoomComponent(true);
  };

  const handleHideTooltip = () => {
    setHoverItem(false);
    // setPanningDisabled(false);
    // setDisabledZoomComponent(false);
  };

  // console.log(itemObject);

  return (
    <>
      <g
        id={item?.id}
        transform={`translate(${position.x},${position.y}) rotate(${position.rotate})`}
        style={{
          transformOrigin: "center",
          transformBox: "fill-box",
          willChange: "transform",
        }}
        ref={ref}
      >
        <InlineSVG
          opacity={load ? 1 : 0}
          onLoad={() => setLoad(true)}
          innerRef={svgRef}
          width={width}
          height={height}
          src={href}
        />
        {!editMode ? (
          <HoverItemStatus
            item={item}
            maxFontSizeCircle={maxFontSizeCircle}
            rotate={position.rotate}
            hoverItem={hoverItem}
            itemObject={itemObject}
            mapScale={mapScale}
          />
        ) : null}
      </g>
      <g
        transform={`translate(${position.x},${position.y})`}
        style={{
          transformOrigin: "center",
          transformBox: "fill-box",
          willChange: "transform",
        }}
        visibility={editMode && active ? "" : "hidden"}
      >
        <line
          x1={width / 2}
          y1={height / 2}
          x2={
            width / 2 +
            (width / 2 - width / 2) *
              Math.cos(position.rotate * (Math.PI / 180)) -
            (height + 40 - height / 2) *
              Math.sin(position.rotate * (Math.PI / 180))
          }
          y2={
            height / 2 +
            (width / 2 - width / 2) *
              Math.sin(position.rotate * (Math.PI / 180)) +
            (height + 40 - height / 2) *
              Math.cos(position.rotate * (Math.PI / 180))
          }
          style={{ stroke: "#000", strokeWidth: "1px" }}
        />
        <circle
          cx={
            width / 2 +
            (width / 2 - width / 2) *
              Math.cos(position.rotate * (Math.PI / 180)) -
            (height + 40 - height / 2) *
              Math.sin(position.rotate * (Math.PI / 180))
          }
          cy={
            height / 2 +
            (width / 2 - width / 2) *
              Math.sin(position.rotate * (Math.PI / 180)) +
            (height + 40 - height / 2) *
              Math.cos(position.rotate * (Math.PI / 180))
          }
          r="5"
          stroke="black"
          cursor={"ew-resize"}
          strokeWidth="1"
          fill="white"
          onPointerDown={handlePointerDownRotate}
        />
      </g>
      {!editMode && hoverItem ? (
        <Tooltip
          handleHideTooltip={handleHideTooltip}
          handleShowTooltip={handleShowTooltip}
          item={item}
          position={position}
          width={width}
          height={height}
          widthScreen={widthScreen}
        />
      ) : null}
      <rect
        transform={`translate(${position.x},${position.y}) rotate(${position.rotate})`}
        style={{
          transformOrigin: "center",
          transformBox: "fill-box",
          willChange: "transform",
        }}
        width={width}
        height={height}
        fill="transparent"
        cursor={
          active
            ? "all-scroll"
            : editMode
            ? "pointer"
            : !editMode && item?.active
            ? "pointer"
            : "default"
        }
        onPointerLeave={() => {
          !editMode ? handleHideTooltip() : () => {};
        }}
        onPointerEnter={() => {
          !editMode ? handleShowTooltip() : () => {};
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={(e) => (editMode ? handlePointerUp(e) : () => {})}
        onClick={(e) =>
          editMode ? handleClick(e) : item?.active ? handleClick(e) : () => {}
        }
        onPointerMove={(e) => (editMode ? handlePointerMove(e) : () => {})}
      />
    </>
  );
};

export default DragSvg;
