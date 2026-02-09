export interface Monument {
  id: number | string;
  name: string;
  type: string;
  address: string;
  likes: string;
  visitors: string;
  xp?: number;
  swagg?: string;
  dist: string;
  rating: number;
  img: string;
  lat: number;
  lng: number;
  status: string;
}

export interface QuizQuestion {
    q: string;
    a: string[];
    correct: number;
}

export interface QuizAnswer {
    selectedAnswerIndex: number;
}

export interface ChatMessage {
    role: 'user' | 'bot';
    text: string;
}

export interface Event {
  id: number | string;
  name: string;
  type: string;
  address: string;
  likes: string;
  visitors: string;
  swagg: string;
  xp?: number; // Usually undefined for events, but good for union types
  dist: string;
  rating: number;
  img: string;
  lat: number;
  lng: number;
  status: string;
}

// Union type for items shown on map/list
export type DashboardItem = Monument | Event;

export interface Walk {
  id: number | string;
  name: string;
  desc: string;
  difficulty: "Easy" | "Medium" | "Hard";
  estTime: string;
  stopIds: (number | string)[];
  status?: 'DRAFT' | 'PUBLISHED' | 'GREEN' | 'RED' | 'YELLOW';
  version?: number;
}

export interface Category {
  id: string;
  icon: string;
  label: string;
  typeValue: string | null;
}
