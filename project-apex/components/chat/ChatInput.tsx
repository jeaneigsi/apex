import { useState } from 'react';

export default function ChatInput({ onSend }: { onSend: (value: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim()) return;
        onSend(value);
        setValue('');
      }}
    >
      <input
        className="flex-1 border rounded px-2 py-1"
        placeholder="Type a message"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button className="border rounded px-3 py-1" type="submit">
        Send
      </button>
    </form>
  );
}

