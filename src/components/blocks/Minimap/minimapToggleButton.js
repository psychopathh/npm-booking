import IconArrow from "./iconArrow";

function MiniatureToggleButton({ setMiniatureOpen, miniatureOpen, position }) {
  let style = {
    width: "24px",
    height: "24px",
    display: "block",
    position: "absolute",
    bottom: "6px",
    right: "6px",
    background: "rgba(19, 20, 22, 0.901961)",
    border: 0,
    padding: 0,
    outline: 0,
    color: "#fff",
    zIndex: 502,
  };
  return (
    <button
      type="button"
      style={style}
      onClick={() => setMiniatureOpen(!miniatureOpen)}
    >
      <IconArrow open={miniatureOpen} position={position} />
    </button>
  );
}

export default MiniatureToggleButton;
