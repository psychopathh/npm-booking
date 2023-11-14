export default function IconArrow({ open }) {
  return (
    <svg width={24} height={24} stroke="currentColor">
      <g transform={open ? "rotate(135, 12, 13)" : "rotate(-45, 12, 13)"}>
        <path
          fill="#000000"
          d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z"
        />
      </g>
    </svg>
  );
}
