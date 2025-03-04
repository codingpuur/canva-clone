"use client";

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CanvasElement, CanvasPage, CanvasProject } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

interface CanvasState {
  currentProject: CanvasProject | null;
  currentPageIndex: number;
  selectedElementId: string | null;
  history: {
    past: CanvasProject[];
    future: CanvasProject[];
  };
  loading: boolean;
  error: string | null;
}

const initialState: CanvasState = {
  currentProject: null,
  currentPageIndex: 0,
  selectedElementId: '',
  history: {
    past: [],
    future: [],
  },
  loading: false,
  error: null,
};

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    createProject: (state, action: PayloadAction<{ name: string; userId: string }>) => {
      const { name, userId } = action.payload;
      const newProject: CanvasProject = {
        id: uuidv4(),
        name,
        pages: [
          {
            id: uuidv4(),
            name: 'Page 1',
            elements: [],
            background: '#ffffff',
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: userId,
        collaborators: [userId],
      };
      
      state.currentProject = newProject;
      state.currentPageIndex = 0;
      state.selectedElementId = null;
      state.history = {
        past: [],
        future: [],
      };
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentProject', JSON.stringify(newProject));
      }
    },
    
    loadProject: (state, action: PayloadAction<CanvasProject>) => {
      state.currentProject = action.payload;
      state.currentPageIndex = 0;
      state.selectedElementId = null;
      state.history = {
        past: [],
        future: [],
      };
    },
    
    addPage: (state) => {
      if (!state.currentProject) return;
      
      // Save current state to history
      state.history.past.push(JSON.parse(JSON.stringify(state.currentProject)));
      state.history.future = [];
      
      const pageCount = state.currentProject.pages.length;
      const newPage: CanvasPage = {
        id: uuidv4(),
        name: `Page ${pageCount + 1}`,
        elements: [],
        background: '#ffffff',
      };
      
      state.currentProject.pages.push(newPage);
      state.currentPageIndex = state.currentProject.pages.length - 1;
      state.currentProject.updatedAt = new Date().toISOString();
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentProject', JSON.stringify(state.currentProject));
      }
    },
    
    changePage: (state, action: PayloadAction<number>) => {
      if (!state.currentProject) return;
      
      const pageIndex = action.payload;
      if (pageIndex >= 0 && pageIndex < state.currentProject.pages.length) {
        state.currentPageIndex = pageIndex;
        state.selectedElementId = null;
      }
    },
    
    deletePage: (state, action: PayloadAction<string>) => {
      if (!state.currentProject) return;
      
      // Save current state to history
      state.history.past.push(JSON.parse(JSON.stringify(state.currentProject)));
      state.history.future = [];
      
      const pageId = action.payload;
      const pageIndex = state.currentProject.pages.findIndex(page => page.id === pageId);
      
      if (pageIndex !== -1) {
        // Don't delete if it's the only page
        if (state.currentProject.pages.length <= 1) {
          return;
        }
        
        state.currentProject.pages.splice(pageIndex, 1);
        
        // Adjust current page index if needed
        if (state.currentPageIndex >= state.currentProject.pages.length) {
          state.currentPageIndex = state.currentProject.pages.length - 1;
        }
        
        state.currentProject.updatedAt = new Date().toISOString();
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentProject', JSON.stringify(state.currentProject));
        }
      }
    },
    
    addElement: (state, action: PayloadAction<CanvasElement>) => {
      if (!state.currentProject) return;
      
      // Save current state to history
      state.history.past.push(JSON.parse(JSON.stringify(state.currentProject)));
      state.history.future = [];
      
      const currentPage = state.currentProject.pages[state.currentPageIndex];
      currentPage.elements.push(action.payload);
      state.selectedElementId = action.payload.id;
      state.currentProject.updatedAt = new Date().toISOString();
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentProject', JSON.stringify(state.currentProject));
      }
    },
    
    updateElement: (state, action: PayloadAction<{ id: string; updates: Partial<CanvasElement> }>) => {
      if (!state.currentProject) return;
      
      const { id, updates } = action.payload;
      const currentPage = state.currentProject.pages[state.currentPageIndex];
      const elementIndex = currentPage.elements.findIndex(el => el.id === id);
      
      if (elementIndex !== -1) {
        // Save current state to history
        state.history.past.push(JSON.parse(JSON.stringify(state.currentProject)));
        state.history.future = [];
        
        currentPage.elements[elementIndex] = {
          ...currentPage.elements[elementIndex],
          ...updates,
        };
        
        state.currentProject.updatedAt = new Date().toISOString();
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentProject', JSON.stringify(state.currentProject));
        }
      }
    },
    
    deleteElement: (state, action: PayloadAction<string>) => {
      if (!state.currentProject) return;
      
      const elementId = action.payload;
      const currentPage = state.currentProject.pages[state.currentPageIndex];
      const elementIndex = currentPage.elements.findIndex(el => el.id === elementId);
      
      if (elementIndex !== -1) {
        // Save current state to history
        state.history.past.push(JSON.parse(JSON.stringify(state.currentProject)));
        state.history.future = [];
        
        currentPage.elements.splice(elementIndex, 1);
        
        if (state.selectedElementId === elementId) {
          state.selectedElementId = null;
        }
        
        state.currentProject.updatedAt = new Date().toISOString();
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentProject', JSON.stringify(state.currentProject));
        }
      }
    },
    
    selectElement: (state, action: PayloadAction<string | null>) => {
      state.selectedElementId = action.payload;
    },
    
    undo: (state) => {
      if (state.history.past.length === 0) return;
      
      const previous = state.history.past.pop();
      if (previous && state.currentProject) {
        state.history.future.push(JSON.parse(JSON.stringify(state.currentProject)));
        state.currentProject = previous;
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentProject', JSON.stringify(state.currentProject));
        }
      }
    },
    
    redo: (state) => {
      if (state.history.future.length === 0) return;
      
      const next = state.history.future.pop();
      if (next && state.currentProject) {
        state.history.past.push(JSON.parse(JSON.stringify(state.currentProject)));
        state.currentProject = next;
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentProject', JSON.stringify(state.currentProject));
        }
      }
    },
    
    loadFromLocalStorage: (state) => {
      if (typeof window !== 'undefined') {
        const savedProject = localStorage.getItem('currentProject');
        if (savedProject) {
          state.currentProject = JSON.parse(savedProject);
        }
      }
    },
  },
});

export const {
  createProject,
  loadProject,
  addPage,
  changePage,
  deletePage,
  addElement,
  updateElement,
  deleteElement,
  selectElement,
  undo,
  redo,
  loadFromLocalStorage,
} = canvasSlice.actions;

export default canvasSlice.reducer;