// Get an instance of mysql we can use in the app
const postgres = require('pg');

const pool = new postgres.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'riceCAD',
    password: 'yo',
    port: 5432,
})

// Export it for use in our application
module.exports.pool = pool;