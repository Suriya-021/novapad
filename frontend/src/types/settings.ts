export interface IdeSettings {
  theme: 'dark' | 'light';
  fontSize: number;
  tabSize: number;
  wordWrap: 'on' | 'off';
  autoSave: boolean;
  autoSaveDelayMs: number;
  backendUrl: string;
}

export const DEFAULT_SETTINGS: IdeSettings = {
  theme: 'dark',
  fontSize: 14,
  tabSize: 2,
  wordWrap: 'on',
  autoSave: true,
  autoSaveDelayMs: 1500,
  backendUrl: 'http://localhost:8000',
};
