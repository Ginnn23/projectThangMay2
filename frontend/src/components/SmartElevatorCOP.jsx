import { useState, useEffect, useMemo } from "react";
import "./SmartElevatorCOP.css";

// Hàm phát âm thanh mô phỏng chuông Ding thang máy & tiếng bíp phím bấm (Web Audio API)
const playElevatorAudio = (type = "beep") => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === "ding") {
      // Chuông Ding-Dong đến tầng (Melodic Chime)
      osc.type = "sine";
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6
      osc.frequency.exponentialRampToValueAtTime(1318.5, ctx.currentTime + 0.12); // E6
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.85);
    } else if (type === "alarm") {
      // Chuông báo động khẩn cấp cứu hộ ARD
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.setValueAtTime(850, ctx.currentTime + 0.12);
      osc.frequency.setValueAtTime(650, ctx.currentTime + 0.24);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } else {
      // Tiếng bíp cảm ứng siêu êm khi chạm phím
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch {
    // Trình duyệt có thể chặn âm thanh nếu chưa có user gesture
  }
};

const getPassengerText = (kg) => {
  if (kg <= 300) return "3-4 Người";
  if (kg <= 350) return "4-5 Người";
  if (kg <= 450) return "6 Người";
  if (kg <= 630) return "8-9 Người";
  return `${Math.round(kg / 75)} Người`;
};

export default function SmartElevatorCOP({
  currentFloor = 1,
  targetFloor = 1,
  elevatorStatus = "idle",
  moveDirection = null,
  isDoorsOpen = true,
  isLightOn = true,
  stops = 4,
  capacityKg = 450,
  doorType = "CO",
  onCallFloor,
  onSetDoorOpen,
  onToggleLight,
  onTriggerBell
}) {
  const [isFanOn, setIsFanOn] = useState(true);
  const [alarmActive, setAlarmActive] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  // Cập nhật đồng hồ thời gian thực
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      setCurrentTime(`${h}:${m}:${s}`);

      const d = String(now.getDate()).padStart(2, "0");
      const mo = String(now.getMonth() + 1).padStart(2, "0");
      const y = now.getFullYear();
      setCurrentDate(`${d}.${mo}.${y}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Phát chuông ding khi đến tầng mở cửa
  useEffect(() => {
    if (elevatorStatus === "opening") {
      playElevatorAudio("ding");
    }
  }, [elevatorStatus]);

  // Danh sách các tầng (1 .. stops)
  const totalStops = Math.min(Math.max(Number(stops) || 4, 2), 10);
  const floorList = useMemo(() => {
    return Array.from({ length: totalStops }, (_, i) => i + 1);
  }, [totalStops]);

  // Chuỗi các tầng kế tiếp
  const nextStopsList = useMemo(() => {
    if (moveDirection === "up") {
      return floorList.filter((f) => f > currentFloor && f <= targetFloor);
    }
    if (moveDirection === "down") {
      return floorList.filter((f) => f < currentFloor && f >= targetFloor).reverse();
    }
    return floorList.filter((f) => f !== currentFloor).slice(0, 3);
  }, [floorList, currentFloor, targetFloor, moveDirection]);

  const handleFloorClick = (fNum) => {
    playElevatorAudio("beep");
    if (onCallFloor) {
      onCallFloor(fNum);
    }
  };

  const handleDoorClick = (open) => {
    playElevatorAudio("beep");
    if (onSetDoorOpen) {
      onSetDoorOpen(open);
    }
  };

  const handleLightClick = () => {
    playElevatorAudio("beep");
    if (onToggleLight) {
      onToggleLight();
    }
  };

  const handleFanClick = () => {
    playElevatorAudio("beep");
    setIsFanOn((prev) => !prev);
  };

  const handleBellClick = () => {
    playElevatorAudio("alarm");
    setAlarmActive(true);
    setTimeout(() => setAlarmActive(false), 2400);
    if (onTriggerBell) {
      onTriggerBell();
    }
  };

  return (
    <div className="smart-cop-wrapper" aria-label="Bảng điều khiển thang máy điện tử Hà Hồng">
      {/* KHUNG VỎ KIM LOẠI TITANIUM PHAY XƯỚC CÔNG NGHỆ CAO */}
      <div className={`smart-cop-panel ${alarmActive ? "cop-alarm-flashing" : ""}`}>
        {/* Ốc vít lục giác thẩm mỹ 4 góc */}
        <span className="cop-hex-screw screw-top-left" aria-hidden="true"></span>
        <span className="cop-hex-screw screw-top-right" aria-hidden="true"></span>
        <span className="cop-hex-screw screw-bottom-left" aria-hidden="true"></span>
        <span className="cop-hex-screw screw-bottom-right" aria-hidden="true"></span>

        {/* HEADER BAR: THƯƠNG HIỆU & ĐÈN BÁO TRẠNG THÁI */}
        <div className="cop-top-header">
          <div className="cop-brand-title">
            <i className="bi bi-cpu-fill text-warning me-1"></i>
            <span>HÀ HỒNG SMART COP</span>
          </div>
          <div className="cop-status-indicator">
            <span className="cop-pulse-dot"></span>
            <span>24/7 ARD READY</span>
          </div>
        </div>

        {/* MÀN HÌNH LCD THÔNG MINH (Chuẩn TFT Sang Trọng Như KONE / Taza) */}
        <div className="cop-lcd-display">
          {/* Header màn hình LCD: Đồng hồ, Ngày tháng & Thời tiết */}
          <div className="lcd-status-row">
            <div className="lcd-time-box">
              <i className="bi bi-clock me-1 text-cyan"></i>
              <span className="lcd-time">{currentTime || "20:45:00"}</span>
              <span className="lcd-date">{currentDate || "30.10.2026"}</span>
            </div>
            <div className="lcd-weather-box">
              <i className="bi bi-cloud-sun-fill text-warning me-1"></i>
              <span>28°C Nắng Nhẹ</span>
            </div>
          </div>

          {/* Khối chính hiển thị Tầng lớn & Hướng di chuyển */}
          <div className="lcd-main-content">
            <div className="lcd-floor-box">
              <div className="lcd-arrow-wrap">
                {moveDirection === "up" ? (
                  <span className="lcd-arrow arrow-up">▲</span>
                ) : moveDirection === "down" ? (
                  <span className="lcd-arrow arrow-down">▼</span>
                ) : (
                  <span className="lcd-arrow arrow-idle">●</span>
                )}
              </div>
              <div className="lcd-floor-val">
                {currentFloor}
                <span className="lcd-floor-sub">F</span>
              </div>
            </div>

            <div className="lcd-info-box">
              <div className="lcd-motion-badge">
                {elevatorStatus === "moving" ? (
                  <span className="text-warning fw-bold">
                    <i className="bi bi-chevron-double-right me-1"></i>
                    Đang Chạy Đến Tầng {targetFloor}
                  </span>
                ) : elevatorStatus === "closing" ? (
                  <span className="text-info">
                    <i className="bi bi-door-closed me-1"></i>
                    Cửa Đang Đóng...
                  </span>
                ) : elevatorStatus === "opening" ? (
                  <span className="text-success fw-bold">
                    <i className="bi bi-door-open me-1"></i>
                    Đã Đến Tầng {currentFloor} • Mở Cửa
                  </span>
                ) : isDoorsOpen ? (
                  <span className="text-emerald">
                    <i className="bi bi-check-circle-fill me-1"></i>
                    Cửa Mở • Sẵn Sàng
                  </span>
                ) : (
                  <span className="text-secondary-cyan">
                    <i className="bi bi-pause-circle me-1"></i>
                    Cửa Đóng • Chờ Lệnh
                  </span>
                )}
              </div>

              <div className="lcd-specs-row">
                <span className="lcd-tag-spec">
                  <i className="bi bi-people-fill me-1"></i>
                  {capacityKg} KG ({getPassengerText(capacityKg)})
                </span>
                <span className={`lcd-door-tag ${isDoorsOpen ? "door-tag-open" : "door-tag-closed"}`}>
                  {isDoorsOpen ? "DOOR OPEN" : "DOOR CLOSED"}
                </span>
              </div>

              <div className="lcd-next-stops">
                <span className="stops-label">Tầng kế tiếp:</span>
                <span className="stops-list">
                  {nextStopsList.length > 0 ? (
                    nextStopsList.map((st) => `${st}F`).join(" • ")
                  ) : (
                    "Đang ở tầng gọi"
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BÀN PHÍM ĐIỀU KHIỂN CẢM ỨNG ĐIỆN TỬ (Tương Tác Trực Tiếp) */}
        <div className="cop-keypad-section">
          {/* Hàng nút bấm gọi tầng có đèn viền Halo LED */}
          <div className="cop-floors-grid">
            {floorList.map((fNum) => {
              const isCurrent = currentFloor === fNum;
              const isCalling = targetFloor === fNum && elevatorStatus !== "idle";
              return (
                <button
                  key={fNum}
                  type="button"
                  className={`cop-btn-touch ${isCurrent ? "btn-floor-current" : ""} ${
                    isCalling ? "btn-floor-calling" : ""
                  }`}
                  onClick={() => handleFloorClick(fNum)}
                  title={`Bấm gọi thang máy đến Tầng ${fNum}`}
                >
                  <span className="halo-glow-ring"></span>
                  <span className="floor-digit">{fNum}</span>
                  <span className="floor-tag">T{fNum}</span>
                </button>
              );
            })}
          </div>

          {/* Hàng nút chức năng phụ trợ: Cửa Mở, Cửa Đóng, Đèn, Quạt, Cứu Hộ */}
          <div className="cop-aux-row">
            <button
              type="button"
              className={`cop-aux-btn ${isDoorsOpen ? "aux-active-cyan" : ""}`}
              onClick={() => handleDoorClick(true)}
              title="Mở cửa thang máy (Open Door)"
            >
              <span className="aux-icon-sym">◄||►</span>
              <span className="aux-btn-text">Mở Cửa</span>
            </button>

            <button
              type="button"
              className={`cop-aux-btn ${!isDoorsOpen ? "aux-active-cyan" : ""}`}
              onClick={() => handleDoorClick(false)}
              title="Đóng cửa thang máy (Close Door)"
            >
              <span className="aux-icon-sym">►||◄</span>
              <span className="aux-btn-text">Đóng Cửa</span>
            </button>

            <button
              type="button"
              className={`cop-aux-btn ${isLightOn ? "aux-active-gold" : ""}`}
              onClick={handleLightClick}
              title="Bật / Tắt đèn chiếu sáng cabin"
            >
              <i className="bi bi-lightbulb-fill"></i>
              <span className="aux-btn-text">{isLightOn ? "Đèn Bật" : "Đèn Tắt"}</span>
            </button>

            <button
              type="button"
              className={`cop-aux-btn ${isFanOn ? "aux-active-blue" : ""}`}
              onClick={handleFanClick}
              title="Bật / Tắt quạt thông gió cabin"
            >
              <i className={`bi bi-fan ${isFanOn ? "spin-fan-anim" : ""}`}></i>
              <span className="aux-btn-text">{isFanOn ? "Quạt Chạy" : "Quạt Tắt"}</span>
            </button>

            <button
              type="button"
              className="cop-aux-btn cop-alarm-btn"
              onClick={handleBellClick}
              title="Chuông cứu hộ khẩn cấp & Intercom 2 chiều"
            >
              <i className="bi bi-bell-fill"></i>
              <span className="aux-btn-text">Cứu Hộ</span>
            </button>
          </div>
        </div>

        {/* FOOTER TINH TẾ */}
        <div className="cop-bottom-bar">
          <small className="cop-meta-note">
            <i className="bi bi-shield-check text-warning me-1"></i>
            Hệ điều hành thông minh vi xử lý 32-Bit • Đồng bộ thời gian thực
          </small>
        </div>
      </div>
    </div>
  );
}
