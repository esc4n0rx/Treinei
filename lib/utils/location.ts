
import { LocationCoordinates } from '@/types/location';
import { reverseGeocode } from '@/lib/api/geocoding';

/**
 * Converte coordenadas em uma string de localização legível usando OpenCage API
 */
export async function coordinatesToLocationString(
  coordinates: LocationCoordinates,
  useShortFormat: boolean = true
): Promise<string> {
  try {
    const result = await reverseGeocode(coordinates);
    
    if (result.success) {
      const address = useShortFormat ? result.shortAddress : result.address;
      const cacheIndicator = result.fromCache ? ' (cache)' : '';
      
      return `📍 ${address}`;
    } else {
      console.warn('Falha no geocoding, usando coordenadas:', result.error);
      // Fallback para coordenadas formatadas
      const lat = coordinates.latitude.toFixed(4);
      const lng = coordinates.longitude.toFixed(4);
      return `📍 ${lat}, ${lng}`;
    }
  } catch (error) {
    console.error('Erro ao converter coordenadas:', error);
    const lat = coordinates.latitude.toFixed(4);
    const lng = coordinates.longitude.toFixed(4);
    return `📍 ${lat}, ${lng}`;
  }
}

/**
 * Verifica se a API de Geolocalização está disponível
 */
export function isGeolocationSupported(): boolean {
  return 'geolocation' in navigator;
}

/**
 * Verifica o estado atual da permissão de localização
 */
export async function checkLocationPermission(): Promise<PermissionState> {
  if (!isGeolocationSupported()) {
    return 'denied';
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return permission.state;
  } catch (error) {
    console.error('Erro ao verificar permissão:', error);
    return 'prompt';
  }
}

/**
 * Salva o estado da permissão no localStorage
 */
export function saveLocationPermissionState(granted: boolean): void {
  localStorage.setItem('treinei_location_permission', granted ? 'granted' : 'denied');
}

/**
 * Recupera o estado salvo da permissão
 */
export function getLocationPermissionState(): boolean | null {
  const saved = localStorage.getItem('treinei_location_permission');
  if (saved === 'granted') return true;
  if (saved === 'denied') return false;
  return null;
}

/**
 * Valida se as coordenadas estão dentro de um range válido
 */
export function validateCoordinates(coordinates: LocationCoordinates): boolean {
  const { latitude, longitude } = coordinates;
  
  return (
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180
  );
}

/**
 * Calcula a distância entre duas coordenadas usando a fórmula de Haversine
 */
export function calculateDistance(
  coord1: LocationCoordinates,
  coord2: LocationCoordinates
): number {
  const R = 6371;
  const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const dLng = (coord2.longitude - coord1.longitude) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.latitude * Math.PI / 180) * 
    Math.cos(coord2.latitude * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Verifica se duas coordenadas estão próximas (dentro de um raio especificado)
 */
export function areCoordinatesNearby(
  coord1: LocationCoordinates,
  coord2: LocationCoordinates,
  radiusKm: number = 0.1
): boolean {
  const distance = calculateDistance(coord1, coord2);
  return distance <= radiusKm;
}