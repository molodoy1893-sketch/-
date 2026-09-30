export type ProgramGoal = 'mass' | 'strength' | 'relief' | 'longevity';

export interface Alternative {
  name: string;
  desc: string;
  usesTwoDumbbells: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  target: string;
  sets: number;
  reps: string;
  restSec: number;
  usesTwoDumbbells: boolean;
  desc: string;
  alternatives: Alternative[];
}

export interface WorkoutDay {
  id: number;
  name: string;
  subtitle: string;
  focus: string;
  exercises: Exercise[];
}

export interface ProgramProtocol {
  id: ProgramGoal;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  intensity: string;
  repsRange: string;
  setsDefault: string;
  restDefault: number;
  badgeColor: string;
  days: WorkoutDay[];
}

export interface SetData {
  weight: string;
  reps: string;
  completed: boolean;
}

export interface ExerciseState {
  name?: string | null;
  desc?: string | null;
  usesTwoDumbbells?: boolean;
  sets: SetData[];
}

export interface SessionHistoryItem {
  id: string;
  date: string;
  timestamp: number;
  dayId: number;
  dayName: string;
  totalVolumeKg: number;
  completedSets: number;
  totalSets: number;
  exerciseRecords: {
    exerciseName: string;
    maxWeight: number;
    volumeKg: number;
    setsDone: number;
  }[];
}

export interface AppState {
  currentProgramId?: ProgramGoal;
  userState: Record<string, ExerciseState>;
  sessionHistory: SessionHistoryItem[];
  soundEnabled: boolean;
}
