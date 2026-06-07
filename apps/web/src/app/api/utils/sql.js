import postgres from 'postgres';

// In-memory database mocks for local development when DATABASE_URL is not provided
const apologySitesDb = new Map();
const liveTrackingDb = new Map();

const mockSql = (strings, ...values) => {
  const query = strings.join('?').trim();

  // 1. DDL creation / Index creation
  if (query.includes('CREATE TABLE') || query.includes('CREATE INDEX')) {
    return Promise.resolve([]);
  }

  // 2. INSERT INTO apology_sites
  if (query.includes('INSERT INTO apology_sites')) {
    const slug = values[0];
    const edit_password = values[1];
    const config = values[2];
    
    const id = 'uuid-' + Math.random().toString(36).slice(2, 11) + '-' + Math.random().toString(36).slice(2, 11);
    const row = {
      id,
      slug,
      edit_password,
      config: typeof config === 'string' ? JSON.parse(config) : config
    };
    apologySitesDb.set(id, row);
    return Promise.resolve([row]);
  }

  // 3. SELECT FROM apology_sites WHERE slug = ...
  if (query.includes('FROM apology_sites WHERE slug =')) {
    const slug = values[0];
    const row = Array.from(apologySitesDb.values()).find(r => r.slug === slug);
    if (!row) return Promise.resolve([]);
    return Promise.resolve([row]);
  }

  // 4. UPDATE apology_sites SET config = ... WHERE slug = ...
  if (query.includes('UPDATE apology_sites SET config =')) {
    const config = values[0];
    const slug = values[1];
    const row = Array.from(apologySitesDb.values()).find(r => r.slug === slug);
    if (row) {
      row.config = typeof config === 'string' ? JSON.parse(config) : config;
      return Promise.resolve([row]);
    }
    return Promise.resolve([]);
  }

  // 5. SELECT FROM live_tracking WHERE site_id = ...
  if (query.includes('FROM live_tracking WHERE site_id =')) {
    const siteId = values[0];
    const rows = Array.from(liveTrackingDb.values())
      .filter(r => r.site_id === siteId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return Promise.resolve(rows);
  }

  // 6. INSERT INTO live_tracking
  if (query.includes('INSERT INTO live_tracking')) {
    const siteId = values[0];
    const sessionId = values[1];
    const currentSection = values[2];
    const batteryLevel = values[3];
    const lastAction = values[4];
    const hesitationDetected = values[5];
    const hesitationSeconds = values[6];

    const existing = liveTrackingDb.get(sessionId) || {};
    const updated = {
      id: existing.id || 'uuid-track-' + Math.random().toString(36).slice(2, 9),
      site_id: siteId,
      session_id: sessionId,
      current_section: currentSection !== undefined ? currentSection : (existing.current_section ?? null),
      battery_level: typeof batteryLevel === 'number' ? Math.max(batteryLevel, existing.battery_level ?? 0) : (existing.battery_level ?? 0),
      last_action: lastAction !== undefined ? lastAction : (existing.last_action ?? null),
      broadcast_msg: existing.broadcast_msg ?? null,
      hesitation_detected: hesitationDetected !== undefined ? (hesitationDetected || (existing.hesitation_detected ?? false)) : (existing.hesitation_detected ?? false),
      hesitation_seconds: typeof hesitationSeconds === 'number' ? Math.max(hesitationSeconds, existing.hesitation_seconds ?? 0) : (existing.hesitation_seconds ?? 0),
      created_at: existing.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    liveTrackingDb.set(sessionId, updated);
    return Promise.resolve([updated]);
  }

  // 7. SELECT broadcast_msg FROM live_tracking WHERE session_id = ... AND site_id = ...
  if (query.includes('SELECT broadcast_msg FROM live_tracking WHERE session_id =') && query.includes('site_id =')) {
    const sessionId = values[0];
    const siteId = values[1];
    const row = liveTrackingDb.get(sessionId);
    if (row && row.site_id === siteId) {
      return Promise.resolve([row]);
    }
    return Promise.resolve([{ broadcast_msg: null }]);
  }

  // 8. UPDATE live_tracking SET broadcast_msg = ... WHERE session_id = ... AND site_id = ...
  if (query.includes('UPDATE live_tracking') && query.includes('SET broadcast_msg =') && !query.includes('SET broadcast_msg = NULL') && query.includes('site_id =')) {
    const message = values[0];
    const sessionId = values[1];
    const siteId = values[2];
    const row = liveTrackingDb.get(sessionId);
    if (row && row.site_id === siteId) {
      row.broadcast_msg = message;
      row.updated_at = new Date().toISOString();
      return Promise.resolve([row]);
    }
    return Promise.resolve([]);
  }

  // 9. UPDATE live_tracking SET broadcast_msg = NULL WHERE session_id = ... AND site_id = ...
  if (query.includes('UPDATE live_tracking SET broadcast_msg = NULL') && query.includes('site_id =')) {
    const sessionId = values[0];
    const siteId = values[1];
    const row = liveTrackingDb.get(sessionId);
    if (row && row.site_id === siteId) {
      row.broadcast_msg = null;
      row.updated_at = new Date().toISOString();
      return Promise.resolve([row]);
    }
    return Promise.resolve([]);
  }

  // Fallbacks for legacy/fallback single-row queries (if any remain)
  if (query.includes('FROM sites WHERE slug =')) {
    const slug = values[0];
    const row = Array.from(apologySitesDb.values()).find(r => r.slug === slug);
    if (!row) return Promise.resolve([]);
    // Mock legacy output structure (password instead of edit_password)
    return Promise.resolve([{ ...row, password: row.edit_password }]);
  }

  return Promise.resolve([]);
};

mockSql.transaction = (callback) => {
  return callback(mockSql);
};

function sanitizeDatabaseUrl(urlStr) {
  if (!urlStr) return urlStr;
  try {
    const url = new URL(urlStr);
    url.searchParams.delete('channel_binding');
    return url.toString();
  } catch (e) {
    console.error('Failed to parse DATABASE_URL', e);
    return urlStr.replace(/([?&])channel_binding=[^&]*/, '$1').replace(/\?$/, '');
  }
}

const cleanedUrl = sanitizeDatabaseUrl(process.env.DATABASE_URL);

const sqlConnection = cleanedUrl
  ? postgres(cleanedUrl, {
      ssl: { rejectUnauthorized: false },
      connect_timeout: 5,
    })
  : null;

const sql = sqlConnection || mockSql;

export default sql;