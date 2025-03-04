"use client";

import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { deleteElement, updateElement } from '@/lib/store/slices/canvasSlice';
import { TextElement } from '@/lib/types';
import { useAITextGeneration } from '@/lib/hooks/useAITextGeneration';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trash2, Wand2 } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface TextElementProps {
  element: TextElement;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onDragStart: (e: React.MouseEvent) => void;
}

export default function TextElementComponent({
  element,
  isSelected,
  onSelect,
  onDragStart,
}: TextElementProps) {
  const dispatch = useDispatch();
  const { generateText, loading } = useAITextGeneration();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(element.content);
  const [prompt, setPrompt] = useState('');
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setText(element.content);
  }, [element.content]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (text !== element.content) {
      dispatch(updateElement({
        id: element.id,
        updates: { content: text },
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
      if (text !== element.content) {
        dispatch(updateElement({
          id: element.id,
          updates: { content: text },
        }));
      }
    }
  };

  const handleGenerateText = async () => {
    const jsonResponse = {
      "contents": [
        {
          "parts": [
            {
              "text": prompt || 'Generate a creative text'
            }
          ]
        }
      ]
    };

    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDCi8YBA7KelPe7JBPY6hRniWYZ6TsmDFw',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jsonResponse),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const generatedText = data.candidates[0].content.parts[0].text;
        setText(generatedText);
        dispatch(updateElement({
          id: element.id,
          updates: { content: generatedText },
        }));
      } else {
        throw new Error('Failed to generate text');
      }
    } catch (error) {
      console.error('Error generating text:', error);
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
        height: 'auto',
        minHeight: element.height,
        zIndex: element.zIndex,
      }}
      onClick={onSelect}
      onMouseDown={onDragStart}
      onDoubleClick={handleDoubleClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {isEditing ? (
        <div
          ref={textRef}
          contentEditable
          suppressContentEditableWarning
          className="w-full h-full p-2 focus:outline-none"
          style={{
            fontFamily: element.style.fontFamily,
            fontSize: `${element.style.fontSize}px`,
            fontWeight: element.style.fontWeight,
            color: element.style.color,
            textAlign: element.style.textAlign,
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onChange={(e) => setText(e.currentTarget.textContent || '')}
        >
          
          {text}
        </div>
      ) : (
        <div
          className="w-full h-full p-2"
          style={{
            fontFamily: element.style.fontFamily,
            fontSize: `${element.style.fontSize}px`,
            fontWeight: element.style.fontWeight,
            color: element.style.color,
            textAlign: element.style.textAlign,
          }}
        >
          {text}
        </div>
      )}

      {isSelected && (
        <div className="absolute -top-8 right-0 flex gap-1">
            <Button size="icon" variant="destructive" className="h-6 w-6" onClick={handleDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="icon" variant="outline" className="h-6 w-6 bg-background">
                <Wand2 className="h-3 w-3" />
              </Button>
            
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 flex flex-col gap-2">
              <Input
                placeholder="Enter your prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <Button onClick={handleGenerateText} disabled={loading}>Generate</Button>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </motion.div>
  );
}
