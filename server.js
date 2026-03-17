require("dotenv").config();

const connectToDB = require("./config/db");
const app = require("./src/app");

const {resume, selfDescription, jobDescription} = require("./services/temp")
const generateInterviewReport = require("./services/ai.service")

// connect to MongoDB (if you have a function for it)
if (typeof connectToDB === "function") {
    connectToDB();
}

// generateInterviewReport({resume, selfDescription, jobDescription})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});