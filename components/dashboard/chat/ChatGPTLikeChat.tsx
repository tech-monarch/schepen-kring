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
  Paperclip,
  ImageIcon,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { tokenUtils } from "@/utils/auth";

import "regenerator-runtime/runtime";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  image?: string;
  feedback?: "like" | "dislike";
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  isHumanMode?: boolean;
}

export function ChatGPTLikeChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const autoSendTimer = useRef<NodeJS.Timeout | null>(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();
  // ... existing states
  const [selectedImage, setSelectedImage] = useState<File | null>(null); // New state for image
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for hidden input
  const [dislikeCount, setDislikeCount] = useState(0); // [cite: 108]
  const [isEscalated, setIsEscalated] = useState(false); // [cite: 108]

  const handleFeedback = async (
    messageId: string,
    type: "like" | "dislike",
  ) => {
    let sessionToSync: ChatSession | null = null;

    // 1. Update the local React state
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          const updatedMessages = s.messages.map((m) =>
            m.id === messageId ? { ...m, feedback: type } : m,
          );

          sessionToSync = { ...s, messages: updatedMessages };
          return sessionToSync;
        }
        return s;
      }),
    );

    // 2. Track dislikes for the escalation button logic
    if (type === "dislike") {
      setDislikeCount((prev) => prev + 1);
    }

    // 3. Sync the updated JSON blob to your Laravel 'history' endpoint
    if (sessionToSync) {
      await syncToDatabase(sessionToSync);
    }
  };

  const requestHumanHelp = async () => {
    if (!currentSessionId) return;

    // 1. Update local state immediately to 'Human Mode'
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId ? { ...s, isHumanMode: true } : s,
      ),
    );

    // 2. Local flag for UI immediate response
    setIsEscalated(true);

    try {
      // 3. Notify the backend to flag the chat for human intervention
      await fetch(
        `https://kring.answer24.nl/api/v1/history/${currentSessionId}/escalate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenUtils.getToken()}`,
            "Content-Type": "application/json",
          },
        },
      );

      // 4. Sync the session state to the history table to ensure isHumanMode is saved
      const currentSession = sessions.find((s) => s.id === currentSessionId);
      if (currentSession) {
        await syncToDatabase({ ...currentSession, isHumanMode: true });
      }
    } catch (error) {
      console.error("Escalation failed:", error);
    }
  };

  // --- AUTO-REFRESH (POLLING) FOR HUMAN CHAT ---
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkUpdates = async () => {
      const currentSession = sessions.find((s) => s.id === currentSessionId);
      if (!currentSession?.isHumanMode) return;

      try {
        const response = await fetch(
          "https://kring.answer24.nl/api/v1/history",
          {
            headers: { Authorization: `Bearer ${tokenUtils.getToken()}` },
          },
        );
        const data = await response.json();

        // Update local sessions with fresh data from DB
        if (data && data.length > 0) {
          setSessions(data);
        }
      } catch (e) {
        console.error("Auto-refresh failed", e);
      }
    };

    // Only poll if we are in a session and it's escalated to human
    if (
      currentSessionId &&
      sessions.find((s) => s.id === currentSessionId)?.isHumanMode
    ) {
      interval = setInterval(checkUpdates, 4000);
    }

    return () => clearInterval(interval);
  }, [currentSessionId, sessions]);

  // --- DYNAMIC MULTILINGUAL VOICE ENGINE ---
  const playVoice = useCallback(
    (text: string, base64Audio?: string) => {
      if (isMuted) return;

      // Clean text of emojis for fallback TTS
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

        // LANGUAGE DETECTION LOGIC
        // Simple regex check for common Dutch words to toggle language
        const isDutch = /de|het|een|en|van|ik|je|we/i.test(cleanText);
        utterance.lang = isDutch ? "nl-NL" : "en-US";

        // Subtle pitch modulation for emotion
        utterance.pitch = text.includes("!") ? 1.15 : 1.0;
        utterance.rate = 1.05;

        // Find a feminine voice if available to match your new system prompt
        const voices = window.speechSynthesis.getVoices();
        const feminineVoice = voices.find(
          (v) =>
            v.lang.includes(utterance.lang) &&
            (v.name.includes("Female") ||
              v.name.includes("Google") ||
              v.name.includes("Samantha") ||
              v.name.includes("Puck")),
        );

        if (feminineVoice) utterance.voice = feminineVoice;

        window.speechSynthesis.speak(utterance);
      }
    },
    [isMuted],
  );
  // --- API HELPER: SYNC TO DB ---
  const syncToDatabase = async (session: ChatSession) => {
    try {
      await fetch("https://kring.answer24.nl/api/v1/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenUtils.getToken()}`,
        },
        body: JSON.stringify({
          id: session.id,
          title: session.title,
          messages: session.messages,
        }),
      });
    } catch (e) {
      console.error("Failed to sync to DB:", e);
    }
  };

  const resumeAIMode = async () => {
    if (!currentSessionId) return;

    // 1. Update local state immediately
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId ? { ...s, isHumanMode: false } : s,
      ),
    );

    // 2. Reset local escalation flag
    setIsEscalated(false);
    setDislikeCount(0); // Optional: Reset dislike counter to start fresh

    try {
      // 3. Sync the 'is_human_escalated: false' state to the backend
      const currentSession = sessions.find((s) => s.id === currentSessionId);
      if (currentSession) {
        await syncToDatabase({
          ...currentSession,
          isHumanMode: false,
        });
      }

      // 4. (Optional) Explicitly call your escalate endpoint with a 'de-escalate' flag
      // or rely on the syncToDatabase above if your backend handles the boolean.
    } catch (error) {
      console.error("Failed to resume AI mode:", error);
    }
  };

  // const handleSend = useCallback(async (manualInput?: string) => {
  //     const textToSend = manualInput || input;
  //     const localImageUrl = selectedImage ? URL.createObjectURL(selectedImage) : undefined;
  //     // MODIFIED: Check for text OR image
  //     if ((!textToSend.trim() && !selectedImage) || isLoading || !currentSessionId) return;

  //     setInput("");
  //     setIsLoading(true);
  //     resetTranscript(); // Reset voice if active

  //     const userMsg: Message = {
  //       id: Date.now().toString(),
  //       role: "user",
  //       content: textToSend,
  //       timestamp: new Date().toISOString(),
  //       image: localImageUrl
  //       // Note: We aren't displaying the image locally in the bubble to save time,
  //       // but it is being sent to the backend.
  //     };

  //     // Optimistic Update (Same as your code)
  //     let updatedSession: ChatSession | undefined;
  //     setSessions(prev => prev.map(s => {
  //       if (s.id === currentSessionId) {
  //         updatedSession = {
  //           ...s,
  //           messages: [...s.messages, userMsg],
  //           title: s.messages.length === 0 ? textToSend.slice(0, 30) + "..." : s.title,
  //           updatedAt: Date.now()
  //         };
  //         return updatedSession;
  //       }
  //       return s;
  //     }));

  //     try {
  //       const currentSession = sessions.find(s => s.id === currentSessionId);
  //       const history = currentSession ? currentSession.messages : [];

  //       // MODIFIED: Create FormData object
  //       const formData = new FormData();
  //       formData.append("message", textToSend);
  //       formData.append("session_id", currentSessionId);
  //       formData.append("history", JSON.stringify(history));

  //       // Append config (Same as your code)
  //       formData.append("config", JSON.stringify({
  //          response_modalities: ["AUDIO"],
  //          speech_config: { voice_config: { prebuilt_voice_config: { voice_name: "Puck" } } }
  //       }));

  //       // MODIFIED: Append Image
  //       if (selectedImage) {
  //         formData.append("image", selectedImage);
  //       }

  //       // MODIFIED: Point to your NEW Laravel Controller Route
  //       // Ensure this URL matches your Laravel API route
  //       const response = await fetch("https://kring.answer24.nl/api/v1/chat-storage", {
  //         method: "POST",
  //         headers: {
  //           // "Content-Type": "application/json", <--- Removed so browser sets boundary
  //           "Authorization": `Bearer ${tokenUtils.getToken()}`
  //         },
  //         body: formData // Send FormData
  //       });

  //       // Reset Image State
  //       setSelectedImage(null);
  //       if(fileInputRef.current) fileInputRef.current.value = "";

  //       const data = await response.json();

  //       // ... REST OF YOUR LOGIC IS UNCHANGED ...
  //       const aiReplyText = data.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text || "I'm sorry, I'm having trouble responding right now.";
  //       const aiAudio = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inline_data)?.inline_data?.data;

  //       playVoice(aiReplyText, aiAudio);

  //       const assistantMsg: Message = {
  //         id: (Date.now() + 1).toString(),
  //         role: "assistant",
  //         content: aiReplyText,
  //         timestamp: new Date().toISOString()
  //       };

  //       setSessions(prev => prev.map(s => {
  //         if (s.id === currentSessionId) {
  //           const finalSession = {
  //             ...s,
  //             messages: [...s.messages, assistantMsg],
  //             updatedAt: Date.now()
  //           };
  //           syncToDatabase(finalSession);
  //           return finalSession;
  //         }
  //         return s;
  //       }));
  //     } catch (error) {
  //       console.error("Chat API Error:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }, [input, isLoading, currentSessionId, sessions, resetTranscript, playVoice, selectedImage]);

  const handleSend = useCallback(
    async (manualInput?: string) => {
      const textToSend = manualInput || input;
      const localImageUrl = selectedImage
        ? URL.createObjectURL(selectedImage)
        : undefined;
      const currentSession = sessions.find((s) => s.id === currentSessionId);

      if (
        (!textToSend.trim() && !selectedImage) ||
        isLoading ||
        !currentSessionId
      )
        return;

      setInput("");
      setIsLoading(true);
      resetTranscript();

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: textToSend,
        timestamp: new Date().toISOString(),
        image: localImageUrl,
      };

      // 1. Optimistic Update locally
      let updatedSession: ChatSession | undefined;
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            updatedSession = {
              ...s,
              messages: [...s.messages, userMsg],
              title:
                s.messages.length === 0
                  ? textToSend.slice(0, 30) + "..."
                  : s.title,
              updatedAt: Date.now(),
            };
            return updatedSession;
          }
          return s;
        }),
      );

      // 2. Sync message to DB immediately
      if (updatedSession) {
        await syncToDatabase(updatedSession);
      }

      // 3. IF HUMAN MODE IS ACTIVE, STOP HERE
      if (currentSession?.isHumanMode) {
        setIsLoading(false);
        setSelectedImage(null);
        return; // Polling will catch the admin's reply
      }

      // 4. IF AI MODE: Call AI Endpoint [cite: 36]
      try {
        const history = currentSession ? currentSession.messages : [];
        const formData = new FormData();
        formData.append("message", textToSend);
        formData.append("session_id", currentSessionId);
        formData.append("history", JSON.stringify(history));
        if (selectedImage) formData.append("image", selectedImage);

        const response = await fetch(
          "https://kring.answer24.nl/api/v1/chat-storage",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${tokenUtils.getToken()}` },
            body: formData,
          },
        );

        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";

        const data = await response.json();
        const aiReplyText =
          data.candidates?.[0]?.content?.parts?.find((p: any) => p.text)
            ?.text || "Agent is typing...";
        const aiAudio = data.candidates?.[0]?.content?.parts?.find(
          (p: any) => p.inline_data,
        )?.inline_data?.data;

        playVoice(aiReplyText, aiAudio);

        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: aiReplyText,
          timestamp: new Date().toISOString(),
        };

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === currentSessionId) {
              const finalSession = {
                ...s,
                messages: [...s.messages, assistantMsg],
                updatedAt: Date.now(),
              };
              syncToDatabase(finalSession);
              return finalSession;
            }
            return s;
          }),
        );
      } catch (error) {
        console.error("Chat API Error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [
      input,
      isLoading,
      currentSessionId,
      sessions,
      resetTranscript,
      playVoice,
      selectedImage,
    ],
  );

  // --- VOICE AUTO-SEND ---
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
      if (autoSendTimer.current) clearTimeout(autoSendTimer.current);

      autoSendTimer.current = setTimeout(() => {
        if (transcript.trim() && listening) {
          SpeechRecognition.stopListening();
          handleSend(transcript);
        }
      }, 2000);
    }
  }, [transcript, listening, handleSend]);

  // --- INITIALIZATION (API LOAD) ---
  useEffect(() => {
    const fetchHistory = async () => {
      setIsFetchingHistory(true);
      try {
        const response = await fetch(
          "https://kring.answer24.nl/api/v1/history",
          {
            headers: { Authorization: `Bearer ${tokenUtils.getToken()}` },
          },
        );

        if (!response.ok) throw new Error("Connection failed");

        const data = await response.json();
        if (data && data.length > 0) {
          setSessions(data);
          setCurrentSessionId(data[0].id);
        } else {
          createNewChat();
        }
      } catch (error) {
        console.error("Failed to load history:", error);
        createNewChat();
      } finally {
        setIsFetchingHistory(false);
      }
    };

    fetchHistory();
    const userData = tokenUtils.getUser();
    if (userData) setUser(userData);
  }, []);

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
    syncToDatabase(newSession);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleDelete = async () => {
    if (!sessionToDelete) return;
    try {
      await fetch(
        `https://kring.answer24.nl/api/v1/history/${sessionToDelete}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${tokenUtils.getToken()}` },
        },
      );
      const newSessions = sessions.filter((s) => s.id !== sessionToDelete);
      setSessions(newSessions);
      if (currentSessionId === sessionToDelete) {
        setCurrentSessionId(newSessions.length > 0 ? newSessions[0].id : null);
      }
    } catch (e) {
      console.error("Delete failed:", e);
    }
    setSessionToDelete(null);
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
    <div className="flex h-[90dvh] bg-white text-slate-800 overflow-hidden relative font-sans">
      {/* Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`
      fixed top-0 left-0 z-40 h-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
      bg-slate-50 border-r border-slate-200 flex flex-col shadow-2xl md:shadow-none
      ${isSidebarOpen ? "translate-x-0 w-[280px]" : "-translate-x-full w-[280px]"}
      md:relative md:translate-x-0 ${isSidebarOpen ? "md:flex" : "md:hidden"}
    `}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b h-16 shrink-0 bg-white/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Bot size={18} />
            </div>
            <span className="font-bold text-slate-800 text-sm tracking-tight">
              Answer24
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden rounded-xl"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Action Buttons: New Chat & Mute */}
        <div className="p-3 space-y-2">
          {/* New Chat Button - Added as requested */}
          <Button
            onClick={() => {
              createNewChat(); // Assuming this is your function name
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            className="w-full justify-start gap-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm py-5"
          >
            <Plus size={18} className="text-blue-600" />
            <span className="font-semibold text-sm">New Chat</span>
          </Button>

          <Button
            variant="ghost"
            onClick={() => setIsMuted(!isMuted)}
            className={`w-full justify-start gap-2 rounded-xl transition-colors ${isMuted ? "text-red-500 bg-red-50" : "text-slate-500 hover:bg-slate-100"}`}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            <span className="text-xs font-medium">
              {isMuted ? "Click to Unmute" : "Click to Mute"}
            </span>
          </Button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 pb-24">
          {isFetchingHistory ? (
            <div className="p-3 text-sm text-slate-400 animate-pulse flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Your chat would be loaded shortly...
            </div>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  setCurrentSessionId(s.id);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all text-sm ${currentSessionId === s.id ? "bg-white shadow-md border border-slate-200 text-slate-900 font-semibold" : "text-slate-500 hover:bg-slate-200/50"}`}
              >
                <MessageSquare
                  size={16}
                  className={
                    currentSessionId === s.id
                      ? "text-blue-500"
                      : "text-slate-400"
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
            ))
          )}
        </div>

        {/* Sidebar Bottom Action - Blue Button */}
        {/* Sidebar Bottom Action - Updated with Toggle Logic */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          {getCurrentSession()?.isHumanMode ? (
            <Button
              className="w-full rounded-xl py-6 shadow-lg flex items-center justify-center gap-2 transition-all bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={resumeAIMode}
            >
              <Bot size={18} />
              <span className="font-bold">Return to AI Agent</span>
            </Button>
          ) : (
            <Button
              className={`w-full rounded-xl py-6 shadow-lg flex items-center justify-center gap-2 transition-all ${
                dislikeCount >= 3
                  ? "bg-orange-600 hover:bg-orange-700 animate-pulse"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
              onClick={requestHumanHelp}
            >
              <User size={18} />
              <span className="font-bold">
                {dislikeCount >= 3 ? "Request Human Help" : "Chat with human"}
              </span>
            </Button>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-white w-full">
        <header className="p-4 flex items-center justify-between border-b border-slate-50 md:border-none bg-white/80 backdrop-blur-md sticky top-0 z-20 h-16 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              {!isSidebarOpen && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsSidebarOpen(true)}
                  className="rounded-xl border-slate-200 shadow-sm animate-in zoom-in-75 duration-200"
                >
                  <Menu size={20} />
                </Button>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 text-sm truncate max-w-[150px] md:max-w-none">
                {getCurrentSession()?.title || "New Chat"}
              </span>
            </div>
          </div>
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
        </header>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth"
        >
          <div className="max-w-3xl mx-auto w-full">
            {getCurrentSession()?.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 pt-20 animate-in fade-in duration-500">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                  <Bot size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                  Schepen-kring AI
                </h2>
                <p className="text-slate-400 text-sm">
                  Ask me anything to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-6 pb-20">
                {getCurrentSession()?.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-300`}
                  >
                    <div
                      className={`flex gap-3 max-w-[88%] md:max-w-[75%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      {/* Avatar Section [cite: 78, 79] */}
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

                      {/* Message Content Section  */}
                      <div
                        className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}
                      >
                        {/* Text Bubble [cite: 84] */}
                        <div
                          className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.role === "user" ? "bg-slate-800 text-white rounded-tr-sm" : "bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-sm"}`}
                        >
                          {msg.content}
                        </div>

                        {/* Image Attachment [cite: 85, 86] */}
                        {msg.image && (
                          <div className="mt-2 p-1 bg-slate-100 rounded-lg w-fit">
                            <img
                              src={msg.image}
                              alt="Uploaded content"
                              className="max-w-full h-auto rounded-md border border-black/5 shadow-sm"
                              style={{ maxHeight: "200px" }}
                            />
                          </div>
                        )}

                        {/* Feedback Buttons (Moved INSIDE the flex-col for better alignment) */}
                        {msg.role === "assistant" && (
                          <div className="flex gap-2 mt-1 px-1">
                            <button
                              onClick={() => handleFeedback(msg.id, "like")}
                              className={`p-1 hover:text-blue-600 transition-colors ${msg.feedback === "like" ? "text-blue-600" : "text-slate-300"}`}
                            >
                              <ThumbsUp size={14} />
                            </button>
                            <button
                              onClick={() => handleFeedback(msg.id, "dislike")}
                              className={`p-1 hover:text-red-600 transition-colors ${msg.feedback === "dislike" ? "text-red-600" : "text-slate-300"}`}
                            >
                              <ThumbsDown size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading State [cite: 88, 89] */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-sm flex gap-1 items-center">
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

        {/* INPUT AREA */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          {selectedImage && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50/50 border border-blue-100 rounded-xl w-fit animate-in fade-in slide-in-from-bottom-2">
              <div className="relative">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="preview"
                  className="h-10 w-10 object-cover rounded-md border border-blue-200"
                />
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full">
                  <ImageIcon size={10} className="m-1" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-blue-900 max-w-[150px] truncate">
                  {selectedImage.name}
                </span>
                <span className="text-[10px] text-blue-600">
                  {(selectedImage.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="ml-2 p-1 text-blue-400 hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="max-w-3xl mx-auto relative flex items-center gap-2"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) =>
                e.target.files && setSelectedImage(e.target.files[0])
              }
              className="hidden"
              accept="image/*"
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-xl w-12 h-12 p-0 shrink-0 transition-all ${selectedImage ? "text-blue-600 bg-blue-50 border border-blue-100" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"}`}
            >
              <Paperclip size={20} />
            </Button>
            <div className="relative flex-1 flex items-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  getCurrentSession()?.isHumanMode
                    ? "Human agent requested... Type your message."
                    : listening
                      ? "Listening... Pause to send"
                      : "Ask anything..."
                }
                className={`py-6 pl-5 pr-24 rounded-2xl border-slate-200 shadow-sm transition-all focus:ring-blue-500 ${listening ? "border-blue-400 ring-2 ring-blue-50 bg-blue-50/50" : ""}`}
                disabled={isLoading}
              />
              <div className="absolute right-2 flex gap-1">
                {browserSupportsSpeechRecognition && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={toggleListening}
                    className={`rounded-xl w-10 h-10 p-0 ${listening ? "text-green-600 bg-green-50" : "text-slate-400 hover:text-blue-600"}`}
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
                  disabled={(!input.trim() && !selectedImage) || isLoading}
                  className="rounded-xl w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white active:scale-95 transition-transform shadow-md shadow-blue-200"
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Delete Modal Logic - Kept exactly as original */}
        {sessionToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full border border-slate-100">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <AlertCircle size={24} />
                <h3 className="font-bold text-lg">Delete Chat?</h3>
              </div>
              <p className="text-slate-500 text-sm">
                Are you sure you want to delete this session? This cannot be
                undone.
              </p>
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
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
