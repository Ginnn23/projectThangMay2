import { useEffect, useMemo, useState } from "react";
import { soDienThoaiCongTy, soDienThoaiLienKet } from "../data/contactInfo";

const zaloUrl = `https://zalo.me/${soDienThoaiLienKet}`;
const telegramBotUrl = "https://t.me/HaHongElevatorLeadBot?start=tuvan";
const telegramWebUrl = "https://web.telegram.org/k/#@HaHongElevatorLeadBot";

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
  const [showTelegramModal, setShowTelegramModal] = useState(false);

  const prefersReducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const hienSauKhiVaoTrang = window.setTimeout(() => setHienThongBao(true), 2200);
    const vongLap = window.setInterval(() => {
      setHienThongBao(false);

      window.setTimeout(() => {
        setThongBaoDangChon((current) => (current + 1) % thongBaoHoatDong.length);
        setHienThongBao(true);
      }, 450);

      window.setTimeout(() => setHienThongBao(false), 6200);
    }, 14000);

    return () => {
      window.clearTimeout(hienSauKhiVaoTrang);
      window.clearInterval(vongLap);
    };
  }, [prefersReducedMotion]);

  const thongBao = thongBaoHoatDong[thongBaoDangChon];

  // Kiem tra thiet bi iOS (iPhone/iPad) de ho tro khach tot nhat
  const isIOS = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }, []);

  const handleTelegramClick = (e) => {
    e.preventDefault();
    setShowTelegramModal(true);
  };

  return (
    <>
      <div className="floating-contact" aria-label="Liên hệ nhanh">
        <div className={`floating-activity ${hienThongBao ? "is-visible" : ""}`} aria-live="polite">
          <span className="floating-activity-icon">
            <i className={`bi ${thongBao.icon}`}></i>
          </span>
          <span>
            <strong>{thongBao.ten}</strong>
            <span>vừa yêu cầu <mark>{thongBao.dichVu}</mark></span>
            <small>{thongBao.thoiGian}</small>
          </span>
        </div>

        <a className="floating-contact-item floating-phone" href={`tel:${soDienThoaiLienKet}`} aria-label={`Gọi ${soDienThoaiCongTy}`}>
          <span className="floating-contact-icon">
            <i className="bi bi-telephone-fill"></i>
          </span>
          <span className="floating-contact-text">{soDienThoaiCongTy}</span>
        </a>

        <a className="floating-contact-item floating-zalo" href={zaloUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat Zalo với Hà Hồng">
          <span className="floating-contact-icon floating-zalo-icon">Zalo</span>
          <span className="floating-contact-text">Chat Zalo</span>
        </a>

        <button
          type="button"
          className="floating-contact-item floating-telegram"
          onClick={handleTelegramClick}
          aria-label="Chat Telegram với Hà Hồng"
          style={{ border: "none", cursor: "pointer", textAlign: "left" }}
        >
          <span className="floating-contact-icon floating-telegram-icon">
            <i className="bi bi-telegram"></i>
          </span>
          <span className="floating-contact-text">Chat Telegram</span>
        </button>
      </div>

      {/* Telegram Contact Modal (Giải pháp triệt để cho iPhone & mọi thiết bị) */}
      {showTelegramModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            background: "rgba(7, 25, 47, 0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 99999,
            padding: "1rem"
          }}
          onClick={() => setShowTelegramModal(false)}
        >
          <div
            className="card border-0 shadow-lg"
            style={{
              maxWidth: "460px",
              width: "100%",
              background: "linear-gradient(145deg, #0b2246 0%, #07192f 100%)",
              border: "1px solid rgba(217, 164, 65, 0.35)",
              borderRadius: "16px",
              color: "#fff",
              overflow: "hidden"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header border-bottom border-secondary d-flex align-items-center justify-content-between p-3"
                 style={{ background: "rgba(0, 136, 204, 0.15)" }}>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-telegram fs-4 text-info"></i>
                <h6 className="mb-0 fw-bold text-white">Kết Nối Kỹ Sư Thang Máy Hà Hồng</h6>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setShowTelegramModal(false)}
                aria-label="Đóng"
              ></button>
            </div>

            <div className="card-body p-4">
              {isIOS && (
                <div className="p-3 mb-3 rounded-3" style={{ background: "rgba(234, 179, 8, 0.12)", border: "1px solid rgba(234, 179, 8, 0.35)", fontSize: "12.5px" }}>
                  <div className="fw-bold text-warning mb-1">
                    <i className="bi bi-apple me-1"></i> Lưu ý dành riêng cho Quý khách dùng iPhone:
                  </div>
                  <div className="text-light" style={{ lineHeight: "1.5" }}>
                    Do chính sách bảo mật App Store trên iOS chặn hiển thị một số bot tự động, Quý khách vui lòng chọn <strong>[Mở Telegram Web]</strong> hoặc <strong>[Chat Zalo]</strong> để được kỹ sư hỗ trợ tức thì!
                  </div>
                </div>
              )}

              <div className="d-flex flex-column gap-2 mb-3">
                {/* Lua chon 1: Telegram Web (Hoat dong 100% tren moi iPhone/Safari/Chrome) */}
                <a
                  href={telegramWebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-info text-dark fw-bold d-flex align-items-center justify-content-between p-3 rounded-3 text-decoration-none shadow-sm"
                  style={{ background: "#22d3ee", border: "none" }}
                  onClick={() => setShowTelegramModal(false)}
                >
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-globe fs-4"></i>
                    <div className="text-start">
                      <div className="fw-bold">Mở Telegram trên Web (Khuyên dùng iPhone)</div>
                      <small className="text-dark-50" style={{ fontSize: "11px" }}>Không bị chặn bởi Apple App Store, vào chat ngay</small>
                    </div>
                  </div>
                  <i className="bi bi-arrow-right fs-5"></i>
                </a>

                {/* Lua chon 2: Telegram App */}
                <a
                  href={telegramBotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-light d-flex align-items-center justify-content-between p-3 rounded-3 text-decoration-none"
                  style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                  onClick={() => setShowTelegramModal(false)}
                >
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-telegram fs-4 text-info"></i>
                    <div className="text-start">
                      <div className="fw-bold">Mở bằng Ứng dụng Telegram</div>
                      <small className="text-secondary" style={{ fontSize: "11px" }}>Dành cho máy Android, iPad hoặc máy tính PC</small>
                    </div>
                  </div>
                  <i className="bi bi-arrow-right fs-5"></i>
                </a>

                {/* Lua chon 3: Zalo nhanh nhat */}
                <a
                  href={zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-warning d-flex align-items-center justify-content-between p-3 rounded-3 text-decoration-none"
                  style={{ border: "1px solid rgba(217,164,65,0.4)" }}
                  onClick={() => setShowTelegramModal(false)}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary px-2 py-1 fw-bold">Zalo</span>
                    <div className="text-start">
                      <div className="fw-bold text-warning">Chat Zalo Kỹ Sư Trực Tiếp (0909 9333 58)</div>
                      <small className="text-secondary" style={{ fontSize: "11px" }}>Phản hồi nhanh nhất tại Việt Nam (dưới 1 phút)</small>
                    </div>
                  </div>
                  <i className="bi bi-arrow-right fs-5"></i>
                </a>

                {/* Lua chon 4: Hotline */}
                <a
                  href={`tel:${soDienThoaiLienKet}`}
                  className="btn btn-outline-success d-flex align-items-center justify-content-between p-3 rounded-3 text-decoration-none"
                  style={{ border: "1px solid rgba(16,185,129,0.4)" }}
                  onClick={() => setShowTelegramModal(false)}
                >
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-telephone-fill fs-4 text-success"></i>
                    <div className="text-start">
                      <div className="fw-bold text-success">Gọi Hotline Khẩn Cấp 24/7</div>
                      <small className="text-secondary" style={{ fontSize: "11px" }}>Tư vấn kỹ thuật và cứu hộ thang máy</small>
                    </div>
                  </div>
                  <i className="bi bi-arrow-right fs-5"></i>
                </a>
              </div>

              <div className="text-center text-muted small" style={{ fontSize: "11.5px" }}>
                Thang Máy Hà Hồng • Đồng hành trọn vẹn cùng ngôi nhà Việt
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FloatingContact;
