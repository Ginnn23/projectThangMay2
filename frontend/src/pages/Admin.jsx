import { useEffect, useMemo, useRef, useState } from "react";

import { API_BASE_URL, API_ORIGIN, apiClient } from "../api/client";
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

function AdminToolbar({ activeTab, onChangeTab, user, onLogout }) {
  const tabs = [
    { key: "contacts", label: "Liên hệ", icon: "bi-inbox" },
    { key: "maintenance", label: "Bảo trì", icon: "bi-calendar-check" },
    { key: "home", label: "Trang chủ", icon: "bi-house-gear" },
    { key: "services", label: "Dịch vụ", icon: "bi-tools" },
    { key: "projects", label: "Dự án", icon: "bi-buildings" },
  ];

  return (
    <div className="admin-toolbar">
      <div>
        <span>Quản trị website</span>
        <strong>{user?.fullName || user?.username || "Admin"}</strong>
      </div>
      <nav aria-label="Admin tabs">
        {tabs.map((tab) => (
          <button className={activeTab === tab.key ? "active" : ""} type="button" key={tab.key} onClick={() => onChangeTab(tab.key)}>
            <i className={`bi ${tab.icon}`}></i>
            {tab.label}
          </button>
        ))}
      </nav>
      <button className="admin-logout-button" type="button" onClick={onLogout}>
        <i className="bi bi-box-arrow-right"></i>
        Đăng xuất
      </button>
    </div>
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
  const [activeTab, setActiveTab] = useState("contacts");
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
      <div className="admin-shell">
        <AdminToolbar activeTab={activeTab} onChangeTab={doiTab} user={user} onLogout={dangXuat} />

        <div className="admin-summary-grid">
          <article><span>Liên hệ</span><strong>{thongKe.contacts}</strong></article>
          <article><span>Khách bảo trì</span><strong>{thongKe.maintenance}</strong></article>
          <article><span>Dịch vụ đang hiện</span><strong>{thongKe.services}</strong></article>
          <article><span>Dự án</span><strong>{thongKe.projects}</strong></article>
        </div>

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
      </div>
    </main>
  );
}

export default Admin;
