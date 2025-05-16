const express = require('express');
const data = require('./data');
const cors = require('cors');
const events = require('./events')

// Create an express app
const app = express();

// Configure express to automatically decode JSON bodies
app.use(express.json());

// This lets browsers know that any website is allowed to make requests to our API.
// In practice we'd rarely want this to be open, instead you'd define which websites
// you allow to make requests to your API.
app.use(cors());

// Configure CORS
const allowedOrigins = ['http://localhost:9000'];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));

// Make sure tables and initial data exist in the database
data.applySchema();

// This route causes the database to reset to what's in `schema.sql`.
// This should *not* be enabled in production, it's for testing only.
if (process.env.ALLOW_RESET_DATABASE) {
	app.put('/reset_database', function(req,rsp) {
		data.dropAllTables();
		data.applySchema();
		rsp.json({});
	});
}

app.get('/test-token', (req, res) => {
    console.log('Authorization Header:', req.headers['authorization']);
    res.json({ token: req.headers['authorization'] });
});

// Include the routers
app.use(require('./routers'));

app.use('/events', events.router);

// Start accepting requests
const listener = app.listen(process.env.PORT || 3000, "0.0.0.0", function () {
	console.log(`Server running at http://${listener.address().address}:${listener.address().port}`);
});
