// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");

// const app = express();
// const PORT = 2112;

// // Global middlewares
// app.use(cors());
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ limit: '10mb', extended: true }));

// // DB connection and table schemas
// const dbConnection = require("./Db/dbConfig");
// const {
//   users,
//   questions,
//   answers,
//   createAnswerVotes,
//   createAnswerComments,
// } = require("./Table/schema");

// // Routes
// const userRoutes = require("./Routes/userRoute");
// const questionRoutes = require("./Routes/questionRoute");
// const answersRoute = require("./Routes/answerRoute");
// const authMiddleware = require("./MiddleWare/authMiddleWare");

// // Route middleware
// app.use("/api/users", userRoutes);
// app.use("/api/answer", answersRoute);
// app.use("/api/question", questionRoutes);
// app.use("/api/answer/:answerid", answersRoute);

// // Start server and create tables
// async function start() {
//   let dbConnected = false;

//   try {
//     await dbConnection.query("SELECT 'test'"); // Test DB connection
//     dbConnected = true;

//     // Create tables
//     await dbConnection.query(users);
//     await dbConnection.query(questions);
//     await dbConnection.query(answers);
//     //added tables
//     await dbConnection.query(createAnswerVotes);
//     await dbConnection.query(createAnswerComments);
//   } catch (error) {
//     console.log("Starting server without database connection for testing...");
//   }

//   // Start server regardless of database connection
//   app.listen(PORT, () => {
//     if (!dbConnected) {
//       console.log("Note: Database is not connected. Some features may not work.");
//     }
//   });
// }

// start();

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 2112;

// Global middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// DB connection and table schemas
const dbConnection = require("./Db/dbConfig");
const {
  users,
  questions,
  answers,
  createAnswerVotes,
  createAnswerComments,
} = require("./Table/schema");

// Routes
const userRoutes = require("./Routes/userRoute");
const questionRoutes = require("./Routes/questionRoute");
const answersRoute = require("./Routes/answerRoute");
const authMiddleware = require("./MiddleWare/authMiddleWare");

// Route middleware
app.use("/api/users", userRoutes);
app.use("/api/answer", answersRoute);
app.use("/api/question", questionRoutes);

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    await dbConnection.query("SELECT 1");
    res.status(200).json({
      status: "healthy",
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "healthy",
      database: "disconnected",
      message: "Running in limited mode without database",
    });
  }
});

// Start server and initialize database
async function startServer() {
  try {
    // Test database connection
    const connectionTest = await dbConnection.query(
      "SELECT NOW() as current_time"
    );
    console.log(" Database connected at:", connectionTest.rows[0].current_time);

    // Create tables if they don't exist
    await dbConnection.query(users);
    await dbConnection.query(questions);
    await dbConnection.query(answers);
    await dbConnection.query(createAnswerVotes);
    await dbConnection.query(createAnswerComments);
    console.log(" Database tables verified");

    // Start the server
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
      console.log(` http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(" Database connection failed:", error.message);
    console.log(" Starting server in limited mode (without database)");

    // Start the server even without database connection
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT} (without database)`);
      console.log(` http://localhost:${PORT}`);
      console.log(
        "Note: Some features may not work without database connection"
      );
    });
  }
}

// Add database connection event listeners
dbConnection.on("connect", () => {
  console.log(" New database connection established");
});

dbConnection.on("error", (err) => {
  console.error(" Database connection error:", err);
});

// Start the application
startServer();

// Export for testing purposes
module.exports = app;
