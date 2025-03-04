"use client";

import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store/store";
import { clearMessages } from "@/lib/store/slices/collaborationSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Users } from "lucide-react";

interface CollaborationPanelProps {
  onClose: () => void;
}

export default function CollaborationPanel({ onClose }: CollaborationPanelProps) {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [message, setMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch a single message from JSONPlaceholder
  const fetchMessage = async (): Promise<any> => {
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/comments?_limit=1");
      const data = await response.json();
      return {
        id: data[0].id.toString(),
        userId: data[0].postId.toString(),
        userName: `User ${data[0].postId}`,
        text: data[0].body,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error fetching message:", error);
      return null;
    }
  };

  // Fetch a single message on component mount
  useEffect(() => {
    const initializeMessage = async () => {
      const initialMessage = await fetchMessage();
      if (initialMessage) {
        setLocalMessages([initialMessage]);
      }
    };

    initializeMessage();
  }, []);

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [localMessages]);

  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    const newMessage = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      text: message,
      timestamp: new Date().toISOString(),
    };

    try {
      // Simulate sending the message to the server
      const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        body: JSON.stringify({
          title: user.name,
          body: message,
          userId: user.id,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });

      const result = await response.json();
      console.log("Message sent:", result);

      // Add the new message to the local state
      setLocalMessages([...localMessages, newMessage]);

      // Fetch a new message from the API
      const fetchedMessage = await fetchMessage();
      if (fetchedMessage) {
        setLocalMessages((prevMessages) => [...prevMessages, fetchedMessage]);
      }

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle clearing the chat
  const handleClearChat = () => {
    dispatch(clearMessages());
    setLocalMessages([]);
  };

  return (
    <div className="w-64 border-l bg-background flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <h3 className="text-sm font-medium">Collaboration</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="text-xs font-medium">Chat</h4>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={handleClearChat}>
            Clear
          </Button>
        </div>

        <ScrollArea className="flex-1 max-h-[28rem] p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {localMessages.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-4">
                No messages yet
              </div>
            ) : (
              localMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.userId === user?.id ? "items-end" : "items-start"
                  }`}
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    {msg.userId === user?.id ? "You" : msg.userName}
                  </div>
                  <div
                    className={`px-3 py-2 rounded-lg max-w-[90%] ${
                      msg.userId === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button type="submit" size="icon" disabled={!message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}