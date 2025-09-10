import ChatInput from './ChatInput';
import Message from './Message';
import Card from '@/components/ui/Card';

export type ChatMessage = { id: string; role: 'user' | 'assistant' | 'system'; content: string };

export default function ChatWindow({ messages = [] as ChatMessage[], onSend, showInput = false }: { messages?: ChatMessage[]; onSend?: (v: string) => void; showInput?: boolean }) {
  return (
    <Card className="p-3">
      <div className="flex flex-col gap-3">
        <div className="min-h-[240px] max-h-[50vh] overflow-y-auto rounded bg-white/60 dark:bg-white/5 p-3">
          {messages.length === 0 ? (
            <p className="text-sm text-gray-500">Commencez une conversation…</p>
          ) : (
            messages.map((m) => <Message key={m.id} role={m.role} content={m.content} />)
          )}
        </div>
        {showInput && <ChatInput onSend={(v) => onSend?.(v)} />}
      </div>
    </Card>
  );
}

