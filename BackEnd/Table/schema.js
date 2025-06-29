// const dbConnection = require('../Db/dbConfig');

// const users = `CREATE TABLE IF NOT EXISTS users (
//   userid SERIAL PRIMARY KEY,
//   username VARCHAR(20) NOT NULL,
//   firstname VARCHAR(20) NOT NULL,
//   lastname VARCHAR(20) NOT NULL,
//   email VARCHAR(40) NOT NULL,
//   password VARCHAR(100) NOT NULL,
//   profile_pic TEXT DEFAULT NULL
// );`;

// const questions = `CREATE TABLE IF NOT EXISTS questions (
//   questionid SERIAL PRIMARY KEY,
//   userid INTEGER REFERENCES users(userid) ON DELETE SET NULL,
//   title VARCHAR(200) NOT NULL,
//   description VARCHAR(400) NOT NULL,
//   tag VARCHAR(50),
//   createdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   views INTEGER DEFAULT 0
// );`;

// const answers = `CREATE TABLE IF NOT EXISTS answers (
//   answerid SERIAL PRIMARY KEY,
//   userid INTEGER REFERENCES users(userid) ON DELETE SET NULL,
//   questionid INTEGER REFERENCES questions(questionid) ON DELETE CASCADE,
//   answer VARCHAR(400) NOT NULL,
//   createdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   views INTEGER DEFAULT 0,
//   edited BOOLEAN DEFAULT FALSE,
//   updated_at TIMESTAMP NULL DEFAULT NULL
// );`;

// // New upgrade queries
// // const alterAnswers = ...
// // const alterQuestions = ...
// // const alterUsers = ...

// const createAnswerVotes = `CREATE TABLE IF NOT EXISTS answer_votes (
//   voteid SERIAL PRIMARY KEY,
//   answerid INTEGER NOT NULL REFERENCES answers(answerid) ON DELETE CASCADE,
//   userid INTEGER REFERENCES users(userid) ON DELETE SET NULL,
//   vote SMALLINT NOT NULL,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   CONSTRAINT unique_vote UNIQUE (answerid, userid)
// );`;

// const createAnswerComments = `CREATE TABLE IF NOT EXISTS answer_comments (
//   commentid SERIAL PRIMARY KEY,
//   answerid INTEGER NOT NULL REFERENCES answers(answerid) ON DELETE CASCADE,
//   userid INTEGER REFERENCES users(userid) ON DELETE SET NULL,
//   comment TEXT NOT NULL,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );`;

// // Export all at once
// module.exports = {
//   users,
//   questions,
//   answers,
//   // alterAnswers,
//   // alterQuestions,
//   // alterUsers,
//   createAnswerVotes,
//   createAnswerComments,
// };

// // Add a helper to check if a column exists before altering
// async function addColumnIfNotExists(table, column, definition) {
//   const [rows] = await dbConnection.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [column]);
//   if (rows.length === 0) {
//     await dbConnection.query(`ALTER TABLE \`${table}\` ADD COLUMN ${column} ${definition}`);
//   }
// }

// // In your migration logic, replace direct ALTER TABLE with:
// (async () => {
//   try {
//     await dbConnection.query('CREATE TABLE IF NOT EXISTS users (userid INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), email VARCHAR(255), password VARCHAR(255), profile_pic LONGTEXT)');
//     await addColumnIfNotExists('users', 'profile_pic', 'LONGTEXT');
//     await dbConnection.query('CREATE TABLE IF NOT EXISTS questions (questionid INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), description TEXT, createdate DATETIME, userid INT, views INT DEFAULT 0)');
//     await addColumnIfNotExists('questions', 'views', 'INT DEFAULT 0');
//     await dbConnection.query('CREATE TABLE IF NOT EXISTS answers (answerid INT AUTO_INCREMENT PRIMARY KEY, answer TEXT, createdate DATETIME, userid INT, questionid INT, views INT DEFAULT 0)');
//     await addColumnIfNotExists('answers', 'views', 'INT DEFAULT 0');
//     // ... other migrations ...
//     await addColumnIfNotExists('users', 'password_reset_token', 'VARCHAR(255) NULL');
//     await addColumnIfNotExists('users', 'token_expiry', 'DATETIME NULL');
//   } catch (err) {
//     console.error('Migration error:', err);
//   }
// })();

const dbConnection = require("../Db/dbConfig");

const users = `CREATE TABLE IF NOT EXISTS users (
  userid SERIAL PRIMARY KEY,
  username VARCHAR(20) NOT NULL,
  firstname VARCHAR(20) NOT NULL,
  lastname VARCHAR(20) NOT NULL,
  email VARCHAR(40) NOT NULL,
  password VARCHAR(100) NOT NULL,
  profile_pic TEXT DEFAULT NULL
);`;

const questions = `CREATE TABLE IF NOT EXISTS questions (
  questionid SERIAL PRIMARY KEY,
  userid INTEGER REFERENCES users(userid) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  description VARCHAR(400) NOT NULL,
  tag VARCHAR(50),
  createdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  views INTEGER DEFAULT 0
);`;

const answers = `CREATE TABLE IF NOT EXISTS answers (
  answerid SERIAL PRIMARY KEY,
  userid INTEGER REFERENCES users(userid) ON DELETE SET NULL,
  questionid INTEGER REFERENCES questions(questionid) ON DELETE CASCADE,
  answer VARCHAR(400) NOT NULL,
  createdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  views INTEGER DEFAULT 0,
  edited BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP NULL DEFAULT NULL
);`;

const createAnswerVotes = `CREATE TABLE IF NOT EXISTS answer_votes (
  voteid SERIAL PRIMARY KEY,
  answerid INTEGER NOT NULL REFERENCES answers(answerid) ON DELETE CASCADE,
  userid INTEGER REFERENCES users(userid) ON DELETE SET NULL,
  vote SMALLINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_vote UNIQUE (answerid, userid)
);`;

const createAnswerComments = `CREATE TABLE IF NOT EXISTS answer_comments (
  commentid SERIAL PRIMARY KEY,
  answerid INTEGER NOT NULL REFERENCES answers(answerid) ON DELETE CASCADE,
  userid INTEGER REFERENCES users(userid) ON DELETE SET NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

// PostgreSQL version of addColumnIfNotExists
async function addColumnIfNotExists(table, column, definition) {
  const query = `
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = '${table}' AND column_name = '${column}'
      ) THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', '${table}', '${column}', '${definition}');
      END IF;
    END $$;
  `;
  await dbConnection.query(query);
}

// PostgreSQL migration logic
(async () => {
  try {
    // Create tables if they don't exist (PostgreSQL syntax)
    await dbConnection.query(users);
    await dbConnection.query(questions);
    await dbConnection.query(answers);

    // Add columns if they don't exist
    await addColumnIfNotExists("users", "profile_pic", "TEXT");
    await addColumnIfNotExists("questions", "views", "INTEGER DEFAULT 0");
    await addColumnIfNotExists("answers", "views", "INTEGER DEFAULT 0");
    await addColumnIfNotExists("users", "password_reset_token", "VARCHAR(255)");
    await addColumnIfNotExists("users", "token_expiry", "TIMESTAMP");

    // Create additional tables
    await dbConnection.query(createAnswerVotes);
    await dbConnection.query(createAnswerComments);

    console.log("Migrations completed successfully");
  } catch (err) {
    console.error("Migration error:", err);
  }
})();

module.exports = {
  users,
  questions,
  answers,
  createAnswerVotes,
  createAnswerComments,
};
