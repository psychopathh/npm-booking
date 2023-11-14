import { useState, useRef, useEffect } from "react";
import { useQuery } from "react-query";
import { getFloorMain } from "../../../api";
import { ColorRing } from "react-loader-spinner";
import useStore from "../../../store";
import Modal from "../../ui/Modal";
import Filter from "../Filter";
import Header from "../Header";
import ModalAddOrEdit from "../../ui/ModalAddOrEditItem";
import ZoomComponent from "../ZoomComponent";
import useWindowDimensions from "../../utils/useDemension";

const StageScene = ({ allDataJson }) => {
  const { width, height } = useWindowDimensions();
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [panningDisabled, setPanningDisabled] = useState(false);
  const [rotateActive, setRotateActive] = useState(false);
  const [disabledZoomComponent, setDisabledZoomComponent] = useState(false);
  const [mouseDefaultPositionDown, setMouseDefaultPositionDown] = useState({
    x: 0,
    y: 0,
  });
  const [toggleEditMode, setToggleEditMode] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [saveToggle, setSaveToggle] = useState(false);

  const { setAllDataMeta, setActiveEditItem, setSelectItem } = useStore(
    (store) => store
  );
  const allDataMeta = useStore((store) => store.data.allDataMeta);
  const activeEditItem = useStore((store) => store.data.activeEditItem);
  const selectItem = useStore((store) => store.data.selectItem);

  const { isLoading: floorMainLoading } = useQuery(
    ["floor_main"],
    () => getFloorMain(),
    {
      onSuccess: (data) => {
        if (!allDataJson) {
          setAllDataMeta(data.data);
        }
      },
    }
  );
  const Viewer = useRef(null);

  if (floorMainLoading) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ColorRing
          visible={true}
          height="80"
          width="80"
          ariaLabel="blocks-loading"
          wrapperStyle={{}}
          wrapperClass="blocks-wrapper"
        />
      </div>
    );
  }

  const mapSizeMM = allDataMeta.maps[0].size;
  const mapSize = {
    width: +mapSizeMM?.width / 20,
    height: +mapSizeMM?.height / 20,
  };
  const mapScale = +mapSizeMM?.width / +mapSize?.width;
  const mapScaleZeroPoint = allDataMeta.maps[0]?.zero_coordinate;

  const handleClick = (e) => {
    if (rotateActive) {
      setDisabledZoomComponent(false);
      setRotateActive(false);
    }
    if (
      Math.round(e.clientX) === Math.round(mouseDefaultPositionDown.x) &&
      Math.round(e.clientY) === Math.round(mouseDefaultPositionDown.y)
    ) {
      if (activeEditItem?.id) {
        setActiveEditItem(null);
      }
      if (selectItem?.id) {
        setSelectItem(null);
      }
    }
  };

  const handleMouseDown = (e) => {
    setMouseDefaultPositionDown({
      x: e?.clientX,
      y: e?.clientY,
    });
  };

  return (
    <div
      className="flex"
      onClick={(e) => handleClick(e)}
      onMouseDown={(e) => handleMouseDown(e)}
    >
      {toggleEditMode && width > 800 ? (
        <Filter
          showFilter={showFilter}
          zones={allDataMeta?.zones}
          categoies={allDataMeta?.object_categories}
          setShowFilter={setShowFilter}
          data={allDataMeta?.objects}
          viewer={Viewer}
          setShowEditModal={setShowEditModal}
        />
      ) : null}
      {width > 800 ? (
        <Header
          setActiveEditItem={setActiveEditItem}
          setSelectItem={setSelectItem}
          saveToggle={saveToggle}
          toggleEditMode={toggleEditMode}
          setToggleEditMode={setToggleEditMode}
          setSaveToggle={setSaveToggle}
        />
      ) : null}
      {showEditModal ? (
        <ModalAddOrEdit
          viewer={Viewer}
          allDataMeta={allDataMeta}
          setShowEditModal={setShowEditModal}
        />
      ) : null}
      {showModal ? <Modal setShowModal={setShowModal} /> : null}
      <ZoomComponent
        showFilter={showFilter}
        setRotateActive={setRotateActive}
        toggleEditMode={toggleEditMode}
        Viewer={Viewer}
        setPanningDisabled={setPanningDisabled}
        setDisabledZoomComponent={setDisabledZoomComponent}
        panningDisabled={panningDisabled}
        disabledZoomComponent={disabledZoomComponent}
        allDataMeta={allDataMeta}
        mapSize={mapSize}
        width={width}
        height={height}
        mapScale={mapScale}
        setShowEditModal={setShowEditModal}
        setShowModal={setShowModal}
        saveToggle={saveToggle}
        mapScaleZeroPoint={mapScaleZeroPoint}
        setSaveToggle={setSaveToggle}
      />
    </div>
  );
};

export default StageScene;
