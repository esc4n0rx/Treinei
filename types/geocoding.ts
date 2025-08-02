// types/geocoding.ts
export interface OpenCageGeometry {
  lat: number;
  lng: number;
}

export interface OpenCageComponents {
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  county?: string;
  state?: string;
  country?: string;
  postcode?: string;
  // Campos específicos do Brasil
  city_district?: string;
  municipality?: string;
  state_district?: string;
}

export interface OpenCageResult {
  annotations: {
    DMS: {
      lat: string;
      lng: string;
    };
    MGRS: string;
    Maidenhead: string;
    Mercator: {
      x: number;
      y: number;
    };
    OSM: {
      edit_url: string;
      note_url: string;
      url: string;
    };
    UN_M49: {
      regions: {
        [key: string]: string;
      };
      statistical_groupings: string[];
    };
    callingcode: number;
    currency: {
      alternate_symbols: string[];
      decimal_mark: string;
      html_entity: string;
      iso_code: string;
      iso_numeric: string;
      name: string;
      smallest_denomination: number;
      subunit: string;
      subunit_to_unit: number;
      symbol: string;
      symbol_first: number;
      thousands_separator: string;
    };
    flag: string;
    geohash: string;
    qibla: number;
    roadinfo: {
      drive_on: string;
      road: string;
      speed_in: string;
    };
    sun: {
      rise: {
        apparent: number;
        astronomical: number;
        civil: number;
        nautical: number;
      };
      set: {
        apparent: number;
        astronomical: number;
        civil: number;
        nautical: number;
      };
    };
    timezone: {
      name: string;
      now_in_dst: number;
      offset_sec: number;
      offset_string: string;
      short_name: string;
    };
    what3words: {
      words: string;
    };
  };
  bounds: {
    northeast: {
      lat: number;
      lng: number;
    };
    southwest: {
      lat: number;
      lng: number;
    };
  };
  components: OpenCageComponents;
  confidence: number;
  formatted: string;
  geometry: OpenCageGeometry;
}

export interface OpenCageResponse {
  documentation: string;
  licenses: Array<{
    name: string;
    url: string;
  }>;
  rate: {
    limit: number;
    remaining: number;
    reset: number;
  };
  results: OpenCageResult[];
  status: {
    code: number;
    message: string;
  };
  stay_informed: {
    blog: string;
    mastodon: string;
  };
  thanks: string;
  timestamp: {
    created_http: string;
    created_unix: number;
  };
  total_results: number;
}

export interface GeocodingResponse {
  success: boolean;
  address?: string;
  shortAddress?: string;
  fullData?: OpenCageResult;
  error?: string;
  fromCache?: boolean;
}

export interface CachedLocation {
  address: string;
  shortAddress: string;
  timestamp: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}