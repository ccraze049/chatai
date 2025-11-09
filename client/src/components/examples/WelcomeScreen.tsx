import { useState } from 'react';
import WelcomeScreen from '../WelcomeScreen';
import { Button } from '@/components/ui/button';

export default function WelcomeScreenExample() {
  const [mode, setMode] = useState<"chat" | "code">("chat");
  
  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b flex justify-center gap-2">
        <Button 
          variant={mode === "chat" ? "default" : "outline"}
          onClick={() => setMode("chat")}
        >
          Chat Mode
        </Button>
        <Button 
          variant={mode === "code" ? "default" : "outline"}
          onClick={() => setMode("code")}
        >
          Code Mode
        </Button>
      </div>
      <WelcomeScreen mode={mode} />
    </div>
  );
}
