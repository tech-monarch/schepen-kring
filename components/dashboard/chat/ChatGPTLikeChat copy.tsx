"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  Plus,
  MessageSquare,
  Trash2,
  Menu,
  X,
  AlertCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { tokenUtils } from "@/utils/auth";

// --- VOICE IMPORTS ---
import "regenerator-runtime/runtime";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export function ChatGPTLikeChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Using 'any' to avoid type conflict with the User icon component
  const [user, setUser] = useState<any>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const autoSendTimer = useRef<NodeJS.Timeout | null>(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // --- EMOTIONAL VOICE ENGINE ---
  const playVoice = useCallback(
    (text: string, base64Audio?: string) => {
      if (isMuted) return;

      const cleanText = text.replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF])/g,
        "",
      );

      if (base64Audio) {
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        audio
          .play()
          .catch((e) => console.error("Native voice playback failed:", e));
      } else if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.pitch = text.includes("!") ? 1.15 : 1.0;
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    },
    [isMuted],
  );

  // --- CORE SEND LOGIC ---
  const handleSend = useCallback(
    async (manualInput?: string) => {
      const textToSend = manualInput || input;
      if (!textToSend.trim() || isLoading || !currentSessionId) return;

      setInput("");
      resetTranscript();
      setIsLoading(true);

      // Add User Message
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                messages: [
                  ...s.messages,
                  {
                    id: Date.now().toString(),
                    role: "user",
                    content: textToSend,
                    timestamp: new Date().toISOString(),
                  },
                ],
                title:
                  s.messages.length === 0
                    ? textToSend.slice(0, 30) + "..."
                    : s.title,
              }
            : s,
        ),
      );

      try {
        const currentSession = sessions.find((s) => s.id === currentSessionId);
        const history = currentSession ? currentSession.messages : [];

        const response = await fetch("https://schepen-kring.nl/api/v1/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: textToSend,
            history: history,
            system_instruction:
              "You are an emotional voice assistant. Use emojis to show mood, but I will strip them from your speech. Sound excited for '!' and calm for periods.",
            config: {
              response_modalities: ["AUDIO"],
              speech_config: {
                voice_config: { prebuilt_voice_config: { voice_name: "Puck" } },
              },
            },
          }),
        });

        const data = await response.json();
        const aiReplyText =
          data.candidates?.[0]?.content?.parts?.find((p: any) => p.text)
            ?.text || "I'm sorry, I'm having trouble responding right now.";
        const aiAudio = data.candidates?.[0]?.content?.parts?.find(
          (p: any) => p.inline_data,
        )?.inline_data?.data;

        playVoice(aiReplyText, aiAudio);

        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSessionId
              ? {
                  ...s,
                  messages: [
                    ...s.messages,
                    {
                      id: (Date.now() + 1).toString(),
                      role: "assistant",
                      content: aiReplyText,
                      timestamp: new Date().toISOString(),
                    },
                  ],
                  updatedAt: Date.now(),
                }
              : s,
          ),
        );
      } catch (error) {
        console.error("Chat API Error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, currentSessionId, sessions, resetTranscript, playVoice],
  );

  // --- VOICE SYNC & AUTO-SEND ---
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
      if (autoSendTimer.current) clearTimeout(autoSendTimer.current);

      autoSendTimer.current = setTimeout(() => {
        if (transcript.trim() && listening) {
          SpeechRecognition.stopListening();
          handleSend(transcript); // Pass transcript directly to avoid state lag
        }
      }, 2000);
    }
  }, [transcript, listening, handleSend]);

  // --- INITIALIZATION & PERSISTENCE ---
  useEffect(() => {
    // 1. Load Sessions
    const saved = localStorage.getItem("answer24_chats");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      if (parsed.length > 0) setCurrentSessionId(parsed[0].id);
    } else {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: "New Conversation",
        messages: [],
        updatedAt: Date.now(),
      };
      setSessions([newSession]);
      setCurrentSessionId(newSession.id);
    }

    // 2. Load User Data for Profile Picture
    const userData = tokenUtils.getUser();
    if (userData) {
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("answer24_chats", JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sessions, isLoading]);

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Conversation",
      messages: [],
      updatedAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const getCurrentSession = () =>
    sessions.find((s) => s.id === currentSessionId);

  return (
    <div className="flex h-[90dvh] bg-white text-slate-800 overflow-hidden relative">
      {/* Sidebar */}
      <div
        className={`${isSidebarOpen ? "w-80 translate-x-0" : "w-0 -translate-x-full"} transition-all duration-300 bg-slate-50 border-r border-slate-200 flex flex-col fixed md:relative z-20 h-full`}
      >
        <div className="p-4 border-b flex justify-between items-center h-16 shrink-0">
          <h1 className="font-bold text-xl text-blue-600 tracking-tight">
            Answer24
          </h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1 text-slate-400"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-3">
          <Button
            onClick={createNewChat}
            className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all rounded-xl py-5"
          >
            <Plus size={18} /> New Chat
          </Button>
        </div>
        <div className="px-3 pb-2">
          <Button
            variant="ghost"
            onClick={() => setIsMuted(!isMuted)}
            className={`w-full justify-start gap-2 rounded-xl ${isMuted ? "text-red-500" : "text-slate-500"}`}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            {isMuted ? "Click to Unmute" : "Click to Mute"}
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => setCurrentSessionId(s.id)}
              className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors text-sm ${currentSessionId === s.id ? "bg-white shadow-sm border border-slate-200 text-slate-900 font-semibold" : "text-slate-500 hover:bg-slate-100"}`}
            >
              <MessageSquare
                size={16}
                className={
                  currentSessionId === s.id ? "text-blue-500" : "text-slate-400"
                }
              />
              <span className="truncate flex-1">{s.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSessionToDelete(s.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-white">
        <div className="p-4 flex items-center justify-between">
          {!isSidebarOpen && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="bg-white shadow-sm rounded-xl"
            >
              <Menu size={20} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="md:hidden"
          >
            {isMuted ? (
              <VolumeX size={20} className="text-red-500" />
            ) : (
              <Volume2 size={20} className="text-slate-400" />
            )}
          </Button>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth"
        >
          <div className="max-w-3xl mx-auto w-full">
            {getCurrentSession()?.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 pt-20 animate-in fade-in duration-500">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                  <Bot size={30} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Schepen-kring AI
                </h2>
              </div>
            ) : (
              <div className="space-y-6 pb-20">
                {getCurrentSession()?.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-300`}
                  >
                    <div
                      className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm overflow-hidden ${msg.role === "user" ? "bg-slate-200" : "bg-blue-600 text-white"}`}
                      >
                        {msg.role === "user" ? (
                          user?.profile_picture ? (
                            <img
                              src={user.profile_picture}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={14} />
                          )
                        ) : (
                          <Bot size={14} />
                        )}
                      </div>
                      <div
                        className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.role === "user" ? "bg-slate-800 text-white rounded-tr-sm" : "bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-sm"}`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-sm flex gap-1">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* --- INPUT AREA --- */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="max-w-3xl mx-auto relative flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                listening
                  ? "Listening... pause to send."
                  : "Ask anything about Answer24..."
              }
              className={`py-6 pl-5 pr-24 rounded-2xl border-slate-200 shadow-sm transition-all ${listening ? "border-blue-400 ring-2 ring-blue-50 bg-blue-50/50" : ""}`}
              disabled={isLoading}
            />
            <div className="absolute right-2 flex gap-1">
              {browserSupportsSpeechRecognition && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={toggleListening}
                  className={`rounded-xl w-10 h-10 p-0 ${listening ? "text-red-600 bg-red-50" : "text-slate-400 hover:text-blue-600"}`}
                >
                  {listening ? (
                    <MicOff size={18} className="animate-pulse" />
                  ) : (
                    <Mic size={18} />
                  )}
                </Button>
              )}
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="rounded-xl w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white active:scale-95 transition-transform"
              >
                <Send size={18} />
              </Button>
            </div>
          </form>
        </div>

        {/* Delete Modal */}
        {sessionToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full border border-slate-100">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <AlertCircle size={24} />
                <h3 className="font-bold text-lg">Delete Chat?</h3>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => setSessionToDelete(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl"
                  onClick={() => {
                    const newSessions = sessions.filter(
                      (s) => s.id !== sessionToDelete,
                    );
                    setSessions(newSessions);
                    if (currentSessionId === sessionToDelete) {
                      setCurrentSessionId(
                        newSessions.length > 0 ? newSessions[0].id : null,
                      );
                    }
                    setSessionToDelete(null);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>{" "}
      {/* <--- THIS IS THE CLOSING TAG FOR THE MAIN CONTENT AREA */}
    </div> // <--- THIS IS THE CLOSING TAG FOR THE ROOT CONTAINER THAT WAS MISSING
  );
}
