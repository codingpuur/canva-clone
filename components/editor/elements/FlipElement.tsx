"use client";

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteElement, updateElement } from '@/lib/store/slices/canvasSlice';
import { FlipElement } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Eclipse as Flip, Trash2 } from 'lucide-react';

interface FlipElementProps {
  element: FlipElement;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onDragStart: (e: React.MouseEvent) => void;
}

export default function FlipElementComponent({
  element,
  isSelected,
  onSelect,
  onDragStart,
}: FlipElementProps) {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [frontText, setFrontText] = useState(element.content.front);
  const [backText, setBackText] = useState(element.content.back);
  
  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    dispatch(updateElement({
      id: element.id,
      updates: { flipped: !element.flipped },
    }));
  };
  
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };
  
  const handleBlur = () => {
    setIsEditing(false);
    
    if (frontText !== element.content.front || backText !== element.content.back) {
      dispatch(updateElement({
        id: element.id,
        updates: {
          content: {
            front: frontText,
            back: backText,
          },
        },
      }));
    }
  };
  

    const handleDelete = () => {
      dispatch(deleteElement(element.id));
    };
  
  return (
    <motion.div
      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-primary' : ''}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        zIndex: element.zIndex,
        perspective: '1000px',
      }}
      onClick={onSelect}
      onMouseDown={onDragStart}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <AnimatePresence initial={false} mode="wait">
        {!element.flipped ? (
          <motion.div
            key="front"
            className="absolute inset-0 bg-card border rounded-md shadow-sm flex items-center justify-center p-4"
            initial={{ rotateY: 180 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: -180 }}
            transition={{ duration: 0.4 }}
            onDoubleClick={handleDoubleClick}
          >
            {isEditing ? (
              <textarea
                className="w-full h-full p-2 resize-none focus:outline-none bg-transparent"
                value={frontText}
                onChange={(e) => setFrontText(e.target.value)}
                onBlur={handleBlur}
                autoFocus
              />
            ) : (
              <div className="w-full h-full overflow-auto">{frontText}</div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="back"
            className="absolute inset-0 bg-muted border rounded-md shadow-sm flex items-center justify-center p-4"
            initial={{ rotateY: -180 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: 180 }}
            transition={{ duration: 0.4 }}
            onDoubleClick={handleDoubleClick}
          >
            {isEditing ? (
              <textarea
                className="w-full h-full p-2 resize-none focus:outline-none bg-transparent"
                value={backText}
                onChange={(e) => setBackText(e.target.value)}
                onBlur={handleBlur}
                autoFocus
              />
            ) : (
              <div className="w-full h-full overflow-auto">{backText}</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {isSelected && (
        <div className="absolute -top-8 right-0 flex gap-1">
          <Button
            size="icon"
            variant="outline"
            className="h-6 w-6 bg-background"
            onClick={handleFlip}
          >
            <Flip className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="destructive" className="h-6 w-6" onClick={handleDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </motion.div>
  );
}