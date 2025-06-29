// // db connection
// const dbConnection = require("../Db/dbConfig");
// const { StatusCodes } = require("http-status-codes");

// // Create a question
// async function createQuestion(req, res) {
//   const { title, description,tag } = req.body;
//   const userid = req.user.userid;

//   // Validate required fields
//   if (!title || !description) {
//     return res.status(StatusCodes.BAD_REQUEST).json({
//       error: "Bad Request",
//       message: "Please provide all required fields",
//     });
//   }

//   try {
//     // Insert new question into database
//     await dbConnection.query(
//       `
//       INSERT INTO questions (userid, title, description, tag )
//       VALUES (?, ?, ?, ?)
//     `,
//       [userid, title, description, tag]
//     );

//     // Return success message with 201 Created status
//     return res.status(StatusCodes.CREATED).json({
//       message: "Question created successfully",
//     });
//   } catch (error) {
//     console.error(error.message);
//     // Return 500 Internal Server Error for any unexpected errors
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: "Internal Server Error",
//       message: "An unexpected error occurred.",
//     });
//   }
// }

// async function getSingleQuestion(req, res) {
//   const { questionid } = req.params;

//   try {
//     // Increment question views
//     await dbConnection.query(
//       `UPDATE questions SET views = views + 1 WHERE questionid = ?`,
//       [questionid]
//     );

//     const [question] = await dbConnection.query(
//       `SELECT q.*, u.userid, u.username, u.profile_pic
//        FROM questions q
//        LEFT JOIN users u ON q.userid = u.userid
//        WHERE q.questionid = ?`,
//       [questionid]
//     );

//     if (question.length === 0) {
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         message: `Question not found!! id: ${questionid} `,
//       });
//     }

//     res.status(StatusCodes.OK).json({
//       question: question[0],
//     });
//   } catch (error) {
//     console.error("Error fetching question: ", error);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       message: "An unexpected error occurred.",
//       error: error.message,
//     });
//   }
// }

// const getAllQuestions = async (req, res) => {
//   try {
//     // The mysql2 package returns array with 2 elements from .query():
//     const [questions] = await dbConnection.query(`
// SELECT
//   q.questionid,
//   q.title,
//   q.description,
//   q.createdate,
//   q.userid,
//   u.username,
//   u.profile_pic,
//   q.views,
//   COUNT(a.answerid) AS answerCount,
//   COALESCE(SUM(av.vote), 0) AS totalVotes
// FROM questions q
// LEFT JOIN users u ON q.userid = u.userid
// LEFT JOIN answers a ON q.questionid = a.questionid
// LEFT JOIN answer_votes av ON a.answerid = av.answerid
// GROUP BY q.questionid
// ORDER BY q.createdate DESC;

//     `);

//     if (questions.length === 0) {
//       return res.status(StatusCodes.NOT_FOUND).json({
//         error: "Not Found",
//         message: "No questions found.",
//       });
//     }

//     res.status(StatusCodes.OK).json({ questions });
//   } catch (error) {
//     console.error("Error fetching questions:", error);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: "Internal Server Error",

//       message: error.message || "An unexpected error occurred.",
//     });
//   }
// };

// async function updateQuestion(req, res) {
//   const { questionid } = req.params;
//   const { title, description, tag } = req.body;
//   const userid = req.user.userid;

//   if (!title || !description) {
//     return res.status(StatusCodes.BAD_REQUEST).json({
//       error: "Bad Request",
//       message: "Title and description are required",
//     });
//   }

//   try {
//     // Check if the question exists and belongs to the user
//     const [question] = await dbConnection.query(
//       `SELECT userid FROM questions WHERE questionid = ?`,
//       [questionid]
//     );

//     if (question.length === 0) {
//       return res.status(StatusCodes.NOT_FOUND).json({
//         message: "Question not found",
//       });
//     }

//     if (question[0].userid !== userid) {
//       return res.status(StatusCodes.FORBIDDEN).json({
//         message: "You are not authorized to update this question",
//       });
//     }

//     // Update the question
//     await dbConnection.query(
//       `UPDATE questions SET title = ?, description = ?, tag = ? WHERE questionid = ?`,
//       [title, description, tag, questionid]
//     );

//     res
//       .status(StatusCodes.OK)
//       .json({ message: "Question updated successfully" });
//   } catch (error) {
//     console.error("Error updating question:", error);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       message: "An unexpected error occurred.",
//       error: error.message,
//     });
//   }
// }

// async function deleteQuestion(req, res) {
//   const { questionid } = req.params;
//   const userid = req.user.userid;

//   try {
//     // Check if the question exists and belongs to the user
//     const [question] = await dbConnection.query(
//       `SELECT userid FROM questions WHERE questionid = ?`,
//       [questionid]
//     );

//     if (question.length === 0) {
//       return res.status(StatusCodes.NOT_FOUND).json({
//         message: "Question not found",
//       });
//     }

//     if (question[0].userid !== userid) {
//       return res.status(StatusCodes.FORBIDDEN).json({
//         message: "You are not authorized to delete this question",
//       });
//     }

//     // Delete the question
//     await dbConnection.query(`DELETE FROM questions WHERE questionid = ?`, [
//       questionid,
//     ]);

//     res
//       .status(StatusCodes.OK)
//       .json({ message: "Question deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting question:", error);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       message: "An unexpected error occurred.",
//       error: error.message,
//     });
//   }
// }

// module.exports = {
//   getAllQuestions,
//   getSingleQuestion,
//   createQuestion,
//   updateQuestion,
//   deleteQuestion,
// };

// db connection
const dbConnection = require("../Db/dbConfig");
const { StatusCodes } = require("http-status-codes");

// Create a question
async function createQuestion(req, res) {
  const { title, description, tag } = req.body;
  const userid = req.user.userid;

  if (!title || !description) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Please provide all required fields",
    });
  }

  try {
    await dbConnection.query(
      `INSERT INTO questions (userid, title, description, tag)
       VALUES ($1, $2, $3, $4)`,
      [userid, title, description, tag]
    );

    return res.status(StatusCodes.CREATED).json({
      message: "Question created successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}

async function getSingleQuestion(req, res) {
  const { questionid } = req.params;

  try {
    await dbConnection.query(
      `UPDATE questions SET views = views + 1 WHERE questionid = $1`,
      [questionid]
    );

    const result = await dbConnection.query(
      `SELECT q.*, u.userid, u.username, u.profile_pic 
       FROM questions q 
       LEFT JOIN users u ON q.userid = u.userid 
       WHERE q.questionid = $1`,
      [questionid]
    );

    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `Question not found with id: ${questionid}`,
      });
    }

    res.status(StatusCodes.OK).json({
      question: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "An unexpected error occurred.",
      error: error.message,
    });
  }
}

const getAllQuestions = async (req, res) => {
  try {
    const result = await dbConnection.query(`
      SELECT 
        q.questionid,
        q.title,
        q.description,
        q.createdate,
        q.userid,
        u.username,
        u.profile_pic,
        q.views,
        COUNT(a.answerid) AS answer_count,
        COALESCE(SUM(av.vote), 0) AS total_votes
      FROM questions q
      LEFT JOIN users u ON q.userid = u.userid
      LEFT JOIN answers a ON q.questionid = a.questionid
      LEFT JOIN answer_votes av ON a.answerid = av.answerid
      GROUP BY q.questionid, u.username, u.profile_pic
      ORDER BY q.createdate DESC
    `);

    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Not Found",
        message: "No questions found.",
      });
    }

    res.status(StatusCodes.OK).json({ questions: result.rows });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: error.message || "An unexpected error occurred.",
    });
  }
};

async function updateQuestion(req, res) {
  const { questionid } = req.params;
  const { title, description, tag } = req.body;
  const userid = req.user.userid;

  if (!title || !description) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Title and description are required",
    });
  }

  try {
    const result = await dbConnection.query(
      `SELECT userid FROM questions WHERE questionid = $1`,
      [questionid]
    );

    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Question not found",
      });
    }

    if (result.rows[0].userid !== userid) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "You are not authorized to update this question",
      });
    }

    await dbConnection.query(
      `UPDATE questions SET title = $1, description = $2, tag = $3 WHERE questionid = $4`,
      [title, description, tag, questionid]
    );

    res.status(StatusCodes.OK).json({
      message: "Question updated successfully",
    });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "An unexpected error occurred.",
      error: error.message,
    });
  }
}

async function deleteQuestion(req, res) {
  const { questionid } = req.params;
  const userid = req.user.userid;

  try {
    const result = await dbConnection.query(
      `SELECT userid FROM questions WHERE questionid = $1`,
      [questionid]
    );

    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Question not found",
      });
    }

    if (result.rows[0].userid !== userid) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "You are not authorized to delete this question",
      });
    }

    await dbConnection.query(`DELETE FROM questions WHERE questionid = $1`, [
      questionid,
    ]);

    res.status(StatusCodes.OK).json({
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "An unexpected error occurred.",
      error: error.message,
    });
  }
}

module.exports = {
  getAllQuestions,
  getSingleQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};
