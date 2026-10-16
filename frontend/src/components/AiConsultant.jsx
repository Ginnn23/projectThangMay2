import { useEffect, useRef, useState } from "react";
import { apiClient } from "../api/client";
import logoHaHong from "../assets/images/logo-ha-hong.jpg";
import { soDienThoaiCongTy, soDienThoaiLienKet } from "../data/contactInfo";

const cauHoiKhoiTao = [
  "Báo giá thang máy gia đình 4 tầng",
  "Tư vấn kích thước hố thang nhỏ nhất",
  "Nên chọn thang kính hay thang inox?",
  "Chính sách bảo trì và bảo hành"
];

function getOrCreateSessionId() {
  let sid = localStorage.getItem("hahong_livechat_session");
  if (!sid) {
    sid = "vis_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6);
    localStorage.setItem("hahong_livechat_session", sid);
  }
  return sid;
}

function formatAiMessage(text) {
  if (!text) return "";
  const lines = text.split("\n");

  return lines.map((line, index) => {
    let formatted = line;
    const parts = [];
    const regex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      parts.push(<strong key={match.index}>{match[1]}</strong>);
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return (
      <span key={index} className="ai-chat-line">
        {parts.length > 0 ? parts : formatted}
        {index < lines.length - 1 && <br />}
      </span>
    );
  });
}

function AiConsultant() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMode, setChatMode] = useState("live"); // "live" (Kỹ sư Hà Hồng qua Telegram) | "ai" (Trợ lý AI Gemini)
  
  // Live Chat state
  const [sessionId] = useState(getOrCreateSessionId);
  const [liveMessages, setLiveMessages] = useState([]);
  const [customerName, setCustomerName] = useState(() => localStorage.getItem("hahong_chat_name") || "");
  const [customerPhone, setCustomerPhone] = useState(() => localStorage.getItem("hahong_chat_phone") || "");
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [liveSending, setLiveSending] = useState(false);

  // AI Chat state
  const [aiMessages, setAiMessages] = useState([
    {
      id: "welcome-ai",
      role: "model",
      text: "Dạ, em chào anh/chị! Em là trợ lý kỹ thuật của Thang Máy Hà Hồng 🏢\n\nAnh/chị đang cần tư vấn kích thước hố thang, tải trọng hay báo giá dòng thang nào cho công trình của mình ạ?",
      suggestions: cauHoiKhoiTao
    }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  const [inputValue, setInputValue] = useState("");
  const [hasNewPrompt, setHasNewPrompt] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasNewPrompt(false);
    }
  }, [isOpen, liveMessages, aiMessages, chatMode]);

  // Load Live Chat history initially
  const fetchLiveHistory = async (afterId = null) => {
    try {
      const url = afterId
        ? `/livechat/history?sessionId=${sessionId}&afterId=${afterId}`
        : `/livechat/history?sessionId=${sessionId}`;
      const res = await apiClient.get(url);
      const data = res?.data || [];

      if (!afterId) {
        if (data.length === 0) {
          // Add default live welcome message
          setLiveMessages([
            {
              id: "welcome-live",
              sender: "agent",
              senderName: "Kỹ sư Thang Máy Hà Hồng",
              message: "Dạ, em chào anh/chị! Kỹ sư kỹ thuật Thang Máy Hà Hồng đang trực tuyến 🟢.\n\nAnh/chị đang quan tâm dòng thang nào hoặc cần tư vấn kích thước hố thang cho công trình, anh/chị cứ nhắn tại đây, em sẽ phản hồi ngay qua Telegram nhé!",
              createdAt: new Date().toISOString()
            }
          ]);
        } else {
          setLiveMessages(data);
        }
      } else if (data.length > 0) {
        setLiveMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newItems = data.filter((m) => !existingIds.has(m.id));
          if (newItems.length === 0) return prev;
          return [...prev, ...newItems];
        });
      }
    } catch {
      // ignore network errors
    }
  };

  // Initial load when open
  useEffect(() => {
    if (isOpen && chatMode === "live") {
      fetchLiveHistory();
    }
  }, [isOpen, chatMode, sessionId]);

  // Polling for live messages when chat window is open
  useEffect(() => {
    if (!isOpen || chatMode !== "live") return undefined;

    const interval = setInterval(() => {
      const lastMsg = liveMessages[liveMessages.length - 1];
      const afterId = typeof lastMsg?.id === "number" ? lastMsg.id : null;
      fetchLiveHistory(afterId);
    }, 2500);

    return () => clearInterval(interval);
  }, [isOpen, chatMode, liveMessages, sessionId]);

  // Fetch AI initial prompt
  useEffect(() => {
    let active = true;
    apiClient
      .get("/chat/init")
      .then((res) => {
        if (!active || !res?.data) return;
        const { greeting, suggestions } = res.data;
        if (greeting) {
          setAiMessages((prev) => {
            if (prev.length === 1 && prev[0].id === "welcome-ai") {
              return [
                {
                  id: "welcome-ai",
                  role: "model",
                  text: greeting,
                  suggestions: suggestions?.length ? suggestions : cauHoiKhoiTao,
                },
              ];
            }
            return prev;
          });
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const handleSaveContactInfo = async (e) => {
    e?.preventDefault();
    if (!customerPhone.trim()) return;

    localStorage.setItem("hahong_chat_phone", customerPhone.trim());
    if (customerName.trim()) {
      localStorage.setItem("hahong_chat_name", customerName.trim());
    }

    try {
      await apiClient.post("/livechat/customer-info", {
        sessionId,
        fullName: customerName.trim() || undefined,
        phoneNumber: customerPhone.trim()
      });
      setPhoneSaved(true);
      setShowPhonePrompt(false);
    } catch {
      setShowPhonePrompt(false);
    }
  };

  const handleSend = async (messageToSend) => {
    const text = (messageToSend || inputValue).trim();
    if (!text) return;

    setInputValue("");

    if (chatMode === "live") {
      // Send to Live Chat (Telegram Bridge)
      setLiveSending(true);
      const tempId = Date.now();
      const optimisticMsg = {
        id: tempId,
        sessionId,
        sender: "customer",
        senderName: customerName || "Khách",
        message: text,
        createdAt: new Date().toISOString()
      };

      setLiveMessages((prev) => [...prev, optimisticMsg]);

      try {
        const res = await apiClient.post("/livechat/send", {
          sessionId,
          senderName: customerName || undefined,
          customerPhone: customerPhone || undefined,
          message: text,
          pageUrl: window.location.pathname
        });

        if (res?.data?.id) {
          setLiveMessages((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, id: res.data.id } : m))
          );
        }
      } catch {
        // error handling
      } finally {
        setLiveSending(false);
      }
    } else {
      // Send to Gemini AI
      if (aiLoading) return;
      const userMsg = { id: `user-${Date.now()}`, role: "user", text };
      setAiMessages((prev) => [...prev, userMsg]);
      setAiLoading(true);

      const history = aiMessages
        .filter((m) => m.id !== "welcome-ai")
        .map((m) => ({
          role: m.role === "model" ? "model" : "user",
          text: m.text
        }));

      try {
        const response = await apiClient.post("/chat/consult", {
          message: text,
          history
        });

        const replyData = response.data;
        const modelMsg = {
          id: `model-${Date.now()}`,
          role: "model",
          text: replyData.reply,
          suggestions: replyData.suggestedQuestions || []
        };

        setAiMessages((prev) => [...prev, modelMsg]);
      } catch {
        const errorMsg = {
          id: `error-${Date.now()}`,
          role: "model",
          text: `Dạ, hiện tại em chưa kết nối được máy chủ kỹ thuật. Anh/chị có thể chuyển sang tab **Kỹ sư Hà Hồng** hoặc gọi Hotline 24/7: **${soDienThoaiCongTy}** để được hỗ trợ ngay ạ! 📞`,
          suggestions: ["Chat với Kỹ sư Hà Hồng", "Gọi điện tư vấn 24/7"]
        };
        setAiMessages((prev) => [...prev, errorMsg]);
      } finally {
        setAiLoading(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <aside className="ai-chat-root" aria-label="Tư vấn Thang Máy Hà Hồng">
      {/* Nút bấm mở khung chat */}
      <button
        type="button"
        className={`ai-chat-launcher ${isOpen ? "is-open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Đóng chat" : "Chat với Kỹ sư Hà Hồng"}
      >
        <span className="ai-launcher-avatar">
          <img src={logoHaHong} alt="Hà Hồng" />
          <span className="live-dot-pulse" title="Kỹ sư đang trực tuyến qua Telegram" />
        </span>
        <span className="ai-launcher-label">
          <strong>Kỹ sư Hà Hồng</strong>
          <span>Live Chat 24/7</span>
        </span>
        {hasNewPrompt && !isOpen && <span className="ai-launcher-badge">1</span>}
      </button>

      {/* Cửa sổ chat */}
      {isOpen && (
        <div className="ai-chat-window" role="dialog" aria-labelledby="live-chat-heading">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-brand">
              <div className="ai-chat-avatar-wrap">
                <img src={logoHaHong} alt="Thang Máy Hà Hồng" />
                <span className="ai-header-dot" />
              </div>
              <div>
                <h3 id="live-chat-heading">Thang Máy Hà Hồng</h3>
                <p>
                  <span className="live-status-pill me-1">🟢 Trực tuyến</span>
                  <span>{chatMode === "live" ? "Kỹ sư phản hồi qua Telegram" : "Trợ lý kỹ thuật AI"}</span>
                </p>
              </div>
            </div>

            <div className="ai-chat-header-actions">
              <a
                href={`tel:${soDienThoaiLienKet}`}
                className="ai-chat-call-btn"
                title={`Gọi hotline ${soDienThoaiCongTy}`}
                aria-label="Gọi điện trực tiếp"
              >
                <i className="bi bi-telephone-fill"></i>
              </a>
              <button
                type="button"
                className="ai-chat-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Đóng khung chat"
              >
                <i className="bi bi-dash-lg"></i>
              </button>
            </div>
          </div>

          {/* Chuyển đổi 2 chế độ: Kỹ sư Telegram & Trợ lý AI */}
          <div className="live-chat-mode-tabs">
            <button
              type="button"
              className={`live-chat-tab-btn ${chatMode === "live" ? "active" : ""}`}
              onClick={() => setChatMode("live")}
            >
              <i className="bi bi-person-workspace me-1 text-warning"></i>
              <strong>Kỹ sư Hà Hồng</strong>
              <span className="live-tag">Trực tiếp</span>
            </button>
            <button
              type="button"
              className={`live-chat-tab-btn ${chatMode === "ai" ? "active" : ""}`}
              onClick={() => setChatMode("ai")}
            >
              <i className="bi bi-robot me-1 text-info"></i>
              <span>Trợ lý AI 24/7</span>
            </button>
          </div>

          {/* Thông báo chế độ Live Chat */}
          {chatMode === "live" && (
            <div className="live-chat-status-bar">
              <div className="d-flex align-items-center justify-content-between">
                <span>
                  <i className="bi bi-telegram text-primary me-1"></i>
                  Kết nối trực tiếp tới <strong>Kỹ sư trực tổng đài Telegram</strong>
                </span>
                {!phoneSaved && (
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-decoration-none fw-bold text-primary"
                    onClick={() => setShowPhonePrompt(!showPhonePrompt)}
                  >
                    {showPhonePrompt ? "Đóng" : "Để lại SĐT"}
                  </button>
                )}
              </div>

              {/* Form nhanh nhập SĐT */}
              {showPhonePrompt && !phoneSaved && (
                <form className="live-chat-phone-form mt-2" onSubmit={handleSaveContactInfo}>
                  <div className="d-flex gap-1">
                    <input
                      type="tel"
                      placeholder="Số điện thoại của bạn..."
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="form-control form-control-sm"
                      autoFocus
                    />
                    <button type="submit" className="btn btn-primary btn-sm px-2">
                      Lưu
                    </button>
                  </div>
                  <small className="text-muted" style={{ fontSize: "11px" }}>
                    Kỹ sư sẽ gọi lại ngay nếu bạn cần rời trang.
                  </small>
                </form>
              )}
            </div>
          )}

          {/* Body tin nhắn */}
          <div className="ai-chat-body">
            {chatMode === "live" ? (
              // HIỂN THỊ TIN NHẮN LIVE CHAT (TELEGRAM BRIDGE)
              <>
                {liveMessages.map((m) => {
                  const isUser = m.sender === "customer";
                  return (
                    <div key={m.id} className={`ai-message-row ${isUser ? "user-row" : "model-row"}`}>
                      {!isUser && (
                        <div className="ai-msg-avatar">
                          <img src={logoHaHong} alt="Kỹ sư" />
                        </div>
                      )}
                      <div className={`ai-msg-bubble ${!isUser ? "live-engineer-bubble" : ""}`}>
                        {!isUser && (
                          <div className="live-engineer-badge">
                            <i className="bi bi-patch-check-fill text-warning me-1"></i>
                            <strong>{m.senderName || "Kỹ sư Thang Máy Hà Hồng"}</strong>
                            <span className="live-badge-tele">Telegram Verified</span>
                          </div>
                        )}
                        <div className="ai-msg-content">{formatAiMessage(m.message)}</div>
                        <div className="live-msg-time">
                          {m.createdAt ? new Date(m.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : ""}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {liveSending && (
                  <div className="text-end pe-2">
                    <small className="text-muted fst-italic" style={{ fontSize: "11px" }}>
                      <i className="bi bi-arrow-up-right-circle me-1"></i> Đang gửi tới Kỹ sư Hà Hồng qua Telegram...
                    </small>
                  </div>
                )}
              </>
            ) : (
              // HIỂN THỊ TIN NHẮN TRỢ LÝ AI (GEMINI)
              <>
                <div className="ai-chat-announcement">
                  <i className="bi bi-shield-check"></i>
                  <span>Trợ lý AI tư vấn kích thước hố thang, tải trọng và giải đáp nhanh 24/7.</span>
                </div>

                {aiMessages.map((m) => (
                  <div key={m.id} className={`ai-message-row ${m.role === "user" ? "user-row" : "model-row"}`}>
                    {m.role === "model" && (
                      <div className="ai-msg-avatar">
                        <img src={logoHaHong} alt="AI" />
                      </div>
                    )}
                    <div className="ai-msg-bubble">
                      <div className="ai-msg-content">{formatAiMessage(m.text)}</div>
                      {m.suggestions && m.suggestions.length > 0 && (
                        <div className="ai-suggestions-wrap">
                          {m.suggestions.map((s, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className="ai-suggestion-chip"
                              onClick={() => {
                                if (s.includes("Kỹ sư") || s.includes("Chat với")) {
                                  setChatMode("live");
                                } else {
                                  handleSend(s);
                                }
                              }}
                              disabled={aiLoading}
                            >
                              {s}
                              <i className="bi bi-arrow-up-right ms-1"></i>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {aiLoading && (
                  <div className="ai-message-row model-row">
                    <div className="ai-msg-avatar">
                      <img src={logoHaHong} alt="AI" />
                    </div>
                    <div className="ai-msg-bubble ai-typing-bubble">
                      <span className="ai-typing-dot"></span>
                      <span className="ai-typing-dot"></span>
                      <span className="ai-typing-dot"></span>
                    </div>
                  </div>
                )}
              </>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div className="ai-chat-footer">
            <div className="ai-input-wrap">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  chatMode === "live"
                    ? "Nhập câu hỏi để chat với Kỹ sư Hà Hồng..."
                    : "Nhập câu hỏi hoặc SĐT để nhận báo giá..."
                }
                aria-label="Nội dung chat"
                disabled={chatMode === "live" ? liveSending : aiLoading}
              />
              <button
                type="button"
                className="ai-send-btn"
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || (chatMode === "live" ? liveSending : aiLoading)}
                aria-label="Gửi tin nhắn"
              >
                <i className="bi bi-send-fill"></i>
              </button>
            </div>
            <div className="ai-chat-quick-note">
              <span>Hotline kỹ thuật: <a href={`tel:${soDienThoaiLienKet}`}>{soDienThoaiCongTy}</a></span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default AiConsultant;
