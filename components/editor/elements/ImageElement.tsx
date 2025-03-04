"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { deleteElement, updateElement } from "@/lib/store/slices/canvasSlice";
import { ImageElement } from "@/lib/types";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2 } from "lucide-react";

interface ImageElementProps {
  element: ImageElement;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onDragStart: (e: React.MouseEvent) => void;
}

export default function ImageElementComponent({
  element,
  isSelected,
  onSelect,
  onDragStart,
}: ImageElementProps) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [size, setSize] = useState({ width: element.width, height: element.height });

  // Random Image Fetching
  const handleRandomImage = async () => {
    try {
      setLoading(true);
      const randomId = Math.floor(Math.random() * 1000);
      const newImageUrl = `https://picsum.photos/id/${randomId}/400/300`;
      dispatch(updateElement({ id: element.id, updates: { content: newImageUrl } }));
    } catch (error) {
      console.error("Error fetching random image:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Image Load Errors
  const handleImageError = () => {
    dispatch(
      updateElement({
        id: element.id,
        updates: { content: "https://via.placeholder.com/400x300?text=Image+Not+Found" },
      })
    );
  };

  // Delete Element
  const handleDelete = () => {
    dispatch(deleteElement(element.id));
  };

  // Resizing Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setResizing(true);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (resizing) {
      setSize((prev) => ({
        width: Math.max(50, prev.width + e.movementX),
        height: Math.max(50, prev.height + e.movementY),
      }));
    }
  };

  const handleMouseUp = () => {
    if (resizing) {
      setResizing(false);
      dispatch(updateElement({ id: element.id, updates: { width: size.width, height: size.height } }));
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }
  };

  return (
    <motion.div
      className={`absolute cursor-move overflow-visible ${isSelected ? "ring-2 ring-primary" : ""}`}
      style={{
        left: element.x,
        top: element.y,
        width: size.width,
        height: size.height,
        zIndex: element.zIndex,
        borderRadius: `${element.style.borderRadius}px`,
        overflow: "hidden",
      }}
      onClick={onSelect}
      onMouseDown={onDragStart}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <img
        src={element.content}
        alt="Canvas element"
        className="w-full h-full"
        style={{ objectFit: element.style.objectFit, opacity: element.style.opacity }}
        onError={handleImageError}
      />

      {isSelected && (
        <div className="absolute -top-8 right-0 flex gap-1">
          <Button
            size="icon"
            variant="outline"
            className="h-6 w-6 bg-background"
            onClick={handleRandomImage}
            disabled={loading}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="destructive" className="h-6 w-6" onClick={handleDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {isSelected && (
        <div className="absolute -top-8 right-0 flex gap-1">
        
        <Button size="icon" variant="destructive" className="h-6 w-6" onClick={handleDelete}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      )}
    </motion.div>
  );
}