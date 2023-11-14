import { useState, useMemo, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import CustomMinimap from "../Minimap";
import useStore from "../../../store";
import DragSvg from "../../ui/DragSvg";
import { apiMeta } from "../../../variables";
import sizeMap from "../../utils/sizeMap";
import MiniatureToggleButton from "../Minimap/minimapToggleButton";
import findMaxFontSize from "../../utils/findMaxFontSize";

const ZoomComponent = ({
  allDataMeta,
  Viewer,
  // showFilter,
  toggleEditMode,
  mapSize,
  mapScale,
  setShowModal,
  saveToggle,
  mapScaleZeroPoint,
  setSaveToggle,
  setShowEditModal,
  width,
  height,
  panningDisabled,
  setPanningDisabled,
  setDisabledZoomComponent,
  disabledZoomComponent,
  setRotateActive,
}) => {
  const [objectsArray, setObjectsArray] = useState(allDataMeta?.objects);
  const { editItem } = useStore((store) => store);
  const [mapWidth, setMapWidth] = useState(0);
  const [miniatureOpen, setMiniatureOpen] = useState(true);
  const [maxFontSizeCircle, setMaxFontSizeCircle] = useState(0);
  const [zoomComponentActive, setZoomComponentActive] = useState(false);
  const [mapHeight, setMapHeight] = useState(0);

  const handleKeyPress = (event) => {
    if (event.key === "+" || event.key === "=") {
      Viewer?.current?.zoomIn(0.06);
    } else if (event.key === "-") {
      Viewer?.current?.zoomOut(0.06);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  useMemo(() => {
    const { widthMap, heightMap } = sizeMap({
      width,
      height,
      stageWidth: +mapSize.width / 2,
      stageHeight: +mapSize.height / 2,
    });
    setMapWidth(Math.floor(widthMap));
    setMapHeight(Math.floor(heightMap));
  }, [width, height, mapSize.width, mapSize.height]);

  useMemo(() => {
    setObjectsArray(allDataMeta?.objects);
    const objectsArrayActive = allDataMeta?.objects?.filter(
      (item) => item.status_name === "Размещен" && !item?.reservations?.length
    );
    const objectsArrayNames = objectsArrayActive?.map((item) => item.name);
    const maxFontSize = findMaxFontSize(objectsArrayNames, 27);
    setMaxFontSizeCircle(maxFontSize);
  }, [allDataMeta?.objects]);

  const changeIndexObjectsArray = (item) => {
    const elementToBringToFront = objectsArray.filter(
      (el) => el?.id !== item?.id
    );
    elementToBringToFront.push(item);
    setObjectsArray(elementToBringToFront);
  };

  const objectsCollection = allDataMeta?.object_types;
  const image = `${apiMeta + allDataMeta?.maps[0]?.image_link}`;

  return (
    <>
      <MiniatureToggleButton
        miniatureOpen={miniatureOpen}
        setMiniatureOpen={setMiniatureOpen}
      />
      <TransformWrapper
        wheel={{ step: 0.06 }}
        smooth={false}
        panning={{
          velocityDisabled: true,
          disabled: panningDisabled,
        }}
        onPanningStart={() => setZoomComponentActive(true)}
        onPanningStop={() => setZoomComponentActive(false)}
        onWheelStart={() => setZoomComponentActive(true)}
        onWheelStop={() => setZoomComponentActive(false)}
        onZoomStart={() => setZoomComponentActive(true)}
        onZoomStop={() => setZoomComponentActive(false)}
        limitToBounds={false}
        doubleClick={{ disabled: true }}
        disablePadding={true}
        disabled={disabledZoomComponent}
        ref={Viewer}
        initialScale={
          +mapSize.width >= +mapSize.height
            ? width / +mapSize?.width
            : height / +mapSize.height
        }
        minScale={
          +mapSize.width >= +mapSize.height
            ? width / +mapSize?.width / 1.2
            : height / +mapSize.height / 1.2
        }
        centerOnInit={true}
        maxScale={1.9}
      >
        <CustomMinimap
          background="#fff"
          width={mapWidth}
          setMiniatureOpen={setMiniatureOpen}
          miniatureOpen={miniatureOpen}
          height={mapHeight}
          SVGWidth={+mapSize.width}
          SVGHeight={+mapSize.height}
          viewerWidth={width}
          viewerHeight={height}
        >
          <svg width={+mapSize.width} height={+mapSize.height}>
            <image
              width={+mapSize.width}
              height={+mapSize.height}
              href={image}
            />
          </svg>
        </CustomMinimap>
        <TransformComponent
          wrapperStyle={{ maxWidth: "100%", width: "100%", maxHeight: "100vh" }}
        >
          <svg width={+mapSize.width} height={+mapSize.height}>
            <image
              width={+mapSize.width}
              height={+mapSize.height}
              href={image}
            />
            {objectsArray?.map((item, i) => {
              const itemObject = objectsCollection?.find(
                (el) => el.id === item?.object_type_id
              );
              const imageUrl = `${apiMeta + itemObject?.image_link}`;
              const widthImage = itemObject?.size?.width / mapScale;
              const heightImage = itemObject?.size?.depth / mapScale;
              if (item?.status_name === "Размещен") {
                return (
                  <DragSvg
                    changeIndexObjectsArray={changeIndexObjectsArray}
                    setShowEditModal={setShowEditModal}
                    setShowModal={setShowModal}
                    saveToggle={saveToggle}
                    editMode={toggleEditMode}
                    editItem={editItem}
                    maxFontSizeCircle={maxFontSizeCircle}
                    zoomComponentActive={zoomComponentActive}
                    setPanningDisabled={setPanningDisabled}
                    setDisabledZoomComponent={setDisabledZoomComponent}
                    x={
                      (+item.coordinate.x_coordinate +
                        +mapScaleZeroPoint?.x_coordinate) /
                      mapScale
                    }
                    y={
                      (+item.coordinate.y_coordinate +
                        +mapScaleZeroPoint?.y_coordinate) /
                      mapScale
                    }
                    key={item.id}
                    href={imageUrl}
                    deltaX={+mapScaleZeroPoint?.x_coordinate}
                    deltaY={+mapScaleZeroPoint?.y_coordinate}
                    mapScale={mapScale}
                    setRotateActive={setRotateActive}
                    width={widthImage}
                    height={heightImage}
                    heightScreen={height}
                    widthScreen={width}
                    item={item}
                    itemObject={itemObject}
                    mapSize={mapSize}
                    setSaveToggle={setSaveToggle}
                  />
                );
              } else {
                return null;
              }
            })}
          </svg>
        </TransformComponent>
      </TransformWrapper>
    </>
  );
};

export default ZoomComponent;
