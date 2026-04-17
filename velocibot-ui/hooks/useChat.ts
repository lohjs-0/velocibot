"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { Message, Chat } from "@/types/chat";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface SupabaseMessage {
  id: string;
  chat_id: string;
  role: string;
  content: string;
  created_at: string;
}

interface SupabaseChat {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

function formatUserMessage(text: string) {
  if (text.includes("```")) return text;
  const patterns = [
    /function|const|let|import|class|if\s*\(|for\s*\(|<\/?[a-z]/i,
  ];
  if (patterns.some((p) => p.test(text))) {
    return `\`\`\`javascript\n${text}\n\`\`\``;
  }
  return text;
}

function cleanBotResponse(text: string) {
  let cleaned = text.trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed?.response) cleaned = parsed.response;
    else if (parsed?.message) cleaned = parsed.message;
    else if (parsed?.reply) cleaned = parsed.reply;
    else if (typeof parsed === "string") cleaned = parsed;
  } catch {
    const match = cleaned.match(/"response"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (match) cleaned = match[1];
  }
  cleaned = cleaned.replace(/^\s*response\s*:\s*/i, "");
  cleaned = cleaned.replace(/\\n/g, "\n");
  cleaned = cleaned.replace(/^"+|"+$/g, "");
  return cleaned;
}

function resizeAndConvertToBase64(file: File, maxSize = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context falhou"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    fullText += `\n[Página ${i}]\n${pageText}`;
  }
  return fullText.trim();
}

export function useChat(user: User | null, userName?: string | null) {
  const supabase = useMemo(() => createClient(), []);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [userMemory, setUserMemory] = useState<string>("");
  // ✅ NOVO: controla se a autenticação já foi resolvida
  const [authReady, setAuthReady] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isUserScrolling = useRef(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Helpers de token ──────────────────────────────────────────────────────
  async function getAuthHeaders(): Promise<HeadersInit> {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // ✅ NOVO: aguarda o Supabase resolver o estado de auth antes de qualquer coisa
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, _session) => {
      setAuthReady(true);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // ✅ CORRIGIDO: só carrega após auth estar pronta
  useEffect(() => {
    if (!authReady) return;
    if (user) {
      loadChatsFromSupabase();
      loadUserMemory();
    } else {
      loadChatsFromLocalStorage();
    }
  }, [user, authReady]);

  const loadUserMemory = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_profiles")
      .select("memory")
      .eq("id", user.id)
      .single();
    if (data?.memory) setUserMemory(data.memory);
  };

  const loadChatsFromSupabase = async () => {
    if (!user) return;
    const { data: chatsData } = await supabase
      .from("chats")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!chatsData || chatsData.length === 0) {
      const newChat: Chat = {
        id: crypto.randomUUID(),
        title: "Nova conversa",
        messages: [],
        createdAt: Date.now(),
      };
      await supabase
        .from("chats")
        .insert({ id: newChat.id, user_id: user.id, title: newChat.title });
      setChats([newChat]);
      setCurrentChatId(newChat.id);
      return;
    }

    const firstChat = chatsData[0] as SupabaseChat;
    const { data: messagesData } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", firstChat.id)
      .order("created_at", { ascending: true });

    const parsedMessages: Message[] = (
      (messagesData as SupabaseMessage[]) || []
    ).map((m) => ({
      role: m.role as "user" | "bot",
      content: m.content,
    }));

    const parsedChats: Chat[] = (chatsData as SupabaseChat[]).map((c) => ({
      id: c.id,
      title: c.title,
      messages: c.id === firstChat.id ? parsedMessages : [],
      createdAt: new Date(c.created_at).getTime(),
    }));

    setChats(parsedChats);
    setCurrentChatId(firstChat.id);
    setMessages(parsedMessages);
  };

  const loadChatsFromLocalStorage = () => {
    const saved = localStorage.getItem("velocibot_chats");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setChats(parsed);
          setCurrentChatId(parsed[0].id);
          setMessages(parsed[0].messages);
          return;
        }
      } catch (e) {
        console.error("Erro ao carregar chats:", e);
      }
    }
    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: "Nova conversa",
      messages: [],
      createdAt: Date.now(),
    };
    setChats([newChat]);
    setCurrentChatId(newChat.id);
  };

  // ✅ CORRIGIDO: só salva no localStorage após auth pronta e sem usuário logado
  useEffect(() => {
    if (!authReady) return;
    if (!user && chats.length > 0) {
      localStorage.setItem("velocibot_chats", JSON.stringify(chats));
    }
  }, [chats, user, authReady]);

  useEffect(() => {
    if (isUserScrolling.current) return;
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, loading]);

  useEffect(() => {
    if (!currentChatId) return;
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? { ...chat, messages: [...messages] }
          : chat
      )
    );
  }, [messages, currentChatId]);

  useEffect(() => {
    const container = bottomRef.current?.parentElement;
    if (!container) return;
    const handleScroll = () => {
      isUserScrolling.current = true;
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        isUserScrolling.current = false;
      }, 1500);
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopy = (text: string, id: number) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleShare = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "VelociBot - Resposta",
          text: text.slice(0, 100) + "...",
          url: window.location.href,
        });
      } catch (err) {
        console.log("Erro ao compartilhar:", err);
      }
    } else {
      handleCopy(window.location.href, 888);
    }
  };

  const createNewChat = async () => {
    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: "Nova conversa",
      messages: [],
      createdAt: Date.now(),
    };
    if (user) {
      await supabase
        .from("chats")
        .insert({ id: newChat.id, user_id: user.id, title: newChat.title });
    }
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setMessages([]);
    setInput("");
  };

  const deleteChat = async (id: string) => {
    if (user) await supabase.from("chats").delete().eq("id", id);
    setChats((prev) => {
      const updated = prev.filter((chat) => chat.id !== id);
      if (id === currentChatId) {
        if (updated.length > 0) {
          setCurrentChatId(updated[0].id);
          setMessages(updated[0].messages);
        } else {
          const newChat: Chat = {
            id: crypto.randomUUID(),
            title: "Nova conversa",
            messages: [],
            createdAt: Date.now(),
          };
          setCurrentChatId(newChat.id);
          setMessages([]);
          return [newChat];
        }
      }
      return updated;
    });
    setDeleteConfirmId(null);
  };

  const selectChat = async (chat: Chat) => {
    setCurrentChatId(chat.id);
    if (user && chat.messages.length === 0) {
      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chat.id)
        .order("created_at", { ascending: true });
      const parsedMessages: Message[] = (
        (messagesData as SupabaseMessage[]) || []
      ).map((m) => ({
        role: m.role as "user" | "bot",
        content: m.content,
      }));
      setMessages(parsedMessages);
      setChats((prev) =>
        prev.map((c) =>
          c.id === chat.id ? { ...c, messages: parsedMessages } : c
        )
      );
    } else {
      setMessages([...chat.messages]);
    }
  };

  const updateMemory = async (newMemory: string) => {
    setUserMemory(newMemory);
    if (!user) return;
    await supabase
      .from("user_profiles")
      .update({ memory: newMemory })
      .eq("id", user.id);
  };

  // ✅ NOVO: limpa o localStorage no logout
  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("velocibot_chats");
    localStorage.removeItem("velocibot_username");
  };

  const sendMessage = async (overrideInput?: string, file?: File | null) => {
    const finalInput = overrideInput || input;
    if (!finalInput.trim() && !file) return;
    if (loading) return;

    const formattedInput = finalInput.trim()
      ? formatUserMessage(finalInput)
      : "";

    let imageBase64: string | null = null;
    let imagePreviewUrl: string | null = null;
    let pdfText: string | null = null;

    if (file) {
      if (file.type.startsWith("image/")) {
        imageBase64 = await resizeAndConvertToBase64(file);
        imagePreviewUrl = imageBase64;
      } else if (file.type === "application/pdf") {
        try {
          pdfText = await extractPdfText(file);
        } catch (err) {
          console.error("Erro ao extrair PDF:", err);
        }
      }
    }

    const messageToSend = pdfText
      ? `${finalInput.trim() ? finalInput.trim() + "\n\n" : "Analise este documento:\n\n"}[Conteúdo do PDF: ${file?.name}]\n${pdfText.slice(0, 6000)}`
      : finalInput.trim() || "O que tem nessa imagem?";

    const userMessage: Message = {
      role: "user",
      content: formattedInput || (pdfText ? `📄 ${file?.name}` : ""),
      image: imagePreviewUrl ?? undefined,
    };

    const botMessage: Message = { role: "bot", content: "" };
    const isFirstMessage = messages.length === 0;
    const history = messages.slice(-10);

    setMessages([...messages, userMessage, botMessage]);
    setInput("");
    setLoading(true);
    isUserScrolling.current = false;

    try {
      const contextParts = [
        userName
          ? `O nome do usuário é ${userName}. Chame-o pelo nome quando fizer sentido.`
          : "",
        userMemory ? `Memória do usuário: ${userMemory}` : "",
      ].filter(Boolean);

      const memoryContext =
        contextParts.length > 0
          ? `[CONTEXTO DO USUÁRIO]:\n${contextParts.join("\n")}\n\n`
          : "";

      const headers = await getAuthHeaders();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: memoryContext + messageToSend,
          image: imageBase64,
          history,
          memory: userMemory,
        }),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(`Falha na API: ${res.status}`);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      const botReply = cleanBotResponse(
        data.reply || data.response || data.message || text || "Sem resposta"
      );

      setMessages((prev) => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg && lastMsg.role === "bot") lastMsg.content = botReply;
        return updated;
      });

      if (user && currentChatId) {
        await supabase.from("messages").insert([
          {
            id: crypto.randomUUID(),
            chat_id: currentChatId,
            role: "user",
            content: userMessage.content,
          },
          {
            id: crypto.randomUUID(),
            chat_id: currentChatId,
            role: "bot",
            content: botReply,
          },
        ]);

        const totalMessages = messages.length + 2;
        if (totalMessages % 6 === 0) {
          const botReplyMessage: Message = { role: "bot", content: botReply };
          const recentHistory: Message[] = [
            ...history,
            userMessage,
            botReplyMessage,
          ];

          const recentHistoryText = recentHistory
            .map(
              (m) =>
                `${m.role === "user" ? "Usuário" : "VelociBot"}: ${m.content.slice(0, 300)}`
            )
            .join("\n");

          const memHeaders = await getAuthHeaders();
          const memRes = await fetch("/api/chat", {
            method: "POST",
            headers: memHeaders,
            body: JSON.stringify({
              message: `Com base nessa conversa, extraia fatos importantes sobre o usuário (linguagens preferidas, projetos, dificuldades recorrentes, estilo de código). Seja conciso, máximo 5 linhas:\n\n${recentHistoryText}`,
              history: [],
            }),
          });
          const memData = await memRes.json();
          const newMemory = cleanBotResponse(
            memData.reply || memData.response || memData.message || ""
          );
          if (newMemory) await updateMemory(newMemory);
        }
      }

      if (isFirstMessage && currentChatId) {
        const titleSource =
          finalInput.trim() || (pdfText ? `PDF: ${file?.name}` : "imagem");

        const titleHeaders = await getAuthHeaders();
        const titleRes = await fetch("/api/chat", {
          method: "POST",
          headers: titleHeaders,
          body: JSON.stringify({
            message: `Gere um título curto (máximo 5 palavras, sem aspas, sem pontuação no final) para uma conversa que começa com: "${titleSource.slice(0, 200)}"`,
            history: [],
          }),
        });
        const titleData = await titleRes.json();
        const rawTitle = cleanBotResponse(
          titleData.reply || titleData.response || titleData.message || ""
        );
        const title =
          rawTitle.split("\n")[0].trim().slice(0, 40) || "Nova conversa";

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === currentChatId ? { ...chat, title } : chat
          )
        );
        if (user)
          await supabase
            .from("chats")
            .update({ title })
            .eq("id", currentChatId);
      }
    } catch (err) {
      console.error("Erro no envio:", err);
      setMessages((prev) => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg && lastMsg.role === "bot")
          lastMsg.content =
            "Erro ao conectar com o servidor. Tente novamente! 🚀";
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    input, setInput, messages, loading, copiedId, chats, currentChatId,
    deleteConfirmId, setDeleteConfirmId, attachedFile, setAttachedFile,
    userMemory, bottomRef, textareaRef, handleCopy, handleShare,
    createNewChat, deleteChat, selectChat, sendMessage, signOut,
  };
}
