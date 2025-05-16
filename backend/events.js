const users = [];
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    // Set headers for SSE (Server-Sent Events)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Add this user connection to the list
    users.push(res);

    // Remove user when they disconnect
    req.on('close', () => {
        users.splice(users.indexOf(res), 1);
    });
});

// Function to send events to all other users
function sendEvent(data) {
    users.forEach((user) => {
        try {
            user.write(`data: ${JSON.stringify(data)}\n\n`);
        } catch (err) {
            console.error("Error sending event to user:", err);
            users.splice(index, 1);
        }
    });
}

function sendNewBeerEvent(beer) {
    sendEvent({
        type: "new_beer",
        beer: beer,
    });
}

function sendLikeEvent(userName, beerId) {
    sendEvent({
        type: "like",
        userName: userName,
        beerId: beerId,
    });
}

module.exports = { router, sendLikeEvent, sendNewBeerEvent };
