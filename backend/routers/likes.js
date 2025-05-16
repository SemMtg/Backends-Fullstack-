let router = module.exports = require('express').Router();
let data = require("../data");
const authenticate = require('../middleware/auth');
const { sendLikeEvent } = require('../events')

// Get the list of liked beers for a user
router.get('/:userName', (req, res) => {
    const { userName } = req.params;

    try {
        // Retrieve liked beers for the given user
        const likedBeers = data.getLikedBeers(userName);

        if (!likedBeers || likedBeers.length === 0) {
            return res.status(404).json({ error: 'No liked beers found for this user' });
        }

        res.json(likedBeers);
    } catch (error) {
        console.error('Error getting liked beers:', error);
        res.status(500).json({ error: 'Failed to retrieve liked beers', details: error.message });
    }
});

router.post('/like', authenticate, (req, res) => {
    const { beerId, userName = 'user' } = req.body;

    if (!beerId) {
        return res.status(400).json({ error: 'Beer ID is required' });
    }

    // Check if the user has already liked this beer
    const existingLike = data.getLikedBeers(userName).some(beer => beer.id === beerId);
    
    if (existingLike) {
        return res.status(400).json({ error: 'You have already liked this beer' });
    }

    // Add the like
    try {
        data.insertLike(beerId, userName);
        sendLikeEvent(userName, beerId );

        res.status(201).json({ message: 'Like added successfully' });
    } catch (error) {
        console.error('Error adding like:', error);
        res.status(500).json({ error: 'Failed to add like', details: error.message });
    }
});

// Remove a like (only the user who liked it)
router.delete('/like', authenticate, (req, res) => {
    const { beerId, userName = 'user' } = req.body;

    if (!beerId) {
        return res.status(400).json({ error: 'Beer ID is required' });
    }

    // Check if the user has liked this beer
    const existingLike = data.getLikedBeers(userName).some(beer => Number(beer.id) === Number(beerId));
    console.log('Liked beers:', data.getLikedBeers(userName)); 

    if (!existingLike) {
        return res.status(404).json({ error: 'You have not liked this beer' });
    }

    // Remove the like
    try {
        data.deleteLike(beerId, userName);
        res.status(200).json({ message: 'Like removed successfully' });
    } catch (error) {
        console.error('Error removing like:', error);
        res.status(500).json({ error: 'Failed to remove like', details: error.message });
    }
});