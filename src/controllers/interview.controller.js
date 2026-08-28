const pdfParse = require("pdf-parse")
const generateInterviewReport =  require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")


/**
 * @description Controller to generate interview report based on user self description, resume and job description
 */
const generateInterviewReportController = async (req, res) => {

    

    try {
        const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
        const { selfDescription, jobDescription } = req.body


        const interviewReportByAi = await generateInterviewReport({
            resume: resumeContent.text,
            selfDescription,
            jobDescription
        })


        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
            ...interviewReportByAi
        })

        res.status(201).json({
            message: "Interview report generated successfully",
            interviewReport
        })
    } catch (err) {
        res.status(500).json({
            message: "Failed to generate interview report",
        })
    }
}

/**
 * @description Controller to get interview report by interviewId
 */

const getInterviewReportByIdController = async (req, res) => {
    const { interviewId } = req.params
    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if(!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found"
        })
    } 

    res.status(200).json({
        message: "Interview report fetched successfully",
        interviewReport
    })
}

/**
 * @description Cotroller to get all interview reports of logged in user
 */

const getAllInterviewReportsController = async (req, res) => {
    try {
        const interviewReports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillFaps -preparationalPlan")

        res.status(200).json({
            message: "Interview reports fetched successfully",
            interviewReports
        })

    } catch (err) {
        console.log("Get reports error:", err)

        res.status(500).json({
            message: "Failed to fetch interview reports"
        })
    }
}

/**
 * @description Controller to delete report from database
 */

const deleteInterviewReportController = async (req, res) => {
    try {
        const { interviewId } = req.params
        const interviewReport = await interviewReportModel.findOneAndDelete({ _id: interviewId, user: req.user.id })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Report didn't exist"
            })
        }

        res.status(200).json({
            message: "Interview report deleted successfully"
        })
    } catch (err) {
        res.status(500).json({
            message: "Failed to delete interview report"
        })
    }


}



module.exports = { generateInterviewReportController, getInterviewReportByIdController, getAllInterviewReportsController, deleteInterviewReportController }