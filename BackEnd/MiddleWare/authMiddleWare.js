// const {StatusCodes}=require("http-status-codes")
// const jwt=require("jsonwebtoken")

// async function authMiddleware(req,res,next) {

// const authHeader=req.headers.authorization

// if (!authHeader || !authHeader.startsWith('Bearer')){

//     return res.status(StatusCodes.UNAUTHORIZED).json({msg:'Authentication invalid'})
// }
// //  removing bearer prefix from the authHeader

// const token = authHeader.slice(7);

// try {
// const data= jwt.verify(token,process.env.JWT_SECRET)
// req.user = { username: data.username, userid: data.userid };

// next()

// }catch (error) {
// const message =
//     error.name === "TokenExpiredError"
//         ? "Token expired"
//         : "Authentication invalid";

// return res.status (StatusCodes.UNAUTHORIZED).json({msg:message})
// }
// }

// module.exports=authMiddleware
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists and is properly formatted
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      msg: "Authentication invalid - No token provided",
      solution:
        "Please include a valid Bearer token in the Authorization header",
    });
  }

  // Extract token (remove 'Bearer ' prefix)
  const token = authHeader.split(" ")[1]; // More reliable than slice(7)

  // Verify token exists after extraction
  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      msg: "Authentication invalid - Malformed token",
      solution: "Ensure your token follows the format: Bearer <token>",
    });
  }

  try {
    // Verify token with environment secret
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data to request object
    req.user = {
      username: payload.username,
      userid: payload.userid,
    };

    // Proceed to next middleware/route handler
    next();
  } catch (error) {
    // Handle specific JWT errors
    let errorMessage = "Authentication invalid";
    let statusCode = StatusCodes.UNAUTHORIZED;

    if (error.name === "TokenExpiredError") {
      errorMessage = "Token expired - Please login again";
      statusCode = StatusCodes.FORBIDDEN; // 403 might be more appropriate for expired tokens
    } else if (error.name === "JsonWebTokenError") {
      errorMessage = "Invalid token - Malformed JWT";
    }

    return res.status(statusCode).json({
      msg: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

module.exports = authMiddleware;
