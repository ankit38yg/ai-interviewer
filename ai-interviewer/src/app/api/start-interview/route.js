import { NextResponse } from "next/server";

import pdf from "pdf-parse";

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google Generative AI client

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define the POST handler for the API route

export async function POST(request) {
  try {
    // This correctly gets the files uploaded by the user

    const formData = await request.formData();

    const resumeFile = formData.get("resumeFile");

    const jdFile = formData.get("jdFile");

    const interviewType = formData.get("interviewType");

    if (!resumeFile || !jdFile) {
      return NextResponse.json(
        { error: "Resume and Job Description files are required." },
        { status: 400 }
      );
    } // Convert files to buffers

    const resumeBuffer = Buffer.from(await resumeFile.arrayBuffer());

    const jdBuffer = Buffer.from(await jdFile.arrayBuffer()); // Parse text from PDF buffers

    const resumeData = await pdf(resumeBuffer);

    const jdData = await pdf(jdBuffer);

    const resumeText = resumeData.text;

    const jdText = jdData.text; // AI Prompt Engineering for Gemini

    const initialPrompt = `

      You are an expert ${interviewType} interviewer. Your name is "Gemini".

      You are conducting a screening interview. You have the candidate's resume and the job description.

      **Job Description:**

      ---

      ${jdText}

      ---

      **Candidate's Resume:**

      ---

      ${resumeText}

      ---

      **Your Task:**

      1. Start the interview by introducing yourself (your name is Gemini).

      2. Ask ONE question at a time.

      3. Keep your responses concise and conversational.

      4. Your first response should be ONLY the introduction and the first question. Please start now.

    `; // Make the API call to Google Gemini

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(initialPrompt);

    const response = await result.response;

    const firstQuestion = response.text();

    const conversationHistory = [
      { role: "user", parts: [{ text: initialPrompt }] },

      { role: "model", parts: [{ text: firstQuestion }] },
    ];

    return NextResponse.json({
      firstQuestion: firstQuestion,

      conversationHistory: conversationHistory,
    });
  } catch (error) {
    console.error("Error in start-interview API:", error);

    return NextResponse.json(
      { error: "Failed to start interview. " + error.message },
      { status: 500 }
    );
  }
}
