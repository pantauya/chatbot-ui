import { useState } from "react";
import { Route, Routes } from "react-router";
import { ChatSidebar } from "~/components/ChatSidebar";
import { SidebarProvider } from "~/components/sidebar";
import  ChatDashboard  from "./pages/ChatDashboard";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <SidebarProvider open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <div className="flex h-screen bg-chart-4 w-full"> 
        <ChatSidebar/>
        <Routes>
          <Route path="/thread/:threadId" element={<ChatDashboard />} />
        </Routes>
      </div>
    </SidebarProvider>
  );
}
