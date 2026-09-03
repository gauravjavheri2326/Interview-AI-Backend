const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")


const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})


const interviewReportSchema = z.object({
    describeJob: z.string().describe("Describe about job in few lines"),
    describeCandidate: z.string().describe("Describe about client from resume and self description in few lines"),
    matchScore: z.number().describe("A score between 0 to 100 idicating how well th candidate's profile matches the job description"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what point to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with thier intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The bheavioral question can asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what point to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with thier intention and how to answer them"),
    skillGaps: z.array(z.object({
        skillTitle: z.string().describe("The title for a skill in 1-2 words"),
        skill: z.string().describe("The skill which the candidate is lacking in 9-10 words"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of skill")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1 and make plan for atleast 7 days."),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structure, system design, mock interview etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book")
    })).describe("A day-wise praparation plan for the candidate to follow in order to prepare for interview effectively"),
    jobTitle: z.string().describe("The title of the job for which the interview report is generated")
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }){

    const prompt = `Generate an interview report for a candidate with the following details:
                    Resume: ${resume},
                    Self Description: ${selfDescription},
                    Job Description: ${jobDescription}
                    Generate ONLY valid JSON.

                    The JSON MUST exactly match the provided response schema.

                    Do not add any extra fields.
                    Do not rename any fields.
                    Return no markdown and no explanation.
    `

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: z.toJSONSchema(interviewReportSchema)
        }
    })

    const data = JSON.parse(response.text)

    return data

}

module.exports = generateInterviewReport