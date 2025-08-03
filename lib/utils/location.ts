
import { LocationCoordinates } from '@/types/location';
import { reverseGeocode } from '@/lib/api/geocoding';

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
      const lat = coordinates.latitude.toFixed(4);
      const lng = coordinates.longitude.toFixed(4);
      return `📍 ${lat}, ${lng}`;
    }
  } catch (error) {
    const lat = coordinates.latitude.toFixed(4);
    const lng = coordinates.longitude.toFixed(4);
    return `📍 ${lat}, ${lng}`;
  }
}
export function isGeolocationSupported(): boolean {
  return 'geolocation' in navigator;
}

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

export function saveLocationPermissionState(granted: boolean): void {
  localStorage.setItem('treinei_location_permission', granted ? 'granted' : 'denied');
}

export function getLocationPermissionState(): boolean | null {
  const saved = localStorage.getItem('treinei_location_permission');
  if (saved === 'granted') return true;
  if (saved === 'denied') return false;
  return null;
}

export function validateCoordinates(coordinates: LocationCoordinates): boolean {
  const { latitude, longitude } = coordinates;
  
  return (
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180
  );
}

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

export function areCoordinatesNearby(
  coord1: LocationCoordinates,
  coord2: LocationCoordinates,
  radiusKm: number = 0.1
): boolean {
  const distance = calculateDistance(coord1, coord2);
  return distance <= radiusKm;
}