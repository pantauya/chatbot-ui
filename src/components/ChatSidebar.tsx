import { Moon, Plus, Sun, PanelLeft } from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";
import { Button } from "~/components/button";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Sidebar as SidebarPrimitive,
} from "~/components/sidebar";
import { useTheme } from "./ThemeProvider";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Label } from "./label";
import { Input } from "./input";

export interface Thread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export const ChatSidebar = () => {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [threads, setThreads] = useState<Thread[]>([]);

  const { setTheme, theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useLayoutEffect(() => {
    setActiveChat(location.pathname.split("/")[2]);
  }, [location]);

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/threads");
      const data = await response.json();
      setThreads(data); // sudah urut dari backend
    } catch (error) {
      console.error("Error fetching threads:", error);
    }
  };

  const handleToggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleCreateThread = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: textInput }),
      });

      if (response.ok) {
        const newThread: Thread = await response.json();
        setThreads((prev) => [newThread, ...prev]);
        setDialogIsOpen(false);
        setTextInput("");
        navigate(`/thread/${newThread.id}`);
      } else {
        console.error("Failed to create thread");
      }
    } catch (error) {
      console.error("Error creating thread:", error);
    }
  };

  return (
    <>
      {/* Dialog untuk membuat chat baru */}
      <Dialog open={dialogIsOpen} onOpenChange={setDialogIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new chat</DialogTitle>
          </DialogHeader>

          <div className="space-y-1">
            <Label htmlFor="chat-title">Chat Title</Label>
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              id="chat-title"
              placeholder="Your new chat title"
            />
          </div>

          <DialogFooter>
            <Button variant="destructive" onClick={() => setDialogIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateThread}>Create Chat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sidebar */}
      <SidebarPrimitive className={`transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-16"}`}>
        <SidebarHeader className="flex items-center justify-between">
          <div className="flex gap-2 w-full">
            {isSidebarOpen && (
              <Button
                onClick={() => setDialogIsOpen(true)}
                className="w-full justify-start"
                variant="ghost"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Chat
              </Button>
            )}
            <Button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2"
              variant="ghost"
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
          </div>
        </SidebarHeader>

        {/* Sidebar Content */}
        {isSidebarOpen && (
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarGroupLabel>Recent Chat</SidebarGroupLabel>
                <SidebarMenu>
                  {threads.map((thread) => (
                    <SidebarMenuItem key={thread.id}>
                      <Link to={`/thread/${thread.id}`}>
                        <SidebarMenuButton
                          onClick={() => setActiveChat(thread.id)}
                          isActive={activeChat === thread.id}
                        >
                          {thread.title}
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        )}

        {/* Sidebar Footer */}
        {isSidebarOpen && (
          <SidebarFooter>
            <Button
              onClick={handleToggleTheme}
              variant="ghost"
              className="w-full justify-start"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              Theme
            </Button>
          </SidebarFooter>
        )}
      </SidebarPrimitive>
    </>
  );
};

export default ChatSidebar;