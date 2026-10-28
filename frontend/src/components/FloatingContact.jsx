import { useEffect, useMemo, useState } from "react";

import { soDienThoaiCongTy, soDienThoaiLienKet } from "../data/contactInfo";

const zaloUrl = `https://zalo.me/${soDienThoaiLienKet}`;
const telegramUrl = "https://t.me/HaHongElevatorLeadBot?start=tuvan";

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

  return (
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

      <a className="floating-contact-item floating-telegram" href={telegramUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat Telegram với Hà Hồng">
        <span className="floating-contact-icon floating-telegram-icon">
          <i className="bi bi-telegram"></i>
        </span>
        <span className="floating-contact-text">Chat Telegram</span>
      </a>
    </div>
  );
}

export default FloatingContact;
