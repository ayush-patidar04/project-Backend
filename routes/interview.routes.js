const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const {
  generateInterviewReportController,
  generateInterviewReportByID,
  getAllInterviewReports,
  generateResumePdf,
} = require("../controllers/interview.controller")
const upload = require("../middlewares/file.middleware")

const interviewRouter = express.Router()

interviewRouter.post(
  "/",
  authMiddleware.authUser,
  upload.single("resume"),
  generateInterviewReportController,
)

// Single report by ID
interviewRouter.get(
  "/report/:interviewId",
  authMiddleware.authUser,
  generateInterviewReportByID,
)

// All reports for current user
interviewRouter.get(
  "/",
  authMiddleware.authUser,
  getAllInterviewReports,
)

interviewRouter.post(
  "/resume/pdf/:interviewReportId",
  authMiddleware.authUser,
  generateResumePdf,
)

module.exports = interviewRouter