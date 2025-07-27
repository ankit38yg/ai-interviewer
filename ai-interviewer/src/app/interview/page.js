"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "regenerator-runtime/runtime";
import {
  Mic,
  MicOff,
  Video,
  PhoneOff,
  User,
  Bot,
  LoaderCircle,
  Type,
} from "lucide-react";
import Draggable from "react-draggable";
// --- NEW: Import Modal ---
import Modal from "react-modal";

// Set the app element for the modal for accessibility
if (typeof window !== "undefined") {
  Modal.setAppElement("body");
}

function InterviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoRef = useRef(null);
  const chatContainerRef = useRef(null);
  const draggableRef = useRef(null);

  // --- NEW: State for the text input modal ---
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");

  // Other states are the same...
  const [hasMounted, setHasMounted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isResponding, setIsResponding] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const speak = (text) => {
    // ... speak function is the same
    window.speechSynthesis.cancel();
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    // ... useEffect for scrolling is the same
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // ... useEffect for setup is the same
    const dataParam = searchParams.get("data");
    if (dataParam) {
      const parsedData = JSON.parse(dataParam);
      setMessages([{ sender: "ai", text: parsedData.firstQuestion }]);
      setConversationHistory(parsedData.conversationHistory);
      speak(parsedData.firstQuestion);
    }
    async function setupVideo() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error accessing video.", err);
      }
    }
    setupVideo();
    return () => window.speechSynthesis.cancel();
  }, [router, searchParams]);

  const handleSendTranscript = async (text) => {
    // ... handleSendTranscript function is the same
    if (!text) return;
    setMessages((prev) => [...prev, { sender: "user", text: text }]);
    setIsResponding(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: text,
          conversationHistory: conversationHistory,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: result.aiResponse },
        ]);
        setConversationHistory(result.updatedHistory);
        speak(result.aiResponse);
      } else {
        const errorText = "Sorry, I encountered an error.";
        setMessages((prev) => [...prev, { sender: "ai", text: errorText }]);
        speak(errorText);
      }
    } catch (error) {
      const errorText = "Sorry, I couldn't connect.";
      setMessages((prev) => [...prev, { sender: "ai", text: errorText }]);
      speak(errorText);
    } finally {
      setIsResponding(false);
      resetTranscript();
    }
  };

  const handleToggleListening = () => {
    // ... handleToggleListening function is the same
    if (listening) {
      SpeechRecognition.stopListening();
      setTimeout(() => handleSendTranscript(transcript), 500);
    } else {
      window.speechSynthesis.cancel();
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  // --- NEW: Function to handle typed answer submission ---
  const handleSubmitTypedAnswer = () => {
    handleSendTranscript(typedAnswer);
    setTypedAnswer("");
    setIsTextModalOpen(false);
  };

  if (!hasMounted) return null;
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="text-white">
        {"Browser doesn't support speech recognition."}
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col p-4">
      <main className="flex-1 flex gap-4 my-4 overflow-hidden relative">
        {/* Chat Panel is the same... */}
        <div className="w-full bg-gray-800 rounded-lg p-4 flex flex-col">
          <div
            ref={chatContainerRef}
            className="flex-1 space-y-4 overflow-y-auto pr-2"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  msg.sender === "user" ? "justify-end" : ""
                }`}
              >
                {msg.sender === "ai" && (
                  <div className="bg-blue-600 p-2 rounded-full">
                    <Bot size={20} />
                  </div>
                )}
                <div className={`p-3 rounded-lg max-w-md bg-gray-700`}>
                  <p
                    className={`font-semibold ${
                      msg.sender === "user" ? "text-green-300" : "text-blue-300"
                    }`}
                  >
                    {msg.sender === "user" ? "You" : "AI Interviewer"}
                  </p>
                  <p className="text-white whitespace-pre-wrap">{msg.text}</p>
                </div>
                {msg.sender === "user" && (
                  <div className="bg-green-600 p-2 rounded-full">
                    <User size={20} />
                  </div>
                )}
              </div>
            ))}
            {listening && (
              <div className="flex items-start gap-3 justify-end">
                <div className="bg-gray-600 p-3 rounded-lg max-w-md">
                  <p className="font-semibold text-green-300">
                    You (speaking...)
                  </p>
                  <p className="text-white italic">{transcript}</p>
                </div>
                <div className="bg-green-600 p-2 rounded-full">
                  <User size={20} />
                </div>
              </div>
            )}
            {isResponding && (
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 p-2 rounded-full">
                  <Bot size={20} />
                </div>
                <div className="p-3">
                  <LoaderCircle className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Draggable video is the same... */}
        <Draggable nodeRef={draggableRef}>
          <div
            ref={draggableRef}
            className="md:fixed md:top-0 md:right-0 w-full md:w-1/6 h-48 md:h-auto bg-black rounded-lg overflow-hidden cursor-move shadow-2xl"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            ></video>
            <div className="absolute top-2 left-2 bg-black/50 p-1 px-2 rounded-lg text-xs">
              Your Preview
            </div>
          </div>
        </Draggable>
      </main>

      <footer className="w-full bg-gray-800 rounded-lg p-2">
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={handleToggleListening}
            disabled={isResponding}
            className={`p-4 rounded-full transition-colors disabled:opacity-50 ${
              listening
                ? "bg-red-600 hover:bg-red-700 animate-pulse"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {listening ? <MicOff /> : <Mic />}
          </button>
          {/* --- NEW: "Type Answer" Button --- */}
          <button
            onClick={() => setIsTextModalOpen(true)}
            disabled={isResponding}
            className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            <Type />
          </button>
          <button
            onClick={() => {
              sessionStorage.setItem(
                "interviewHistory",
                JSON.stringify(conversationHistory)
              );
              router.push("/feedback");
            }}
            className="p-3 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
          >
            <PhoneOff />
          </button>
        </div>
      </footer>

      {/* --- NEW: Text Input Modal --- */}
      <Modal
        isOpen={isTextModalOpen}
        onRequestClose={() => setIsTextModalOpen(false)}
        className="bg-gray-800 text-white rounded-lg shadow-xl p-6 w-11/12 max-w-2xl m-auto focus:outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center"
        contentLabel="Type Answer Modal"
      >
        <h2 className="text-2xl font-bold mb-4">Type Your Answer</h2>
        <textarea
          className="w-full h-64 bg-gray-900 text-white rounded-md p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={typedAnswer}
          onChange={(e) => setTypedAnswer(e.target.value)}
          placeholder="Type your code or long-form answer here..."
        />
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={() => setIsTextModalOpen(false)}
            className="py-2 px-4 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitTypedAnswer}
            className="py-2 px-4 bg-blue-600 rounded-md hover:bg-blue-500 transition-colors"
          >
            Submit Answer
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InterviewPageContent />
    </Suspense>
  );
}
