export enum MessageRole {
  USER = 'user',
  MODEL = 'model'
}

export type ChatMode = 'operations' | 'scheduling' | 'diagnosis'| 'service';

export interface ChatMessage {
  role: MessageRole;
  text: string;
  timestamp: Date;
}

export interface SensorDataPoint {
  time: string;
  vibration: number; // mm/s
  temperature: number; // Celsius
}

// App State context to share data between components
export interface AppContextState {
  // New state for file analysis
  isDataLoaded: boolean;
  fileName: string | null;
  sensorData: SensorDataPoint[];
}

// New Interface for Chat History Sessions
export interface ChatSession {
  id: string;
  title: string;
  mode: ChatMode; // Added mode to session
  messages: ChatMessage[];
  lastModified: number; // timestamp for sorting
}
export interface MaintenanceStation {
  id: number;          // 维修站唯一ID
  name: string;        // 维修站名称（如“东北农机维修总站”）
  brand: string;       // 服务站品牌（如“久保田授权服务站”）
  type: "企业维修中心" | "第三方服务站"; // 维修站类型
  location: string;    // 维修站具体位置（如“吉林省长春市农安县农机街100号”）
  contact: string;     // 联系电话
}

export interface RepairStep {
  step: number;        // 维修步骤序号（1、2、3...）
  content: string;     // 步骤具体内容（如“检查履带松紧度，松开张紧装置”）
}