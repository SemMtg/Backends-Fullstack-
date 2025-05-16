let router = module.exports = require('express').Router();
let data = require("../data");

// Attach the router from the test.js file to the /test base url
router.use('/test', require('./test'));

router.use("/beers", require('./beers'));

router.use("/users", require('./users'));

router.use("/likes", require('./likes'));

const { router: eventsRouter } = require('../events');
router.use('/events', eventsRouter)


router.get("/hello", (req, res) => {
    res.send("Hello World!");
    // localhost:3000/hello
});
