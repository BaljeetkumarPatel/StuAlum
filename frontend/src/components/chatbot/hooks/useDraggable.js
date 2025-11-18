// src/components/chatbot/hooks/useDraggable.js
import { useState, useRef, useEffect } from "react";

export default function useDraggable() {
  const [pos, setPos] = useState({ right: 24, bottom: 80 });
  const dragRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging || !dragRef.current) return;

      const dx = dragRef.current.startX - e.clientX;
      const dy = dragRef.current.startY - e.clientY;

      setPos({
        right: Math.max(8, dragRef.current.right + dx),
        bottom: Math.max(8, dragRef.current.bottom + dy),
      });
    };

    const onUp = () => {
      setDragging(false);
      dragRef.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    if (dragging) {
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    }

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  const onHeaderMouseDown = (e) => {
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      right: pos.right,
      bottom: pos.bottom,
    };
    setDragging(true);
  };

  return { pos, onHeaderMouseDown };
}
