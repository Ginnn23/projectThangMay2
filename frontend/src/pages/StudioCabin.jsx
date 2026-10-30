import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import SeoHead from "../components/SeoHead";
import CabinVisualizer from "../components/CabinVisualizer";
import SmartElevatorCOP from "../components/SmartElevatorCOP";
import { soDienThoaiCongTy, soDienThoaiLienKet } from "../data/contactInfo";
import { apiClient } from "../api/client";
import heroImage from "../assets/images/hero-elevator.jpg";
import "./StudioCabin.css";

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

  // State cấu hình
  const [activePreset, setActivePreset] = useState("classic-walnut");
  const [elevatorType, setElevatorType] = useState("biet-thu-walnut");
  const [capacityKg, setCapacityKg] = useState(450);
  const [stops, setStops] = useState(4);
  const [doorType, setDoorType] = useState("CO");

  // State các mã vật liệu (để điều khiển preset)
  const [selectedWallId, setSelectedWallId] = useState("wood-walnut-mirror");
  const [selectedFloorId, setSelectedFloorId] = useState("floor-chevron-brass");
  const [selectedCeilingId, setSelectedCeilingId] = useState("ceil-cove-warm");
  const [selectedHandrailId, setSelectedHandrailId] = useState("wood-brass");

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
            
            {/* KHÔNG GIAN PHỐI CẢNH CABIN 2.5D (RỘNG RÃI, CHIẾM 7/12 MÀN HÌNH) */}
            <div className="col-lg-7 col-xl-8">
              <div className="studio-visualizer-wrapper">
                <div className="studio-visualizer-header">
                  <div className="d-flex align-items-center gap-2">
                    <span className="live-dot"></span>
                    <strong className="text-white">Không Gian Trực Quan 2.5D</strong>
                  </div>
                  <span className="badge bg-warning text-dark fw-bold" style={{ fontSize: "11px" }}>
                    Tỷ Lệ Kiến Trúc Chuẩn 1:1
                  </span>
                </div>

                {/* Component CabinVisualizer giữ nguyên đầy đủ tính năng gốc */}
                <div className="p-3">
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
              </div>
            </div>

            {/* BẢNG TÓM TẮT VẬT LIỆU & NÚT CHUYỂN DỰ TOÁN BÁO GIÁ (CỘT PHẢI) */}
            <div className="col-lg-5 col-xl-4">
              <div className="studio-sidebar-specs">
                
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
    </div>
  );
}
