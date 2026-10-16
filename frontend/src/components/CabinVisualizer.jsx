import { useState, useEffect, useRef } from "react";
import "./CabinVisualizer.css";

// 1. VÁCH CABIN (5 TÙY CHỌN - BỔ SUNG KÍNH CƯỜNG LỰC)
export const WALL_OPTIONS = [
  {
    id: "kinh-cuong-luc",
    name: "Kính Cường Lực Trong Suốt Panorama",
    desc: "Kính an toàn 10mm siêu trong, ngắm cảnh 4 mặt, lấy sáng tự nhiên tối đa",
    badge: "Bán chạy nhất",
    syncValue: "homelift-kinh",
    colorPreview: "linear-gradient(135deg, #0284c7 0%, #38bdf8 50%, #bae6fd 100%)"
  },
  {
    id: "kinh-mau-tra",
    name: "Kính Cường Lực Màu Trà Hoàng Gia",
    desc: "Kính cường lực màu trà Bronze luxury, chống chói, riêng tư và quý phái",
    badge: "Biệt thự cao cấp",
    syncValue: "homelift-kinh",
    colorPreview: "linear-gradient(135deg, #78350f 0%, #b45309 50%, #d97706 100%)"
  },
  {
    id: "inox-guong-vang",
    name: "Inox Gương Vàng PVD Hoàng Gia",
    desc: "Mạ titan PVD vàng Champagne bóng loáng, hoa văn chìm sang trọng",
    badge: "Sang trọng đẳng cấp",
    syncValue: "inox-guong-vang",
    colorPreview: "linear-gradient(135deg, #78350f 0%, #facc15 50%, #ca8a04 100%)"
  },
  {
    id: "inox-tieu-chuan",
    name: "Inox 304 Sọc Nhuyễn Hairline",
    desc: "Vân xước satin chống bám vân tay, bền bỉ cơ học vĩnh cửu theo thời gian",
    badge: "Bền bỉ kinh tế",
    syncValue: "inox-tieu-chuan",
    colorPreview: "linear-gradient(135deg, #475569 0%, #cbd5e1 50%, #94a3b8 100%)"
  },
  {
    id: "wood-luxury",
    name: "Gỗ Tự Nhiên & Inox Gương",
    desc: "Ốp gỗ óc chó Walnut tự nhiên phối gương soi trung tâm tân cổ điển",
    badge: "Tân cổ điển",
    syncValue: "inox-guong-vang",
    colorPreview: "linear-gradient(135deg, #451a03 0%, #92400e 50%, #d4af37 100%)"
  }
];

// 2. SÀN ĐÁ CABIN (3 TÙY CHỌN CHÂN THỰC)
export const FLOOR_OPTIONS = [
  {
    id: "floor-royal",
    name: "Đá Thảm CNC Hoàng Gia",
    desc: "Cẩm thạch đen Nero Marquina cắt hoa văn Mandala tròn đối xứng vàng đen",
    badge: "Cao cấp CNC",
    colorPreview: "radial-gradient(circle, #facc15 15%, #ca8a04 35%, #1e1b18 65%, #0b0f19 90%)"
  },
  {
    id: "floor-galaxy",
    name: "Đá Granite Kim Sa Đen",
    desc: "Nền đá đen tuyền huyền bí ánh kim sa vàng & bạc lấp lánh chống trầy xước",
    badge: "Bền màu vĩnh cửu",
    colorPreview: "radial-gradient(circle, #fde047 1.5px, transparent 1.5px), #09090b"
  },
  {
    id: "floor-carrara",
    name: "Đá Marble Trắng Ý Carrara",
    desc: "Trắng ngọc vân mây xám Calacatta thanh lịch, mở rộng không gian cabin",
    badge: "Thanh lịch Ý",
    colorPreview: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)"
  }
];

// 3. TRẦN ĐÈN LED (3 KIỂU VỚI ÁNH SÁNG KHÁC BIỆT HOÀN TOÀN)
export const CEILING_OPTIONS = [
  {
    id: "ceil-dome",
    name: "Trần Vòm Âm LED Gián Tiếp",
    desc: "Vòm trần elip hắt ánh sáng vàng ấm 3000K Champagne dịu mắt, chống chói thị giác",
    badge: "Ánh sáng vàng 3000K",
    lightType: "warm-gold",
    colorPreview: "radial-gradient(ellipse at center, #fef08a 20%, #eab308 55%, #1e293b 85%)"
  },
  {
    id: "ceil-diamond",
    name: "Trần Cắt Laser Kim Cương",
    desc: "Hoa văn kim cương tán xạ tia sáng đa chiều 4000K lấp lánh như pha lê",
    badge: "Tán xạ kim cương",
    lightType: "sparkle-diamond",
    colorPreview: "linear-gradient(45deg, #1e293b 25%, #475569 50%, #facc15 75%)"
  },
  {
    id: "ceil-minimal",
    name: "Trần Linear Scandinavian",
    desc: "2 dải thanh LED song song ánh sáng trắng 6000K hiện đại chuẩn Bắc Âu",
    badge: "Ánh sáng trắng 6000K",
    lightType: "cool-linear",
    colorPreview: "repeating-linear-gradient(90deg, #38bdf8 0 3px, #0f172a 3px 20px)"
  }
];

// 4. TAY VỊN CABIN (3 TÙY CHỌN)
export const HANDRAIL_OPTIONS = [
  {
    id: "rail-gold",
    name: "Tay Vịn Tròn Inox Mạ Vàng PVD",
    desc: "Inox 304 phi 38 mạ PVD vàng Champagne đồng bộ vách gương sang trọng",
    badge: "Hoàng Gia PVD",
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
  // Tabs: 'walls' (1) | 'flooring' (2) | 'ceiling' (3) | 'handrail' (4)
  const [activeTab, setActiveTab] = useState("walls");

  // State các tùy chọn vật liệu
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

  // Danh sách tầng (1 .. stops)
  const totalStops = Math.min(Math.max(Number(stops) || 4, 2), 10);
  const floorList = Array.from({ length: totalStops }, (_, i) => i + 1);

  useEffect(() => {
    if (currentFloor > totalStops) {
      setCurrentFloor(totalStops);
      setTargetFloor(totalStops);
    }
  }, [totalStops, currentFloor]);

  // Đồng bộ với Bước 3 bên ngoài
  useEffect(() => {
    if (elevatorType === "inox-guong-vang") {
      setSelectedWallId("inox-guong-vang");
    } else if (elevatorType === "inox-tieu-chuan") {
      setSelectedWallId("inox-tieu-chuan");
    } else if (elevatorType === "homelift-kinh") {
      setSelectedWallId("kinh-cuong-luc");
    }
  }, [elevatorType]);

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
    triggerToast(`Đã bấm Tầng ${target} • Cửa đang tự động đóng lại...`);

    // Bước 1: Tự động ĐÓNG CỬA
    setIsDoorsOpen(false);

    // Bước 2: Cửa đóng kín sau 850ms -> Bắt đầu chạy thang
    setTimeout(() => {
      setElevatorStatus("moving");
      const stepsToTravel = Math.abs(target - currentFloor);
      let stepCount = 0;
      let activeFloor = currentFloor;

      tripIntervalRef.current = setInterval(() => {
        stepCount++;
        activeFloor = direction === "up" ? activeFloor + 1 : activeFloor - 1;
        setCurrentFloor(activeFloor);

        if (activeFloor === target || stepCount >= stepsToTravel) {
          clearInterval(tripIntervalRef.current);
          tripIntervalRef.current = null;

          // Bước 3: Chuông Ding & Tự động MỞ CỬA tại tầng đó
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
      }, 750);
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
    triggerToast(next ? "Đèn cabin bật sáng" : "Đèn cabin tắt • Chế độ ban đêm");
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
              Mô hình 3D chuẩn kiến trúc • Tự động chạy tầng
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

      {/* 2. Sân khấu 3D Perspective Box (Đẹp, gọn gàng, đúng mô hình gốc lúc đầu) */}
      <div className="cabin-stage">
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

        {/* Bao cảnh sảnh tầng bên ngoài */}
        <div className="cabin-landing-surround"></div>

        {/* Khối hộp 3D Cabin (Elevator Car 3D Box) */}
        <div className={`cabin-car-box ${isDoorsOpen ? "doors-open" : ""} ${!isLightOn ? "light-off" : ""}`}>
          
          {/* TRẦN CABIN & ĐÈN CHIẾU SÁNG (Kiểu đèn 3: Ứng với Tab 3) */}
          <div
            className={`cabin-ceiling ceil-type-${selectedCeilingId} ${isLightOn ? "light-on" : "light-off"}`}
            onClick={() => setActiveTab("ceiling")}
            title="Bấm để chọn mẫu Trần Đèn LED (Số 3)"
          >
            <div className="cabin-ceiling-lamp">
              {/* Điểm ghim Số 3: Trần LED */}
              {isDoorsOpen && (
                <div className="cabin-hotspot-pin pin-ceiling" title="Ghim số 3: Trần LED">
                  3
                </div>
              )}
            </div>
          </div>

          {/* CHÙM SÁNG CHIẾU RỌI TỪNG LOẠI ĐÈN (Volumetric Downlight Cones) */}
          {isLightOn && (
            <div className={`cabin-ambient-light light-effect-${selectedCeilingId}`}></div>
          )}

          {/* VÁCH CABIN (Kiểu vách 1: Ứng với Tab 1) */}
          <div
            className={`cabin-back-wall wall-${selectedWallId}`}
            onClick={() => setActiveTab("walls")}
            title="Bấm để chọn mẫu Vách Cabin (Số 1)"
          >
            {/* Cảnh quan bên ngoài di chuyển khi đi thang kính Homelift */}
            {(selectedWallId === "kinh-cuong-luc" || selectedWallId === "kinh-mau-tra") && (
              <div
                className="cabin-scenery-backdrop"
                style={{ transform: `translateY(${(currentFloor - 1) * -18}px)` }}
              ></div>
            )}

            {/* Điểm ghim Số 1: Vách Cabin */}
            {isDoorsOpen && (
              <div className="cabin-hotspot-pin pin-wall" title="Ghim số 1: Vách Cabin">
                1
              </div>
            )}

            {/* TAY VỊN TRONG CABIN (Kiểu tay vịn 4: Ứng với Tab 4) */}
            <div
              className={`cabin-handrail rail-${selectedHandrailId}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab("handrail");
              }}
              title="Bấm để chọn mẫu Tay Vịn (Số 4)"
            >
              {/* Điểm ghim Số 4: Tay Vịn */}
              {isDoorsOpen && (
                <div className="cabin-hotspot-pin pin-handrail" title="Ghim số 4: Tay Vịn">
                  4
                </div>
              )}
            </div>

            {/* BẢNG ĐIỀU KHIỂN CABIN (COP PANEL) */}
            <div className="cabin-cop-panel">
              <div className="cabin-cop-screen">
                <span className="cop-floor">{currentFloor}</span>
                <span className="cop-arrow">{moveDirection === "up" ? "▲" : moveDirection === "down" ? "▼" : ""}</span>
              </div>
              <div className="cabin-cop-buttons">
                {floorList.slice(0, 4).map((fNum) => (
                  <div
                    key={fNum}
                    className={`cop-dot ${currentFloor === fNum ? "active" : ""} ${targetFloor === fNum && elevatorStatus !== "idle" ? "calling" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCallFloor(fNum);
                    }}
                    title={`Đi Tầng ${fNum}`}
                  >
                    <span>{fNum}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SÀN ĐÁ CABIN (Kiểu sàn 2: Ứng với Tab 2) */}
          <div
            className={`cabin-floor floor-${selectedFloorId}`}
            onClick={() => setActiveTab("flooring")}
            title="Bấm để chọn mẫu Sàn Đá (Số 2)"
          >
            {/* Vệt phản chiếu ánh đèn rực rỡ trên mặt sàn đá bóng */}
            {isLightOn && (
              <div className={`floor-specular-glow glow-${selectedCeilingId}`}></div>
            )}

            {/* Điểm ghim Số 2: Sàn Đá */}
            {isDoorsOpen && (
              <div className="cabin-hotspot-pin pin-floor" title="Ghim số 2: Sàn Đá">
                2
              </div>
            )}
          </div>

          {/* CỬA TẦNG TỰ ĐỘNG SLIDING DOORS (TRƯỢT MỞ/ĐÓNG THẬT) */}
          <div className={`cabin-door door-left door-wall-${selectedWallId}`}></div>
          <div className={`cabin-door door-right door-wall-${selectedWallId}`}></div>

          {/* Tia cảm biến an toàn Photocell */}
          <div className="cabin-door-gap-indicator"></div>
        </div>

        {/* Thanh trạng thái dưới sàn */}
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

      {/* 4. BỘ CHỌN VẬT LIỆU (TABS & THẺ SWATCH - ĐỒNG BỘ 100% SỐ THỨ TỰ 1-4) */}
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

      {/* 5. Footer & Đồng bộ Dự toán */}
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
