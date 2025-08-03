
"use client";

import { useState, useEffect, useCallback } from 'react';
import { GeolocationHookReturn, LocationCoordinates, LocationPermissionState } from '@/types/location';
import { 
  coordinatesToLocationString, 
  isGeolocationSupported, 
  checkLocationPermission,
  saveLocationPermissionState,
  getLocationPermissionState,
  validateCoordinates
} from '@/lib/utils/location';

export function useGeolocation(): GeolocationHookReturn {
  const [coordinates, setCoordinates] = useState<LocationCoordinates | null>(null);
  const [permissionState, setPermissionState] = useState<LocationPermissionState>({
    granted: false,
    denied: false,
    prompt: false,
    loading: true
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkInitialPermission = async () => {
      if (!isGeolocationSupported()) {
        setPermissionState({
          granted: false,
          denied: true,
          prompt: false,
          loading: false
        });
        setError('Geolocalização não suportada neste navegador');
        return;
      }

      const savedState = getLocationPermissionState();
      if (savedState !== null) {
        setPermissionState({
          granted: savedState,
          denied: !savedState,
          prompt: false,
          loading: false
        });
        
        if (savedState) {
          await getCurrentLocation();
        }
        return;
      }

      try {
        const permission = await checkLocationPermission();
        
        setPermissionState({
          granted: permission === 'granted',
          denied: permission === 'denied',
          prompt: permission === 'prompt',
          loading: false
        });

        if (permission === 'granted') {
          await getCurrentLocation();
        }
      } catch (error) {
        console.error('Erro ao verificar permissão:', error);
        setPermissionState({
          granted: false,
          denied: false,
          prompt: true,
          loading: false
        });
      }
    };

    checkInitialPermission();
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isGeolocationSupported()) {
      setError('Geolocalização não suportada');
      return false;
    }

    setPermissionState(prev => ({ ...prev, loading: true }));
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          if (!validateCoordinates(coords)) {
            setError('Coordenadas inválidas recebidas');
            setPermissionState({
              granted: false,
              denied: true,
              prompt: false,
              loading: false
            });
            resolve(false);
            return;
          }
          
          setCoordinates(coords);
          setPermissionState({
            granted: true,
            denied: false,
            prompt: false,
            loading: false
          });
          
          saveLocationPermissionState(true);
          resolve(true);
        },
        (error) => {
          console.error('❌ Erro ao obter localização:', error);
          
          let errorMessage = 'Erro ao obter localização';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permissão de localização negada';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Localização indisponível';
              break;
            case error.TIMEOUT:
              errorMessage = 'Timeout ao obter localização';
              break;
          }
          
          setError(errorMessage);
          setPermissionState({
            granted: false,
            denied: true,
            prompt: false,
            loading: false
          });
          
          saveLocationPermissionState(false);
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<LocationCoordinates | null> => {
    if (!isGeolocationSupported() || !permissionState.granted) {
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          if (!validateCoordinates(coords)) {
            console.error('Coordenadas inválidas:', coords);
            setError('Coordenadas inválidas recebidas');
            resolve(null);
            return;
          }
          
          setCoordinates(coords);
          resolve(coords);
        },
        (error) => {
          console.error('Erro ao obter localização atual:', error);
          setError('Erro ao obter localização atual');
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 30000
        }
      );
    });
  }, [permissionState.granted]);

  const getLocationString = useCallback(async (useShortFormat: boolean = true): Promise<string | null> => {
    console.log('🗺️ Obtendo string de localização...');
    
    const coords = coordinates || await getCurrentLocation();
    if (!coords) {
      console.log('❌ Coordenadas não disponíveis');
      return null;
    }
    
    try {
      const locationString = await coordinatesToLocationString(coords, useShortFormat);
      return locationString;
    } catch (error) {
      console.error('Erro ao obter string de localização:', error);
      return null;
    }
  }, [coordinates, getCurrentLocation]);

  return {
    coordinates,
    permissionState,
    error,
    requestPermission,
    getCurrentLocation,
    getLocationString
  };
}