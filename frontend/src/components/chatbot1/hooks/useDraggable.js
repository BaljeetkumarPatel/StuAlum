// src/components/chatbot/hooks/useDraggable.js
import { useState, useRef } from "react";

export default function useDraggable() {
  const [position, setPosition] = useState({ right: 24, bottom: 80 });
  const dragData = useRef({ dragging: false, startX: 0, startY: 0, startR: 0, startB: 0 });

  const onMouseDown = (e) => {
    dragData.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startR: position.right,
      startB: position.bottom,
    };

    const onMouseMove = (ev) => {
      if (!dragData.current.dragging) return;

      const dx = dragData.current.startX - ev.clientX;
      const dy = dragData.current.startY - ev.clientY;

      setPosition({
        right: Math.max(10, dragData.current.startR + dx),
        bottom: Math.max(10, dragData.current.startB + dy),
      });
    };

    const onMouseUp = () => {
      dragData.current.dragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return { position, onMouseDown };
}
