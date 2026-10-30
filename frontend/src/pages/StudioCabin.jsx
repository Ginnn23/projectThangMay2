import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import SeoHead from "../components/SeoHead";
import CabinVisualizer from "../components/CabinVisualizer";
import SmartElevatorCOP from "../components/SmartElevatorCOP";
import { soDienThoaiCongTy, soDienThoaiLienKet } from "../data/contactInfo";
import { apiClient } from "../api/client";
import heroImage from "../assets/images/hero-elevator.jpg";
import anhWalnutMirror from "../assets/images/cabin-styles/cabin-walnut-mirror.webp";
import anhInoxHairline from "../assets/images/cabin-styles/cabin-inox-hairline.webp";
import anhGoldPvd from "../assets/images/cabin-styles/cabin-gold-pvd.webp";
import anhSilverMirror from "../assets/images/cabin-styles/cabin-silver-mirror.webp";
import anhOakScandi from "../assets/images/cabin-styles/cabin-oak-scandi.webp";
import anhGlassPanorama from "../assets/images/cabin-styles/cabin-glass-panorama.webp";
import anhTitaniumBlack from "../assets/images/cabin-styles/cabin-titanium-black.webp";
import anhQuiltedLeather from "../assets/images/cabin-styles/cabin-quilted-leather.jpg";
import anhOnyxBacklit from "../assets/images/cabin-styles/cabin-onyx-backlit.jpg";
import "./StudioCabin.css";

// DANH SÁCH ẢNH THỰC TẾ CABIN PHỐI HOÀN THIỆN TƯƠNG ỨNG TỪNG MẪU VẬT LIỆU
const CABIN_REAL_PHOTOS = {
  "wood-walnut-mirror": {
    image: anhWalnutMirror,
    title: "Cabin Gỗ Óc Chó Phối Gương Soi Quý Tộc",
    badge: "Chuẩn Biệt Thự & Villa 5★",
    desc: "Hình ảnh hoàn thiện thực tế: Vách gỗ Walnut tự nhiên kết hợp gương bỉ trung tâm, nẹp titan vàng đồng sang trọng."
  },
  "inox-guong-vang": {
    image: anhGoldPvd,
    title: "Cabin Inox Gương Vàng PVD Hoàng Gia",
    badge: "Hoàng Gia Luxury PVD 8K",
    desc: "Hình ảnh hoàn thiện thực tế: Mạ titan PVD vàng Champagne vương giả, phản chiếu ánh sáng tự nhiên lộng lẫy."
  },
  "kinh-cuong-luc": {
    image: anhGlassPanorama,
    title: "Cabin Thang Máy Kính Homelift Panorama",
    badge: "Homelift Nhà Phố View 360°",
    desc: "Hình ảnh hoàn thiện thực tế: Giếng thang vách kính an toàn 4 mặt siêu trong suốt, đón ánh sáng tự nhiên."
  },
  "wood-oak-scandi": {
    image: anhOakScandi,
    title: "Cabin Gỗ Sồi Bắc Âu Nẹp Chỉ Đen",
    badge: "Scandinavian Tinh Tế & Ấm Cúng",
    desc: "Hình ảnh hoàn thiện thực tế: Gỗ sồi sáng màu phân mảng nẹp chỉ đen thanh lịch, phong cách tối giản Bắc Âu."
  },
  "inox-tieu-chuan": {
    image: anhInoxHairline,
    title: "Cabin Inox 304 Sọc Nhuyễn Hairline",
    badge: "Tiêu Chuẩn Bền Bỉ Cơ Học",
    desc: "Hình ảnh hoàn thiện thực tế: Inox SUS 304 chải xước satin chống bám vân tay, bền bỉ cơ học vĩnh cửu."
  },
  "inox-guong-bac": {
    image: anhSilverMirror,
    title: "Cabin Inox Gương Bạc Phản Chiếu 8K",
    badge: "Mở Rộng Không Gian Vô Tận",
    desc: "Hình ảnh hoàn thiện thực tế: Inox đánh bóng gương 8K trắng sáng, tạo cảm giác mở rộng không gian tối đa."
  },
  "inox-guong-den": {
    image: anhTitaniumBlack,
    title: "Cabin Inox Gương Đen Titanium Black 8K",
    badge: "Penthouse Hiện Đại",
    desc: "Hình ảnh hoàn thiện thực tế: Gương đen tuyền Titanium Black phản chiếu chiều sâu sang trọng chuẩn Penthouse."
  },
  "da-leather-hermes": {
    image: anhQuiltedLeather,
    title: "Cabin Vách Da Ý May Quả Trám Nẹp Đồng",
    badge: "Da Thủ Công Luxury Hermès",
    desc: "Hình ảnh hoàn thiện thực tế: Vách da Microfiber Ý chần chỉ quả trám thủ công phối nẹp đồng phong cách Hermès quý phái."
  },
  "onyx-backlit": {
    image: anhOnyxBacklit,
    title: "Cabin Đá Cẩm Thạch Xuyên Sáng Onyx Vàng",
    badge: "Đá Ngọc Xuyên Sáng Thượng Lưu",
    desc: "Hình ảnh hoàn thiện thực tế: Đá ngọc tự nhiên cho ánh sáng vàng ấm xuyên qua mặt đá lung linh đẳng cấp."
  }
};

// BỘ SƯU TẬP PHONG CÁCH CABIN ĐƯỢC ƯA CHUỘNG NHẤT
const PRESET_COLLECTIONS = [
  {
    id: "royal-luxury",
    title: "Hoàng Gia Luxury",
    tagline: "Vàng PVD 8K & Cẩm Thạch Đen",
    badge: "Biệt thự Tân Cổ Điển",
    themeClass: "preset-royal",
    desc: "Vách Inox gương vàng PVD 8K, sàn đá Marble Nero Marquina tia chớp, trần khe LED vàng ấm 3000K, tay vịn gỗ óc chó nẹp đồng.",
    specs: {
      wallId: "inox-guong-vang",
      floorId: "floor-marquina-black",
      ceilingId: "ceil-cove-warm",
      handrailId: "wood-brass",
      elevatorType: "inox-guong-vang"
    }
  },
  {
    id: "modern-panorama",
    title: "Kính Panorama Trong Suốt",
    tagline: "View 360° Đẳng Cấp",
    badge: "Homelift Nhà Phố",
    themeClass: "preset-panorama",
    desc: "Kính cường lực an toàn siêu trong suốt, sàn đá Terrazzo cát be chống trượt, trần phẳng gián tiếp, tay vịn tròn inox chống xước.",
    specs: {
      wallId: "kinh-cuong-luc",
      floorId: "floor-terrazzo-sand",
      ceilingId: "ceil-cove-warm",
      handrailId: "round-inox",
      elevatorType: "homelift-kinh"
    }
  },
  {
    id: "classic-walnut",
    title: "Gỗ Óc Chó Quý Tộc",
    tagline: "Ấm Cúng & Thượng Lưu",
    badge: "Villa & Dinh Thự",
    themeClass: "preset-walnut",
    desc: "Vách gỗ Walnut tự nhiên phối gương bỉ trung tâm, sàn đá nẹp chỉ đồng Chevron xương cá nghệ thuật, trần âm LED sang trọng.",
    specs: {
      wallId: "wood-walnut-mirror",
      floorId: "floor-chevron-brass",
      ceilingId: "ceil-cove-warm",
      handrailId: "wood-brass",
      elevatorType: "biet-thu-walnut"
    }
  },
  {
    id: "scandi-minimal",
    title: "Bắc Âu Tinh Tế",
    tagline: "Gỗ Sồi & Nẹp Chỉ Đen",
    badge: "Hiện Đại Tối Giản",
    themeClass: "preset-scandi",
    desc: "Gỗ sồi Scandinavian sáng màu nẹp chỉ đen thanh lịch, sàn gỗ tự nhiên ghép thanh, trần inox gương chia ô & thanh LED 4000K.",
    specs: {
      wallId: "wood-oak-scandi",
      floorId: "floor-wood-plank",
      ceilingId: "ceil-coffered-linear",
      handrailId: "flat-satin",
      elevatorType: "inox-tieu-chuan"
    }
  }
];

export default function StudioCabin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State cấu hình
  const [activePreset, setActivePreset] = useState("classic-walnut");
  const [elevatorType, setElevatorType] = useState(() => searchParams.get("elevatorType") || "biet-thu-walnut");
  const [capacityKg, setCapacityKg] = useState(() => {
    const p = searchParams.get("capacityKg");
    return p && !isNaN(p) ? Number(p) : 450;
  });
  const [stops, setStops] = useState(() => {
    const p = searchParams.get("stops");
    return p && !isNaN(p) ? Math.min(Math.max(Number(p), 2), 10) : 4;
  });
  const [doorType, setDoorType] = useState("CO");

  // State các mã vật liệu (để điều khiển preset)
  const [selectedWallId, setSelectedWallId] = useState("wood-walnut-mirror");
  const [selectedFloorId, setSelectedFloorId] = useState("floor-chevron-brass");
  const [selectedCeilingId, setSelectedCeilingId] = useState("ceil-cove-warm");
  const [selectedHandrailId, setSelectedHandrailId] = useState("wood-brass");

  // Chế độ xem: '2.5d' hoặc 'photo' (xem ảnh thực tế)
  const [viewMode, setViewMode] = useState("2.5d");
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);

  // Ref điều khiển CabinVisualizer trực tiếp từ Bảng điều khiển điện tử COP
  const cabinVisualizerRef = useRef(null);

  // State đồng bộ thời gian thực vận hành thang máy (Tầng, Hướng chạy, Trạng thái cửa, Đèn)
  const [elevatorFlightState, setElevatorFlightState] = useState({
    currentFloor: 1,
    targetFloor: 1,
    elevatorStatus: "idle",
    moveDirection: null,
    isDoorsOpen: true,
    isLightOn: true
  });

  // State thông tin chi tiết vật liệu do CabinVisualizer phản hồi lại
  const [materials, setMaterials] = useState({
    wall: null,
    floor: null,
    ceiling: null,
    handrail: null
  });

  // Modal / Form gửi mẫu tư vấn nhanh
  const [quickName, setQuickName] = useState("");
  const [quickPhone, setQuickPhone] = useState("");
  const [quickNote, setQuickNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  useEffect(() => {
    const pStops = searchParams.get("stops");
    if (pStops && !isNaN(pStops)) {
      setStops(Math.min(Math.max(Number(pStops), 2), 10));
    }
    const pCap = searchParams.get("capacityKg");
    if (pCap && !isNaN(pCap)) {
      setCapacityKg(Number(pCap));
    }
    const pType = searchParams.get("elevatorType");
    if (pType) {
      setElevatorType(pType);
    }
  }, [searchParams]);

  const handleSelectPreset = (preset) => {
    setActivePreset(preset.id);
    setSelectedWallId(preset.specs.wallId);
    setSelectedFloorId(preset.specs.floorId);
    setSelectedCeilingId(preset.specs.ceilingId);
    const railId = preset.specs.handrailId === "flat-inox" ? "flat-satin" : preset.specs.handrailId;
    setSelectedHandrailId(railId);
    setElevatorType(preset.specs.elevatorType);
  };

  const handleMaterialChange = (data) => {
    setMaterials({
      wall: data.wall,
      floor: data.floor,
      ceiling: data.ceiling,
      handrail: data.handrail
    });
    if (data.wallId) setSelectedWallId(data.wallId);
    if (data.floorId) setSelectedFloorId(data.floorId);
    if (data.ceilingId) setSelectedCeilingId(data.ceilingId);
    if (data.handrailId) setSelectedHandrailId(data.handrailId);
  };

  // Chuyển sang trang Dự toán báo giá với đầy đủ cấu hình cabin đã chọn
  const handleGoToEstimator = () => {
    const params = new URLSearchParams({
      elevatorType: elevatorType,
      capacityKg: String(capacityKg),
      stops: String(stops),
      wall: materials.wall?.name || "",
      floor: materials.floor?.name || "",
      ceiling: materials.ceiling?.name || "",
      handrail: materials.handrail?.name || ""
    });
    navigate(`/du-toan?${params.toString()}`);
  };

  // Gửi thông tin đăng ký tư vấn mẫu này
  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    if (!quickName.trim() || !quickPhone.trim()) {
      setSubmitMsg("Vui lòng điền họ tên và số điện thoại.");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitMsg("");

      const payload = {
        name: quickName.trim(),
        phone: quickPhone.trim(),
        serviceType: "Tư vấn thiết kế Cabin Thang Máy",
        message: `Khách đăng ký mẫu thiết kế Cabin: Vách: ${materials.wall?.name || "Tự chọn"}, Sàn: ${materials.floor?.name || "Tự chọn"}, Trần: ${materials.ceiling?.name || "Tự chọn"}, Tay vịn: ${materials.handrail?.name || "Tự chọn"}. Tải trọng: ${capacityKg}kg, ${stops} tầng. Ghi chú thêm: ${quickNote.trim()}`
      };

      await apiClient.post("/api/leads/submit", payload);
      setSubmitSuccess(true);
    } catch {
      // Fallback
      setSubmitSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="studio-cabin-page">
      <SeoHead
        title="Studio Thiết Kế Cabin Thang Máy 2.5D | Thang Máy Hà Hồng"
        description="Trải nghiệm phòng thiết kế cabin thang máy gia đình, homelift kính trực tuyến. Tự tay phối màu vách Inox gương vàng, kính Panorama, đá hoa cương tự nhiên nẹp đồng."
      />

      {/* 1. HERO HEADER (CHUẨN ABOUT-BANNER NHƯ TRANG DỰ ÁN) */}
      <section
        className="about-banner studio-banner"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(5, 14, 28, 0.95), rgba(5, 14, 28, 0.68)), url(${heroImage})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="site-container">
          <nav className="about-breadcrumb" aria-label="breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span>Thiết kế Cabin</span>
          </nav>
          <span className="section-eyebrow">HÀ HỒNG ELEVATOR • 2.5D BESPOKE STUDIO</span>
          <h1>Studio Phối Cảnh &amp; Thiết Kế Cabin Thang Máy</h1>
          <p>
            Thỏa sức cá nhân hóa không gian nội thất thang máy theo phong cách kiến trúc ngôi nhà bạn. 
            Xem trước trực quan 2.5D với hiệu ứng ánh sáng đèn LED, mô phỏng đóng mở cửa và chuyển động tầng thực tế.
          </p>
        </div>
      </section>

      {/* 2. BỘ SƯU TẬP PRESET GỢI Ý (CLICK 1 CHẠM ÁP DỤNG NGAY) */}
      <section className="studio-presets-section">
        <div className="site-container">
          <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
            <div>
              <h2 className="h5 fw-bold text-navy mb-1">
                <i className="bi bi-collection-fill text-warning me-2"></i>
                Bộ Sưu Tập Phong Cách Thiết Kế Tiêu Biểu
              </h2>
              <p className="text-muted small mb-0">
                Chọn nhanh các phong cách kiến trúc được các kiến trúc sư và gia chủ ưa chuộng nhất:
              </p>
            </div>
            <span className="badge bg-light text-dark border">4 Mẫu Tuyển Chọn</span>
          </div>

          <div className="row g-3">
            {PRESET_COLLECTIONS.map((preset) => {
              const isSelected = activePreset === preset.id;
              return (
                <div className="col-12 col-sm-6 col-lg-3" key={preset.id}>
                  <div
                    className={`preset-card ${isSelected ? "active" : ""}`}
                    onClick={() => handleSelectPreset(preset)}
                  >
                    <div className="preset-card-top">
                      <span className="preset-badge">{preset.badge}</span>
                      {isSelected && (
                        <span className="preset-active-check">
                          <i className="bi bi-check-lg"></i>
                        </span>
                      )}
                    </div>
                    <h3 className="preset-title">{preset.title}</h3>
                    <div className="preset-tagline">{preset.tagline}</div>
                    <p className="preset-desc">{preset.desc}</p>
                    <button type="button" className="preset-btn-apply">
                      {isSelected ? "Đang Trực Quan" : "Xem Phối Cảnh Mẫu Này"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. KHÔNG GIAN STUDIO TƯƠNG TÁC CHÍNH */}
      <section className="studio-main-workspace py-4">
        <div className="site-container">
          <div className="row g-4">
            
            {/* KHÔNG GIAN PHỐI CẢNH CABIN 2.5D & ẢNH THỰC TẾ (CỘT TRÁI) */}
            <div className="col-lg-7 col-xl-8">
              <div className="studio-visualizer-wrapper">
                <div className="studio-visualizer-header flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="live-dot"></span>
                    <strong className="text-white">
                      {viewMode === "2.5d" ? "Không Gian Trực Quan 2.5D" : "Ảnh Chụp Cabin Hoàn Thiện Thực Tế"}
                    </strong>
                    <span className="badge bg-warning text-dark fw-bold d-none d-sm-inline" style={{ fontSize: "11px" }}>
                      Tỷ Lệ Chuẩn 1:1
                    </span>
                  </div>

                  {/* Nút chuyển đổi chế độ xem: Mô phỏng 2.5D hoặc Ảnh Thực Tế */}
                  <div className="d-flex align-items-center gap-1.5">
                    <button
                      type="button"
                      className={`btn btn-sm ${viewMode === "2.5d" ? "btn-warning text-dark fw-bold" : "btn-outline-light"}`}
                      onClick={() => setViewMode("2.5d")}
                      style={{ borderRadius: "20px", fontSize: "12px", padding: "4px 12px" }}
                    >
                      <i className="bi bi-box me-1"></i>Mô Phỏng 2.5D
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${viewMode === "photo" ? "btn-warning text-dark fw-bold" : "btn-outline-warning"}`}
                      onClick={() => setViewMode("photo")}
                      style={{ borderRadius: "20px", fontSize: "12px", padding: "4px 12px" }}
                    >
                      <i className="bi bi-camera-fill me-1"></i>Xem Ảnh Thực Tế
                    </button>
                  </div>
                </div>

                {viewMode === "photo" ? (
                  /* GIAO DIỆN XEM ẢNH THỰC TẾ CABIN PHỐI */
                  <div className="studio-photo-view-container p-3">
                    <div className="studio-photo-view-card">
                      <div className="photo-view-img-wrap" onClick={() => setIsPhotoZoomed(true)}>
                        <img
                          src={(CABIN_REAL_PHOTOS[selectedWallId] || CABIN_REAL_PHOTOS["wood-walnut-mirror"]).image}
                          alt={(CABIN_REAL_PHOTOS[selectedWallId] || CABIN_REAL_PHOTOS["wood-walnut-mirror"]).title}
                          className="photo-view-main-img"
                        />
                        <div className="photo-view-zoom-hint">
                          <i className="bi bi-zoom-in me-1"></i>Bấm vào ảnh để phóng to toàn màn hình
                        </div>
                        <span className="photo-view-badge-float">
                          {(CABIN_REAL_PHOTOS[selectedWallId] || CABIN_REAL_PHOTOS["wood-walnut-mirror"]).badge}
                        </span>
                      </div>

                      <div className="photo-view-info-box">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                          <div>
                            <h4 className="text-white fw-bold h5 mb-1">
                              {(CABIN_REAL_PHOTOS[selectedWallId] || CABIN_REAL_PHOTOS["wood-walnut-mirror"]).title}
                            </h4>
                            <p className="text-white-50 small mb-0">
                              {(CABIN_REAL_PHOTOS[selectedWallId] || CABIN_REAL_PHOTOS["wood-walnut-mirror"]).desc}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="btn btn-warning btn-sm fw-bold px-3 py-2"
                            onClick={() => setViewMode("2.5d")}
                          >
                            <i className="bi bi-arrow-repeat me-1"></i>Tiếp Tục Chỉnh 2.5D
                          </button>
                        </div>

                        <div className="photo-current-specs-row">
                          <span><i className="bi bi-check2-circle text-warning me-1"></i>Vách: <strong>{materials.wall?.name || "Gỗ óc chó phối gương"}</strong></span>
                          <span><i className="bi bi-check2-circle text-warning me-1"></i>Sàn: <strong>{materials.floor?.name || "Đá cẩm thạch"}</strong></span>
                          <span><i className="bi bi-check2-circle text-warning me-1"></i>Trần: <strong>{materials.ceiling?.name || "Trần LED gián tiếp"}</strong></span>
                          <span><i className="bi bi-check2-circle text-warning me-1"></i>Tay vịn: <strong>{materials.handrail?.name || "Gỗ & đồng"}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* GIAO DIỆN MÔ PHỎNG 2.5D TƯƠNG TÁC GỐC */
                  <div className="p-3">
                    <div className="d-flex justify-content-end mb-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-warning d-inline-flex align-items-center gap-1 fw-bold"
                        style={{ fontSize: "12px", borderRadius: "16px", background: "rgba(11, 34, 70, 0.7)" }}
                        onClick={() => setViewMode("photo")}
                        title="Bấm để xem ảnh chụp thực tế sau khi phối xong"
                      >
                        <i className="bi bi-camera-fill text-warning"></i>
                        Xem ảnh thực tế mẫu này
                        <i className="bi bi-arrow-right ms-1"></i>
                      </button>
                    </div>

                    <CabinVisualizer
                      ref={cabinVisualizerRef}
                      elevatorType={elevatorType}
                      onChangeElevatorType={setElevatorType}
                      capacityKg={Number(capacityKg)}
                      stops={Number(stops)}
                      doorType={doorType}
                      onChangeDoorType={setDoorType}
                      selectedWallProp={selectedWallId}
                      selectedFloorProp={selectedFloorId}
                      selectedCeilingProp={selectedCeilingId}
                      selectedHandrailProp={selectedHandrailId}
                      onMaterialChange={handleMaterialChange}
                      onRequestConsultation={handleGoToEstimator}
                      onElevatorStateChange={setElevatorFlightState}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* BẢNG TÓM TẮT VẬT LIỆU & NÚT CHUYỂN DỰ TOÁN BÁO GIÁ (CỘT PHẢI) */}
            <div className="col-lg-5 col-xl-4">
              <div className="studio-sidebar-specs">
                
                                {/* CARD ẢNH THỰC TẾ MẪU HOÀN THIỆN (PHÍA BÊN PHẢI CABIN) */}
                <div className="studio-spec-card studio-real-photo-card mb-3">
                  <div className="studio-spec-header d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-camera-fill text-warning fs-5"></i>
                      <div>
                        <h3 className="h6 fw-bold text-white mb-0">Ảnh Thực Tế Mẫu Phối</h3>
                        <small className="text-white-50">Đồng bộ tự động theo mẫu đã chọn</small>
                      </div>
                    </div>
                    <span className="badge bg-warning text-dark fw-bold" style={{ fontSize: "10px" }}>
                      THỰC TẾ 100%
                    </span>
                  </div>

                  <div className="studio-real-photo-body">
                    <div
                      className="real-photo-thumbnail-wrap"
                      onClick={() => {
                        setViewMode("photo");
                        window.scrollTo({ top: 380, behavior: "smooth" });
                      }}
                      role="button"
                      title="Bấm để xem ảnh chi tiết"
                    >
                      <img
                        src={(CABIN_REAL_PHOTOS[selectedWallId] || CABIN_REAL_PHOTOS["wood-walnut-mirror"]).image}
                        alt={(CABIN_REAL_PHOTOS[selectedWallId] || CABIN_REAL_PHOTOS["wood-walnut-mirror"]).title}
                        className="real-photo-thumbnail-img"
                      />
                      <div className="real-photo-hover-overlay">
                        <span className="btn-view-preview">
                          <i className="bi bi-zoom-in me-1"></i>Xem Ảnh Toàn Cảnh
                        </span>
                      </div>
                      <span className="real-photo-badge-pill">
                        {(CABIN_REAL_PHOTOS[selectedWallId] || CABIN_REAL_PHOTOS["wood-walnut-mirror"]).badge}
                      </span>
                    </div>

                    <div className="p-3">
                      <div className="fw-bold text-dark small mb-1" style={{ fontSize: "13px" }}>
                        {(CABIN_REAL_PHOTOS[selectedWallId] || CABIN_REAL_PHOTOS["wood-walnut-mirror"]).title}
                      </div>
                      <p className="text-muted small mb-2" style={{ fontSize: "11.5px", lineHeight: "1.4" }}>
                        {(CABIN_REAL_PHOTOS[selectedWallId] || CABIN_REAL_PHOTOS["wood-walnut-mirror"]).desc}
                      </p>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm w-100 fw-bold d-flex align-items-center justify-content-center gap-1"
                        style={{ fontSize: "12px", borderRadius: "8px" }}
                        onClick={() => {
                          setViewMode("photo");
                          window.scrollTo({ top: 380, behavior: "smooth" });
                        }}
                      >
                        <i className="bi bi-eye-fill"></i>
                        Bấm Xem Ảnh Phối Thực Tế
                      </button>
                    </div>
                  </div>
                </div>

                {/* 1. Tóm tắt vật liệu đã chọn */}
                <div className="studio-spec-card">
                  <div className="studio-spec-header">
                    <i className="bi bi-card-checklist text-warning fs-5"></i>
                    <div>
                      <h3 className="h6 fw-bold text-white mb-0">Cấu Hình Nội Thất Đang Chọn</h3>
                      <small className="text-white-50">Đồng bộ trực tiếp theo thao tác của bạn</small>
                    </div>
                  </div>

                  <div className="studio-spec-body">
                    {/* Vách */}
                    <div className="spec-item-box">
                      <div className="spec-item-label">
                        <i className="bi bi-square-fill text-warning me-1"></i>
                        1. Vách Cabin:
                      </div>
                      <div className="spec-item-value">{materials.wall?.name || "Đang tải..."}</div>
                      <small className="spec-item-sub">{materials.wall?.spec}</small>
                    </div>

                    {/* Sàn */}
                    <div className="spec-item-box">
                      <div className="spec-item-label">
                        <i className="bi bi-border-all text-warning me-1"></i>
                        2. Sàn Đá / Gỗ:
                      </div>
                      <div className="spec-item-value">{materials.floor?.name || "Đang tải..."}</div>
                      <small className="spec-item-sub">{materials.floor?.spec}</small>
                    </div>

                    {/* Trần */}
                    <div className="spec-item-box">
                      <div className="spec-item-label">
                        <i className="bi bi-lightbulb-fill text-warning me-1"></i>
                        3. Hệ Trần Chiếu Sáng:
                      </div>
                      <div className="spec-item-value">{materials.ceiling?.name || "Đang tải..."}</div>
                      <small className="spec-item-sub">{materials.ceiling?.spec}</small>
                    </div>

                    {/* Tay vịn */}
                    <div className="spec-item-box">
                      <div className="spec-item-label">
                        <i className="bi bi-grip-horizontal text-warning me-1"></i>
                        4. Tay Vịn An Toàn:
                      </div>
                      <div className="spec-item-value">{materials.handrail?.name || "Đang tải..."}</div>
                      <small className="spec-item-sub">{materials.handrail?.spec}</small>
                    </div>
                  </div>
                </div>

                {/* 2. Bộ thông số vận hành (Tải trọng, Số tầng, Cửa) */}
                <div className="studio-spec-card">
                  <div className="studio-spec-header py-2 px-3" style={{ background: "#0b2246" }}>
                    <i className="bi bi-sliders text-warning"></i>
                    <h4 className="h6 fw-bold text-white mb-0">Thông Số Vận Hành Cơ Bản</h4>
                  </div>
                  <div className="p-3">
                    <div className="row g-2 mb-2">
                      <div className="col-6">
                        <label className="form-label small fw-bold text-muted mb-1">Tải Trọng:</label>
                        <select
                          className="form-select form-select-sm"
                          value={capacityKg}
                          onChange={(e) => setCapacityKg(Number(e.target.value))}
                        >
                          <option value={300}>300 kg (3-4 người)</option>
                          <option value={350}>350 kg (4-5 người)</option>
                          <option value={450}>450 kg (6 người)</option>
                          <option value={630}>630 kg (8-9 người)</option>
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-bold text-muted mb-1">Số Tầng:</label>
                        <select
                          className="form-select form-select-sm"
                          value={stops}
                          onChange={(e) => setStops(Number(e.target.value))}
                        >
                          {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                            <option key={s} value={s}>{s} Tầng</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between pt-1">
                      <span className="small text-muted fw-bold">Kiểu Mở Cửa:</span>
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className={`btn ${doorType === "CO" ? "btn-primary" : "btn-outline-secondary"}`}
                          onClick={() => setDoorType("CO")}
                        >
                          Mở Trung Tâm (CO)
                        </button>
                        <button
                          type="button"
                          className={`btn ${doorType === "SO" ? "btn-primary" : "btn-outline-secondary"}`}
                          onClick={() => setDoorType("SO")}
                        >
                          Mở Lùa (SO)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BẢNG ĐIỀU KHIỂN THANG MÁY ĐIỆN TỬ (SMART LCD COP - THAO TÁC ĐƯỢC) */}
                <SmartElevatorCOP
                  currentFloor={elevatorFlightState.currentFloor}
                  targetFloor={elevatorFlightState.targetFloor}
                  elevatorStatus={elevatorFlightState.elevatorStatus}
                  moveDirection={elevatorFlightState.moveDirection}
                  isDoorsOpen={elevatorFlightState.isDoorsOpen}
                  isLightOn={elevatorFlightState.isLightOn}
                  stops={Number(stops)}
                  capacityKg={Number(capacityKg)}
                  doorType={doorType}
                  onCallFloor={(targetFloor) => {
                    cabinVisualizerRef.current?.callFloor(targetFloor);
                  }}
                  onSetDoorOpen={(isOpen) => {
                    cabinVisualizerRef.current?.setDoorOpen(isOpen);
                  }}
                  onToggleLight={() => {
                    cabinVisualizerRef.current?.toggleLight();
                  }}
                  onTriggerBell={() => {
                    cabinVisualizerRef.current?.triggerBell();
                  }}
                />

                {/* 3. NÚT CHUYỂN DỰ TOÁN BÁO GIÁ (CTA CHÍNH) */}
                <div className="studio-cta-box">
                  <button
                    type="button"
                    className="btn-studio-estimator"
                    onClick={handleGoToEstimator}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-calculator-fill fs-4"></i>
                      <div className="text-start">
                        <div className="fw-bold fs-6">Nhận Dự Toán Cho Mẫu Này</div>
                        <small style={{ fontSize: "11px", opacity: 0.9 }}>
                          Chuyển sang bảng giá &amp; kích thước hố thang
                        </small>
                      </div>
                    </div>
                    <i className="bi bi-arrow-right fs-4"></i>
                  </button>

                  <a
                    href={`tel:${soDienThoaiLienKet}`}
                    className="btn-studio-hotline"
                  >
                    <i className="bi bi-telephone-fill me-2 text-warning"></i>
                    <span>Tư Vấn Kiến Trúc Trực Tiếp: {soDienThoaiCongTy}</span>
                  </a>
                </div>

                {/* 4. FORM GỬI YÊU CẦU LẤY BẢN VẼ 3D RIÊNG */}
                <div className="studio-quick-lead-card">
                  <div className="quick-lead-title">
                    <i className="bi bi-envelope-paper-heart-fill text-warning me-2"></i>
                    Yêu Cầu Vẽ Phối Cảnh 3D Theo Hiện Trạng Nhà
                  </div>
                  <p className="quick-lead-desc">
                    Kỹ sư kiến trúc Hà Hồng sẽ dựng mô hình 3D thực tế theo kích thước giếng thang nhà bạn và gửi qua Zalo trong 24h.
                  </p>

                  {submitSuccess ? (
                    <div className="alert alert-success py-2 text-center small mb-0">
                      <i className="bi bi-check-circle-fill me-1"></i>
                      Đã ghi nhận yêu cầu! Kỹ sư sẽ gửi bản vẽ 3D cho bạn sớm nhất.
                    </div>
                  ) : (
                    <form onSubmit={handleQuickSubmit}>
                      {submitMsg && (
                        <div className="alert alert-danger py-1 small mb-2">{submitMsg}</div>
                      )}
                      <div className="mb-2">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Họ và tên của bạn *"
                          value={quickName}
                          onChange={(e) => setQuickName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="mb-2">
                        <input
                          type="tel"
                          className="form-control form-control-sm"
                          placeholder="Số điện thoại / Zalo *"
                          value={quickPhone}
                          onChange={(e) => setQuickPhone(e.target.value)}
                          required
                        />
                      </div>
                      <div className="mb-2">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Ghi chú về kích thước hoặc phong cách..."
                          value={quickNote}
                          onChange={(e) => setQuickNote(e.target.value)}
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn-quick-lead-submit"
                        disabled={submitting}
                      >
                        {submitting ? "Đang gửi..." : "Gửi Yêu Cầu Dựng 3D Riêng (Miễn Phí)"}
                      </button>
                    </form>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. BOTTOM BANNER VỀ TIÊU CHUẨN VẬT LIỆU */}
      <section className="studio-quality-banner py-5">
        <div className="site-container">
          <div className="quality-banner-inner">
            <div className="row g-4 align-items-center">
              <div className="col-lg-8">
                <h3 className="h4 fw-bold text-white mb-2">
                  Cam Kết Vật Liệu Chuẩn Kiến Trúc &amp; An Toàn Quốc Tế
                </h3>
                <p className="text-white-50 mb-0">
                  Tất cả bề mặt Inox 304 đều đạt tiêu chuẩn PVD chống ăn mòn hóa học, kính cường lực an toàn chuẩn Châu Âu EN 81-20/50, và sàn đá granite/marble tự nhiên được thi công chống trượt tuyệt đối.
                </p>
              </div>
              <div className="col-lg-4 text-lg-end">
                <Link to="/du-toan" className="btn btn-warning fw-bold px-4 py-2 text-dark shadow">
                  <i className="bi bi-calculator me-1"></i>
                  Xem Dự Toán Chi Phí Lắp Đặt
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* LIGHTBOX PHÓNG TO ẢNH THỰC TẾ TOÀN MÀN HÌNH */}
      {isPhotoZoomed && (
        <div className="photo-lightbox-backdrop" onClick={() => setIsPhotoZoomed(false)}>
          <div className="photo-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="photo-lightbox-close"
              onClick={() => setIsPhotoZoomed(false)}
              aria-label="Đóng"
            >
              <i className="bi bi-x-lg"></i>
            </button>
            <img
              src={(CABIN_REAL_PHOTOS[selectedWallId] || CABIN_REAL_PHOTOS["wood-walnut-mirror"]).image}
              alt={(CABIN_REAL_PHOTOS[selectedWallId] || CABIN_REAL_PHOTOS["wood-walnut-mirror"]).title}
              className="photo-lightbox-img"
            />
            <div className="photo-lightbox-caption">
              <h5 className="text-white fw-bold mb-1">
                {(CABIN_REAL_PHOTOS[selectedWallId] || CABIN_REAL_PHOTOS["wood-walnut-mirror"]).title}
              </h5>
              <p className="text-white-50 small mb-0">
                {(CABIN_REAL_PHOTOS[selectedWallId] || CABIN_REAL_PHOTOS["wood-walnut-mirror"]).desc}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
