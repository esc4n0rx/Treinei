
import { OpenCageResponse, GeocodingResponse, CachedLocation } from '@/types/geocoding';
import { LocationCoordinates } from '@/types/location';

const OPENCAGE_API_BASE = 'https://api.opencagedata.com/geocode/v1/json';
const CACHE_DURATION = 24 * 60 * 60 * 1000; 
const COORDINATE_PRECISION = 4; 

function getCacheKey(lat: number, lng: number): string {
  const roundedLat = Math.round(lat * Math.pow(10, COORDINATE_PRECISION)) / Math.pow(10, COORDINATE_PRECISION);
  const roundedLng = Math.round(lng * Math.pow(10, COORDINATE_PRECISION)) / Math.pow(10, COORDINATE_PRECISION);
  return `geocoding_${roundedLat}_${roundedLng}`;
}

function getCachedAddress(lat: number, lng: number): CachedLocation | null {
  try {
    const cacheKey = getCacheKey(lat, lng);
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    const parsedCache: CachedLocation = JSON.parse(cached);

    if (Date.now() - parsedCache.timestamp > CACHE_DURATION) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return parsedCache;
  } catch (error) {
    console.error('Erro ao verificar cache de geocoding:', error);
    return null;
  }
}

function setCachedAddress(lat: number, lng: number, address: string, shortAddress: string): void {
  try {
    const cacheKey = getCacheKey(lat, lng);
    const cacheData: CachedLocation = {
      address,
      shortAddress,
      timestamp: Date.now(),
      coordinates: { lat, lng }
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Erro ao salvar cache de geocoding:', error);
  }
}

function formatAddress(components: any): { address: string; shortAddress: string } {
  const addressParts = [];
  
  if (components.road) addressParts.push(components.road);
  if (components.neighbourhood) addressParts.push(components.neighbourhood);
  if (components.suburb && components.suburb !== components.neighbourhood) {
    addressParts.push(components.suburb);
  }
  if (components.city || components.municipality) {
    addressParts.push(components.city || components.municipality);
  }
  if (components.state) addressParts.push(components.state);
  
  const fullAddress = addressParts.join(', ');
  
  const shortParts = [];
  if (components.road) shortParts.push(components.road);
  if (components.neighbourhood) {
    shortParts.push(components.neighbourhood);
  } else if (components.suburb) {
    shortParts.push(components.suburb);
  } else if (components.city || components.municipality) {
    shortParts.push(components.city || components.municipality);
  }
  
  const shortAddress = shortParts.join(', ');
  
  return {
    address: fullAddress || 'Endereço não encontrado',
    shortAddress: shortAddress || 'Local não identificado'
  };
}

export async function reverseGeocode(coordinates: LocationCoordinates): Promise<GeocodingResponse> {
  const { latitude, longitude } = coordinates;
  
  const cached = getCachedAddress(latitude, longitude);
  if (cached) {
    return {
      success: true,
      address: cached.address,
      shortAddress: cached.shortAddress,
      fromCache: true
    };
  }
  const apiKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: 'Serviço de localização não configurado'
    };
  }
  
  try {
    const url = new URL(OPENCAGE_API_BASE);
    url.searchParams.set('q', `${latitude}+${longitude}`);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('language', 'pt');
    url.searchParams.set('pretty', '0');
    url.searchParams.set('no_annotations', '0');
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'Treinei App (contato@treinei.app)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data: OpenCageResponse = await response.json();
    
    if (data.status.code !== 200) {
      throw new Error(`OpenCage API Error: ${data.status.message}`);
    }
    
    if (!data.results || data.results.length === 0) {
      return {
        success: false,
        error: 'Nenhum endereço encontrado para esta localização'
      };
    }
    
    const result = data.results[0];
    const { address, shortAddress } = formatAddress(result.components);
    
    setCachedAddress(latitude, longitude, address, shortAddress);

    return {
      success: true,
      address,
      shortAddress,
      fullData: result,
      fromCache: false
    };
    
  } catch (error) {
    console.error('Erro na API de geocoding:', error);
    
    const fallbackAddress = `📍 ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    
    return {
      success: false,
      address: fallbackAddress,
      shortAddress: fallbackAddress,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

export function clearGeocodingCache(): void {
  try {
    const keys = Object.keys(localStorage);
    const geocodingKeys = keys.filter(key => key.startsWith('geocoding_'));
    
    geocodingKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Erro ao limpar cache de geocoding:', error);
  }
}

export function getGeocodingCacheStats(): { totalEntries: number; totalSize: string } {
  try {
    const keys = Object.keys(localStorage);
    const geocodingKeys = keys.filter(key => key.startsWith('geocoding_'));
    
    let totalSize = 0;
    geocodingKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += new Blob([value]).size;
      }
    });
    
    return {
      totalEntries: geocodingKeys.length,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas do cache:', error);
    return { totalEntries: 0, totalSize: '0 KB' };
  }
}