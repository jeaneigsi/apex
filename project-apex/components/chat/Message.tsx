export default function Message({ role, content }: { role: 'user' | 'assistant' | 'system'; content: string }) {
  return (
    <div className="text-sm">
      <span className="font-semibold mr-2">{role}:</span>
      <span>{content}</span>
    </div>
  );
}

