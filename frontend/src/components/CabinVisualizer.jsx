import { useState, useEffect } from "react";
import "./CabinVisualizer.css";

export default function CabinVisualizer({
  elevatorType = "homelift-kinh",
  onChangeElevatorType,
  capacityKg = 450,
  stops = 4,
  doorType = "CO"
}) {
  // State for interactive features
  const [isDoorsOpen, setIsDoorsOpen] = useState(true);
  const [isLightOn, setIsLightOn] = useState(true);
  const [floorPattern, setFloorPattern] = useState("royal-carpet");
  const [chimeNotice, setChimeNotice] = useState("");

  // Sync default floor pattern nicely when elevatorType changes
  useEffect(() => {
    if (elevatorType === "inox-guong-vang") {
      setFloorPattern("royal-carpet");
    } else if (elevatorType === "homelift-kinh") {
      setFloorPattern("black-galaxy");
    } else {
      setFloorPattern("white-carrara");
    }
  }, [elevatorType]);

  const toggleDoors = () => {
    const nextState = !isDoorsOpen;
    setIsDoorsOpen(nextState);
    setChimeNotice(nextState ? "🔔 Cửa thang máy đang mở..." : "🚪 Cửa thang máy đang đóng...");
    const timer = setTimeout(() => setChimeNotice(""), 2500);
    return () => clearTimeout(timer);
  };

  const toggleLight = () => {
    setIsLightOn(!isLightOn);
  };

  // Derive display labels
  const getStyleLabel = () => {
    switch (elevatorType) {
      case "inox-guong-vang":
        return "Inox Gương Vàng Hoàng Gia";
      case "homelift-kinh":
        return "Vách Kính Panorama Trong Suốt";
      default:
        return "Inox 304 Sọc Nhuyễn Tiêu Chuẩn";
    }
  };

  return (
    <div className="cabin-visualizer-container">
      {/* Top Header */}
      <div className="cabin-viz-header">
        <div className="cabin-viz-title">
          <i className="bi bi-box text-warning fs-5"></i>
          <span>PHỐI CẢNH CABIN TRỰC QUAN 2.5D</span>
          <span className="cabin-viz-badge">Live Render</span>
        </div>

        <div className="cabin-viz-actions">
          {/* Light toggle */}
          <button
            type="button"
            className={`cabin-viz-btn-action ${isLightOn ? "active" : ""}`}
            onClick={toggleLight}
            title={isLightOn ? "Tắt đèn trần LED" : "Bật đèn trần LED"}
          >
            <i className={`bi ${isLightOn ? "bi-lightbulb-fill text-warning" : "bi-lightbulb"}`}></i>
            <span>{isLightOn ? "Đèn BẬT" : "Đèn TẮT"}</span>
          </button>

          {/* Door toggle */}
          <button
            type="button"
            className={`cabin-viz-btn-action ${isDoorsOpen ? "active" : ""}`}
            onClick={toggleDoors}
            title={isDoorsOpen ? "Đóng cửa thang máy" : "Mở cửa thang máy"}
          >
            <i className={`bi ${isDoorsOpen ? "bi-door-open-fill text-info" : "bi-door-closed-fill"}`}></i>
            <span>{isDoorsOpen ? "Đang Mở" : "Đang Đóng"}</span>
          </button>
        </div>
      </div>

      {/* 3D Viewport Stage */}
      <div className="cabin-stage">
        {/* Floor Indicator Display */}
        <div className="cabin-landing-indicator">
          <span className="floor-num">{stops}F</span>
          <span className="dir-arrow">▲</span>
          <span className="capacity-badge">{capacityKg}kg • {Math.round(capacityKg / 75)} người</span>
        </div>

        {/* Chime toast notice */}
        {chimeNotice && (
          <div
            style={{
              position: "absolute",
              top: "55px",
              zIndex: 20,
              background: "rgba(15, 23, 42, 0.9)",
              color: "#38bdf8",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "600",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
            }}
          >
            {chimeNotice}
          </div>
        )}

        {/* Landing surround lighting */}
        <div className="cabin-landing-surround"></div>

        {/* Elevator Car 3D Box */}
        <div className={`cabin-car-box ${isDoorsOpen ? "doors-open" : ""}`}>
          {/* Ceiling with LED Lamp */}
          <div className={`cabin-ceiling ${isLightOn ? "light-on" : "light-off"}`}>
            <div className="cabin-ceiling-lamp"></div>
          </div>

          {/* Ambient Lighting Cone */}
          {isLightOn && <div className="cabin-ambient-light"></div>}

          {/* Back Wall Material */}
          <div className={`cabin-back-wall wall-${elevatorType}`}>
            {/* Handrail inside */}
            <div className="cabin-handrail"></div>

            {/* Car Operating Panel (COP) */}
            <div className="cabin-cop-panel">
              <div className="cabin-cop-screen">
                <span>{stops}</span>
              </div>
              <div className="cabin-cop-buttons">
                <div className="cop-dot active"></div>
                <div className="cop-dot"></div>
                <div className="cop-dot"></div>
                <div className="cop-dot"></div>
              </div>
            </div>
          </div>

          {/* Floor Texture */}
          <div className={`cabin-floor floor-${floorPattern}`}></div>

          {/* Sliding Doors (Left & Right) */}
          <div className="cabin-door door-left"></div>
          <div className="cabin-door door-right"></div>

          {/* Laser Safety Beam */}
          <div className="cabin-door-gap-indicator"></div>
        </div>
      </div>

      {/* Bottom Controls Toolbar */}
      <div className="cabin-viz-controls">
        <div className="cabin-viz-controls-row">
          {/* Wall options */}
          <div className="cabin-control-group">
            <span className="cabin-control-label">
              <i className="bi bi-palette me-1"></i>Vách:
            </span>
            <button
              type="button"
              className={`cabin-btn-chip ${elevatorType === "homelift-kinh" ? "active" : ""}`}
              onClick={() => onChangeElevatorType && onChangeElevatorType("homelift-kinh")}
            >
              <span className="dot-preview dot-glass"></span>
              Kính
            </button>
            <button
              type="button"
              className={`cabin-btn-chip ${elevatorType === "inox-guong-vang" ? "active" : ""}`}
              onClick={() => onChangeElevatorType && onChangeElevatorType("inox-guong-vang")}
            >
              <span className="dot-preview dot-gold"></span>
              Gương Vàng
            </button>
            <button
              type="button"
              className={`cabin-btn-chip ${elevatorType === "inox-tieu-chuan" ? "active" : ""}`}
              onClick={() => onChangeElevatorType && onChangeElevatorType("inox-tieu-chuan")}
            >
              <span className="dot-preview dot-silver"></span>
              Inox 304
            </button>
          </div>

          {/* Floor options */}
          <div className="cabin-control-group">
            <span className="cabin-control-label">
              <i className="bi bi-grid-3x3 me-1"></i>Sàn:
            </span>
            <button
              type="button"
              className={`cabin-btn-chip ${floorPattern === "royal-carpet" ? "active" : ""}`}
              onClick={() => setFloorPattern("royal-carpet")}
            >
              <span className="dot-preview dot-royal"></span>
              Thảm Hoàng Gia
            </button>
            <button
              type="button"
              className={`cabin-btn-chip ${floorPattern === "black-galaxy" ? "active" : ""}`}
              onClick={() => setFloorPattern("black-galaxy")}
            >
              <span className="dot-preview dot-black"></span>
              Kim Sa Đen
            </button>
            <button
              type="button"
              className={`cabin-btn-chip ${floorPattern === "white-carrara" ? "active" : ""}`}
              onClick={() => setFloorPattern("white-carrara")}
            >
              <span className="dot-preview dot-white"></span>
              Trắng Mây
            </button>
          </div>
        </div>

        {/* Status footnote */}
        <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top border-secondary border-opacity-25">
          <small className="text-secondary" style={{ fontSize: "11px" }}>
            <i className="bi bi-info-circle me-1 text-info"></i>
            Đang hiển thị: <strong className="text-light">{getStyleLabel()}</strong> • Cửa mở {doorType === "CO" ? "tim 2 cánh (CO)" : "lùa 2 cánh (SO)"}
          </small>
          <small className="text-warning fw-semibold" style={{ fontSize: "11px" }}>
            Bấm "Đang Mở / Đang Đóng" để kiểm tra cơ chế cửa
          </small>
        </div>
      </div>
    </div>
  );
}
