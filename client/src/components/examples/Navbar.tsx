import { useState } from 'react';
import Navbar from '../Navbar';

export default function NavbarExample() {
  const [mode, setMode] = useState<"chat" | "code">("chat");
  
  return (
    <Navbar 
      mode={mode} 
      onModeChange={(newMode) => {
        setMode(newMode);
        console.log('Mode changed to:', newMode);
      }}
      onNewChat={() => console.log('New chat clicked')}
    />
  );
}
