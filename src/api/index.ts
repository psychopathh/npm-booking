import axios from "axios";

export const getFloor = async () => {
  return await axios.get(`https://c8fb3182-0df7-4b6d-8c42-d11075e15f05.mock.pstmn.io/get_floor?floor_number=1`);
};

export const getFloorMain = async () => {
  return await axios.get(`https://c8fb3182-0df7-4b6d-8c42-d11075e15f05.mock.pstmn.io/get_all?floor_number=1`);
};

export const getMap = async () => {
  return await axios.get(`https://c8fb3182-0df7-4b6d-8c42-d11075e15f05.mock.pstmn.io/get_map/?building=1&floor=1`);
};

export const getObjects = async () => {
  return await axios.get(`https://c8fb3182-0df7-4b6d-8c42-d11075e15f05.mock.pstmn.io//objects`);
};