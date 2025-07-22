import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import UserNavbar from "../components/UserNavbar";
import TrabahadorNavbar from "../components/TrabahadorNavbar";
import Footer from "../components/Footer";
import "../styles/BookingSystem.css";

const ChatPage = () => {
  const { bookingId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const [isUser, setIsUser] = useState(null); // null, true (user), or false (worker)
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [token, setToken] = useState(null);
  const chatBoxRef = useRef(null);
  const stompClientRef = useRef(null);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  // useEffect 1: Fetch token and determine entity type
  useEffect(() => {
    const fetchToken = async () => {
      console.log("ChatPage: Starting token fetch process...");
      let workerToken = null;
      let userToken = null;

      // Try worker token
      try {
        console.log("ChatPage: Attempting to fetch worker token...");
        const workerResponse = await axios.get(`${BACKEND_URL}/api/worker/get-token`, {
          withCredentials: true,
        });
        console.log("ChatPage: Worker response:", workerResponse.data);
        if (workerResponse.data.token) {
          workerToken = workerResponse.data.token;
          console.log("ChatPage: Fetched worker token:", workerToken.substring(0, 10) + "...");
        }
      } catch (err) {
        console.log("ChatPage: Worker token fetch failed:", err.response?.data || err.message);
      }

      // Try user token
      try {
        console.log("ChatPage: Attempting to fetch user token...");
        const userResponse = await axios.get(`${BACKEND_URL}/api/user/get-token`, {
          withCredentials: true,
        });
        console.log("ChatPage: User response:", userResponse.data);
        if (userResponse.data.token) {
          userToken = userResponse.data.token;
          console.log("ChatPage: Fetched user token:", userToken.substring(0, 10) + "...");
        }
      } catch (err) {
        console.log("ChatPage: User token fetch failed:", err.response?.data || err.message);
      }

      // Determine entity type
      if (workerToken && !userToken) {
        console.log("ChatPage: Only worker token found, setting isUser to false");
        setToken(workerToken);
        setIsUser(false);
        setLoading(false);
      } else if (userToken && !workerToken) {
        console.log("ChatPage: Only user token found, setting isUser to true");
        setToken(userToken);
        setIsUser(true);
        setLoading(false);
      } else if (workerToken && userToken) {
        console.warn("ChatPage: Both worker and user tokens found, defaulting to user");
        console.log("ChatPage: Worker token:", workerToken.substring(0, 10) + "...");
        console.log("ChatPage: User token:", userToken.substring(0, 10) + "...");
        setToken(userToken);
        setIsUser(true);
        setLoading(false);
        setError("Warning: Account exists as both user and worker. Using user account.");
      } else {
        console.log("ChatPage: No valid token found, redirecting to login...");
        setError("Please log in to access the chat.");
        setLoading(false);
        setIsUser(null);
        navigate("/login");
      }
    };

    fetchToken();
  }, [navigate]);

  // useEffect 2: Fetch initial messages
  useEffect(() => {
    if (!token || isUser === null) return;

    const fetchMessages = async () => {
      try {
        console.log(`ChatPage: Fetching messages for booking ${bookingId}, isUser: ${isUser}`);
        const response = await axios.get(`${BACKEND_URL}/api/message/booking/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        console.log("ChatPage: Fetched messages:", response.data);
        // Map DTOs to frontend message format
        setMessages(response.data.map(dto => ({
          id: dto.id,
          bookingId: dto.bookingId,
          content: dto.content,
          sentAt: dto.sentAt,
          senderUser: dto.senderUserId != null
        })));
      } catch (err) {
        const errorMessage =
          err.response?.data.replace("⚠️ ", "") ||
          "Failed to fetch messages. Please try again.";
        console.error("ChatPage: Failed to fetch messages:", err.response?.data, err.message);
        setError(errorMessage);
      }
    };

    fetchMessages();
  }, [bookingId, token, isUser]);

  // useEffect 3: Set up WebSocket connection
  useEffect(() => {
    if (isUser === null || !token) return;

    const connectWebSocket = () => {
      try {
        console.log("ChatPage: Initializing WebSocket...");
        const socket = new SockJS(`${BACKEND_URL}/chat`);
        stompClientRef.current = new Client({
          webSocketFactory: () => socket,
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          debug: (str) => {
            console.log("ChatPage STOMP Debug:", str);
          },
        });

        stompClientRef.current.onConnect = (frame) => {
          console.log("ChatPage: Connected to WebSocket:", frame);
          setConnected(true);
          stompClientRef.current.subscribe(`/topic/booking/${bookingId}`, (message) => {
            try {
              const newMessage = JSON.parse(message.body);
              console.log("ChatPage: Received message:", newMessage);
              setMessages((prev) => {
                if (prev.some((msg) => msg.id === newMessage.id)) {
                  return prev;
                }
                // Adapt DTO to frontend message format
                return [...prev, {
                  id: newMessage.id,
                  bookingId: newMessage.bookingId,
                  content: newMessage.content,
                  sentAt: newMessage.sentAt,
                  senderUser: newMessage.senderUserId != null
                }];
              });
            } catch (err) {
              console.error("ChatPage: Failed to parse message:", err, message.body);
              setError("Received invalid message from server.");
            }
          });
        };

        stompClientRef.current.onStompError = (frame) => {
          console.error("ChatPage: WebSocket error:", frame);
          let errorMessage = "Failed to connect to chat. Retrying...";
          if (frame.headers && frame.headers.message) {
            errorMessage = `Chat error: ${frame.headers.message}`;
          }
          setError(errorMessage);
          setConnected(false);
        };

        stompClientRef.current.onWebSocketClose = () => {
          console.log("ChatPage: WebSocket closed");
          setError("Chat disconnected. Please try again.");
          setConnected(false);
        };

        console.log("ChatPage: Activating WebSocket with token:", token.substring(0, 10) + "...");
        stompClientRef.current.activate();
      } catch (err) {
        console.error("ChatPage: Failed to initialize WebSocket:", err);
        setError("Failed to initialize chat. Please try again.");
      }
    };

    connectWebSocket();

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        console.log("ChatPage: Disconnected from WebSocket");
      }
    };
  }, [bookingId, isUser, token]);

  // useEffect 4: Auto-scroll to latest message
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // useEffect 5: Log isUser state changes for debugging
  useEffect(() => {
    console.log("ChatPage: isUser state changed:", isUser);
  }, [isUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) {
      setError("Message cannot be empty.");
      return;
    }
    if (!connected || !stompClientRef.current) {
      // Fallback to REST if WebSocket is not connected
      try {
        console.log("ChatPage: Sending message via REST:", { bookingId, content: newMessage });
        const response = await axios.post(
          `${BACKEND_URL}/api/message/send`,
          {
            bookingId: parseInt(bookingId),
            content: newMessage,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        // Adapt DTO to frontend message format
        setMessages((prev) => [...prev, {
          id: response.data.id,
          bookingId: response.data.bookingId,
          content: response.data.content,
          sentAt: response.data.sentAt,
          senderUser: response.data.senderUserId != null
        }]);
        setNewMessage("");
        setError("");
      } catch (err) {
        const errorMessage =
          err.response?.data.replace("⚠️ ", "") ||
          "Failed to send message. Please try again.";
        console.error("ChatPage: Failed to send message via REST:", err.response?.data, err.message);
        setError(errorMessage);
      }
      return;
    }

    try {
      console.log("ChatPage: Publishing message:", { bookingId: parseInt(bookingId), content: newMessage });
      stompClientRef.current.publish({
        destination: `/app/chat/${bookingId}`,
        body: JSON.stringify({
          bookingId: parseInt(bookingId),
          content: newMessage,
        }),
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewMessage("");
      setError("");
    } catch (err) {
      console.error("ChatPage: Failed to send message via WebSocket:", err);
      setError("Failed to send message. Please try again or use a different booking.");
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div>Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !messages.length && !connected) {
    return (
      <div className="page-container">
        {isUser !== null && (isUser ? <UserNavbar activePage="booking-history" /> : <TrabahadorNavbar activePage="history" />)}
        <div className="content-container">
          <div className="error-message">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-container">
      {isUser !== null && (isUser ? <UserNavbar activePage="booking-history" /> : <TrabahadorNavbar activePage="history" />)}
      <div className="content-container">
        <div className="chat-card card">
          <h2>Chat for Booking #{bookingId}</h2>
          {!connected && <div className="error-message">Connecting to chat...</div>}
          {error && <div className="error-message">{error}</div>}
          <div className="chat-box" ref={chatBoxRef}>
            {messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat-message ${message.senderUser ? "user" : "worker"}`}
                >
                  <div className="chat-message-content">
                    {message.content}
                    <div className="chat-message-timestamp">
                      {new Date(message.sentAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No messages yet.</p>
            )}
          </div>
          <form className="chat-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={!connected}
            />
            <button type="submit" disabled={!connected}>
              Send
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ChatPage;