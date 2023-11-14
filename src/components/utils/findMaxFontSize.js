function findMaxFontSize(texts, containerWidth) {
  let maxFontSizes = [];
  const tempElement = document.createElement("div");
  tempElement.style.visibility = "hidden";
  tempElement.style.position = "absolute";
  document.body.appendChild(tempElement);

  function getTextWidth(text, fontSize) {
    tempElement.style.fontSize = `${fontSize}px`;
    tempElement.innerText = text;
    return tempElement.getBoundingClientRect().width;
  }

  for (const text of texts) {
    let lowerFontSize = 1;
    let upperFontSize = 1000;

    while (lowerFontSize < upperFontSize - 1) {
      const currentFontSize = (lowerFontSize + upperFontSize) / 2;
      const textWidth = getTextWidth(text, currentFontSize);
      if (textWidth > containerWidth) {
        upperFontSize = currentFontSize;
      } else {
        lowerFontSize = currentFontSize;
        maxFontSizes.push(currentFontSize);
      }
    }
  }

  document.body.removeChild(tempElement);
  return Math.min(...maxFontSizes);
}

export default findMaxFontSize;
