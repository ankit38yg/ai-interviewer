"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { LoaderCircle, Award, Home } from "lucide-react";

export default function FeedbackPage() {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Retrieve the conversation history from session storage
    const historyJson = sessionStorage.getItem("interviewHistory");
    if (!historyJson) {
      // If no history, redirect home
      router.push("/");
      return;
    }

    const conversationHistory = JSON.parse(historyJson);

    const generateFeedback = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationHistory }),
        });

        const result = await response.json();
        if (response.ok) {
          setFeedback(result.feedback);
        } else {
          setFeedback(
            "Sorry, we couldn't generate your feedback at this time."
          );
        }
      } catch (error) {
        console.error("Feedback generation failed:", error);
        setFeedback("An error occurred while generating your feedback.");
      } finally {
        setIsLoading(false);
        // Clear the session storage after use
        sessionStorage.removeItem("interviewHistory");
      }
    };

    generateFeedback();
  }, [router]);

  return (
    <div className="min-h-screen bg-neutral-500 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <Award className="w-16 h-16 mx-auto text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800 mt-4">
            Interview Performance Report
          </h1>
          <p className="text-gray-600 mt-2">
            Here is a breakdown of your performance.
          </p>
        </div>

        <div className="prose lg:prose-lg max-w-none bg-gray-800 rounded-lg p-6 min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <LoaderCircle className="w-12 h-12 animate-spin text-blue-500" />
              <p className="mt-4 text-gray-500">Generating your report...</p>
            </div>
          ) : (
            <ReactMarkdown>{feedback}</ReactMarkdown>
          )}
        </div>

        <div className="pt-4 text-center">
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg
                                   hover:bg-blue-700 transition-all duration-300 ease-in-out
                                   flex items-center justify-center space-x-2 mx-auto"
          >
            <Home className="w-5 h-5" />
            <span>Start a New Interview</span>
          </button>
        </div>
      </div>
    </div>
  );
}
