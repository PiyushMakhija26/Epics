import express from 'express';
import INDIA_LOCATIONS from '../utils/indiaLocations';

const router = express.Router();

// GET /api/locations/states
router.get('/states', (req, res) => {
  try {
    const states = INDIA_LOCATIONS.map((s) => s.state);
    res.json({ states });
  } catch (err) {
    console.error('Error fetching states:', err);
    res.status(500).json({ error: 'Failed to fetch states' });
  }
});

// GET /api/locations/cities?state=StateName
router.get('/cities', (req, res) => {
  try {
    const { state } = req.query;
    if (!state || typeof state !== 'string') {
      res.status(400).json({ error: 'Missing state query parameter' });
      return;
    }

    const entry = INDIA_LOCATIONS.find((s) => s.state === state);
    res.json({ cities: entry ? entry.cities : [] });
  } catch (err) {
    console.error('Error fetching cities:', err);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

export default router;
