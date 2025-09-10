type LogItem = { ts: string; level: 'info' | 'warn' | 'error'; msg: string };

export default function ActionLog({ logs = [] as LogItem[] }) {
  return (
    <div>
      <h3 className="font-medium">Action Log</h3>
      <div className="font-mono text-sm space-y-1">
        {logs.map((l, i) => (
          <div key={i}>
            <span>[{l.ts}]</span> <span>({l.level})</span> <span>{l.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

