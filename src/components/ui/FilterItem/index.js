import useStore from "../../../store";

const FilterItem = ({ handleClick, item, zones }) => {
  const zone = zones.find((el) => el.id === item?.zone_id);
  const selectItem = useStore((store) => store.data.selectItem);
  // console.log(zone);
  const select = selectItem?.id === item?.id;

  return (
    <div
      onClick={(e) => handleClick(e, item)}
      key={item.id}
      className={`${
        select ? "bg-gray-300" : "hover:bg-gray-300"
      } pt-1 pb-1 pl-2 pr-2 flex items-center cursor-pointer transition-all duration-500 w-full border-b border-gray-300 `}
    >
      <div className="w-1/2">
        <p className="mr-2">{item.name}</p>
      </div>
      <div className="w-1/2">
        <p className="mr-2">{zone?.name}</p>
      </div>
    </div>
  );
};

export default FilterItem;
