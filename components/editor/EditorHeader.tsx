"use client";

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { logout } from '@/lib/store/slices/authSlice';
import { undo, redo } from '@/lib/store/slices/canvasSlice';
import { useCanvasExport } from '@/lib/hooks/useCanvasExport';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Undo2,
  Redo2,
  Save,
  Download,
  Users,
  PanelLeft,
  LogOut,
  ChevronDown,
  Cloud,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAutoSave } from '@/lib/hooks/useAutoSave';

interface EditorHeaderProps {
  projectName: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  collaborationPanelOpen: boolean;
  setCollaborationPanelOpen: (open: boolean) => void;
}

export default function EditorHeader({
  projectName,
  sidebarOpen,
  setSidebarOpen,
  collaborationPanelOpen,
  setCollaborationPanelOpen,
}: EditorHeaderProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { saveNow } = useAutoSave();
  const { exportToImage, exportToPDF, exportMultiPagePDF } = useCanvasExport();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentProject, currentPageIndex } = useSelector((state: RootState) => state.canvas);
  const { connected } = useSelector((state: RootState) => state.collaboration);
  const { data: weatherData } = useSelector((state: RootState) => state.weather);
  
  const handleSave = () => {
    if (saveNow()) {
      toast({
        title: "Project saved",
        description: "Your project has been saved successfully.",
      });
    }
  };
  
  const handleExportImage = async () => {
    try {
      if (!currentProject) return;
      
      const currentPage = currentProject.pages[currentPageIndex];
      await exportToImage(`canvas-page-${currentPage.id}`, `${projectName}-page-${currentPageIndex + 1}.png`);
      
      toast({
        title: "Export successful",
        description: "Your canvas has been exported as an image.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your canvas.",
        variant: "destructive",
      });
    }
  };
  
  const handleExportPDF = async () => {
    try {
      if (!currentProject) return;
      
      const currentPage = currentProject.pages[currentPageIndex];
      await exportToPDF(`canvas-page-${currentPage.id}`, `${projectName}-page-${currentPageIndex + 1}.pdf`);
      
      toast({
        title: "Export successful",
        description: "Your canvas has been exported as a PDF.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your canvas.",
        variant: "destructive",
      });
    }
  };
  
  const handleExportAllPages = async () => {
    try {
      if (!currentProject) return;
      
      const pageIds = currentProject.pages.map(page => `canvas-page-${page.id}`);
      await exportMultiPagePDF(pageIds, `${projectName}-all-pages.pdf`);
      
      toast({
        title: "Export successful",
        description: "All pages have been exported as a PDF.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your canvas.",
        variant: "destructive",
      });
    }
  };
  
  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };
  
  return (
    <header className="border-b bg-background z-10">
      <div className="container flex h-16 items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mr-2"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">{projectName}</h1>
        </div>
        
        <div className="flex-1 flex justify-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => dispatch(undo())}>
            <Undo2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => dispatch(redo())}>
            <Redo2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSave}>
            <Save className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                Export
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={handleExportImage}>
                Export Current Page as Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                Export Current Page as PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportAllPages}>
                Export All Pages as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="ml-auto flex items-center space-x-4">
          {weatherData && (
            <div className="hidden md:flex items-center gap-2 text-sm">
              <img 
                src={weatherData.current.condition.icon} 
                alt={weatherData.current.condition.text}
                className="h-8 w-8"
              />
              <div>
                <p className="font-medium">{weatherData.location.name}</p>
                <p className="text-xs text-muted-foreground">{weatherData.current.temp_c}°C</p>
              </div>
            </div>
          )}
          
          <Button 
            variant={connected ? "default" : "outline"} 
            size="sm"
            className="gap-1"
            onClick={() => setCollaborationPanelOpen(!collaborationPanelOpen)}
          >
            <Users className="h-4 w-4" />
            {connected ? 'Connected' : 'Offline'}
          </Button>
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}