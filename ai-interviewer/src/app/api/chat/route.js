import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { userMessage, conversationHistory } = await request.json();

    if (!userMessage || !conversationHistory) {
      return NextResponse.json(
        { error: "User message and history are required." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // The chat history needs to be in the format: [{ role: "user", parts: [...] }, { role: "model", parts: [...] }]
    // We will receive the history from the client and add the new user message.
    const chat = model.startChat({
      history: conversationHistory,
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const aiResponseText = response.text();

    // Add the new user message and AI response to our history for the next turn
    const updatedHistory = [
      ...conversationHistory,
      {
        role: "user",
        parts: [{ text: userMessage }],
      },
      {
        role: "model",
        parts: [{ text: aiResponseText }],
      },
    ];

    return NextResponse.json({
      aiResponse: aiResponseText,
      updatedHistory: updatedHistory,
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to get AI response. " + error.message },
      { status: 500 }
    );
  }
}
