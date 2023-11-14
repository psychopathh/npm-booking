import { create } from "zustand";
// import { IData } from "../types/IData";

const useStore = create((set, get) => ({
  data: {
    allDataMeta: {},
    activeItem: null,
    activeEditItem: null,
    selectItem: null,
    viewportCoordinates: {
      x: 0,
      y: 0,
      height: 0,
      width: 0,
      scale: 0,
    },
  },
  setAllDataMeta: (data) =>
    set((state) => ({
      data: { ...state.data, allDataMeta: data },
    })),
  setViewportCoordinates: ({ x, y, width, height, scale }) =>
    set((state) => ({
      data: {
        ...state.data,
        viewportCoordinates: {
          x: x,
          y: y,
          width: width,
          height: height,
          scale: scale,
        },
      },
    })),
  changeItem: (item) => {
    const data = get().data.allDataMeta?.objects;
    const newData = data.map((el) => {
      if (el.id === item.id) {
        return item;
      } else {
        return el;
      }
    });
    const event = new CustomEvent("editObject");
    event.param = { item: item };
    window.document.dispatchEvent(event);
    set((state) => ({
      data: {
        ...state.data,
        allDataMeta: { ...state.data?.allDataMeta, objects: newData },
      },
    }));
  },
  setActiveItem: (item) =>
    set((state) => ({
      data: { ...state.data, activeItem: item },
    })),
  setSelectItem: (item) =>
    set((state) => ({
      data: { ...state.data, selectItem: item },
    })),
  setActiveEditItem: (item) =>
    set((state) => ({
      data: { ...state.data, activeEditItem: item },
    })),
  addObject: (item) => {
    const allDataMeta = get().data.allDataMeta;
    const newItem = {
      ...item,
      active: true,
    };
    const event = new CustomEvent("addObject");
    event.param = { item: newItem };
    window.document.dispatchEvent(event);
    set((state) => ({
      data: {
        ...state.data,
        selectItem: newItem,
        allDataMeta: {
          ...allDataMeta,
          objects: [...allDataMeta.objects, newItem],
        },
      },
    }));
  },
  clearActiveItem: () =>
    set((state) => ({
      data: { ...state.data, activeItem: null },
    })),
  editItem: (item, positions) => {
    const data = get().data.allDataMeta?.objects;
    const editEl = data.find((el) => el.id === item.id);
    if (
      +editEl.coordinate.x_coordinate !== positions.x_coordinate ||
      +editEl.coordinate.y_coordinate !== positions.y_coordinate ||
      +editEl.coordinate.rotate !== positions.rotate
    ) {
      const newData = data.map((el) => {
        if (el.id === item.id) {
          return { ...el, coordinate: positions };
        } else {
          return el;
        }
      });
      const event = new CustomEvent("editObject");
      event.param = { item: { ...editEl, coordinate: positions } };
      window.document.dispatchEvent(event);
      set((state) => ({
        data: {
          ...state.data,
          allDataMeta: { ...state.data?.allDataMeta, objects: newData },
        },
      }));
    }
  },
}));

export default useStore;
