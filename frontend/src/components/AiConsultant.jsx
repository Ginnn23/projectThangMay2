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

function formatAiMessage(text) {
  if (!text) return "";
  const lines = text.split("\n");

  return lines.map((line, index) => {
    let formatted = line;
    // Replace bold **text**
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
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "model",
      text: "Dạ, em chào anh/chị! Em là trợ lý kỹ thuật của Thang Máy Hà Hồng 🏢\n\nAnh/chị đang cần tư vấn kích thước hố thang, tải trọng hay báo giá dòng thang nào cho công trình của mình ạ?",
      suggestions: cauHoiKhoiTao
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [hasNewPrompt, setHasNewPrompt] = useState(true);
  const messagesEndRef = useRef(null);
  const lastSentRef = useRef({ text: "", time: 0 });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasNewPrompt(false);
    }
  }, [isOpen, messages, loading]);

  // Bộ đếm thời gian cooldown chống spam
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    let active = true;
    apiClient
      .get("/chat/init")
      .then((res) => {
        if (!active || !res?.data) return;
        const { greeting, suggestions } = res.data;
        if (greeting) {
          setMessages((prev) => {
            if (prev.length === 1 && prev[0].id === "welcome") {
              return [
                {
                  id: "welcome",
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
      .catch(() => {
        // Fallback mặc định đã có sẵn trong state
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSend = async (messageToSend) => {
    const text = (messageToSend || inputValue).trim();
    if (!text || loading || cooldown > 0) return;

    // Chặn gửi tin nhắn giống hệt nhau liên tiếp trong vòng 4 giây (chống spam phím)
    const now = Date.now();
    if (text === lastSentRef.current.text && now - lastSentRef.current.time < 4000) {
      return;
    }
    lastSentRef.current = { text, time: now };

    setInputValue("");
    setCooldown(2); // Kích hoạt 2 giây giãn cách giữa các tin nhắn
    const userMsg = { id: `user-${Date.now()}`, role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Chuẩn bị lịch sử hội thoại gửi lên backend
    const history = messages
      .filter((m) => m.id !== "welcome")
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

      setMessages((prev) => [...prev, modelMsg]);
    } catch {
      const errorMsg = {
        id: `error-${Date.now()}`,
        role: "model",
        text: `Dạ, hiện tại em chưa kết nối được máy chủ kỹ thuật. Anh/chị có thể gọi trực tiếp Hotline 24/7: **${soDienThoaiCongTy}** để kỹ sư Hà Hồng hỗ trợ tư vấn ngay ạ! 📞`,
        suggestions: ["Gọi điện tư vấn 24/7", "Xem danh sách dịch vụ"]
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading && cooldown === 0) {
        handleSend();
      }
    }
  };

  return (
    <aside className="ai-consultant-root" aria-label="AI Tư vấn Thang Máy">
      {/* Nút bấm mở chat nổi ở góc phải màn hình */}
      {!isOpen && (
        <button
          type="button"
          className="ai-chat-launcher"
          onClick={() => setIsOpen(true)}
          aria-label="Mở cửa sổ AI tư vấn thang máy"
        >
          <div className="ai-launcher-avatar">
            <img src={logoHaHong} alt="Thang Máy Hà Hồng" />
            <span className="ai-online-dot" />
          </div>
          <div className="ai-launcher-text">
            <strong>AI Kỹ thuật</strong>
            <small>Tư vấn 24/7</small>
          </div>
          {hasNewPrompt && <span className="ai-launcher-badge">1</span>}
        </button>
      )}

      {/* Cửa sổ Chat */}
      {isOpen && (
        <div className="ai-chat-window" role="dialog" aria-modal="false" aria-label="Khung chat tư vấn thang máy">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-brand">
              <div className="ai-chat-avatar-wrap">
                <img src={logoHaHong} alt="Logo Hà Hồng" />
                <span className="ai-header-dot" />
              </div>
              <div>
                <h3>Hà Hồng AI Consultant</h3>
                <p>
                  <i className="bi bi-patch-check-fill text-warning me-1"></i>
                  Kỹ sư tư vấn trực tuyến 24/7
                </p>
              </div>
            </div>
            <div className="ai-chat-header-actions">
              <a
                href={`tel:${soDienThoaiLienKet}`}
                className="ai-chat-call-btn"
                title={`Gọi ${soDienThoaiCongTy}`}
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

          {/* Body tin nhắn */}
          <div className="ai-chat-body">
            <div className="ai-chat-announcement">
              <i className="bi bi-shield-check"></i>
              <span>Tư vấn kích thước hố thang, tải trọng và gửi báo giá sơ bộ miễn phí.</span>
            </div>

            {messages.map((m) => (
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
                          onClick={() => handleSend(s)}
                          disabled={loading}
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

            {loading && (
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
                placeholder={cooldown > 0 ? `Vui lòng đợi ${cooldown}s...` : "Nhập câu hỏi hoặc SĐT để nhận báo giá..."}
                aria-label="Nội dung chat"
                maxLength={400}
                disabled={loading || cooldown > 0}
              />
              <button
                type="button"
                className="ai-send-btn"
                onClick={() => handleSend()}
                disabled={loading || cooldown > 0 || !inputValue.trim()}
                aria-label="Gửi tin nhắn"
                title={cooldown > 0 ? `Vui lòng đợi ${cooldown}s` : "Gửi"}
              >
                {cooldown > 0 ? (
                  <span style={{ fontSize: "12px", fontWeight: "bold" }}>{cooldown}s</span>
                ) : (
                  <i className="bi bi-send-fill"></i>
                )}
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
