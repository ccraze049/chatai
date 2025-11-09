import ChatInput from '../ChatInput';

export default function ChatInputExample() {
  return (
    <div className="h-screen flex flex-col justify-end">
      <ChatInput 
        onSend={(message) => console.log('Message sent:', message)}
        placeholder="Ask anything..."
      />
    </div>
  );
}
