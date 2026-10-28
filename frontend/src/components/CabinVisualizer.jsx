import { useState, useEffect } from "react";
import "./CabinVisualizer.css";

// =============================================================================
// DỮ LIỆU CẤU HÌNH VẬT LIỆU CABIN CHUẨN KIẾN TRÚC CAO CẤP
// =============================================================================

export const WALL_OPTIONS = [
  {
    id: "wood-walnut-mirror",
    code: "HAHONG-W01",
    name: "Gỗ Óc Chó & Gương Soi",
    spec: "Gỗ Walnut tự nhiên phối gương",
    badge: "Biệt thự 5★",
    syncValue: "inox-guong-vang"
  },
  {
    id: "inox-tieu-chuan",
    code: "HAHONG-W02",
    name: "Inox 304 Sọc Nhuyễn",
    spec: "SUS 304 chống xước satin",
    badge: "Tiêu chuẩn bền bỉ",
    syncValue: "inox-tieu-chuan"
  },
  {
    id: "inox-guong-vang",
    code: "HAHONG-W03",
    name: "Inox Gương Vàng PVD",
    spec: "Mạ PVD Champagne Gold 8K",
    badge: "Hoàng Gia PVD",
    syncValue: "inox-guong-vang"
  },
  {
    id: "inox-guong-bac",
    code: "HAHONG-W04",
    name: "Inox Gương Bạc 8K",
    spec: "Đánh bóng gương mở rộng góc nhìn",
    badge: "Gương 8K",
    syncValue: "inox-tieu-chuan"
  },
  {
    id: "wood-oak-scandi",
    code: "HAHONG-W05",
    name: "Gỗ Sồi Nẹp Chỉ Đen",
    spec: "Gỗ Oak sáng màu Scandinavian",
    badge: "Bắc Âu Tinh Tế",
    syncValue: "inox-tieu-chuan"
  },
  {
    id: "kinh-cuong-luc",
    code: "HAHONG-W06",
    name: "Kính Cường Lực Panorama",
    spec: "Kính an toàn 10mm siêu trong",
    badge: "Homelift Kính",
    syncValue: "homelift-kinh"
  }
];

export const FLOOR_OPTIONS = [
  {
    id: "floor-chevron-brass",
    code: "HAHONG-F01",
    name: "Đá Cẩm Thạch Nẹp Chỉ Đồng",
    spec: "Họa tiết xương cá Chevron sang trọng",
    badge: "Chỉ đồng nghệ thuật"
  },
  {
    id: "floor-wood-plank",
    code: "HAHONG-F02",
    name: "Sàn Gỗ Walnut Chống Trượt",
    spec: "Thanh gỗ tự nhiên màu nâu ấm",
    badge: "Gỗ tự nhiên"
  },
  {
    id: "floor-marquina-black",
    code: "HAHONG-F03",
    name: "Đá Đen Tia Chớp Nero Marquina",
    spec: "Cẩm thạch vân tia chớp trắng",
    badge: "Cẩm thạch Ý"
  },
  {
    id: "floor-terrazzo-sand",
    code: "HAHONG-F04",
    name: "Đá Terrazzo Hạt Cát Be",
    spec: "Đá mài thạch anh chống trơn trượt",
    badge: "Hiện đại tối giản"
  },
  {
    id: "floor-royal-cnc",
    code: "HAHONG-F05",
    name: "Đá Thảm CNC Hoàng Gia",
    spec: "Cắt CNC hoa văn tròn đối xứng",
    badge: "Tân cổ điển"
  }
];

export const CEILING_OPTIONS = [
  {
    id: "ceil-cove-warm",
    code: "HAHONG-C01",
    name: "Trần Hắt Khe LED Vàng Ấm (3000K)",
    spec: "Ánh sáng gián tiếp dịu mắt, chống chói",
    badge: "Vàng ấm 3000K"
  },
  {
    id: "ceil-coffered-linear",
    code: "HAHONG-C02",
    name: "Trần Inox Gương & Thanh LED (4000K)",
    spec: "Chia ô gương kết hợp dải LED âm",
    badge: "Trung tính 4000K"
  },
  {
    id: "ceil-spotlight-frame",
    code: "HAHONG-C03",
    name: "Trần Viền Đen & Spotlight (5000K)",
    spec: "Đèn rọi điểm sắc sảo chuẩn kiến trúc",
    badge: "Ánh sáng trắng"
  }
];

export const HANDRAIL_OPTIONS = [
  {
    id: "wood-brass",
    code: "HAHONG-R01",
    name: "Tay Vịn Gỗ Bọc Nẹp Kim Loại",
    spec: "Thân gỗ tròn phi 38 bọc đầu PVD",
    badge: "Gỗ & Kim loại"
  },
  {
    id: "flat-satin",
    code: "HAHONG-R02",
    name: "Tay Vịn Dẹp Inox 304 Satin",
    spec: "Bản dẹp 40x10mm công thái học",
    badge: "Inox satin"
  },
  {
    id: "round-pvd",
    code: "HAHONG-R03",
    name: "Tay Vịn Tròn Inox Vàng PVD",
    spec: "Phi 38mm mạ vàng Champagne bóng bẩy",
    badge: "Hoàng Gia PVD"
  }
];

export default function CabinVisualizer({
  elevatorType = "homelift-kinh",
  onChangeElevatorType,
  capacityKg = 450,
  stops = 4,
  doorType = "CO",
  onChangeDoorType,
  onApplyConfig,
  onRequestConsultation
}) {
  const [activeTab, setActiveTab] = useState("walls");

  const [selectedWallId, setSelectedWallId] = useState(
    elevatorType === "inox-guong-vang" ? "inox-guong-vang" :
    elevatorType === "inox-tieu-chuan" ? "inox-tieu-chuan" : "wood-walnut-mirror"
  );
  const [selectedFloorId, setSelectedFloorId] = useState("floor-chevron-brass");
  const [selectedCeilingId, setSelectedCeilingId] = useState("ceil-cove-warm");
  const [selectedHandrailId, setSelectedHandrailId] = useState("wood-brass");

  const [isDoorsOpen, setIsDoorsOpen] = useState(true);
  const [isLightOn, setIsLightOn] = useState(true);

  // Đồng bộ với loại thang từ ngoài
  useEffect(() => {
    if (elevatorType === "inox-guong-vang") {
      setSelectedWallId("inox-guong-vang");
    } else if (elevatorType === "inox-tieu-chuan") {
      setSelectedWallId("inox-tieu-chuan");
    } else if (elevatorType === "homelift-kinh") {
      setSelectedWallId("kinh-cuong-luc");
    }
  }, [elevatorType]);

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

  const handleSelectWall = (item) => {
    setSelectedWallId(item.id);
    if (onChangeElevatorType && item.syncValue) {
      onChangeElevatorType(item.syncValue);
    }
    notifyParent({ wallId: item.id });
  };

  const handleSelectFloor = (item) => {
    setSelectedFloorId(item.id);
    notifyParent({ floorId: item.id });
  };

  const handleSelectCeiling = (item) => {
    setSelectedCeilingId(item.id);
    notifyParent({ ceilingId: item.id });
  };

  const handleSelectHandrail = (item) => {
    setSelectedHandrailId(item.id);
    notifyParent({ handrailId: item.id });
  };

  const handleReset = () => {
    setSelectedWallId("wood-walnut-mirror");
    setSelectedFloorId("floor-chevron-brass");
    setSelectedCeilingId("ceil-cove-warm");
    setSelectedHandrailId("wood-brass");
    setIsDoorsOpen(true);
    setIsLightOn(true);
    if (onChangeElevatorType) {
      onChangeElevatorType("homelift-kinh");
    }
    notifyParent({
      wallId: "wood-walnut-mirror",
      floorId: "floor-chevron-brass",
      ceilingId: "ceil-cove-warm",
      handrailId: "wood-brass"
    });
  };

  const handleApplyClick = () => {
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
    }
  };

  const curWallObj = WALL_OPTIONS.find(w => w.id === selectedWallId) || WALL_OPTIONS[0];
  const curFloorObj = FLOOR_OPTIONS.find(f => f.id === selectedFloorId) || FLOOR_OPTIONS[0];
  const curCeilObj = CEILING_OPTIONS.find(c => c.id === selectedCeilingId) || CEILING_OPTIONS[0];
  const curRailObj = HANDRAIL_OPTIONS.find(h => h.id === selectedHandrailId) || HANDRAIL_OPTIONS[0];

  return (
    <div className="cabin-visualizer-container">
      {/* SVG Definitions ẩn để render texture */}
      <svg className="cabin-defs-container" aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
        <defs>
          {/* Inox Hairline */}
          <pattern id="pat-hairline-fine" width="60" height="60" patternUnits="userSpaceOnUse">
            <rect width="60" height="60" fill="#94a3b8" />
            <line x1="0" y1="2" x2="60" y2="2" stroke="#cbd5e1" strokeWidth="1" opacity="0.6" />
            <line x1="0" y1="5" x2="60" y2="5" stroke="#64748b" strokeWidth="0.8" opacity="0.4" />
            <line x1="0" y1="14" x2="60" y2="14" stroke="#475569" strokeWidth="0.9" opacity="0.5" />
            <line x1="0" y1="28" x2="60" y2="28" stroke="#64748b" strokeWidth="0.8" opacity="0.4" />
            <line x1="0" y1="44" x2="60" y2="44" stroke="#f1f5f9" strokeWidth="0.8" opacity="0.7" />
          </pattern>

          {/* Sàn Đá Chevron Chỉ Đồng */}
          <pattern id="pat-chevron-brass-inlay" width="100" height="50" patternUnits="userSpaceOnUse">
            <rect width="100" height="50" fill="#e2e8f0" />
            <line x1="50" y1="0" x2="50" y2="50" stroke="#ca8a04" strokeWidth="2" />
            <line x1="50" y1="10" x2="10" y2="45" stroke="#ca8a04" strokeWidth="1.8" />
            <line x1="50" y1="10" x2="90" y2="45" stroke="#ca8a04" strokeWidth="1.8" />
            <line x1="50" y1="35" x2="10" y2="70" stroke="#475569" strokeWidth="1.5" />
            <line x1="50" y1="35" x2="90" y2="70" stroke="#475569" strokeWidth="1.5" />
          </pattern>

          {/* Gỗ Walnut */}
          <pattern id="pat-wood-walnut-texture" width="80" height="120" patternUnits="userSpaceOnUse">
            <rect width="80" height="120" fill="#451a03" />
            <path d="M0 0 Q 20 60 0 120" stroke="#78350f" strokeWidth="2" fill="none" opacity="0.7" />
            <path d="M25 0 Q 35 70 25 120" stroke="#2e1001" strokeWidth="2.5" fill="none" opacity="0.6" />
            <path d="M50 0 Q 60 50 50 120" stroke="#92400e" strokeWidth="2" fill="none" opacity="0.5" />
            <path d="M75 0 Q 70 80 75 120" stroke="#78350f" strokeWidth="2.5" fill="none" opacity="0.7" />
          </pattern>

          {/* Đá Nero Marquina */}
          <pattern id="pat-marquina-black-texture" width="120" height="100" patternUnits="userSpaceOnUse">
            <rect width="120" height="100" fill="#09090b" />
            <path d="M5 15 L 28 32 L 65 55 L 115 88" stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.8" />
            <path d="M40 28 L 52 12 L 75 18" stroke="#ffffff" strokeWidth="0.8" fill="none" opacity="0.6" />
            <path d="M10 85 L 30 70 L 70 98" stroke="#f1f5f9" strokeWidth="1" fill="none" opacity="0.65" />
          </pattern>

          {/* Đá Terrazzo Cát Mịn */}
          <pattern id="pat-terrazzo-sand-texture" width="50" height="50" patternUnits="userSpaceOnUse">
            <rect width="50" height="50" fill="#f1f5f9" />
            <circle cx="8" cy="12" r="1.5" fill="#ca8a04" opacity="0.4" />
            <circle cx="38" cy="18" r="2" fill="#cbd5e1" opacity="0.7" />
            <circle cx="16" cy="34" r="1.8" fill="#94a3b8" opacity="0.5" />
          </pattern>

          {/* Gradient PVD Gold */}
          <linearGradient id="grad-pvd-champagne" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="25%" stopColor="#ca8a04" />
            <stop offset="50%" stopColor="#fef08a" />
            <stop offset="75%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>

          {/* Gradient Inox Gương 8K */}
          <linearGradient id="grad-mirror-silver-8k" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
        </defs>
      </svg>

      {/* 1. Header Toolbar Tinh Gọn */}
      <div className="cabin-viz-header">
        <div className="cabin-viz-title">
          <i className="bi bi-box text-warning fs-5"></i>
          <div>
            <span className="d-block fw-bold text-white" style={{ fontSize: "13.5px" }}>
              Phối Cảnh Cabin 2.5D
            </span>
            <small className="text-secondary" style={{ fontSize: "11px" }}>
              {capacityKg}kg • {stops} Điểm dừng
            </small>
          </div>
        </div>

        <div className="cabin-viz-actions">
          {/* Nút bật/tắt đèn */}
          <button
            type="button"
            className={`cabin-viz-btn-action ${isLightOn ? "active" : ""}`}
            onClick={() => setIsLightOn(!isLightOn)}
            title={isLightOn ? "Tắt đèn cabin" : "Bật đèn cabin"}
          >
            <i className={`bi ${isLightOn ? "bi-lightbulb-fill text-warning" : "bi-lightbulb"}`}></i>
            <span>{isLightOn ? "Đèn" : "Đèn Tắt"}</span>
          </button>

          {/* Nút đóng/mở cửa */}
          <button
            type="button"
            className={`cabin-viz-btn-action ${isDoorsOpen ? "active" : ""}`}
            onClick={() => setIsDoorsOpen(!isDoorsOpen)}
            title={isDoorsOpen ? "Đóng cửa cabin" : "Mở cửa cabin"}
          >
            <i className={`bi ${isDoorsOpen ? "bi-door-open-fill text-info" : "bi-door-closed-fill"}`}></i>
            <span>{isDoorsOpen ? "Mở" : "Đóng"}</span>
          </button>
        </div>
      </div>

      {/* 2. Sân Khấu 3D Cabin (Gọn gàng, sạch sẽ, không có nút ghim số che khuất) */}
      <div className="cabin-stage">
        {/* Khung bao sảnh tầng bên ngoài */}
        <div className="cabin-landing-surround">
          <div className="lobby-jamb jamb-top"></div>
          <div className="lobby-jamb jamb-left"></div>
          <div className="lobby-jamb jamb-right"></div>
        </div>

        {/* Khối hộp Cabin 3D */}
        <div className={`cabin-car-box door-mode-${doorType} ${isDoorsOpen ? "doors-open" : ""} ${!isLightOn ? "light-off" : ""}`}>
          
          {/* Trần cabin */}
          <div
            className={`cabin-ceiling ceil-type-${selectedCeilingId} ${isLightOn ? "light-on" : "light-off"}`}
            onClick={() => setActiveTab("ceiling")}
          >
            <div className="cabin-ceiling-frame">
              {selectedCeilingId === "ceil-cove-warm" && (
                <div className="cove-led-perimeter">
                  <div className="cove-inner-panel"></div>
                </div>
              )}
              {selectedCeilingId === "ceil-coffered-linear" && (
                <div className="coffered-mirror-grid">
                  <span className="grid-bar"></span>
                  <span className="grid-bar"></span>
                  <span className="grid-bar"></span>
                </div>
              )}
              {selectedCeilingId === "ceil-spotlight-frame" && (
                <div className="spotlight-frame-array">
                  <span className="spot-lens"></span>
                  <span className="spot-lens"></span>
                  <span className="spot-lens"></span>
                  <span className="spot-lens"></span>
                </div>
              )}
            </div>
          </div>

          {/* Ánh sáng chiếu rọi */}
          {isLightOn && (
            <div className={`cabin-ambient-light light-effect-${selectedCeilingId}`}></div>
          )}

          {/* Vách hông trái */}
          <div className={`cabin-wall-side wall-side-left wall-${selectedWallId}`}>
            <div className="side-wall-panel"></div>
            <div className="wall-kickplate kickplate-left"></div>
            <div className={`side-handrail handrail-${selectedHandrailId}`}></div>
          </div>

          {/* Vách hông phải */}
          <div className={`cabin-wall-side wall-side-right wall-${selectedWallId}`}>
            <div className="side-wall-panel"></div>
            <div className="wall-kickplate kickplate-right"></div>
            <div className={`side-handrail handrail-${selectedHandrailId}`}></div>

            {/* Bảng điều khiển COP nhỏ gọn */}
            <div className="cabin-cop-panel">
              <div className="cabin-cop-screen">
                <span className="cop-floor">1</span>
                <span className="cop-arrow">●</span>
              </div>
              <div className="cabin-cop-buttons">
                {[1, 2, 3, 4].slice(0, Math.min(stops, 4)).map((fNum) => (
                  <div key={fNum} className={`cop-dot ${fNum === 1 ? "active" : ""}`}>
                    <span>{fNum}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vách sau cabin */}
          <div
            className={`cabin-back-wall wall-${selectedWallId}`}
            onClick={() => setActiveTab("walls")}
          >
            {selectedWallId === "kinh-cuong-luc" && (
              <div className="cabin-scenery-backdrop">
                <div className="glass-reflection-glare"></div>
              </div>
            )}

            <div className="back-wall-layout">
              <div className="back-panel panel-sub-left"></div>
              <div className="back-panel panel-center-feature">
                {selectedWallId === "wood-walnut-mirror" && (
                  <div className="feature-mirror-glass">
                    <span className="mirror-bevel-edge"></span>
                  </div>
                )}
                {selectedWallId === "inox-guong-vang" && (
                  <div className="feature-gold-motif">
                    <span className="motif-border"></span>
                  </div>
                )}
              </div>
              <div className="back-panel panel-sub-right"></div>
            </div>

            {/* Tay vịn cabin */}
            <div
              className={`cabin-handrail handrail-${selectedHandrailId}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab("handrail");
              }}
            >
              <span className="handrail-bar"></span>
              <span className="handrail-bracket bracket-left"></span>
              <span className="handrail-bracket bracket-right"></span>
            </div>

            <div className="wall-kickplate kickplate-back"></div>
            {isLightOn && <div className="kickplate-cove-led-wash"></div>}
          </div>

          {/* Sàn đá/gỗ cabin */}
          <div
            className={`cabin-floor floor-${selectedFloorId}`}
            onClick={() => setActiveTab("flooring")}
          >
            <div className={`floor-surface-layer surface-${selectedFloorId}`}></div>
            {isLightOn && <div className={`floor-specular-glow glow-${selectedCeilingId}`}></div>}
          </div>

          <div className="cabin-door-sill-bar"></div>

          {/* Cửa tầng trượt đóng mở */}
          <div className={`cabin-door door-left door-wall-${selectedWallId}`}>
            <span className="door-panel-texture"></span>
            <span className="door-edge-trim"></span>
          </div>
          <div className={`cabin-door door-right door-wall-${selectedWallId}`}>
            <span className="door-panel-texture"></span>
            <span className="door-edge-trim"></span>
          </div>
        </div>
      </div>

      {/* 3. Dải Thông Tin Tóm Tắt Tinh Tế */}
      <div className="cabin-summary-ribbon">
        <div className="summary-specs">
          <i className="bi bi-gem text-warning me-1.5"></i>
          <span className="spec-text text-truncate" style={{ fontSize: "12px", color: "#e2e8f0" }}>
            {curWallObj.name} • {curFloorObj.name}
          </span>
        </div>
      </div>

      {/* 4. Bộ Chọn Vật Liệu Gọn Gàng (Tabs & Thẻ Mini Tinh Giản) */}
      <div className="cabin-cfg-controls">
        <div className="cabin-tabs-nav">
          <button
            type="button"
            className={`cabin-tab-item ${activeTab === "walls" ? "active" : ""}`}
            onClick={() => setActiveTab("walls")}
          >
            <i className="bi bi-palette2"></i>
            Vách ({WALL_OPTIONS.length})
          </button>
          <button
            type="button"
            className={`cabin-tab-item ${activeTab === "flooring" ? "active" : ""}`}
            onClick={() => setActiveTab("flooring")}
          >
            <i className="bi bi-grid-3x3"></i>
            Sàn ({FLOOR_OPTIONS.length})
          </button>
          <button
            type="button"
            className={`cabin-tab-item ${activeTab === "ceiling" ? "active" : ""}`}
            onClick={() => setActiveTab("ceiling")}
          >
            <i className="bi bi-brightness-high"></i>
            Trần ({CEILING_OPTIONS.length})
          </button>
          <button
            type="button"
            className={`cabin-tab-item ${activeTab === "handrail" ? "active" : ""}`}
            onClick={() => setActiveTab("handrail")}
          >
            <i className="bi bi-slash-circle"></i>
            Tay Vịn ({HANDRAIL_OPTIONS.length})
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
                  <div className={`swatch-preview-box swatch-wall-${item.id}`}>
                    <span className="swatch-code-tag">{item.badge}</span>
                    {isSelected && (
                      <div className="swatch-check-icon">
                        <i className="bi bi-check"></i>
                      </div>
                    )}
                  </div>
                  <div className="swatch-content">
                    <span className="swatch-name">{item.name}</span>
                    <span className="swatch-spec">{item.spec}</span>
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
                  <div className={`swatch-preview-box swatch-floor-${item.id}`}>
                    <span className="swatch-code-tag">{item.badge}</span>
                    {isSelected && (
                      <div className="swatch-check-icon">
                        <i className="bi bi-check"></i>
                      </div>
                    )}
                  </div>
                  <div className="swatch-content">
                    <span className="swatch-name">{item.name}</span>
                    <span className="swatch-spec">{item.spec}</span>
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
                  <div className={`swatch-preview-box swatch-ceil-${item.id}`}>
                    <span className="swatch-code-tag">{item.badge}</span>
                    {isSelected && (
                      <div className="swatch-check-icon">
                        <i className="bi bi-check"></i>
                      </div>
                    )}
                  </div>
                  <div className="swatch-content">
                    <span className="swatch-name">{item.name}</span>
                    <span className="swatch-spec">{item.spec}</span>
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
                  <div className={`swatch-preview-box swatch-rail-${item.id}`}>
                    <span className="swatch-code-tag">{item.badge}</span>
                    {isSelected && (
                      <div className="swatch-check-icon">
                        <i className="bi bi-check"></i>
                      </div>
                    )}
                  </div>
                  <div className="swatch-content">
                    <span className="swatch-name">{item.name}</span>
                    <span className="swatch-spec">{item.spec}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Footer & Nút Áp Dụng */}
      <div className="cabin-viz-footer">
        <button
          type="button"
          className="btn-viz-reset"
          onClick={handleReset}
          title="Đặt lại cấu hình mặc định"
        >
          <i className="bi bi-arrow-counterclockwise me-1"></i>
          Đặt lại
        </button>
        <button
          type="button"
          className="btn-viz-apply"
          onClick={handleApplyClick}
        >
          <span>Áp dụng vào cấu hình</span>
          <i className="bi bi-check2 ms-1 fs-6"></i>
        </button>
      </div>
    </div>
  );
}
