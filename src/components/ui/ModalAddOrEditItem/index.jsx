import { Formik, Field, Form } from "formik";
import { v4 as uuidv4 } from "uuid";
import { apiMeta } from "../../../variables";
import useStore from "../../../store";

const ModalAddOrEdit = ({ setShowEditModal, allDataMeta, viewer }) => {
  const { clearActiveItem, changeItem, addObject } = useStore((store) => store);
  const activeItem = useStore((store) => store.data.activeItem);
  const categories = allDataMeta?.object_categories;
  const types = allDataMeta?.object_types;
  const zones = allDataMeta?.zones;
  const handleSubmit = (values) => {
    if (activeItem?.id) {
      const newItem = {
        ...activeItem,
        object_category_id: values?.category,
        name: values?.name,
        status_name: values?.status,
        object_type_id: values?.type,
        zone_id: values?.zone,
      };
      changeItem(newItem);
      setShowEditModal(false);
    } else {
      const coordinate = {
        x_coordinate: allDataMeta?.maps[0]?.size?.width / 2,
        y_coordinate: allDataMeta?.maps[0]?.size?.height / 2,
      };
      const newItem = {
        id: uuidv4(),
        object_category_id: values?.category,
        name: values?.name,
        status_name: values?.status,
        object_type_id: values?.type,
        zone_id: values?.zone,
        coordinate,
      };
      addObject(newItem);
      if (values?.status === "Размещен") {
        viewer?.current?.centerView(
          viewer?.current?.instance?.transformState?.scale
        );
      }
      setShowEditModal(false);
    }
  };
  return (
    <>
      <div
        onClick={(e) => e.stopPropagation()}
        tabIndex="-1"
        className="z-[100] fixed top-0 left-0 right-0 z-50 justify-center items-center flex w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full outline-none focus:outline-none"
      >
        <div className="relative w-[680px] max-h-full">
          <div className="relative bg-white rounded shadow dark:bg-gray-700">
            <button
              type="button"
              className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={() => {
                setShowEditModal(false);
                clearActiveItem();
              }}
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
            </button>
            <div>
              <h3 className="px-6 py-4 border-gray-200 border-b mb-4 text-xl font-medium text-gray-900 dark:text-white">
                Данные объекта
              </h3>
              <Formik
                initialValues={{
                  category: activeItem?.object_category_id || null,
                  type: activeItem?.object_type_id || null,
                  zone: activeItem?.zone_id || null,
                  name: activeItem?.name || null,
                  status: activeItem?.status_name || "Размещен",
                }}
                onSubmit={async (values) => {
                  handleSubmit(values);
                }}
              >
                {({ values }) => (
                  <Form className="space-y-6 px-6 pb-4">
                    <div className="flex">
                      <div className="shrink-0 grow flex flex-col flex-wrap">
                        <div className="flex w-full  justify-between items-center mb-4">
                          <label
                            htmlFor="category"
                            className="block text-sm font-medium text-gray-900 dark:text-white font-semibold"
                          >
                            Категория
                            <span className="text-red-600 text-sm">*</span>
                          </label>
                          <Field
                            component="select"
                            required
                            id="category"
                            name="category"
                            className="w-[305px] border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          >
                            <option selected value="">
                              Выберите категорию
                            </option>
                            {categories?.map((item) => (
                              <option key={item.id} value={item?.id}>
                                {item?.name}
                              </option>
                            ))}
                          </Field>
                        </div>
                        <div className="flex w-full justify-between items-center mb-4">
                          <label
                            htmlFor="type"
                            className="block text-sm font-medium text-gray-900 dark:text-white font-semibold"
                          >
                            Тип<span className="text-red-600 text-sm">*</span>
                          </label>
                          <Field
                            component="select"
                            required
                            id="type"
                            name="type"
                            className="w-[305px] border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          >
                            <option selected value="">
                              Выберите тип
                            </option>
                            {types?.map((item) => (
                              <option key={item.id} value={item?.id}>
                                {item?.name}
                              </option>
                            ))}
                          </Field>
                        </div>
                        <div className="flex w-full justify-between items-center mb-4">
                          <label
                            htmlFor="type"
                            className="block text-sm font-medium text-gray-900 dark:text-white font-semibold"
                          >
                            Название
                            <span className="text-red-600 text-sm">*</span>
                          </label>
                          <Field
                            type="text"
                            id="name"
                            name="name"
                            className="w-[305px] border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Название"
                            required
                          />
                        </div>
                        <div className="flex w-full justify-between items-center mb-4">
                          <label
                            htmlFor="zone"
                            className="block text-sm font-medium text-gray-900 dark:text-white font-semibold"
                          >
                            Зона
                          </label>
                          <Field
                            component="select"
                            id="zone"
                            name="zone"
                            className="w-[305px] border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          >
                            <option selected value="">
                              Выберите зону
                            </option>
                            {zones?.map((item) => (
                              <option key={item.id} value={item?.id}>
                                {item?.name}
                              </option>
                            ))}
                          </Field>
                        </div>
                        <div className="flex w-full justify-between items-center mb-4">
                          <label
                            htmlFor="zone"
                            className="block text-sm font-medium text-gray-900 dark:text-white font-semibold"
                          >
                            Статус
                          </label>
                          <div
                            role="group"
                            className="bg-grayCustom w-[305px] rounded px-3 py-2 flex justify-between"
                            aria-labelledby="my-radio-group"
                          >
                            <label htmlFor="status 1">
                              <Field
                                type="radio"
                                name="status"
                                className="hidden peer"
                                value="Размещен"
                                id="status 1"
                              />

                              <div className="peer-checked:bg-white peer-checked:rounded peer-checked:py-1 peer-checked:px-2 peer-checked:shadow-buttonHeader py-1 px-2 block cursor-pointer text-sm">
                                Размещен
                              </div>
                            </label>
                            <label htmlFor="status 2">
                              <Field
                                type="radio"
                                name="status"
                                className="hidden peer"
                                value="Не размещен"
                                id="status 2"
                              />
                              <div className="peer-checked:bg-white peer-checked:rounded peer-checked:py-1 peer-checked:px-2 peer-checked:shadow-buttonHeader py-1 px-2 block cursor-pointer text-sm">
                                Не размещен
                              </div>
                            </label>
                            <label htmlFor="status 3">
                              <Field
                                type="radio"
                                name="status"
                                className="hidden peer"
                                value="Архив"
                                id="status 3"
                              />
                              <div className="peer-checked:bg-white peer-checked:rounded peer-checked:py-1 peer-checked:px-2 peer-checked:shadow-buttonHeader py-1 px-2 block cursor-pointer text-sm">
                                Архив
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 rounded border-gray-200 border w-48 shrink-0 flex justify-center items-center">
                        {types?.find((item) => item?.id === values?.type)
                          ?.image_link ? (
                          <img
                            className="w-1/2"
                            alt="type image"
                            src={`${
                              apiMeta +
                              types?.find((item) => item?.id === values?.type)
                                ?.image_link
                            }`}
                          />
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="text-white bg-blueCustom hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-lg px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      Сохранить данные
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-[55] bg-black" />
    </>
  );
};

export default ModalAddOrEdit;
