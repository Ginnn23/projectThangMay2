import { useEffect, useState } from "react";
import { apiClient } from "../api/client";

const defaultKbForm = {
  id: "",
  question: "",
  keywords: "",
  answer: ""
};

export default function AiTrainingAdmin({ onShowToast }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    systemPrompt: "",
    customApiKey: "",
    defaultGreeting: "",
    knowledgeBase: []
  });

  const [activeSubTab, setActiveSubTab] = useState("knowledge"); // "knowledge" | "persona" | "test"
  const [kbForm, setKbForm] = useState(defaultKbForm);
  const [editingKbId, setEditingKbId] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // Test Chat Sandbox
  const [testInput, setTestInput] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testMessages, setTestMessages] = useState([
    {
      role: "model",
      text: "Dạ, em chào anh/chị! Đây là môi trường thử nghiệm AI trực tiếp. Anh/chị hãy hỏi thử các câu hỏi vừa dạy xem em đã trả lời đúng ý chưa nhé! 😊"
    }
  ]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/chat/admin/training");
      setSettings(data || {
        systemPrompt: "",
        customApiKey: "",
        defaultGreeting: "",
        knowledgeBase: []
      });
    } catch {
      onShowToast?.("Không thể tải cấu hình AI. Vui lòng thử lại sau.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveAll = async (customPayload) => {
    setSaving(true);
    try {
      const payloadToSend = customPayload || settings;
      const { data } = await apiClient.put("/chat/admin/training", payloadToSend);
      setSettings(data);
      onShowToast?.("Đã lưu và cập nhật bài học cho AI thành công!", "success");
    } catch {
      onShowToast?.("Lỗi khi lưu bài học cho AI.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveKbItem = (e) => {
    e.preventDefault();
    if (!kbForm.question.trim() || !kbForm.answer.trim()) {
      onShowToast?.("Vui lòng nhập cả câu hỏi và câu trả lời để dạy AI.", "error");
      return;
    }

    let updatedList;
    if (editingKbId) {
      updatedList = settings.knowledgeBase.map((item) =>
        item.id === editingKbId ? { ...kbForm, id: editingKbId } : item
      );
    } else {
      const newItem = {
        ...kbForm,
        id: `kb-${Date.now()}`
      };
      updatedList = [newItem, ...(settings.knowledgeBase || [])];
    }

    const nextSettings = { ...settings, knowledgeBase: updatedList };
    setSettings(nextSettings);
    setKbForm(defaultKbForm);
    setEditingKbId(null);

    // Tự động lưu luôn vào database
    handleSaveAll(nextSettings);
  };

  const handleEditKbItem = (item) => {
    setEditingKbId(item.id);
    setKbForm({
      id: item.id,
      question: item.question || "",
      keywords: item.keywords || "",
      answer: item.answer || ""
    });
    window.scrollTo({ top: 150, behavior: "smooth" });
  };

  const handleDeleteKbItem = (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài học này khỏi bộ nhớ của AI?")) return;
    const updatedList = settings.knowledgeBase.filter((item) => item.id !== id);
    const nextSettings = { ...settings, knowledgeBase: updatedList };
    setSettings(nextSettings);
    if (editingKbId === id) {
      setKbForm(defaultKbForm);
      setEditingKbId(null);
    }
    handleSaveAll(nextSettings);
  };

  const handleCancelEdit = () => {
    setEditingKbId(null);
    setKbForm(defaultKbForm);
  };

  const handleTestSend = async (e) => {
    e?.preventDefault();
    const text = testInput.trim();
    if (!text || testLoading) return;

    setTestInput("");
    const newMessages = [...testMessages, { role: "user", text }];
    setTestMessages(newMessages);
    setTestLoading(true);

    try {
      const history = newMessages
        .slice(1, -1)
        .map((m) => ({ role: m.role, text: m.text }));

      const { data } = await apiClient.post("/chat/consult", {
        message: text,
        history
      });

      setTestMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: data.reply || "Dạ, em chưa nhận diện được câu hỏi.",
          suggestions: data.suggestedQuestions
        }
      ]);
    } catch {
      setTestMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Lỗi kết nối kiểm tra AI."
        }
      ]);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <section className="admin-section admin-ai-training-section">
      <div className="admin-section-heading">
        <div>
          <span className="admin-section-kicker">Trí Tuệ Nhân Tạo & Bộ Nhớ Doanh Nghiệp</span>
          <h2>Dạy AI Tư Vấn Kỹ Thuật (Huấn Luyện AI)</h2>
          <p>
            Bạn có thể dạy AI câu trả lời chính xác cho từng trường hợp, quy tắc xưng hô, bảng giá và kích thước kỹ thuật.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {loading && (
            <span className="admin-loading-pill">
              <i className="bi bi-arrow-repeat"></i> Đang tải
            </span>
          )}
          <button
            type="button"
            className="btn hero-primary-button"
            onClick={() => handleSaveAll()}
            disabled={saving || loading}
          >
            <i className="bi bi-cloud-check-fill me-1"></i>
            {saving ? "Đang lưu..." : "Lưu toàn bộ bài học"}
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="admin-ai-subtabs">
        <button
          type="button"
          className={activeSubTab === "knowledge" ? "active" : ""}
          onClick={() => setActiveSubTab("knowledge")}
        >
          <i className="bi bi-journal-text me-1"></i>
          Kho câu hỏi & Trả lời ({settings.knowledgeBase?.length || 0} bài học)
        </button>
        <button
          type="button"
          className={activeSubTab === "persona" ? "active" : ""}
          onClick={() => setActiveSubTab("persona")}
        >
          <i className="bi bi-sliders me-1"></i>
          Quy tắc xưng hô & Gemini API Key
        </button>
        <button
          type="button"
          className={activeSubTab === "test" ? "active" : ""}
          onClick={() => setActiveSubTab("test")}
        >
          <i className="bi bi-chat-dots-fill me-1"></i>
          Khung chat thử nghiệm
        </button>
      </div>

      {/* TAB 1: KHO CÂU HỎI & TRẢ LỜI */}
      {activeSubTab === "knowledge" && (
        <div className="admin-ai-knowledge-tab">
          <div className="admin-ai-form-card">
            <div className="admin-ai-card-header">
              <h3>
                <i className={`bi ${editingKbId ? "bi-pencil-square" : "bi-plus-circle"} me-2 text-primary`}></i>
                {editingKbId ? "Sửa bài học đã dạy cho AI" : "Dạy bài học mới cho AI"}
              </h3>
              <p>
                Nhập câu hỏi khách thường hỏi, từ khóa gợi ý và nội dung trả lời chuẩn của Thang Máy Hà Hồng.
              </p>
            </div>

            <form onSubmit={handleSaveKbItem} className="admin-form-grid">
              <div className="admin-span-2">
                <label className="form-label fw-bold">1. Câu hỏi của khách hàng:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Báo giá thang máy gia đình 4 tầng bao nhiêu tiền?"
                  value={kbForm.question}
                  onChange={(e) => setKbForm({ ...kbForm, question: e.target.value })}
                  required
                />
              </div>

              <div className="admin-span-2">
                <label className="form-label fw-bold">2. Từ khóa nhận diện (cách nhau bằng dấu phẩy):</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 4 tầng, báo giá, bao nhiêu tiền, homelift, chi phí 4 tầng"
                  value={kbForm.keywords}
                  onChange={(e) => setKbForm({ ...kbForm, keywords: e.target.value })}
                />
                <small className="text-muted">
                  Khi khách nhắn chứa các từ khóa này, AI sẽ nhận biết để áp dụng bài học này.
                </small>
              </div>

              <div className="admin-span-2">
                <label className="form-label fw-bold">3. Câu trả lời chuẩn bạn dạy cho AI:</label>
                <textarea
                  rows={6}
                  placeholder="Dạ, em chào anh/chị! Thang máy gia đình 4 tầng tại Hà Hồng dao động khoảng từ 280 - 340 triệu VNĐ..."
                  value={kbForm.answer}
                  onChange={(e) => setKbForm({ ...kbForm, answer: e.target.value })}
                  required
                />
                <small className="text-muted">
                  Có thể dùng dấu gạch đầu dòng (•), in đậm (**chữ in đậm**) để AI trình bày đẹp mắt trên điện thoại.
                </small>
              </div>

              <div className="admin-form-actions admin-span-2">
                <button type="submit" className="btn hero-primary-button" disabled={saving}>
                  <i className="bi bi-check2-circle me-1"></i>
                  {editingKbId ? "Cập nhật bài học" : "Lưu vào bộ nhớ AI"}
                </button>
                {editingKbId && (
                  <button type="button" className="btn admin-secondary-button" onClick={handleCancelEdit}>
                    Hủy bỏ
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="admin-ai-kb-list mt-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h3 className="m-0">
                Danh sách các bài học AI đã học ({settings.knowledgeBase?.length || 0})
              </h3>
            </div>

            {(!settings.knowledgeBase || settings.knowledgeBase.length === 0) ? (
              <p className="admin-empty">Chưa có bài học nào. Hãy thêm bài học đầu tiên ở trên để dạy AI nhé!</p>
            ) : (
              <div className="admin-ai-cards-grid">
                {settings.knowledgeBase.map((item, index) => (
                  <article key={item.id || index} className="admin-ai-kb-card">
                    <div className="admin-ai-kb-header">
                      <span className="admin-ai-kb-num">Bài học #{index + 1}</span>
                      <div className="admin-card-actions">
                        <button type="button" onClick={() => handleEditKbItem(item)}>
                          <i className="bi bi-pencil me-1"></i>Sửa
                        </button>
                        <button type="button" className="danger" onClick={() => handleDeleteKbItem(item.id)}>
                          <i className="bi bi-trash me-1"></i>Xóa
                        </button>
                      </div>
                    </div>
                    <h4>{item.question}</h4>
                    {item.keywords && (
                      <div className="admin-ai-kb-tags">
                        <i className="bi bi-tags me-1"></i>
                        {item.keywords.split(",").map((kw, i) => (
                          <span key={i} className="admin-ai-tag">
                            {kw.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="admin-ai-kb-preview">
                      <p>{item.answer}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: QUY TẮC XƯNG HÔ & API KEY */}
      {activeSubTab === "persona" && (
        <div className="admin-ai-persona-tab">
          <div className="admin-ai-form-card">
            <h3>Quy tắc ứng xử & Cấu hình dịch vụ</h3>
            <p>Định hình tính cách, phong cách xưng hô và kết nối Google Gemini API.</p>

            <div className="admin-form-grid">
              <div className="admin-span-2">
                <label className="form-label fw-bold">Lời chào mặc định khi mở khung chat:</label>
                <textarea
                  rows={3}
                  value={settings.defaultGreeting}
                  onChange={(e) => setSettings({ ...settings, defaultGreeting: e.target.value })}
                  placeholder="Dạ, em chào anh/chị! Em là trợ lý kỹ thuật của Thang Máy Hà Hồng..."
                />
              </div>

              <div className="admin-span-2">
                <label className="form-label fw-bold">Chỉ dẫn tính cách & Quy tắc hành vi (System Prompt):</label>
                <textarea
                  rows={8}
                  value={settings.systemPrompt}
                  onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                  placeholder="Bạn là kỹ sư tư vấn của Thang Máy Hà Hồng. Giọng điệu lễ phép, trung thực..."
                />
                <small className="text-muted">
                  Đây là chỉ dẫn cốt lõi giúp AI luôn cư xử chuẩn mực, không bao giờ nói sai thông tin công ty.
                </small>
              </div>

              <div className="admin-span-2">
                <label className="form-label fw-bold">Google Gemini API Key (Tùy chọn):</label>
                <div className="d-flex gap-2">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={settings.customApiKey || ""}
                    onChange={(e) => setSettings({ ...settings, customApiKey: e.target.value })}
                    placeholder="AIzaSy... (Nếu để trống, hệ thống sẽ dùng bộ nhớ từ khóa nội bộ)"
                  />
                  <button
                    type="button"
                    className="btn admin-secondary-button"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    <i className={`bi ${showApiKey ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                </div>
                <small className="text-muted">
                  Khi nhập Gemini API Key, AI sẽ đọc toàn bộ các bài học bạn dạy để đối đáp biến hóa cực kỳ thông minh.
                </small>
              </div>

              <div className="admin-form-actions admin-span-2">
                <button
                  type="button"
                  className="btn hero-primary-button"
                  onClick={() => handleSaveAll()}
                  disabled={saving}
                >
                  <i className="bi bi-save me-1"></i>
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KHUNG CHAT THỬ NGHIỆM */}
      {activeSubTab === "test" && (
        <div className="admin-ai-test-tab">
          <div className="admin-ai-test-container">
            <div className="admin-ai-test-header">
              <div className="d-flex align-items-center gap-2">
                <span className="ai-header-dot"></span>
                <strong>Khung kiểm tra đối đáp thực tế của AI</strong>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() =>
                  setTestMessages([
                    {
                      role: "model",
                      text: "Đã làm mới khung thử nghiệm! Bạn hãy hỏi thử bất kỳ câu nào để kiểm tra AI nhé."
                    }
                  ])
                }
              >
                Làm mới cuộc trò chuyện
              </button>
            </div>

            <div className="admin-ai-test-messages">
              {testMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`ai-message-row ${m.role === "user" ? "user-row" : "model-row"}`}
                >
                  <div className="ai-msg-bubble">
                    <p style={{ whiteSpace: "pre-line", margin: 0 }}>{m.text}</p>
                    {m.suggestions && m.suggestions.length > 0 && (
                      <div className="ai-suggestions-wrap mt-2">
                        {m.suggestions.map((s, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            className="ai-suggestion-chip"
                            onClick={() => {
                              setTestInput(s);
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {testLoading && (
                <div className="ai-message-row model-row">
                  <div className="ai-msg-bubble ai-typing-bubble">
                    <span className="ai-typing-dot"></span>
                    <span className="ai-typing-dot"></span>
                    <span className="ai-typing-dot"></span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleTestSend} className="admin-ai-test-input-wrap">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Nhập câu hỏi để thử xem AI trả lời thế nào..."
                disabled={testLoading}
              />
              <button type="submit" className="btn hero-primary-button" disabled={testLoading || !testInput.trim()}>
                <i className="bi bi-send-fill"></i>
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
