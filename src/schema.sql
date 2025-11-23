-- Create dustbins table
CREATE TABLE IF NOT EXISTS dustbins (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    reported_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add check constraints for valid coordinates
ALTER TABLE dustbins 
ADD CONSTRAINT valid_latitude CHECK (latitude >= -90 AND latitude <= 90);

ALTER TABLE dustbins 
ADD CONSTRAINT valid_longitude CHECK (longitude >= -180 AND longitude <= 180);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dustbins_location ON dustbins(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_dustbins_status ON dustbins(status);
CREATE INDEX IF NOT EXISTS idx_dustbins_created_at ON dustbins(created_at DESC);

-- Insert sample data for testing
INSERT INTO dustbins (latitude, longitude, address, description, reported_by) VALUES
(28.6139, 77.2090, 'Connaught Place, New Delhi', 'Large dustbin near metro station', 'user123'),
(28.5355, 77.3910, 'Noida Sector 18', 'Dustbin at main market entrance', 'user456'),
(28.7041, 77.1025, 'Delhi University', 'Campus dustbin near library', 'user789');
