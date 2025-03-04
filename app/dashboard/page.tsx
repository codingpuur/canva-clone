"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { checkAuth } from '@/lib/store/slices/authSlice';
import { createProject, loadFromLocalStorage } from '@/lib/store/slices/canvasSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, FileEdit, Clock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { currentProject } = useSelector((state: RootState) => state.canvas);
  
  useEffect(() => {
    dispatch(checkAuth());
    dispatch(loadFromLocalStorage());
  }, [dispatch]);
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);
  
  const handleCreateProject = () => {
    if (!user) return;
    
    dispatch(createProject({
      name: `New Project ${new Date().toLocaleDateString()}`,
      userId: user.id,
    }));
    
    router.push('/editor');
  };
  
  const handleContinueProject = () => {
    router.push('/editor');
  };
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-lg font-semibold">Canvas Editor Dashboard</h1>
          <div className="ml-auto flex items-center space-x-4">
            {user && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full overflow-hidden">
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                </div>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="container py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Your Projects</h2>
          <Button onClick={handleCreateProject}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentProject && (
            <Card className="overflow-hidden">
              <div className="h-40 bg-muted flex items-center justify-center">
                <FileEdit className="h-12 w-12 text-muted-foreground" />
              </div>
              <CardHeader>
                <CardTitle>{currentProject.name}</CardTitle>
                <CardDescription>
                  Last edited: {new Date(currentProject.updatedAt).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={handleContinueProject}>
                  Continue Editing
                </Button>
              </CardFooter>
            </Card>
          )}
          
          <Card className="overflow-hidden border-dashed cursor-pointer hover:border-primary/50 transition-colors" onClick={handleCreateProject}>
            <div className="h-40 bg-muted flex items-center justify-center">
              <PlusCircle className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardHeader>
              <CardTitle>Create New Project</CardTitle>
              <CardDescription>
                Start a fresh canvas with new ideas
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}