import { Checkin } from './checkin';
import { UserProfile } from './profile';

export interface PublicUserProfile extends UserProfile {
  checkins: Pick<Checkin, 'id' | 'foto_url' | 'data_checkin'>[];
  dias_ativos: number;
}

export interface UserProfileResponse {
  success: boolean;
  profile?: PublicUserProfile;
  error?: string;
}