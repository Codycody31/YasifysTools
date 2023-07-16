const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Set up the Matomo and Google Analytics variables
const MATOMO_URL = process.env.MATOMO_URL;
const MATOMO_SITE_ID = process.env.MATOMO_SITE_ID;
const GA_TRACKING_ID = process.env.GA_TRACKING_ID;

// Set up the Matomo variables, if they are set
if (MATOMO_URL && MATOMO_SITE_ID) {
    var MATOMO = {
        URL: MATOMO_URL,
        SITE_ID: MATOMO_SITE_ID
    };
}
else {
    var MATOMO = null;
}

// Handler function for rendering the home page
exports.renderHomePage = (req, res) => {
    res.render('index', { error: null, title: null, thumbnail: null, filename: null, FinishedName: null, version: process.env.npm_package_version, matomo: MATOMO, gaTrackingId: GA_TRACKING_ID });
};

// Handler function for rendering the about page
exports.renderAboutPage = (req, res) => {
    res.render('about', { version: process.env.npm_package_version, matomo: MATOMO, gaTrackingId: GA_TRACKING_ID });
};

// Handler function for rendering the tiktok page
exports.renderTikTokPage = (req, res) => {
    res.render('tiktok', { error: null, title: null, thumbnail: null, filename: null, FinishedName: null, version: process.env.npm_package_version, matomo: MATOMO, gaTrackingId: GA_TRACKING_ID });
};

// Handler function for serving the downloaded video
exports.downloadVideo = (req, res) => {
    const url = req.query.url;
    if (!url) {
        res.status(400).send('Missing "url" parameter');
        return;
    }

    // Ensure the filename is a relative path (no leading slash) and contains no directory traversal
    if (url.startsWith('/') || url.startsWith('..') || url.includes('..')) {
        res.status(400).send('Invalid "url" parameter');
        return;
    }

    const filename = decodeURIComponent(url);
    const filePath = path.join(__dirname, '..', 'public', 'downloads', filename);
    fs.access(filePath, (err) => {
        if (err) {
            console.log(`Error: Could not find video "${filename}"`);
            res.status(404).send(`Video "${filename}" not found`);
            return;
        }

        res.download(filePath, filename, (err) => {
            if (err) {
                console.log(`Error: Could not download video "${filename}"`);
                res.status(500).send(`Error downloading video "${filename}"`);
                return;
            }

            console.log(`Video downloaded: ${filename}`);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log(`Error: Could not delete video "${filename}" after download`);
                    return;
                }
                console.log(`Video deleted: ${filename}`);
            });
        });
    });
};

// Handler function for rendering the player page
exports.renderPlayerPage = (req, res) => {
    const { url, title } = req.query;
    const filePath = path.join('/downloads', url);

    res.render('player', { url: filePath, title, version: process.env.npm_package_version, matomo: MATOMO, gaTrackingId: GA_TRACKING_ID });
};
