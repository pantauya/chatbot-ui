import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { useParams } from "react-router";
import { ChatMessage } from "~/components/ChatMessage";
import { ThoughtMessage } from "~/components/ThoughtMessage";
import { Button } from "~/components/button";
import { Textarea } from "~/components/textarea";
import { Loader2 } from "lucide-react";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';


const ChatDashboard = () => {
  const [textInput, setTextInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [streamedThought] = useState("");
  const [streamedMessage] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [pendingThreadId, setPendingThreadId] = useState<string | null>(null);

  const scrollToBottomRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const navigate = useNavigate();


  const fetchMessages = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/messages?threadId=${params.threadId}`);
      const data = await res.json();
      console.log("Messages fetched:", data); // Tambahkan log untuk memeriksa data
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  useEffect(() => {
    if (params.threadId) {
      setIsThinking(false); // Reset isThinking saat ganti thread
      fetchMessages();
    }
  }, [params.threadId]);

  useEffect(() => {
    if (!streamedThought && !streamedMessage) {
      setIsThinking(false);
    }
  }, [streamedThought, streamedMessage]);

  useEffect(() => {
    if (pendingThreadId && params.threadId !== pendingThreadId) {
      // Tampilkan notifikasi atau banner bahwa jawaban telah tersedia
      toast.info(
        <div>
          <p>Jawaban di ruang chat sebelumnya sudah tersedia.</p>
          <button
            onClick={() => {
              navigate(`/thread/${pendingThreadId}`);
              setPendingThreadId(null); // Reset pendingThreadId
            }}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '5px 10px',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px',
            }}
          >
            Lihat
          </button>
        </div>,
        {
          position: "bottom-center",
          autoClose: 5000,
        }
      );
    } else {
      setPendingThreadId(null); // Clear pendingThreadId setelah selesai
    }
  }, [messages, pendingThreadId, params.threadId, navigate]);
  
  

  const handleSubmit = async () => {
    if (!textInput.trim()) return;
  
    const threadId = params.threadId ?? null;
    setPendingThreadId(threadId);
  
    // Menambahkan pesan baru yang dikirim ke frontend
    const newMessage = {
      role: "user",
      content: textInput.trim(),
      thought: null,  // Atau sesuaikan sesuai dengan struktur yang diinginkan
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  
    // Reset input text setelah submit
    setTextInput(""); 
  
    setIsThinking(true);
  
    try {
      const response = await fetch("http://localhost:8080/api/v1/llm/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: textInput.trim(),
          threadId: params.threadId,
        }),
      });
  
      const data = await response.json();
  
      // Tambahkan langsung ke messages
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          thought: data.thought,
        },
      ]);
  
      // Setelah selesai submit, fetch semua messages baru
      await fetchMessages();
  
      // Kosongkan input setelah pesan selesai dikirim
      setTextInput("");
      setIsThinking(false); // ✅ Tambahkan ini
  
    } catch (error) {
      console.error("Error sending message:", error);
      setIsThinking(false);
    }
  };
  

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(event.target.value);
  };

  const handleScrollToBottom = () => {
    scrollToBottomRef.current?.scrollIntoView();
  };

  useLayoutEffect(() => {
    handleScrollToBottom();
  }, [messages, streamedMessage, streamedThought]);

  return (
    <div className="flex flex-col flex-1 border m-2 rounded-xl bg-chart-2">
      <header className="flex items-center p-4 h-16 border-b rounded-t-xl">
        <h1 className="text-xl font-bold ml-4">Chat Dashboard BPS</h1>
      </header>
      <main className="flex-1 overflow-auto p-4 w-full relative">
        <div className="mx-auto space-y-4 pb-20 max-w-screen-md">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
              thought={message.thought}
            />
          ))}

          {streamedThought && <ThoughtMessage thought={streamedThought} />}

          {streamedMessage && (
            <ChatMessage role="ASSISTANT" content={streamedMessage} />
          )}

          {isThinking && (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="animate-spin" size={20} />
              Thinking...
            </div>
          )}

          <div ref={scrollToBottomRef}></div>
        </div>
      </main>
      <footer className="p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Textarea
            className="flex-1 text-3xl font-medium"
            placeholder="Ajukan pertanyaan tentang regulasi BPS..."
            rows={5}
            onChange={handleTextareaChange}
            value={textInput}
          />
          <Button onClick={handleSubmit} type="button" variant={"outline"}>
            Send
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default ChatDashboard;
