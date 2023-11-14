const svgFillEditMode = ({ svgRef, select }) => {
  if (select && svgRef?.current) {
    if (svgRef.current?.querySelector("circle")) {
      const circles = svgRef.current.querySelectorAll("circle");
      circles.forEach((circle) => {
        circle.style.fill = "#7DFE7F";
      });
    }
    if (svgRef.current?.querySelector("path")) {
      const paths = svgRef.current.querySelectorAll("path");
      paths.forEach((path) => {
        path.style.fill = "#7DFE7F";
      });
    }
    if (svgRef.current?.querySelector("polygon")) {
      const polygons = svgRef.current.querySelectorAll("polygon");
      polygons.forEach((polygon) => {
        polygon.style.fill = "#7DFE7F";
      });
    }
  }
  if (!select && svgRef?.current) {
    if (svgRef.current?.querySelector("circle")) {
      const circles = svgRef.current.querySelectorAll("circle");
      circles.forEach((circle) => {
        circle.style.fill = "#ccc";
      });
    }
    if (svgRef.current?.querySelector("path")) {
      const paths = svgRef.current.querySelectorAll("path");
      paths.forEach((path) => {
        path.style.fill = "#ccc";
      });
    }
    if (svgRef.current?.querySelector("polygon")) {
      const polygons = svgRef.current.querySelectorAll("polygon");
      polygons.forEach((polygon) => {
        polygon.style.fill = "#ccc";
      });
    }
  }
};

export default svgFillEditMode;
