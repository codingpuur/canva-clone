"use client";

import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { fetchWeather } from '@/lib/store/slices/weatherSlice';

export function useWeatherUpdates(interval = 300000) { // 5 minutes
  const dispatch = useDispatch();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    
    dispatch(fetchWeather('india') as any);
    
    
    timerRef.current = setInterval(() => {
      dispatch(fetchWeather('india') as any);
    }, interval);
    
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [dispatch, interval]);
  
  return {
    refreshWeather: () => {
      dispatch(fetchWeather('india') as any);
    },
  };
}