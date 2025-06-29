// const { Pool } = require('pg');

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false, // Required for Render
//   },
// });

// module.exports = pool;

// dbConfig.js
const { Pool } = require("pg");
require("dotenv").config(); // Ensure this is at the top

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
