"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  addElement,
  addPage,
  deletePage,
} from "@/lib/store/slices/canvasSlice";
import {
  CanvasPage,
  FlipElement,
  ImageElement,
  TextElement,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Type, Image, Square, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

interface EditorSidebarProps {
  pages: CanvasPage[];
  currentPageIndex: number;
  onChangePage: (index: number) => void;
}

export default function EditorSidebar({
  pages,
  currentPageIndex,
  onChangePage,
}: EditorSidebarProps) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pages");

  const handleAddPage = () => {
    dispatch(addPage());
    toast({
      title: "Page added",
      description: "A new page has been added to your project.",
    });
  };

  const handleDeletePage = (pageId: string) => {
    if (pages.length <= 1) {
      toast({
        title: "Cannot delete page",
        description: "You must have at least one page in your project.",
        variant: "destructive",
      });
      return;
    }

    dispatch(deletePage(pageId));
    toast({
      title: "Page deleted",
      description: "The page has been removed from your project.",
    });
  };

  const handleAdd = (elementType:string) => {
    if (elementType === "text") {
      const textElement: TextElement = {
        id: uuidv4(),
        type: "text",
        x: Math.floor(Math.random() * 500), // Random X position
        y: Math.floor(Math.random() * 500), // Random Y position
        width: Math.floor(Math.random() * 200) + 50, // Random width (50-250)
        height: Math.floor(Math.random() * 100) + 30, // Random height (30-130)
        content: "New Text Element",
        style: {
          fontFamily: "Arial",
          fontSize: 16,
          fontWeight: "normal",
          color: "#000000",
          textAlign: "left",
        },
        zIndex: pages[currentPageIndex]?.elements.length + 1 || 1,
      };

      dispatch(addElement(textElement));
    } else if (elementType === "image") {
      const imageElement: ImageElement = {
        id: uuidv4(),
        type: "image",
        x: Math.floor(Math.random() * 500), // Random X position
        y: Math.floor(Math.random() * 500), // Random Y position
        width: 200,
        height: 200,
        content: "https://picsum.photos/200/200",
        style: {
          objectFit: "cover",
          opacity: 1,
          borderRadius: 0,
        },
        zIndex: pages[currentPageIndex]?.elements.length + 1 || 1,
      };

      dispatch(addElement(imageElement));
    } else if (elementType === "flip") {
      const flipElement: FlipElement = {
        id: uuidv4(),
        type: "flip",
        x: Math.floor(Math.random() * 500), // Random X position
        y: Math.floor(Math.random() * 500), // Random Y position
        width: 200,
        height: 200,
        content: {
          front: "Front content",
          back: "Back content",
        },
        flipped: false,
        zIndex: pages[currentPageIndex]?.elements.length + 1 || 1,
      };

      dispatch(addElement(flipElement));
    }
  };

  return (
    <div className="w-64 border-r bg-background flex flex-col">
      <Tabs
        defaultValue="pages"
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <div className="border-b p-2">
          <TabsList className="w-full">
            <TabsTrigger value="pages" className="flex-1">
              Pages
            </TabsTrigger>
            <TabsTrigger value="elements" className="flex-1">
              Elements
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pages" className="flex-1 p-0 flex flex-col">
          <div className="p-4 flex justify-between items-center">
            <h3 className="text-sm font-medium">Pages</h3>
            <Button variant="ghost" size="icon" onClick={handleAddPage}>
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto">
            {pages.map((page, index) => (
              <div
                key={page.id}
                className={`flex items-center justify-between p-2 mx-2 rounded-md cursor-pointer ${
                  index === currentPageIndex
                    ? "bg-accent"
                    : "hover:bg-accent/50"
                }`}
                onClick={() => onChangePage(index)}
              >
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  <span className="text-sm">{page.name}</span>
                </div>

                {pages.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-50 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePage(page.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="elements" className="flex-1 p-4">
          <h3 className="text-sm font-medium mb-4">Add Elements</h3>

          <div className="space-y-2">
            <Button
              onClick={() => handleAdd("text")}
              variant="outline"
              className="w-full justify-start"
              draggable
            >
              <Type className="mr-2 h-4 w-4" />
              Text
            </Button>

            <Button
              onClick={() => handleAdd("image")}
              variant="outline"
              className="w-full justify-start"
              draggable
            >
              <Image className="mr-2 h-4 w-4" />
              Image
            </Button>

            <Button
              onClick={() => handleAdd("flip")}
              variant="outline"
              className="w-full justify-start"
              draggable
            >
              <Square className="mr-2 h-4 w-4" />
              Flip Card
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
