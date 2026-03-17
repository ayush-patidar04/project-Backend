const pdfParse = require("pdf-parse")
const {
  generateInterviewReport,
  generateResumePdf: generateResumePdfService,
} = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")
const { intersection } = require("zod")

async function generateInterviewReportController(req, res) {
  try {
    const resumeBuffer = req.file?.buffer

    if (!resumeBuffer) {
      return res
        .status(400)
        .json({ success: false, message: "Resume file is required" })
    }

    const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(resumeBuffer))).getText()
    const { selfDescription, jobDescription } = req.body

    const interviewReportByAI = await generateInterviewReport({
      resume: resumeContent.text,
      selfDescription,
      jobDescription,
    })

    const normalizedPreparationPlan = Array.isArray(
      interviewReportByAI.preparationPlan,
    )
      ? interviewReportByAI.preparationPlan.map((item) => {
          const baseDay = item?.day
          const baseFocus = item?.focus
          const tasksArray = Array.isArray(item?.tasks)
            ? item.tasks
            : item?.task
            ? [item.task]
            : []

          return {
            day: baseDay,
            focus: baseFocus,
            tasks: tasksArray,
          }
        })
      : []

    const interviewReport = await interviewReportModel.create({
      user: req.user?.id,
      resume: resumeContent.text,
      selfDescription,
      jobDescription,
      ...interviewReportByAI,
      preparationPlan: normalizedPreparationPlan,
    })

    res.status(201).json({
      success: true,
      message: "Interview report generated successfully",
      interviewReport,
    })
  } catch (err) {
    console.error("generateInterviewReportController error", err)
    res.status(500).json({ success: false, message: "Failed to generate interview report" })
  }
}

async function generateInterviewReportByID(req, res) {
    const {interviewId} = req.params;

    const interviewReport = await interviewReportModel.findOne({_id: interviewId, user:req.user.id})

    if(!interviewReport) {
        return res.status(404).json({
            success: false,
            message: "Interview report not found"
        })
    }

    return res.status(200).json({
      success: true,
      message: "Interview report fetched successfully",
      interviewReport,
    })
}


async function getAllInterviewReports(req, res) {

    const interviewReports = await interviewReportModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select("-resume -selfDescription -jobDescription")

    return res.status(200).json({
      success: true,
      message: "Interview reports fetched successfully",
      interviewReports,
    })
}

async function generateResumePdf(req, res) {
  try {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findOne({
      _id: interviewReportId,
      user: req.user?.id,
    })

    if (!interviewReport) {
      return res.status(404).json({
        success: false,
        message: "Interview report not found",
      })
    }

    const { resume, selfDescription, jobDescription } = interviewReport

    const pdfBuffer = await generateResumePdfService({
      resume,
      selfDescription,
      jobDescription,
    })

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
      "Content-Length": pdfBuffer.length,
    })

    return res.status(200).send(pdfBuffer)
  } catch (err) {
    console.error("generateResumePdf error", err)
    return res
      .status(500)
      .json({ success: false, message: "Failed to generate resume PDF" })
  }
}

module.exports = {generateInterviewReportController, generateInterviewReportByID, getAllInterviewReports, generateResumePdf}