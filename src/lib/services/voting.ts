import { supabase } from '@/lib/supabase';

export interface Participant {
  id: string;
  stage_name: string;
  real_name?: string;
  profile_image: string;
  gallery_urls: string[];
  bio: string;
  city: string;
  social_links: any;
  status: 'active' | 'eliminated' | 'finalist' | 'winner';
}

export interface CompetitionStage {
  id: string;
  week_number: number;
  name: string;
  status: 'pending' | 'active' | 'finished';
}

export interface VoteSettings {
  id: number;
  is_open: boolean;
}

export const VotingService = {
  // Obtener estado global de votaciones (OPEN/CLOSED)
  async getVoteSettings(): Promise<VoteSettings | null> {
    const { data, error } = await supabase
      .from('vote_settings')
      .select('id, is_open')
      .eq('id', 1)
      .single();
      
    if (error) {
      console.error('Error fetching vote settings:', error);
      return null;
    }
    return data;
  },

  // Obtener la etapa activa
  async getActiveStage(): Promise<CompetitionStage | null> {
    const { data, error } = await supabase
      .from('competition_stages')
      .select('*')
      .eq('status', 'active')
      .single();
      
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching active stage:', error);
      return null;
    }
    return data;
  },

  // Obtener participantes activas o finalistas
  async getParticipants(): Promise<Participant[]> {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .order('stage_name', { ascending: true });
      
    if (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
    return data;
  },

  // Votar por un participante (esta función llamará al endpoint seguro /api/votes)
  // En producción, integrará el gateway de pagos antes de llamar al endpoint de Supabase.
  async registerVote(participantId: string, amount: number): Promise<{ success: boolean, error?: string }> {
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, amount }),
      });
      
      const result = await response.json();
      return { success: response.ok, error: result.error };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
};
