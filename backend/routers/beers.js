let router = module.exports = require('express').Router();
let data = require("../data");
const authenticate = require('../middleware/auth');
const { sendNewBeerEvent } = require('../events');

// Route to get all and optionally filter beers
router.get('/', (req, res) => {
    const { brewery, category, minPercentage, maxPercentage, order } = req.query;

    const filters = {};
    if (brewery) filters.brewery = brewery;
    if (category) filters.category = category;
    if (minPercentage) filters.minPercentage = parseFloat(minPercentage);
    if (maxPercentage) filters.maxPercentage = parseFloat(maxPercentage);

    try {
        const beers = data.getBeers(order, filters);
        res.json(beers);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve beers" });
    }
});

// Route to add a new beer
router.post("/", authenticate, (req, res) => {
    if (req.userLevel < 8) {
        return res.status(403).json({ error: 'Insufficient level to add a beer' });
    }
    const {name, percentage, brewery, category} = req.body;

    if (!name || !percentage || !brewery || !category) {
        return res.status(400).json({ error: "All fields (name, percentage, brewery, category) are required" });
    }

    const beer = { name, percentage:parseFloat(percentage), brewery, category };

    try {
        data.insertBeer(beer);
        sendNewBeerEvent(beer);
        res.status(201).json({ message: "Beer added succesfully", beer });
    } catch (error) {
        res.status(500).json({ error: "Failed to add beer" });
    }
});

// Route to delete a beer
router.delete("/:id", authenticate,  (req, res) => {
    if (req.userLevel < 8) {
        return res.status(403).json({ error: 'Insufficient level to delete a beer' });
    }
    const beerId = parseInt(req.params.id);

    const beer = data.getBeer(beerId);

    if (!beer) {
        return res.status(404).json({ error: "Beer not found" });
    }

    const result = data.deleteBeer(beerId);

    if (result === 0) {
        return res.status(404).json({ error: "Failed to delete beer" });
    }

    res.status(200).json({ message: `Beer with id:${beerId} deleted successfully` });
});