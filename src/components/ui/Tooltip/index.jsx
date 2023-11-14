import { useEffect, useRef, useState } from "react";
import DeleteIcon from "../../../assets/delete.svg";
import DeleteIconWhite from "../../../assets/delete-white.svg";
import { useTransformContext } from "react-zoom-pan-pinch";

const NoActiveTooltip = ({ setTooltipSizes, refTooltip, item }) => {
  const context = useTransformContext();
  useEffect(() => {
    if (refTooltip?.current) {
      setTooltipSizes({
        width: refTooltip?.current?.offsetWidth,
        height: refTooltip?.current?.offsetHeight,
        x:
          refTooltip?.current?.getBoundingClientRect()?.x +
          refTooltip?.current?.offsetWidth * context?.transformState?.scale,
      });
    }
  }, []);
  return (
    <div
      ref={refTooltip}
      className={`w-fit py-1 px-3 z-[500] rounded-md bg-[#000000] before:content-['']`}
    >
      {item?.reservations?.length ? (
        item?.reservations?.map((el, i) => (
          <div
            key={el.user.id + i}
            className={`flex ${
              i !== item?.reservations?.length - 1 ? "mb-4" : ""
            }`}
          >
            <div className="mr-2.5">
              <img
                className="w-8 h-8 rounded-full"
                src={el?.user?.avatar_url}
                alt="avatar"
              />
            </div>
            <div>
              <p
                className={`text-xs ${
                  item?.reservations?.length > 1 ? "text-[#000]" : "text-[#fff]"
                }`}
              >
                {el?.user?.name}
              </p>
              <p
                className={`text-xs font-light ${
                  item?.reservations?.length > 1 ? "text-[#000]" : "text-[#fff]"
                }`}
              >
                С {el?.period?.from} до {el?.period?.to}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className={`text-sx text-[#fff]`}>Заблокировано</p>
      )}
    </div>
  );
};

const ActiveReservationTooltip = ({ setTooltipSizes, item, refTooltip }) => {
  const context = useTransformContext();

  useEffect(() => {
    if (refTooltip?.current) {
      setTooltipSizes({
        width: refTooltip?.current?.offsetWidth,
        height: refTooltip?.current?.offsetHeight,
        x:
          refTooltip?.current?.getBoundingClientRect()?.x +
          refTooltip?.current?.offsetWidth * context?.transformState?.scale,
      });
    }
  }, []);

  return (
    <div
      ref={refTooltip}
      className={`overflow-auto w-[290px] max-h-80 p-4 pb-4 z-[500] rounded-md ${
        item?.reservations?.length > 1 ? "bg-[#ffffff]" : "bg-[#000000]"
      }`}
    >
      {item?.reservations?.map((el, i) => (
        <div
          key={el.user.id + i}
          className={`flex relative ${
            i !== item?.reservations?.length - 1 ? "mb-4" : ""
          }`}
        >
          <div className="mr-2.5">
            <img
              className="w-8 h-8 rounded-full"
              src={el?.user?.avatar_url}
              alt="avatar"
            />
          </div>
          <div>
            <p
              className={`text-xs pr-2 ${
                item?.reservations?.length > 1 ? "text-[#000]" : "text-[#fff]"
              }`}
            >
              {el?.user?.name}
            </p>
            <p
              className={`text-xs pr-2 font-light ${
                item?.reservations?.length > 1 ? "text-[#000]" : "text-[#fff]"
              }`}
            >
              С {el?.period?.from} до {el?.period?.to}
            </p>
            {el?.my_reservation ? (
              <img
                style={{ pointerEvents: "visiblePainted" }}
                onClick={() => {
                  const event = new CustomEvent("deleteMyBooking");
                  event.param = { reservationId: el.id, idObject: item.id };
                  window.document.dispatchEvent(event);
                }}
                className="absolute right-0 top-1 cursor-pointer"
                src={
                  item?.reservations?.length > 1
                    ? // eslint-disable-next-line no-undef
                      process.env.REACT_APP_PUBLIC_URL + DeleteIcon
                    : // eslint-disable-next-line no-undef
                      process.env.REACT_APP_PUBLIC_URL + DeleteIconWhite
                }
                alt="delete"
              />
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
};

const Tooltip = ({
  item,
  handleHideTooltip,
  handleShowTooltip,
  position,
  width,
  height,
  widthScreen,
}) => {
  const [tooltipSizes, setTooltipSizes] = useState({
    width: 0,
    height: 0,
    x: 0,
  });
  const refTooltip = useRef();
  // console.log(tooltipSizes?.x);
  return (
    <g
      onPointerLeave={() => handleHideTooltip()}
      onPointerEnter={() => {
        handleShowTooltip();
      }}
      transform={
        tooltipSizes?.x > widthScreen
          ? `translate(${position.x - tooltipSizes?.width - 10},${position.y})`
          : `translate(${position.x + width + 10},${position.y})`
      }
    >
      <g>
        <foreignObject
          className="shadow-tooltip rounded-md"
          width={tooltipSizes?.width}
          height={tooltipSizes?.height}
        >
          {!item?.active ? (
            <NoActiveTooltip
              refTooltip={refTooltip}
              item={item}
              setTooltipSizes={setTooltipSizes}
            />
          ) : item?.reservations?.length ? (
            <ActiveReservationTooltip
              item={item}
              refTooltip={refTooltip}
              setTooltipSizes={setTooltipSizes}
            />
          ) : (
            <></>
          )}
        </foreignObject>
        {/* <svg width="8" x={-8} y={14} height="16">
          <filter id="shadow" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.3" />
          </filter>
          <polygon
            filter="url(#shadow)"
            points="8,0 8,16 0,8"
            fill={item?.reservations?.length > 1 ? "#fff" : "#000"}
          />
        </svg> */}
        <rect
          transform={
            tooltipSizes?.x > widthScreen
              ? `translate(${tooltipSizes?.width})`
              : "translate(-10)"
          }
          width={10}
          height={height > tooltipSizes?.height ? tooltipSizes?.height : height}
          fill="transparent"
        />
      </g>
    </g>
  );
};

export default Tooltip;
