"use client";

import { CursorPosition } from '@/lib/types';
import { motion } from 'framer-motion';

interface CursorOverlayProps {
  cursors: CursorPosition[];
}

export default function CursorOverlay({ cursors }: CursorOverlayProps) {
  return (
    <>
      {cursors.map((cursor) => (
        <motion.div
          key={cursor.userId}
          className="absolute pointer-events-none"
          style={{
            left: cursor.x,
            top: cursor.y,
            zIndex: 9999,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: 'translate(-4px, -4px)' }}
          >
            <path
              d="M5 2L19 16L12 17L11 23L5 2Z"
              fill="hsl(var(--primary))"
              stroke="white"
              strokeWidth="1.5"
            />
          </svg>
          
          <div
            className="absolute left-4 top-0 px-2 py-1 rounded-md text-xs whitespace-nowrap"
            style={{
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
            }}
          >

            
            {cursor.userName}
          </div>
        </motion.div>
      ))}
    </>
  );
}