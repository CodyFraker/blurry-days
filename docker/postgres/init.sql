-- Initialize the database for Grainydays Drinking Game
-- This script runs when the PostgreSQL container starts

-- Create the database if it doesn't exist
-- (PostgreSQL creates the database automatically based on POSTGRES_DB env var)

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE grainydays TO grainydays;
GRANT ALL PRIVILEGES ON SCHEMA public TO grainydays;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC'; 