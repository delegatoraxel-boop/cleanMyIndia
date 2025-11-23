import { Router, Request, Response } from 'express';
import { pool } from '../db.js';

const router = Router();

// Validation helper
function validateCoordinates(lat: number, lon: number): string | null {
    if (typeof lat !== 'number' || isNaN(lat)) {
        return 'Latitude must be a valid number';
    }
    if (typeof lon !== 'number' || isNaN(lon)) {
        return 'Longitude must be a valid number';
    }
    if (lat < -90 || lat > 90) {
        return 'Latitude must be between -90 and 90';
    }
    if (lon < -180 || lon > 180) {
        return 'Longitude must be between -180 and 180';
    }
    return null;
}

// GET /api/dustbins - Get all dustbins
router.get('/', async (req: Request, res: Response) => {
    try {
        const { status } = req.query;

        let query = 'SELECT * FROM dustbins';
        const params: any[] = [];

        if (status) {
            query += ' WHERE status = $1';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, params);

        res.json({
            count: result.rows.length,
            dustbins: result.rows.map(row => ({
                id: row.id,
                latitude: parseFloat(row.latitude),
                longitude: parseFloat(row.longitude),
                address: row.address,
                description: row.description,
                status: row.status,
                reportedBy: row.reported_by,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            }))
        });
    } catch (error) {
        console.error('Error fetching dustbins:', error);
        res.status(500).json({
            error: 'Database error',
            message: 'Failed to fetch dustbins'
        });
    }
});

// GET /api/dustbins/:id - Get single dustbin
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT * FROM dustbins WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Dustbin not found',
                id: parseInt(id)
            });
        }

        const row = result.rows[0];
        res.json({
            id: row.id,
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude),
            address: row.address,
            description: row.description,
            status: row.status,
            reportedBy: row.reported_by,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    } catch (error) {
        console.error('Error fetching dustbin:', error);
        res.status(500).json({
            error: 'Database error',
            message: 'Failed to fetch dustbin'
        });
    }
});

// POST /api/dustbins - Create new dustbin
router.post('/', async (req: Request, res: Response) => {
    try {
        const { latitude, longitude, address, description, reportedBy } = req.body;

        // Validate required fields
        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'latitude and longitude are required'
            });
        }

        // Validate coordinates
        const validationError = validateCoordinates(latitude, longitude);
        if (validationError) {
            return res.status(400).json({
                error: 'Invalid coordinates',
                details: validationError
            });
        }

        // Validate optional fields
        if (address && address.length > 500) {
            return res.status(400).json({
                error: 'Invalid address',
                details: 'Address must be less than 500 characters'
            });
        }

        if (description && description.length > 1000) {
            return res.status(400).json({
                error: 'Invalid description',
                details: 'Description must be less than 1000 characters'
            });
        }

        const result = await pool.query(
            `INSERT INTO dustbins (latitude, longitude, address, description, reported_by) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [latitude, longitude, address || null, description || null, reportedBy || null]
        );

        const row = result.rows[0];
        res.status(201).json({
            id: row.id,
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude),
            address: row.address,
            description: row.description,
            status: row.status,
            reportedBy: row.reported_by,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    } catch (error) {
        console.error('Error creating dustbin:', error);
        res.status(500).json({
            error: 'Database error',
            message: 'Failed to create dustbin'
        });
    }
});

// PUT /api/dustbins/:id - Update dustbin
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { latitude, longitude, address, description, status } = req.body;

        // Check if dustbin exists
        const checkResult = await pool.query(
            'SELECT id FROM dustbins WHERE id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Dustbin not found',
                id: parseInt(id)
            });
        }

        // Build dynamic update query
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (latitude !== undefined) {
            const validationError = validateCoordinates(latitude, longitude || 0);
            if (validationError && validationError.includes('Latitude')) {
                return res.status(400).json({
                    error: 'Invalid coordinates',
                    details: validationError
                });
            }
            updates.push(`latitude = $${paramCount++}`);
            values.push(latitude);
        }

        if (longitude !== undefined) {
            const validationError = validateCoordinates(latitude || 0, longitude);
            if (validationError && validationError.includes('Longitude')) {
                return res.status(400).json({
                    error: 'Invalid coordinates',
                    details: validationError
                });
            }
            updates.push(`longitude = $${paramCount++}`);
            values.push(longitude);
        }

        if (address !== undefined) {
            updates.push(`address = $${paramCount++}`);
            values.push(address);
        }

        if (description !== undefined) {
            updates.push(`description = $${paramCount++}`);
            values.push(description);
        }

        if (status !== undefined) {
            const validStatuses = ['active', 'full', 'damaged', 'removed'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    error: 'Invalid status',
                    details: `Status must be one of: ${validStatuses.join(', ')}`
                });
            }
            updates.push(`status = $${paramCount++}`);
            values.push(status);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                error: 'No fields to update',
                details: 'Provide at least one field to update'
            });
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const query = `
            UPDATE dustbins 
            SET ${updates.join(', ')} 
            WHERE id = $${paramCount} 
            RETURNING *
        `;

        const result = await pool.query(query, values);
        const row = result.rows[0];

        res.json({
            id: row.id,
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude),
            address: row.address,
            description: row.description,
            status: row.status,
            reportedBy: row.reported_by,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    } catch (error) {
        console.error('Error updating dustbin:', error);
        res.status(500).json({
            error: 'Database error',
            message: 'Failed to update dustbin'
        });
    }
});

// DELETE /api/dustbins/:id - Delete dustbin
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM dustbins WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Dustbin not found',
                id: parseInt(id)
            });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting dustbin:', error);
        res.status(500).json({
            error: 'Database error',
            message: 'Failed to delete dustbin'
        });
    }
});

export default router;
