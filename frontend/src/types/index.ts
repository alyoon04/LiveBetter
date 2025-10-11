// Type definitions for LiveBetter frontend

export interface RankRequest {
  salary: number;
  family_size: number;
  rent_cap_pct: number;
  population_min: number;
  limit: number;
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

export interface Metro {
  metro_id: number;
  name: string;
  state: string;
  score: number;
  discretionary_income: number;
  essentials: Essentials;
  net_monthly_adjusted: number;
  rpp_index: number;
  population: number | null;
  coords: Coords;
}

export interface RankResponse {
  input: RankRequest;
  results: Metro[];
}

export type SortField = 'score' | 'discretionary_income' | 'rent' | 'rpp_index';
export type SortDirection = 'asc' | 'desc';
