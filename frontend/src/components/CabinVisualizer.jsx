import { useState, useEffect } from "react";
import "./CabinVisualizer.css";

// 1. Dữ liệu Vách Cabin (Walls)
export const WALL_OPTIONS = [
  {
    id: "inox-guong-vang",
    name: "Inox Gương Vàng PVD Hoàng Gia",
    desc: "Mạ titan vàng Champagne, vách gương bóng loáng phối hoa văn laser chìm",
    badge: "Bán chạy nhất",
    syncValue: "inox-guong-vang",
    colorPreview: "linear-gradient(135deg, #78350f, #d4af37, #fef08a, #ca8a04)"
  },
  {
    id: "homelift-kinh",
    name: "Vách Kính Panorama Trong Suốt",
    desc: "Kính cường lực an toàn 10mm 4 mặt, lấy sáng tự nhiên và ngắm cảnh",
    badge: "Hiện đại & Thoáng",
    syncValue: "homelift-kinh",
    colorPreview: "linear-gradient(135deg, #0284c7, #38bdf8, #bae6fd, #0369a1)"
  },
  {
    id: "inox-tieu-chuan",
    name: "Inox 304 Sọc Nhuyễn Tiêu Chuẩn",
    desc: "Vân xước hairline satin chống bám vân tay, độ bền cơ học vĩnh cửu",
    badge: "Bền bỉ kinh tế",
    syncValue: "inox-tieu-chuan",
    colorPreview: "linear-gradient(135deg, #475569, #94a3b8, #e2e8f0, #64748b)"
  },
  {
    id: "wood-luxury",
    name: "Gỗ Tự Nhiên & Inox Gương",
    desc: "Ốp gỗ sồi / óc chó tự nhiên phối gương soi trung tâm tân cổ điển",
    badge: "Biệt thự cao cấp",
    syncValue: "inox-guong-vang",
    colorPreview: "linear-gradient(135deg, #451a03, #92400e, #d4af37, #78350f)"
  }
];

// 2. Dữ liệu Sàn Cabin (Flooring)
export const FLOOR_OPTIONS = [
  {
    id: "floor-royal",
    name: "Đá Thảm CNC Hoàng Gia",
    desc: "Cẩm thạch tự nhiên cắt CNC hoa văn tròn đối xứng vàng đen sang trọng",
    badge: "Cao cấp",
    colorPreview: "radial-gradient(circle, #facc15 15%, #ca8a04 35%, #1e1b18 65%, #0b0f19 90%)"
  },
  {
    id: "floor-galaxy",
    name: "Đá Granite Kim Sa Đen",
    desc: "Nền đá đen tuyền ánh kim sa vàng lấp lánh, chống trầy xước và bền màu",
    badge: "Bền màu",
    colorPreview: "radial-gradient(circle, #fde047 1px, transparent 1px), #09090b"
  },
  {
    id: "floor-carrara",
    name: "Đá Marble Trắng Ý Carrara",
    desc: "Trắng ngọc vân mây xám thanh lịch, mở rộng không gian cabin",
    badge: "Tao nhã",
    colorPreview: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)"
  }
];

// 3. Dữ liệu Trần Cabin (Ceiling)
export const CEILING_OPTIONS = [
  {
    id: "ceil-dome",
    name: "Trần Vòm Âm LED Gián Tiếp",
    desc: "Vòm trần âm ánh sáng vàng ấm 3000K dịu mắt, chống chói khi nhìn lên",
    badge: "Sang trọng",
    colorPreview: "radial-gradient(ellipse at center, #fef08a 20%, #eab308 55%, #1e293b 85%)"
  },
  {
    id: "ceil-diamond",
    name: "Trần Cắt Laser Kim Cương",
    desc: "Inox gương khắc hoa văn kim cương tán xạ ánh sáng đa chiều lấp lánh",
    badge: "Ấn tượng",
    colorPreview: "linear-gradient(45deg, #1e293b 25%, #475569 50%, #facc15 75%)"
  },
  {
    id: "ceil-minimal",
    name: "Trần Linear Tối Giản Scandinavian",
    desc: "Hệ thanh LED song song ánh sáng trắng 6000K chuẩn phong cách Bắc Âu",
    badge: "Tối giản",
    colorPreview: "repeating-linear-gradient(90deg, #38bdf8 0 3px, #0f172a 3px 20px)"
  }
];

// 4. Dữ liệu Tay Vịn Cabin (Handrail)
export const HANDRAIL_OPTIONS = [
  {
    id: "rail-gold",
    name: "Tay Vịn Tròn Inox Mạ Vàng PVD",
    desc: "Inox 304 phi 38 mạ PVD vàng Champagne đồng bộ vách gương",
    badge: "Hoàng Gia",
    colorPreview: "linear-gradient(180deg, #fef08a, #eab308, #713f12)"
  },
  {
    id: "rail-silver",
    name: "Tay Vịn Dẹp Inox 304 Xước Mờ",
    desc: "Bản dẹp 40mm chống trơn trượt, góc bo cạnh satin cao cấp",
    badge: "Tiêu chuẩn",
    colorPreview: "linear-gradient(180deg, #ffffff, #94a3b8, #334155)"
  },
  {
    id: "rail-wood",
    name: "Tay Vịn Gỗ Tự Nhiên Phối Kim Loại",
    desc: "Thân gỗ sồi/óc chó tự nhiên ấm cúng kết hợp chân đế mạ vàng PVD",
    badge: "Biệt thự",
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
  // Tab lựa chọn hiện tại: 'walls' | 'flooring' | 'ceiling' | 'handrail'
  const [activeTab, setActiveTab] = useState("walls");

  // State các tùy chọn đang kích hoạt
  const [selectedWallId, setSelectedWallId] = useState(
    elevatorType === "inox-guong-vang" ? "inox-guong-vang" :
    elevatorType === "inox-tieu-chuan" ? "inox-tieu-chuan" : "homelift-kinh"
  );
  const [selectedFloorId, setSelectedFloorId] = useState("floor-royal");
  const [selectedCeilingId, setSelectedCeilingId] = useState("ceil-dome");
  const [selectedHandrailId, setSelectedHandrailId] = useState("rail-gold");

  // Tương tác trực tiếp: Mở/Đóng cửa và Bật/Tắt đèn
  const [isDoorsOpen, setIsDoorsOpen] = useState(true);
  const [isLightOn, setIsLightOn] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  // Đồng bộ khi người dùng click chọn loại thang ở Bước 3 bên ngoài
  useEffect(() => {
    if (elevatorType === "inox-guong-vang") {
      setSelectedWallId("inox-guong-vang");
    } else if (elevatorType === "inox-tieu-chuan") {
      setSelectedWallId("inox-tieu-chuan");
    } else if (elevatorType === "homelift-kinh") {
      setSelectedWallId("homelift-kinh");
    }
  }, [elevatorType]);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2200);
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

  // 1. Thao tác chọn Vách
  const handleSelectWall = (item) => {
    setSelectedWallId(item.id);
    if (onChangeElevatorType && item.syncValue) {
      onChangeElevatorType(item.syncValue);
    }
    triggerToast(`Đã đổi vách: ${item.name}`);
    notifyParent({ wallId: item.id });
  };

  // 2. Thao tác chọn Sàn
  const handleSelectFloor = (item) => {
    setSelectedFloorId(item.id);
    triggerToast(`Đã đổi sàn: ${item.name}`);
    notifyParent({ floorId: item.id });
  };

  // 3. Thao tác chọn Trần
  const handleSelectCeiling = (item) => {
    setSelectedCeilingId(item.id);
    triggerToast(`Đã đổi trần: ${item.name}`);
    notifyParent({ ceilingId: item.id });
  };

  // 4. Thao tác chọn Tay vịn
  const handleSelectHandrail = (item) => {
    setSelectedHandrailId(item.id);
    triggerToast(`Đã đổi tay vịn: ${item.name}`);
    notifyParent({ handrailId: item.id });
  };

  // Đặt lại cấu hình mặc định
  const handleReset = () => {
    setSelectedWallId("homelift-kinh");
    setSelectedFloorId("floor-galaxy");
    setSelectedCeilingId("ceil-dome");
    setSelectedHandrailId("rail-silver");
    setIsDoorsOpen(true);
    setIsLightOn(true);
    if (onChangeElevatorType) {
      onChangeElevatorType("homelift-kinh");
    }
    triggerToast("Đã khôi phục cấu hình tiêu chuẩn");
    notifyParent({
      wallId: "homelift-kinh",
      floorId: "floor-galaxy",
      ceilingId: "ceil-dome",
      handrailId: "rail-silver"
    });
  };

  // Nút gửi tư vấn cấu hình
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
              Tùy biến vật liệu thật • Phản hồi tức thì
            </small>
          </div>
        </div>

        <div className="cabin-viz-actions">
          {/* Nút bật/tắt đèn */}
          <button
            type="button"
            className={`cabin-viz-btn-action ${isLightOn ? "active" : ""}`}
            onClick={() => {
              setIsLightOn(!isLightOn);
              triggerToast(!isLightOn ? "Đèn cabin: Bật sáng" : "Đèn cabin: Chế độ ban đêm");
            }}
            title={isLightOn ? "Tắt đèn cabin" : "Bật đèn cabin"}
          >
            <i className={`bi ${isLightOn ? "bi-lightbulb-fill text-warning" : "bi-lightbulb"}`}></i>
            <span>{isLightOn ? "Đèn Bật" : "Đèn Tắt"}</span>
          </button>

          {/* Nút mở/đóng cửa */}
          <button
            type="button"
            className={`cabin-viz-btn-action ${isDoorsOpen ? "active" : ""}`}
            onClick={() => {
              setIsDoorsOpen(!isDoorsOpen);
              triggerToast(!isDoorsOpen ? "Cửa tầng tự động đang mở" : "Cửa tầng tự động đã đóng");
            }}
            title={isDoorsOpen ? "Đóng cửa cabin" : "Mở cửa cabin"}
          >
            <i className={`bi ${isDoorsOpen ? "bi-door-open-fill text-info" : "bi-door-closed-fill"}`}></i>
            <span>{isDoorsOpen ? "Cửa Mở" : "Cửa Đóng"}</span>
          </button>
        </div>
      </div>

      {/* 2. Sân khấu đồ họa kiến trúc 2.5D SVG */}
      <div className="cabin-stage">
        {/* Màn hình hiển thị số tầng LED trên đỉnh thang */}
        <div className="cabin-landing-indicator">
          <span className="floor-num">{stops}F</span>
          <span className="dir-arrow">▲</span>
          <span className="capacity-badge">{capacityKg}kg • {Math.round(capacityKg / 75)} người</span>
        </div>

        {/* Thông báo tương tác (Toast) */}
        {toastMsg && (
          <div className="cabin-live-toast">
            <i className="bi bi-check-circle-fill me-1 text-success"></i>
            {toastMsg}
          </div>
        )}

        {/* KHUNG ĐỒ HỌA 2.5D SVG CHÂN THỰC & MƯỢT MÀ */}
        <svg
          viewBox="0 0 800 520"
          className="cabin-svg-canvas"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* --- GRADIENTS CHO VÁCH CABIN --- */}
            {/* 1. Inox Gương Vàng PVD Hoàng Gia */}
            <linearGradient id="grad-gold-back" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="18%" stopColor="#d4af37" />
              <stop offset="35%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#ca8a04" />
              <stop offset="65%" stopColor="#fef9c3" />
              <stop offset="82%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="grad-gold-left" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#451a03" />
              <stop offset="60%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#d4af37" />
            </linearGradient>
            <linearGradient id="grad-gold-right" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d4af37" />
              <stop offset="40%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>

            {/* 2. Vách Kính Homelift Panorama */}
            <linearGradient id="grad-sky-view" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0369a1" />
              <stop offset="45%" stopColor="#38bdf8" />
              <stop offset="70%" stopColor="#bae6fd" />
              <stop offset="100%" stopColor="#e0f2fe" />
            </linearGradient>
            <linearGradient id="grad-glass-reflection" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
              <stop offset="40%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="60%" stopColor="rgba(56,189,248,0.25)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.35)" />
            </linearGradient>

            {/* 3. Inox 304 Sọc Nhuyễn Tiêu Chuẩn */}
            <linearGradient id="grad-inox-back" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="25%" stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#f8fafc" />
              <stop offset="75%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="grad-inox-left" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
            <linearGradient id="grad-inox-right" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            {/* 4. Gỗ Tự Nhiên & Inox Gương */}
            <linearGradient id="grad-wood-panel" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#451a03" />
              <stop offset="20%" stopColor="#78350f" />
              <stop offset="45%" stopColor="#92400e" />
              <stop offset="70%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>

            {/* --- GRADIENTS CHO SÀN CABIN --- */}
            {/* Đá Thảm Hoàng Gia */}
            <radialGradient id="grad-royal-medallion" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="22%" stopColor="#eab308" />
              <stop offset="45%" stopColor="#78350f" />
              <stop offset="68%" stopColor="#1e1b18" />
              <stop offset="90%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#09090b" />
            </radialGradient>

            {/* Đá Granite Kim Sa Đen */}
            <linearGradient id="grad-floor-galaxy" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#18181b" />
              <stop offset="50%" stopColor="#09090b" />
              <stop offset="100%" stopColor="#000000" />
            </linearGradient>

            {/* Đá Marble Trắng Carrara */}
            <linearGradient id="grad-floor-carrara" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="40%" stopColor="#f8fafc" />
              <stop offset="70%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>

            {/* --- GRADIENTS CHO TRẦN & ĐÈN --- */}
            <linearGradient id="grad-ceil-base" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <radialGradient id="grad-dome-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#fef08a" />
              <stop offset="70%" stopColor="#eab308" />
              <stop offset="100%" stopColor="rgba(234, 179, 8, 0)" />
            </radialGradient>
            <radialGradient id="grad-minimal-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
            </radialGradient>

            {/* --- GRADIENTS CHO TAY VỊN --- */}
            <linearGradient id="grad-rail-gold" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="30%" stopColor="#eab308" />
              <stop offset="70%" stopColor="#a16207" />
              <stop offset="100%" stopColor="#713f12" />
            </linearGradient>
            <linearGradient id="grad-rail-silver" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#cbd5e1" />
              <stop offset="80%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <linearGradient id="grad-rail-wood" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="40%" stopColor="#78350f" />
              <stop offset="85%" stopColor="#451a03" />
              <stop offset="100%" stopColor="#d4af37" />
            </linearGradient>

            {/* Đổ bóng cho Tay vịn và Bảng COP */}
            <filter id="shadow-filter" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* 1. LỚP VÁCH SAU (Back Wall) */}
          <g id="layer-back-wall" onClick={() => setActiveTab("walls")} style={{ cursor: "pointer" }}>
            {selectedWallId === "homelift-kinh" && (
              <>
                {/* Khung cảnh thành phố / bầu trời nhìn xuyên qua kính */}
                <rect x="160" y="90" width="480" height="290" fill="url(#grad-sky-view)" />
                {/* Đường chân trời và tòa nhà mờ ảo ngoài kính */}
                <path d="M 160 300 L 220 280 L 250 290 L 320 250 L 370 285 L 430 240 L 490 270 L 550 255 L 600 290 L 640 280 L 640 380 L 160 380 Z" fill="rgba(2, 132, 199, 0.22)" />
                {/* Lớp kính an toàn và phản xạ ánh sáng */}
                <rect x="160" y="90" width="480" height="290" fill="url(#grad-glass-reflection)" />
                {/* Nẹp kính nhôm xingfa định hình */}
                <line x1="320" y1="90" x2="320" y2="380" stroke="#0284c7" strokeWidth="3" opacity="0.8" />
                <line x1="480" y1="90" x2="480" y2="380" stroke="#0284c7" strokeWidth="3" opacity="0.8" />
                {/* Khung spider inox 4 chấu giữ kính */}
                <circle cx="320" cy="190" r="5" fill="#e0f2fe" stroke="#0369a1" strokeWidth="2" />
                <circle cx="480" cy="190" r="5" fill="#e0f2fe" stroke="#0369a1" strokeWidth="2" />
              </>
            )}

            {selectedWallId === "inox-guong-vang" && (
              <>
                <rect x="160" y="90" width="480" height="290" fill="url(#grad-gold-back)" />
                {/* Khung gương soi trung tâm dát vàng */}
                <rect x="260" y="105" width="280" height="260" fill="linear-gradient(180deg, #fef9c3, #ca8a04)" stroke="#fef08a" strokeWidth="2" />
                <rect x="270" y="115" width="260" height="240" fill="rgba(254, 240, 138, 0.25)" />
                {/* Chỉ nẹp kim loại hoa văn cổ điển */}
                <line x1="260" y1="90" x2="260" y2="380" stroke="#facc15" strokeWidth="3" />
                <line x1="540" y1="90" x2="540" y2="380" stroke="#facc15" strokeWidth="3" />
                {/* Logo thương hiệu Hà Hồng chìm */}
                <text x="400" y="150" textAnchor="middle" fill="#78350f" fontSize="11" fontWeight="800" letterSpacing="3" opacity="0.6">
                  HA HONG LUXURY GOLD
                </text>
              </>
            )}

            {selectedWallId === "inox-tieu-chuan" && (
              <>
                <rect x="160" y="90" width="480" height="290" fill="url(#grad-inox-back)" />
                {/* Khe ghép tấm inox tiêu chuẩn */}
                <line x1="300" y1="90" x2="300" y2="380" stroke="#334155" strokeWidth="2" />
                <line x1="500" y1="90" x2="500" y2="380" stroke="#334155" strokeWidth="2" />
                {/* Gương soi lửng inox ở giữa */}
                <rect x="315" y="110" width="170" height="150" fill="linear-gradient(135deg, #e2e8f0 0%, #ffffff 40%, #94a3b8 100%)" stroke="#cbd5e1" strokeWidth="2" />
              </>
            )}

            {selectedWallId === "wood-luxury" && (
              <>
                {/* Hai vách biên ốp gỗ óc chó cao cấp */}
                <rect x="160" y="90" width="480" height="290" fill="url(#grad-wood-panel)" />
                {/* Chỉ vàng trang trí giữa các tấm gỗ */}
                <line x1="250" y1="90" x2="250" y2="380" stroke="#d4af37" strokeWidth="2" />
                <line x1="550" y1="90" x2="550" y2="380" stroke="#d4af37" strokeWidth="2" />
                {/* Gương soi trung tâm viền vàng PVD */}
                <rect x="280" y="105" width="240" height="260" fill="linear-gradient(135deg, #fef9c3 0%, #d4af37 50%, #78350f 100%)" stroke="#facc15" strokeWidth="2" />
                <rect x="290" y="115" width="220" height="240" fill="rgba(255,255,255,0.2)" />
              </>
            )}
          </g>

          {/* 2. LỚP VÁCH BÊN TRÁI (Left Wall - Phối cảnh góc xiên) */}
          <polygon
            points="0,0 160,90 160,380 0,500"
            fill={
              selectedWallId === "homelift-kinh" ? "url(#grad-sky-view)" :
              selectedWallId === "inox-guong-vang" ? "url(#grad-gold-left)" :
              selectedWallId === "wood-luxury" ? "url(#grad-wood-panel)" :
              "url(#grad-inox-left)"
            }
            onClick={() => setActiveTab("walls")}
            style={{ cursor: "pointer" }}
          />
          {/* Lớp phản chiếu vách kính bên trái */}
          {selectedWallId === "homelift-kinh" && (
            <polygon points="0,0 160,90 160,380 0,500" fill="rgba(255,255,255,0.18)" />
          )}

          {/* 3. LỚP VÁCH BÊN PHẢI (Right Wall) */}
          <polygon
            points="800,0 640,90 640,380 800,500"
            fill={
              selectedWallId === "homelift-kinh" ? "url(#grad-sky-view)" :
              selectedWallId === "inox-guong-vang" ? "url(#grad-gold-right)" :
              selectedWallId === "wood-luxury" ? "url(#grad-wood-panel)" :
              "url(#grad-inox-right)"
            }
            onClick={() => setActiveTab("walls")}
            style={{ cursor: "pointer" }}
          />
          {selectedWallId === "homelift-kinh" && (
            <polygon points="800,0 640,90 640,380 800,500" fill="rgba(255,255,255,0.18)" />
          )}

          {/* BẢNG ĐIỀU KHIỂN CABIN COP (Car Operating Panel) GẮN TRÊN VÁCH PHẢI */}
          <g id="layer-cop-panel" filter="url(#shadow-filter)">
            {/* Cột kính đen acrylic */}
            <polygon points="680,120 740,140 740,430 680,400" fill="#09090b" stroke="#334155" strokeWidth="1.5" />
            {/* Màn hình LCD hiển thị số tầng */}
            <polygon points="690,145 730,158 730,195 690,182" fill="#020617" stroke="#0284c7" strokeWidth="1" />
            <text x="702" y="172" fill="#38bdf8" fontSize="13" fontWeight="800" fontFamily="monospace">
              {stops}
            </text>
            <text x="716" y="172" fill="#10b981" fontSize="11" fontWeight="bold">
              ▲
            </text>
            {/* Các phím gọi tầng có đèn nền dạ quang */}
            <ellipse cx="710" cy="225" rx="7" ry="5" fill="#f59e0b" stroke="#fef08a" strokeWidth="1" />
            <ellipse cx="710" cy="245" rx="7" ry="5" fill="#334155" stroke="#64748b" strokeWidth="1" />
            <ellipse cx="710" cy="265" rx="7" ry="5" fill="#334155" stroke="#64748b" strokeWidth="1" />
            <ellipse cx="710" cy="285" rx="7" ry="5" fill="#334155" stroke="#64748b" strokeWidth="1" />
            {/* Nút chuông cứu hộ khẩn cấp */}
            <ellipse cx="710" cy="320" rx="7" ry="5" fill="#ef4444" stroke="#fca5a5" strokeWidth="1" />
          </g>

          {/* 4. LỚP SÀN CABIN (Flooring - Phối cảnh hình thang mặt đáy) */}
          <g id="layer-flooring" onClick={() => setActiveTab("flooring")} style={{ cursor: "pointer" }}>
            {selectedFloorId === "floor-royal" && (
              <>
                {/* Nền đá đen Nero Marquina */}
                <polygon points="160,380 640,380 800,500 0,500" fill="#09090b" />
                {/* Viền đá hoa cương ngoài */}
                <polygon points="175,385 625,385 770,490 30,490" fill="none" stroke="#d4af37" strokeWidth="3" opacity="0.75" />
                {/* Thảm hoa văn tròn đối xứng CNC Hoàng Gia dạng elip 2.5D */}
                <ellipse cx="400" cy="440" rx="160" ry="42" fill="url(#grad-royal-medallion)" stroke="#facc15" strokeWidth="2.5" />
                {/* Vòng tròn họa tiết tâm elip */}
                <ellipse cx="400" cy="440" rx="90" ry="24" fill="none" stroke="#fef08a" strokeWidth="2" strokeDasharray="6,4" />
                {/* Ngôi sao la bàn trung tâm */}
                <path d="M 400 422 L 407 437 L 435 440 L 407 443 L 400 458 L 393 443 L 365 440 L 393 437 Z" fill="#facc15" />
              </>
            )}

            {selectedFloorId === "floor-galaxy" && (
              <>
                {/* Nền đá Granite Kim Sa Đen */}
                <polygon points="160,380 640,380 800,500 0,500" fill="url(#grad-floor-galaxy)" />
                {/* Các đường ron gạch chạy tụ về tâm phối cảnh */}
                <line x1="320" y1="380" x2="260" y2="500" stroke="#334155" strokeWidth="1" opacity="0.6" />
                <line x1="480" y1="380" x2="540" y2="500" stroke="#334155" strokeWidth="1" opacity="0.6" />
                <line x1="160" y1="440" x2="640" y2="440" stroke="#334155" strokeWidth="1" opacity="0.6" />
                {/* Hạt kim sa vàng và trắng lấp lánh */}
                <circle cx="340" cy="420" r="1.5" fill="#facc15" />
                <circle cx="450" cy="450" r="2" fill="#ffffff" />
                <circle cx="280" cy="460" r="1.8" fill="#facc15" />
                <circle cx="520" cy="430" r="1.5" fill="#ffffff" />
                <circle cx="380" cy="470" r="2" fill="#fde047" />
                <circle cx="420" cy="410" r="1.2" fill="#ffffff" />
                <circle cx="490" cy="480" r="1.6" fill="#facc15" />
              </>
            )}

            {selectedFloorId === "floor-carrara" && (
              <>
                {/* Đá Marble Trắng Ý Carrara */}
                <polygon points="160,380 640,380 800,500 0,500" fill="url(#grad-floor-carrara)" />
                {/* Vân mây xám tự nhiên thanh lịch */}
                <path d="M 200 400 Q 280 430 360 410 T 540 450" fill="none" stroke="#94a3b8" strokeWidth="2.5" opacity="0.6" />
                <path d="M 320 460 Q 420 440 500 480" fill="none" stroke="#94a3b8" strokeWidth="2" opacity="0.5" />
                <path d="M 160 440 Q 240 460 300 490" fill="none" stroke="#cbd5e1" strokeWidth="2" opacity="0.7" />
                {/* Đường chỉ ron đá cẩm thạch */}
                <line x1="320" y1="380" x2="260" y2="500" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="480" y1="380" x2="540" y2="500" stroke="#cbd5e1" strokeWidth="1.5" />
              </>
            )}
          </g>

          {/* LEN CHÂN TƯỜNG (Kickplate bằng Inox xước) */}
          <polygon points="0,500 800,500 800,520 0,520" fill="#334155" stroke="#475569" strokeWidth="1" />

          {/* 5. TAY VỊN CABIN (Handrail) */}
          <g id="layer-handrail" filter="url(#shadow-filter)" onClick={() => setActiveTab("handrail")} style={{ cursor: "pointer" }}>
            {/* Thanh tay vịn chạy ngang vách sau */}
            <rect
              x="200"
              y="260"
              width="400"
              height="14"
              rx="7"
              fill={
                selectedHandrailId === "rail-gold" ? "url(#grad-rail-gold)" :
                selectedHandrailId === "rail-wood" ? "url(#grad-rail-wood)" :
                "url(#grad-rail-silver)"
              }
              stroke={selectedHandrailId === "rail-gold" ? "#fef08a" : "#cbd5e1"}
              strokeWidth="1"
            />
            {/* Chân đế liên kết vách sau */}
            <rect x="250" y="274" width="14" height="14" fill="#334155" />
            <rect x="536" y="274" width="14" height="14" fill="#334155" />

            {/* Đoạn uốn tay vịn bên trái (perspective) */}
            <polygon
              points="0,310 200,260 200,274 0,324"
              fill={
                selectedHandrailId === "rail-gold" ? "url(#grad-rail-gold)" :
                selectedHandrailId === "rail-wood" ? "url(#grad-rail-wood)" :
                "url(#grad-rail-silver)"
              }
              opacity="0.9"
            />
            {/* Đoạn uốn tay vịn bên phải */}
            <polygon
              points="600,260 800,310 800,324 600,274"
              fill={
                selectedHandrailId === "rail-gold" ? "url(#grad-rail-gold)" :
                selectedHandrailId === "rail-wood" ? "url(#grad-rail-wood)" :
                "url(#grad-rail-silver)"
              }
              opacity="0.9"
            />
          </g>

          {/* 6. TRẦN CABIN & CHIẾU SÁNG LED (Ceiling) */}
          <g id="layer-ceiling" onClick={() => setActiveTab("ceiling")} style={{ cursor: "pointer" }}>
            {/* Mặt phẳng trần hình thang phối cảnh */}
            <polygon points="0,0 800,0 640,90 160,90" fill="url(#grad-ceil-base)" />

            {/* Kiểu trần 1: Trần vòm âm LED gián tiếp */}
            {selectedCeilingId === "ceil-dome" && (
              <>
                {/* Vòm âm hình elip */}
                <ellipse cx="400" cy="45" rx="170" ry="26" fill="#1e293b" stroke="#ca8a04" strokeWidth="2" />
                {isLightOn && (
                  <>
                    <ellipse cx="400" cy="45" rx="160" ry="23" fill="url(#grad-dome-glow)" />
                    {/* Luồng sáng tỏa xuống vách sau */}
                    <polygon points="280,75 520,75 600,250 200,250" fill="url(#grad-dome-glow)" opacity="0.28" pointerEvents="none" />
                  </>
                )}
              </>
            )}

            {/* Kiểu trần 2: Trần cắt Laser hoa văn kim cương */}
            {selectedCeilingId === "ceil-diamond" && (
              <>
                <polygon points="200,20 600,20 540,75 260,75" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
                {/* Họa tiết lưới kim cương tỏa sáng */}
                <path d="M 300 20 L 280 75 M 400 20 L 400 75 M 500 20 L 520 75" stroke="#facc15" strokeWidth="2" opacity={isLightOn ? 1 : 0.2} />
                <path d="M 230 45 L 570 45" stroke="#facc15" strokeWidth="2" opacity={isLightOn ? 1 : 0.2} />
                {isLightOn && (
                  <ellipse cx="400" cy="45" rx="140" ry="20" fill="url(#grad-dome-glow)" opacity="0.45" pointerEvents="none" />
                )}
              </>
            )}

            {/* Kiểu trần 3: Trần Linear tối giản Bắc Âu */}
            {selectedCeilingId === "ceil-minimal" && (
              <>
                {/* Hai dải thanh LED song song chiếu sáng trực tiếp */}
                <polygon points="270,10 285,10 255,80 240,80" fill={isLightOn ? "#ffffff" : "#475569"} />
                <polygon points="515,10 530,10 560,80 545,80" fill={isLightOn ? "#ffffff" : "#475569"} />
                {isLightOn && (
                  <>
                    <polygon points="260,10 295,10 265,80 230,80" fill="url(#grad-minimal-glow)" opacity="0.6" pointerEvents="none" />
                    <polygon points="505,10 540,10 570,80 535,80" fill="url(#grad-minimal-glow)" opacity="0.6" pointerEvents="none" />
                  </>
                )}
              </>
            )}
          </g>

          {/* 7. LỚP BÓNG TỐI / TẮT ĐÈN (Khi isLightOn === false) */}
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
            className={`cabin-svg-door door-left ${isDoorsOpen ? "door-open" : "door-closed"}`}
            style={{
              transform: isDoorsOpen ? "translateX(-95%)" : "translateX(0%)",
              transition: "transform 0.8s cubic-bezier(0.2, 0.9, 0.3, 1)"
            }}
          >
            <rect
              x="0"
              y="0"
              width="400"
              height="520"
              fill={selectedWallId === "inox-guong-vang" ? "url(#grad-gold-back)" : "url(#grad-inox-back)"}
              stroke="#1e293b"
              strokeWidth="3"
            />
            {/* Gioăng cao su giảm chấn mép cửa */}
            <rect x="394" y="0" width="6" height="520" fill="#09090b" />
            {/* Hoa văn hoặc ô kính trên cửa nếu là homelift kính */}
            {selectedWallId === "homelift-kinh" && (
              <rect x="60" y="80" width="280" height="360" fill="url(#grad-glass-reflection)" stroke="#0284c7" strokeWidth="2" rx="4" />
            )}
          </g>

          {/* Cánh cửa bên phải */}
          <g
            className={`cabin-svg-door door-right ${isDoorsOpen ? "door-open" : "door-closed"}`}
            style={{
              transform: isDoorsOpen ? "translateX(95%)" : "translateX(0%)",
              transition: "transform 0.8s cubic-bezier(0.2, 0.9, 0.3, 1)"
            }}
          >
            <rect
              x="400"
              y="0"
              width="400"
              height="520"
              fill={selectedWallId === "inox-guong-vang" ? "url(#grad-gold-back)" : "url(#grad-inox-back)"}
              stroke="#1e293b"
              strokeWidth="3"
            />
            {/* Gioăng cao su giảm chấn mép cửa */}
            <rect x="400" y="0" width="6" height="520" fill="#09090b" />
            {selectedWallId === "homelift-kinh" && (
              <rect x="460" y="80" width="280" height="360" fill="url(#grad-glass-reflection)" stroke="#0284c7" strokeWidth="2" rx="4" />
            )}
          </g>

          {/* Tia cảm biến an toàn Photocell ở giữa khi cửa đang mở */}
          {isDoorsOpen && (
            <line x1="400" y1="20" x2="400" y2="500" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.75" />
          )}

          {/* 9. CÁC NÚT GHIM TƯƠNG TÁC (HOTSPOTS) */}
          {isDoorsOpen && (
            <>
              {/* Điểm 1: Trần */}
              <g onClick={() => setActiveTab("ceiling")} style={{ cursor: "pointer" }}>
                <circle cx="400" cy="55" r="14" fill="#facc15" stroke="#ffffff" strokeWidth="2" />
                <text x="400" y="60" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="900">1</text>
              </g>

              {/* Điểm 2: Vách */}
              <g onClick={() => setActiveTab("walls")} style={{ cursor: "pointer" }}>
                <circle cx="270" cy="210" r="14" fill="#facc15" stroke="#ffffff" strokeWidth="2" />
                <text x="270" y="215" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="900">2</text>
              </g>

              {/* Điểm 3: Tay vịn */}
              <g onClick={() => setActiveTab("handrail")} style={{ cursor: "pointer" }}>
                <circle cx="560" cy="265" r="14" fill="#facc15" stroke="#ffffff" strokeWidth="2" />
                <text x="560" y="270" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="900">3</text>
              </g>

              {/* Điểm 4: Sàn đá */}
              <g onClick={() => setActiveTab("flooring")} style={{ cursor: "pointer" }}>
                <circle cx="400" cy="450" r="14" fill="#facc15" stroke="#ffffff" strokeWidth="2" />
                <text x="400" y="455" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="900">4</text>
              </g>
            </>
          )}
        </svg>

        {/* Thanh ghi chú trạng thái hiện tại dưới sàn */}
        <div className="cabin-status-watermark">
          <span>
            {!isDoorsOpen ? "Cửa tầng tự động đang đóng kín" : `${curWallObj.name} • ${curFloorObj.name}`}
          </span>
          <span className="badge-door-type">
            {doorType === "CO" ? "Cửa mở tim 2 cánh (CO)" : "Cửa mở lùa 2 cánh (SO)"}
          </span>
        </div>
      </div>

      {/* 3. BỘ CHỌN VẬT LIỆU TƯƠNG TÁC (TABS & THẺ SWATCH) */}
      <div className="cabin-cfg-controls">
        {/* Hàng 4 Tabs chuyển đổi chức năng */}
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

        {/* Tab 2: Sàn Cabin */}
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

        {/* Tab 3: Trần Cabin */}
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

        {/* Tab 4: Tay Vịn Cabin */}
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

      {/* 4. Footer & Đồng bộ Dự toán */}
      <div className="cabin-viz-footer">
        <div className="cabin-selected-badges">
          <span className="badge-item">
            Vách: <strong>{curWallObj.name}</strong>
          </span>
          <span className="badge-item">
            Sàn: <strong>{curFloorObj.name}</strong>
          </span>
          <span className="badge-item">
            Trần: <strong>{curCeilObj.name}</strong>
          </span>
          <span className="badge-item">
            Tay vịn: <strong>{curRailObj.name}</strong>
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
