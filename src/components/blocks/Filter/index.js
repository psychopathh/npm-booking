import { useEffect, useState } from "react";
import useStore from "../../../store";
import ArrowFilter from "../../../assets/arrow-filter.svg";
import SwitchIcon from "../../../assets/swithFilter.svg";
import FilterItem from "../../ui/FilterItem";
import sortForObjectOrZone from "../../utils/sortForObjectOrZone";

const Filter = ({
  data,
  setShowFilter,
  showFilter,
  zones,
  viewer,
  setShowEditModal,
  categoies,
}) => {
  const [filter, setFilter] = useState("Размещен");
  const [dataFilter, setDataFilter] = useState(null);
  const { setActiveItem, setActiveEditItem, setSelectItem } = useStore(
    (store) => store
  );

  const [category, setCategory] = useState(null);
  const [objectFilter, setObjectFilter] = useState("desc");
  const [zoneFilter, setZoneFilter] = useState(null);
  // const activeEditItem = useStore((store) => store.data.activeEditItem);
  // console.log(data);
  useEffect(() => {
    if (filter === "Размещен") {
      setDataFilter(
        sortForObjectOrZone({
          arr: data.filter(
            (item) =>
              item?.status_name === "Размещен" &&
              (category ? item?.object_category_id === category : true)
          ),
          objectFilter,
          zoneFilter,
          zones,
        })
      );
    }
    if (filter === "Не размещен") {
      setDataFilter(
        sortForObjectOrZone({
          arr: data.filter(
            (item) =>
              item?.status_name === "Не размещен" &&
              (category ? item?.object_category_id === category : true)
          ),
          objectFilter,
          zoneFilter,
          zones,
        })
      );
    }
    if (filter === "Архив") {
      setDataFilter(
        sortForObjectOrZone({
          arr: data.filter(
            (item) =>
              item?.status_name === "Архив" &&
              (category ? item?.object_category_id === category : true)
          ),
          objectFilter,
          zoneFilter,
          zones,
        })
      );
    }
  }, [filter, data, objectFilter, zoneFilter, category]);

  const handleClick = (e, item) => {
    e.stopPropagation();
    if (e.detail === 1) {
      if (item?.status_name === "Размещен") {
        viewer?.current?.zoomToElement(
          item?.id,
          viewer?.current?.instance?.transformState?.scale
        );
      }
      setSelectItem(item);
      setActiveEditItem(null);
    }
    if (e.detail === 2) {
      setShowEditModal(true);
      setActiveItem(item);
    }
  };

  const handleClickObjectSort = () => {
    if (objectFilter === "asc" || objectFilter === null) {
      setObjectFilter("desc");
      setZoneFilter(null);
    }
    if (objectFilter === "desc") {
      setObjectFilter("asc");
      setZoneFilter(null);
    }
  };

  const handleClickZonesSort = () => {
    if (zoneFilter === "asc" || zoneFilter === null) {
      setZoneFilter("desc");
      setObjectFilter(null);
    }
    if (zoneFilter === "desc") {
      setZoneFilter("asc");
      setObjectFilter(null);
    }
  };

  return !showFilter ? (
    <button
      onClick={(e) => {
        e.stopPropagation();
        viewer?.current?.resetTransform();
        setShowFilter(true);
      }}
      className={`bg-white fixed w-6 h-12 top-1/2 left-0 z-50 flex justify-center items-center border shadow-buttonHeader border-gray-200 transform -translate-y-1/2`}
    >
      <img
        // eslint-disable-next-line no-undef
        src={process.env.REACT_APP_PUBLIC_URL + ArrowFilter}
        alt="arrow"
      />
    </button>
  ) : (
    <div className="z-50 bg-white w-80 h-100 overflow-hidden w-80 h-screen shrink-0 border flex flex-col">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowFilter(false);
          viewer?.current?.resetTransform();
        }}
        className={`bg-white fixed w-6 h-12 top-1/2 left-80 z-50 flex justify-center items-center border shadow-buttonHeader border-gray-200 transform -translate-y-1/2`}
      >
        <img
          // eslint-disable-next-line no-undef
          src={process.env.REACT_APP_PUBLIC_URL + ArrowFilter}
          alt="arrow"
          className="rotate-180"
        />
      </button>
      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700 overflow-hidden shrink-0">
        <ul className="flex justify-between -mb-px mt-2 px-1">
          <li>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFilter("Размещен");
              }}
              className={`${
                filter === "Размещен"
                  ? "border-blueCustom border-b-4"
                  : "hover:border-b-4 hover:border-gray-300"
              } inline-block p-1 text-base font-semibold text-slate-800 rounded-t-lg active`}
            >
              Размещены
            </button>
          </li>
          <li>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFilter("Не размещен");
              }}
              className={`${
                filter === "Не размещен"
                  ? "border-blueCustom border-b-4"
                  : "hover:border-b-4 hover:border-gray-300"
              } inline-block p-1 text-base font-semibold text-slate-800 rounded-t-lg active`}
            >
              Не размещены
            </button>
          </li>
          <li>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFilter("Архив");
              }}
              className={`${
                filter === "Архив"
                  ? "border-blueCustom border-b-4"
                  : "hover:border-b-4 hover:border-gray-300"
              } inline-block p-1 text-base font-semibold text-slate-800 rounded-t-lg active `}
            >
              Архив
            </button>
          </li>
        </ul>
      </div>
      <div className="flex  border-b border-gray-300 w-full">
        <div className="flex px-2 w-full justify-between items-center my-4">
          <label
            htmlFor="type"
            className="block text-sm text-gray-900 dark:text-white mr-2"
          >
            Отображать:
          </label>
          <select
            onChange={(event) => setCategory(event.target?.value)}
            className="w-[305px] border border-gray-300 text-gray-900
                text-sm rounded focus:ring-blue-500 focus:border-blue-500 block
                p-2.5 dark:bg-gray-700 dark:border-gray-600
                dark:placeholder-gray-400 dark:text-white
                dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option selected value="">
              Выберите тип
            </option>
            {categoies?.map((item) => (
              <option key={item.id} value={item?.id}>
                {item?.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex  border-b border-gray-300 w-full">
        <div
          onClick={() => handleClickObjectSort()}
          className="w-1/2 pt-4 pl-2 pb-4 cursor-pointer flex hover:font-bold text-sm"
        >
          <p>Объект</p>
          <img
            // eslint-disable-next-line no-undef
            src={process.env.REACT_APP_PUBLIC_URL + SwitchIcon}
            className="ml-1"
            alt="swith"
          />
        </div>
        <div
          onClick={() => handleClickZonesSort()}
          className="w-1/2 pt-4 pb-4 cursor-pointer flex hover:font-bold text-sm"
        >
          <p>Зона</p>
          <img
            // eslint-disable-next-line no-undef
            src={process.env.REACT_APP_PUBLIC_URL + SwitchIcon}
            className="ml-1"
            alt="swith"
          />
        </div>
      </div>
      <div className="flex text-sm grow flex-col overflow-auto">
        {dataFilter?.map((item) => (
          <FilterItem
            zones={zones}
            key={item.id}
            item={item}
            handleClick={handleClick}
          />
        ))}
      </div>
      <div className="flex pb-3 pt-3 border-t border-gray-300">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowEditModal(true);
          }}
          className="text-white bg-blueCustom rounded text-lg px-2 py-2 outline-none focus:outline-none w-11/12 m-auto ease-linear transition-all duration-150"
        >
          Создать новый объект
        </button>
      </div>
    </div>
  );
};

export default Filter;
