// src/config/pusher.js
const Pusher = require('pusher');
require('dotenv').config();

const trackingPusherConfig = {
    appId: process.env.PUSHER_TRACKING_ID,
    key: process.env.PUSHER_TRACKING_KEY,
    secret: process.env.PUSHER_TRACKING_SECRET,
    cluster: process.env.PUSHER_APP_CLUSTER,
    useTLS: true,
};

const trackingPusher = new Pusher({
    appId: trackingPusherConfig.appId,
    key: trackingPusherConfig.key,
    secret: trackingPusherConfig.secret,
    cluster: trackingPusherConfig.cluster,
    useTLS: trackingPusherConfig.useTLS,
});

module.exports = { trackingPusher };