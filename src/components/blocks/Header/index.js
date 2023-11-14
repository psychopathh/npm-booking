import Pen from "../../../assets/pen.svg";
import Back from "../../../assets/back.svg";
import useStore from "../../../store";

const Header = ({
  setToggleEditMode,
  toggleEditMode,
  saveToggle,
  setSaveToggle,
  setActiveEditItem,
  setSelectItem,
}) => {
  const allDataMeta = useStore((store) => store.data.allDataMeta);
  return (
    <div className="fixed flex right-5 top-4 z-50">
      {saveToggle && toggleEditMode && (
        <button
          onClick={() => {
            // setActiveEditItem(null);
            // setSelectItem(null);
            // setSaveToggle(false);
            const event = new CustomEvent("return");
            window.document.dispatchEvent(event);
          }}
          className={`bg-white flex items-center rounded transition-all duration-500 border text-sm justify-center shadow-buttonHeader w-12 h-8 mr-2`}
        >
          <img
            // eslint-disable-next-line no-undef
            src={process.env.REACT_APP_PUBLIC_URL + Back}
            alt="back"
            className="mr-1"
          />
        </button>
      )}
      {saveToggle && toggleEditMode ? (
        <button
          onClick={() => {
            setActiveEditItem(null);
            setSelectItem(null);
            setSaveToggle(false);
            const event = new CustomEvent("save");
            event.param = { json: allDataMeta };
            window.document.dispatchEvent(event);
          }}
          className={`bg-white flex items-center rounded transition-all duration-500 border text-sm justify-center shadow-buttonHeader w-56 h-8`}
        >
          Сохранить изменения
        </button>
      ) : (
        <button
          onClick={() => {
            setToggleEditMode(!toggleEditMode);
          }}
          className={`bg-white flex items-center rounded transition-all duration-500 border text-sm justify-center shadow-buttonHeader w-56 h-8`}
        >
          <img
            // eslint-disable-next-line no-undef
            src={process.env.REACT_APP_PUBLIC_URL + Pen}
            alt="pen"
            className="mr-1"
          />
          Редактирование рассадки
        </button>
      )}
    </div>
  );
};

export default Header;
