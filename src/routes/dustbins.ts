import { Router, Request, Response } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { dustbins, type NewDustbin } from '../db/schema';

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

        let results;
        if (status && typeof status === 'string') {
            results = await db
                .select()
                .from(dustbins)
                .where(eq(dustbins.status, status as any))
                .orderBy(desc(dustbins.createdAt));
        } else {
            results = await db
                .select()
                .from(dustbins)
                .orderBy(desc(dustbins.createdAt));
        }

        res.json({
            count: results.length,
            dustbins: results.map(row => ({
                id: row.id,
                latitude: parseFloat(row.latitude),
                longitude: parseFloat(row.longitude),
                address: row.address,
                description: row.description,
                status: row.status,
                reportedBy: row.reportedBy,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt
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

        const result = await db
            .select()
            .from(dustbins)
            .where(eq(dustbins.id, parseInt(id)));

        if (result.length === 0) {
            return res.status(404).json({
                error: 'Dustbin not found',
                id: parseInt(id)
            });
        }

        const row = result[0];
        res.json({
            id: row.id,
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude),
            address: row.address,
            description: row.description,
            status: row.status,
            reportedBy: row.reportedBy,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
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

        const newDustbin: NewDustbin = {
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            address: address || null,
            description: description || null,
            reportedBy: reportedBy || null,
        };

        const result = await db
            .insert(dustbins)
            .values(newDustbin)
            .returning();

        const row = result[0];
        res.status(201).json({
            id: row.id,
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude),
            address: row.address,
            description: row.description,
            status: row.status,
            reportedBy: row.reportedBy,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
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
        const existing = await db
            .select()
            .from(dustbins)
            .where(eq(dustbins.id, parseInt(id)));

        if (existing.length === 0) {
            return res.status(404).json({
                error: 'Dustbin not found',
                id: parseInt(id)
            });
        }

        // Build dynamic update object
        const updateData: Partial<NewDustbin> & { updatedAt?: Date } = {};

        if (latitude !== undefined) {
            const validationError = validateCoordinates(latitude, longitude || 0);
            if (validationError && validationError.includes('Latitude')) {
                return res.status(400).json({
                    error: 'Invalid coordinates',
                    details: validationError
                });
            }
            updateData.latitude = latitude.toString();
        }

        if (longitude !== undefined) {
            const validationError = validateCoordinates(latitude || 0, longitude);
            if (validationError && validationError.includes('Longitude')) {
                return res.status(400).json({
                    error: 'Invalid coordinates',
                    details: validationError
                });
            }
            updateData.longitude = longitude.toString();
        }

        if (address !== undefined) {
            updateData.address = address;
        }

        if (description !== undefined) {
            updateData.description = description;
        }

        if (status !== undefined) {
            const validStatuses = ['active', 'full', 'damaged', 'removed'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    error: 'Invalid status',
                    details: `Status must be one of: ${validStatuses.join(', ')}`
                });
            }
            updateData.status = status;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                error: 'No fields to update',
                details: 'Provide at least one field to update'
            });
        }

        updateData.updatedAt = new Date();

        const result = await db
            .update(dustbins)
            .set(updateData)
            .where(eq(dustbins.id, parseInt(id)))
            .returning();

        const row = result[0];

        res.json({
            id: row.id,
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude),
            address: row.address,
            description: row.description,
            status: row.status,
            reportedBy: row.reportedBy,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
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

        const result = await db
            .delete(dustbins)
            .where(eq(dustbins.id, parseInt(id)))
            .returning({ id: dustbins.id });

        if (result.length === 0) {
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
