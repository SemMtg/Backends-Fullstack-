const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
let router = module.exports = require('express').Router();
let data = require("../data");
const authenticate = require('../middleware/auth');
const secretKey = process.env.JWT_SECRET_KEY || 'my-secret-key';

// Route to authenticate and generate a JWT token
router.post('/login', async (req, res) => {
    const { userName, password } = req.body;

    if (!userName || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        // Fetch user from the database
        const user = await data.getUser(userName);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.bcryptPassword);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Generate a JWT token with user's name and level
        const token = jwt.sign(
            { userName: user.name, userLevel: user.level },
            secretKey,
            { expiresIn: '5h' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/', (req, res) => {
    try {
        const users = data.getUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve users' });
    }
});

router.post('/', authenticate, async (req, res) => {
    if (req.userLevel < 8) {
        return res.status(403).json({ error: 'Insufficient level to add a user' });
    }
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ error: 'Name and password are required' });
    }

    // Check if user already exists
    const existingUser = data.getUser(name);
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
    }

    try {
        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user with the hashed password
        const changes = data.insertUser(name, hashedPassword, 'user');

        if (changes === 0) {
            return res.status(500).json({ error: 'Failed to create user' });
        }

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: 'Failed to create user', details: error.message });
    }
});