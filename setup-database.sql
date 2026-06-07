-- Create apology_sites table
CREATE TABLE IF NOT EXISTS apology_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  edit_password VARCHAR(255) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_apology_sites_slug ON apology_sites(slug);

-- Create live_tracking table
CREATE TABLE IF NOT EXISTS live_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES apology_sites(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  current_section VARCHAR(255),
  battery_level INTEGER DEFAULT 0,
  last_action VARCHAR(255),
  broadcast_msg TEXT,
  hesitation_detected BOOLEAN DEFAULT FALSE,
  hesitation_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for live_tracking
CREATE INDEX IF NOT EXISTS idx_live_tracking_site_id ON live_tracking(site_id);
CREATE INDEX IF NOT EXISTS idx_live_tracking_session_id ON live_tracking(session_id);
CREATE INDEX IF NOT EXISTS idx_live_tracking_site_session ON live_tracking(site_id, session_id);
