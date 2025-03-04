"use client";

import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';

export function useAutoSave(interval = 30000) {
  const currentProject = useSelector((state: RootState) => state.canvas.currentProject);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Set up auto-save timer
    if (currentProject) {
      timerRef.current = setInterval(() => {
        console.log('Auto-saving project...');
        localStorage.setItem('currentProject', JSON.stringify(currentProject));
      }, interval);
    }
    
    // Clean up timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentProject, interval]);
  
  return {
    saveNow: () => {
      if (currentProject) {
        localStorage.setItem('currentProject', JSON.stringify(currentProject));
        return true;
      }
      return false;
    },
  };
}