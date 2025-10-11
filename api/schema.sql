-- LiveBetter MVP Database Schema

-- Drop tables if they exist (for development resets)
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

-- Comments for documentation
COMMENT ON TABLE metro IS 'Core metropolitan area information';
COMMENT ON TABLE metro_costs IS 'Financial indicators and cost data per metro';
COMMENT ON COLUMN metro_costs.rpp_index IS 'Regional Price Parity index: 1.00 = national average, >1.00 = more expensive';
COMMENT ON COLUMN metro_costs.eff_tax_rate IS 'Effective income tax rate (0-1) based on typical salary band';
