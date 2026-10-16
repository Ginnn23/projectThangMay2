import { useState, useEffect, useRef } from "react";
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

  // State các tùy chọn vật liệu đang chọn
  const [selectedWallId, setSelectedWallId] = useState(
    elevatorType === "inox-guong-vang" ? "inox-guong-vang" :
    elevatorType === "inox-tieu-chuan" ? "inox-tieu-chuan" : "homelift-kinh"
  );
  const [selectedFloorId, setSelectedFloorId] = useState("floor-royal");
  const [selectedCeilingId, setSelectedCeilingId] = useState("ceil-dome");
  const [selectedHandrailId, setSelectedHandrailId] = useState("rail-gold");

  // State điều khiển Cửa & Đèn
  const [isDoorsOpen, setIsDoorsOpen] = useState(true);
  const [isLightOn, setIsLightOn] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  // State MÔ PHỎNG THANG MÁY CHẠY TẦNG (Elevator Floor Trip Simulation)
  const [currentFloor, setCurrentFloor] = useState(1);
  const [targetFloor, setTargetFloor] = useState(1);
  const [elevatorStatus, setElevatorStatus] = useState("idle"); // 'idle' | 'closing' | 'moving' | 'opening'
  const [moveDirection, setMoveDirection] = useState(null); // 'up' | 'down' | null
  const tripIntervalRef = useRef(null);

  // Danh sách các tầng khả dụng (từ Tầng 1 đến số điểm dừng stops)
  const totalStops = Math.min(Math.max(Number(stops) || 4, 2), 10);
  const floorList = Array.from({ length: totalStops }, (_, i) => i + 1);

  // Đảm bảo currentFloor không vượt quá tổng số tầng khi user giảm số tầng ở Bước 2
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
      setSelectedWallId("homelift-kinh");
    }
  }, [elevatorType]);

  // Cleanup interval khi unmount
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

  // -------------------------------------------------------------
  // CHỨC NĂNG BẤM TẦNG THANG MÁY TỰ ĐÓNG VÀ MỞ CỬA TẠI TẦNG ĐÍCH
  // -------------------------------------------------------------
  const handleCallFloor = (target) => {
    if (elevatorStatus !== "idle") {
      triggerToast("Thang máy đang trong hành trình, vui lòng chờ...");
      return;
    }

    if (target === currentFloor) {
      if (!isDoorsOpen) {
        setIsDoorsOpen(true);
        triggerToast(`Thang máy đang ở Tầng ${target} • Đang mở cửa đón khách`);
      } else {
        triggerToast(`Thang máy hiện đang đỗ tại Tầng ${target}`);
      }
      return;
    }

    const direction = target > currentFloor ? "up" : "down";
    setTargetFloor(target);
    setMoveDirection(direction);
    setElevatorStatus("closing");
    triggerToast(`Đã bấm Tầng ${target} • Cửa đang tự động đóng lại...`);

    // Bước 1: Tự động ĐÓNG CỬA
    setIsDoorsOpen(false);

    // Bước 2: Sau khi cửa đóng kín (850ms), thang máy bắt đầu chạy
    setTimeout(() => {
      setElevatorStatus("moving");
      const stepsToTravel = Math.abs(target - currentFloor);
      let stepCount = 0;
      let activeFloor = currentFloor;

      tripIntervalRef.current = setInterval(() => {
        stepCount++;
        activeFloor = direction === "up" ? activeFloor + 1 : activeFloor - 1;
        setCurrentFloor(activeFloor);

        // Khi đến tầng mục tiêu
        if (activeFloor === target || stepCount >= stepsToTravel) {
          clearInterval(tripIntervalRef.current);
          tripIntervalRef.current = null;

          // Bước 3: Đến tầng đích -> Thông báo & Tự động MỞ CỬA
          setTimeout(() => {
            setElevatorStatus("opening");
            setMoveDirection(null);
            triggerToast(`🔔 Ding! Đã đến Tầng ${target} • Cửa đang tự động mở ra`);
            setIsDoorsOpen(true);

            // Hoàn thành hành trình, trở về trạng thái sẵn sàng
            setTimeout(() => {
              setElevatorStatus("idle");
            }, 900);
          }, 450);
        }
      }, 750); // Mỗi tầng chạy 0.75 giây
    }, 900);
  };

  // Nút mở / đóng cửa thủ công
  const handleManualDoorToggle = () => {
    if (elevatorStatus === "moving") {
      triggerToast("Thang máy đang di chuyển giữa các tầng, không thể mở cửa!");
      return;
    }
    const next = !isDoorsOpen;
    setIsDoorsOpen(next);
    triggerToast(next ? "Cửa thang máy đang mở ra" : "Cửa thang máy đã đóng kín");
  };

  // Nút bật / tắt đèn chiếu sáng
  const handleToggleLight = () => {
    const next = !isLightOn;
    setIsLightOn(next);
    triggerToast(next ? "Đèn cabin bật sáng • Ánh sáng rọi trần & sàn" : "Đèn cabin tắt • Chế độ ban đêm & đèn báo phụ");
  };

  // Thao tác chọn Vách
  const handleSelectWall = (item) => {
    setSelectedWallId(item.id);
    if (onChangeElevatorType && item.syncValue) {
      onChangeElevatorType(item.syncValue);
    }
    triggerToast(`Đã đổi vách: ${item.name}`);
    notifyParent({ wallId: item.id });
  };

  // Thao tác chọn Sàn
  const handleSelectFloor = (item) => {
    setSelectedFloorId(item.id);
    triggerToast(`Đã đổi sàn: ${item.name}`);
    notifyParent({ floorId: item.id });
  };

  // Thao tác chọn Trần
  const handleSelectCeiling = (item) => {
    setSelectedCeilingId(item.id);
    triggerToast(`Đã đổi trần: ${item.name}`);
    notifyParent({ ceilingId: item.id });
  };

  // Thao tác chọn Tay vịn
  const handleSelectHandrail = (item) => {
    setSelectedHandrailId(item.id);
    triggerToast(`Đã đổi tay vịn: ${item.name}`);
    notifyParent({ handrailId: item.id });
  };

  // Đặt lại cấu hình
  const handleReset = () => {
    setSelectedWallId("homelift-kinh");
    setSelectedFloorId("floor-galaxy");
    setSelectedCeilingId("ceil-dome");
    setSelectedHandrailId("rail-silver");
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
              Mô phỏng chạy tầng • Đèn chiếu rọi chân thực
            </small>
          </div>
        </div>

        <div className="cabin-viz-actions">
          {/* Nút bật / tắt đèn (Ánh sáng thực trong thang máy) */}
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

        {/* Toast thông báo tương tác nổi */}
        {toastMsg && (
          <div className="cabin-live-toast">
            <i className="bi bi-info-circle-fill me-1 text-info"></i>
            {toastMsg}
          </div>
        )}

        {/* KHUNG ĐỒ HỌA 2.5D SVG */}
        <svg
          viewBox="0 0 800 520"
          className="cabin-svg-canvas"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* --- GRADIENTS VÁCH CABIN --- */}
            {/* Inox Gương Vàng PVD Hoàng Gia */}
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

            {/* Vách Kính Homelift Panorama */}
            <linearGradient id="grad-sky-view" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0369a1" />
              <stop offset="45%" stopColor="#38bdf8" />
              <stop offset="70%" stopColor="#bae6fd" />
              <stop offset="100%" stopColor="#e0f2fe" />
            </linearGradient>
            <linearGradient id="grad-glass-reflection" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="35%" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="65%" stopColor="rgba(56,189,248,0.2)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
            </linearGradient>

            {/* Inox 304 Sọc Nhuyễn Tiêu Chuẩn */}
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

            {/* Gỗ Tự Nhiên & Inox Gương */}
            <linearGradient id="grad-wood-panel" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#451a03" />
              <stop offset="20%" stopColor="#78350f" />
              <stop offset="45%" stopColor="#92400e" />
              <stop offset="70%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>

            {/* --- GRADIENTS SÀN CABIN --- */}
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

            {/* --- HỆ THỐNG ÁNH SÁNG ĐÈN CHÂN THỰC TRONG THANG MÁY --- */}
            {/* 1. Luồng sáng hình nón chiếu rọi từ trần xuống sàn (Volumetric Downlight Beam) */}
            <linearGradient id="grad-light-cone" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={selectedCeilingId === "ceil-minimal" ? "rgba(255,255,255,0.7)" : "rgba(254,240,138,0.75)"} />
              <stop offset="25%" stopColor={selectedCeilingId === "ceil-minimal" ? "rgba(186,230,253,0.35)" : "rgba(250,204,21,0.4)"} />
              <stop offset="70%" stopColor={selectedCeilingId === "ceil-minimal" ? "rgba(56,189,248,0.12)" : "rgba(234,179,8,0.15)"} />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </linearGradient>

            {/* 2. Ánh sáng phản chiếu bóng loáng trên mặt sàn đá (Floor Specular Reflection) */}
            <radialGradient id="grad-floor-specular" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={selectedCeilingId === "ceil-minimal" ? "rgba(255,255,255,0.75)" : "rgba(254,240,138,0.8)"} />
              <stop offset="45%" stopColor={selectedCeilingId === "ceil-minimal" ? "rgba(186,230,253,0.35)" : "rgba(250,204,21,0.35)"} />
              <stop offset="85%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>

            {/* 3. Vệt sáng phản chiếu mép gương trên cùng vách sau */}
            <linearGradient id="grad-mirror-top-shine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>

            {/* Trần LED Vòm âm vàng ấm 3000K */}
            <radialGradient id="grad-dome-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#eab308" />
              <stop offset="90%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#1e293b" />
            </radialGradient>

            {/* Trần Linear LED trắng 6000K */}
            <radialGradient id="grad-minimal-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#7dd3fc" />
              <stop offset="80%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>

            {/* --- GRADIENTS TAY VỊN --- */}
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

            {/* Bộ lọc đổ bóng */}
            <filter id="shadow-filter" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* 1. LỚP VÁCH SAU (Back Wall) */}
          <g id="layer-back-wall" onClick={() => setActiveTab("walls")} style={{ cursor: "pointer" }}>
            {selectedWallId === "homelift-kinh" && (
              <>
                {/* Khung cảnh chuyển động parallax theo tầng hiện tại */}
                <g style={{ transform: `translateY(${(currentFloor - 1) * -12}px)`, transition: "transform 0.6s ease" }}>
                  <rect x="160" y="70" width="480" height="330" fill="url(#grad-sky-view)" />
                  {/* Tòa nhà và cảnh quan bên ngoài */}
                  <path d="M 160 300 L 220 270 L 250 280 L 320 240 L 370 275 L 430 230 L 490 260 L 550 245 L 600 280 L 640 270 L 640 380 L 160 380 Z" fill="rgba(2, 132, 199, 0.28)" />
                  <path d="M 180 320 L 240 295 L 300 320 L 360 290 L 420 325 L 500 295 L 570 310 L 640 290 L 640 380 L 160 380 Z" fill="rgba(3, 105, 161, 0.35)" />
                </g>
                {/* Lớp kính an toàn và phản xạ ánh sáng */}
                <rect x="160" y="90" width="480" height="290" fill="url(#grad-glass-reflection)" />
                {/* Nẹp kính nhôm xingfa định hình */}
                <line x1="320" y1="90" x2="320" y2="380" stroke="#0284c7" strokeWidth="3" opacity="0.8" />
                <line x1="480" y1="90" x2="480" y2="380" stroke="#0284c7" strokeWidth="3" opacity="0.8" />
                {/* Chân spider inox giữ kính */}
                <circle cx="320" cy="190" r="5" fill="#e0f2fe" stroke="#0369a1" strokeWidth="2" />
                <circle cx="480" cy="190" r="5" fill="#e0f2fe" stroke="#0369a1" strokeWidth="2" />
              </>
            )}

            {selectedWallId === "inox-guong-vang" && (
              <>
                <rect x="160" y="90" width="480" height="290" fill="url(#grad-gold-back)" />
                {/* Khung gương soi trung tâm dát vàng */}
                <rect x="260" y="105" width="280" height="260" fill="linear-gradient(180deg, #fef9c3, #ca8a04)" stroke="#fef08a" strokeWidth="2" />
                <rect x="270" y="115" width="260" height="240" fill={isLightOn ? "rgba(254, 240, 138, 0.3)" : "rgba(120, 53, 15, 0.4)"} />
                {/* Chỉ nẹp kim loại hoa văn cổ điển */}
                <line x1="260" y1="90" x2="260" y2="380" stroke="#facc15" strokeWidth="3" />
                <line x1="540" y1="90" x2="540" y2="380" stroke="#facc15" strokeWidth="3" />
                <text x="400" y="150" textAnchor="middle" fill="#78350f" fontSize="11" fontWeight="800" letterSpacing="3" opacity="0.6">
                  HA HONG LUXURY GOLD
                </text>
              </>
            )}

            {selectedWallId === "inox-tieu-chuan" && (
              <>
                <rect x="160" y="90" width="480" height="290" fill="url(#grad-inox-back)" />
                <line x1="300" y1="90" x2="300" y2="380" stroke="#334155" strokeWidth="2" />
                <line x1="500" y1="90" x2="500" y2="380" stroke="#334155" strokeWidth="2" />
                {/* Gương soi lửng inox ở giữa */}
                <rect x="315" y="110" width="170" height="150" fill="linear-gradient(135deg, #e2e8f0 0%, #ffffff 40%, #94a3b8 100%)" stroke="#cbd5e1" strokeWidth="2" />
              </>
            )}

            {selectedWallId === "wood-luxury" && (
              <>
                <rect x="160" y="90" width="480" height="290" fill="url(#grad-wood-panel)" />
                <line x1="250" y1="90" x2="250" y2="380" stroke="#d4af37" strokeWidth="2" />
                <line x1="550" y1="90" x2="550" y2="380" stroke="#d4af37" strokeWidth="2" />
                <rect x="280" y="105" width="240" height="260" fill="linear-gradient(135deg, #fef9c3 0%, #d4af37 50%, #78350f 100%)" stroke="#facc15" strokeWidth="2" />
                <rect x="290" y="115" width="220" height="240" fill={isLightOn ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)"} />
              </>
            )}

            {/* Vệt sáng gương chiếu rọi trên đỉnh vách sau khi BẬT ĐÈN */}
            {isLightOn && (
              <rect x="180" y="90" width="440" height="24" fill="url(#grad-mirror-top-shine)" opacity="0.45" pointerEvents="none" />
            )}
          </g>

          {/* 2. VÁCH TRÁI (Left Wall) */}
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
          {selectedWallId === "homelift-kinh" && (
            <polygon points="0,0 160,90 160,380 0,500" fill="rgba(255,255,255,0.18)" />
          )}

          {/* 3. VÁCH PHẢI (Right Wall) */}
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
            
            {/* Màn hình LCD hiển thị tầng hiện tại */}
            <polygon points="690,145 730,158 730,195 690,182" fill="#020617" stroke="#0284c7" strokeWidth="1" />
            <text x="702" y="172" fill="#38bdf8" fontSize="13" fontWeight="800" fontFamily="monospace">
              {currentFloor}
            </text>
            <text x="716" y="172" fill={moveDirection ? "#10b981" : "#64748b"} fontSize="11" fontWeight="bold">
              {moveDirection === "up" ? "▲" : moveDirection === "down" ? "▼" : "●"}
            </text>

            {/* Các phím gọi tầng tương tác thật (Click trực tiếp vào COP để đi tầng đó) */}
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

            {/* Nút chuông cứu hộ khẩn cấp */}
            <ellipse cx="710" cy="340" rx="7" ry="5" fill="#ef4444" stroke="#fca5a5" strokeWidth="1" />
          </g>

          {/* 4. LỚP SÀN CABIN (Flooring) */}
          <g id="layer-flooring" onClick={() => setActiveTab("flooring")} style={{ cursor: "pointer" }}>
            {selectedFloorId === "floor-royal" && (
              <>
                <polygon points="160,380 640,380 800,500 0,500" fill="#09090b" />
                <polygon points="175,385 625,385 770,490 30,490" fill="none" stroke="#d4af37" strokeWidth="3" opacity="0.75" />
                <ellipse cx="400" cy="440" rx="160" ry="42" fill="url(#grad-royal-medallion)" stroke="#facc15" strokeWidth="2.5" />
                <ellipse cx="400" cy="440" rx="90" ry="24" fill="none" stroke="#fef08a" strokeWidth="2" strokeDasharray="6,4" />
                <path d="M 400 422 L 407 437 L 435 440 L 407 443 L 400 458 L 393 443 L 365 440 L 393 437 Z" fill="#facc15" />
              </>
            )}

            {selectedFloorId === "floor-galaxy" && (
              <>
                <polygon points="160,380 640,380 800,500 0,500" fill="url(#grad-floor-galaxy)" />
                <line x1="320" y1="380" x2="260" y2="500" stroke="#334155" strokeWidth="1" opacity="0.6" />
                <line x1="480" y1="380" x2="540" y2="500" stroke="#334155" strokeWidth="1" opacity="0.6" />
                <line x1="160" y1="440" x2="640" y2="440" stroke="#334155" strokeWidth="1" opacity="0.6" />
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
                <polygon points="160,380 640,380 800,500 0,500" fill="url(#grad-floor-carrara)" />
                <path d="M 200 400 Q 280 430 360 410 T 540 450" fill="none" stroke="#94a3b8" strokeWidth="2.5" opacity="0.6" />
                <path d="M 320 460 Q 420 440 500 480" fill="none" stroke="#94a3b8" strokeWidth="2" opacity="0.5" />
                <path d="M 160 440 Q 240 460 300 490" fill="none" stroke="#cbd5e1" strokeWidth="2" opacity="0.7" />
                <line x1="320" y1="380" x2="260" y2="500" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="480" y1="380" x2="540" y2="500" stroke="#cbd5e1" strokeWidth="1.5" />
              </>
            )}

            {/* VỆT SÁNG PHẢN CHIẾU ĐÈN TRẦN TRÊN MẶT SÀN ĐÁ BÓNG KHI BẬT ĐÈN */}
            {isLightOn && (
              <ellipse
                cx="400"
                cy="435"
                rx="150"
                ry="32"
                fill="url(#grad-floor-specular)"
                pointerEvents="none"
              />
            )}
          </g>

          {/* LEN CHÂN TƯỜNG (Kickplate bằng Inox xước) */}
          <polygon points="0,500 800,500 800,520 0,520" fill="#334155" stroke="#475569" strokeWidth="1" />

          {/* 5. TAY VỊN CABIN (Handrail) */}
          <g id="layer-handrail" filter="url(#shadow-filter)" onClick={() => setActiveTab("handrail")} style={{ cursor: "pointer" }}>
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
            <rect x="250" y="274" width="14" height="14" fill="#334155" />
            <rect x="536" y="274" width="14" height="14" fill="#334155" />

            {/* Uốn tay vịn bên trái */}
            <polygon
              points="0,310 200,260 200,274 0,324"
              fill={
                selectedHandrailId === "rail-gold" ? "url(#grad-rail-gold)" :
                selectedHandrailId === "rail-wood" ? "url(#grad-rail-wood)" :
                "url(#grad-rail-silver)"
              }
              opacity="0.9"
            />
            {/* Uốn tay vịn bên phải */}
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

          {/* 6. TRẦN CABIN & HỆ THỐNG ĐÈN CHIẾU SÁNG THỰC */}
          <g id="layer-ceiling" onClick={() => setActiveTab("ceiling")} style={{ cursor: "pointer" }}>
            {/* Khung trần đế */}
            <polygon points="0,0 800,0 640,90 160,90" fill="#0f172a" />

            {/* Kiểu trần 1: Trần Vòm Âm LED Gián Tiếp */}
            {selectedCeilingId === "ceil-dome" && (
              <>
                <ellipse
                  cx="400"
                  cy="45"
                  rx="170"
                  ry="26"
                  fill={isLightOn ? "url(#grad-dome-glow)" : "#1e293b"}
                  stroke={isLightOn ? "#facc15" : "#475569"}
                  strokeWidth="2"
                />
                {isLightOn && (
                  <ellipse cx="400" cy="45" rx="140" ry="20" fill="#ffffff" opacity="0.8" />
                )}
              </>
            )}

            {/* Kiểu trần 2: Trần Cắt Laser Kim Cương */}
            {selectedCeilingId === "ceil-diamond" && (
              <>
                <polygon
                  points="200,20 600,20 540,75 260,75"
                  fill={isLightOn ? "#1e293b" : "#0f172a"}
                  stroke={isLightOn ? "#cbd5e1" : "#334155"}
                  strokeWidth="2"
                />
                <path d="M 300 20 L 280 75 M 400 20 L 400 75 M 500 20 L 520 75" stroke={isLightOn ? "#facc15" : "#475569"} strokeWidth="2" />
                <path d="M 230 45 L 570 45" stroke={isLightOn ? "#facc15" : "#475569"} strokeWidth="2" />
                {isLightOn && (
                  <ellipse cx="400" cy="45" rx="150" ry="22" fill="url(#grad-dome-glow)" opacity="0.6" />
                )}
              </>
            )}

            {/* Kiểu trần 3: Trần Linear Tối Giản Bắc Âu */}
            {selectedCeilingId === "ceil-minimal" && (
              <>
                <polygon points="270,10 285,10 255,80 240,80" fill={isLightOn ? "#ffffff" : "#334155"} />
                <polygon points="515,10 530,10 560,80 545,80" fill={isLightOn ? "#ffffff" : "#334155"} />
                {isLightOn && (
                  <>
                    <polygon points="260,10 295,10 265,80 230,80" fill="url(#grad-minimal-glow)" opacity="0.75" />
                    <polygon points="505,10 540,10 570,80 535,80" fill="url(#grad-minimal-glow)" opacity="0.75" />
                  </>
                )}
              </>
            )}

            {/* CHÙM SÁNG CHIẾU RỌI TỪ TRẦN XUỐNG SÀN KHI BẬT ĐÈN (Volumetric Downlight Beam) */}
            {isLightOn && (
              <polygon
                points="240,65 560,65 670,410 130,410"
                fill="url(#grad-light-cone)"
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
              fill={selectedWallId === "inox-guong-vang" ? "url(#grad-gold-back)" : "url(#grad-inox-back)"}
              stroke="#1e293b"
              strokeWidth="3"
            />
            <rect x="394" y="0" width="6" height="520" fill="#09090b" />
            {selectedWallId === "homelift-kinh" && (
              <rect x="60" y="80" width="280" height="360" fill="url(#grad-glass-reflection)" stroke="#0284c7" strokeWidth="2" rx="4" />
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
              fill={selectedWallId === "inox-guong-vang" ? "url(#grad-gold-back)" : "url(#grad-inox-back)"}
              stroke="#1e293b"
              strokeWidth="3"
            />
            <rect x="400" y="0" width="6" height="520" fill="#09090b" />
            {selectedWallId === "homelift-kinh" && (
              <rect x="460" y="80" width="280" height="360" fill="url(#grad-glass-reflection)" stroke="#0284c7" strokeWidth="2" rx="4" />
            )}
          </g>

          {/* Tia cảm biến an toàn Photocell khi cửa mở */}
          {isDoorsOpen && (
            <line x1="400" y1="20" x2="400" y2="500" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.75" />
          )}

          {/* 9. CÁC NÚT GHIM TƯƠNG TÁC (HOTSPOTS) */}
          {isDoorsOpen && (
            <>
              {/* Điểm 1: Trần */}
              <g onClick={() => setActiveTab("ceiling")} style={{ cursor: "pointer" }} title="Bấm đổi mẫu Trần">
                <circle cx="400" cy="55" r="14" fill="#facc15" stroke="#ffffff" strokeWidth="2" />
                <text x="400" y="60" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="900">1</text>
              </g>

              {/* Điểm 2: Vách */}
              <g onClick={() => setActiveTab("walls")} style={{ cursor: "pointer" }} title="Bấm đổi mẫu Vách">
                <circle cx="270" cy="210" r="14" fill="#facc15" stroke="#ffffff" strokeWidth="2" />
                <text x="270" y="215" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="900">2</text>
              </g>

              {/* Điểm 3: Tay vịn */}
              <g onClick={() => setActiveTab("handrail")} style={{ cursor: "pointer" }} title="Bấm đổi mẫu Tay vịn">
                <circle cx="560" cy="265" r="14" fill="#facc15" stroke="#ffffff" strokeWidth="2" />
                <text x="560" y="270" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="900">3</text>
              </g>

              {/* Điểm 4: Sàn đá */}
              <g onClick={() => setActiveTab("flooring")} style={{ cursor: "pointer" }} title="Bấm đổi mẫu Sàn đá">
                <circle cx="400" cy="450" r="14" fill="#facc15" stroke="#ffffff" strokeWidth="2" />
                <text x="400" y="455" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="900">4</text>
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

      {/* 3. BẢNG GỌI TẦNG THỰC TẾ (BẤM TẦNG NÀO TỰ ĐÓNG VÀ MỞ CỬA TẠI TẦNG ĐÓ) */}
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

      {/* 4. BỘ CHỌN VẬT LIỆU TƯƠNG TÁC (TABS & THẺ SWATCH) */}
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

        {/* Tab 1: Vách */}
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

        {/* Tab 2: Sàn */}
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

        {/* Tab 3: Trần */}
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
