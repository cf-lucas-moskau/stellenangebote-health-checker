const express = require('express');
const cron = require('node-cron');
const axios = require('axios');
const { exec } = require('child_process');

const app = express();
const BACKEND_URL = 'https://stan-backend.cloudfood.net/jobs';

// Health check function
function checkBackendHealth() {
    axios.get(BACKEND_URL)
        .then(response => {
            console.log('Backend is up:', response.status);
        })
        .catch(error => {
            if (error.response && error.response.status >= 500) {
                console.log('Backend error detected, restarting...');
                restartBackend();
            } else {
                console.log('Error checking backend:', error.message);
            }
        });
}

// Function to restart backend
function restartBackend() {
    console.log('Restarting backend...')
    exec('cd .. && cd STAN-Relaunch-backend && pm2 stop backend && pm2 start app.js --name backend', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error restarting backend: ${error}`);
            return;
        }
        console.log(`Backend restarted: ${stdout}`);
    });
}

// Schedule to run every minute
cron.schedule('* * * * *', () => {
    console.log('Running scheduled health check...');
    checkBackendHealth();
    restartBackend();
});

app.listen(3000, () => {
    console.log('Monitoring app running on port 3000');
});
