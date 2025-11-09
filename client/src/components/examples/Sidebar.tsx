import { useState } from 'react';
import Sidebar from '../Sidebar';

export default function SidebarExample() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeId, setActiveId] = useState("1");

  const mockSessions = [
    {
      id: "1",
      title: "Introduction to React Hooks",
      mode: "chat" as const,
      createdAt: new Date(),
    },
    {
      id: "2",
      title: "Build a REST API with Express",
      mode: "code" as const,
      createdAt: new Date(Date.now() - 86400000),
    },
    {
      id: "3",
      title: "Understanding TypeScript Generics",
      mode: "chat" as const,
      createdAt: new Date(Date.now() - 172800000),
    },
  ];

  return (
    <div className="h-screen relative">
      <Sidebar
        sessions={mockSessions}
        activeSessionId={activeId}
        onSessionClick={(id) => {
          setActiveId(id);
          console.log('Session clicked:', id);
        }}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />
    </div>
  );
}
