const sizeMap = ({ stageWidth, stageHeight, width, height }) => {
  if (width < height) {
    if (stageWidth > stageHeight) {
      return { widthMap: width / 3, heightMap: width / 4 };
    }
    if (stageWidth < stageHeight) {
      return { widthMap: width / 4, heightMap: width / 3 };
    }
    return { widthMap: width / 4, heightMap: width / 4 };
  } else {
    if (stageWidth > stageHeight) {
      return { widthMap: height / 3, heightMap: height / 4 };
    }
    if (stageWidth < stageHeight) {
      return { widthMap: height / 4, heightMap: height / 3 };
    }
    return { widthMap: height / 4, heightMap: height / 4 };
  }
};

export default sizeMap;
