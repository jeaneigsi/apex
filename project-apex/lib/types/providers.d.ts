export interface ProviderConfig {
  apiKey?: string;
  baseUrl?: string;
}

export interface ComputerAction {
  type: 'click' | 'type' | 'keypress';
  x?: number;
  y?: number;
  text?: string;
  keys?: string[];
}

