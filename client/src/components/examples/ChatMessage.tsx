import ChatMessage from '../ChatMessage';

export default function ChatMessageExample() {
  return (
    <div className="space-y-6 p-8 max-w-4xl mx-auto">
      <ChatMessage 
        role="user" 
        content="What is React and how does it work?" 
      />
      <ChatMessage 
        role="assistant" 
        content="React is a JavaScript library for building user interfaces. Here's a simple example:\n\n```javascript\nfunction Hello() {\n  return <h1>Hello, World!</h1>;\n}\n```\n\nKey concepts:\n- **Components**: Reusable UI pieces\n- **JSX**: HTML-like syntax\n- **Virtual DOM**: Efficient updates" 
      />
      <ChatMessage 
        role="user" 
        content="Can you show me a useState example?" 
      />
    </div>
  );
}
