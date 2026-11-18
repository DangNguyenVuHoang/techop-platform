-- 0001_init_foundation.sql
-- Purpose: Database foundation primitives (UUID generation & updated_at trigger helper).
-- Business schemas (Auth/RBAC, CRM/Leads, CMS/Media, Integrations) are deferred to Phases 1-4.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

