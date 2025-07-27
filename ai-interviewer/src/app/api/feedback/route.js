import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { conversationHistory } = await request.json();

    if (!conversationHistory) {
      return NextResponse.json(
        { error: "Conversation history is required." },
        { status: 400 }
      );
    }

    // Convert the conversation history into a simple text transcript
    const transcript = conversationHistory
      .map(
        (turn) =>
          `${turn.role === "user" ? "Candidate" : "Interviewer"}: ${
            turn.parts[0].text
          }`
      )
      .join("\n\n");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const feedbackPrompt = `
            You are an expert career coach and interview analyst.
            Your task is to provide constructive feedback based on the following interview transcript.
            Analyze the candidate's responses for clarity, relevance, and communication skills. Do not judge the interviewer's questions.
            
            Please structure your feedback in Markdown format with the following sections:
            - **## Overall Summary:** A brief, encouraging overview of the performance.
            - **## Strengths:** 2-3 bullet points highlighting what the candidate did well.
            - **## Areas for Improvement:** 2-3 specific, actionable suggestions for what the candidate could do better.
            - **## Communication Score:** Provide a score out of 10 for communication and a brief justification.
            
            Here is the interview transcript:
            ---
            ${transcript}
            ---
        `;

    const result = await model.generateContent(feedbackPrompt);
    const response = await result.response;
    const feedbackText = response.text();

    return NextResponse.json({ feedback: feedbackText });
  } catch (error) {
    console.error("Error generating feedback:", error);
    return NextResponse.json(
      { error: "Failed to generate feedback. " + error.message },
      { status: 500 }
    );
  }
}
