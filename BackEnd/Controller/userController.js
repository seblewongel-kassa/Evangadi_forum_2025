// const dbConnection = require("../Db/dbConfig");
// const bcrypt = require("bcrypt"); // For password hashing
// const { StatusCodes } = require("http-status-codes"); // For standardized HTTP status codes
// const jwt = require("jsonwebtoken"); // For creating JSON Web Tokens
// const nodemailer = require('nodemailer');
// const crypto = require('crypto');
// const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// //* Function to handle user login
// async function login(req, res) {
//   // Extract email and password from request body
//   const { email, password } = req.body; // Gets data sent from the frontend

//   // Validate that both email and password are provided
//   if (!email || !password) {
//     return res
//       .status(StatusCodes.BAD_REQUEST) // 400 Bad Request: Client sent incomplete data
//       .json({ msg: "Please enter all required fields" });
//   }

//   try {
//     // Query database to find user by email
//     const [user] = await dbConnection.query(
//       "SELECT username, userid, password FROM users WHERE email = ?",
//       [email]
//     );

//     // Check if user exists in database (user.length will be 0 if not found)
//     if (user.length == 0) {
//       return res
//         .status(StatusCodes.BAD_REQUEST) // 400 Bad Request: User not found for email
//         .json({ msg: "invalid credential" }); // Generic message for security
//     }

//     // Compare provided password with stored hashed password using bcrypt
//     const isMatch = await bcrypt.compare(password, user[0].password);

//     // Return error if password doesn't match
//     if (!isMatch) {
//       return res
//         .status(StatusCodes.UNAUTHORIZED) // 401 Unauthorized: Password incorrect
//         .json({ msg: "Invalid credentials" }); // Generic message for security
//     }

//     // If Password matches, extract user data from database result
//     const { username, userid } = user[0]; // Destructure relevant user info

//     // Generate a JSON Web Token (JWT) for authentication
//     const token = jwt.sign(
//       // Creates a JWT
//       { username, userid }, // Payload: data to store in the token (non-sensitive)
//       process.env.JWT_SECRET, // Secret key from .env for signing the token
//       { expiresIn: "30d" } // Token expiration: 30 days
//     );

//     // Send success response with token and username
//     return res
//       .status(StatusCodes.OK) // 200 OK: Login successful
//       .json({ msg: "user login successful", token, username }); // Send token and username to frontend
//   } catch (error) {
//     return res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR) // 500 Internal Server Error: Unexpected server issue
//       .json({ msg: "something went wrong, try again later!" });
//   }
// }

// //* Function to handle user registration
// async function register(req, res) {
//   // Asynchronous function for DB and hashing
//   const { username, firstname, lastname, email, password } = req.body; // Get all registration fields

//   // Validate that all required fields are provided
//   if (!email || !password || !firstname || !lastname || !username) {
//     // Corrected: Added opening curly brace here
//     return res
//       .status(StatusCodes.BAD_REQUEST)
//       .json({ msg: "Please provide all required fields" });
//   }

//   try {
//     // Check if user already exists with provided username or email
//     const [user] = await dbConnection.query(
//       "SELECT username, userid FROM users WHERE username = ? OR email = ?",
//       [username, email]
//     );

//     if (user.length > 0) {
//       // If user found, registration fails
//       return res
//         .status(StatusCodes.CONFLICT)
//         .json({ msg: "User already registered" });
//     }

//     // password must be at least 8 characters
//     if (password.length < 8) {
//       return res
//         .status(StatusCodes.BAD_REQUEST)
//         .json({ msg: "Password must be at least 8 characters" });
//     }

//     // Encrypt the password using bcrypt
//     const salt = await bcrypt.genSalt(10); // Generates a salt (random value for hashing)
//     const hashedPassword = await bcrypt.hash(password, salt); // Hashes the password with the salt

//     // Insert new user into the database
//     await dbConnection.query(
//       "INSERT INTO users (username, firstname, lastname, email, password) VALUES (?, ?, ?, ?, ?)",
//       [username, firstname, lastname, email, hashedPassword] // Values to insert
//     );

//     return res
//       .status(StatusCodes.CREATED)
//       .json({ msg: "User registered successfully" });
//   } catch (error) {
//     return res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ msg: "An unexpected error occurred." });
//   }
// }

// //* Function to check user status
// async function checkUser(req, res) {
//   const username = req.user.username;
//   const userid = req.user.userid;

//   try {
//     // Get user data including profile picture
//     const [user] = await dbConnection.query(
//       "SELECT username, userid, profile_pic FROM users WHERE userid = ?",
//       [userid]
//     );

//     if (user.length === 0) {
//       return res.status(StatusCodes.NOT_FOUND).json({ msg: "User not found" });
//     }

//     // Return user object in the format expected by frontend
//     res.status(StatusCodes.OK).json({
//       username: user[0].username,
//       userid: user[0].userid,
//       profile_pic: user[0].profile_pic
//     });
//   } catch (error) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Server error" });
//   }
// }

// //* Function to get user profile
// async function getProfile(req, res) {
//   const { userid } = req.user;

//   try {
//     const [user] = await dbConnection.query(
//       "SELECT username, firstname, lastname, email, profile_pic FROM users WHERE userid = ?",
//       [userid]
//     );

//     if (user.length === 0) {
//       return res.status(StatusCodes.NOT_FOUND).json({ msg: "User not found" });
//     }

//     res.status(StatusCodes.OK).json(user[0]);
//   } catch (error) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Server error" });
//   }
// }

// //* Function to update user profile
// async function updateProfile(req, res) {
//   const { userid } = req.user;
//   const { firstname, lastname, email } = req.body;

//   try {
//     // Check if email is already taken by another user
//     const [existingUser] = await dbConnection.query(
//       "SELECT userid FROM users WHERE email = ? AND userid != ?",
//       [email, userid]
//     );

//     if (existingUser.length > 0) {
//       return res.status(StatusCodes.CONFLICT).json({ msg: "Email already in use" });
//     }

//     await dbConnection.query(
//       "UPDATE users SET firstname = ?, lastname = ?, email = ? WHERE userid = ?",
//       [firstname, lastname, email, userid]
//     );

//     res.status(StatusCodes.OK).json({ msg: "Profile updated successfully" });
//   } catch (error) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Server error" });
//   }
// }

// //* Function to upload profile picture
// async function uploadProfilePic(req, res) {
//   const { userid } = req.user;
//   const { profilePicUrl } = req.body;

//   try {
//     // Validate that profilePicUrl is provided
//     if (!profilePicUrl) {
//       return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Profile picture URL is required" });
//     }

//     // Check if it's a base64 image (starts with data:image/)
//     if (!profilePicUrl.startsWith('data:image/')) {
//       return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Invalid image format" });
//     }

//     // Check base64 size (roughly 1MB limit for base64)
//     const base64Size = profilePicUrl.length * 0.75; // Base64 is about 75% larger than binary
//     if (base64Size > 1024 * 1024) {
//       return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Image size too large (max 1MB)" });
//     }

//     await dbConnection.query(
//       "UPDATE users SET profile_pic = ? WHERE userid = ?",
//       [profilePicUrl, userid]
//     );

//     res.status(StatusCodes.OK).json({ msg: "Profile picture updated successfully" });
//   } catch (error) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Server error" });
//   }
// }

// module.exports = {
//   register,
//   login,
//   checkUser,
//   getProfile,
//   updateProfile,
//   uploadProfilePic,
// };

const dbConnection = require("../Db/dbConfig");
const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please enter all required fields" });
  }

  try {
    const result = await dbConnection.query(
      "SELECT username, userid, password FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "Invalid credentials" });
    }

    const { username, userid } = user;
    const token = jwt.sign({ username, userid }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    return res
      .status(StatusCodes.OK)
      .json({ msg: "User login successful", token, username });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, try again later!" });
  }
}

async function register(req, res) {
  const { username, firstname, lastname, email, password } = req.body;

  if (!email || !password || !firstname || !lastname || !username) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide all required fields" });
  }

  try {
    const userCheck = await dbConnection.query(
      "SELECT username, userid FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (userCheck.rows.length > 0) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ msg: "User already registered" });
    }

    if (password.length < 8) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Password must be at least 8 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await dbConnection.query(
      "INSERT INTO users (username, firstname, lastname, email, password) VALUES ($1, $2, $3, $4, $5)",
      [username, firstname, lastname, email, hashedPassword]
    );

    return res
      .status(StatusCodes.CREATED)
      .json({ msg: "User registered successfully" });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "An unexpected error occurred." });
  }
}

async function checkUser(req, res) {
  const { username, userid } = req.user;

  try {
    const result = await dbConnection.query(
      "SELECT username, userid, profile_pic FROM users WHERE userid = $1",
      [userid]
    );

    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "User not found" });
    }

    res.status(StatusCodes.OK).json({
      username: result.rows[0].username,
      userid: result.rows[0].userid,
      profile_pic: result.rows[0].profile_pic,
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Server error" });
  }
}

async function getProfile(req, res) {
  const { userid } = req.user;

  try {
    const result = await dbConnection.query(
      "SELECT username, firstname, lastname, email, profile_pic FROM users WHERE userid = $1",
      [userid]
    );

    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "User not found" });
    }

    res.status(StatusCodes.OK).json(result.rows[0]);
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Server error" });
  }
}

async function updateProfile(req, res) {
  const { userid } = req.user;
  const { firstname, lastname, email } = req.body;

  try {
    const existingUser = await dbConnection.query(
      "SELECT userid FROM users WHERE email = $1 AND userid != $2",
      [email, userid]
    );

    if (existingUser.rows.length > 0) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ msg: "Email already in use" });
    }

    await dbConnection.query(
      "UPDATE users SET firstname = $1, lastname = $2, email = $3 WHERE userid = $4",
      [firstname, lastname, email, userid]
    );

    res.status(StatusCodes.OK).json({ msg: "Profile updated successfully" });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Server error" });
  }
}

async function uploadProfilePic(req, res) {
  const { userid } = req.user;
  const { profilePicUrl } = req.body;

  try {
    if (!profilePicUrl) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Profile picture URL is required" });
    }

    if (!profilePicUrl.startsWith("data:image/")) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Invalid image format" });
    }

    const base64Size = profilePicUrl.length * 0.75;
    if (base64Size > 1024 * 1024) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Image size too large (max 1MB)" });
    }

    await dbConnection.query(
      "UPDATE users SET profile_pic = $1 WHERE userid = $2",
      [profilePicUrl, userid]
    );

    res
      .status(StatusCodes.OK)
      .json({ msg: "Profile picture updated successfully" });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Server error" });
  }
}

module.exports = {
  register,
  login,
  checkUser,
  getProfile,
  updateProfile,
  uploadProfilePic,
};
