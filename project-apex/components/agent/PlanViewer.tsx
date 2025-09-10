type PlanItem = { id: string; title: string; status: 'pending' | 'in_progress' | 'completed' };

export default function PlanViewer({ plan = [] as PlanItem[] }) {
  return (
    <div>
      <h3 className="font-medium">Plan</h3>
      <ul className="list-disc pl-5">
        {plan.map((p) => (
          <li key={p.id}>
            <span className="font-mono">[{p.status}]</span> {p.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

