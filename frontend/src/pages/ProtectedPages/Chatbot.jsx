import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import { FaUser, FaRobot, FaMicrophone } from "react-icons/fa";

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🎤 VOICE STATE
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const user = useSelector((state) => state.auth.user.username);
  const bottomRef = useRef(null);

  // 🔽 auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // 👋 greeting
  useEffect(() => {
    if (user) {
      setChat([
        {
          sender: "bot",
          text: `Hey ${user} 👋\n\nI'm your finance assistant. Ask or speak 🎤`,
        },
      ]);
    }
  }, [user]);

  // 🎤 Speech recognition setup
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setMessage(transcript);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  // 🎤 toggle mic
  const toggleMic = () => {
    if (!recognitionRef.current) return;

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  // 💬 send message
  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { sender: "user", text: message };
    const updatedChat = [...chat, userMessage];

    setChat(updatedChat);
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:3000/api/v1/chat",
        { message },
        { withCredentials: true }
      );

      const botMessage = {
        sender: "bot",
        text: res.data.reply,
        summary: res.data.summary,
      };

      setChat([...updatedChat, botMessage]);
    } catch (error) {
      setChat([
        ...updatedChat,
        { sender: "bot", text: "Something went wrong 😢" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={{ marginBottom: "10px" }}>💬 Finance AI Assistant</h2>

      {/* CHAT BOX */}
      <div style={styles.chatBox}>
        {chat.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.row,
              justifyContent:
                msg.sender === "user" ? "flex-end" : "flex-start",
            }}
          >
            {msg.sender === "bot" && (
              <FaRobot style={styles.iconBot} />
            )}

            <div
              style={{
                ...styles.message,
                ...(msg.sender === "user"
                  ? styles.user
                  : styles.bot),
              }}
            >
              <ReactMarkdown>{msg.text}</ReactMarkdown>

              {msg.summary && (
                <div style={styles.card}>
                  💰 Income: {msg.summary.totalIncome} <br />
                  💸 Expense: {msg.summary.totalExpense} <br />
                  📊 Balance: {msg.summary.balance}
                </div>
              )}
            </div>

            {msg.sender === "user" && (
              <FaUser style={styles.iconUser} />
            )}
          </div>
        ))}

        {loading && (
          <div style={styles.row}>
            <FaRobot style={styles.iconBot} />
            <div style={{ ...styles.message, ...styles.bot }}>
              Typing...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div style={styles.inputBox}>
        <input
          type="text"
          placeholder="Ask or speak..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={styles.input}
        />

        {/* 🎤 MIC BUTTON */}
        <button
          onClick={toggleMic}
          style={{
            ...styles.button,
            background: listening ? "#ef4444" : "#3b82f6",
          }}
        >
          <FaMicrophone />
        </button>

        <button onClick={sendMessage} style={styles.button}>
          Send
        </button>
      </div>

      {listening && (
        <div style={{ fontSize: "12px", opacity: 0.7 }}>
          🎤 Listening...
        </div>
      )}
    </div>
  );
};

export default Chatbot;

// 🎨 Styles
const styles = {
  container: {
    width: "95%",
    maxWidth: "90%",
    height: "100dvh",
    margin: "0 auto",
    padding: "16px",
    background: "#0f172a",
    color: "white",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  chatBox: {
    flex: 1,
    overflowY: "auto",
    padding: "10px",
    background: "#1e293b",
    borderRadius: "10px",
    minHeight: 0, // 🔥 important for flex scrolling
  },
  row: {
    display: "flex",
    alignItems: "flex-end",
    margin: "10px 0",
  },
  message: {
    padding: "12px 16px",
    borderRadius: "14px",
    maxWidth: "85%", // 🔥 better for mobile
    wordBreak: "break-word", // 🔥 prevents overflow
    lineHeight: "1.5",
  },
  user: {
    background: "#3b82f6",
    borderBottomRightRadius: "4px",
  },
  bot: {
    background: "#10b981",
    borderBottomLeftRadius: "4px",
  },
  iconUser: {
    marginLeft: "8px",
  },
  iconBot: {
    marginRight: "8px",
  },
  inputBox: {
    display: "flex",
    gap: "8px",
    marginTop: "10px",
    alignItems: "center",
    flexWrap: "nowrap", // ❌ IMPORTANT: stop wrapping
    width: "100%",
  },
  input: {
    flex: 1,
    minWidth: 0,
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#020617",
    color: "white",
    outline: "none",
  },
  button: {
    flexShrink: 0, // ❌ prevents disappearing
    padding: "12px 14px",
    borderRadius: "8px",
    border: "none",
    background: "#3b82f6",
    color: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    marginTop: "10px",
    padding: "10px",
    borderRadius: "8px",
    background: "rgba(0,0,0,0.2)",
    fontSize: "14px",
  },
};