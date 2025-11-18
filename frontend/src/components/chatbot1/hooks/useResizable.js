import { useState, useRef } from "react";

export default function useResizable() {
  const [size, setSize] = useState({ width: 350, height: 420 });
  const resizeData = useRef({ resizing: false, startX: 0, startY: 0, startW: 0, startH: 0 });

  const onResizeMouseDown = (e) => {
    resizeData.current = {
      resizing: true,
      startX: e.clientX,
      startY: e.clientY,
      startW: size.width,
      startH: size.height,
    };

    const onMouseMove = (ev) => {
      if (!resizeData.current.resizing) return;

      const dx = ev.clientX - resizeData.current.startX;
      const dy = ev.clientY - resizeData.current.startY;

      setSize({
        width: Math.min(600, Math.max(300, resizeData.current.startW + dx)),   // up to half screen width
        height: Math.min(700, Math.max(350, resizeData.current.startH + dy)),  // up to half screen height
      });
    };

    const onMouseUp = () => {
      resizeData.current.resizing = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return { size, onResizeMouseDown };
}
