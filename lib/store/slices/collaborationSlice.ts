"use client";

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CursorPosition } from '@/lib/types';

interface CollaborationState {
  connected: boolean;
  cursors: CursorPosition[];
  messages: {
    id: string;
    userId: string;
    userName: string;
    text: string;
    timestamp: string;
  }[];
  error: string | null;
}

const initialState: CollaborationState = {
  connected: false,
  cursors: [],
  messages: [],
  error: null,
};

const collaborationSlice = createSlice({
  name: 'collaboration',
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
    
    updateCursor: (state, action: PayloadAction<CursorPosition>) => {
      const { userId } = action.payload;
      const cursorIndex = state.cursors.findIndex(c => c.userId === userId);
      
      if (cursorIndex !== -1) {
        state.cursors[cursorIndex] = action.payload;
      } else {
        state.cursors.push(action.payload);
      }
    },
    
    removeCursor: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      state.cursors = state.cursors.filter(c => c.userId !== userId);
    },
    
    addMessage: (state, action: PayloadAction<{ userId: string; userName: string; text: string }>) => {
      const { userId, userName, text } = action.payload;
      state.messages.push({
        id: Date.now().toString(),
        userId,
        userName,
        text,
        timestamp: new Date().toISOString(),
      });
      
      // Keep only the last 50 messages
      if (state.messages.length > 50) {
        state.messages = state.messages.slice(-50);
      }
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const {
  setConnected,
  updateCursor,
  removeCursor,
  addMessage,
  setError,
  clearMessages,
} = collaborationSlice.actions;

export default collaborationSlice.reducer;