export interface PlanItem {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface ActionLogItem {
  ts: string;
  level: 'info' | 'warn' | 'error';
  msg: string;
}

