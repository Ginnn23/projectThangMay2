import { useEffect, useMemo, useRef, useState } from "react";

import { API_BASE_URL, API_ORIGIN, apiClient } from "../api/client";
import "./doanhThu.css";
import AiTrainingAdmin from "../components/AiTrainingAdmin";
import { boLocDuAn, chuanHoaPhanLoaiDuAn, layNhanPhanLoaiDuAn, phanLoaiDuAn } from "../data/projectCategories";
import { anhDuAnMacDinh } from "../data/projectData";

const trangThaiLienHe = [
  { value: "New", label: "Mới gửi" },
  { value: "Contacted", label: "Đã liên hệ" },
  { value: "Processed", label: "Đã xử lý" },
  { value: "Cancelled", label: "Đã hủy" },
];

const dichVuRong = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  imageUrl: "",
  icon: "bi-tools",
  displayOrder: 0,
  isActive: true,
};

const duAnRong = {
  name: "",
  slug: "",
  category: "",
  location: "",
  description: "",
  priceRange: "",
  imageUrl: "",
  galleryImageUrls: ["", "", "", ""],
  completedAt: "",
  isFeatured: false,
  isActive: true,
};

const SO_DU_AN_MOI_TRANG = 8;
const SO_LIEN_HE_MOI_TRANG = 8;
const SO_BAO_TRI_MOI_TRANG = 8;

const khachBaoTriRong = {
  customerName: "",
  phoneNumber: "",
  email: "",
  projectName: "",
  projectType: "",
  address: "",
  installedAt: "",
  nextMaintenanceAt: "",
  note: "",
  isActive: true,
};

const caiDatHeroRong = {
  mainImages: ["", "", ""],
  sideImages: ["", ""],
  badgeText: "Hỗ trợ kỹ thuật 24/7",
};

const canhBaoBackendDichVuCu = "Backend đang chạy bản cũ nên admin tạm thời chỉ thấy dịch vụ đang hiển thị. Hãy restart backend để dùng nút Ẩn/Hiện đầy đủ.";

function layLoiApi(error) {
  return error?.response?.data?.message || "Không thể kết nối API. Kiểm tra backend và thử lại.";
}

function dinhDangNgay(value) {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function dinhDangNgayNgan(value) {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(value));
}

function dinhDangNgayInput(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function laSoDienThoai10So(value) {
  return /^\d{10}$/.test(String(value || "").trim());
}

function laEmailHopLe(value) {
  if (!String(value || "").trim()) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function laNgayHopLe(value) {
  if (!value) return false;
  const date = new Date(value);
  const year = date.getFullYear();
  return !Number.isNaN(date.getTime()) && year >= 2000 && year <= 2100;
}

function layNhanTrangThai(status) {
  return trangThaiLienHe.find((item) => item.value === status)?.label || status;
}

function layClassTrangThaiLienHe(status) {
  return `admin-contact-status status-${String(status || "New").toLowerCase()}`;
}

function taoUrlAnhAdmin(imageUrl, fallbackImage = "") {
  if (imageUrl?.includes("source.unsplash.com")) return fallbackImage;
  if (!imageUrl) return "";
  if (/^https?:\/\//i.test(imageUrl) || imageUrl.startsWith("data:")) return imageUrl;
  if (imageUrl.startsWith("/src/") || imageUrl.startsWith("/assets/")) return imageUrl;
  return `${API_ORIGIN}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
}

function taoFormCaiDatHero(data = {}) {
  const mainImages = Array.isArray(data.mainImages) ? data.mainImages : [];
  const sideImages = Array.isArray(data.sideImages) ? data.sideImages : [];

  return {
    mainImages: [...mainImages, "", "", ""].slice(0, 3),
    sideImages: [...sideImages, ""].slice(0, 2),
    badgeText: data.badgeText?.trim() || caiDatHeroRong.badgeText,
  };
}

async function layDichVuChoAdmin() {
  try {
    const response = await apiClient.get("/services/admin");
    return { data: response.data, dangDungApiCu: false };
  } catch (error) {
    if (error?.response?.status === 404) {
      const response = await apiClient.get("/services");
      return { data: response.data, dangDungApiCu: true };
    }

    throw error;
  }
}

function khopTuKhoa(...values) {
  return values.filter(Boolean).join(" ").toLowerCase();
}

function AdminToast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div className={`admin-toast ${toast.type || "success"}`} role="status">
      <i className={`bi ${toast.type === "error" ? "bi-exclamation-triangle" : "bi-check-circle"}`}></i>
      <span>{toast.message}</span>
      <button type="button" aria-label="Đóng thông báo" onClick={onClose}>
        <i className="bi bi-x-lg"></i>
      </button>
    </div>
  );
}

function AdminConfirmModal({ confirm, onClose }) {
  const [dangXuLy, setDangXuLy] = useState(false);

  if (!confirm) return null;

  const xacNhan = async () => {
    setDangXuLy(true);
    try {
      await confirm.onConfirm();
      onClose();
    } finally {
      setDangXuLy(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" role="presentation">
      <div className="admin-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title">
        <div className="admin-confirm-icon">
          <i className="bi bi-exclamation-triangle"></i>
        </div>
        <h2 id="admin-confirm-title">{confirm.title}</h2>
        <p>{confirm.message}</p>
        <div className="admin-modal-actions">
          <button className="admin-secondary-button" type="button" onClick={onClose} disabled={dangXuLy}>
            Hủy
          </button>
          <button className="admin-danger-button" type="button" onClick={xacNhan} disabled={dangXuLy}>
            {dangXuLy ? "Đang xóa..." : confirm.confirmText || "Xóa vĩnh viễn"}
          </button>
        </div>
      </div>
    </div>
  );
}

async function layDuAnChoAdmin() {
  try {
    const response = await apiClient.get("/projects/admin");
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      const response = await apiClient.get("/projects");
      return response.data;
    }

    throw error;
  }
}

function AdminImageUpload({ value, onChange, label = "Hình ảnh" }) {
  const [dangTaiAnh, setDangTaiAnh] = useState(false);
  const [loiAnh, setLoiAnh] = useState("");
  const [anhBiLoi, setAnhBiLoi] = useState(false);
  const previewUrl = taoUrlAnhAdmin(value);

  const chonAnh = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setDangTaiAnh(true);
    setLoiAnh("");
    setAnhBiLoi(false);

    try {
      const { data } = await apiClient.post("/uploads/image", formData);
      onChange(data.imageUrl);
    } catch (error) {
      setLoiAnh(layLoiApi(error));
    } finally {
      setDangTaiAnh(false);
    }
  };

  return (
    <div className="admin-image-upload admin-span-2">
      <label>{label}</label>
      <div className="admin-image-upload-body">
        <div className="admin-image-preview">
          {previewUrl && !anhBiLoi ? (
            <img src={previewUrl} alt="Ảnh đang chọn" onError={() => setAnhBiLoi(true)} />
          ) : (
            <div>
              <i className="bi bi-image"></i>
              <span>{value ? "Ảnh hiện tại không tải được" : "Chưa chọn ảnh"}</span>
            </div>
          )}
        </div>
        <div>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={chonAnh} disabled={dangTaiAnh} />
          <p>Chọn file JPG, PNG hoặc WebP. Dung lượng tối đa 5 MB.</p>
          {dangTaiAnh && <span className="admin-upload-note">Đang tải ảnh lên...</span>}
          {loiAnh && <span className="admin-upload-error">{loiAnh}</span>}
        </div>
      </div>
    </div>
  );
}

function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({ username: "admin", password: "" });
  const [dangXuLy, setDangXuLy] = useState(false);
  const [loi, setLoi] = useState("");

  const dangNhap = async (event) => {
    event.preventDefault();
    setDangXuLy(true);
    setLoi("");

    try {
      const { data } = await apiClient.post("/auth/login", form);
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.user));
      onLogin(data);
    } catch (error) {
      setLoi(layLoiApi(error));
    } finally {
      setDangXuLy(false);
    }
  };

  return (
    <main className="admin-page admin-login-page">
      <section className="admin-login-panel">
        <span className="section-eyebrow">HÀ HỒNG ADMIN</span>
        <h1>Đăng nhập quản trị</h1>
        <p>Kết nối với API tại <strong>{API_BASE_URL}</strong></p>
        <form onSubmit={dangNhap}>
          {loi && <div className="alert alert-danger">{loi}</div>}
          <label htmlFor="adminUsername">Tài khoản</label>
          <input id="adminUsername" value={form.username} onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))} autoComplete="username" />
          <label htmlFor="adminPassword">Mật khẩu</label>
          <input id="adminPassword" type="password" value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} autoComplete="current-password" />
          <button className="btn hero-primary-button w-100" type="submit" disabled={dangXuLy}>
            {dangXuLy ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </section>
    </main>
  );
}

function ChangePasswordModal({ isOpen, onClose, onShowToast, onLogout }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetting, setResetting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCloseModal = () => {
    setSuccess(false);
    setError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cur = currentPassword.trim();
    const nw = newPassword.trim();
    const cf = confirmPassword.trim();

    if (!cur) {
      setError("Vui lòng nhập mật khẩu hiện tại (mật khẩu mặc định ban đầu là 123).");
      return;
    }
    if (!nw) {
      setError("Vui lòng nhập mật khẩu mới.");
      return;
    }
    if (nw.length < 3) {
      setError("Mật khẩu mới phải có tối thiểu 3 ký tự.");
      return;
    }
    if (nw !== cf) {
      setError("Mật khẩu xác nhận không khớp với mật khẩu mới.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post("/auth/change-password", {
        currentPassword: cur,
        newPassword: nw
      });
      onShowToast?.(res?.data?.message || "Đã đổi mật khẩu quản trị thành công!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(true);
    } catch (err) {
      setError(layLoiApi(err) || "Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetDefault = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn đặt lại mật khẩu tài khoản admin về mặc định: 123?")) return;
    setResetting(true);
    setError("");
    try {
      const res = await apiClient.post("/auth/reset-default-password");
      onShowToast?.(res?.data?.message || "Đã khôi phục mật khẩu admin về 123 thành công!", "success");
      setCurrentPassword("123");
    } catch (err) {
      setError(layLoiApi(err) || "Không thể khôi phục mật khẩu.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="admin-modal-backdrop">
      <div className="admin-change-pwd-modal">
        <div className="admin-modal-header">
          <div className="admin-modal-title">
            <i className="bi bi-shield-lock-fill"></i>
            <div>
              <h3>Đổi Mật Khẩu Quản Trị</h3>
              <p>Mật khẩu khởi tạo ban đầu của hệ thống là <strong>123</strong></p>
            </div>
          </div>
          <button type="button" className="admin-modal-close" onClick={handleCloseModal} title="Đóng">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {success ? (
          <div className="admin-modal-body" style={{ textAlign: "center", padding: "32px 24px" }}>
            <div style={{ width: 68, height: 68, borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 16 }}>
              <i className="bi bi-check-lg"></i>
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: "#0B1F3A", margin: "0 0 8px 0" }}>
              Đổi Mật Khẩu Thành Công!
            </h3>
            <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 24px 0", lineHeight: 1.6 }}>
              Mật khẩu mới đã được lưu an toàn vào hệ thống. Bạn có thể tiếp tục làm việc hoặc đăng xuất để kiểm tra lại mật khẩu mới.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn-submit"
                onClick={handleCloseModal}
                style={{ padding: "10px 22px" }}
              >
                <i className="bi bi-check2-circle"></i> Tiếp Tục Quản Trị
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  handleCloseModal();
                  onLogout?.();
                }}
                style={{ color: "#dc2626", borderColor: "#fecaca", background: "#fef2f2", padding: "10px 20px" }}
              >
                <i className="bi bi-box-arrow-right"></i> Đăng Xuất Kiểm Tra
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="admin-modal-body">
            {error && (
              <div className="admin-modal-alert">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <span>{error}</span>
              </div>
            )}

            <div className="admin-pwd-field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ margin: 0 }}>Mật khẩu hiện tại</label>
                <button
                  type="button"
                  onClick={handleResetDefault}
                  disabled={resetting}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#d97706",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    textDecoration: "underline"
                  }}
                  title="Bấm nếu quên hoặc muốn đặt lại về 123"
                >
                  {resetting ? "Đang khôi phục..." : "Quên MK? Đặt về 123"}
                </button>
              </div>
              <div className="admin-pwd-input-wrap">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại (mặc định: 123)"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="admin-pwd-toggle"
                  onClick={() => setShowCurrent(!showCurrent)}
                  tabIndex="-1"
                  title={showCurrent ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  <i className={`bi ${showCurrent ? "bi-eye-slash-fill" : "bi-eye-fill"}`}></i>
                </button>
              </div>
            </div>

            <div className="admin-pwd-field">
              <label>Mật khẩu mới (tối thiểu 3 ký tự)</label>
              <div className="admin-pwd-input-wrap">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="admin-pwd-toggle"
                  onClick={() => setShowNew(!showNew)}
                  tabIndex="-1"
                  title={showNew ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  <i className={`bi ${showNew ? "bi-eye-slash-fill" : "bi-eye-fill"}`}></i>
                </button>
              </div>
            </div>

            <div className="admin-pwd-field">
              <label>Xác nhận mật khẩu mới</label>
              <div className="admin-pwd-input-wrap">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="admin-pwd-toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex="-1"
                  title={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  <i className={`bi ${showConfirm ? "bi-eye-slash-fill" : "bi-eye-fill"}`}></i>
                </button>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button type="button" className="btn-cancel" onClick={handleCloseModal} disabled={loading}>
                Hủy bỏ
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <>
                    <i className="bi bi-arrow-repeat spin"></i> Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle"></i> Lưu mật khẩu mới
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function AdminToolbar({ activeTab, onChangeTab, user, onLogout, onOpenChangePassword }) {
  const tabs = [
    { key: "revenue", label: "Doanh thu", icon: "bi-bar-chart-fill" },
    { key: "contacts", label: "Liên hệ", icon: "bi-inbox-fill" },
    { key: "estimates", label: "Dự toán báo giá", icon: "bi-calculator-fill" },
    { key: "maintenance", label: "Bảo trì", icon: "bi-calendar-check-fill" },
    { key: "home", label: "Trang chủ", icon: "bi-house-gear-fill" },
    { key: "services", label: "Dịch vụ", icon: "bi-tools" },
    { key: "projects", label: "Dự án", icon: "bi-buildings-fill" },
    { key: "ai", label: "Huấn luyện AI", icon: "bi-robot" },
  ];

  return (
    <header className="admin-toolbar">
      <div className="admin-toolbar-left">
        <div className="admin-avatar-badge" title="Tài khoản quản trị">
          <i className="bi bi-shield-check"></i>
        </div>
        <div className="admin-user-block">
          <span className="admin-user-sub">Quản trị website</span>
          <strong className="admin-user-name">{user?.fullName || user?.username || "Admin"}</strong>
        </div>
        <button
          type="button"
          className="admin-change-pwd-btn"
          onClick={onOpenChangePassword}
          title="Đổi mật khẩu tài khoản Admin"
        >
          <i className="bi bi-key-fill"></i>
          <span>Đổi MK</span>
        </button>
      </div>

      <nav className="admin-toolbar-nav" aria-label="Admin tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`admin-tab-btn ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => onChangeTab(tab.key)}
          >
            <i className={`bi ${tab.icon}`}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="admin-toolbar-right">
        <button className="admin-logout-button" type="button" onClick={onLogout} title="Đăng xuất khỏi hệ thống">
          <i className="bi bi-box-arrow-right"></i>
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}

function DuToanAdmin({ onShowToast, onUpdateCount }) {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [sendingEmailId, setSendingEmailId] = useState(null);
  const [testingTelegram, setTestingTelegram] = useState(false);

  const handleTestTelegram = async () => {
    setTestingTelegram(true);
    try {
      const res = await apiClient.post("/estimates/admin/test-telegram");
      onShowToast?.(res?.data?.message || "Đã gửi thông báo thử nghiệm thành công tới Telegram!");
    } catch (err) {
      onShowToast?.(err.response?.data?.message || "Không thể kết nối Telegram Bot. Vui lòng kiểm tra TELEGRAM_BOT_TOKEN và TELEGRAM_CHAT_ID.", "error");
    } finally {
      setTestingTelegram(false);
    }
  };

  const fetchEstimates = async () => {
    setLoading(true);
    setError("");
    try {
      let res;
      try {
        res = await apiClient.get("/estimates/admin");
      } catch {
        res = await apiClient.get("/admin/estimates");
      }
      const data = Array.isArray(res?.data) ? res.data : [];
      setEstimates(data);
      onUpdateCount?.(data.length);
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể tải danh sách dự toán.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      try {
        await apiClient.patch(`/estimates/${id}/status`, { status: newStatus });
      } catch {
        await apiClient.patch(`/admin/estimates/${id}/status`, { status: newStatus });
      }
      setEstimates((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
      onShowToast?.("Đã cập nhật trạng thái dự toán.");
    } catch {
      onShowToast?.("Không thể cập nhật trạng thái.", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bản ghi dự toán này?")) return;
    try {
      try {
        await apiClient.delete(`/estimates/${id}`);
      } catch {
        await apiClient.delete(`/admin/estimates/${id}`);
      }
      setEstimates((prev) => {
        const next = prev.filter((item) => item.id !== id);
        onUpdateCount?.(next.length);
        return next;
      });
      onShowToast?.("Đã xóa bản ghi dự toán.");
    } catch {
      onShowToast?.("Không thể xóa bản ghi.", "error");
    }
  };

  const handleResendEmail = async (id, targetEmail) => {
    if (!targetEmail) {
      onShowToast?.("Khách hàng này chưa có địa chỉ Gmail.", "error");
      return;
    }
    setSendingEmailId(id);
    try {
      let res;
      try {
        res = await apiClient.post(`/estimates/${id}/resend-email`);
      } catch {
        res = await apiClient.post(`/admin/estimates/${id}/resend-email`);
      }
      onShowToast?.(res?.data?.message || `Đã gửi báo giá tới ${targetEmail}`);
    } catch (err) {
      onShowToast?.(err.response?.data?.message || "Không thể gửi email lúc này. Vui lòng kiểm tra cấu hình SMTP.", "error");
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleDownloadPdf = async (id) => {
    try {
      let res;
      try {
        res = await apiClient.get(`/estimates/${id}/pdf`, { responseType: "blob" });
      } catch {
        res = await apiClient.get(`/admin/estimates/${id}/pdf`, { responseType: "blob" });
      }
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Bang_Bao_Gia_Thang_May_Ha_Hong_HH-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      onShowToast?.("Đã tải tệp PDF báo giá kỹ thuật thành công!");
    } catch {
      onShowToast?.("Không thể xuất file PDF lúc này.", "error");
    }
  };

  const stats = useMemo(() => {
    const total = estimates.length;
    const newCount = estimates.filter((e) => e.status === "New").length;
    const surveyCount = estimates.filter((e) => e.status === "SurveyScheduled").length;
    const closedCount = estimates.filter((e) => e.status === "DealClosed").length;
    return { total, newCount, surveyCount, closedCount };
  }, [estimates]);

  const filtered = useMemo(() => {
    return estimates.filter((item) => {
      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      const term = search.trim().toLowerCase();
      const matchSearch = !term ||
        (item.customerName || "").toLowerCase().includes(term) ||
        (item.phoneNumber || "").includes(term) ||
        (item.email || "").toLowerCase().includes(term) ||
        (item.address || "").toLowerCase().includes(term);
      return matchStatus && matchSearch;
    });
  }, [estimates, search, statusFilter]);

  const formatVnd = (val) => val ? new Intl.NumberFormat("vi-VN").format(val) + " đ" : "0 đ";

  return (
    <section className="admin-section">
      <div className="admin-section-heading">
        <div>
          <span className="admin-section-kicker">Khách hàng tính giá trực tuyến</span>
          <h2>Dự toán báo giá thang máy</h2>
          <p>Danh sách khách hàng đã cấu hình và yêu cầu báo giá từ công cụ trực tuyến.</p>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-info btn-sm"
            onClick={handleTestTelegram}
            disabled={testingTelegram}
            title="Gửi tin nhắn mẫu kiểm tra kết nối Bot Telegram"
          >
            <i className="bi bi-telegram me-1"></i> {testingTelegram ? "Đang gửi..." : "Test Bot Telegram"}
          </button>
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={fetchEstimates} disabled={loading}>
            <i className="bi bi-arrow-repeat me-1"></i> {loading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="p-3 bg-white rounded border shadow-sm">
            <span className="text-muted small d-block">Tổng yêu cầu dự toán</span>
            <span className="fs-4 fw-bold text-primary">{stats.total}</span>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="p-3 bg-white rounded border shadow-sm">
            <span className="text-muted small d-block">Đơn mới cần tư vấn</span>
            <span className="fs-4 fw-bold text-warning">{stats.newCount}</span>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="p-3 bg-white rounded border shadow-sm">
            <span className="text-muted small d-block">Đã hẹn khảo sát</span>
            <span className="fs-4 fw-bold text-info">{stats.surveyCount}</span>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="p-3 bg-white rounded border shadow-sm">
            <span className="text-muted small d-block">Đã chốt hợp đồng</span>
            <span className="fs-4 fw-bold text-success">{stats.closedCount}</span>
          </div>
        </div>
      </div>

      <div className="d-flex gap-3 mb-3 flex-wrap">
        <div className="admin-search-box flex-grow-1" style={{ margin: 0 }}>
          <i className="bi bi-search"></i>
          <input
            type="search"
            placeholder="Tìm theo tên khách hàng, số điện thoại, địa chỉ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select form-select-sm"
          style={{ width: "auto" }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="New">Mới gửi (Chưa liên hệ)</option>
          <option value="Contacted">Đã liên hệ tư vấn</option>
          <option value="SurveyScheduled">Đã hẹn khảo sát</option>
          <option value="DealClosed">Đã chốt hợp đồng</option>
          <option value="Cancelled">Đã hủy</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Cấu hình thang máy</th>
              <th>Giếng thang / Pit</th>
              <th>Dự toán giá</th>
              <th>Ngày gửi</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-4 text-muted">Chưa có bản ghi dự toán nào.</td></tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.customerName}</strong>
                    <div className="text-primary fw-bold">{item.phoneNumber}</div>
                    {item.email && (
                      <div className="text-secondary small">
                        <i className="bi bi-envelope me-1"></i>
                        {item.email}
                      </div>
                    )}
                    {item.address && <small className="text-muted d-block">{item.address}</small>}
                  </td>
                  <td>
                    <span className="badge bg-primary-subtle text-primary me-1">{item.capacityKg}kg</span>
                    <span className="badge bg-secondary-subtle text-secondary me-1">{item.stops} Tầng</span>
                    <div><small className="fw-semibold">{item.elevatorType}</small></div>
                    <small className="text-muted">Động cơ: {item.motorBrand}</small>
                  </td>
                  <td>
                    <div><small>Hố: {item.shaftWidth} x {item.shaftDepth} mm</small></div>
                    <small className="text-muted">Pit: {item.pitDepth} mm | OH: {item.overheadHeight} mm</small>
                  </td>
                  <td>
                    <strong className="text-danger">{formatVnd(item.estimatedPriceMin)}</strong>
                    <div style={{ fontSize: "12px" }}>đến {formatVnd(item.estimatedPriceMax)}</div>
                  </td>
                  <td>
                    <small>{new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(item.createdAt))}</small>
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                    >
                      <option value="New">Mới gửi</option>
                      <option value="Contacted">Đã liên hệ</option>
                      <option value="SurveyScheduled">Hẹn khảo sát</option>
                      <option value="DealClosed">Đã chốt HĐ</option>
                      <option value="Cancelled">Đã hủy</option>
                    </select>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        title="Xem chi tiết"
                        onClick={() => setSelectedEstimate(item)}
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-success btn-sm"
                        title="Gửi báo giá qua Gmail cho khách"
                        onClick={() => handleResendEmail(item.id, item.email)}
                        disabled={!item.email || sendingEmailId === item.id}
                      >
                        <i className={`bi ${sendingEmailId === item.id ? "bi-hourglass-split" : "bi-envelope-paper"}`}></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        title="Tải bảng báo giá PDF chính thức (có dấu mộc)"
                        onClick={() => handleDownloadPdf(item.id)}
                      >
                        <i className="bi bi-file-earmark-pdf"></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        title="Xóa"
                        onClick={() => handleDelete(item.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Detail */}
      {selectedEstimate && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Chi tiết bản dự toán: {selectedEstimate.customerName}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedEstimate(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <p><strong>Khách hàng:</strong> {selectedEstimate.customerName}</p>
                    <p><strong>Số điện thoại:</strong> <a href={`tel:${selectedEstimate.phoneNumber}`}>{selectedEstimate.phoneNumber}</a></p>
                    <p><strong>Email:</strong> {selectedEstimate.email || "Chưa cung cấp"}</p>
                    <p><strong>Địa chỉ:</strong> {selectedEstimate.address || "Chưa cung cấp"}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Loại công trình:</strong> {selectedEstimate.buildingType}</p>
                    <p><strong>Cấu hình:</strong> {selectedEstimate.capacityKg}kg - {selectedEstimate.stops} Tầng</p>
                    <p><strong>Dòng thang:</strong> {selectedEstimate.elevatorType}</p>
                    <p><strong>Động cơ:</strong> {selectedEstimate.motorBrand} ({selectedEstimate.motorPowerKw}kW, {selectedEstimate.powerSupply})</p>
                  </div>
                </div>
                <hr />
                <div className="row g-3">
                  <div className="col-md-6">
                    <h6>Thông số giếng thang:</h6>
                    <ul>
                      <li>Kích thước hố (W x D): {selectedEstimate.shaftWidth} x {selectedEstimate.shaftDepth} mm</li>
                      <li>Kích thước cabin (W x D): {selectedEstimate.cabinWidth} x {selectedEstimate.cabinDepth} mm</li>
                      <li>Hố PIT: {selectedEstimate.pitDepth} mm</li>
                      <li>Chiều cao OH: {selectedEstimate.overheadHeight} mm</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6>Dự toán giá trọn gói:</h6>
                    <div className="fs-5 fw-bold text-danger">
                      {formatVnd(selectedEstimate.estimatedPriceMin)} - {formatVnd(selectedEstimate.estimatedPriceMax)}
                    </div>
                    {selectedEstimate.adminNotes && (
                      <div className="mt-2">
                        <small className="text-muted d-block">Ghi chú của khách:</small>
                        <em>{selectedEstimate.adminNotes}</em>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedEstimate(null)}>Đóng</button>
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => handleDownloadPdf(selectedEstimate.id)}
                >
                  <i className="bi bi-file-earmark-pdf-fill me-1"></i> Tải Báo Giá PDF
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleResendEmail(selectedEstimate.id, selectedEstimate.email)}
                  disabled={!selectedEstimate.email || sendingEmailId === selectedEstimate.id}
                >
                  <i className={`bi ${sendingEmailId === selectedEstimate.id ? "bi-hourglass-split" : "bi-envelope-paper"} me-1`}></i>
                  {sendingEmailId === selectedEstimate.id ? "Đang gửi..." : "Gửi lại file báo giá qua Gmail"}
                </button>
                <a href={`tel:${selectedEstimate.phoneNumber}`} className="btn btn-primary">
                  <i className="bi bi-telephone-fill me-1"></i> Gọi ngay
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function LienHeAdmin({ contacts, loading, error, onChangeStatus, onDelete }) {
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");
  const [trangHienTai, setTrangHienTai] = useState(1);
  const tuKhoa = tuKhoaTimKiem.trim().toLowerCase();
  const danhSachLienHe = useMemo(() => {
    if (!tuKhoa) return contacts;

    return contacts.filter((item) => khopTuKhoa(
      item.fullName,
      item.phoneNumber,
      item.email,
      item.subject,
      item.message,
      item.projectLocation,
      item.projectType,
    ).includes(tuKhoa));
  }, [contacts, tuKhoa]);
  const tongSoTrang = Math.max(1, Math.ceil(danhSachLienHe.length / SO_LIEN_HE_MOI_TRANG));
  const trangDangDung = Math.min(trangHienTai, tongSoTrang);
  const viTriBatDau = (trangDangDung - 1) * SO_LIEN_HE_MOI_TRANG;
  const lienHeTrongTrang = danhSachLienHe.slice(viTriBatDau, viTriBatDau + SO_LIEN_HE_MOI_TRANG);

  return (
    <section className="admin-section">
      <div className="admin-section-heading">
        <div>
          <span className="admin-section-kicker">Tự động đồng bộ khi mở tab</span>
          <h2>Yêu cầu liên hệ</h2>
          <p>Theo dõi khách hàng gửi từ form trang Liên hệ.</p>
        </div>
        {loading && <span className="admin-loading-pill"><i className="bi bi-arrow-repeat"></i> Đang tải</span>}
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="admin-search-box">
        <i className="bi bi-search"></i>
        <input
          type="search"
          placeholder="Tìm theo tên, số điện thoại, email hoặc nội dung..."
          value={tuKhoaTimKiem}
          onChange={(event) => {
            setTuKhoaTimKiem(event.target.value);
            setTrangHienTai(1);
          }}
        />
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Nội dung</th>
              <th>Trạng thái</th>
              <th>Ngày gửi</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {lienHeTrongTrang.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.fullName}</strong>
                  <span>{item.phoneNumber}</span>
                  {item.email && <span>{item.email}</span>}
                </td>
                <td>
                  <strong>{item.subject || "Yêu cầu tư vấn"}</strong>
                  <p>{item.message}</p>
                </td>
                <td>
                  <select className={layClassTrangThaiLienHe(item.status)} value={item.status} title={layNhanTrangThai(item.status)} onChange={(event) => onChangeStatus(item.id, event.target.value)}>
                    {trangThaiLienHe.map((status) => <option value={status.value} key={status.value}>{status.label}</option>)}
                  </select>
                </td>
                <td>{dinhDangNgay(item.createdAt)}</td>
                <td>
                  <button className="admin-icon-button danger" type="button" aria-label="Xóa liên hệ" onClick={() => onDelete(item.id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
            {!danhSachLienHe.length && (
              <tr>
                <td colSpan="5" className="admin-empty">Không tìm thấy yêu cầu liên hệ phù hợp.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {tongSoTrang > 1 && (
        <div className="site-pagination admin-pagination" aria-label="Phân trang liên hệ admin">
          <button type="button" disabled={trangDangDung === 1} onClick={() => setTrangHienTai((trang) => Math.max(1, trang - 1))}>
            Trước
          </button>
          {Array.from({ length: tongSoTrang }, (_, index) => index + 1).map((trang) => (
            <button className={trangDangDung === trang ? "active" : ""} type="button" key={trang} onClick={() => setTrangHienTai(trang)}>
              {trang}
            </button>
          ))}
          <button type="button" disabled={trangDangDung === tongSoTrang} onClick={() => setTrangHienTai((trang) => Math.min(tongSoTrang, trang + 1))}>
            Sau
          </button>
        </div>
      )}
    </section>
  );
}

function DichVuAdmin({ services, form, editingId, loading, error, warning, onSubmit, onEdit, onToggleVisibility, onDelete, onChange, onReset }) {
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");
  const tuKhoa = tuKhoaTimKiem.trim().toLowerCase();
  const danhSachDichVu = useMemo(() => {
    if (!tuKhoa) return services;

    return services.filter((item) => khopTuKhoa(
      item.name,
      item.shortDescription,
      item.description,
    ).includes(tuKhoa));
  }, [services, tuKhoa]);

  return (
    <section className="admin-section">
      <div className="admin-section-heading">
        <div>
          <span className="admin-section-kicker">Dữ liệu hiển thị ngoài website</span>
          <h2>Dịch vụ</h2>
          <p>Thêm và cập nhật các dịch vụ chính của Hà Hồng.</p>
        </div>
        {loading && <span className="admin-loading-pill"><i className="bi bi-arrow-repeat"></i> Đang tải</span>}
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {warning && <div className="alert alert-warning">{warning}</div>}
      <form className="admin-form-grid" onSubmit={onSubmit}>
        <input className="admin-span-2" placeholder="Tên dịch vụ" value={form.name} onChange={(event) => onChange("name", event.target.value)} required />
        <label className="admin-check">
          <input type="checkbox" checked={form.isActive} onChange={(event) => onChange("isActive", event.target.checked)} />
          Đang hiển thị
        </label>
        <AdminImageUpload value={form.imageUrl} onChange={(imageUrl) => onChange("imageUrl", imageUrl)} label="Ảnh dịch vụ" />
        <textarea className="admin-span-2" placeholder="Mô tả ngắn" value={form.shortDescription} onChange={(event) => onChange("shortDescription", event.target.value)} required />
        <textarea className="admin-span-2" placeholder="Mô tả chi tiết" value={form.description} onChange={(event) => onChange("description", event.target.value)} required />
        <div className="admin-form-actions admin-span-2">
          <button className="btn hero-primary-button" type="submit">{editingId ? "Cập nhật" : "Thêm mới"}</button>
          <button className="btn admin-secondary-button" type="button" onClick={onReset}>Làm mới</button>
        </div>
      </form>
      <div className="admin-search-box">
        <i className="bi bi-search"></i>
        <input
          type="search"
          placeholder="Tìm dịch vụ theo tên hoặc mô tả..."
          value={tuKhoaTimKiem}
          onChange={(event) => setTuKhoaTimKiem(event.target.value)}
        />
      </div>
      <div className="admin-card-grid">
        {danhSachDichVu.map((item) => (
          <article className={`admin-manage-card ${item.isActive ? "" : "is-hidden"}`} key={item.id}>
            <i className={`bi ${item.icon || "bi-tools"}`}></i>
            <div>
              <span className={`admin-status-badge ${item.isActive ? "is-active" : "is-hidden"}`}>
                {item.isActive ? "Đang hiển thị" : "Đang ẩn"}
              </span>
              <h3>{item.name}</h3>
              <p>{item.shortDescription}</p>
            </div>
            <div className="admin-card-actions">
              <button type="button" onClick={() => onEdit(item)}>Sửa</button>
              <button type="button" onClick={() => onToggleVisibility(item)}>
                {item.isActive ? "Ẩn" : "Hiện"}
              </button>
              <button className="danger" type="button" onClick={() => onDelete(item)}>
                Xóa
              </button>
            </div>
          </article>
        ))}
        {!danhSachDichVu.length && <p className="admin-empty admin-span-2">Không tìm thấy dịch vụ phù hợp.</p>}
      </div>
    </section>
  );
}

function DuAnAdmin({ projects, form, editingId, loading, error, onSubmit, onEdit, onToggleVisibility, onDeletePermanent, onChange, onReset }) {
  const [phanLoaiDangLoc, setPhanLoaiDangLoc] = useState("tat-ca");
  const [trangThaiDangLoc, setTrangThaiDangLoc] = useState("tat-ca");
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");
  const [trangHienTai, setTrangHienTai] = useState(1);
  const tuKhoa = tuKhoaTimKiem.trim().toLowerCase();
  const boLocTrangThaiDuAn = [
    { label: "Tất cả", value: "tat-ca" },
    { label: "Đang hiện", value: "dang-hien" },
    { label: "Đang ẩn", value: "dang-an" },
  ];
  const boLocDuAnAdmin = [
    ...boLocDuAn,
    { label: "Chưa phân loại", value: "chua-phan-loai" },
  ];

  const doiAnhPhuDuAn = (index, imageUrl) => {
    const nextImages = [...(form.galleryImageUrls || [])];
    nextImages[index] = imageUrl;
    onChange("galleryImageUrls", nextImages);
  };

  const duAnTheoTrangThai = trangThaiDangLoc === "tat-ca"
    ? projects
    : projects.filter((item) => trangThaiDangLoc === "dang-hien" ? item.isActive : !item.isActive);

  const duAnTheoPhanLoai = phanLoaiDangLoc === "tat-ca"
    ? duAnTheoTrangThai
    : phanLoaiDangLoc === "chua-phan-loai"
      ? duAnTheoTrangThai.filter((item) => layNhanPhanLoaiDuAn(item.category) === (item.category || ""))
    : duAnTheoTrangThai.filter((item) => chuanHoaPhanLoaiDuAn(item.category) === phanLoaiDangLoc);
  const duAnDaLoc = tuKhoa
    ? duAnTheoPhanLoai.filter((item) => khopTuKhoa(
      item.name,
      item.location,
      item.description,
      item.priceRange,
      item.category,
      layNhanPhanLoaiDuAn(item.category),
    ).includes(tuKhoa))
    : duAnTheoPhanLoai;
  const tongSoTrang = Math.max(1, Math.ceil(duAnDaLoc.length / SO_DU_AN_MOI_TRANG));
  const trangDangDung = Math.min(trangHienTai, tongSoTrang);
  const viTriBatDau = (trangDangDung - 1) * SO_DU_AN_MOI_TRANG;
  const duAnTrongTrang = duAnDaLoc.slice(viTriBatDau, viTriBatDau + SO_DU_AN_MOI_TRANG);

  return (
    <section className="admin-section">
      <div className="admin-section-heading">
        <div>
          <span className="admin-section-kicker">Dự án có ảnh mới được hiển thị</span>
          <h2>Dự án</h2>
          <p>Quản lý danh sách dự án tiêu biểu và ảnh chi tiết.</p>
        </div>
        {loading && <span className="admin-loading-pill"><i className="bi bi-arrow-repeat"></i> Đang tải</span>}
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <form className="admin-form-grid" onSubmit={onSubmit}>
        <input className="admin-span-2" placeholder="Tên dự án" value={form.name} onChange={(event) => onChange("name", event.target.value)} required />
        <select value={form.category} onChange={(event) => onChange("category", event.target.value)} required>
          <option value="">Chọn loại công trình</option>
          {phanLoaiDuAn.map((item) => (
            <option value={item.value} key={item.value}>{item.label}</option>
          ))}
        </select>
        <input placeholder="Địa điểm" value={form.location} onChange={(event) => onChange("location", event.target.value)} required />
        <input className="admin-span-2" placeholder="Giá tham khảo, ví dụ Khoảng 320 - 520 triệu VNĐ" value={form.priceRange || ""} onChange={(event) => onChange("priceRange", event.target.value)} />
        <AdminImageUpload value={form.imageUrl} onChange={(imageUrl) => onChange("imageUrl", imageUrl)} label="Ảnh đại diện dự án" />
        <div className="admin-span-2 admin-project-gallery-editor">
          <h3>Ảnh chi tiết dự án</h3>
          <p>Các ảnh này sẽ tự chuyển qua lại ở trang chi tiết dự án. Có thể để trống ô không dùng.</p>
          <div className="admin-project-gallery-grid">
            {[0, 1, 2, 3].map((index) => (
              <AdminImageUpload
                key={`project-gallery-${index}`}
                value={form.galleryImageUrls?.[index] || ""}
                onChange={(imageUrl) => doiAnhPhuDuAn(index, imageUrl)}
                label={`Ảnh phụ ${index + 1}`}
              />
            ))}
          </div>
        </div>
        <textarea className="admin-span-2" placeholder="Mô tả dự án" value={form.description} onChange={(event) => onChange("description", event.target.value)} required />
        <input type="date" value={form.completedAt || ""} onChange={(event) => onChange("completedAt", event.target.value)} />
        <label className="admin-check">
          <input type="checkbox" checked={form.isFeatured} onChange={(event) => onChange("isFeatured", event.target.checked)} />
          Dự án nổi bật
        </label>
        <label className="admin-check">
          <input type="checkbox" checked={form.isActive} onChange={(event) => onChange("isActive", event.target.checked)} />
          Đang hiển thị
        </label>
        <div className="admin-form-actions admin-span-2">
          <button className="btn hero-primary-button" type="submit">{editingId ? "Cập nhật" : "Thêm mới"}</button>
          <button className="btn admin-secondary-button" type="button" onClick={onReset}>Làm mới</button>
        </div>
      </form>
      <div className="admin-search-box">
        <i className="bi bi-search"></i>
        <input
          type="search"
          placeholder="Tìm dự án theo tên, phân loại, địa điểm hoặc giá..."
          value={tuKhoaTimKiem}
          onChange={(event) => {
            setTuKhoaTimKiem(event.target.value);
            setTrangHienTai(1);
          }}
        />
      </div>
      <div className="admin-project-filter-panel">
        <div>
          <span>Trạng thái</span>
          <div className="admin-project-filter" aria-label="Lọc dự án theo trạng thái">
            {boLocTrangThaiDuAn.map((item) => (
              <button
                className={trangThaiDangLoc === item.value ? "active" : ""}
                type="button"
                key={item.value}
                onClick={() => {
                  setTrangThaiDangLoc(item.value);
                  setTrangHienTai(1);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span>Phân loại</span>
          <div className="admin-project-filter" aria-label="Lọc dự án theo phân loại">
            {boLocDuAnAdmin.map((item) => (
              <button
                className={phanLoaiDangLoc === item.value ? "active" : ""}
                type="button"
                key={item.value}
                onClick={() => {
                  setPhanLoaiDangLoc(item.value);
                  setTrangHienTai(1);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="admin-card-grid">
        {duAnTrongTrang.map((item, index) => {
          const projectImageUrl = taoUrlAnhAdmin(item.imageUrl, anhDuAnMacDinh[index % anhDuAnMacDinh.length]);

          return (
            <article className="admin-manage-card project" key={item.id}>
              {projectImageUrl ? (
                <img src={projectImageUrl} alt={item.name} onError={(event) => { event.currentTarget.style.display = "none"; }} />
              ) : (
                <div className="admin-card-image-empty"><i className="bi bi-image"></i></div>
              )}
              <div>
                <span className={`admin-status-badge ${item.isActive ? "is-active" : "is-hidden"}`}>
                  {item.isActive ? "Đang hiện" : "Đang ẩn"}
                </span>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                {item.priceRange && <strong className="admin-price-text">{item.priceRange}</strong>}
                <span>{layNhanPhanLoaiDuAn(item.category)} - {item.location}</span>
                {!!item.galleryImageUrls?.length && <span>{item.galleryImageUrls.length} ảnh chi tiết</span>}
              </div>
              <div className="admin-card-actions">
                <button type="button" onClick={() => onEdit(item)}>Sửa</button>
                <button type="button" onClick={() => onToggleVisibility(item)}>
                  {item.isActive ? "Ẩn" : "Hiện"}
                </button>
                <button className="danger" type="button" onClick={() => onDeletePermanent(item)}>
                  Xóa vĩnh viễn
                </button>
              </div>
            </article>
          );
        })}
        {!duAnDaLoc.length && <p className="admin-empty admin-span-2">Chưa có dự án phù hợp với bộ lọc này.</p>}
      </div>
      {tongSoTrang > 1 && (
        <div className="site-pagination admin-pagination" aria-label="Phân trang dự án admin">
          <button type="button" disabled={trangDangDung === 1} onClick={() => setTrangHienTai((trang) => Math.max(1, trang - 1))}>
            Trước
          </button>
          {Array.from({ length: tongSoTrang }, (_, index) => index + 1).map((trang) => (
            <button className={trangDangDung === trang ? "active" : ""} type="button" key={trang} onClick={() => setTrangHienTai(trang)}>
              {trang}
            </button>
          ))}
          <button type="button" disabled={trangDangDung === tongSoTrang} onClick={() => setTrangHienTai((trang) => Math.min(tongSoTrang, trang + 1))}>
            Sau
          </button>
        </div>
      )}
    </section>
  );
}

function TrangChuAdmin({ form, loading, error, message, onSave, onChangeImage, onChangeBadge }) {
  return (
    <section className="admin-section">
      <div className="admin-section-heading">
        <div>
          <span className="admin-section-kicker">Hero trang chủ</span>
          <h2>Trang chủ</h2>
          <p>Quản lý cụm ảnh Hero: ảnh lớn tự chuyển sau 3 giây và 2 ảnh nhỏ bên cạnh.</p>
        </div>
        {loading && <span className="admin-loading-pill"><i className="bi bi-arrow-repeat"></i> Đang tải</span>}
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}
      <div className="admin-home-editor">
        <div>
          <h3>Ảnh lớn tự chuyển</h3>
          <p>Chọn 1 đến 3 ảnh. Trang chủ sẽ tự đổi ảnh lớn sau mỗi 3 giây.</p>
          <div className="admin-home-image-grid">
            {[0, 1, 2].map((index) => (
              <AdminImageUpload
                key={`main-${index}`}
                value={form.mainImages[index] || ""}
                onChange={(imageUrl) => onChangeImage("mainImages", index, imageUrl)}
                label={`Ảnh lớn ${index + 1}`}
              />
            ))}
          </div>
        </div>
        <div>
          <h3>Ảnh nhỏ bên cạnh</h3>
          <p>Hai ảnh này nằm bên phải ảnh lớn, nên ưu tiên ảnh cabin, sảnh hoặc công trình rõ nét.</p>
          <div className="admin-home-image-grid">
            {[0, 1].map((index) => (
              <AdminImageUpload
                key={`side-${index}`}
                value={form.sideImages[index] || ""}
                onChange={(imageUrl) => onChangeImage("sideImages", index, imageUrl)}
                label={`Ảnh nhỏ ${index + 1}`}
              />
            ))}
          </div>
        </div>
        <label className="admin-home-badge">
          <span>Nội dung badge</span>
          <input value={form.badgeText} onChange={(event) => onChangeBadge(event.target.value)} placeholder="Ví dụ: Hỗ trợ kỹ thuật 24/7" />
        </label>
        <button className="btn hero-primary-button admin-home-save" type="button" onClick={onSave} disabled={loading}>
          <i className="bi bi-save"></i>
          Lưu ảnh Hero
        </button>
      </div>
    </section>
  );
}

function layTinhTrangBaoTri(item) {
  if (!item.isActive) {
    return { label: "Tạm ngưng", className: "is-hidden" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextDate = new Date(item.nextMaintenanceAt);
  nextDate.setHours(0, 0, 0, 0);
  const soNgayConLai = Math.ceil((nextDate - today) / 86400000);

  if (soNgayConLai < 0) return { label: "Quá hạn", className: "is-overdue" };
  if (soNgayConLai <= 14) return { label: "Sắp bảo trì", className: "is-due" };
  return { label: "Đang theo dõi", className: "is-active" };
}

function BaoTriAdmin({ customers, form, editingId, loading, error, onSubmit, onEdit, onToggleVisibility, onDelete, onChange, onReset }) {
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");
  const [trangHienTai, setTrangHienTai] = useState(1);
  const tuKhoa = tuKhoaTimKiem.trim().toLowerCase();
  const danhSachKhach = useMemo(() => {
    if (!tuKhoa) return customers;

    return customers.filter((item) => khopTuKhoa(
      item.customerName,
      item.phoneNumber,
      item.email,
      item.projectName,
      item.projectType,
      item.address,
      item.note,
    ).includes(tuKhoa));
  }, [customers, tuKhoa]);
  const tongSoTrang = Math.max(1, Math.ceil(danhSachKhach.length / SO_BAO_TRI_MOI_TRANG));
  const trangDangDung = Math.min(trangHienTai, tongSoTrang);
  const viTriBatDau = (trangDangDung - 1) * SO_BAO_TRI_MOI_TRANG;
  const khachTrongTrang = danhSachKhach.slice(viTriBatDau, viTriBatDau + SO_BAO_TRI_MOI_TRANG);

  return (
    <section className="admin-section">
      <div className="admin-section-heading">
        <div>
          <span className="admin-section-kicker">Khách đã làm thang máy</span>
          <h2>Danh sách bảo trì</h2>
          <p>Quản lý khách đã lắp đặt, ngày bàn giao và lịch bảo trì tiếp theo.</p>
        </div>
        {loading && <span className="admin-loading-pill"><i className="bi bi-arrow-repeat"></i> Đang tải</span>}
      </div>
      {error && <div className="alert alert-danger">{error}</div>}

      <form className="admin-form-grid" onSubmit={onSubmit}>
        <input placeholder="Tên khách hàng" value={form.customerName} onChange={(event) => onChange("customerName", event.target.value)} required />
        <input
          inputMode="numeric"
          maxLength="10"
          pattern="[0-9]{10}"
          placeholder="Số điện thoại 10 số"
          title="Số điện thoại phải gồm đúng 10 chữ số"
          value={form.phoneNumber}
          onChange={(event) => onChange("phoneNumber", event.target.value.replace(/\D/g, "").slice(0, 10))}
          required
        />
        <input
          type="email"
          placeholder="Email, ví dụ khach@example.com"
          title="Email phải có dạng hợp lệ, ví dụ khach@example.com"
          value={form.email || ""}
          onChange={(event) => onChange("email", event.target.value)}
        />
        <input placeholder="Tên công trình / dự án" value={form.projectName} onChange={(event) => onChange("projectName", event.target.value)} required />
        <select value={form.projectType} onChange={(event) => onChange("projectType", event.target.value)} required>
          <option value="">Chọn loại công trình</option>
          {phanLoaiDuAn.map((item) => (
            <option value={item.value} key={item.value}>{item.label}</option>
          ))}
        </select>
        <input placeholder="Địa chỉ công trình" value={form.address} onChange={(event) => onChange("address", event.target.value)} required />
        <label>
          Ngày lắp đặt / bàn giao
          <input type="date" value={form.installedAt || ""} onChange={(event) => onChange("installedAt", event.target.value)} required />
        </label>
        <label>
          Ngày bảo trì tiếp theo
          <input type="date" value={form.nextMaintenanceAt || ""} onChange={(event) => onChange("nextMaintenanceAt", event.target.value)} required />
        </label>
        <textarea className="admin-span-2" placeholder="Ghi chú bảo trì" value={form.note || ""} onChange={(event) => onChange("note", event.target.value)} />
        <label className="admin-check">
          <input type="checkbox" checked={form.isActive} onChange={(event) => onChange("isActive", event.target.checked)} />
          Đang theo dõi bảo trì
        </label>
        <div className="admin-form-actions">
          <button className="btn hero-primary-button" type="submit">{editingId ? "Cập nhật" : "Thêm khách"}</button>
          <button className="btn admin-secondary-button" type="button" onClick={onReset}>Làm mới</button>
        </div>
      </form>

      <div className="admin-search-box">
        <i className="bi bi-search"></i>
        <input
          type="search"
          placeholder="Tìm khách bảo trì theo tên, SĐT, email, công trình hoặc địa chỉ..."
          value={tuKhoaTimKiem}
          onChange={(event) => {
            setTuKhoaTimKiem(event.target.value);
            setTrangHienTai(1);
          }}
        />
      </div>

      <div className="admin-card-grid">
        {khachTrongTrang.map((item) => {
          const tinhTrang = layTinhTrangBaoTri(item);

          return (
            <article className={`admin-manage-card maintenance ${item.isActive ? "" : "is-hidden"}`} key={item.id}>
              <i className="bi bi-calendar-check"></i>
              <div>
                <span className={`admin-status-badge ${tinhTrang.className}`}>{tinhTrang.label}</span>
                <h3>{item.customerName}</h3>
                <p>{item.phoneNumber}{item.email ? ` - ${item.email}` : ""}</p>
                <strong className="admin-price-text">{item.projectName}</strong>
                <span>{layNhanPhanLoaiDuAn(item.projectType)} - {item.address}</span>
                <span>Ngày bàn giao: {dinhDangNgayNgan(item.installedAt)}</span>
                <span>Bảo trì tiếp theo: {dinhDangNgayNgan(item.nextMaintenanceAt)}</span>
                {item.note && <p>{item.note}</p>}
              </div>
              <div className="admin-card-actions">
                <button type="button" onClick={() => onEdit(item)}>Sửa</button>
                <button type="button" onClick={() => onToggleVisibility(item)}>
                  {item.isActive ? "Ngưng theo dõi" : "Theo dõi lại"}
                </button>
                <button className="danger" type="button" onClick={() => onDelete(item)}>
                  Xóa vĩnh viễn
                </button>
              </div>
            </article>
          );
        })}
        {!danhSachKhach.length && <p className="admin-empty admin-span-2">Chưa có khách bảo trì phù hợp.</p>}
      </div>

      {tongSoTrang > 1 && (
        <div className="site-pagination admin-pagination" aria-label="Phân trang khách bảo trì admin">
          <button type="button" disabled={trangDangDung === 1} onClick={() => setTrangHienTai((trang) => Math.max(1, trang - 1))}>
            Trước
          </button>
          {Array.from({ length: tongSoTrang }, (_, index) => index + 1).map((trang) => (
            <button className={trangDangDung === trang ? "active" : ""} type="button" key={trang} onClick={() => setTrangHienTai(trang)}>
              {trang}
            </button>
          ))}
          <button type="button" disabled={trangDangDung === tongSoTrang} onClick={() => setTrangHienTai((trang) => Math.min(tongSoTrang, trang + 1))}>
            Sau
          </button>
        </div>
      )}
    </section>
  );
}

function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem("adminToken") || "");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("adminUser")) || null;
    } catch {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState("revenue");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [maintenanceCustomers, setMaintenanceCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [serviceWarning, setServiceWarning] = useState("");
  const [homeMessage, setHomeMessage] = useState("");
  const [serviceForm, setServiceForm] = useState(dichVuRong);
  const [maintenanceForm, setMaintenanceForm] = useState(khachBaoTriRong);
  const [projectForm, setProjectForm] = useState(duAnRong);
  const [homeHeroForm, setHomeHeroForm] = useState(caiDatHeroRong);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editingMaintenanceId, setEditingMaintenanceId] = useState(null);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [adminToast, setAdminToast] = useState(null);
  const [xacNhanAdmin, setXacNhanAdmin] = useState(null);
  const toastTimerRef = useRef(null);

  const thongKe = useMemo(() => ({
    contacts: contacts.length,
    maintenance: maintenanceCustomers.filter((item) => item.isActive).length,
    services: services.filter((item) => item.isActive).length,
    projects: projects.length,
  }), [contacts, maintenanceCustomers, projects.length, services]);

  const hienThongBao = (message, type = "success") => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    setAdminToast({ message, type });
    toastTimerRef.current = window.setTimeout(() => {
      setAdminToast(null);
      toastTimerRef.current = null;
    }, 3200);
  };

  const moXacNhanXoa = (config) => {
    setXacNhanAdmin(config);
  };

  const taiLienHe = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await apiClient.get("/contacts");
      setContacts(data);
    } catch (err) {
      setError(layLoiApi(err));
    } finally {
      setLoading(false);
    }
  };

  const taiDichVu = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, dangDungApiCu } = await layDichVuChoAdmin();
      setServices(data);
      setServiceWarning(dangDungApiCu ? canhBaoBackendDichVuCu : "");
    } catch (err) {
      setError(layLoiApi(err));
    } finally {
      setLoading(false);
    }
  };

  const taiKhachBaoTri = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await apiClient.get("/maintenance-customers");
      setMaintenanceCustomers(data);
    } catch (err) {
      setError(layLoiApi(err));
    } finally {
      setLoading(false);
    }
  };

  const taiDuAn = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await layDuAnChoAdmin();
      setProjects(data);
    } catch (err) {
      setError(layLoiApi(err));
    } finally {
      setLoading(false);
    }
  };

  const xuLyDangNhap = (data) => {
    setToken(data.token);
    setUser(data.user);
    setActiveTab("revenue");
    taiLienHe();
  };

  const dangXuat = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setToken("");
    setUser(null);
  };

  const doiTab = (tab) => {
    setActiveTab(tab);
    setError("");
    setHomeMessage("");
    setServiceWarning("");
  };

  useEffect(() => {
    if (!token) return;

    let dangHoatDong = true;

    const taiTongQuanAdmin = async () => {
      try {
        const [contactsResponse, servicesResponse, projectsResponse, maintenanceResponse] = await Promise.all([
          apiClient.get("/contacts"),
          layDichVuChoAdmin(),
          layDuAnChoAdmin(),
          apiClient.get("/maintenance-customers"),
        ]);

        if (!dangHoatDong) return;

        setContacts(contactsResponse.data);
        setServices(servicesResponse.data);
        setProjects(projectsResponse);
        setMaintenanceCustomers(maintenanceResponse.data);
        setServiceWarning(servicesResponse.dangDungApiCu ? canhBaoBackendDichVuCu : "");
      } catch (err) {
        if (dangHoatDong) {
          setError(layLoiApi(err));
        }
      }
    };

    taiTongQuanAdmin();

    return () => {
      dangHoatDong = false;
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;

    let dangHoatDong = true;

    const taiDuLieuTheoTab = async () => {
      if (activeTab === "ai") return;
      setLoading(true);
      setError("");
      setHomeMessage("");

      try {
        const duongDan = activeTab === "contacts"
          ? "/contacts"
          : activeTab === "services"
            ? "/services/admin"
            : activeTab === "home"
              ? "/site-settings/home-hero"
              : activeTab === "maintenance"
                ? "/maintenance-customers"
              : activeTab === "projects"
                ? null
                : "/projects";
        const response = activeTab === "services"
          ? await layDichVuChoAdmin()
          : activeTab === "projects"
            ? await layDuAnChoAdmin()
          : await apiClient.get(duongDan);
        const data = activeTab === "projects" ? response : response.data;

        if (!dangHoatDong) return;

        if (activeTab === "contacts") {
          setContacts(data);
        } else if (activeTab === "maintenance") {
          setMaintenanceCustomers(data);
        } else if (activeTab === "services") {
          setServices(data);
          setServiceWarning(response.dangDungApiCu ? canhBaoBackendDichVuCu : "");
        } else if (activeTab === "home") {
          setHomeHeroForm(taoFormCaiDatHero(data));
        } else {
          setProjects(data);
        }
      } catch (err) {
        if (dangHoatDong) {
          setError(layLoiApi(err));
        }
      } finally {
        if (dangHoatDong) {
          setLoading(false);
        }
      }
    };

    taiDuLieuTheoTab();

    return () => {
      dangHoatDong = false;
    };
  }, [activeTab, token]);

  useEffect(() => () => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
  }, []);

  const capNhatTrangThaiLienHe = async (id, status) => {
    try {
      await apiClient.put(`/contacts/${id}/status`, { status });
      await taiLienHe();
      hienThongBao("Đã cập nhật trạng thái liên hệ.");
    } catch (err) {
      setError(layLoiApi(err));
      hienThongBao(layLoiApi(err), "error");
    }
  };

  const xoaLienHe = async (id) => {
    moXacNhanXoa({
      title: "Xóa yêu cầu liên hệ?",
      message: "Yêu cầu này sẽ bị xóa khỏi danh sách admin. Thao tác này không thể hoàn tác.",
      confirmText: "Xóa liên hệ",
      onConfirm: async () => {
        try {
          await apiClient.delete(`/contacts/${id}`);
          await taiLienHe();
          hienThongBao("Đã xóa liên hệ.");
        } catch (err) {
          setError(layLoiApi(err));
          hienThongBao(layLoiApi(err), "error");
        }
      },
    });
  };

  const luuKhachBaoTri = async (event) => {
    event.preventDefault();
    const phoneNumber = maintenanceForm.phoneNumber.trim();
    const email = maintenanceForm.email?.trim() || "";
    const installedAt = maintenanceForm.installedAt;
    const nextMaintenanceAt = maintenanceForm.nextMaintenanceAt;

    if (!laSoDienThoai10So(phoneNumber)) {
      hienThongBao("Số điện thoại phải gồm đúng 10 chữ số.", "error");
      return;
    }

    if (!laEmailHopLe(email)) {
      hienThongBao("Email phải đúng định dạng và có ký tự @.", "error");
      return;
    }

    if (!laNgayHopLe(installedAt) || !laNgayHopLe(nextMaintenanceAt)) {
      hienThongBao("Ngày lắp đặt và ngày bảo trì phải hợp lệ trong khoảng năm 2000 - 2100.", "error");
      return;
    }

    if (new Date(nextMaintenanceAt) < new Date(installedAt)) {
      hienThongBao("Ngày bảo trì tiếp theo không được trước ngày lắp đặt.", "error");
      return;
    }

    const payload = {
      ...maintenanceForm,
      phoneNumber,
      email,
      projectType: chuanHoaPhanLoaiDuAn(maintenanceForm.projectType),
      installedAt,
      nextMaintenanceAt,
    };

    try {
      if (editingMaintenanceId) {
        await apiClient.put(`/maintenance-customers/${editingMaintenanceId}`, payload);
      } else {
        await apiClient.post("/maintenance-customers", payload);
      }
      setMaintenanceForm(khachBaoTriRong);
      setEditingMaintenanceId(null);
      await taiKhachBaoTri();
      hienThongBao(editingMaintenanceId ? "Đã lưu khách bảo trì." : "Đã thêm khách bảo trì.");
    } catch (err) {
      setError(layLoiApi(err));
      hienThongBao(layLoiApi(err), "error");
    }
  };

  const suaKhachBaoTri = (item) => {
    setEditingMaintenanceId(item.id);
    setMaintenanceForm({
      ...khachBaoTriRong,
      ...item,
      projectType: chuanHoaPhanLoaiDuAn(item.projectType),
      installedAt: dinhDangNgayInput(item.installedAt),
      nextMaintenanceAt: dinhDangNgayInput(item.nextMaintenanceAt),
    });
  };

  const doiTheoDoiKhachBaoTri = async (item) => {
    const hienThiMoi = !item.isActive;
    try {
      await apiClient.put(`/maintenance-customers/${item.id}/visibility`, { isActive: hienThiMoi });
      await taiKhachBaoTri();
      hienThongBao(hienThiMoi ? "Đã theo dõi lại khách bảo trì." : "Đã ngưng theo dõi khách bảo trì.");
    } catch (err) {
      setError(layLoiApi(err));
      hienThongBao(layLoiApi(err), "error");
    }
  };

  const xoaKhachBaoTri = (item) => {
    moXacNhanXoa({
      title: `Xóa khách "${item.customerName}"?`,
      message: "Khách này sẽ bị xóa khỏi danh sách bảo trì. Thao tác này không thể hoàn tác.",
      onConfirm: async () => {
        try {
          await apiClient.delete(`/maintenance-customers/${item.id}/permanent`);
          if (editingMaintenanceId === item.id) {
            setMaintenanceForm(khachBaoTriRong);
            setEditingMaintenanceId(null);
          }
          await taiKhachBaoTri();
          hienThongBao("Đã xóa khách bảo trì.");
        } catch (err) {
          setError(layLoiApi(err));
          hienThongBao(layLoiApi(err), "error");
        }
      },
    });
  };

  const luuDichVu = async (event) => {
    event.preventDefault();
    const payload = { ...serviceForm, slug: "", icon: serviceForm.icon || "bi-tools", displayOrder: Number(serviceForm.displayOrder) || 0 };
    try {
      if (editingServiceId) {
        await apiClient.put(`/services/${editingServiceId}`, payload);
      } else {
        await apiClient.post("/services", payload);
      }
      setServiceForm(dichVuRong);
      setEditingServiceId(null);
      await taiDichVu();
      hienThongBao(editingServiceId ? "Đã lưu thay đổi dịch vụ." : "Đã thêm dịch vụ.");
    } catch (err) {
      setError(layLoiApi(err));
      hienThongBao(layLoiApi(err), "error");
    }
  };

  const suaDichVu = (item) => {
    setEditingServiceId(item.id);
    setServiceForm({ ...dichVuRong, ...item });
  };

  const doiHienThiDichVu = async (item) => {
    const hienThiMoi = !item.isActive;
    if (!window.confirm(hienThiMoi ? "Hiện dịch vụ này trên website?" : "Ẩn dịch vụ này khỏi website?")) return;
    try {
      await apiClient.put(`/services/${item.id}/visibility`, { isActive: hienThiMoi });
      await taiDichVu();
      hienThongBao(hienThiMoi ? "Đã hiện dịch vụ trên website." : "Đã ẩn dịch vụ khỏi website.");
    } catch (err) {
      if (err?.response?.status === 404) {
        setError("");
        setServiceWarning("Backend chưa được restart nên chưa dùng được nút Ẩn/Hiện. Hãy tắt backend đang chạy rồi chạy lại `dotnet run`.");
        hienThongBao("Backend chưa hỗ trợ ẩn/hiện dịch vụ. Hãy restart backend.", "error");
        return;
      }

      setError(layLoiApi(err));
      hienThongBao(layLoiApi(err), "error");
    }
  };

  const xoaVinhVienDichVu = (item) => {
    moXacNhanXoa({
      title: `Xóa vĩnh viễn "${item.name}"?`,
      message: "Dịch vụ sẽ bị xóa khỏi database và không thể khôi phục từ admin.",
      onConfirm: async () => {
        try {
          await apiClient.delete(`/services/${item.id}/permanent`);
          if (editingServiceId === item.id) {
            setServiceForm(dichVuRong);
            setEditingServiceId(null);
          }
          await taiDichVu();
          hienThongBao("Đã xóa vĩnh viễn dịch vụ.");
        } catch (err) {
          if (err?.response?.status === 404) {
            setError("");
            setServiceWarning("Backend chưa được restart nên chưa dùng được nút Xóa. Hãy tắt backend đang chạy rồi chạy lại `dotnet run`.");
            hienThongBao("Backend chưa hỗ trợ xóa dịch vụ. Hãy restart backend.", "error");
            return;
          }

          setError(layLoiApi(err));
          hienThongBao(layLoiApi(err), "error");
        }
      },
    });
  };

  const luuDuAn = async (event) => {
    event.preventDefault();
    if (!projectForm.imageUrl) {
      hienThongBao("Vui lòng chọn ảnh đại diện dự án trước khi lưu.", "error");
      return;
    }

    const payload = {
      ...projectForm,
      category: chuanHoaPhanLoaiDuAn(projectForm.category),
      galleryImageUrls: (projectForm.galleryImageUrls || []).filter(Boolean),
      completedAt: projectForm.completedAt || null,
    };
    try {
      if (editingProjectId) {
        await apiClient.put(`/projects/${editingProjectId}`, payload);
      } else {
        await apiClient.post("/projects", payload);
      }
      setProjectForm(duAnRong);
      setEditingProjectId(null);
      await taiDuAn();
      hienThongBao(editingProjectId ? "Đã lưu thay đổi dự án." : "Đã thêm dự án.");
    } catch (err) {
      setError(layLoiApi(err));
      hienThongBao(layLoiApi(err), "error");
    }
  };

  const suaDuAn = (item) => {
    setEditingProjectId(item.id);
    setProjectForm({
      ...duAnRong,
      ...item,
      category: chuanHoaPhanLoaiDuAn(item.category),
      completedAt: item.completedAt ? item.completedAt.slice(0, 10) : "",
      galleryImageUrls: [...(item.galleryImageUrls || []), "", "", "", ""].slice(0, 4),
    });
  };

  const doiHienThiDuAn = async (item) => {
    const hienThiMoi = !item.isActive;
    if (!window.confirm(hienThiMoi ? "Hiện dự án này trên website?" : "Ẩn dự án này khỏi website?")) return;
    try {
      await apiClient.put(`/projects/${item.id}/visibility`, { isActive: hienThiMoi });
      await taiDuAn();
      hienThongBao(hienThiMoi ? "Đã hiện dự án trên website." : "Đã ẩn dự án khỏi website.");
    } catch (err) {
      setError(layLoiApi(err));
      hienThongBao(layLoiApi(err), "error");
    }
  };

  const xoaVinhVienDuAn = (item) => {
    moXacNhanXoa({
      title: `Xóa vĩnh viễn "${item.name}"?`,
      message: "Dự án, ảnh đại diện và danh sách ảnh chi tiết sẽ bị gỡ khỏi database. Thao tác này không thể hoàn tác.",
      onConfirm: async () => {
        try {
          await apiClient.delete(`/projects/${item.id}/permanent`);
          if (editingProjectId === item.id) {
            setProjectForm(duAnRong);
            setEditingProjectId(null);
          }
          await taiDuAn();
          hienThongBao("Đã xóa vĩnh viễn dự án.");
        } catch (err) {
          setError(layLoiApi(err));
          hienThongBao(layLoiApi(err), "error");
        }
      },
    });
  };

  const luuCaiDatHero = async () => {
    setLoading(true);
    setError("");
    setHomeMessage("");
    try {
      const payload = {
        mainImages: homeHeroForm.mainImages.filter(Boolean),
        sideImages: homeHeroForm.sideImages.filter(Boolean),
        badgeText: homeHeroForm.badgeText,
      };
      const { data } = await apiClient.put("/site-settings/home-hero", payload);
      setHomeHeroForm(taoFormCaiDatHero(data));
      setHomeMessage("Đã lưu ảnh Hero trang chủ.");
      hienThongBao("Đã lưu ảnh Hero trang chủ.");
    } catch (err) {
      setError(layLoiApi(err));
      hienThongBao(layLoiApi(err), "error");
    } finally {
      setLoading(false);
    }
  };

  const capNhatAnhHero = (field, index, imageUrl) => {
    setHomeHeroForm((prev) => {
      const nextImages = [...prev[field]];
      nextImages[index] = imageUrl;
      return { ...prev, [field]: nextImages };
    });
  };

  if (!token) {
    return <AdminLogin onLogin={xuLyDangNhap} />;
  }

  return (
    <main className="admin-page">
      <AdminToast toast={adminToast} onClose={() => setAdminToast(null)} />
      <AdminConfirmModal confirm={xacNhanAdmin} onClose={() => setXacNhanAdmin(null)} />
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onShowToast={hienThongBao}
        onLogout={dangXuat}
      />
      <div className="admin-shell">
        <AdminToolbar
          activeTab={activeTab}
          onChangeTab={doiTab}
          user={user}
          onLogout={dangXuat}
          onOpenChangePassword={() => setShowChangePassword(true)}
        />

        {activeTab !== "revenue" && (
          <div className="admin-summary-grid">
            <article><span>Liên hệ</span><strong>{thongKe.contacts}</strong></article>
            <article><span>Khách bảo trì</span><strong>{thongKe.maintenance}</strong></article>
            <article><span>Dịch vụ đang hiện</span><strong>{thongKe.services}</strong></article>
            <article><span>Dự án</span><strong>{thongKe.projects}</strong></article>
          </div>
        )}

        {activeTab === "contacts" && (
          <LienHeAdmin
            contacts={contacts}
            loading={loading}
            error={error}
            onChangeStatus={capNhatTrangThaiLienHe}
            onDelete={xoaLienHe}
          />
        )}

        {activeTab === "maintenance" && (
          <BaoTriAdmin
            customers={maintenanceCustomers}
            form={maintenanceForm}
            editingId={editingMaintenanceId}
            loading={loading}
            error={error}
            onSubmit={luuKhachBaoTri}
            onEdit={suaKhachBaoTri}
            onToggleVisibility={doiTheoDoiKhachBaoTri}
            onDelete={xoaKhachBaoTri}
            onChange={(field, value) => setMaintenanceForm((prev) => ({ ...prev, [field]: value }))}
            onReset={() => { setMaintenanceForm(khachBaoTriRong); setEditingMaintenanceId(null); }}
          />
        )}

        {activeTab === "home" && (
          <TrangChuAdmin
            form={homeHeroForm}
            loading={loading}
            error={error}
            message={homeMessage}
            onSave={luuCaiDatHero}
            onChangeImage={capNhatAnhHero}
            onChangeBadge={(value) => setHomeHeroForm((prev) => ({ ...prev, badgeText: value }))}
          />
        )}

        {activeTab === "services" && (
          <DichVuAdmin
            services={services}
            form={serviceForm}
            editingId={editingServiceId}
            loading={loading}
            error={error}
            warning={serviceWarning}
            onSubmit={luuDichVu}
            onEdit={suaDichVu}
            onToggleVisibility={doiHienThiDichVu}
            onDelete={xoaVinhVienDichVu}
            onChange={(field, value) => setServiceForm((prev) => ({ ...prev, [field]: value }))}
            onReset={() => { setServiceForm(dichVuRong); setEditingServiceId(null); }}
          />
        )}

        {activeTab === "projects" && (
          <DuAnAdmin
            projects={projects}
            form={projectForm}
            editingId={editingProjectId}
            loading={loading}
            error={error}
            onSubmit={luuDuAn}
            onEdit={suaDuAn}
            onToggleVisibility={doiHienThiDuAn}
            onDeletePermanent={xoaVinhVienDuAn}
            onChange={(field, value) => setProjectForm((prev) => ({ ...prev, [field]: value }))}
            onReset={() => { setProjectForm(duAnRong); setEditingProjectId(null); }}
          />
        )}

        {activeTab === "ai" && (
          <AiTrainingAdmin onShowToast={hienThongBao} />
        )}

        {activeTab === "estimates" && (
          <DuToanAdmin onShowToast={hienThongBao} />
        )}

        {activeTab === "revenue" && (
          <DoanhThuAdmin onShowToast={hienThongBao} />
        )}
      </div>
    </main>
  );
}

/* ===================== DOANH THU ADMIN - EXECUTIVE DASHBOARD ===================== */
function DoanhThuAdmin({ onShowToast }) {
  const [estimates, setEstimates] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("all"); // "all" | "year" | "quarter" | "month"
  const [searchTerm, setSearchTerm] = useState("");
  const [tableStatus, setTableStatus] = useState("all");
  const [hoveredMonth, setHoveredMonth] = useState(null);

  const formatVND = (val) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val || 0);

  const formatShortVND = (val) => {
    if (!val || val === 0) return "0 ₫";
    if (val >= 1000000000) return (val / 1000000000).toFixed(2) + " Tỷ";
    if (val >= 1000000) return (val / 1000000).toFixed(0) + " Tr";
    return formatVND(val);
  };

  const mapElevatorTypeName = (type) => {
    switch (type) {
      case "homelift-kinh":
        return "Homelift Kính Panorama";
      case "inox-guong-vang":
        return "Inox Gương Vàng Luxury";
      case "inox-tieu-chuan":
        return "Inox 304 Tiêu Chuẩn";
      default:
        return type || "Thang Máy Tiêu Chuẩn";
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "DealClosed":
        return { label: "Chốt deal ✓", class: "status-dealclosed", dotColor: "#15803d" };
      case "SurveyScheduled":
        return { label: "Lên lịch khảo sát", class: "status-surveyscheduled", dotColor: "#7e22ce" };
      case "Contacted":
        return { label: "Đã liên hệ tư vấn", class: "status-contacted", dotColor: "#b45309" };
      case "New":
        return { label: "Mới gửi dự toán", class: "status-new", dotColor: "#1d4ed8" };
      case "Cancelled":
        return { label: "Đã huỷ", class: "status-cancelled", dotColor: "#b91c1c" };
      default:
        return { label: status, class: "status-new", dotColor: "#64748b" };
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      let estData = [];
      try {
        const estRes = await apiClient.get("/estimates/admin");
        estData = Array.isArray(estRes?.data) ? estRes.data : [];
      } catch {
        const estRes = await apiClient.get("/admin/estimates");
        estData = Array.isArray(estRes?.data) ? estRes.data : [];
      }

      let conData = [];
      try {
        const conRes = await apiClient.get("/contacts");
        conData = Array.isArray(conRes?.data) ? conRes.data : [];
      } catch {
        conData = [];
      }

      setEstimates(estData);
      setContacts(conData);
    } catch (e) {
      setError(layLoiApi(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    customerName: "",
    phoneNumber: "",
    email: "",
    address: "",
    buildingType: "biet-thu",
    stops: 4,
    capacityKg: 450,
    elevatorType: "homelift-kinh",
    motorBrand: "Fuji",
    doorType: "CO",
    status: "DealClosed",
    adminNotes: ""
  });

  const handleStatusChange = async (id, newStatus) => {
    try {
      try {
        await apiClient.patch(`/estimates/${id}/status`, { status: newStatus });
      } catch {
        await apiClient.patch(`/admin/estimates/${id}/status`, { status: newStatus });
      }
      setEstimates((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      if (newStatus === "DealClosed") {
        onShowToast?.("Đã chuyển sang Chốt deal ✓ — Doanh thu đã được cộng thêm!", "success");
      } else {
        onShowToast?.("Đã cập nhật trạng thái hợp đồng / dự toán.", "success");
      }
    } catch {
      onShowToast?.("Không thể cập nhật trạng thái.", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bản ghi này?")) return;
    try {
      try {
        await apiClient.delete(`/estimates/${id}`);
      } catch {
        await apiClient.delete(`/admin/estimates/${id}`);
      }
      setEstimates((prev) => prev.filter((item) => item.id !== id));
      onShowToast?.("Đã xóa bản ghi dự toán thành công.");
    } catch {
      onShowToast?.("Không thể xóa bản ghi.", "error");
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.customerName.trim() || !createForm.phoneNumber.trim()) {
      onShowToast?.("Vui lòng nhập họ tên và số điện thoại.", "warning");
      return;
    }
    setCreating(true);
    try {
      const createPayload = {
        customerName: createForm.customerName.trim(),
        phoneNumber: createForm.phoneNumber.trim(),
        email: createForm.email.trim() || "khachhang@gmail.com",
        address: createForm.address.trim() || "TP. Hồ Chí Minh",
        buildingType: createForm.buildingType,
        stops: Number(createForm.stops) || 4,
        capacityKg: Number(createForm.capacityKg) || 450,
        elevatorType: createForm.elevatorType,
        motorBrand: createForm.motorBrand,
        doorType: createForm.doorType
      };

      const { data: newEst } = await apiClient.post("/estimates", createPayload);

      if (newEst?.id && createForm.status !== "New") {
        try {
          await apiClient.patch(`/estimates/${newEst.id}/status`, {
            status: createForm.status,
            adminNotes: createForm.adminNotes
          });
          newEst.status = createForm.status;
          newEst.adminNotes = createForm.adminNotes;
        } catch {
          // ignore patch error
        }
      }

      setEstimates((prev) => [newEst, ...prev]);
      setShowCreateModal(false);
      setCreateForm({
        customerName: "",
        phoneNumber: "",
        email: "",
        address: "",
        buildingType: "biet-thu",
        stops: 4,
        capacityKg: 450,
        elevatorType: "homelift-kinh",
        motorBrand: "Fuji",
        doorType: "CO",
        status: "DealClosed",
        adminNotes: ""
      });
      onShowToast?.("Đã tạo hợp đồng mới thành công! Doanh thu đã được ghi nhận.", "success");
    } catch (err) {
      onShowToast?.(layLoiApi(err) || "Không thể tạo hợp đồng mới.", "error");
    } finally {
      setCreating(false);
    }
  };

  // Filter by period
  const now = new Date();
  const currentQuarter = Math.floor(now.getMonth() / 3);

  const filteredEstimates = estimates.filter((e) => {
    if (period === "all") return true;
    const d = new Date(e.createdAt);
    if (period === "year") return d.getFullYear() === now.getFullYear();
    if (period === "quarter") {
      return d.getFullYear() === now.getFullYear() && Math.floor(d.getMonth() / 3) === currentQuarter;
    }
    if (period === "month") {
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }
    return true;
  });

  const filteredContacts = contacts.filter((c) => {
    if (period === "all") return true;
    const d = new Date(c.createdAt);
    if (period === "year") return d.getFullYear() === now.getFullYear();
    if (period === "quarter") {
      return d.getFullYear() === now.getFullYear() && Math.floor(d.getMonth() / 3) === currentQuarter;
    }
    if (period === "month") {
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }
    return true;
  });

  // KPIs Calculations
  const dealClosed = filteredEstimates.filter((e) => e.status === "DealClosed");
  const totalRevenue = dealClosed.reduce((sum, e) => sum + ((e.estimatedPriceMin + e.estimatedPriceMax) / 2), 0);
  const closedRate = filteredEstimates.length > 0 ? ((dealClosed.length / filteredEstimates.length) * 100).toFixed(1) : 0;
  
  const pipelineEstimates = filteredEstimates.filter((e) => e.status !== "DealClosed" && e.status !== "Cancelled");
  const pipelineValue = pipelineEstimates.reduce((sum, e) => sum + ((e.estimatedPriceMin + e.estimatedPriceMax) / 2), 0);
  
  const totalLeads = filteredEstimates.length + filteredContacts.length;
  const avgDealValue = dealClosed.length > 0 ? totalRevenue / dealClosed.length : 0;

  // Monthly Chart Data (Last 6 or 12 months)
  const monthlyData = (() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
      months.push({
        key,
        label: `Tháng ${d.getMonth() + 1}`,
        shortLabel: `T${d.getMonth() + 1}`,
        actual: 0,
        pipeline: 0,
        count: 0
      });
    }
    estimates.forEach((e) => {
      const d = new Date(e.createdAt);
      const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
      const item = months.find((m) => m.key === key);
      if (item) {
        const val = (e.estimatedPriceMin + e.estimatedPriceMax) / 2;
        if (e.status === "DealClosed") {
          item.actual += val;
          item.count += 1;
        } else if (e.status !== "Cancelled") {
          item.pipeline += val;
        }
      }
    });
    return months;
  })();

  const maxChartVal = Math.max(
    ...monthlyData.map((m) => Math.max(m.actual, m.pipeline)),
    100000000
  );

  // Elevator Type Distribution
  const typeMap = {};
  filteredEstimates.forEach((e) => {
    const rawType = e.elevatorType || "homelift-kinh";
    const name = mapElevatorTypeName(rawType);
    if (!typeMap[name]) {
      typeMap[name] = { name, value: 0, count: 0, rawType };
    }
    const val = (e.estimatedPriceMin + e.estimatedPriceMax) / 2;
    typeMap[name].value += val;
    typeMap[name].count += 1;
  });

  const typeList = Object.values(typeMap).sort((a, b) => b.value - a.value);
  const totalTypeVal = typeList.reduce((acc, t) => acc + t.value, 0) || 1;

  const typeColors = [
    "#0EA5E9", // Sky Blue for Homelift
    "#D9A441", // Luxury Gold for Inox Vàng
    "#10B981", // Emerald Green for Inox 304
    "#8B5CF6", // Purple for others
    "#F59E0B"  // Amber
  ];

  // Donut SVG geometry (Radius 65, Circumference = 2 * PI * 65 = 408.4)
  const donutRadius = 65;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let accumulatedOffset = 0;
  const donutSegments = typeList.map((t, idx) => {
    const percentage = t.value / totalTypeVal;
    const strokeDash = percentage * donutCircumference;
    const offset = accumulatedOffset;
    accumulatedOffset -= strokeDash;
    return {
      ...t,
      color: typeColors[idx % typeColors.length],
      strokeDash,
      offset,
      percentage: Math.round(percentage * 100)
    };
  });

  // Funnel Data
  const funnelStages = [
    { key: "New", name: "Dự toán mới", color: "#3B82F6" },
    { key: "Contacted", name: "Đã liên hệ tư vấn", color: "#F59E0B" },
    { key: "SurveyScheduled", name: "Lên lịch khảo sát", color: "#8B5CF6" },
    { key: "DealClosed", name: "Hợp đồng đã chốt", color: "#10B981" },
    { key: "Cancelled", name: "Đã hủy / Tạm dừng", color: "#EF4444" }
  ];

  const funnelCounts = funnelStages.map((stage, idx) => {
    const count = filteredEstimates.filter((e) => e.status === stage.key).length;
    const total = filteredEstimates.length || 1;
    const pct = Math.round((count / total) * 100);
    return { ...stage, count, pct, step: idx + 1 };
  });

  // Filtered Table Deals
  const tableData = filteredEstimates
    .filter((e) => {
      if (tableStatus !== "all" && e.status !== tableStatus) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        (e.customerName || "").toLowerCase().includes(term) ||
        (e.phoneNumber || "").toLowerCase().includes(term) ||
        (e.address || "").toLowerCase().includes(term) ||
        (mapElevatorTypeName(e.elevatorType) || "").toLowerCase().includes(term)
      );
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Export CSV
  const handleExportCSV = () => {
    if (estimates.length === 0) {
      onShowToast?.("Chưa có dữ liệu dự toán để xuất.", "warning");
      return;
    }
    const headers = [
      "Mã ID",
      "Khách Hàng",
      "Số Điện Thoại",
      "Email",
      "Địa Chỉ",
      "Loại Thang Máy",
      "Tải Trọng (kg)",
      "Số Tầng",
      "Giá Dự Toán Min (VND)",
      "Giá Dự Toán Max (VND)",
      "Trạng Thái",
      "Ngày Tạo",
      "Ghi Chú"
    ];
    const rows = estimates.map((e) => [
      e.id,
      `"${(e.customerName || "").replace(/"/g, '""')}"`,
      `"${e.phoneNumber || ""}"`,
      `"${e.email || ""}"`,
      `"${(e.address || "").replace(/"/g, '""')}"`,
      `"${mapElevatorTypeName(e.elevatorType)}"`,
      e.capacityKg || "",
      e.stops || "",
      e.estimatedPriceMin || 0,
      e.estimatedPriceMax || 0,
      `"${getStatusInfo(e.status).label}"`,
      `"${new Date(e.createdAt).toLocaleDateString("vi-VN")}"`,
      `"${(e.adminNotes || "").replace(/"/g, '""')}"`
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Bao_Cao_Doanh_Thu_Ha_Hong_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast?.("Đã xuất file báo cáo Excel (CSV) thành công!", "success");
  };

  if (loading) {
    return (
      <div className="admin-loading" style={{ minHeight: "360px" }}>
        <i className="bi bi-arrow-repeat" style={{ fontSize: 36, animation: "spin 1s linear infinite", color: "#D9A441" }}></i>
        <p style={{ fontWeight: 600, color: "#0B1F3A", marginTop: 12 }}>Đang kết nối trung tâm điều hành doanh thu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-card" style={{ color: "#e74c3c", padding: 40, textAlign: "center", borderRadius: 16 }}>
        <p><i className="bi bi-exclamation-octagon-fill" style={{ fontSize: 36, color: "#e74c3c" }}></i></p>
        <p style={{ fontWeight: 700, fontSize: "1.1rem", margin: "8px 0" }}>{error}</p>
        <p style={{ color: "#64748b", fontSize: "0.85rem", maxWidth: 450, margin: "0 auto 16px auto" }}>
          Hệ thống không thể tải báo cáo doanh thu từ máy chủ. Vui lòng bấm thử lại hoặc kiểm tra kết nối API.
        </p>
        <button
          type="button"
          onClick={fetchData}
          style={{
            padding: "9px 24px",
            background: "#0B1F3A",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "0.88rem"
          }}
        >
          <i className="bi bi-arrow-clockwise me-1"></i> Thử lại kết nối
        </button>
      </div>
    );
  }

  return (
    <div className="doanh-thu-admin">
      {/* 1. HERO COMMAND HEADER */}
      <div className="dt-hero-header dt-hero-header-compact">
        <div className="dt-hero-actions" style={{ width: "100%", justifyContent: "space-between" }}>
          {/* Segmented Filter */}
          <div className="dt-period-segmented">
            {[
              ["all", "Toàn Bộ"],
              ["year", "Năm 2026"],
              ["quarter", `Quý ${currentQuarter + 1}`],
              ["month", "Tháng Này"]
            ].map(([val, lbl]) => (
              <button
                key={val}
                className={period === val ? "active" : ""}
                onClick={() => setPeriod(val)}
                type="button"
              >
                {lbl}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className="dt-action-btn btn-primary-action"
              onClick={() => setShowCreateModal(true)}
              title="Tạo dự toán / hợp đồng mới để tính doanh số"
            >
              <i className="bi bi-plus-circle-fill"></i> Tạo Hợp Đồng Mới
            </button>
            <button type="button" className="dt-action-btn" onClick={handleExportCSV} title="Xuất dữ liệu Excel">
              <i className="bi bi-file-earmark-excel"></i> Xuất Excel
            </button>
            <button type="button" className="dt-action-btn" onClick={() => window.print()} title="In báo cáo">
              <i className="bi bi-printer"></i> In
            </button>
            <button type="button" className="dt-action-btn" onClick={fetchData} title="Làm mới số liệu">
              <i className="bi bi-arrow-clockwise"></i> Làm Mới
            </button>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE METRIC KPI CARDS */}
      <div className="dt-metrics-grid">
        {/* Card 1: Doanh thu chốt */}
        <div className="dt-metric-card card-emerald">
          <div className="dt-metric-top">
            <div className="dt-metric-icon-wrap icon-emerald">
              <i className="bi bi-cash-coin"></i>
            </div>
            <span className="dt-metric-badge badge-emerald">
              <i className="bi bi-check-circle-fill"></i> Đã Chốt
            </span>
          </div>
          <div className="dt-metric-body">
            <span className="dt-metric-label">Doanh Thu Ký Kết</span>
            <strong className="dt-metric-value" style={{ color: "#15803d" }}>
              {formatShortVND(totalRevenue)}
            </strong>
            <p className="dt-metric-subtext">
              <i className="bi bi-check2"></i> {dealClosed.length} hợp đồng chốt thành công
            </p>
          </div>
        </div>

        {/* Card 2: Pipeline */}
        <div className="dt-metric-card card-sapphire">
          <div className="dt-metric-top">
            <div className="dt-metric-icon-wrap icon-sapphire">
              <i className="bi bi-graph-up-arrow"></i>
            </div>
            <span className="dt-metric-badge badge-sapphire">
              <i className="bi bi-clock-history"></i> Pipeline
            </span>
          </div>
          <div className="dt-metric-body">
            <span className="dt-metric-label">Dòng Tiền Tiềm Năng</span>
            <strong className="dt-metric-value" style={{ color: "#1d4ed8" }}>
              {formatShortVND(pipelineValue)}
            </strong>
            <p className="dt-metric-subtext">
              <i className="bi bi-hourglass-split"></i> {pipelineEstimates.length} cơ hội đang theo đuổi
            </p>
          </div>
        </div>

        {/* Card 3: Win Rate */}
        <div className="dt-metric-card card-gold">
          <div className="dt-metric-top">
            <div className="dt-metric-icon-wrap icon-gold">
              <i className="bi bi-trophy-fill"></i>
            </div>
            <span className="dt-metric-badge badge-gold">
              <i className="bi bi-stars"></i> Hiệu Quả
            </span>
          </div>
          <div className="dt-metric-body">
            <span className="dt-metric-label">Tỷ Lệ Chốt Hợp Đồng</span>
            <strong className="dt-metric-value" style={{ color: "#b45309" }}>
              {closedRate}%
            </strong>
            <p className="dt-metric-subtext">
              <i className="bi bi-percent"></i> {dealClosed.length}/{filteredEstimates.length || 1} dự toán chuyển đổi
            </p>
          </div>
        </div>

        {/* Card 4: Tổng Leads */}
        <div className="dt-metric-card card-purple">
          <div className="dt-metric-top">
            <div className="dt-metric-icon-wrap icon-purple">
              <i className="bi bi-people-fill"></i>
            </div>
            <span className="dt-metric-badge badge-purple">
              <i className="bi bi-funnel"></i> Nguồn Khách
            </span>
          </div>
          <div className="dt-metric-body">
            <span className="dt-metric-label">Tổng Khách Quan Tâm</span>
            <strong className="dt-metric-value" style={{ color: "#7e22ce" }}>
              {totalLeads} Leads
            </strong>
            <p className="dt-metric-subtext">
              <i className="bi bi-chat-left-dots"></i> {filteredEstimates.length} báo giá + {filteredContacts.length} liên hệ
            </p>
          </div>
        </div>

        {/* Card 5: Giá trị trung bình AOV */}
        <div className="dt-metric-card card-teal">
          <div className="dt-metric-top">
            <div className="dt-metric-icon-wrap icon-teal">
              <i className="bi bi-award-fill"></i>
            </div>
            <span className="dt-metric-badge badge-teal">
              <i className="bi bi-gem"></i> Giá Trị Đơn
            </span>
          </div>
          <div className="dt-metric-body">
            <span className="dt-metric-label">Trung Bình / Thang</span>
            <strong className="dt-metric-value" style={{ color: "#0f766e" }}>
              {formatShortVND(avgDealValue)}
            </strong>
            <p className="dt-metric-subtext">
              <i className="bi bi-building-check"></i> Phân khúc dân dụng & biệt thự
            </p>
          </div>
        </div>
      </div>

      {/* 3. TWO COLUMN VISUALIZATION (Chart & Donut) */}
      <div className="dt-charts-grid">
        {/* Left: Monthly Revenue SVG Chart */}
        <div className="dt-chart-card">
          <div className="dt-chart-card-header">
            <div className="dt-chart-title-group">
              <h3>
                <i className="bi bi-bar-chart-line" style={{ color: "#D9A441" }}></i>
                Xu Hướng Doanh Số Ký Kết & Dự Phóng (6 Tháng Gần Nhất)
              </h3>
              <p>So sánh doanh thu thực tế đã ký hợp đồng so với dòng tiền dự án đang tư vấn</p>
            </div>
            <div className="dt-chart-legend">
              <div className="dt-legend-item">
                <span className="dt-legend-dot dot-actual"></span>
                <span>Doanh Thu Thực Tế</span>
              </div>
              <div className="dt-legend-item">
                <span className="dt-legend-dot dot-pipeline"></span>
                <span>Tiềm Năng Pipeline</span>
              </div>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="dt-svg-chart-wrap">
            <svg viewBox="0 0 600 240" className="dt-svg-chart" preserveAspectRatio="none">
              {/* Gridlines */}
              <line x1="40" y1="40" x2="580" y2="40" className="dt-grid-line" />
              <line x1="40" y1="90" x2="580" y2="90" className="dt-grid-line" />
              <line x1="40" y1="140" x2="580" y2="140" className="dt-grid-line" />
              <line x1="40" y1="190" x2="580" y2="190" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Y-axis labels */}
              <text x="32" y="44" textAnchor="end" className="dt-axis-text">{formatShortVND(maxChartVal)}</text>
              <text x="32" y="94" textAnchor="end" className="dt-axis-text">{formatShortVND(maxChartVal * 0.66)}</text>
              <text x="32" y="144" textAnchor="end" className="dt-axis-text">{formatShortVND(maxChartVal * 0.33)}</text>
              <text x="32" y="194" textAnchor="end" className="dt-axis-text">0</text>

              {/* Dual Bars for Each Month */}
              {monthlyData.map((m, idx) => {
                const groupWidth = (580 - 60) / monthlyData.length;
                const groupX = 60 + idx * groupWidth;
                const barWidth = 24;

                const actualHeight = Math.max((m.actual / maxChartVal) * 150, m.actual > 0 ? 8 : 2);
                const actualY = 190 - actualHeight;

                const pipelineHeight = Math.max((m.pipeline / maxChartVal) * 150, m.pipeline > 0 ? 8 : 2);
                const pipelineY = 190 - pipelineHeight;

                const isHovered = hoveredMonth === idx;

                return (
                  <g
                    key={m.key}
                    onMouseEnter={() => setHoveredMonth(idx)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Actual Bar */}
                    <rect
                      x={groupX + groupWidth / 2 - barWidth - 2}
                      y={actualY}
                      width={barWidth}
                      height={actualHeight}
                      rx="4"
                      fill={m.actual > 0 ? "url(#actualGradient)" : "#e2e8f0"}
                      className="dt-bar-actual"
                    />

                    {/* Pipeline Bar */}
                    <rect
                      x={groupX + groupWidth / 2 + 2}
                      y={pipelineY}
                      width={barWidth}
                      height={pipelineHeight}
                      rx="4"
                      fill={m.pipeline > 0 ? "url(#pipelineGradient)" : "#f1f5f9"}
                      className="dt-bar-pipeline"
                    />

                    {/* X-axis Label */}
                    <text
                      x={groupX + groupWidth / 2}
                      y="214"
                      textAnchor="middle"
                      className="dt-axis-text"
                      fill={isHovered ? "#0B1F3A" : "#64748b"}
                      fontWeight={isHovered ? "700" : "500"}
                    >
                      {m.label}
                    </text>

                    {/* Hover Tooltip Box */}
                    {isHovered && (
                      <g>
                        <rect
                          x={Math.min(Math.max(groupX + groupWidth / 2 - 70, 45), 450)}
                          y="10"
                          width="140"
                          height="44"
                          rx="8"
                          fill="#0B1F3A"
                          opacity="0.95"
                        />
                        <text
                          x={Math.min(Math.max(groupX + groupWidth / 2, 115), 520)}
                          y="26"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="11"
                          fontWeight="700"
                        >
                          {m.label}: {formatVND(m.actual)}
                        </text>
                        <text
                          x={Math.min(Math.max(groupX + groupWidth / 2, 115), 520)}
                          y="42"
                          textAnchor="middle"
                          fill="#F6D389"
                          fontSize="10"
                        >
                          Pipeline: {formatVND(m.pipeline)} ({m.count} chốt)
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Gradients */}
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <linearGradient id="pipelineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Right: Revenue by Elevator Type Donut Chart */}
        <div className="dt-chart-card">
          <div className="dt-chart-card-header">
            <div className="dt-chart-title-group">
              <h3>
                <i className="bi bi-pie-chart-fill" style={{ color: "#D9A441" }}></i>
                Cơ Cấu Doanh Số Theo Dòng Thang
              </h3>
              <p>Tỷ trọng doanh thu theo từng thiết kế thang máy</p>
            </div>
          </div>

          <div className="dt-donut-layout">
            {/* SVG Donut */}
            <div className="dt-donut-svg-wrap">
              <svg viewBox="0 0 180 180" className="dt-donut-svg">
                <circle cx="90" cy="90" r={donutRadius} className="dt-donut-circle-bg" />
                {donutSegments.map((seg, i) => (
                  <circle
                    key={i}
                    cx="90"
                    cy="90"
                    r={donutRadius}
                    className="dt-donut-segment"
                    stroke={seg.color}
                    strokeDasharray={`${seg.strokeDash} ${donutCircumference}`}
                    strokeDashoffset={seg.offset}
                  />
                ))}
              </svg>
              <div className="dt-donut-center-info">
                <span>Tổng Số</span>
                <strong>{formatShortVND(totalTypeVal)}</strong>
              </div>
            </div>

            {/* Donut Legend List */}
            <div className="dt-donut-list">
              {donutSegments.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: "0.82rem", fontStyle: "italic", textAlign: "center" }}>
                  Chưa có dữ liệu dự toán
                </p>
              ) : (
                donutSegments.map((seg, i) => (
                  <div key={i} className="dt-donut-list-item">
                    <div className="dt-donut-item-header">
                      <span className="dt-donut-item-label">
                        <span className="dt-donut-bullet" style={{ background: seg.color }}></span>
                        {seg.name}
                      </span>
                      <span className="dt-donut-item-val">{seg.percentage}%</span>
                    </div>
                    <div className="dt-donut-progress-track">
                      <div
                        className="dt-donut-progress-bar"
                        style={{ width: `${seg.percentage}%`, background: seg.color }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. VISUAL SALES FUNNEL */}
      <div className="dt-funnel-card">
        <div className="dt-chart-title-group">
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0B1F3A", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <i className="bi bi-funnel-fill" style={{ color: "#D9A441" }}></i>
            Phễu Chuyển Đổi Kinh Doanh & Tỷ Lệ Giữ Chân Khách Hàng
          </h3>
          <p style={{ fontSize: "0.78rem", color: "#64748b", margin: "4px 0 0 0" }}>
            Tiến trình chuyển đổi từ lúc khách gửi thông tin khảo sát đến khi ký hợp đồng thi công bàn giao
          </p>
        </div>

        <div className="dt-funnel-stages-row">
          {funnelCounts.map((stage) => (
            <div key={stage.key} className="dt-funnel-step">
              <div className="dt-funnel-step-header">
                <span className="dt-funnel-step-num">{stage.step}</span>
                <span className="dt-metric-badge" style={{ background: `${stage.color}20`, color: stage.color }}>
                  {stage.pct}%
                </span>
              </div>
              <span className="dt-funnel-step-name">{stage.name}</span>
              <strong className="dt-funnel-step-count">{stage.count}</strong>
              <div className="dt-funnel-bar-track">
                <div
                  className="dt-funnel-bar-fill"
                  style={{ width: `${Math.max(stage.pct, 4)}%`, background: stage.color }}
                ></div>
              </div>
              <div className="dt-funnel-step-meta">
                <span>Trạng thái</span>
                <strong style={{ color: stage.color }}>{stage.count} yêu cầu</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. MODERN EXECUTIVE DEALS TABLE */}
      <div className="dt-table-card">
        <div className="dt-chart-card-header">
          <div className="dt-chart-title-group">
            <h3>
              <i className="bi bi-journal-text" style={{ color: "#D9A441" }}></i>
              Danh Sách Dự Toán & Hợp Đồng Bán Hàng
            </h3>
            <p>Toàn bộ danh sách khách hàng gửi yêu cầu dự toán, phân theo trạng thái và giá trị hợp đồng</p>
          </div>
        </div>

        {/* Table Controls (Search & Status Pills) */}
        <div className="dt-table-controls">
          <div className="dt-search-box">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Tìm theo tên khách, SĐT, địa chỉ, loại thang..."
              className="dt-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="dt-status-filter-pills">
            {[
              ["all", "Tất Cả"],
              ["DealClosed", "Đã Chốt Deal"],
              ["SurveyScheduled", "Lên Lịch Khảo Sát"],
              ["Contacted", "Đã Liên Hệ"],
              ["New", "Mới"]
            ].map(([val, lbl]) => (
              <button
                key={val}
                type="button"
                className={`dt-status-pill ${tableStatus === val ? "active" : ""}`}
                onClick={() => setTableStatus(val)}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="dt-table-responsive">
          {tableData.length === 0 ? (
            <div className="dt-empty-state">
              <i className="bi bi-inbox"></i>
              <p style={{ fontWeight: 600, color: "#475569" }}>Không tìm thấy dự toán nào phù hợp với bộ lọc hiện tại.</p>
              <button
                type="button"
                className="dt-action-btn"
                onClick={() => { setSearchTerm(""); setTableStatus("all"); }}
                style={{ background: "#0B1F3A", color: "#fff" }}
              >
                Xóa Bộ Lọc
              </button>
            </div>
          ) : (
            <table className="dt-modern-table">
              <thead>
                <tr>
                  <th>Khách Hàng</th>
                  <th>Dòng Thang Máy</th>
                  <th>Thông Số</th>
                  <th>Giá Dự Toán</th>
                  <th>Trạng Thái (Chọn để tính tiền)</th>
                  <th>Ngày Tạo</th>
                  <th>Ghi Chú</th>
                  <th style={{ textAlign: "center" }}>Xóa</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((e) => {
                  const statusInfo = getStatusInfo(e.status);
                  const initials = (e.customerName || "KH")
                    .split(" ")
                    .filter(Boolean)
                    .slice(-2)
                    .map((w) => w[0]?.toUpperCase())
                    .join("");
                  const midPrice = (e.estimatedPriceMin + e.estimatedPriceMax) / 2;

                  return (
                    <tr key={e.id}>
                      {/* Customer Info */}
                      <td>
                        <div className="dt-customer-cell">
                          <div className="dt-avatar-circle">{initials}</div>
                          <div className="dt-customer-details">
                            <span className="dt-customer-name">{e.customerName}</span>
                            <span className="dt-customer-meta">
                              <i className="bi bi-telephone-fill" style={{ fontSize: "10px" }}></i> {e.phoneNumber}
                              {e.address ? ` • ${e.address}` : ""}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Elevator Type */}
                      <td>
                        <span style={{ fontWeight: 600, color: "#0B1F3A" }}>
                          {mapElevatorTypeName(e.elevatorType)}
                        </span>
                        <br />
                        <small style={{ color: "#64748b" }}>{e.motorBrand || "Động cơ tiêu chuẩn"}</small>
                      </td>

                      {/* Specs */}
                      <td>
                        <span style={{ fontWeight: 600 }}>{e.stops ? `${e.stops} tầng` : "—"}</span>
                        <br />
                        <small style={{ color: "#64748b" }}>{e.capacityKg ? `${e.capacityKg} kg` : "—"}</small>
                      </td>

                      {/* Estimated Price */}
                      <td>
                        <div className="dt-price-cell">{formatVND(midPrice)}</div>
                        <small style={{ color: "#94a3b8", fontSize: "0.72rem" }}>
                          {formatShortVND(e.estimatedPriceMin)} - {formatShortVND(e.estimatedPriceMax)}
                        </small>
                      </td>

                      {/* Interactive Status Selector */}
                      <td>
                        <select
                          className={`dt-status-select ${statusInfo.class}`}
                          value={e.status}
                          onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                          title="Chọn 'Chốt deal ✓' để cộng tiền trực tiếp vào Doanh Thu Ký Kết"
                        >
                          <option value="DealClosed">Chốt deal ✓ (Cộng Doanh Thu)</option>
                          <option value="SurveyScheduled">Lên lịch khảo sát</option>
                          <option value="Contacted">Đã liên hệ tư vấn</option>
                          <option value="New">Mới gửi dự toán</option>
                          <option value="Cancelled">Đã huỷ / Tạm dừng</option>
                        </select>
                      </td>

                      {/* Date */}
                      <td style={{ whiteSpace: "nowrap", color: "#64748b", fontSize: "0.78rem" }}>
                        {dinhDangNgay(e.createdAt)}
                      </td>

                      {/* Admin Notes */}
                      <td style={{ maxWidth: 200, color: "#475569", fontSize: "0.78rem" }}>
                        {e.adminNotes || "—"}
                      </td>

                      {/* Delete Action */}
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="dt-row-btn-delete"
                          onClick={() => handleDelete(e.id)}
                          title="Xóa dự toán này"
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* CREATE NEW DEAL / ESTIMATE MODAL */}
      {showCreateModal && (
        <div className="dt-modal-backdrop" onClick={() => !creating && setShowCreateModal(false)}>
          <div className="dt-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="dt-modal-header">
              <h3>
                <i className="bi bi-file-earmark-plus" style={{ color: "#D9A441" }}></i>
                Tạo Dự Toán & Ghi Nhận Hợp Đồng Mới
              </h3>
              <button
                type="button"
                className="dt-modal-close"
                onClick={() => !creating && setShowCreateModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="dt-modal-body">
                <div className="dt-form-row">
                  <div className="dt-form-group">
                    <label>Họ và Tên Khách Hàng *</label>
                    <input
                      type="text"
                      placeholder="VD: Nguyễn Văn Hùng"
                      required
                      value={createForm.customerName}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, customerName: e.target.value }))}
                    />
                  </div>
                  <div className="dt-form-group">
                    <label>Số Điện Thoại (10 số) *</label>
                    <input
                      type="tel"
                      placeholder="VD: 0908123456"
                      required
                      pattern="0[0-9]{9}"
                      value={createForm.phoneNumber}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="dt-form-row">
                  <div className="dt-form-group">
                    <label>Gmail Nhận Báo Giá *</label>
                    <input
                      type="email"
                      placeholder="VD: khachhang@gmail.com"
                      required
                      value={createForm.email}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="dt-form-group">
                    <label>Địa Chỉ Công Trình</label>
                    <input
                      type="text"
                      placeholder="VD: 100 Tân Sơn, Tân Bình, TP.HCM"
                      value={createForm.address}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="dt-form-row">
                  <div className="dt-form-group">
                    <label>Dòng Thang Máy</label>
                    <select
                      value={createForm.elevatorType}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, elevatorType: e.target.value }))}
                    >
                      <option value="homelift-kinh">Thang Máy Kính Homelift Panorama</option>
                      <option value="inox-guong-vang">Cabin Inox Gương Vàng Luxury PVD</option>
                      <option value="inox-tieu-chuan">Cabin Inox 304 Tiêu Chuẩn Hairline</option>
                    </select>
                  </div>
                  <div className="dt-form-group">
                    <label>Hãng Động Cơ</label>
                    <select
                      value={createForm.motorBrand}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, motorBrand: e.target.value }))}
                    >
                      <option value="Fuji">Fuji (Công nghệ Nhật Bản)</option>
                      <option value="Mitsubishi">Mitsubishi (Thái Lan)</option>
                      <option value="Montanari">Montanari (Nhập khẩu Ý)</option>
                    </select>
                  </div>
                </div>

                <div className="dt-form-row">
                  <div className="dt-form-group">
                    <label>Số Tầng (Điểm Dừng)</label>
                    <select
                      value={createForm.stops}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, stops: Number(e.target.value) }))}
                    >
                      {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <option key={num} value={num}>{num} Tầng</option>
                      ))}
                    </select>
                  </div>
                  <div className="dt-form-group">
                    <label>Tải Trọng Cabin</label>
                    <select
                      value={createForm.capacityKg}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, capacityKg: Number(e.target.value) }))}
                    >
                      <option value={300}>300 kg (3 - 4 người)</option>
                      <option value={350}>350 kg (4 - 5 người)</option>
                      <option value={450}>450 kg (6 người)</option>
                      <option value={630}>630 kg (8 - 9 người)</option>
                    </select>
                  </div>
                </div>

                <div className="dt-form-group">
                  <label>Trạng Thái Ban Đầu (Chọn Chốt Deal để tính ngay vào Doanh Thu)</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, status: e.target.value }))}
                    style={{ fontWeight: 700, color: createForm.status === "DealClosed" ? "#15803d" : "#0B1F3A" }}
                  >
                    <option value="DealClosed">✓ Chốt deal (Cộng ngay vào Doanh Thu Ký Kết)</option>
                    <option value="SurveyScheduled">Lên lịch khảo sát công trình</option>
                    <option value="Contacted">Đã liên hệ tư vấn</option>
                    <option value="New">Mới gửi dự toán (Pipeline)</option>
                  </select>
                </div>

                <div className="dt-form-group">
                  <label>Ghi Chú Hợp Đồng / Dự Án</label>
                  <textarea
                    rows="2"
                    placeholder="VD: Hợp đồng thi công trọn gói, tạm ứng đợt 1..."
                    value={createForm.adminNotes}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, adminNotes: e.target.value }))}
                  ></textarea>
                </div>
              </div>

              <div className="dt-modal-footer">
                <button
                  type="button"
                  className="dt-action-btn"
                  onClick={() => setShowCreateModal(false)}
                  style={{ color: "#64748b", border: "1px solid #cbd5e1", background: "#f8fafc" }}
                  disabled={creating}
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="dt-action-btn btn-primary-action"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <i className="bi bi-arrow-repeat spin"></i> Đang Tạo...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle"></i> Lưu & Ghi Nhận Doanh Thu
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
