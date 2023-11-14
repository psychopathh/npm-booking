const svgFillNoEditMode = ({ svgRef, item }) => {
  if (!item?.active) {
    if (svgRef.current?.querySelector("circle")) {
      const circles = svgRef.current.querySelectorAll("circle");
      circles.forEach((circle) => {
        circle.style.fill = "#DEDEDE";
        circle.style.stroke = "#8D8D8D";
      });
    }
    if (svgRef.current?.querySelector("path")) {
      const paths = svgRef.current.querySelectorAll("path");
      paths.forEach((path) => {
        path.style.fill = "#DEDEDE";
        path.style.stroke = "#8D8D8D";
      });
    }
    if (svgRef.current?.querySelector("polygon")) {
      const polygons = svgRef.current.querySelectorAll("polygon");
      polygons.forEach((polygon) => {
        polygon.style.fill = "#DEDEDE";
        polygon.style.stroke = "#8D8D8D";
      });
    }
    return;
  }
  if (
    item?.reservations?.length &&
    !item?.reservations?.find((el) => el?.my_reservation)
  ) {
    if (svgRef.current?.querySelector("circle")) {
      const circles = svgRef.current.querySelectorAll("circle");
      circles.forEach((circle) => {
        circle.style.fill = "#DEDEDE";
        circle.style.stroke = "#8D8D8D";
      });
    }
    if (svgRef.current?.querySelector("path")) {
      const paths = svgRef.current.querySelectorAll("path");
      paths.forEach((path) => {
        path.style.fill = "#DEDEDE";
        path.style.stroke = "#8D8D8D";
      });
    }
    if (svgRef.current?.querySelector("polygon")) {
      const polygons = svgRef.current.querySelectorAll("polygon");
      polygons.forEach((polygon) => {
        polygon.style.fill = "#DEDEDE";
        polygon.style.stroke = "#8D8D8D";
      });
    }
    return;
  }
  if (
    item?.reservations?.length &&
    item?.reservations?.find((el) => el?.my_reservation)
  ) {
    if (svgRef.current?.querySelector("circle")) {
      const circles = svgRef.current.querySelectorAll("circle");
      circles.forEach((circle) => {
        circle.style.fill = "#C9E2FF";
        circle.style.stroke = "#1C83FA";
      });
    }
    if (svgRef.current?.querySelector("path")) {
      const paths = svgRef.current.querySelectorAll("path");
      paths.forEach((path) => {
        path.style.fill = "#C9E2FF";
        path.style.stroke = "#1C83FA";
      });
    }
    if (svgRef.current?.querySelector("polygon")) {
      const polygons = svgRef.current.querySelectorAll("polygon");
      polygons.forEach((polygon) => {
        polygon.style.fill = "#C9E2FF";
        polygon.style.stroke = "#1C83FA";
      });
    }
    return;
  }
  if (!item?.reservations?.length) {
    if (svgRef.current?.querySelector("circle")) {
      const circles = svgRef.current.querySelectorAll("circle");
      circles.forEach((circle) => {
        circle.style.fill = "#CEF0D6";
        circle.style.stroke = "#3BB856";
      });
    }
    if (svgRef.current?.querySelector("path")) {
      const paths = svgRef.current.querySelectorAll("path");
      paths.forEach((path) => {
        path.style.fill = "#CEF0D6";
        path.style.stroke = "#3BB856";
      });
    }
    if (svgRef.current?.querySelector("polygon")) {
      const polygons = svgRef.current.querySelectorAll("polygon");
      polygons.forEach((polygon) => {
        polygon.style.fill = "#CEF0D6";
        polygon.style.stroke = "#3BB856";
      });
    }
    return;
  }
};

export default svgFillNoEditMode;
