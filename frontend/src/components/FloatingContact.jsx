import { useEffect, useState } from "react";
import { soDienThoaiCongTy, soDienThoaiLienKet } from "../data/contactInfo";

const zaloUrl = `https://zalo.me/${soDienThoaiLienKet}`;
const telegramBotUrl = "https://t.me/HaHongSupportBot";

const thongBaoHoatDong = [
  {
    ten: "Anh Minh - Nhà phố",
    dichVu: "dịch vụ bảo trì thang máy",
    thoiGian: "12 phút trước",
    icon: "bi-tools",
  },
  {
    ten: "Công ty An Phát",
    dichVu: "tư vấn thang máy văn phòng",
    thoiGian: "18 phút trước",
    icon: "bi-buildings",
  },
  {
    ten: "Chị Hương - Quận 7",
    dichVu: "báo giá thang máy gia đình",
    thoiGian: "24 phút trước",
    icon: "bi-house-check",
  },
  {
    ten: "Khách sạn Minh Tâm",
    dichVu: "lịch khảo sát công trình",
    thoiGian: "31 phút trước",
    icon: "bi-calendar-check",
  },
];

function FloatingContact() {
  const [thongBaoDangChon, setThongBaoDangChon] = useState(0);
  const [hienThongBao, setHienThongBao] = useState(false);
  const [daBoQua, setDaBoQua] = useState(() => {
    try {
      return sessionStorage.getItem("hide_floating_activity") === "true";
    } catch {
      return false;
    }
  });

  const boQuaThongBao = (e) => {
    if (e) e.stopPropagation();
    setHienThongBao(false);
    setDaBoQua(true);
    try {
      sessionStorage.setItem("hide_floating_activity", "true");
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (daBoQua) return undefined;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return undefined;

    // Giảm tần suất: Lần đầu tiên hiện sau 10 giây khi vào trang
    const hienSauKhiVaoTrang = window.setTimeout(() => {
      setHienThongBao(true);
      window.setTimeout(() => setHienThongBao(false), 5000);
    }, 10000);

    // Chu kỳ lặp lại giảm xuống 45 giây/lần (thay vì 14 giây dồn dập như trước)
    const vongLap = window.setInterval(() => {
      setHienThongBao(false);

      window.setTimeout(() => {
        setThongBaoDangChon((current) => (current + 1) % thongBaoHoatDong.length);
        setHienThongBao(true);
      }, 500);

      window.setTimeout(() => setHienThongBao(false), 5500);
    }, 45000);

    return () => {
      window.clearTimeout(hienSauKhiVaoTrang);
      window.clearInterval(vongLap);
    };
  }, [daBoQua]);

  const thongBao = thongBaoHoatDong[thongBaoDangChon];

  return (
    <>
      <div className="floating-contact" aria-label="Liên hệ nhanh">
        {/* Thông báo khách hàng vừa yêu cầu */}
        {!daBoQua && (
          <div className={`floating-activity ${hienThongBao ? "is-visible" : ""}`} aria-live="polite">
            <button
              type="button"
              className="floating-activity-close"
              onClick={boQuaThongBao}
              title="Đóng thông báo này"
              aria-label="Đóng thông báo"
            >
              <i className="bi bi-x-lg"></i>
            </button>
            <span className="floating-activity-icon">
              <i className={`bi ${thongBao.icon}`}></i>
            </span>
            <div className="activity-info">
              <div className="d-flex align-items-center justify-content-between mb-1 pe-3">
                <strong>{thongBao.ten}</strong>
                <small>{thongBao.thoiGian}</small>
              </div>
              <span className="activity-service">
                vừa yêu cầu <mark>{thongBao.dichVu}</mark>
              </span>
            </div>
          </div>
        )}

        {/* Cụm 3 Icon liên hệ hình tròn cố định màu sắc nổi bật, bấm vào là kết nối ngay */}
        <div className="floating-buttons-stack">
          <a
            className="floating-contact-item floating-phone"
            href={`tel:${soDienThoaiLienKet}`}
            aria-label={`Gọi ngay ${soDienThoaiCongTy}`}
            title={`Hotline: ${soDienThoaiCongTy}`}
          >
            <i className="bi bi-telephone-fill fs-5"></i>
            <span className="floating-tooltip">Gọi: {soDienThoaiCongTy}</span>
          </a>

          <a
            className="floating-contact-item floating-zalo"
            href={zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat Zalo với Hà Hồng"
            title="Chat Zalo tư vấn 24/7"
          >
            <span className="floating-zalo-text">Zalo</span>
            <span className="floating-tooltip">Chat Zalo 24/7</span>
          </a>

          <a
            className="floating-contact-item floating-telegram"
            href={telegramBotUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat Telegram với Hà Hồng"
            title="Chat Telegram trực tiếp"
          >
            <i className="bi bi-telegram fs-5"></i>
            <span className="floating-tooltip">Chat Telegram</span>
          </a>
        </div>
      </div>
    </>
  );
}

export default FloatingContact;
