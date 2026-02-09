import { QuizResponse } from '../services/quiz';

export interface QuestState {
  isActive: boolean;
  activeWalkId: number | string | null;
  currentStopIndex: number; // Index of the next target stop in the walk's stopIds
  startTime: string | null; // ISO Date string
  userLocation: { lat: number; lng: number } | null;
  
  // Potential future fields for server synchronization
  completedStopIds: (number | string)[]; 
  distanceTraveled: number; // in meters
  xpGained: number;
  // Encounter State
  pendingEncounterId: number | string | null;
  showQuiz: boolean;
  
  // Quiz Content from Service
  currentQuiz: QuizResponse | null;
  quizLoading: boolean;
  quizError: string | null;

  // Dev State
  isSimulationMode: boolean;
  // Completion State
  showCompletionModal: boolean;
}

export const INITIAL_QUEST_STATE: QuestState = {
  isActive: false,
  activeWalkId: null,
  currentStopIndex: 0,
  startTime: null,
  userLocation: null,
  completedStopIds: [],
  distanceTraveled: 0,
  xpGained: 0,
  pendingEncounterId: null,
  showQuiz: false,
  currentQuiz: null,
  quizLoading: false,
  quizError: null,
  isSimulationMode: false,
  showCompletionModal: false
};
