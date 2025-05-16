let router = module.exports = require('express').Router();

// localhost:3000/test/hi
router.get("/hi", (req, res) => {
    res.send("Hi World!");
});
