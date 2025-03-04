"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { checkAuth } from '@/lib/store/slices/authSlice';
import { loadFromLocalStorage, createProject, changePage, selectElement } from '@/lib/store/slices/canvasSlice';

import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { useWeatherUpdates } from '@/lib/hooks/useWeatherUpdates';
import EditorHeader from '@/components/editor/EditorHeader';
import EditorSidebar from '@/components/editor/EditorSidebar';
import Canvas from '@/components/editor/Canvas';
import ElementProperties from '@/components/editor/ElementProperties';
import CollaborationPanel from '@/components/editor/CollaborationPanel';
import { Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function EditorPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { currentProject, currentPageIndex } = useSelector((state: RootState) => state.canvas);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [propertiesPanelOpen, setPropertiesPanelOpen] = useState(true);
  const [collaborationPanelOpen, setCollaborationPanelOpen] = useState(false);
  

  const { saveNow } = useAutoSave();
  const { refreshWeather } = useWeatherUpdates();
  
  useEffect(() => {
    dispatch(checkAuth());
    dispatch(loadFromLocalStorage());
  }, [dispatch]);
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // If no project exists, create a new one
    if (!currentProject && user) {
      dispatch(createProject({
        name: `New Project ${new Date().toLocaleDateString()}`,
        userId: user.id,
      }));
    }
  }, [isAuthenticated, currentProject, user, dispatch, router]);
  
  // Handle cursor movement for collaboration
  const handleMouseMove = (e: React.MouseEvent) => {
    const canvasElement = document.getElementById('canvas-container');
    if (!canvasElement) return;
    
    const rect = canvasElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // updateCursorPosition(x, y);
  };
  
  // Handle canvas click to deselect elements
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the canvas, not on an element
    if ((e.target as HTMLElement).id === 'canvas-container') {
      dispatch(selectElement(null));
    }
  };
  
  if (!isAuthenticated || !currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const currentPage = currentProject.pages[currentPageIndex];
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <EditorHeader 
        projectName={currentProject.name}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        collaborationPanelOpen={collaborationPanelOpen}
        setCollaborationPanelOpen={setCollaborationPanelOpen}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {sidebarOpen && (
          <EditorSidebar 
            pages={currentProject.pages}
            currentPageIndex={currentPageIndex}
            onChangePage={(index) => dispatch(changePage(index))}
          />
        )}
        
        <main 
          className="flex-1 overflow-auto p-4 bg-muted/30"
          onMouseMove={handleMouseMove}
          onClick={handleCanvasClick}
        >
          <div className="h-full flex items-center justify-center">
            <Canvas 
              page={currentPage}
              canvasId={`canvas-page-${currentPage.id}`}
            />
          </div>
        </main>
   
        
        {collaborationPanelOpen && (
          <CollaborationPanel 
            onClose={() => setCollaborationPanelOpen(false)}
          />
        )}
      </div>
    </div>
  );
}