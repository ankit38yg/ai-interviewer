"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  Briefcase,
  Mic,
  LoaderCircle,
} from "lucide-react";

// This component remains for the RESUME upload
const SmartFileDropzone = ({ onFileAccepted, file, title, icon }) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0]);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${
                    isDragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }
                  ${file ? "border-green-500 bg-green-50" : ""}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-gray-500">
        {file ? (
          <>
            <FileText className="w-12 h-12 text-green-600 mb-2" />
            <p className="font-semibold text-green-700">{file.name}</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 text-gray-400">{icon}</div>
            <p className="mt-2">
              {isDragActive
                ? "Drop the file here..."
                : `Drag & drop ${title} here, or click`}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default function InterviewSetup() {
  const router = useRouter();

  const [resumeFile, setResumeFile] = useState(null);
  // --- CHANGE 1: State for both JD file and JD text ---
  const [jdFile, setJdFile] = useState(null);
  const [jdText, setJdText] = useState("");

  const [interviewType, setInterviewType] = useState("HR");
  const [isLoading, setIsLoading] = useState(false);

  // --- CHANGE 2: A dedicated dropzone hook for the Job Description ---
  const onJdDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setJdFile(acceptedFiles[0]);
      setJdText(""); // Clear text if a file is uploaded
    }
  }, []);

  const {
    getRootProps: getJdRootProps,
    getInputProps: getJdInputProps,
    isDragActive: isJdDragActive,
  } = useDropzone({
    onDrop: onJdDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    multiple: false,
  });

  const handleStartInterview = () => {
    // --- CHANGE 3: Update check for JD file OR text ---
    if (!resumeFile || (!jdFile && jdText.trim() === "")) {
      alert(
        "Please upload your Resume and provide the Job Description (file or pasted text)."
      );
      return;
    }

    console.log("--- MANUAL OVERRIDE: SKIPPING API CALL ---");
    setIsLoading(true);

    const fakeData = {
      firstQuestion:
        "Hello! My name is Gemini, and I'll be conducting your interview today. Thanks for joining. To start, could you please tell me a bit about yourself?",
      conversationHistory: [
        { role: "user", parts: [{ text: "Placeholder for prompt" }] },
        { role: "model", parts: [{ text: "Hello! My name is Gemini..." }] },
      ],
    };

    setTimeout(() => {
      const dataString = JSON.stringify(fakeData);
      router.push(`/interview?data=${encodeURIComponent(dataString)}`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-neutral-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            AI Interview Simulator 🎙️
          </h1>
          <p className="text-gray-600 mt-2">
            Get ready for your next interview by practicing with our AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SmartFileDropzone
            onFileAccepted={(file) => setResumeFile(file)}
            file={resumeFile}
            title="your Resume"
            icon={<Briefcase />}
          />

          {/* --- CHANGE 4: The new Job Description input area --- */}
          <div
            {...getJdRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors flex flex-col justify-between
                           ${
                             isJdDragActive
                               ? "border-blue-500 bg-blue-50"
                               : "border-gray-300"
                           }
                           ${jdFile ? "border-green-500 bg-green-50" : ""}`}
          >
            <input {...getJdInputProps()} />

            {jdFile ? (
              <div className="flex flex-col items-center justify-center text-gray-500 h-full">
                <FileText className="w-12 h-12 text-green-600 mb-2" />
                <p className="font-semibold text-green-700">{jdFile.name}</p>
                <button
                  className="text-xs text-red-500 mt-2 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setJdFile(null);
                  }}
                >
                  Clear
                </button>
              </div>
            ) : (
              <textarea
                className="w-full h-28 bg-transparent focus:outline-none resize-none placeholder-gray-500 text-sm text-gray-800"
                placeholder="Paste Job Description text here, or drag a file into this box."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
              />
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interview Type
          </label>
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setInterviewType("HR")}
              className={`flex-1 p-3 rounded-l-md transition-colors text-sm font-semibold ${
                interviewType === "HR"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              HR / Behavioral
            </button>
            <button
              onClick={() => setInterviewType("Technical")}
              className={`flex-1 p-3 rounded-r-md transition-colors text-sm font-semibold ${
                interviewType === "Technical"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Technical
            </button>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleStartInterview}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <LoaderCircle className="w-5 h-5 animate-spin" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
            <span>{isLoading ? "Processing..." : "Start Interview"}</span>
          </button>
        </div>
      </div>
      <footer className="text-center mt-8 text-gray-500 text-sm">
        <p>&copy; 2025 AI Interviewer. Built with Next.js & Gemini.</p>
      </footer>
    </div>
  );
}
