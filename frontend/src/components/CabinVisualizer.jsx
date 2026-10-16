import { useState, useEffect, useRef } from "react";
import "./CabinVisualizer.css";

// 1. DỮ LIỆU VÁCH CABIN (WALLS) - ĐÃ BỔ SUNG KÍNH CƯỜNG LỰC & CHUẨN HÓA VẬT LIỆU CHÂN THỰC
export const WALL_OPTIONS = [
  {
    id: "kinh-cuong-luc",
    name: "Kính Cường Lực Trong Suốt Panorama",
    desc: "Kính cường lực an toàn 10mm siêu trong, ngắm cảnh 4 mặt, lấy sáng tự nhiên tối đa",
    badge: "Bán chạy nhất",
    syncValue: "homelift-kinh",
    colorPreview: "linear-gradient(135deg, #0284c7 0%, #38bdf8 40%, #bae6fd 70%, #0369a1 100%)"
  },
  {
    id: "kinh-mau-tra",
    name: "Kính Cường Lực Màu Trà Hoàng Gia",
    desc: "Kính cường lực màu trà Bronze luxury, chống chói lóa, riêng tư và quý phái",
    badge: "Biệt thự cao cấp",
    syncValue: "homelift-kinh",
    colorPreview: "linear-gradient(135deg, #78350f 0%, #b45309 35%, #d97706 70%, #451a03 100%)"
  },
  {
    id: "inox-guong-vang",
    name: "Inox Gương Vàng PVD Hoàng Gia",
    desc: "Mạ titan PVD vàng Champagne, gương soi phản chiếu bóng loáng phối nẹp chỉ âm U-gold",
    badge: "Sang trọng đẳng cấp",
    syncValue: "inox-guong-vang",
    colorPreview: "linear-gradient(135deg, #78350f 0%, #d4af37 30%, #fef08a 60%, #ca8a04 100%)"
  },
  {
    id: "inox-tieu-chuan",
    name: "Inox 304 Sọc Nhuyễn Hairline",
    desc: "Vân xước satin hairline chống bám vân tay, bền bỉ cơ học vĩnh cửu theo thời gian",
    badge: "Hiện đại & Bền bỉ",
    syncValue: "inox-tieu-chuan",
    colorPreview: "linear-gradient(135deg, #475569 0%, #94a3b8 35%, #f8fafc 70%, #64748b 100%)"
  },
  {
    id: "wood-luxury",
    name: "Gỗ Tự Nhiên & Inox Gương",
    desc: "Ốp gỗ óc chó Walnut tự nhiên vân nổi, nẹp T đồng thau phối gương soi trung tâm",
    badge: "Tân cổ điển",
    syncValue: "inox-guong-vang",
    colorPreview: "linear-gradient(135deg, #451a03 0%, #92400e 35%, #d4af37 65%, #78350f 100%)"
  }
];

// 2. DỮ LIỆU SÀN CABIN (FLOORING) - HỌA TIẾT ĐÁ CẨM THẠCH & GRANITE CHÂN THỰC
export const FLOOR_OPTIONS = [
  {
    id: "floor-royal",
    name: "Đá Thảm CNC Hoàng Gia",
    desc: "Đá cẩm thạch đen Nero Marquina cắt hoa văn Mandala la bàn vàng đen đối xứng 2.5D",
    badge: "Đá tự nhiên CNC",
    colorPreview: "radial-gradient(circle, #facc15 15%, #ca8a04 35%, #1e1b18 65%, #0b0f19 90%)"
  },
  {
    id: "floor-galaxy",
    name: "Đá Granite Kim Sa Đen",
    desc: "Nền đá đen tuyền huyền bí ánh kim sa vàng & bạc lấp lánh như dải ngân hà, chống trầy",
    badge: "Bền màu vĩnh cửu",
    colorPreview: "radial-gradient(circle, #fde047 1.5px, transparent 1.5px), #09090b"
  },
  {
    id: "floor-carrara",
    name: "Đá Marble Trắng Ý Carrara",
    desc: "Trắng ngọc vân mây xám Calacatta thanh lịch, bề mặt bóng sáng mở rộng không gian cabin",
    badge: "Thanh lịch Ý",
    colorPreview: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 40%, #cbd5e1 65%, #94a3b8 100%)"
  }
];

// 3. DỮ LIỆU TRẦN & ĐÈN CHIẾU SÁNG (CEILING & LIGHTS) - ÁNH SÁNG ĐẶC TRƯNG TỪNG LOẠI
export const CEILING_OPTIONS = [
  {
    id: "ceil-dome",
    name: "Trần Vòm Âm LED Gián Tiếp",
    desc: "Ánh sáng vàng ấm 3000K Champagne, vòm âm elip hắt ánh sáng dịu mắt chống chói",
    badge: "Ánh sáng vàng 3000K",
    lightType: "warm-gold",
    colorPreview: "radial-gradient(ellipse at center, #fef08a 20%, #eab308 55%, #1e293b 85%)"
  },
  {
    id: "ceil-diamond",
    name: "Trần Cắt Laser Kim Cương",
    desc: "Ánh sáng đa chiều 4000K, hoa văn kim cương tán xạ tia sáng đan xen lộng lẫy",
    badge: "Tán xạ kim cương",
    lightType: "sparkle-diamond",
    colorPreview: "linear-gradient(45deg, #1e293b 25%, #475569 50%, #facc15 75%)"
  },
  {
    id: "ceil-minimal",
    name: "Trần Linear Scandinavian",
    desc: "Ánh sáng trắng tinh khiết 6000K, 2 dải thanh LED song song rọi sáng sắc nét Bắc Âu",
    badge: "Ánh sáng trắng 6000K",
    lightType: "cool-linear",
    colorPreview: "repeating-linear-gradient(90deg, #38bdf8 0 3px, #0f172a 3px 20px)"
  }
];

// 4. DỮ LIỆU TAY VỊN (HANDRAIL)
export const HANDRAIL_OPTIONS = [
  {
    id: "rail-gold",
    name: "Tay Vịn Tròn Inox Mạ Vàng PVD",
    desc: "Inox 304 phi 38 mạ PVD vàng Champagne đồng bộ vách gương, góc bo tròn mềm mại",
    badge: "Hoàng Gia PVD",
    colorPreview: "linear-gradient(180deg, #fef08a, #eab308, #713f12)"
  },
  {
    id: "rail-silver",
    name: "Tay Vịn Dẹp Inox 304 Xước Mờ",
    desc: "Bản dẹp 40mm chống trơn trượt, góc bo cạnh satin cao cấp chống trầy",
    badge: "Tiêu chuẩn hiện đại",
    colorPreview: "linear-gradient(180deg, #ffffff, #94a3b8, #334155)"
  },
  {
    id: "rail-wood",
    name: "Tay Vịn Gỗ Tự Nhiên Phối Kim Loại",
    desc: "Thân gỗ sồi/óc chó tự nhiên ấm cúng kết hợp chân đế mạ vàng PVD chắc chắn",
    badge: "Gỗ Walnut sang trọng",
    colorPreview: "linear-gradient(180deg, #92400e, #78350f, #d4af37)"
  }
];

export default function CabinVisualizer({
  elevatorType = "homelift-kinh",
  onChangeElevatorType,
  capacityKg = 450,
  stops = 4,
  doorType = "CO",
  onApplyConfig,
  onRequestConsultation
}) {
  // Tab đang chọn: 'walls' (1) | 'flooring' (2) | 'ceiling' (3) | 'handrail' (4)
  const [activeTab, setActiveTab] = useState("walls");

  // State các tùy chọn vật liệu đang chọn
  const [selectedWallId, setSelectedWallId] = useState(
    elevatorType === "inox-guong-vang" ? "inox-guong-vang" :
    elevatorType === "inox-tieu-chuan" ? "inox-tieu-chuan" : "kinh-cuong-luc"
  );
  const [selectedFloorId, setSelectedFloorId] = useState("floor-royal");
  const [selectedCeilingId, setSelectedCeilingId] = useState("ceil-dome");
  const [selectedHandrailId, setSelectedHandrailId] = useState("rail-gold");

  // State điều khiển Cửa & Đèn
  const [isDoorsOpen, setIsDoorsOpen] = useState(true);
  const [isLightOn, setIsLightOn] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  // State MÔ PHỎNG THANG MÁY CHẠY TẦNG (Tự động đóng cửa, chạy tầng, mở cửa)
  const [currentFloor, setCurrentFloor] = useState(1);
  const [targetFloor, setTargetFloor] = useState(1);
  const [elevatorStatus, setElevatorStatus] = useState("idle"); // 'idle' | 'closing' | 'moving' | 'opening'
  const [moveDirection, setMoveDirection] = useState(null); // 'up' | 'down' | null
  const tripIntervalRef = useRef(null);

  // Danh sách các tầng (từ Tầng 1 đến số tầng stops do người dùng chọn ở Bước 2)
  const totalStops = Math.min(Math.max(Number(stops) || 4, 2), 10);
  const floorList = Array.from({ length: totalStops }, (_, i) => i + 1);

  // Đảm bảo tầng hiện tại không vượt quá tổng số tầng
  useEffect(() => {
    if (currentFloor > totalStops) {
      setCurrentFloor(totalStops);
      setTargetFloor(totalStops);
    }
  }, [totalStops, currentFloor]);

  // Đồng bộ khi người dùng click chọn loại thang ở Bước 3 bên ngoài
  useEffect(() => {
    if (elevatorType === "inox-guong-vang") {
      setSelectedWallId("inox-guong-vang");
    } else if (elevatorType === "inox-tieu-chuan") {
      setSelectedWallId("inox-tieu-chuan");
    } else if (elevatorType === "homelift-kinh") {
      setSelectedWallId("kinh-cuong-luc");
    }
  }, [elevatorType]);

  // Dọn dẹp interval khi component unmount
  useEffect(() => {
    return () => {
      if (tripIntervalRef.current) clearInterval(tripIntervalRef.current);
    };
  }, []);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2800);
  };

  const notifyParent = (overrides = {}) => {
    if (onApplyConfig) {
      const wId = overrides.wallId || selectedWallId;
      const fId = overrides.floorId || selectedFloorId;
      const cId = overrides.ceilingId || selectedCeilingId;
      const hId = overrides.handrailId || selectedHandrailId;

      const wObj = WALL_OPTIONS.find(w => w.id === wId) || WALL_OPTIONS[0];
      const fObj = FLOOR_OPTIONS.find(f => f.id === fId) || FLOOR_OPTIONS[0];
      const cObj = CEILING_OPTIONS.find(c => c.id === cId) || CEILING_OPTIONS[0];
      const hObj = HANDRAIL_OPTIONS.find(h => h.id === hId) || HANDRAIL_OPTIONS[0];

      onApplyConfig({
        wall: wObj.name,
        floor: fObj.name,
        ceiling: cObj.name,
        handrail: hObj.name
      });
    }
  };

  // CHỨC NĂNG BẤM TẦNG THANG MÁY TỰ ĐÓNG VÀ MỞ CỬA TẠI TẦNG ĐÍCH
  const handleCallFloor = (target) => {
    if (elevatorStatus !== "idle") {
      triggerToast("Thang máy đang di chuyển, vui lòng chờ...");
      return;
    }

    if (target === currentFloor) {
      if (!isDoorsOpen) {
        setIsDoorsOpen(true);
        triggerToast(`Thang máy đang ở Tầng ${target} • Đang mở cửa đón khách`);
      } else {
        triggerToast(`Thang máy hiện đang đỗ sẵn tại Tầng ${target}`);
      }
      return;
    }

    const direction = target > currentFloor ? "up" : "down";
    setTargetFloor(target);
    setMoveDirection(direction);
    setElevatorStatus("closing");
    triggerToast(`Đã chọn Tầng ${target} • Cửa đang tự động đóng lại...`);

    // 1. Tự động ĐÓNG CỬA
    setIsDoorsOpen(false);

    // 2. Cửa đóng kín sau 850ms -> Bắt đầu chạy thang
    setTimeout(() => {
      setElevatorStatus("moving");
      const stepsToTravel = Math.abs(target - currentFloor);
      let stepCount = 0;
      let activeFloor = currentFloor;

      tripIntervalRef.current = setInterval(() => {
        stepCount++;
        activeFloor = direction === "up" ? activeFloor + 1 : activeFloor - 1;
        setCurrentFloor(activeFloor);

        // Đã đến tầng đích
        if (activeFloor === target || stepCount >= stepsToTravel) {
          clearInterval(tripIntervalRef.current);
          tripIntervalRef.current = null;

          // 3. Chuông Ding & Tự động MỞ CỬA tại tầng đó
          setTimeout(() => {
            setElevatorStatus("opening");
            setMoveDirection(null);
            triggerToast(`🔔 Ding! Đã đến Tầng ${target} • Cửa đang tự động mở ra`);
            setIsDoorsOpen(true);

            setTimeout(() => {
              setElevatorStatus("idle");
            }, 900);
          }, 450);
        }
      }, 750); // Mỗi tầng 0.75s
    }, 900);
  };

  const handleManualDoorToggle = () => {
    if (elevatorStatus === "moving") {
      triggerToast("Thang máy đang di chuyển giữa các tầng, không thể mở cửa!");
      return;
    }
    const next = !isDoorsOpen;
    setIsDoorsOpen(next);
    triggerToast(next ? "Cửa thang máy đang mở ra" : "Cửa thang máy đã đóng kín");
  };

  const handleToggleLight = () => {
    const next = !isLightOn;
    setIsLightOn(next);
    triggerToast(next ? "Đèn cabin bật sáng • Chiếu rọi trần & sàn" : "Đèn cabin tắt • Chế độ ban đêm dịu mắt");
  };

  const handleSelectWall = (item) => {
    setSelectedWallId(item.id);
    if (onChangeElevatorType && item.syncValue) {
      onChangeElevatorType(item.syncValue);
    }
    triggerToast(`Đã đổi vách: ${item.name}`);
    notifyParent({ wallId: item.id });
  };

  const handleSelectFloor = (item) => {
    setSelectedFloorId(item.id);
    triggerToast(`Đã đổi sàn: ${item.name}`);
    notifyParent({ floorId: item.id });
  };

  const handleSelectCeiling = (item) => {
    setSelectedCeilingId(item.id);
    triggerToast(`Đã đổi kiểu đèn: ${item.name}`);
    notifyParent({ ceilingId: item.id });
  };

  const handleSelectHandrail = (item) => {
    setSelectedHandrailId(item.id);
    triggerToast(`Đã đổi tay vịn: ${item.name}`);
    notifyParent({ handrailId: item.id });
  };

  const handleReset = () => {
    setSelectedWallId("kinh-cuong-luc");
    setSelectedFloorId("floor-royal");
    setSelectedCeilingId("ceil-dome");
    setSelectedHandrailId("rail-gold");
    setIsDoorsOpen(true);
    setIsLightOn(true);
    setCurrentFloor(1);
    setTargetFloor(1);
    setElevatorStatus("idle");
    setMoveDirection(null);
    if (onChangeElevatorType) {
      onChangeElevatorType("homelift-kinh");
    }
    triggerToast("Đã khôi phục cấu hình tiêu chuẩn");
    notifyParent({
      wallId: "kinh-cuong-luc",
      floorId: "floor-royal",
      ceilingId: "ceil-dome",
      handrailId: "rail-gold"
    });
  };

  const handleConsultClick = () => {
    const curWall = WALL_OPTIONS.find(w => w.id === selectedWallId)?.name || "";
    const curFloor = FLOOR_OPTIONS.find(f => f.id === selectedFloorId)?.name || "";
    const curCeil = CEILING_OPTIONS.find(c => c.id === selectedCeilingId)?.name || "";
    const curRail = HANDRAIL_OPTIONS.find(h => h.id === selectedHandrailId)?.name || "";

    if (onRequestConsultation) {
      onRequestConsultation({
        wall: curWall,
        floor: curFloor,
        ceiling: curCeil,
        handrail: curRail
      });
    } else {
      const quoteForm = document.querySelector(".quote-form-card");
      if (quoteForm) {
        quoteForm.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const curWallObj = WALL_OPTIONS.find(w => w.id === selectedWallId) || WALL_OPTIONS[0];
  const curFloorObj = FLOOR_OPTIONS.find(f => f.id === selectedFloorId) || FLOOR_OPTIONS[0];
  const curCeilObj = CEILING_OPTIONS.find(c => c.id === selectedCeilingId) || CEILING_OPTIONS[0];
  const curRailObj = HANDRAIL_OPTIONS.find(h => h.id === selectedHandrailId) || HANDRAIL_OPTIONS[0];

  return (
    <div className="cabin-visualizer-container">
      {/* 1. Header Toolbar */}
      <div className="cabin-viz-header">
        <div className="cabin-viz-title">
          <i className="bi bi-box text-warning fs-5"></i>
          <div>
            <span className="d-block fw-bold" style={{ fontSize: "14px" }}>
              PHỐI CẢNH CABIN TRỰC QUAN 2.5D
            </span>
            <small className="text-secondary" style={{ fontSize: "11px" }}>
              Mô phỏng chạy tầng • Đèn hắt & sàn đá thật
            </small>
          </div>
        </div>

        <div className="cabin-viz-actions">
          {/* Nút bật / tắt đèn */}
          <button
            type="button"
            className={`cabin-viz-btn-action ${isLightOn ? "active" : ""}`}
            onClick={handleToggleLight}
            title={isLightOn ? "Tắt đèn chiếu sáng cabin" : "Bật đèn chiếu sáng cabin"}
          >
            <i className={`bi ${isLightOn ? "bi-lightbulb-fill text-warning" : "bi-lightbulb"}`}></i>
            <span>{isLightOn ? "Đèn Bật" : "Đèn Tắt"}</span>
          </button>

          {/* Nút mở / đóng cửa thủ công */}
          <button
            type="button"
            className={`cabin-viz-btn-action ${isDoorsOpen ? "active" : ""}`}
            onClick={handleManualDoorToggle}
            title={isDoorsOpen ? "Đóng cửa cabin" : "Mở cửa cabin"}
            disabled={elevatorStatus === "moving"}
          >
            <i className={`bi ${isDoorsOpen ? "bi-door-open-fill text-info" : "bi-door-closed-fill"}`}></i>
            <span>{isDoorsOpen ? "Cửa Mở" : "Cửa Đóng"}</span>
          </button>
        </div>
      </div>

      {/* 2. Sân khấu Đồ họa 2.5D SVG */}
      <div className={`cabin-stage ${!isLightOn ? "light-off" : "light-on"}`}>
        {/* Chỉ báo tầng & tải trọng trên nóc thang */}
        <div className="cabin-landing-indicator">
          <span className="floor-num">{currentFloor}F</span>
          <span className={`dir-arrow ${moveDirection ? "moving" : ""}`}>
            {moveDirection === "up" ? "▲" : moveDirection === "down" ? "▼" : "●"}
          </span>
          <span className="capacity-badge">
            {elevatorStatus === "moving"
              ? `Đang chạy ${moveDirection === "up" ? "lên" : "xuống"} Tầng ${targetFloor}...`
              : `${capacityKg}kg • ${Math.round(capacityKg / 75)} người`}
          </span>
        </div>

        {/* Toast thông báo tương tác */}
        {toastMsg && (
          <div className="cabin-live-toast">
            <i className="bi bi-info-circle-fill me-1 text-info"></i>
            {toastMsg}
          </div>
        )}

        {/* KHUNG ĐỒ HỌA 2.5D SVG NÂNG CẤP CHÂN THỰC */}
        <svg
          viewBox="0 0 800 520"
          className="cabin-svg-canvas"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* --- GRADIENTS VÁCH CABIN --- */}
            {/* 1. Kính Cường Lực Trong Suốt Panorama */}
            <linearGradient id="grad-glass-clear-sky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="35%" stopColor="#38bdf8" />
              <stop offset="65%" stopColor="#bae6fd" />
              <stop offset="100%" stopColor="#f0f9ff" />
            </linearGradient>
            <linearGradient id="grad-glass-clear-reflect" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
              <stop offset="25%" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="65%" stopColor="rgba(56,189,248,0.18)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
            </linearGradient>

            {/* 2. Kính Cường Lực Màu Trà Hoàng Gia (Bronze Glass) */}
            <linearGradient id="grad-glass-bronze" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#451a03" />
              <stop offset="30%" stopColor="#78350f" />
              <stop offset="70%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="grad-glass-bronze-reflect" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(254,240,138,0.35)" />
              <stop offset="35%" stopColor="rgba(120,53,15,0.15)" />
              <stop offset="70%" stopColor="rgba(217,119,6,0.25)" />
              <stop offset="100%" stopColor="rgba(254,240,138,0.2)" />
            </linearGradient>

            {/* 3. Inox Gương Vàng PVD Hoàng Gia */}
            <linearGradient id="grad-gold-pvd-back" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#592b02" />
              <stop offset="12%" stopColor="#b48328" />
              <stop offset="25%" stopColor="#fef08a" />
              <stop offset="38%" stopColor="#ca8a04" />
              <stop offset="50%" stopColor="#fffbeb" />
              <stop offset="62%" stopColor="#d4af37" />
              <stop offset="75%" stopColor="#fef08a" />
              <stop offset="88%" stopColor="#996515" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
            <linearGradient id="grad-gold-left" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3d1b02" />
              <stop offset="60%" stopColor="#996515" />
              <stop offset="100%" stopColor="#d4af37" />
            </linearGradient>
            <linearGradient id="grad-gold-right" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d4af37" />
              <stop offset="40%" stopColor="#996515" />
              <stop offset="100%" stopColor="#3d1b02" />
            </linearGradient>

            {/* 4. Inox 304 Sọc Nhuyễn Hairline */}
            <linearGradient id="grad-inox-hairline" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="20%" stopColor="#94a3b8" />
              <stop offset="40%" stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#f8fafc" />
              <stop offset="60%" stopColor="#cbd5e1" />
              <stop offset="80%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <linearGradient id="grad-inox-left" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
            <linearGradient id="grad-inox-right" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* 5. Gỗ Tự Nhiên & Inox Gương */}
            <linearGradient id="grad-wood-walnut" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2e1001" />
              <stop offset="20%" stopColor="#5c2607" />
              <stop offset="35%" stopColor="#78350f" />
              <stop offset="65%" stopColor="#5c2607" />
              <stop offset="85%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#2e1001" />
            </linearGradient>

            {/* --- GRADIENTS SÀN CABIN CHÂN THỰC --- */}
            {/* Đá Thảm CNC Hoàng Gia (Mandala vàng đen) */}
            <radialGradient id="grad-royal-cnc-center" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="15%" stopColor="#facc15" />
              <stop offset="35%" stopColor="#ca8a04" />
              <stop offset="55%" stopColor="#78350f" />
              <stop offset="75%" stopColor="#1c1917" />
              <stop offset="90%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#0c0a09" />
            </radialGradient>

            {/* Đá Granite Kim Sa Đen (Đen tuyền ánh kim sa) */}
            <linearGradient id="grad-granite-galaxy" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1c1917" />
              <stop offset="45%" stopColor="#0c0a09" />
              <stop offset="100%" stopColor="#000000" />
            </linearGradient>

            {/* Đá Marble Trắng Ý Carrara (Vân mây tự nhiên) */}
            <linearGradient id="grad-carrara-base" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="30%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>

            {/* --- HỆ THỐNG ÁNH SÁNG RIÊNG BIỆT CHO TỪNG LOẠI ĐÈN --- */}
            {/* 1. Ánh sáng vàng ấm 3000K cho Trần Vòm Âm LED */}
            <radialGradient id="grad-dome-3000k-bulb" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#fef08a" />
              <stop offset="65%" stopColor="#eab308" />
              <stop offset="90%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="rgba(202,138,4,0)" />
            </radialGradient>
            <linearGradient id="grad-cone-warm" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(254, 240, 138, 0.65)" />
              <stop offset="30%" stopColor="rgba(234, 179, 8, 0.28)" />
              <stop offset="75%" stopColor="rgba(202, 138, 4, 0.12)" />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
            </linearGradient>
            <radialGradient id="grad-floor-specular-warm" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(254, 240, 138, 0.75)" />
              <stop offset="40%" stopColor="rgba(234, 179, 8, 0.35)" />
              <stop offset="85%" stopColor="rgba(0, 0, 0, 0)" />
            </radialGradient>

            {/* 2. Ánh sáng lấp lánh đa chiều 4000K cho Trần Laser Kim Cương */}
            <radialGradient id="grad-diamond-4000k-bulb" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#fef9c3" />
              <stop offset="70%" stopColor="#facc15" />
              <stop offset="100%" stopColor="rgba(250,204,21,0)" />
            </radialGradient>
            <linearGradient id="grad-cone-diamond" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(254, 249, 195, 0.7)" />
              <stop offset="25%" stopColor="rgba(250, 204, 21, 0.3)" />
              <stop offset="65%" stopColor="rgba(234, 179, 8, 0.14)" />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
            </linearGradient>
            <radialGradient id="grad-floor-specular-diamond" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.85)" />
              <stop offset="30%" stopColor="rgba(254, 240, 138, 0.45)" />
              <stop offset="75%" stopColor="rgba(250, 204, 21, 0.15)" />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
            </radialGradient>

            {/* 3. Ánh sáng trắng 6000K cho Trần Linear Scandinavian */}
            <radialGradient id="grad-linear-6000k-bulb" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#bae6fd" />
              <stop offset="75%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="rgba(56,189,248,0)" />
            </radialGradient>
            <linearGradient id="grad-cone-cool" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.8)" />
              <stop offset="30%" stopColor="rgba(186, 230, 253, 0.3)" />
              <stop offset="70%" stopColor="rgba(56, 189, 248, 0.12)" />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
            </linearGradient>
            <radialGradient id="grad-floor-specular-cool" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
              <stop offset="35%" stopColor="rgba(186, 230, 253, 0.4)" />
              <stop offset="80%" stopColor="rgba(0, 0, 0, 0)" />
            </radialGradient>

            {/* --- GRADIENTS TAY VỊN --- */}
            <linearGradient id="grad-rail-gold-pvd" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="25%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#d4af37" />
              <stop offset="85%" stopColor="#a16207" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
            <linearGradient id="grad-rail-silver-hairline" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#cbd5e1" />
              <stop offset="70%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <linearGradient id="grad-rail-wood-walnut" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="35%" stopColor="#78350f" />
              <stop offset="80%" stopColor="#451a03" />
              <stop offset="100%" stopColor="#d4af37" />
            </linearGradient>

            {/* Bộ lọc đổ bóng mềm */}
            <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.65" />
            </filter>
          </defs>

          {/* 1. LỚP VÁCH SAU (Back Wall) */}
          <g id="layer-back-wall" onClick={() => setActiveTab("walls")} style={{ cursor: "pointer" }}>
            {/* Vách 1: Kính Cường Lực Trong Suốt Panorama */}
            {selectedWallId === "kinh-cuong-luc" && (
              <>
                <g style={{ transform: `translateY(${(currentFloor - 1) * -14}px)`, transition: "transform 0.6s ease" }}>
                  <rect x="160" y="60" width="480" height="340" fill="url(#grad-glass-clear-sky)" />
                  <path d="M 160 300 L 220 270 L 250 280 L 320 235 L 370 270 L 430 220 L 490 255 L 550 240 L 600 275 L 640 265 L 640 380 L 160 380 Z" fill="rgba(2, 132, 199, 0.3)" />
                  <path d="M 180 320 L 240 295 L 300 320 L 360 285 L 420 320 L 500 290 L 570 305 L 640 285 L 640 380 L 160 380 Z" fill="rgba(3, 105, 161, 0.4)" />
                </g>
                <rect x="160" y="90" width="480" height="290" fill="url(#grad-glass-clear-reflect)" />
                <line x1="320" y1="90" x2="320" y2="380" stroke="#0284c7" strokeWidth="3" opacity="0.85" />
                <line x1="480" y1="90" x2="480" y2="380" stroke="#0284c7" strokeWidth="3" opacity="0.85" />
                <circle cx="320" cy="180" r="5" fill="#e0f2fe" stroke="#0369a1" strokeWidth="2" />
                <circle cx="480" cy="180" r="5" fill="#e0f2fe" stroke="#0369a1" strokeWidth="2" />
                <circle cx="320" cy="300" r="5" fill="#e0f2fe" stroke="#0369a1" strokeWidth="2" />
                <circle cx="480" cy="300" r="5" fill="#e0f2fe" stroke="#0369a1" strokeWidth="2" />
              </>
            )}

            {/* Vách 2: Kính Cường Lực Màu Trà Hoàng Gia (Bronze Glass) */}
            {selectedWallId === "kinh-mau-tra" && (
              <>
                <g style={{ transform: `translateY(${(currentFloor - 1) * -14}px)`, transition: "transform 0.6s ease" }}>
                  <rect x="160" y="60" width="480" height="340" fill="url(#grad-glass-bronze)" />
                  <path d="M 160 310 L 230 280 L 310 300 L 400 250 L 470 290 L 560 260 L 640 295 L 640 380 L 160 380 Z" fill="rgba(69, 26, 3, 0.45)" />
                </g>
                <rect x="160" y="90" width="480" height="290" fill="url(#grad-glass-bronze-reflect)" />
                <line x1="320" y1="90" x2="320" y2="380" stroke="#d4af37" strokeWidth="2.5" opacity="0.75" />
                <line x1="480" y1="90" x2="480" y2="380" stroke="#d4af37" strokeWidth="2.5" opacity="0.75" />
                <circle cx="320" cy="180" r="5" fill="#fef08a" stroke="#78350f" strokeWidth="2" />
                <circle cx="480" cy="180" r="5" fill="#fef08a" stroke="#78350f" strokeWidth="2" />
              </>
            )}

            {/* Vách 3: Inox Gương Vàng PVD Hoàng Gia */}
            {selectedWallId === "inox-guong-vang" && (
              <>
                <rect x="160" y="90" width="480" height="290" fill="url(#grad-gold-pvd-back)" />
                {/* Khung gương soi trung tâm dát vàng */}
                <rect x="250" y="100" width="300" height="270" fill="linear-gradient(180deg, #fef9c3 0%, #ca8a04 50%, #78350f 100%)" stroke="#fef08a" strokeWidth="2" />
                <rect x="260" y="110" width="280" height="250" fill={isLightOn ? "rgba(254, 240, 138, 0.35)" : "rgba(89, 43, 2, 0.5)"} />
                <line x1="250" y1="90" x2="250" y2="380" stroke="#facc15" strokeWidth="3" />
                <line x1="550" y1="90" x2="550" y2="380" stroke="#facc15" strokeWidth="3" />
                <text x="400" y="150" textAnchor="middle" fill="#78350f" fontSize="11" fontWeight="800" letterSpacing="3" opacity="0.6">
                  HA HONG PVD GOLD
                </text>
              </>
            )}

            {/* Vách 4: Inox 304 Sọc Nhuyễn Hairline */}
            {selectedWallId === "inox-tieu-chuan" && (
              <>
                <rect x="160" y="90" width="480" height="290" fill="url(#grad-inox-hairline)" />
                <line x1="300" y1="90" x2="300" y2="380" stroke="#1e293b" strokeWidth="2" />
                <line x1="500" y1="90" x2="500" y2="380" stroke="#1e293b" strokeWidth="2" />
                <rect x="315" y="110" width="170" height="150" fill="linear-gradient(135deg, #e2e8f0 0%, #ffffff 40%, #94a3b8 100%)" stroke="#cbd5e1" strokeWidth="2" />
              </>
            )}

            {/* Vách 5: Gỗ Tự Nhiên & Inox Gương */}
            {selectedWallId === "wood-luxury" && (
              <>
                <rect x="160" y="90" width="480" height="290" fill="url(#grad-wood-walnut)" />
                <line x1="250" y1="90" x2="250" y2="380" stroke="#d4af37" strokeWidth="2.5" />
                <line x1="550" y1="90" x2="550" y2="380" stroke="#d4af37" strokeWidth="2.5" />
                <rect x="280" y="105" width="240" height="260" fill="linear-gradient(135deg, #fef9c3 0%, #d4af37 50%, #78350f 100%)" stroke="#facc15" strokeWidth="2" />
                <rect x="290" y="115" width="220" height="240" fill={isLightOn ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.35)"} />
              </>
            )}

            {/* Vệt phản chiếu mép trên vách khi bật đèn */}
            {isLightOn && (
              <rect
                x="180"
                y="90"
                width="440"
                height="22"
                fill={
                  selectedCeilingId === "ceil-minimal"
                    ? "rgba(255,255,255,0.65)"
                    : "rgba(254,240,138,0.6)"
                }
                opacity="0.45"
                pointerEvents="none"
              />
            )}
          </g>

          {/* 2. VÁCH TRÁI (Left Wall) */}
          <polygon
            points="0,0 160,90 160,380 0,500"
            fill={
              selectedWallId === "kinh-cuong-luc" ? "url(#grad-glass-clear-sky)" :
              selectedWallId === "kinh-mau-tra" ? "url(#grad-glass-bronze)" :
              selectedWallId === "inox-guong-vang" ? "url(#grad-gold-left)" :
              selectedWallId === "wood-luxury" ? "url(#grad-wood-walnut)" :
              "url(#grad-inox-left)"
            }
            onClick={() => setActiveTab("walls")}
            style={{ cursor: "pointer" }}
          />
          {(selectedWallId === "kinh-cuong-luc" || selectedWallId === "kinh-mau-tra") && (
            <polygon points="0,0 160,90 160,380 0,500" fill="rgba(255,255,255,0.18)" pointerEvents="none" />
          )}

          {/* 3. VÁCH PHẢI (Right Wall) */}
          <polygon
            points="800,0 640,90 640,380 800,500"
            fill={
              selectedWallId === "kinh-cuong-luc" ? "url(#grad-glass-clear-sky)" :
              selectedWallId === "kinh-mau-tra" ? "url(#grad-glass-bronze)" :
              selectedWallId === "inox-guong-vang" ? "url(#grad-gold-right)" :
              selectedWallId === "wood-luxury" ? "url(#grad-wood-walnut)" :
              "url(#grad-inox-right)"
            }
            onClick={() => setActiveTab("walls")}
            style={{ cursor: "pointer" }}
          />
          {(selectedWallId === "kinh-cuong-luc" || selectedWallId === "kinh-mau-tra") && (
            <polygon points="800,0 640,90 640,380 800,500" fill="rgba(255,255,255,0.18)" pointerEvents="none" />
          )}

          {/* BẢNG ĐIỀU KHIỂN CABIN COP GẮN TRÊN VÁCH PHẢI */}
          <g id="layer-cop-panel" filter="url(#soft-shadow)">
            <polygon points="680,120 740,140 740,430 680,400" fill="#09090b" stroke="#334155" strokeWidth="1.5" />
            <polygon points="690,145 730,158 730,195 690,182" fill="#020617" stroke="#0284c7" strokeWidth="1" />
            <text x="702" y="172" fill="#38bdf8" fontSize="13" fontWeight="800" fontFamily="monospace">
              {currentFloor}
            </text>
            <text x="716" y="172" fill={moveDirection ? "#10b981" : "#64748b"} fontSize="11" fontWeight="bold">
              {moveDirection === "up" ? "▲" : moveDirection === "down" ? "▼" : "●"}
            </text>

            {floorList.slice(0, 5).map((fNum, idx) => {
              const yPos = 220 + idx * 22;
              const isCurrent = currentFloor === fNum;
              const isTarget = targetFloor === fNum && elevatorStatus !== "idle";
              return (
                <g
                  key={fNum}
                  onClick={() => handleCallFloor(fNum)}
                  style={{ cursor: "pointer" }}
                  title={`Bấm để đi Tầng ${fNum}`}
                >
                  <ellipse
                    cx="710"
                    cy={yPos}
                    rx="8"
                    ry="6"
                    fill={isTarget ? "#ef4444" : isCurrent ? "#f59e0b" : "#1e293b"}
                    stroke={isTarget ? "#fca5a5" : isCurrent ? "#fef08a" : "#64748b"}
                    strokeWidth="1.5"
                  />
                  <text
                    x="710"
                    y={yPos + 3}
                    textAnchor="middle"
                    fill={isTarget || isCurrent ? "#0f172a" : "#cbd5e1"}
                    fontSize="7"
                    fontWeight="bold"
                  >
                    {fNum}
                  </text>
                </g>
              );
            })}
            <ellipse cx="710" cy="340" rx="7" ry="5" fill="#ef4444" stroke="#fca5a5" strokeWidth="1" />
          </g>

          {/* 4. LỚP SÀN CABIN (Flooring) */}
          <g id="layer-flooring" onClick={() => setActiveTab("flooring")} style={{ cursor: "pointer" }}>
            {selectedFloorId === "floor-royal" && (
              <>
                <polygon points="160,380 640,380 800,500 0,500" fill="#09090b" />
                <polygon points="175,385 625,385 770,490 30,490" fill="none" stroke="#d4af37" strokeWidth="3" opacity="0.8" />
                <ellipse cx="400" cy="440" rx="160" ry="42" fill="url(#grad-royal-cnc-center)" stroke="#facc15" strokeWidth="2.5" />
                <ellipse cx="400" cy="440" rx="90" ry="24" fill="none" stroke="#fef08a" strokeWidth="2" strokeDasharray="6,4" />
                <path d="M 400 422 L 407 437 L 435 440 L 407 443 L 400 458 L 393 443 L 365 440 L 393 437 Z" fill="#facc15" />
              </>
            )}

            {selectedFloorId === "floor-galaxy" && (
              <>
                <polygon points="160,380 640,380 800,500 0,500" fill="url(#grad-granite-galaxy)" />
                <line x1="320" y1="380" x2="260" y2="500" stroke="#334155" strokeWidth="1" opacity="0.6" />
                <line x1="480" y1="380" x2="540" y2="500" stroke="#334155" strokeWidth="1" opacity="0.6" />
                <line x1="160" y1="440" x2="640" y2="440" stroke="#334155" strokeWidth="1" opacity="0.6" />
                <circle cx="340" cy="420" r="1.8" fill="#facc15" />
                <circle cx="450" cy="450" r="2.2" fill="#ffffff" />
                <circle cx="280" cy="460" r="1.8" fill="#facc15" />
                <circle cx="520" cy="430" r="1.5" fill="#ffffff" />
                <circle cx="380" cy="470" r="2" fill="#fde047" />
                <circle cx="420" cy="410" r="1.5" fill="#ffffff" />
                <circle cx="490" cy="480" r="1.8" fill="#facc15" />
              </>
            )}

            {selectedFloorId === "floor-carrara" && (
              <>
                <polygon points="160,380 640,380 800,500 0,500" fill="url(#grad-carrara-base)" />
                <path d="M 200 400 Q 280 430 360 410 T 540 450" fill="none" stroke="#94a3b8" strokeWidth="2.5" opacity="0.6" />
                <path d="M 320 460 Q 420 440 500 480" fill="none" stroke="#94a3b8" strokeWidth="2" opacity="0.5" />
                <path d="M 160 440 Q 240 460 300 490" fill="none" stroke="#cbd5e1" strokeWidth="2" opacity="0.7" />
                <line x1="320" y1="380" x2="260" y2="500" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="480" y1="380" x2="540" y2="500" stroke="#cbd5e1" strokeWidth="1.5" />
              </>
            )}

            {/* VỆT PHẢN CHIẾU ÁNH ĐÈN TRẦN ĐẶC TRƯNG TỪNG LOẠI ĐÈN TRÊN SÀN */}
            {isLightOn && (
              <ellipse
                cx="400"
                cy="435"
                rx={selectedCeilingId === "ceil-minimal" ? "120" : "155"}
                ry="32"
                fill={
                  selectedCeilingId === "ceil-minimal" ? "url(#grad-floor-specular-cool)" :
                  selectedCeilingId === "ceil-diamond" ? "url(#grad-floor-specular-diamond)" :
                  "url(#grad-floor-specular-warm)"
                }
                pointerEvents="none"
              />
            )}
          </g>

          {/* LEN CHÂN TƯỜNG (Kickplate bằng Inox xước) */}
          <polygon points="0,500 800,500 800,520 0,520" fill="#334155" stroke="#475569" strokeWidth="1" />

          {/* 5. TAY VỊN CABIN (Handrail) */}
          <g id="layer-handrail" filter="url(#soft-shadow)" onClick={() => setActiveTab("handrail")} style={{ cursor: "pointer" }}>
            <rect
              x="200"
              y="260"
              width="400"
              height="14"
              rx="7"
              fill={
                selectedHandrailId === "rail-gold" ? "url(#grad-rail-gold-pvd)" :
                selectedHandrailId === "rail-wood" ? "url(#grad-rail-wood-walnut)" :
                "url(#grad-rail-silver-hairline)"
              }
              stroke={selectedHandrailId === "rail-gold" ? "#fef08a" : "#cbd5e1"}
              strokeWidth="1"
            />
            <rect x="250" y="274" width="14" height="14" fill="#334155" />
            <rect x="536" y="274" width="14" height="14" fill="#334155" />

            <polygon
              points="0,310 200,260 200,274 0,324"
              fill={
                selectedHandrailId === "rail-gold" ? "url(#grad-rail-gold-pvd)" :
                selectedHandrailId === "rail-wood" ? "url(#grad-rail-wood-walnut)" :
                "url(#grad-rail-silver-hairline)"
              }
              opacity="0.9"
            />
            <polygon
              points="600,260 800,310 800,324 600,274"
              fill={
                selectedHandrailId === "rail-gold" ? "url(#grad-rail-gold-pvd)" :
                selectedHandrailId === "rail-wood" ? "url(#grad-rail-wood-walnut)" :
                "url(#grad-rail-silver-hairline)"
              }
              opacity="0.9"
            />
          </g>

          {/* 6. TRẦN CABIN & ĐÈN CHIẾU SÁNG RIÊNG BIỆT */}
          <g id="layer-ceiling" onClick={() => setActiveTab("ceiling")} style={{ cursor: "pointer" }}>
            <polygon points="0,0 800,0 640,90 160,90" fill="#0f172a" />

            {/* Kiểu trần 1: Trần Vòm Âm LED Gián Tiếp (Ánh sáng Vàng Ấm 3000K) */}
            {selectedCeilingId === "ceil-dome" && (
              <>
                <ellipse
                  cx="400"
                  cy="45"
                  rx="170"
                  ry="26"
                  fill={isLightOn ? "url(#grad-dome-3000k-bulb)" : "#1e293b"}
                  stroke={isLightOn ? "#facc15" : "#475569"}
                  strokeWidth="2"
                />
                {isLightOn && (
                  <ellipse cx="400" cy="45" rx="140" ry="20" fill="#ffffff" opacity="0.85" />
                )}
              </>
            )}

            {/* Kiểu trần 2: Trần Cắt Laser Kim Cương (Ánh sáng Đa Chiều 4000K) */}
            {selectedCeilingId === "ceil-diamond" && (
              <>
                <polygon
                  points="200,20 600,20 540,75 260,75"
                  fill={isLightOn ? "#1e293b" : "#0f172a"}
                  stroke={isLightOn ? "#cbd5e1" : "#334155"}
                  strokeWidth="2"
                />
                <path d="M 300 20 L 280 75 M 400 20 L 400 75 M 500 20 L 520 75" stroke={isLightOn ? "#fef08a" : "#475569"} strokeWidth="2" />
                <path d="M 230 45 L 570 45" stroke={isLightOn ? "#fef08a" : "#475569"} strokeWidth="2" />
                {isLightOn && (
                  <ellipse cx="400" cy="45" rx="150" ry="22" fill="url(#grad-diamond-4000k-bulb)" opacity="0.75" />
                )}
              </>
            )}

            {/* Kiểu trần 3: Trần Linear Scandinavian (Ánh sáng Trắng Tinh Khiết 6000K) */}
            {selectedCeilingId === "ceil-minimal" && (
              <>
                <polygon points="270,10 285,10 255,80 240,80" fill={isLightOn ? "#ffffff" : "#334155"} />
                <polygon points="515,10 530,10 560,80 545,80" fill={isLightOn ? "#ffffff" : "#334155"} />
                {isLightOn && (
                  <>
                    <polygon points="260,10 295,10 265,80 230,80" fill="url(#grad-linear-6000k-bulb)" opacity="0.85" />
                    <polygon points="505,10 540,10 570,80 535,80" fill="url(#grad-linear-6000k-bulb)" opacity="0.85" />
                  </>
                )}
              </>
            )}

            {/* CHÙM SÁNG CHIẾU RỌI XUỐNG SÀN RIÊNG BIỆT KHI BẬT ĐÈN */}
            {isLightOn && (
              <polygon
                points="240,65 560,65 670,410 130,410"
                fill={
                  selectedCeilingId === "ceil-minimal" ? "url(#grad-cone-cool)" :
                  selectedCeilingId === "ceil-diamond" ? "url(#grad-cone-diamond)" :
                  "url(#grad-cone-warm)"
                }
                pointerEvents="none"
                style={{ mixBlendMode: "screen" }}
              />
            )}
          </g>

          {/* 7. LỚP BÓNG TỐI / TẮT ĐÈN (CHẾ ĐỘ BAN ĐÊM) */}
          {!isLightOn && (
            <rect
              x="0"
              y="0"
              width="800"
              height="520"
              fill="#030712"
              opacity="0.82"
              pointerEvents="none"
              style={{ transition: "opacity 0.4s ease" }}
            />
          )}

          {/* 8. CỬA TẦNG TỰ ĐỘNG SLIDING DOORS (TRƯỢT MỞ/ĐÓNG THẬT) */}
          {/* Cánh cửa bên trái */}
          <g
            className="cabin-svg-door door-left"
            style={{
              transform: isDoorsOpen ? "translateX(-95%)" : "translateX(0%)",
              transition: "transform 0.85s cubic-bezier(0.2, 0.9, 0.3, 1)"
            }}
          >
            <rect
              x="0"
              y="0"
              width="400"
              height="520"
              fill={selectedWallId === "inox-guong-vang" ? "url(#grad-gold-pvd-back)" : "url(#grad-inox-hairline)"}
              stroke="#1e293b"
              strokeWidth="3"
            />
            <rect x="394" y="0" width="6" height="520" fill="#09090b" />
            {(selectedWallId === "kinh-cuong-luc" || selectedWallId === "kinh-mau-tra") && (
              <rect x="60" y="80" width="280" height="360" fill="url(#grad-glass-clear-reflect)" stroke="#0284c7" strokeWidth="2" rx="4" />
            )}
          </g>

          {/* Cánh cửa bên phải */}
          <g
            className="cabin-svg-door door-right"
            style={{
              transform: isDoorsOpen ? "translateX(95%)" : "translateX(0%)",
              transition: "transform 0.85s cubic-bezier(0.2, 0.9, 0.3, 1)"
            }}
          >
            <rect
              x="400"
              y="0"
              width="400"
              height="520"
              fill={selectedWallId === "inox-guong-vang" ? "url(#grad-gold-pvd-back)" : "url(#grad-inox-hairline)"}
              stroke="#1e293b"
              strokeWidth="3"
            />
            <rect x="400" y="0" width="6" height="520" fill="#09090b" />
            {(selectedWallId === "kinh-cuong-luc" || selectedWallId === "kinh-mau-tra") && (
              <rect x="460" y="80" width="280" height="360" fill="url(#grad-glass-clear-reflect)" stroke="#0284c7" strokeWidth="2" rx="4" />
            )}
          </g>

          {/* Tia cảm biến an toàn Photocell khi cửa mở */}
          {isDoorsOpen && (
            <line x1="400" y1="20" x2="400" y2="500" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.75" />
          )}

          {/* 9. CÁC NÚT GHIM TƯƠNG TÁC (HOTSPOTS) - ĐÃ ĐỒNG BỘ 100% VỚI SỐ THỨ TỰ TAB CHỨC NĂNG */}
          {isDoorsOpen && (
            <>
              {/* GHIM SỐ 1: VÁCH CABIN (Ứng với Tab 1: Vách Cabin) */}
              <g onClick={() => setActiveTab("walls")} style={{ cursor: "pointer" }} title="Bấm đổi mẫu Vách Cabin (Số 1)">
                <circle cx="270" cy="210" r="14" fill="#facc15" stroke="#ffffff" strokeWidth="2" />
                <text x="270" y="215" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="900">1</text>
              </g>

              {/* GHIM SỐ 2: SÀN ĐÁ (Ứng với Tab 2: Sàn Đá) */}
              <g onClick={() => setActiveTab("flooring")} style={{ cursor: "pointer" }} title="Bấm đổi mẫu Sàn Đá (Số 2)">
                <circle cx="400" cy="450" r="14" fill="#facc15" stroke="#ffffff" strokeWidth="2" />
                <text x="400" y="455" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="900">2</text>
              </g>

              {/* GHIM SỐ 3: TRẦN ĐÈN LED (Ứng với Tab 3: Trần LED) */}
              <g onClick={() => setActiveTab("ceiling")} style={{ cursor: "pointer" }} title="Bấm đổi mẫu Trần LED (Số 3)">
                <circle cx="400" cy="55" r="14" fill="#facc15" stroke="#ffffff" strokeWidth="2" />
                <text x="400" y="60" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="900">3</text>
              </g>

              {/* GHIM SỐ 4: TAY VỊN (Ứng với Tab 4: Tay Vịn) */}
              <g onClick={() => setActiveTab("handrail")} style={{ cursor: "pointer" }} title="Bấm đổi mẫu Tay Vịn (Số 4)">
                <circle cx="560" cy="265" r="14" fill="#facc15" stroke="#ffffff" strokeWidth="2" />
                <text x="560" y="270" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="900">4</text>
              </g>
            </>
          )}
        </svg>

        {/* Thanh watermark hiển thị cấu hình */}
        <div className="cabin-status-watermark">
          <span>
            {!isDoorsOpen ? "Cửa tầng tự động đang đóng kín" : `${curWallObj.name} • ${curFloorObj.name}`}
          </span>
          <span className="badge-door-type">
            {doorType === "CO" ? "Cửa mở tim (CO)" : "Cửa mở lùa (SO)"}
          </span>
        </div>
      </div>

      {/* 3. BẢNG GỌI TẦNG THỰC TẾ (BẤM TẦNG THANG TỰ ĐỘNG CHẠY) */}
      <div className="cabin-floor-call-station">
        <div className="floor-station-header">
          <span className="station-title">
            <i className="bi bi-joystick text-warning me-2"></i>
            BẤM GỌI TẦNG TRẢI NGHIỆM:
          </span>
          <span className="station-status">
            {elevatorStatus === "idle" && (
              <span className="text-success fw-semibold">
                <i className="bi bi-check-circle-fill me-1"></i>Đang dừng tại Tầng {currentFloor} (Sẵn sàng)
              </span>
            )}
            {elevatorStatus === "closing" && (
              <span className="text-warning fw-semibold">
                <i className="bi bi-hourglass-split me-1"></i>Cửa đang tự động đóng lại...
              </span>
            )}
            {elevatorStatus === "moving" && (
              <span className="text-info fw-bold">
                <i className="bi bi-arrow-repeat me-1 animate-spin"></i>Đang chạy {moveDirection === "up" ? "lên" : "xuống"} Tầng {targetFloor}...
              </span>
            )}
            {elevatorStatus === "opening" && (
              <span className="text-primary fw-bold">
                <i className="bi bi-bell-fill text-warning me-1"></i>Ding! Đã đến Tầng {targetFloor} • Đang mở cửa
              </span>
            )}
          </span>
        </div>

        <div className="floor-buttons-row">
          {floorList.map((fNum) => {
            const isCurrent = currentFloor === fNum;
            const isTarget = targetFloor === fNum && elevatorStatus !== "idle";
            return (
              <button
                key={fNum}
                type="button"
                className={`btn-floor-call ${isCurrent ? "current" : ""} ${isTarget ? "calling" : ""}`}
                onClick={() => handleCallFloor(fNum)}
                title={`Bấm để đi thang máy đến Tầng ${fNum}`}
              >
                <span className="floor-number">{fNum}F</span>
                <span className="floor-subtext">
                  {isTarget ? "Đang đến..." : isCurrent ? "Đang đỗ" : `Tầng ${fNum}`}
                </span>
                {isCurrent && <span className="floor-active-dot"></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. BỘ CHỌN VẬT LIỆU TƯƠNG TÁC (TABS & THẺ SWATCH) - ĐÃ ĐỒNG BỘ 100% SỐ THỨ TỰ */}
      <div className="cabin-cfg-controls">
        <div className="cabin-tabs-nav">
          <button
            type="button"
            className={`cabin-tab-item ${activeTab === "walls" ? "active" : ""}`}
            onClick={() => setActiveTab("walls")}
          >
            <i className="bi bi-palette2"></i>
            1. Vách Cabin ({WALL_OPTIONS.length})
          </button>
          <button
            type="button"
            className={`cabin-tab-item ${activeTab === "flooring" ? "active" : ""}`}
            onClick={() => setActiveTab("flooring")}
          >
            <i className="bi bi-grid-3x3"></i>
            2. Sàn Đá ({FLOOR_OPTIONS.length})
          </button>
          <button
            type="button"
            className={`cabin-tab-item ${activeTab === "ceiling" ? "active" : ""}`}
            onClick={() => setActiveTab("ceiling")}
          >
            <i className="bi bi-brightness-high"></i>
            3. Trần LED ({CEILING_OPTIONS.length})
          </button>
          <button
            type="button"
            className={`cabin-tab-item ${activeTab === "handrail" ? "active" : ""}`}
            onClick={() => setActiveTab("handrail")}
          >
            <i className="bi bi-slash-circle"></i>
            4. Tay Vịn ({HANDRAIL_OPTIONS.length})
          </button>
        </div>

        {/* Tab 1: Vách Cabin */}
        {activeTab === "walls" && (
          <div className="cabin-cards-grid">
            {WALL_OPTIONS.map((item) => {
              const isSelected = selectedWallId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`cabin-material-card ${isSelected ? "active" : ""}`}
                  onClick={() => handleSelectWall(item)}
                >
                  <div className="swatch-preview-box" style={{ background: item.colorPreview }}>
                    {isSelected && (
                      <div className="swatch-check-icon">
                        <i className="bi bi-check-lg"></i>
                      </div>
                    )}
                  </div>
                  <div className="swatch-content">
                    <span className="swatch-name">{item.name}</span>
                    <span className="swatch-desc">{item.desc}</span>
                    <span className="swatch-badge">{item.badge}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 2: Sàn Đá */}
        {activeTab === "flooring" && (
          <div className="cabin-cards-grid">
            {FLOOR_OPTIONS.map((item) => {
              const isSelected = selectedFloorId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`cabin-material-card ${isSelected ? "active" : ""}`}
                  onClick={() => handleSelectFloor(item)}
                >
                  <div className="swatch-preview-box" style={{ background: item.colorPreview }}>
                    {isSelected && (
                      <div className="swatch-check-icon">
                        <i className="bi bi-check-lg"></i>
                      </div>
                    )}
                  </div>
                  <div className="swatch-content">
                    <span className="swatch-name">{item.name}</span>
                    <span className="swatch-desc">{item.desc}</span>
                    <span className="swatch-badge">{item.badge}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 3: Trần LED */}
        {activeTab === "ceiling" && (
          <div className="cabin-cards-grid">
            {CEILING_OPTIONS.map((item) => {
              const isSelected = selectedCeilingId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`cabin-material-card ${isSelected ? "active" : ""}`}
                  onClick={() => handleSelectCeiling(item)}
                >
                  <div className="swatch-preview-box" style={{ background: item.colorPreview }}>
                    {isSelected && (
                      <div className="swatch-check-icon">
                        <i className="bi bi-check-lg"></i>
                      </div>
                    )}
                  </div>
                  <div className="swatch-content">
                    <span className="swatch-name">{item.name}</span>
                    <span className="swatch-desc">{item.desc}</span>
                    <span className="swatch-badge">{item.badge}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 4: Tay Vịn */}
        {activeTab === "handrail" && (
          <div className="cabin-cards-grid">
            {HANDRAIL_OPTIONS.map((item) => {
              const isSelected = selectedHandrailId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`cabin-material-card ${isSelected ? "active" : ""}`}
                  onClick={() => handleSelectHandrail(item)}
                >
                  <div className="swatch-preview-box" style={{ background: item.colorPreview }}>
                    {isSelected && (
                      <div className="swatch-check-icon">
                        <i className="bi bi-check-lg"></i>
                      </div>
                    )}
                  </div>
                  <div className="swatch-content">
                    <span className="swatch-name">{item.name}</span>
                    <span className="swatch-desc">{item.desc}</span>
                    <span className="swatch-badge">{item.badge}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Footer & Đồng bộ */}
      <div className="cabin-viz-footer">
        <div className="cabin-selected-badges">
          <span className="badge-item">
            1. Vách: <strong>{curWallObj.name}</strong>
          </span>
          <span className="badge-item">
            2. Sàn: <strong>{curFloorObj.name}</strong>
          </span>
          <span className="badge-item">
            3. Trần: <strong>{curCeilObj.name}</strong>
          </span>
          <span className="badge-item">
            4. Tay vịn: <strong>{curRailObj.name}</strong>
          </span>
        </div>

        <div className="cabin-footer-actions">
          <button
            type="button"
            className="btn-viz-reset"
            onClick={handleReset}
            title="Khôi phục cấu hình tiêu chuẩn"
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i>
            Đặt lại
          </button>
          <button
            type="button"
            className="btn-viz-apply"
            onClick={handleConsultClick}
            title="Chuyển cấu hình này vào bảng dự toán"
          >
            <span>Tư vấn cấu hình này</span>
            <i className="bi bi-arrow-down-short fs-5"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
