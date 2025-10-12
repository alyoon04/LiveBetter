-- LiveBetter MVP Database Schema

-- Drop tables if they exist (for development resets)
DROP TABLE IF EXISTS metro_quality_of_life CASCADE;
DROP TABLE IF EXISTS metro_costs CASCADE;
DROP TABLE IF EXISTS metro CASCADE;

-- Metro table: core city information
CREATE TABLE metro (
  metro_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  cbsa_code TEXT UNIQUE,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  population INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Metro costs table: financial indicators per metro
CREATE TABLE metro_costs (
  metro_id INT PRIMARY KEY REFERENCES metro(metro_id) ON DELETE CASCADE,
  median_rent_usd NUMERIC NOT NULL,        -- monthly 2-bedroom rent
  rpp_index NUMERIC NOT NULL,              -- 1.00 = national average
  eff_tax_rate NUMERIC NOT NULL,           -- 0..1 effective rate for typical salary band
  utilities_monthly NUMERIC NOT NULL,      -- monthly baseline utilities
  source_tag TEXT,                         -- versioning tag for ETL batch (e.g., "2025Q4_mvp_v1")
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX idx_metro_state ON metro(state);
CREATE INDEX idx_metro_population ON metro(population);
CREATE INDEX idx_metro_costs_rpp ON metro_costs(rpp_index);
CREATE INDEX idx_metro_costs_rent ON metro_costs(median_rent_usd);

-- Quality of Life metrics table
CREATE TABLE metro_quality_of_life (
  metro_id INT PRIMARY KEY REFERENCES metro(metro_id) ON DELETE CASCADE,
  school_score NUMERIC CHECK (school_score >= 0 AND school_score <= 100),  -- 0-100, higher is better
  crime_rate NUMERIC,                                                      -- Violent crimes per 100k population
  weather_score NUMERIC CHECK (weather_score >= 0 AND weather_score <= 100),  -- 0-100, higher is better
  healthcare_score NUMERIC CHECK (healthcare_score >= 0 AND healthcare_score <= 100),  -- 0-100, access & quality
  walkability_score NUMERIC CHECK (walkability_score >= 0 AND walkability_score <= 100),  -- 0-100, walkability index
  air_quality_index NUMERIC,                                               -- 0-500, lower is better (EPA AQI)
  commute_time_mins NUMERIC,                                               -- Average commute time in minutes
  source_tag TEXT,                                                         -- versioning tag for data batch
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for quality of life queries
CREATE INDEX idx_qol_school ON metro_quality_of_life(school_score);
CREATE INDEX idx_qol_crime ON metro_quality_of_life(crime_rate);
CREATE INDEX idx_qol_weather ON metro_quality_of_life(weather_score);

-- Comments for documentation
COMMENT ON TABLE metro IS 'Core metropolitan area information';
COMMENT ON TABLE metro_costs IS 'Financial indicators and cost data per metro';
COMMENT ON TABLE metro_quality_of_life IS 'Quality of life metrics per metro';
COMMENT ON COLUMN metro_costs.rpp_index IS 'Regional Price Parity index: 1.00 = national average, >1.00 = more expensive';
COMMENT ON COLUMN metro_costs.eff_tax_rate IS 'Effective income tax rate (0-1) based on typical salary band';
COMMENT ON COLUMN metro_quality_of_life.school_score IS 'School quality score 0-100, based on test scores and graduation rates';
COMMENT ON COLUMN metro_quality_of_life.crime_rate IS 'Violent crimes per 100,000 population';
COMMENT ON COLUMN metro_quality_of_life.weather_score IS 'Weather desirability score 0-100, based on temp, sunshine, precipitation';
COMMENT ON COLUMN metro_quality_of_life.healthcare_score IS 'Healthcare access and quality score 0-100';
COMMENT ON COLUMN metro_quality_of_life.walkability_score IS 'Walkability index 0-100, based on Walk Score data';
COMMENT ON COLUMN metro_quality_of_life.air_quality_index IS 'EPA Air Quality Index 0-500, lower is better';
