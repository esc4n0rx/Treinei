export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface LocationPermissionState {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
  loading: boolean;
}

export interface GeolocationHookReturn {
  coordinates: LocationCoordinates | null;
  permissionState: LocationPermissionState;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<LocationCoordinates | null>;
  getLocationString: () => Promise<string | null>;
}