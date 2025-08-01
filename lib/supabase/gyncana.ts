import { supabase } from '../supabase';
import { Gyncana, GyncanaRanking } from '@/types/gyncana';
import { User } from '@/types/auth';

export async function getActiveGyncanaByGroupId(groupId: string) {
  const { data, error } = await supabase
    .from('gyncanas')
    .select('*, participants:gyncana_participants(*)')
    .eq('group_id', groupId)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') { // Ignore "single row not found"
    console.error('Error fetching active gyncana:', error);
    return null;
  }
  return data as Gyncana | null;
}

export async function createGyncana(
  gyncanaData: Omit<Gyncana, 'id' | 'created_at' | 'is_active' | 'participants'>,
  participantIds: string[]
) {
  const { data: newGyncana, error } = await supabase
    .from('gyncanas')
    .insert(gyncanaData)
    .select()
    .single();

  if (error) {
    console.error('Error creating gyncana:', error);
    return { success: false, error: 'Falha ao criar gincana no banco de dados.' };
  }

  const participantsToInsert = participantIds.map(userId => ({
    gyncana_id: newGyncana.id,
    user_id: userId,
  }));

  const { error: participantsError } = await supabase
    .from('gyncana_participants')
    .insert(participantsToInsert);

  if (participantsError) {
    console.error('Error adding participants:', participantsError);
    // Rollback gyncana creation
    await supabase.from('gyncanas').delete().eq('id', newGyncana.id);
    return { success: false, error: 'Falha ao adicionar participantes.' };
  }

  return { success: true, gyncana: newGyncana };
}

export async function getGyncanaRanking(gyncana: Gyncana): Promise<GyncanaRanking[]> {
    console.log('🎯 Buscando ranking da gincana:', {
        gyncanaId: gyncana.id,
        groupId: gyncana.group_id,
        startDate: gyncana.start_date,
        endDate: gyncana.end_date
    });

    // Passo 1: Obter a lista de IDs dos participantes da gincana
    const { data: participantsData, error: pError } = await supabase
        .from('gyncana_participants')
        .select('user_id')
        .eq('gyncana_id', gyncana.id);

    if (pError || !participantsData) {
        console.error("Error fetching participants for gyncana ranking:", pError);
        return [];
    }
    const participantIds = participantsData.map(p => p.user_id);
    console.log('👥 Participantes da gincana:', participantIds);
    
    if (participantIds.length === 0) return [];

    // Passo 2: Buscar os dados de todos os participantes
    const { data: usersData, error: uError } = await supabase
        .from('treinei_usuarios')
        .select('id, nome, avatar_url')
        .in('id', participantIds);

    if (uError || !usersData) {
        console.error("Error fetching participant users:", uError);
        return [];
    }

    // Passo 3: Buscar os check-ins usando a mesma abordagem do getGroupCheckins
    console.log('📅 Aplicando filtros de data da gincana:', {
        startDate: gyncana.start_date,
        endDate: gyncana.end_date
    });

    // Usar a mesma estrutura de query do getGroupCheckins
    let query = supabase
        .from('treinei_checkins')
        .select('usuario_id, data_checkin, id')
        .eq('grupo_id', gyncana.group_id)
        .in('usuario_id', participantIds)
        .order('data_checkin', { ascending: false });

    // Aplicar filtros de data da mesma forma que getGroupCheckins
    query = query
        .gte('data_checkin', gyncana.start_date)
        .lt('data_checkin', gyncana.end_date);

    const { data: checkinsData, error: cError } = await query;

    console.log('✅ Check-ins encontrados:', checkinsData?.length || 0);
    console.log('📋 Dados dos check-ins:', checkinsData);
    
    if (cError) {
        console.error("Error fetching check-ins for gyncana ranking:", cError);
        return [];
    }
    
    // Passo 4: Contar os check-ins por usuário
    const checkinCounts = new Map<string, number>();
    for (const checkin of checkinsData || []) {
        const currentCount = checkinCounts.get(checkin.usuario_id) || 0;
        checkinCounts.set(checkin.usuario_id, currentCount + 1);
    }
    
    console.log('📊 Contagem de check-ins por usuário:', Object.fromEntries(checkinCounts));
    
    // Passo 5: Montar o ranking, garantindo que todos os participantes apareçam
    const rankingArray: Omit<GyncanaRanking, 'posicao'>[] = usersData.map(user => ({
        id: user.id,
        nome: user.nome,
        avatar_url: user.avatar_url,
        checkins_count: checkinCounts.get(user.id) || 0,
    }));

    // Passo 6: Ordenar por check-ins (descrescente) e atribuir posição
    rankingArray.sort((a, b) => b.checkins_count - a.checkins_count);

    const finalRanking = rankingArray.map((user, index) => ({
        ...user,
        posicao: index + 1,
    }));

    console.log('🏆 Ranking final da gincana:', finalRanking);

    return finalRanking;
}

export async function endGyncanaAndDeclareWinner(groupId: string, currentUserId: string) {
    const { data: gyncana, error } = await supabase
        .from('gyncanas')
        .select('*')
        .eq('group_id', groupId)
        .eq('is_active', true)
        .lt('end_date', new Date().toISOString())
        .single();

    if (error || !gyncana) {
        return { success: false, error: 'Nenhuma gincana finalizada encontrada.' };
    }

    const ranking = await getGyncanaRanking(gyncana as Gyncana);

    if (ranking.length === 0) {
        // No participants or no check-ins, just deactivate
        await supabase.from('gyncanas').update({ is_active: false }).eq('id', gyncana.id);
        return { success: true, data: null };
    }

    const winner = ranking[0];

    // Update gyncana
    const { error: updateError } = await supabase
        .from('gyncanas')
        .update({ is_active: false, winner_user_id: winner.id })
        .eq('id', gyncana.id);

    if (updateError) {
        return { success: false, error: "Falha ao atualizar a gincana." };
    }

    // Insert into winners table
    const { error: winnerError } = await supabase
        .from('gyncana_winners')
        .insert({ gyncana_id: gyncana.id, user_id: winner.id, rank: 1 });
    
    if (winnerError) {
        // Log this error, but don't fail the whole process
        console.error("Failed to insert into gyncana_winners:", winnerError);
    }
    
    return {
        success: true,
        data: {
            isWinner: winner.id === currentUserId,
            winnerName: winner.nome,
            prizeDescription: gyncana.prize_description,
        }
    };
}