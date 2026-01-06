# react-agent-ui

> Beautiful, composable React components for building AI-powered chat and agent interfaces

## Features

- Beautiful by Default - Polished UI components built with Tailwind CSS and shadcn/ui desig- Streaming Support - Works seamlessly with Vercel AI SDK UI streaming (useChat)
- Agentic Capabilities - Tool calling, reasoning display, human-in-the-loop approvals (UI p- Multimodal UI - Render images/files/audio/video attachments as UI
- Type-Safe - Full TypeScript support
- Customizable - Headless-ish component architecture, fully customizable with Tailwind
- Accessible - ARIA-friendly with keyboard navigation support
- Dark Mode - Automatic dark mode support via CSS variables

---

## Installation

react-agent-ui is UI-only, but the default <Chat /> wrapper expects Vercel AI SDK UI hooks.

```bash
pnpm add react-agent-ui @ai-sdk/react ai
# or
npm install react-agent-ui @ai-sdk/react ai
# or
yarn add react-agent-ui @ai-sdk/react ai
```

If you are using OpenAI / Anthropic / etc. on the server, also install the provider you wan```bash
pnpm add @ai-sdk/openai

````
---
## Quick Start
### 1) Add the Chat UI
```tsx
import { Chat } from "react-agent-ui";
export default function App() {
 return <Chat />;
}
````

### 2) Add a Next.js route (/api/chat) for streaming

For useChat UI streaming, return a UI message stream response and convert UI messages to mo```ts
// app/api/chat/route.ts
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
export async function POST(req: Request) {
const { messages }: { messages: UIMessage[] } = await req.json();
const result = streamText({
model: openai("gpt-4o-mini"),
messages: await convertToModelMessages(messages),
});
return result.toUIMessageStreamResponse();
}

````
---
## Custom Implementation (using your primitives)
Recommended pattern with the current AI SDK UI API:
- useChat from @ai-sdk/react
- DefaultChatTransport from ai
```tsx
import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageList, ChatInput } from "react-agent-ui";
export default function CustomChat() {
 const [input, setInput] = useState("");
 const { messages, sendMessage, status, stop } = useChat({
 transport: new DefaultChatTransport({
 api: "/api/chat",
 }),
 });
 const isLoading = status === "submitted" || status === "streaming";
 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!input.trim() || isLoading) return;
 sendMessage({ text: input });
 setInput("");
 };
 return (
 <div className="flex flex-col h-screen">
 <MessageList messages={messages} isStreaming={isLoading} />
 <div className="p-4 border-t bg-background">
 <ChatInput
 input={input}
 setInput={setInput}
 handleSubmit={handleSubmit}
 isLoading={isLoading}
 stop={stop}
 />
 </div>
 </div>
 );
}
````

## Note: messages from useChat are UIMessage[] with parts, not { content }.

## Components

### Message

Display a single message with markdown support, code highlighting, and streaming indicators```tsx
import { Message } from "react-agent-ui";
<Message
 role="assistant"
 content="Here's how to use **markdown** in messages!"
 isStreaming={false}
 timestamp="2:34 PM"
/>;

````
### EnhancedMessage
Advanced message component with tool calls, reasoning steps, and attachments.
```tsx
import { EnhancedMessage } from "react-agent-ui";
<EnhancedMessage
 role="assistant"
 content="I'll search for that information..."
 toolCalls={[
 {
 id: "1",
 name: "web_search",
 arguments: { query: "React best practices" },
 status: "executing",
 },
 ]}
 reasoning={[
 {
 id: "1",
 title: "Planning",
 content: "I need to search for current React best practices...",
 type: "planning",
 },
 ]}
 onToolApprove={(id) => console.log("Approved:", id)}
/>;
````

### ToolCall

Display and manage tool execution with approval workflows.

```tsx
import { ToolCall } from "react-agent-ui";
<ToolCall
  id="tool-1"
  name="send_email"
  arguments={{ to: "user@example.com", subject: "Hello" }}
  status="pending"
  requireApproval={true}
  onApprove={(id) => executeTool(id)}
  onReject={(id) => cancelTool(id)}
/>;
```

### Reasoning

Show reasoning steps in an expandable format.

```tsx
import { Reasoning } from "react-agent-ui";
<Reasoning
  steps={[
    {
      id: "1",
      title: "Understanding the request",
      content: "The user wants to...",
      type: "thinking",
    },
    {
      id: "2",
      title: "Planning the approach",
      content: "I will first...",
      type: "planning",
    },
  ]}
  isThinking={false}
/>;
```

### Attachment

Display various file types with preview and download capabilities.

```tsx
import { Attachment } from "react-agent-ui";
<Attachment
  id="att-1"
  type="image"
  url="https://example.com/image.jpg"
  name="screenshot.png"
  size={102400}
  onRemove={(id) => removeAttachment(id)}
/>;
```

---

## Styling

The library uses Tailwind CSS and follows shadcn/ui conventions. You'll need Tailwind in yo### 1) Install Tailwind

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2) Configure Content Paths

```js
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/react-agent-ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### 3) Add Base Styles

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --muted: 210 40% 96.1%;
    --border: 214.3 31.8% 91.4%;
  }
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --muted: 217.2 32.6% 17.5%;
    --border: 217.2 32.6% 17.5%;
  }
}
```

---

## Backend Integration

### Vercel AI SDK UI (Recommended)

useChat expects UI messages and streaming responses compatible with its UI protocol.

```ts
// app/api/chat/route.ts
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: await convertToModelMessages(messages),
  });
  return result.toUIMessageStreamResponse();
}
```

### Non-streaming / Custom Backend (no AI SDK)
```ts
If you're not using useChat, you can still use the UI primitives and render your own messag```tsx
import { useState } from "react";
import { Message, ChatInput } from "react-agent-ui";
type SimpleMessage = {
id: string;
role: "user" | "assistant" | "system" | "tool";
content: string;
};
export default function CustomBackend() {
const [messages, setMessages] = useState<SimpleMessage[]>([]);
const [input, setInput] = useState("");
const [isLoading, setIsLoading] = useState(false);
const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
if (!input.trim() || isLoading) return;
const userMessage: SimpleMessage = {
id: crypto.randomUUID(),
role: "user",
content: input,
};
setMessages((prev) => [...prev, userMessage]);
setInput("");
setIsLoading(true);
const res = await fetch("/api/your-endpoint", {
method: "POST",
body: JSON.stringify({ message: userMessage.content }),
});
const data = await res.json();
setMessages((prev) => [
...prev,
{
id: crypto.randomUUID(),
role: "assistant",
content: data.message,
},
]);
setIsLoading(false);
};
return (

 <div className="flex flex-col h-screen">
 <div className="flex-1 overflow-y-auto p-4">
 {messages.map((m) => (
 <Message key={m.id} role={m.role} content={m.content} />
 ))}
 </div>
 <div className="p-4 border-t bg-background">
 <ChatInput
 input={input}
 setInput={setInput}
 handleSubmit={handleSubmit}
 isLoading={isLoading}
 />
 </div>
 </div>
 );
}
```

  ```
---
## TypeScript Notes
### UIMessage uses parts (not content)
useChat returns UIMessage[] and each message contains parts (e.g. text, file, reasoning, toExample: extracting text content from a UI message:
```ts
import type { UIMessage } from "ai";
export function getText(message: UIMessage) {
 return (
 message.parts
 .filter((p): p is { type: "text"; text: string } => p.type === "text")
 .map((p) => p.text)
 .join("") ?? ""
 );
}
  
```
---
## Contributing
Contributions are welcome!
## License
MIT
## Acknowledgments
- Built with Vercel AI SDK UI (useChat)
- Inspired by shadcn/ui conventions
- Uses react-markdown + remark-gfm for rendering

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT © [Richard](https://github.com/Ricardorichie)

## 🙏 Acknowledgments

- Built with [Vercel AI SDK](https://sdk.vercel.ai)
- Inspired by [shadcn/ui](https://ui.shadcn.com)
- Uses [react-markdown](https://github.com/remarkjs/react-markdown) for rendering

## 🔗 Links

- [Documentation](https://github.com/Ricardorichie/react-agent-ui#readme)
- [Examples](https://github.com/Ricardorichie/react-agent-ui/tree/main/examples)
- [NPM Package](https://www.npmjs.com/package/react-agent-ui)
- [GitHub](https://github.com/Ricardorichie/react-agent-ui)
