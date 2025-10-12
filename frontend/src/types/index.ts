// Type definitions for LiveBetter frontend

export interface RankRequest {
  salary: number;
  family_size: number;
  rent_cap_pct: number;
  population_min: number;
  limit: number;
  // Preference weights (0-10 scale)
  affordability_weight: number;
  schools_weight: number;
  safety_weight: number;
  weather_weight: number;
  healthcare_weight: number;
  walkability_weight: number;
}

export interface Essentials {
  rent: number;
  utilities: number;
  groceries: number;
  transport: number;
}

export interface Coords {
  lat: number;
  lon: number;
}

export interface QualityOfLife {
  school_score?: number;
  crime_rate?: number;
  weather_score?: number;
  healthcare_score?: number;
  walkability_score?: number;
  air_quality_index?: number;
  commute_time_mins?: number;
}

export interface Metro {
  metro_id: number;
  name: string;
  state: string;
  score: number;  // Composite score
  affordability_score: number;  // Just affordability component
  discretionary_income: number;
  essentials: Essentials;
  net_monthly_adjusted: number;
  rpp_index: number;
  population: number | null;
  coords: Coords;
  quality_of_life?: QualityOfLife;
}

export interface RankResponse {
  input: RankRequest;
  results: Metro[];
}

export type SortField = 'score' | 'discretionary_income' | 'rent' | 'rpp_index';
export type SortDirection = 'asc' | 'desc';
