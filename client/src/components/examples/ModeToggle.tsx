import { useState } from 'react';
import ModeToggle from '../ModeToggle';

export default function ModeToggleExample() {
  const [mode, setMode] = useState<"chat" | "code">("chat");
  
  return (
    <ModeToggle 
      mode={mode} 
      onModeChange={(newMode) => {
        setMode(newMode);
        console.log('Mode changed to:', newMode);
      }} 
    />
  );
}
