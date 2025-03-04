"use client";

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import canvasReducer from './slices/canvasSlice';
import collaborationReducer from './slices/collaborationSlice';
import weatherReducer from './slices/weatherSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    canvas: canvasReducer,
    collaboration: collaborationReducer,
    weather: weatherReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;