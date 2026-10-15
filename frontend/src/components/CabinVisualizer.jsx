import { useState, useEffect } from "react";
import "./CabinVisualizer.css";

// Import real high-resolution elevator architectural photos
import imgGlass from "../assets/images/du-an/thang-may-gia-dinh-01.webp";
import imgGold from "../assets/images/du-an/cabin-thang-may-champagne-01.webp";
import imgInox from "../assets/images/du-an/cabin-thang-may-inox-01.webp";
import imgWood from "../assets/images/du-an/thang-may-gia-dinh-02.webp";
import imgDoors from "../assets/images/elevator-doors.jpg";
import imgLobby from "../assets/images/elevator-hotel-lobby.jpg";

export const WALL_OPTIONS = [
  {
    id: "inox-guong-vang",
    name: "Inox Gương Vàng PVD Hoàng Gia",
    desc: "Mạ titan vàng Champagne, hoa văn laser chìm sang trọng",
    image: imgGold,
    thumb: imgGold,
    badge: "Bán chạy nhất",
    syncValue: "inox-guong-vang"
  },
  {
    id: "homelift-kinh",
    name: "Vách Kính Panorama Trong Suốt",
    desc: "Kính an toàn 10mm 4 mặt, lấy sáng tự nhiên tối đa",
    image: imgGlass,
    thumb: imgGlass,
    badge: "Hiện đại",
    syncValue: "homelift-kinh"
  },
  {
    id: "inox-tieu-chuan",
    name: "Inox 304 Sọc Nhuyễn Tiêu Chuẩn",
    desc: "Vân xước hairline satin chống bám vân tay, độ bền vĩnh cửu",
    image: imgInox,
    thumb: imgInox,
    badge: "Bền bỉ",
    syncValue: "inox-tieu-chuan"
  },
  {
    id: "wood-luxury",
    name: "Gỗ Tự Nhiên & Inox Gương",
    desc: "Ốp gỗ sồi / óc chó phối gương soi tân cổ điển",
    image: imgWood,
    thumb: imgWood,
    badge: "Biệt thự cao cấp",
    syncValue: "inox-guong-vang"
  }
];

export const FLOOR_OPTIONS = [
  {
    id: "floor-royal",
    name: "Đá Thảm CNC Hoàng Gia",
    desc: "Cẩm thạch tự nhiên cắt CNC hoa văn tròn đối xứng vàng đen",
    badge: "Cao cấp",
    thumbStyle: {
      background: "radial-gradient(circle at center, #facc15 0%, #ca8a04 25%, #1e1b18 55%, #0b0f19 90%)",
      border: "1px solid #d4af37"
    }
  },
  {
    id: "floor-galaxy",
    name: "Đá Granite Kim Sa Đen",
    desc: "Nền đá đen tuyền ánh kim sa vàng lấp lánh, chống trầy",
    badge: "Bền màu",
    thumbStyle: {
      backgroundColor: "#090d16",
      backgroundImage: "radial-gradient(#facc15 1px, transparent 1px), radial-gradient(#ffffff 0.8px, #090d16 0.8px)",
      backgroundSize: "14px 14px, 10px 10px",
      border: "1px solid #334155"
    }
  },
  {
    id: "floor-carrara",
    name: "Đá Marble Trắng Ý Carrara",
    desc: "Trắng ngọc vân mây xám thanh lịch, mở rộng không gian",
    badge: "Tao nhã",
    thumbStyle: {
      background: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 40%, #cbd5e1 75%, #94a3b8 100%)",
      border: "1px solid #94a3b8"
    }
  }
];

export const CEILING_OPTIONS = [
  {
    id: "ceil-dome",
    name: "Trần Vòm Âm LED Gián Tiếp",
    desc: "Ánh sáng vàng ấm 3000K dịu mắt, chống chói thị giác",
    badge: "Tiết kiệm điện",
    thumbStyle: {
      background: "radial-gradient(ellipse at center, #fef08a 15%, #eab308 50%, #1e293b 85%)",
      border: "1px solid #eab308"
    }
  },
  {
    id: "ceil-diamond",
    name: "Trần Cắt Laser Kim Cương",
    desc: "Inox gương khắc hoa văn kim cương tán xạ ánh sáng đa chiều",
    badge: "Ấn tượng",
    thumbStyle: {
      background: "linear-gradient(45deg, #1e293b 25%, #475569 50%, #334155 75%)",
      backgroundImage: "repeating-linear-gradient(45deg, rgba(250, 204, 21, 0.25) 0 3px, transparent 3px 8px)",
      border: "1px solid #64748b"
    }
  },
  {
    id: "ceil-minimal",
    name: "Trần Linear Tối Giản Scandinavian",
    desc: "Hệ thanh LED song song ánh sáng trắng 6000K chuẩn Bắc Âu",
    badge: "Tối giản",
    thumbStyle: {
      backgroundColor: "#0f172a",
      backgroundImage: "repeating-linear-gradient(90deg, #38bdf8 0 3px, transparent 3px 18px)",
      border: "1px solid #0284c7"
    }
  }
];

export const HANDRAIL_OPTIONS = [
  {
    id: "rail-gold",
    name: "Tay Vịn Tròn Inox Mạ Vàng PVD",
    desc: "Inox 304 phi 38 mạ PVD vàng Champagne đồng bộ vách",
    badge: "Hoàng Gia",
    thumbStyle: {
      background: "linear-gradient(180deg, #fef08a 0%, #eab308 40%, #a16207 80%, #713f12 100%)",
      border: "1px solid #eab308"
    }
  },
  {
    id: "rail-silver",
    name: "Tay Vịn Dẹp Inox 304 Xước Mờ",
    desc: "Bản dẹp 40mm chống trơn trượt, vân hairline bo cạnh",
    badge: "Tiêu chuẩn",
    thumbStyle: {
      background: "linear-gradient(180deg, #f8fafc 0%, #cbd5e1 45%, #64748b 85%, #334155 100%)",
      border: "1px solid #cbd5e1"
    }
  },
  {
    id: "rail-wood",
    name: "Tay Vịn Gỗ Tự Nhiên Phối Kim Loại",
    desc: "Gỗ sồi/óc chó tự nhiên ấm cúng kết hợp chân đế mạ PVD",
    badge: "Sang trọng",
    thumbStyle: {
      background: "linear-gradient(180deg, #92400e 0%, #78350f 50%, #451a03 80%, #d4af37 100%)",
      border: "1px solid #92400e"
    }
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
  const [activeTab, setActiveTab] = useState("walls");
  const [selectedWallId, setSelectedWallId] = useState(
    elevatorType === "inox-guong-vang" ? "inox-guong-vang" :
    elevatorType === "inox-tieu-chuan" ? "inox-tieu-chuan" : "homelift-kinh"
  );
  const [selectedFloorId, setSelectedFloorId] = useState("floor-royal");
  const [selectedCeilingId, setSelectedCeilingId] = useState("ceil-dome");
  const [selectedHandrailId, setSelectedHandrailId] = useState("rail-gold");

  // Sync state when parent elevatorType changes (from Step 3 of quotation)
  useEffect(() => {
    if (elevatorType === "inox-guong-vang") {
      setSelectedWallId("inox-guong-vang");
    } else if (elevatorType === "inox-tieu-chuan") {
      setSelectedWallId("inox-tieu-chuan");
    } else if (elevatorType === "homelift-kinh") {
      setSelectedWallId("homelift-kinh");
    }
  }, [elevatorType]);

  // Interaction controls
  const [isDoorsOpen, setIsDoorsOpen] = useState(true);
  const [isLightOn, setIsLightOn] = useState(true);
  const [viewMode, setViewMode] = useState("interior"); // 'interior' | 'landing'
  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2200);
  };

  const handleSelectWall = (item) => {
    setSelectedWallId(item.id);
    if (onChangeElevatorType && item.syncValue) {
      onChangeElevatorType(item.syncValue);
    }
    triggerToast(`Đã áp dụng: ${item.name}`);
    notifyParent({ wallId: item.id });
  };

  const handleSelectFloor = (item) => {
    setSelectedFloorId(item.id);
    triggerToast(`Đã chọn sàn: ${item.name}`);
    notifyParent({ floorId: item.id });
  };

  const handleSelectCeiling = (item) => {
    setSelectedCeilingId(item.id);
    triggerToast(`Đã chọn trần: ${item.name}`);
    notifyParent({ ceilingId: item.id });
  };

  const handleSelectHandrail = (item) => {
    setSelectedHandrailId(item.id);
    triggerToast(`Đã chọn tay vịn: ${item.name}`);
    notifyParent({ handrailId: item.id });
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

  const handleReset = () => {
    setSelectedWallId("homelift-kinh");
    setSelectedFloorId("floor-galaxy");
    setSelectedCeilingId("ceil-dome");
    setSelectedHandrailId("rail-silver");
    setIsDoorsOpen(true);
    setIsLightOn(true);
    setViewMode("interior");
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

  // Determine which primary image to display based on state
  const getCurrentDisplayImage = () => {
    if (viewMode === "landing") {
      return imgLobby;
    }
    if (!isDoorsOpen) {
      return imgDoors;
    }
    const currentWall = WALL_OPTIONS.find(w => w.id === selectedWallId);
    return currentWall ? currentWall.image : imgGold;
  };

  const curWallObj = WALL_OPTIONS.find(w => w.id === selectedWallId) || WALL_OPTIONS[0];
  const curFloorObj = FLOOR_OPTIONS.find(f => f.id === selectedFloorId) || FLOOR_OPTIONS[0];
  const curCeilObj = CEILING_OPTIONS.find(c => c.id === selectedCeilingId) || CEILING_OPTIONS[0];
  const curRailObj = HANDRAIL_OPTIONS.find(h => h.id === selectedHandrailId) || HANDRAIL_OPTIONS[0];

  return (
    <div className="studio-cabin-configurator">
      {/* 1. Header Toolbar */}
      <div className="studio-cfg-header">
        <div className="studio-cfg-branding">
          <span className="studio-cfg-tag">
            <i className="bi bi-gem"></i> STUDIO PHỐI CẢNH NỘI THẤT CABIN
          </span>
          <h3 className="studio-cfg-title">Thiết kế & Xem trước Cabin Thang Máy</h3>
        </div>

        <div className="studio-cfg-actions">
          {/* View angle toggle */}
          <button
            type="button"
            className={`studio-btn-toggle ${viewMode === "landing" ? "active" : ""}`}
            onClick={() => {
              const next = viewMode === "interior" ? "landing" : "interior";
              setViewMode(next);
              triggerToast(next === "landing" ? "Góc nhìn: Sảnh đón thang máy" : "Góc nhìn: Nội thất bên trong");
            }}
          >
            <i className="bi bi-camera-video"></i>
            <span>{viewMode === "interior" ? "Xem Sảnh Tầng" : "Xem Nội Thất"}</span>
          </button>

          {/* Light toggle */}
          <button
            type="button"
            className={`studio-btn-toggle ${isLightOn ? "active" : ""}`}
            onClick={() => {
              setIsLightOn(!isLightOn);
              triggerToast(!isLightOn ? "Đèn cabin: Bật sáng" : "Đèn cabin: Ánh sáng đêm");
            }}
          >
            <i className={`bi ${isLightOn ? "bi-lightbulb-fill text-warning" : "bi-lightbulb"}`}></i>
            <span>{isLightOn ? "Đèn Bật" : "Đèn Tắt"}</span>
          </button>

          {/* Doors toggle */}
          <button
            type="button"
            className={`studio-btn-toggle ${isDoorsOpen ? "active" : ""}`}
            onClick={() => {
              setIsDoorsOpen(!isDoorsOpen);
              triggerToast(!isDoorsOpen ? "Cửa thang máy đang mở" : "Cửa thang máy đã đóng");
            }}
          >
            <i className={`bi ${isDoorsOpen ? "bi-door-open" : "bi-door-closed"}`}></i>
            <span>{isDoorsOpen ? "Cửa Mở" : "Cửa Đóng"}</span>
          </button>
        </div>
      </div>

      {/* 2. Visual Viewport Stage */}
      <div className={`studio-viewport ${!isLightOn ? "light-off" : ""}`}>
        {/* HUD Indicator */}
        <div className="studio-hud-badge">
          <span className="hud-floor">{stops}F</span>
          <span className="hud-dir">▲</span>
          <span className="hud-cap">{capacityKg}kg • {Math.round(capacityKg / 75)} người</span>
        </div>

        {/* Real High-Resolution Studio Image */}
        <img
          src={getCurrentDisplayImage()}
          alt={curWallObj.name}
          className="studio-image-display"
        />

        {/* Shading Vignette */}
        <div className="studio-vignette"></div>

        {/* Interactive Hotspots (Only shown in interior view when doors are open) */}
        {viewMode === "interior" && isDoorsOpen && (
          <>
            {/* Ceiling Hotspot */}
            <div
              className="studio-hotspot"
              style={{ top: "18%", left: "50%" }}
              onClick={() => setActiveTab("ceiling")}
              title="Bấm để chọn mẫu Trần LED"
            >
              <div className="hotspot-pin">1</div>
              <div className="hotspot-tooltip">
                <strong>Trần chiếu sáng:</strong> {curCeilObj.name} <span style={{ color: "#38bdf8" }}>(Bấm để đổi mẫu)</span>
              </div>
            </div>

            {/* Wall Hotspot */}
            <div
              className="studio-hotspot"
              style={{ top: "45%", left: "30%" }}
              onClick={() => setActiveTab("walls")}
              title="Bấm để chọn mẫu Vách Cabin"
            >
              <div className="hotspot-pin">2</div>
              <div className="hotspot-tooltip">
                <strong>Vách Cabin:</strong> {curWallObj.name} <span style={{ color: "#38bdf8" }}>(Bấm để đổi mẫu)</span>
              </div>
            </div>

            {/* Handrail / COP Hotspot */}
            <div
              className="studio-hotspot"
              style={{ top: "62%", left: "75%" }}
              onClick={() => setActiveTab("handrail")}
              title="Bấm để chọn mẫu Tay vịn"
            >
              <div className="hotspot-pin">3</div>
              <div className="hotspot-tooltip">
                <strong>Tay vịn & COP:</strong> {curRailObj.name} <span style={{ color: "#38bdf8" }}>(Bấm để đổi mẫu)</span>
              </div>
            </div>

            {/* Floor Hotspot */}
            <div
              className="studio-hotspot"
              style={{ top: "82%", left: "50%" }}
              onClick={() => setActiveTab("flooring")}
              title="Bấm để chọn mẫu Sàn Đá"
            >
              <div className="hotspot-pin">4</div>
              <div className="hotspot-tooltip">
                <strong>Sàn Cabin:</strong> {curFloorObj.name} <span style={{ color: "#38bdf8" }}>(Bấm để đổi mẫu)</span>
              </div>
            </div>
          </>
        )}

        {/* Toast Alert */}
        {toastMsg && (
          <div
            style={{
              position: "absolute",
              top: "60px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 30,
              background: "rgba(15, 23, 42, 0.95)",
              color: "#38bdf8",
              padding: "6px 16px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "600",
              border: "1px solid #38bdf8",
              boxShadow: "0 6px 20px rgba(0,0,0,0.6)"
            }}
          >
            <i className="bi bi-check-circle-fill me-1 text-success"></i>
            {toastMsg}
          </div>
        )}

        {/* Bottom Status Watermark */}
        <div className="studio-style-watermark">
          <span className="watermark-name">
            {viewMode === "landing" ? "Góc nhìn: Sảnh đón thang máy sang trọng" :
             !isDoorsOpen ? "Góc nhìn: Cửa tầng tự động inox cao cấp" :
             curWallObj.name}
          </span>
          <span className="watermark-badge">
            {doorType === "CO" ? "Cửa mở tim 2 cánh (CO)" : "Cửa mở lùa 2 cánh (SO)"}
          </span>
        </div>
      </div>

      {/* 3. Selector Tabs & Swatches */}
      <div className="studio-cfg-body">
        {/* Navigation Tabs */}
        <div className="studio-tabs-row">
          <button
            type="button"
            className={`studio-tab-btn ${activeTab === "walls" ? "active" : ""}`}
            onClick={() => setActiveTab("walls")}
          >
            <i className="bi bi-palette2"></i>
            1. Vách Cabin ({WALL_OPTIONS.length})
          </button>
          <button
            type="button"
            className={`studio-tab-btn ${activeTab === "flooring" ? "active" : ""}`}
            onClick={() => setActiveTab("flooring")}
          >
            <i className="bi bi-grid-3x3"></i>
            2. Sàn Đá ({FLOOR_OPTIONS.length})
          </button>
          <button
            type="button"
            className={`studio-tab-btn ${activeTab === "ceiling" ? "active" : ""}`}
            onClick={() => setActiveTab("ceiling")}
          >
            <i className="bi bi-brightness-high"></i>
            3. Trần LED ({CEILING_OPTIONS.length})
          </button>
          <button
            type="button"
            className={`studio-tab-btn ${activeTab === "handrail" ? "active" : ""}`}
            onClick={() => setActiveTab("handrail")}
          >
            <i className="bi bi-slash-circle"></i>
            4. Tay Vịn ({HANDRAIL_OPTIONS.length})
          </button>
        </div>

        {/* Tab 1: Walls */}
        {activeTab === "walls" && (
          <div className="studio-cards-grid">
            {WALL_OPTIONS.map((item) => {
              const isSelected = selectedWallId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`studio-material-card ${isSelected ? "active" : ""}`}
                  onClick={() => handleSelectWall(item)}
                >
                  <div className="card-thumb-wrap">
                    <img src={item.thumb} alt={item.name} className="card-thumb-img" />
                    {isSelected && (
                      <div className="card-check-badge">
                        <i className="bi bi-check-lg"></i>
                      </div>
                    )}
                  </div>
                  <div className="card-details">
                    <span className="card-title">{item.name}</span>
                    <span className="card-desc">{item.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 2: Flooring */}
        {activeTab === "flooring" && (
          <div className="studio-cards-grid">
            {FLOOR_OPTIONS.map((item) => {
              const isSelected = selectedFloorId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`studio-material-card ${isSelected ? "active" : ""}`}
                  onClick={() => handleSelectFloor(item)}
                >
                  <div
                    className="card-thumb-wrap"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      ...item.thumbStyle
                    }}
                  >
                    {isSelected && (
                      <div className="card-check-badge">
                        <i className="bi bi-check-lg"></i>
                      </div>
                    )}
                  </div>
                  <div className="card-details">
                    <span className="card-title">{item.name}</span>
                    <span className="card-desc">{item.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 3: Ceiling */}
        {activeTab === "ceiling" && (
          <div className="studio-cards-grid">
            {CEILING_OPTIONS.map((item) => {
              const isSelected = selectedCeilingId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`studio-material-card ${isSelected ? "active" : ""}`}
                  onClick={() => handleSelectCeiling(item)}
                >
                  <div
                    className="card-thumb-wrap"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      ...item.thumbStyle
                    }}
                  >
                    {isSelected && (
                      <div className="card-check-badge">
                        <i className="bi bi-check-lg"></i>
                      </div>
                    )}
                  </div>
                  <div className="card-details">
                    <span className="card-title">{item.name}</span>
                    <span className="card-desc">{item.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 4: Handrail */}
        {activeTab === "handrail" && (
          <div className="studio-cards-grid">
            {HANDRAIL_OPTIONS.map((item) => {
              const isSelected = selectedHandrailId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`studio-material-card ${isSelected ? "active" : ""}`}
                  onClick={() => handleSelectHandrail(item)}
                >
                  <div
                    className="card-thumb-wrap"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      ...item.thumbStyle
                    }}
                  >
                    {isSelected && (
                      <div className="card-check-badge">
                        <i className="bi bi-check-lg"></i>
                      </div>
                    )}
                  </div>
                  <div className="card-details">
                    <span className="card-title">{item.name}</span>
                    <span className="card-desc">{item.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Footer & Action Bar */}
      <div className="studio-cfg-footer">
        <div className="studio-spec-badges">
          <span className="studio-badge">
            Vách: <strong>{curWallObj.name}</strong>
          </span>
          <span className="studio-badge">
            Sàn: <strong>{curFloorObj.name}</strong>
          </span>
          <span className="studio-badge">
            Trần: <strong>{curCeilObj.name}</strong>
          </span>
          <span className="studio-badge">
            Tay vịn: <strong>{curRailObj.name}</strong>
          </span>
        </div>

        <div className="studio-action-btns">
          <button
            type="button"
            className="btn-cfg-reset"
            onClick={handleReset}
            title="Khôi phục cấu hình tiêu chuẩn"
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i>
            Đặt lại
          </button>
          <button
            type="button"
            className="btn-cfg-apply"
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
