import ChatInput from './ChatInput';
import Message from './Message';

export type ChatMessage = { id: string; role: 'user' | 'assistant' | 'system'; content: string };

export default function ChatWindow({ messages = [] as ChatMessage[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="min-h-[240px] border rounded p-3 bg-white">
        {messages.map((m) => (
          <Message key={m.id} role={m.role} content={m.content} />
        ))}
      </div>
      <ChatInput onSend={(v) => console.log('send', v)} />
    </div>
  );
}

