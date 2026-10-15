import { useState, useEffect } from "react";
import "./CabinVisualizer.css";

// Wall options
export const WALL_OPTIONS = [
  {
    id: "homelift-kinh",
    name: "Vách Kính Panorama",
    desc: "Kính an toàn Low-E 10mm, khung định hình xám titan",
    badge: "Sang trọng",
    thumbnailClass: "wall-mat-homelift-kinh",
    syncValue: "homelift-kinh"
  },
  {
    id: "inox-guong-vang",
    name: "Inox Gương Vàng PVD",
    desc: "Mạ PVD vàng Champagne, khắc laser hoa văn tân cổ điển",
    badge: "Hoàng Gia",
    thumbnailClass: "wall-mat-inox-guong-vang",
    syncValue: "inox-guong-vang"
  },
  {
    id: "inox-tieu-chuan",
    name: "Inox 304 Sọc Nhuyễn",
    desc: "Vân xước hairline mịn màng chống vân tay, bền bỉ",
    badge: "Tiêu chuẩn",
    thumbnailClass: "wall-mat-inox-tieu-chuan",
    syncValue: "inox-tieu-chuan"
  },
  {
    id: "inox-guong-bac",
    name: "Inox Gương Bạc Phối Hairline",
    desc: "Gương soi trung tâm mở rộng không gian thị giác",
    badge: "Mở rộng góc nhìn",
    thumbnailClass: "wall-mat-inox-guong-bac",
    syncValue: "inox-tieu-chuan"
  }
];

// Floor options
export const FLOOR_OPTIONS = [
  {
    id: "royal-carpet",
    name: "Đá Thảm CNC Hoàng Gia",
    desc: "Hoa văn cẩm thạch đối xứng tinh xảo phong cách Châu Âu",
    thumbnailClass: "floor-mat-royal-carpet"
  },
  {
    id: "black-galaxy",
    name: "Đá Granite Kim Sa Đen",
    desc: "Nền đá đen tuyền điểm xuyết ánh kim sa vàng lấp lánh",
    thumbnailClass: "floor-mat-black-galaxy"
  },
  {
    id: "white-carrara",
    name: "Đá Marble Trắng Ý",
    desc: "Đá trắng ngọc vân mây xám khói hiện đại, thanh lịch",
    thumbnailClass: "floor-mat-white-carrara"
  },
  {
    id: "luxury-wood",
    name: "Sàn Gỗ Chống Nước",
    desc: "Vân gỗ óc chó tự nhiên ấm cúng cho biệt thự gia đình",
    thumbnailClass: "floor-mat-luxury-wood"
  }
];

// Ceiling options
export const CEILING_OPTIONS = [
  {
    id: "modern-dome",
    name: "Trần Vòm Âm LED",
    desc: "Chiếu sáng gián tiếp dịu mắt, chống chói thị giác",
    thumbnailClass: "ceiling-modern-dome"
  },
  {
    id: "laser-diamond",
    name: "Trần Laser Kim Cương",
    desc: "Tấm inox gương cắt CNC hoa văn hình học hiện đại",
    thumbnailClass: "ceiling-laser-diamond"
  },
  {
    id: "linear-minimal",
    name: "Trần Linear Tối Giản",
    desc: "Hệ thanh LED đối xứng chuẩn phong cách Scandinavian",
    thumbnailClass: "ceiling-linear-minimal"
  }
];

// Handrail options
export const HANDRAIL_OPTIONS = [
  {
    id: "round-gold",
    name: "Tay Vịn Tròn Mạ Vàng",
    desc: "Inox 304 phi 38 mạ PVD vàng đồng bóng bẩy",
    thumbnailClass: "handrail-round-gold"
  },
  {
    id: "flat-silver",
    name: "Tay Vịn Dẹp Inox Bạc",
    desc: "Thanh dẹp bản 40mm xước mờ hiện đại",
    thumbnailClass: "handrail-flat-silver"
  },
  {
    id: "wood-duo",
    name: "Tay Vịn Gỗ Phối Kim Loại",
    desc: "Thân gỗ óc chó cao cấp đầu bịt kim loại sang trọng",
    thumbnailClass: "handrail-wood-duo"
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
  // Navigation tab: 'walls' | 'flooring' | 'ceiling' | 'handrail'
  const [activeTab, setActiveTab] = useState("walls");

  // Selected sub-components
  const [selectedWall, setSelectedWall] = useState(elevatorType);
  const [selectedFloor, setSelectedFloor] = useState("royal-carpet");
  const [selectedCeiling, setSelectedCeiling] = useState("modern-dome");
  const [selectedHandrail, setSelectedHandrail] = useState("round-gold");

  // Interaction controls
  const [isDoorsOpen, setIsDoorsOpen] = useState(true);
  const [isLightOn, setIsLightOn] = useState(true);
  const [viewMode, setViewMode] = useState("interior"); // 'interior' | 'landing'
  const [noticeMessage, setNoticeMessage] = useState("");

  // Sync when parent elevatorType changes (from Step 3)
  useEffect(() => {
    if (elevatorType) {
      setSelectedWall(elevatorType);
      if (elevatorType === "inox-guong-vang") {
        setSelectedFloor("royal-carpet");
        setSelectedHandrail("round-gold");
      } else if (elevatorType === "homelift-kinh") {
        setSelectedFloor("black-galaxy");
        setSelectedHandrail("flat-silver");
      } else {
        setSelectedFloor("white-carrara");
        setSelectedHandrail("flat-silver");
      }
    }
  }, [elevatorType]);

  // Notify parent of cabin config changes if provided
  useEffect(() => {
    if (onApplyConfig) {
      const wallObj = WALL_OPTIONS.find(w => w.id === selectedWall) || WALL_OPTIONS[0];
      const floorObj = FLOOR_OPTIONS.find(f => f.id === selectedFloor) || FLOOR_OPTIONS[0];
      const ceilingObj = CEILING_OPTIONS.find(c => c.id === selectedCeiling) || CEILING_OPTIONS[0];
      const handrailObj = HANDRAIL_OPTIONS.find(h => h.id === selectedHandrail) || HANDRAIL_OPTIONS[0];
      
      onApplyConfig({
        wall: wallObj.name,
        floor: floorObj.name,
        ceiling: ceilingObj.name,
        handrail: handrailObj.name,
        isCustomized: true
      });
    }
  }, [selectedWall, selectedFloor, selectedCeiling, selectedHandrail, onApplyConfig]);

  const handleWallSelect = (wall) => {
    setSelectedWall(wall.id);
    if (onChangeElevatorType && wall.syncValue) {
      onChangeElevatorType(wall.syncValue);
    }
    showToast(`Đã áp dụng: ${wall.name}`);
  };

  const handleFloorSelect = (floor) => {
    setSelectedFloor(floor.id);
    showToast(`Đã đổi sàn: ${floor.name}`);
  };

  const handleCeilingSelect = (ceiling) => {
    setSelectedCeiling(ceiling.id);
    showToast(`Đã đổi trần: ${ceiling.name}`);
  };

  const handleHandrailSelect = (handrail) => {
    setSelectedHandrail(handrail.id);
    showToast(`Đã đổi tay vịn: ${handrail.name}`);
  };

  const showToast = (msg) => {
    setNoticeMessage(msg);
    const timer = setTimeout(() => setNoticeMessage(""), 2200);
    return () => clearTimeout(timer);
  };

  const handleReset = () => {
    setSelectedWall("homelift-kinh");
    setSelectedFloor("black-galaxy");
    setSelectedCeiling("modern-dome");
    setSelectedHandrail("flat-silver");
    setIsDoorsOpen(true);
    setIsLightOn(true);
    setViewMode("interior");
    if (onChangeElevatorType) {
      onChangeElevatorType("homelift-kinh");
    }
    showToast("Đã khôi phục cấu hình tiêu chuẩn");
  };

  const handleConsultClick = () => {
    if (onRequestConsultation) {
      onRequestConsultation({
        wall: WALL_OPTIONS.find(w => w.id === selectedWall)?.name || "",
        floor: FLOOR_OPTIONS.find(f => f.id === selectedFloor)?.name || "",
        ceiling: CEILING_OPTIONS.find(c => c.id === selectedCeiling)?.name || "",
        handrail: HANDRAIL_OPTIONS.find(h => h.id === selectedHandrail)?.name || "",
      });
    } else {
      const quoteForm = document.querySelector(".quote-form-card");
      if (quoteForm) {
        quoteForm.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Find human readable names
  const currentWallName = WALL_OPTIONS.find(w => w.id === selectedWall)?.name || "Vách Kính Panorama";
  const currentFloorName = FLOOR_OPTIONS.find(f => f.id === selectedFloor)?.name || "Đá Kim Sa Đen";
  const currentCeilingName = CEILING_OPTIONS.find(c => c.id === selectedCeiling)?.name || "Trần Vòm Âm LED";

  return (
    <div className="premium-cabin-configurator">
      {/* 1. Header with title & interactive utilities */}
      <div className="configurator-header">
        <div className="configurator-title-wrap">
          <span className="configurator-eyebrow">
            <i className="bi bi-gem"></i> BESPOKE CABIN CONFIGURATOR
          </span>
          <h3 className="configurator-title">Thiết kế & Xem trước Cabin Thang Máy</h3>
        </div>

        <div className="configurator-quick-actions">
          {/* View angle toggle */}
          <button
            type="button"
            className={`cfg-tool-btn ${viewMode === "interior" ? "active" : ""}`}
            onClick={() => setViewMode(viewMode === "interior" ? "landing" : "interior")}
            title="Đổi góc nhìn phối cảnh"
          >
            <i className="bi bi-camera-video"></i>
            <span>{viewMode === "interior" ? "Nội Thất" : "Sảnh Tầng"}</span>
          </button>

          {/* Light toggle */}
          <button
            type="button"
            className={`cfg-tool-btn ${isLightOn ? "active" : ""}`}
            onClick={() => setIsLightOn(!isLightOn)}
            title={isLightOn ? "Tắt đèn cabin" : "Bật đèn cabin"}
          >
            <i className={`bi ${isLightOn ? "bi-lightbulb-fill text-warning" : "bi-lightbulb"}`}></i>
            <span>{isLightOn ? "Bật Đèn" : "Tắt Đèn"}</span>
          </button>

          {/* Doors toggle */}
          <button
            type="button"
            className={`cfg-tool-btn ${isDoorsOpen ? "active" : ""}`}
            onClick={() => {
              setIsDoorsOpen(!isDoorsOpen);
              showToast(!isDoorsOpen ? "Cửa đang mở..." : "Cửa đang đóng...");
            }}
            title={isDoorsOpen ? "Đóng cửa" : "Mở cửa"}
          >
            <i className={`bi ${isDoorsOpen ? "bi-door-open" : "bi-door-closed"}`}></i>
            <span>{isDoorsOpen ? "Mở Cửa" : "Đóng Cửa"}</span>
          </button>
        </div>
      </div>

      {/* 2. 3D Architectural Viewport Stage */}
      <div className="cabin-viewport-stage">
        {/* Hallway surround frame */}
        <div className="cabin-hallway-frame"></div>

        {/* Status indicator display */}
        <div className="cabin-status-bar">
          <span className="status-floor">{stops}F</span>
          <span className="status-dir">▲</span>
          <span className="status-meta">{capacityKg}kg • {Math.round(capacityKg / 75)} người</span>
        </div>

        {/* Toast alert on change */}
        {noticeMessage && (
          <div
            style={{
              position: "absolute",
              top: "70px",
              zIndex: 30,
              background: "rgba(15, 23, 42, 0.95)",
              color: "#38bdf8",
              padding: "5px 14px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "600",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              boxShadow: "0 6px 16px rgba(0,0,0,0.6)",
              transition: "all 0.3s ease"
            }}
          >
            <i className="bi bi-check2-circle me-1 text-success"></i>
            {noticeMessage}
          </div>
        )}

        {/* 3D Box Container */}
        <div className={`cabin-3d-box view-${viewMode} ${isDoorsOpen ? "doors-open" : ""}`}>
          {/* Ceiling with Fixture */}
          <div className={`cabin-3d-ceiling ceiling-${selectedCeiling} ${isLightOn ? "light-on" : "light-off"}`}>
            <div className="ceiling-fixture"></div>
          </div>

          {/* Downward light cone */}
          {isLightOn && <div className="cabin-light-cone"></div>}

          {/* Back Wall Material */}
          <div className={`cabin-3d-backwall wall-mat-${selectedWall}`}>
            {/* Side wall shading panels for depth */}
            <div className="cabin-sidewall-left"></div>
            <div className="cabin-sidewall-right"></div>

            {/* Handrail */}
            <div className={`cabin-3d-handrail handrail-${selectedHandrail}`}></div>

            {/* Car Operating Panel (COP) */}
            <div className="cabin-cop-column">
              <div className="cop-mini-display">
                <span>{stops}</span>
              </div>
              <div className="cop-buttons-stack">
                <div className="cop-btn-dot lit"></div>
                <div className="cop-btn-dot"></div>
                <div className="cop-btn-dot"></div>
                <div className="cop-btn-dot"></div>
              </div>
            </div>
          </div>

          {/* Flooring */}
          <div className={`cabin-3d-floor floor-mat-${selectedFloor}`}></div>

          {/* Sliding Doors */}
          <div className="cabin-3d-door door-left"></div>
          <div className="cabin-3d-door door-right"></div>

          {/* Safety Beam indicator when closed */}
          <div className="cabin-door-safety-beam"></div>
        </div>
      </div>

      {/* 3. Swatches & Material Selector Area */}
      <div className="configurator-selector-tabs">
        {/* Navigation Tabs */}
        <div className="cfg-nav-tabs">
          <button
            type="button"
            className={`cfg-tab-item ${activeTab === "walls" ? "active" : ""}`}
            onClick={() => setActiveTab("walls")}
          >
            <i className="bi bi-palette2"></i>
            Vách Cabin ({WALL_OPTIONS.length})
          </button>
          <button
            type="button"
            className={`cfg-tab-item ${activeTab === "flooring" ? "active" : ""}`}
            onClick={() => setActiveTab("flooring")}
          >
            <i className="bi bi-grid-3x3"></i>
            Sàn Đá ({FLOOR_OPTIONS.length})
          </button>
          <button
            type="button"
            className={`cfg-tab-item ${activeTab === "ceiling" ? "active" : ""}`}
            onClick={() => setActiveTab("ceiling")}
          >
            <i className="bi bi-brightness-high"></i>
            Trần & Đèn ({CEILING_OPTIONS.length})
          </button>
          <button
            type="button"
            className={`cfg-tab-item ${activeTab === "handrail" ? "active" : ""}`}
            onClick={() => setActiveTab("handrail")}
          >
            <i className="bi bi-slash-circle"></i>
            Tay Vịn ({HANDRAIL_OPTIONS.length})
          </button>
        </div>

        {/* Tab 1: Walls Grid */}
        {activeTab === "walls" && (
          <div className="swatches-grid">
            {WALL_OPTIONS.map((wall) => {
              const isSelected = selectedWall === wall.id;
              return (
                <div
                  key={wall.id}
                  className={`swatch-card ${isSelected ? "selected" : ""}`}
                  onClick={() => handleWallSelect(wall)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={`swatch-thumbnail ${wall.thumbnailClass}`}></div>
                  <div className="swatch-info">
                    <span className="swatch-name">{wall.name}</span>
                    <span className="swatch-desc">{wall.desc}</span>
                  </div>
                  {isSelected && (
                    <div className="swatch-check">
                      <i className="bi bi-check-lg"></i>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Flooring Grid */}
        {activeTab === "flooring" && (
          <div className="swatches-grid">
            {FLOOR_OPTIONS.map((floor) => {
              const isSelected = selectedFloor === floor.id;
              return (
                <div
                  key={floor.id}
                  className={`swatch-card ${isSelected ? "selected" : ""}`}
                  onClick={() => handleFloorSelect(floor)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={`swatch-thumbnail ${floor.thumbnailClass}`}></div>
                  <div className="swatch-info">
                    <span className="swatch-name">{floor.name}</span>
                    <span className="swatch-desc">{floor.desc}</span>
                  </div>
                  {isSelected && (
                    <div className="swatch-check">
                      <i className="bi bi-check-lg"></i>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Ceiling Grid */}
        {activeTab === "ceiling" && (
          <div className="swatches-grid">
            {CEILING_OPTIONS.map((ceiling) => {
              const isSelected = selectedCeiling === ceiling.id;
              return (
                <div
                  key={ceiling.id}
                  className={`swatch-card ${isSelected ? "selected" : ""}`}
                  onClick={() => handleCeilingSelect(ceiling)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={`swatch-thumbnail ${ceiling.thumbnailClass}`}></div>
                  <div className="swatch-info">
                    <span className="swatch-name">{ceiling.name}</span>
                    <span className="swatch-desc">{ceiling.desc}</span>
                  </div>
                  {isSelected && (
                    <div className="swatch-check">
                      <i className="bi bi-check-lg"></i>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 4: Handrail Grid */}
        {activeTab === "handrail" && (
          <div className="swatches-grid">
            {HANDRAIL_OPTIONS.map((handrail) => {
              const isSelected = selectedHandrail === handrail.id;
              return (
                <div
                  key={handrail.id}
                  className={`swatch-card ${isSelected ? "selected" : ""}`}
                  onClick={() => handleHandrailSelect(handrail)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={`swatch-thumbnail ${handrail.thumbnailClass}`}></div>
                  <div className="swatch-info">
                    <span className="swatch-name">{handrail.name}</span>
                    <span className="swatch-desc">{handrail.desc}</span>
                  </div>
                  {isSelected && (
                    <div className="swatch-check">
                      <i className="bi bi-check-lg"></i>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Configuration Summary & Action Footer */}
      <div className="configurator-footer">
        <div className="cfg-summary-badges">
          <span className="cfg-badge-pill">
            Vách: <strong>{currentWallName}</strong>
          </span>
          <span className="cfg-badge-pill">
            Sàn: <strong>{currentFloorName}</strong>
          </span>
          <span className="cfg-badge-pill">
            Trần: <strong>{currentCeilingName}</strong>
          </span>
          <span className="cfg-badge-pill">
            Cửa: <strong>{doorType === "CO" ? "Mở tim 2 cánh" : "Mở lùa 2 cánh"}</strong>
          </span>
        </div>

        <div className="cfg-action-buttons">
          <button
            type="button"
            className="cfg-btn-reset"
            onClick={handleReset}
            title="Khôi phục cấu hình tiêu chuẩn"
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i>
            Đặt lại
          </button>
          <button
            type="button"
            className="cfg-btn-apply"
            onClick={handleConsultClick}
            title="Đưa cấu hình này vào bảng dự toán & yêu cầu tư vấn"
          >
            <span>Tư vấn cấu hình này</span>
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
