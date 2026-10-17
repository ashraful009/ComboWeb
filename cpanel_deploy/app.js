// ==============================================================
// FreshAgro - cPanel Node.js Application Startup File
// ==============================================================
const path = require('path');

// Preserve Passenger dynamic port before dotenv loads
const passengerPort = process.env.PORT;

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import the compiled Express application
const app = require('./server/dist/app').default;

// Port binding for cPanel Phusion Passenger / LiteSpeed
if (typeof(PhusionPassenger) !== 'undefined') {
  PhusionPassenger.configure({ autoInstall: false });
  app.listen('passenger', () => {
    console.log('----------------------------------------------------');
    console.log(' FreshAgro is running under Phusion Passenger!');
    console.log(' Domain: https://freshagro.farm');
    console.log(' Mode:   ' + (process.env.NODE_ENV || 'production'));
    console.log('----------------------------------------------------');
  });
} else {
  const port = passengerPort || process.env.PORT || 3000;
  app.listen(port, () => {
    console.log('----------------------------------------------------');
    console.log(' FreshAgro Production Server is Running!');
    console.log(' Domain: https://freshagro.farm');
    console.log(' Port:   ' + port);
    console.log(' Mode:   ' + (process.env.NODE_ENV || 'production'));
    console.log('----------------------------------------------------');
  });
}
