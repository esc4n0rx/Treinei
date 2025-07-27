import { CreateGyncanaData, GyncanaResponse, GyncanaRankingResponse } from '@/types/gyncana';

const API_BASE = '/api/groups';

export async function createGyncanaApi(data: CreateGyncanaData): Promise<GyncanaResponse> {
  try {
    const token = localStorage.getItem('treinei_token');
    const formData = new FormData();
    formData.append('prizeDescription', data.prizeDescription);
    if (data.prizeImage) {
      formData.append('prizeImage', data.prizeImage);
    }
    formData.append('participantIds', JSON.stringify(data.participantIds));
    formData.append('startDate', data.startDate.toISOString());
    formData.append('endDate', data.endDate.toISOString());

    const response = await fetch(`${API_BASE}/${data.groupId}/gyncana`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    return await response.json();
  } catch (error) {
    console.error('Erro ao criar gincana:', error);
    return { success: false, error: 'Erro de conexão' };
  }
}

export async function fetchGyncanaRanking(groupId: string): Promise<GyncanaRankingResponse> {
  try {
    const token = localStorage.getItem('treinei_token');
    const response = await fetch(`${API_BASE}/${groupId}/gyncana`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar ranking da gincana:', error);
    return { success: false, error: 'Erro de conexão' };
  }
}