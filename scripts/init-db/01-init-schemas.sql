-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create Schemas based on Architecture Definitions
CREATE SCHEMA IF NOT EXISTS ai_vectors;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS audit;

-- Public schema already exists, but we ensure it's accessible
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA ai_vectors TO postgres;
GRANT ALL ON SCHEMA analytics TO postgres;
GRANT ALL ON SCHEMA audit TO postgres;

-- (Optional) Set timezone
SET timezone = 'UTC';
