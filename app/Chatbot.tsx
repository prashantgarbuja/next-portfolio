"use client";

import React, { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import { FiSend } from "react-icons/fi";
import { BsChatDots } from "react-icons/bs";
import { CgClose } from "react-icons/cg";

interface ChatbotProps {
  initialMessage?: string;
  chatbotId?: string;
  position?: "right" | "left";
}

interface Message {
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const Chatbot: React.FC<ChatbotProps> = ({
  initialMessage = "Hi there! I am here to provide information about Prashant. Please feel free to ask 😊",
  chatbotId = "default",
  position = "right",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Initialize chat with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          text: initialMessage,
          isBot: true,
          timestamp: new Date(),
        },
      ]);
    }
  }, [initialMessage, messages.length]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Generate or retrieve session ID
  const getSessionId = () => {
    let sessionId = localStorage.getItem("chat-session");
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem("chat-session", sessionId);
    }
    return sessionId;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      text: inputMessage,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          chatbotId,
          sessionId: getSessionId(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to initiate request: ${response.statusText}`);
      }

      const { requestId } = await response.json();

      // Show a processing message
      const processingMessage: Message = {
        text: "Processing your request...",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, processingMessage]);

      // Poll for the response
      const pollForResponse = async () => {
        const maxAttempts = 30; // 60 seconds total (2s * 30)
        let attempts = 0;

        const pollInterval = setInterval(async () => {
          attempts++;
          try {
            const pollResponse = await fetch(
              `/api/check-response?requestId=${requestId}`
            );
            const pollData = await pollResponse.json();

            if (
              pollResponse.status === 200 &&
              pollData.message !== "Processing"
            ) {
              clearInterval(pollInterval);
              const botMessage: Message = {
                text: pollData.message,
                isBot: true,
                timestamp: new Date(),
              };
              setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                  msg.text === "Processing your request..." && msg.isBot
                    ? botMessage
                    : msg
                )
              );
              setIsLoading(false);
            } else if (attempts >= maxAttempts) {
              clearInterval(pollInterval);
              const timeoutMessage: Message = {
                text: "Request took too long. Please try again.",
                isBot: true,
                timestamp: new Date(),
              };
              setMessages((prevMessages) => [...prevMessages, timeoutMessage]);
              setIsLoading(false);
            }
          } catch (pollError) {
            console.error("Polling error:", pollError);
            clearInterval(pollInterval);
            const errorMessage: Message = {
              text: "Error while waiting for response. Please try again.",
              isBot: true,
              timestamp: new Date(),
            };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
            setIsLoading(false);
          }
        }, 2000); // Poll every 2 seconds
      };

      pollForResponse();
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        text: "Sorry, there was an error connecting to the chatbot. Please try again.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-50 ${
          position === "right" ? "right-6" : "left-6"
        } bottom-6 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shadow-md transition-colors duration-300 ${
          theme === "dark"
            ? "bg-violet-700 hover:bg-violet-800 text-white"
            : "bg-violet-600 hover:bg-violet-700 text-white"
        }`}
      >
        {isOpen ? <CgClose size={20} /> : <BsChatDots size={20} />}
      </div>

      {/* Chat window */}
      {isOpen && (
        <div
          className={`fixed z-[1001] ${
            position === "right" ? "right-6" : "left-6"
          } bottom-20 w-80 sm:w-96 h-[28rem] rounded-lg shadow-lg flex flex-col overflow-hidden border ${
            theme === "dark"
              ? "bg-grey-900 bg-opacity-95 border-gray-700"
              : "bg-white bg-opacity-95 border-gray-200"
          } backdrop-filter backdrop-blur-lg`}
        >
          {/* Chat header */}
          <div
            className={`p-4 flex justify-between items-center ${
              theme === "dark"
                ? "bg-violet-700 text-white"
                : "bg-violet-600 text-white"
            } border-b ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex items-center">
              <img
                src="/ava.png"
                alt="Personal Agent"
                className="w-8 h-8 rounded-full mr-2"
              />
              <div className="font-medium">Personal Agent</div>
            </div>
            <div
              onClick={() => setIsOpen(false)}
              className="cursor-pointer hover:text-violet-300 transition-colors duration-300"
            >
              <CgClose size={18} />
            </div>
          </div>

          {/* Chat messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 ${msg.isBot ? "text-left" : "text-right"}`}
              >
                <div
                  className={`inline-block p-3 rounded-lg max-w-[85%] ${
                    msg.isBot
                      ? theme === "dark"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-100 text-gray-800"
                      : "bg-violet-600 text-white"
                  } text-left`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-left mb-3">
                <div
                  className={`inline-block p-3 rounded-lg ${
                    theme === "dark"
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <span>Typing</span>
                  <span className="typing-animation"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <div
            className={`p-4 ${
              theme === "dark"
                ? "border-t border-gray-700"
                : "border-t border-gray-200"
            } flex items-center space-x-2`}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message..."
              className={`flex-1 min-w-0 p-2 rounded-md focus:outline-none ${
                theme === "dark"
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-gray-100 text-gray-800 border-gray-200"
              } border`}
            />
            <button
              onClick={handleSendMessage}
              className={`flex-shrink-0 w-10 h-10 rounded-md ${
                theme === "dark"
                  ? "bg-violet-700 hover:bg-violet-800"
                  : "bg-violet-600 hover:bg-violet-700"
              } text-white flex items-center justify-center transition-colors duration-300`}
              aria-label="Send message"
            >
              <FiSend size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Add some minimal CSS for animations */}
      <style jsx>{`
        .typing-animation::after {
          content: "";
          animation: typing 1.5s infinite;
        }
        @keyframes typing {
          0% {
            content: "";
          }
          25% {
            content: ".";
          }
          50% {
            content: "..";
          }
          75% {
            content: "...";
          }
        }
      `}</style>
    </>
  );
};

export default Chatbot;
