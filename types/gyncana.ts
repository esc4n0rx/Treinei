import { User } from './auth';
import { RankingUser } from './ranking';

export interface Gyncana {
  id: string;
  group_id: string;
  prize_description: string;
  prize_image_url?: string;
  start_date: string;
  end_date: string;
  created_by: string;
  is_active: boolean;
  winner_user_id?: string;
  participants: GyncanaParticipant[];
}

export interface GyncanaParticipant {
  id: string;
  user_id: string;
  gyncana_id: string;
  usuario?: User;
}

export interface CreateGyncanaData {
  groupId: string;
  prizeDescription: string;
  prizeImage?: File;
  participantIds: string[];
  startDate: Date;
  endDate: Date;
}

// Corrigido: Usa 'posicao' para consistência com RankingUser
export interface GyncanaRanking extends Omit<RankingUser, 'posicao'> {
  posicao: number;
}

export interface GyncanaResponse {
  success: boolean;
  gyncana?: Gyncana;
  error?: string;
}

export interface GyncanaRankingResponse {
  success: boolean;
  ranking?: GyncanaRanking[];
  gyncana?: Gyncana;
  error?: string;
}

export interface WinnerInfo {
    isWinner: boolean;
    winnerName: string;
    prizeDescription: string;
}

export interface CheckWinnerResponse {
    success: boolean;
    data?: WinnerInfo | null;
    error?: string;
}