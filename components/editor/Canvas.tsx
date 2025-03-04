"use client";

import { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { addElement, updateElement, selectElement } from '@/lib/store/slices/canvasSlice';
import { CanvasPage, CanvasElement, TextElement, ImageElement, FlipElement } from '@/lib/types';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import TextElementComponent from './elements/TextElement';
import ImageElementComponent from './elements/ImageElement';
import FlipElementComponent from './elements/FlipElement';
import CursorOverlay from './CursorOverlay';

interface CanvasProps {
  page: CanvasPage;
  canvasId: string;
}

export default function Canvas({ page, canvasId }: CanvasProps) {
  const dispatch = useDispatch();
  const canvasRef = useRef<HTMLDivElement>(null);
  const selectedElementId = useSelector((state: RootState) => state.canvas.selectedElementId);
  const cursors = useSelector((state: RootState) => state.collaboration.cursors);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Handle element selection
  const handleSelectElement = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(selectElement(elementId));
  };
  
  // Handle element dragging
  const handleDragStart = (e: React.MouseEvent, element: CanvasElement) => {
    e.stopPropagation();
    
    if (!canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const offsetX = e.clientX - canvasRect.left - element.x;
    const offsetY = e.clientY - canvasRect.top - element.y;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
    dispatch(selectElement(element.id));
  };
  
  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElementId || !canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left - dragOffset.x;
    const y = e.clientY - canvasRect.top - dragOffset.y;
    
    dispatch(updateElement({
      id: selectedElementId,
      updates: { x, y },
    }));
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  // Handle drop of new elements from sidebar
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;
    
    const elementType = e.dataTransfer.getData('elementType');
    
    if (elementType === 'text') {
      const textElement: TextElement = {
        id: uuidv4(),
        type: 'text',
        x,
        y,
        width: 200,
        height: 100,
        content: 'Double click to edit text',
        style: {
          fontFamily: 'Arial',
          fontSize: 16,
          fontWeight: 'normal',
          color: '#000000',
          textAlign: 'left',
        },
        zIndex: page.elements.length + 1,
      };
      
      dispatch(addElement(textElement));
    } else if (elementType === 'image') {
      const imageElement: ImageElement = {
        id: uuidv4(),
        type: 'image',
        x,
        y,
        width: 200,
        height: 200,
        content: 'https://picsum.photos/200/200',
        style: {
          objectFit: 'cover',
          opacity: 1,
          borderRadius: 0,
        },
        zIndex: page.elements.length + 1,
      };
      
      dispatch(addElement(imageElement));
    } else if (elementType === 'flip') {
      const flipElement: FlipElement = {
        id: uuidv4(),
        type: 'flip',
        x,
        y,
        width: 200,
        height: 200,
        content: {
          front: 'Front content',
          back: 'Back content',
        },
        flipped: false,
        zIndex: page.elements.length + 1,
      };
      
      dispatch(addElement(flipElement));
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  // Set up mouse event listeners for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleDragMove(e as unknown as React.MouseEvent);
      }
    };
    
    const handleMouseUp = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
  
  return (
    <div 
      className="relative shadow-lg bg-white"
      style={{ width: '800px', height: '600px' }}
    >
      <div
        id={canvasId}
        ref={canvasRef}
        className="absolute inset-0"
        style={{ background: page.background }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {page.elements.map((element) => {
          const isSelected = element.id === selectedElementId;
          
          // Render different element types
          switch (element.type) {
            case 'text':
              return (
                <TextElementComponent
                  key={element.id}
                  element={element as TextElement}
                  isSelected={isSelected}
                  onSelect={(e) => handleSelectElement(element.id, e)}
                  onDragStart={(e) => handleDragStart(e, element)}
                />
              );
            case 'image':
              return (
                <ImageElementComponent
                  key={element.id}
                  element={element as ImageElement}
                  isSelected={isSelected}
                  onSelect={(e) => handleSelectElement(element.id, e)}
                  onDragStart={(e) => handleDragStart(e, element)}
                />
              );
            case 'flip':
              return (
                <FlipElementComponent
                  key={element.id}
                  element={element as FlipElement}
                  isSelected={isSelected}
                  onSelect={(e) => handleSelectElement(element.id, e)}
                  onDragStart={(e) => handleDragStart(e, element)}
                />
              );
            default:
              return null;
          }
        })}
        
        <CursorOverlay cursors={cursors} />
      </div>
    </div>
  );
}