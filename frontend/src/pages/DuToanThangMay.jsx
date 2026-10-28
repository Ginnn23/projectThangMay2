import { useEffect, useState, useRef } from "react";
import { apiClient } from "../api/client";
import { soDienThoaiCongTy, soDienThoaiLienKet, emailCongTy } from "../data/contactInfo";
import SeoHead from "../components/SeoHead";
import CabinVisualizer from "../components/CabinVisualizer";
import AiVisionScanner from "../components/AiVisionScanner";
import logoHaHong from "../assets/images/logo-ha-hong.jpg";
import heroImage from "../assets/images/hero-elevator.jpg";
import "./DuToanThangMay.css";

export default function DuToanThangMay() {
  // Config state
  const [buildingType, setBuildingType] = useState("nha-pho-xay-moi");
  const [stops, setStops] = useState(4);
  const [capacityKg, setCapacityKg] = useState(350);
  const [elevatorType, setElevatorType] = useState("homelift-kinh");
  const [motorBrand, setMotorBrand] = useState("Fuji");
  const [doorType, setDoorType] = useState("CO");

  // Customer contact form
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  // Bespoke Cabin Specs (Wall, Floor, Ceiling, Handrail)
  const [cabinSpecs, setCabinSpecs] = useState({
    wall: "Vách Kính Panorama",
    floor: "Đá Granite Kim Sa Đen",
    ceiling: "Trần Vòm Âm LED",
    handrail: "Tay Vịn Tròn Mạ Vàng"
  });

  const handleCabinConsultation = (specs) => {
    if (specs) {
      setCabinSpecs(specs);
      const noteText = `Khách hàng quan tâm cấu hình Cabin: Vách: ${specs.wall}, Sàn: ${specs.floor}, Trần: ${specs.ceiling}, Tay vịn: ${specs.handrail}.`;
      setCustomerNotes(noteText);
    }
    const formElement = document.querySelector(".quote-submit-card") || document.querySelector(".quote-form-card");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Result state
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [savedEstimateId, setSavedEstimateId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [visionToast, setVisionToast] = useState("");

  const handleApplyVisionSpecs = (specs) => {
    if (!specs) return;
    if (specs.buildingType) setBuildingType(specs.buildingType);
    if (specs.capacityKg) setCapacityKg(specs.capacityKg);
    if (specs.elevatorType) setElevatorType(specs.elevatorType);
    if (specs.motorBrand) setMotorBrand(specs.motorBrand);
    if (specs.stops) setStops(specs.stops);
    if (specs.doorType) setDoorType(specs.doorType === "2SO" ? "SO" : "CO");

    const typeLabel =
      specs.elevatorType === "homelift-kinh"
        ? "Thang Kính Homelift"
        : specs.elevatorType === "biet-thu"
        ? "Thang Biệt Thự PVD Gold"
        : "Thang Gia Đình Tiêu Chuẩn";

    setVisionToast(
      `Đã áp dụng cấu hình từ AI Vision: ${specs.capacityKg}kg • ${specs.stops} Tầng • ${typeLabel} (${specs.shaftWidth}x${specs.shaftDepth}mm)!`
    );
    setTimeout(() => setVisionToast(""), 8000);

    const calcCard = document.querySelector(".estimator-step-card") || document.querySelector(".estimator-card");
    if (calcCard) {
      calcCard.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDownloadPdf = async () => {
    if (savedEstimateId) {
      try {
        const response = await apiClient.get(`/estimates/${savedEstimateId}/pdf`, {
          responseType: "blob",
        });
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Bang_Bao_Gia_Thang_May_Ha_Hong_HH-${savedEstimateId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Lỗi tải PDF từ API, dùng in trình duyệt fallback:", err);
        window.print();
      }
    } else {
      window.print();
    }
  };

  const printRef = useRef(null);

  // Fallback local calculator if API is temporarily unavailable
  const calculateLocal = (bType, st, cap, elType, mBrand) => {
    const isGlass = elType.includes("kinh") || elType.includes("homelift");
    const isGold = elType.includes("vang");
    const isReno = bType.includes("cai-tao");

    let sW = 1350, sD = 1350, cW = 950, cD = 900, dW = 700;
    let powerKw = 2.7, speed = isGlass ? 0.4 : 0.6;
    let power = "1 pha 220V hoặc 3 pha 380V";

    if (cap === 300) {
      sW = isGlass ? 1200 : 1300; sD = isGlass ? 1200 : 1300;
      cW = 850; cD = 800; dW = 650; powerKw = 2.2;
    } else if (cap === 450) {
      sW = isGlass ? 1550 : 1650; sD = isGlass ? 1550 : 1600;
      cW = 1100; cD = 1000; dW = 750; powerKw = 3.7; speed = 1.0;
      power = "3 pha 380V (Khuyên dùng)";
    } else if (cap === 630) {
      sW = 1800; sD = 1750; cW = 1300; cD = 1150; dW = 800;
      powerKw = 5.5; speed = 1.0; power = "3 pha 380V";
    }

    const pit = isGlass ? (isReno ? 250 : 350) : (isReno ? 600 : 1100);
    const oh = isGlass ? 2950 : (isReno ? 3400 : 3800);

    let mMin = 110000000, mMax = 125000000;
    if (mBrand === "Mitsubishi") { mMin = 135000000; mMax = 155000000; }
    if (mBrand === "Montanari") { mMin = 155000000; mMax = 180000000; }

    let cMin = 75000000, cMax = 90000000;
    if (isGlass) { cMin = 120000000; cMax = 145000000; }
    else if (isGold) { cMin = 95000000; cMax = 115000000; }

    const extraStops = Math.max(0, st - 3);
    const sCostMin = extraStops * 16000000;
    const sCostMax = extraStops * 20000000;

    let fMin = 0, fMax = 0;
    if (isGlass) { fMin = 50000000 + st * 5000000; fMax = 65000000 + st * 6000000; }
    else if (isReno) { fMin = 35000000 + st * 3500000; fMax = 48000000 + st * 4500000; }

    const laborMin = 35000000 + st * 2000000;
    const laborMax = 45000000 + st * 2500000;

    let totalMin = Math.round((mMin + cMin + sCostMin + fMin + laborMin) / 1000000) * 1000000;
    let totalMax = Math.round((mMax + cMax + sCostMax + fMax + laborMax) / 1000000) * 1000000;

    return {
      estimatedPriceMin: totalMin,
      estimatedPriceMax: totalMax,
      shaftWidth: sW, shaftDepth: sD, cabinWidth: cW, cabinDepth: cD, cabinHeight: 2200,
      pitDepth: pit, overheadHeight: oh, doorWidth: dW, doorHeight: 2100,
      speedMps: speed, motorPowerKw: powerKw, powerSupply: power,
      warrantyMonths: 24, freeMaintenanceMonths: 12,
      breakdownItems: [
        { category: "Động cơ & Tủ điện", title: `Động cơ ${mBrand} ${powerKw}kW`, minPrice: mMin, maxPrice: mMax },
        { category: "Nội thất Cabin", title: isGlass ? "Vách kính Panorama" : (isGold ? "Inox Gương Vàng" : "Inox 304"), minPrice: cMin, maxPrice: cMax },
        { category: "Cửa tầng & Thiết bị theo tầng", title: `${st} Điểm dừng (Stops)`, minPrice: sCostMin + 25000000, maxPrice: sCostMax + 32000000 },
        { category: "Khung hố thang & Thi công", title: isGlass ? "Khung thép định hình bọc kính" : "Khung giếng thang & Nhân công", minPrice: (fMin || 0) + laborMin, maxPrice: (fMax || 0) + laborMax }
      ]
    };
  };

  // Recalculate on any configuration change
  useEffect(() => {
    let active = true;
    const fetchEstimate = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.post("/estimates/calculate", {
          buildingType, stops: Number(stops), capacityKg: Number(capacityKg),
          elevatorType, motorBrand, doorType
        });
        if (active) setResult(data);
      } catch {
        if (active) {
          setResult(calculateLocal(buildingType, Number(stops), Number(capacityKg), elevatorType, motorBrand));
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchEstimate();
    return () => { active = false; };
  }, [buildingType, stops, capacityKg, elevatorType, motorBrand, doorType]);

  const formatVnd = (val) => {
    if (!val) return "0 đ";
    return new Intl.NumberFormat("vi-VN").format(val) + " VNĐ";
  };

  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    if (digitsOnly.length <= 10) {
      setPhoneNumber(digitsOnly);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmedName = customerName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg("Vui lòng nhập họ và tên của bạn (tối thiểu 2 ký tự).");
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMsg("Số điện thoại phải gồm đúng 10 chữ số (VD: 0912345678).");
      return;
    }
    if (!cleanPhone.startsWith("0")) {
      setErrorMsg("Số điện thoại phải bắt đầu bằng chữ số 0 (VD: 0912345678).");
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMsg("Vui lòng nhập địa chỉ Gmail (VD: hotro.hahong@gmail.com).");
      return;
    }
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    if (!gmailRegex.test(trimmedEmail)) {
      setErrorMsg("Email bắt buộc phải có đuôi @gmail.com (VD: yourname@gmail.com).");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName: trimmedName,
        phoneNumber: cleanPhone,
        email: trimmedEmail,
        address: address.trim() || null,
        buildingType,
        stops: Number(stops),
        capacityKg: Number(capacityKg),
        elevatorType,
        motorBrand,
        doorType,
        customerNotes: customerNotes.trim()
          ? customerNotes.trim()
          : `Nội thất Cabin lựa chọn: Vách ${cabinSpecs.wall}, Sàn ${cabinSpecs.floor}, Trần ${cabinSpecs.ceiling}, Tay vịn ${cabinSpecs.handrail}.`
      };

      const res = await apiClient.post("/estimates", payload);
      setSavedEstimateId(res.data?.id || null);
      setSubmitSuccess(true);
      setErrorMsg("");
    } catch (err) {
      console.error("Lỗi gửi dự toán:", err);
      let errorDetail = "Gửi dự toán không thành công. Vui lòng kiểm tra lại thông tin.";
      const errData = err.response?.data;
      if (typeof errData === "string") {
        errorDetail = errData;
      } else if (errData?.message) {
        errorDetail = errData.message;
      } else if (errData?.errors) {
        const firstKey = Object.keys(errData.errors)[0];
        if (firstKey && Array.isArray(errData.errors[firstKey]) && errData.errors[firstKey].length > 0) {
          errorDetail = errData.errors[firstKey][0];
        }
      } else if (err.message) {
        errorDetail = err.message;
      }
      setErrorMsg(errorDetail);
      setSubmitSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="estimator-page">
      <SeoHead
        title="Dự Toán Chi Phí & Kích Thước Thang Máy Gia Đình Trực Tuyến | Thang Máy Hà Hồng"
        description="Công cụ tính toán dự toán báo giá thang máy gia đình, thang máy kính homelift online. Tự động tính kích thước hố thang, công suất điện và xuất file báo giá PDF miễn phí."
        keywords="dự toán thang máy, tính giá thang máy gia đình, kích thước hố thang máy, báo giá thang máy homelift, dự toán chi phí thang máy tphcm"
        canonical="https://thangmayhahong.xyz/du-toan"
      />

      {/* Hero Banner */}
      <section
        className="about-banner estimator-banner"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(7, 22, 46, 0.94) 0%, rgba(12, 40, 80, 0.9) 100%), url(${heroImage})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="site-container">
          <nav className="about-breadcrumb" aria-label="breadcrumb">
            <a href="/">Trang chủ</a>
            <span>/</span>
            <span>Dự toán &amp; Cấu hình thang máy</span>
          </nav>
          <span className="section-eyebrow">CÔNG CỤ KỸ THUẬT TRỰC TUYẾN</span>
          <h1>Dự Toán Chi Phí &amp; Kích Thước Thang Máy</h1>
          <p>
            Tùy biến cấu hình thang máy theo hiện trạng công trình của bạn. Hệ thống tự động bóc tách vật tư, tính toán kích thước hố thang và xuất bảng báo giá kỹ thuật PDF tức thì.
          </p>
        </div>
      </section>

      <section className="estimator-content-section py-5">
        <div className="site-container">
          {/* AI Vision Scanner */}
          <AiVisionScanner onApplySpecs={handleApplyVisionSpecs} />

          {visionToast && (
            <div className="alert alert-success d-flex align-items-center justify-content-between mb-4 shadow-sm border border-success">
              <div>
                <i className="bi bi-check-circle-fill fs-5 me-2 text-success"></i>
                <strong>{visionToast}</strong>
              </div>
              <button type="button" className="btn-close" onClick={() => setVisionToast("")}></button>
            </div>
          )}

          <div className="row g-4">
            {/* CỘT BÊN TRÁI: BỘ CHỌN CẤU HÌNH (GỌN GÀNG, SANG TRỌNG) */}
            <div className="col-lg-7">
              {/* Bước 1: Loại công trình */}
              <div className="estimator-step-card estimator-card">
                <div className="estimator-step-header">
                  <div className="step-badge-wrap">
                    <span className="step-badge-num">01</span>
                    <h2 className="step-title-text">Loại công trình của bạn</h2>
                  </div>
                </div>
                <div className="row g-3">
                  {[
                    { id: "nha-pho-xay-moi", icon: "bi-house-add", label: "Nhà phố xây mới", desc: "Hố bê tông hoặc khung thép chuẩn" },
                    { id: "nha-pho-cai-tao", icon: "bi-house-gear", label: "Nhà phố cải tạo", desc: "Pit nông, tối ưu giếng thang hẹp" },
                    { id: "biet-thu", icon: "bi-buildings", label: "Biệt thự / Villa", desc: "Không gian sang trọng, nội thất cao cấp" },
                    { id: "van-phong", icon: "bi-building", label: "Văn phòng / Tòa nhà", desc: "Tần suất cao, vận hành bền bỉ" }
                  ].map((item) => {
                    const isActive = buildingType === item.id;
                    return (
                      <div className="col-sm-6" key={item.id}>
                        <div
                          className={`estimator-choice-card ${isActive ? "active" : ""}`}
                          onClick={() => setBuildingType(item.id)}
                        >
                          <div className="choice-header">
                            <div className="choice-icon-wrap">
                              <i className={`bi ${item.icon}`}></i>
                            </div>
                            {isActive && (
                              <div className="choice-check">
                                <i className="bi bi-check"></i>
                              </div>
                            )}
                          </div>
                          <div className="choice-title">{item.label}</div>
                          <p className="choice-desc">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bước 2: Số tầng & Tải trọng */}
              <div className="estimator-step-card">
                <div className="estimator-step-header">
                  <div className="step-badge-wrap">
                    <span className="step-badge-num">02</span>
                    <h2 className="step-title-text">Số tầng &amp; Tải trọng cabin</h2>
                  </div>
                  <span className="badge bg-warning text-dark fw-bold px-3 py-1.5" style={{ fontSize: "12px" }}>
                    {stops} Tầng ({stops} Điểm dừng)
                  </span>
                </div>

                {/* Chọn số tầng */}
                <div className="mb-4">
                  <label className="form-label fw-bold small text-muted text-uppercase mb-2">
                    Chọn số tầng phục vụ:
                  </label>
                  <div className="floor-pills-grid">
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`floor-pill-btn ${stops === num ? "active" : ""}`}
                        onClick={() => setStops(num)}
                      >
                        {num} Tầng
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chọn tải trọng */}
                <div>
                  <label className="form-label fw-bold small text-muted text-uppercase mb-2">
                    Tải trọng cabin đề xuất:
                  </label>
                  <div className="row g-3">
                    {[
                      { kg: 300, people: "3 - 4 người", desc: "Homelift mini, diện tích giếng từ 1.2m" },
                      { kg: 350, people: "4 - 5 người", desc: "Lựa chọn vàng cho nhà phố gia đình" },
                      { kg: 450, people: "6 người", desc: "Rộng rãi, chở đồ đạc và xe lăn" },
                      { kg: 630, people: "8 - 9 người", desc: "Tải khách, văn phòng, homestay" }
                    ].map((cap) => {
                      const isActive = capacityKg === cap.kg;
                      return (
                        <div className="col-sm-6" key={cap.kg}>
                          <div
                            className={`estimator-choice-card ${isActive ? "active" : ""}`}
                            onClick={() => setCapacityKg(cap.kg)}
                          >
                            <div className="choice-header">
                              <span className="fw-bold fs-5 text-primary">{cap.kg} kg</span>
                              <span className="badge bg-light text-dark border">{cap.people}</span>
                            </div>
                            <p className="choice-desc">{cap.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bước 3: Phong cách Cabin & Kiểu cửa */}
              <div className="estimator-step-card">
                <div className="estimator-step-header">
                  <div className="step-badge-wrap">
                    <span className="step-badge-num">03</span>
                    <h2 className="step-title-text">Phong cách Cabin &amp; Kiểu mở cửa</h2>
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  {[
                    { id: "homelift-kinh", label: "Thang Kính Homelift", badge: "Cao cấp & Sang trọng", desc: "Khung nhôm/thép bọc kính cường lực 4 mặt, pit nông 25-35cm" },
                    { id: "inox-tieu-chuan", label: "Inox 304 Tiêu Chuẩn", badge: "Bền bỉ & Tối ưu", desc: "Inox sọc nhuyễn chống xước phối inox gương, phù hợp mọi nhà" },
                    { id: "inox-guong-vang", label: "Inox Gương Vàng Luxury", badge: "Phong cách Hoàng Gia", desc: "Inox gương vàng khắc hoa văn laser tinh xảo, trần LED cao cấp" }
                  ].map((style) => {
                    const isActive = elevatorType === style.id;
                    return (
                      <div className="col-12" key={style.id}>
                        <div
                          className={`estimator-choice-card ${isActive ? "active" : ""}`}
                          onClick={() => setElevatorType(style.id)}
                        >
                          <div className="choice-header">
                            <strong className="fs-6 text-dark">{style.label}</strong>
                            <span className="badge bg-secondary">{style.badge}</span>
                          </div>
                          <p className="choice-desc">{style.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Kiểu mở cửa */}
                <div className="pt-3 border-top">
                  <label className="form-label fw-bold small text-muted text-uppercase mb-2">
                    Quy cách mở cửa tự động:
                  </label>
                  <div className="door-toggle-grid">
                    <div
                      className={`estimator-choice-card ${doorType === "CO" ? "active" : ""}`}
                      onClick={() => setDoorType("CO")}
                    >
                      <strong className="d-block choice-title">Cửa mở tim (CO)</strong>
                      <small className="text-muted" style={{ fontSize: "11px" }}>2 cánh mở về 2 phía cân đối</small>
                    </div>
                    <div
                      className={`estimator-choice-card ${doorType === "SO" ? "active" : ""}`}
                      onClick={() => setDoorType("SO")}
                    >
                      <strong className="d-block choice-title">Cửa mở lùa (SO)</strong>
                      <small className="text-muted" style={{ fontSize: "11px" }}>2 cánh lùa 1 bên (cho hố hẹp)</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bước 4: Thương hiệu Động cơ */}
              <div className="estimator-step-card">
                <div className="estimator-step-header">
                  <div className="step-badge-wrap">
                    <span className="step-badge-num">04</span>
                    <h2 className="step-title-text">Thương hiệu Động cơ (Không hộp số)</h2>
                  </div>
                </div>

                <div className="row g-3">
                  {[
                    { id: "Fuji", label: "Fuji", origin: "Công nghệ Nhật Bản", desc: "Biến tần đồng bộ, vận hành êm, tiết kiệm điện, chi phí hợp lý nhất." },
                    { id: "Mitsubishi", label: "Mitsubishi", origin: "Thái Lan / Nhật Bản", desc: "Thương hiệu nổi tiếng về độ bền bỉ, êm ái và phụ tùng dễ thay thế." },
                    { id: "Montanari", label: "Montanari", origin: "Nhập khẩu Ý", desc: "Đạt chuẩn Châu Âu khắt khe, không hộp số, vận hành êm tuyệt đối." }
                  ].map((motor) => {
                    const isActive = motorBrand === motor.id;
                    return (
                      <div className="col-md-4" key={motor.id}>
                        <div
                          className={`estimator-choice-card ${isActive ? "active" : ""}`}
                          onClick={() => setMotorBrand(motor.id)}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <strong className="text-primary fs-5">{motor.label}</strong>
                            {isActive && <i className="bi bi-check-circle-fill text-warning"></i>}
                          </div>
                          <span className="badge bg-light text-dark border mb-2 d-inline-block" style={{ fontSize: "11px" }}>
                            {motor.origin}
                          </span>
                          <p className="choice-desc" style={{ fontSize: "12px" }}>{motor.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bước 5: Thông tin khách hàng & Nhận báo giá kỹ thuật (Đưa sang bên trái theo yêu cầu) */}
              <div className="estimator-step-card quote-submit-card" id="quote-form-section">
                <div className="estimator-step-header mb-3">
                  <div className="step-badge-wrap">
                    <span className="step-badge-num">05</span>
                    <div>
                      <h2 className="step-title-text mb-0">Nhận Báo Giá Chi Tiết &amp; Đặt Lịch Đo Laser</h2>
                      <small className="text-muted" style={{ fontSize: "12px" }}>
                        Hệ thống tự động xuất file PDF báo giá kỹ thuật gửi về Gmail và kỹ sư sẽ liên hệ tư vấn khảo sát miễn phí.
                      </small>
                    </div>
                  </div>
                </div>

                {submitSuccess ? (
                  <div className="quote-success-card">
                    <i className="bi bi-check-circle-fill quote-success-icon"></i>
                    <div className="quote-success-title">Gửi Yêu Cầu &amp; Lưu Dự Toán Thành Công!</div>
                    <p className="quote-success-desc">
                      Bảng dự toán kỹ thuật chi tiết đã được gửi tự động tới Gmail <strong>{email}</strong>.
                      Kỹ sư Thang Máy Hà Hồng sẽ liên hệ qua SĐT <strong>{phoneNumber}</strong> trong vòng 15 phút.
                    </p>
                    <button
                      type="button"
                      className="btn-download-pdf-success"
                      onClick={handleDownloadPdf}
                    >
                      <i className="bi bi-download"></i>
                      Tải Ngay Bảng Báo Giá PDF Kỹ Thuật (Có Dấu &amp; Chữ Ký)
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit}>
                    {errorMsg && (
                      <div className="alert alert-danger py-2 mb-3" style={{ fontSize: "12.5px" }}>
                        <i className="bi bi-exclamation-circle-fill me-1"></i> {errorMsg}
                      </div>
                    )}

                    <div className="row g-3">
                      {/* Họ và tên */}
                      <div className="col-12 col-sm-6 form-input-box mb-0">
                        <label className="form-input-label">
                          Họ và tên <span className="text-danger">*</span>
                        </label>
                        <div className="form-input-inner">
                          <i className="bi bi-person-fill form-input-icon"></i>
                          <input
                            type="text"
                            className="form-input-field"
                            placeholder="Họ và tên của bạn"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            required
                            maxLength={100}
                          />
                        </div>
                      </div>

                      {/* Số điện thoại */}
                      <div className="col-12 col-sm-6 form-input-box mb-0">
                        <label className="form-input-label">
                          Số điện thoại (10 số) <span className="text-danger">*</span>
                        </label>
                        <div className="form-input-inner">
                          <i className="bi bi-telephone-fill form-input-icon"></i>
                          <input
                            type="tel"
                            className="form-input-field"
                            placeholder="0912345678"
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            maxLength={10}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            required
                          />
                        </div>
                      </div>

                      {/* Địa chỉ Gmail */}
                      <div className="col-12 col-sm-6 form-input-box mb-0">
                        <label className="form-input-label">
                          Địa chỉ Gmail <span className="text-danger">*</span>
                        </label>
                        <div className="form-input-inner">
                          <i className="bi bi-envelope-fill form-input-icon"></i>
                          <input
                            type="email"
                            className="form-input-field"
                            placeholder="yourname@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            maxLength={150}
                            required
                          />
                        </div>
                      </div>

                      {/* Địa chỉ công trình */}
                      <div className="col-12 col-sm-6 form-input-box mb-0">
                        <label className="form-input-label">Địa chỉ công trình</label>
                        <div className="form-input-inner">
                          <i className="bi bi-geo-alt-fill form-input-icon"></i>
                          <input
                            type="text"
                            className="form-input-field"
                            placeholder="Quận/Huyện, Tỉnh thành"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            maxLength={250}
                          />
                        </div>
                      </div>

                      {/* Ghi chú */}
                      <div className="col-12 form-input-box mb-0">
                        <label className="form-input-label d-flex justify-content-between align-items-center">
                          <span>Ghi chú cấu hình &amp; Yêu cầu riêng</span>
                          <span className="badge bg-primary-subtle text-primary" style={{ fontSize: "10px" }}>Đồng bộ Studio</span>
                        </label>
                        <textarea
                          className="form-input-field"
                          style={{ paddingLeft: "0.85rem", minHeight: "65px" }}
                          rows={2}
                          placeholder="Ghi chú thêm về hiện trạng nhà, phong thủy hoặc mong muốn..."
                          value={customerNotes}
                          onChange={(e) => setCustomerNotes(e.target.value)}
                          maxLength={500}
                        />
                      </div>
                    </div>

                    {/* Nút gửi & xem trước in ấn */}
                    <div className="d-flex flex-column flex-sm-row gap-2 mt-3">
                      <button
                        type="submit"
                        className="btn-quote-submit flex-grow-1"
                        disabled={submitting}
                      >
                        <i className="bi bi-send-fill"></i>
                        <span>{submitting ? "Đang xử lý..." : "LƯU & NHẬN BÁO GIÁ KỸ THUẬT"}</span>
                      </button>

                      <button
                        type="button"
                        className="btn-quote-preview m-0"
                        style={{ minWidth: "170px" }}
                        onClick={handlePrint}
                      >
                        <i className="bi bi-printer me-1"></i>
                        Xem trước &amp; In
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* CỘT BÊN PHẢI: CABIN Ở TRÊN CÙNG, TIẾP ĐẾN BẢNG GIÁ DỰ TOÁN & HOTLINE */}
            <div className="col-lg-5">
              <div className="estimator-sticky-sidebar">

                {/* 1. PHỐI CẢNH CABIN 2.5D (ĐẶT Ở TRÊN CÙNG THEO YÊU CẦU CỦA BẠN) */}
                <div className="mb-4">
                  <CabinVisualizer
                    elevatorType={elevatorType}
                    onChangeElevatorType={setElevatorType}
                    capacityKg={Number(capacityKg)}
                    stops={Number(stops)}
                    doorType={doorType}
                    onChangeDoorType={setDoorType}
                    onApplyConfig={setCabinSpecs}
                    onRequestConsultation={handleCabinConsultation}
                  />
                </div>

                {/* 2. BẢNG DỰ TOÁN GIÁ TIỀN & THÔNG SỐ (GỌN GÀNG, SANG TRỌNG) */}
                <div className="estimator-price-card">
                  <div className="estimator-price-header">
                    <div>
                      <span className="header-badge">DỰ TOÁN CHI PHÍ TRỌN GÓI</span>
                      <h3 className="h5 fw-bold text-white mb-0 mt-1">Thang Máy Hà Hồng</h3>
                    </div>
                    <span className="badge bg-warning text-dark fw-bold">
                      {stops} Tầng • {capacityKg}kg
                    </span>
                  </div>

                  <div className="estimator-price-body">
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border text-warning" role="status"></div>
                        <p className="mt-2 text-muted small">Đang tính toán dự toán mới nhất...</p>
                      </div>
                    ) : (
                      <>
                        {/* Hộp Giá Tiền Nổi Bật */}
                        <div className="price-showcase-box">
                          <div className="price-showcase-label">Khoảng giá dự toán trọn gói tham khảo</div>
                          <div className="price-showcase-val">
                            {formatVnd(result?.estimatedPriceMin)} - {formatVnd(result?.estimatedPriceMax)}
                          </div>
                          <div className="price-showcase-note">
                            <i className="bi bi-shield-check"></i>
                            Đã gồm động cơ, cabin, giếng thang, lắp đặt &amp; kiểm định trọn gói
                          </div>
                        </div>

                        {/* Bóc tách chi phí ước tính */}
                        <div className="cost-breakdown-wrap">
                          <div className="breakdown-title-bar">
                            <i className="bi bi-pie-chart-fill text-warning"></i>
                            BÓC TÁCH CHI PHÍ CẤU THÀNH:
                          </div>
                          <div className="breakdown-items-list">
                            {result?.breakdownItems?.map((item, idx) => (
                              <div className="breakdown-item-row" key={idx}>
                                <div className="breakdown-item-info">
                                  <span className="breakdown-item-name">{item.category}</span>
                                  <span className="breakdown-item-sub">{item.title}</span>
                                </div>
                                <span className="breakdown-item-price">
                                  {formatVnd(item.minPrice)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bảng thông số hố thang đề xuất */}
                        <div className="specs-summary-box">
                          <div className="breakdown-title-bar mb-2">
                            <i className="bi bi-rulers text-warning"></i>
                            THÔNG SỐ GIẾNG THANG ĐỀ XUẤT:
                          </div>
                          <table className="specs-summary-table">
                            <tbody>
                              <tr>
                                <td>Hố lọt lòng (W x D):</td>
                                <td>{result?.shaftWidth} x {result?.shaftDepth} mm</td>
                              </tr>
                              <tr>
                                <td>Kích thước Cabin:</td>
                                <td>{result?.cabinWidth} x {result?.cabinDepth} x 2200 mm</td>
                              </tr>
                              <tr>
                                <td>Hố PIT &amp; Chiều cao OH:</td>
                                <td>Pit: {result?.pitDepth} mm • OH: {result?.overheadHeight} mm</td>
                              </tr>
                              <tr>
                                <td>Nguồn điện:</td>
                                <td>{result?.powerSupply}</td>
                              </tr>
                              <tr>
                                <td>Bảo hành &amp; Bảo trì:</td>
                                <td className="text-success">{result?.warrantyMonths} tháng chính hãng</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Nút hành động nhanh: Chuyển sang form điền thông tin */}
                        <button
                          type="button"
                          className="btn btn-warning w-100 fw-bold text-dark py-2 shadow-sm d-flex align-items-center justify-content-center gap-2 mt-3"
                          style={{ borderRadius: "10px" }}
                          onClick={() => {
                            const el = document.getElementById("quote-form-section");
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                          }}
                        >
                          <i className="bi bi-pencil-square"></i>
                          <span>Điền Thông Tin Nhận Báo Giá Này</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Hotline hỗ trợ */}
                <div className="alert alert-info border-0 shadow-sm d-flex align-items-center rounded-3 p-3">
                  <i className="bi bi-headset fs-2 me-3 text-primary"></i>
                  <div>
                    <strong className="d-block" style={{ fontSize: "13.5px" }}>Cần kỹ sư tư vấn kết cấu trực tiếp?</strong>
                    <small className="text-muted">Hotline kỹ thuật 24/7: </small>
                    <a href={`tel:${soDienThoaiLienKet}`} className="fw-bold text-primary text-decoration-none">
                      {soDienThoaiCongTy}
                    </a>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Printable Quotation Sheet (In ấn PDF) */}
      <div id="print-quotation" ref={printRef} style={{ display: "none" }}>
        <div style={{ padding: "30px", fontFamily: "Arial, sans-serif", color: "#111" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #0b2246", paddingBottom: "15px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img src={logoHaHong} alt="Logo Hà Hồng" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px" }} />
              <div>
                <h2 style={{ margin: "0", color: "#0b2246", fontSize: "20px", fontWeight: "bold" }}>CÔNG TY CỔ PHẦN THANG MÁY HÀ HỒNG</h2>
                <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#555" }}>Chuyên cung cấp, lắp đặt và bảo trì thang máy gia đình Fuji, Mitsubishi chính hãng</p>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#555" }}>Hotline: {soDienThoaiCongTy} | Email: {emailCongTy} | Website: thangmayhahong.xyz</p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "12px", color: "#777" }}>Mã dự toán:</span>
              <div style={{ fontWeight: "bold", fontSize: "14px", color: "#0b2246" }}>HH-{savedEstimateId || "PREVIEW"}</div>
              <div style={{ fontSize: "11px", color: "#777" }}>Ngày: {new Date().toLocaleDateString("vi-VN")}</div>
            </div>
          </div>

          <h3 style={{ textAlign: "center", color: "#0b2246", margin: "0 0 20px", fontSize: "18px", textTransform: "uppercase", letterSpacing: "1px" }}>
            BẢNG DỰ TOÁN CHI PHÍ THIẾT BỊ VÀ THI CÔNG LẮP ĐẶT
          </h3>

          <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "6px", marginBottom: "20px", fontSize: "13px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div><strong>Khách hàng:</strong> {customerName || "Quý khách hàng"}</div>
              <div><strong>Số điện thoại:</strong> {phoneNumber || "Chưa cung cấp"}</div>
              <div><strong>Địa chỉ:</strong> {address || "Chưa cung cấp"}</div>
              <div><strong>Email:</strong> {email || "Chưa cung cấp"}</div>
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px", fontSize: "12.5px" }}>
            <thead>
              <tr style={{ background: "#0b2246", color: "#fff" }}>
                <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Hạng mục cấu hình</th>
                <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Thông số kỹ thuật đề xuất</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>Số tầng / Điểm dừng</td><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>{stops} Tầng ({stops} Stops)</td></tr>
              <tr><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>Tải trọng / Sức chứa</td><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>{capacityKg} kg ({Math.round(capacityKg / 70)} người)</td></tr>
              <tr><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>Dòng thang máy</td><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>{elevatorType === "homelift-kinh" ? "Thang máy kính Homelift Panorama" : (elevatorType === "inox-guong-vang" ? "Cabin Inox Gương Vàng Luxury" : "Inox 304 Tiêu Chuẩn")}</td></tr>
              <tr><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>Nội thất Cabin cấu hình</td><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}><strong>Vách:</strong> {cabinSpecs.wall} | <strong>Sàn:</strong> {cabinSpecs.floor} | <strong>Trần:</strong> {cabinSpecs.ceiling} | <strong>Tay vịn:</strong> {cabinSpecs.handrail}</td></tr>
              <tr><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>Động cơ kéo</td><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>Động cơ không hộp số {motorBrand} {result?.motorPowerKw} kW</td></tr>
              <tr><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>Quy cách cửa tầng</td><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>Cửa mở tự động {doorType === "CO" ? "2 cánh mở tim (2CO)" : "2 cánh lùa 1 bên (2SO)"}</td></tr>
              <tr><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>Kích thước hố thang lọt lòng (W x D)</td><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>{result?.shaftWidth} x {result?.shaftDepth} mm</td></tr>
              <tr><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>Kích thước cabin (W x D x H)</td><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>{result?.cabinWidth} x {result?.cabinDepth} x 2200 mm</td></tr>
              <tr><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>Chiều sâu hố PIT / Chiều cao OH</td><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>Pit: {result?.pitDepth} mm | OH: {result?.overheadHeight} mm</td></tr>
              <tr><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>Thời gian bảo hành</td><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>{result?.warrantyMonths} tháng chính hãng (Bảo trì miễn phí {result?.freeMaintenanceMonths} tháng)</td></tr>
            </tbody>
          </table>

          <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: "6px", padding: "14px", marginBottom: "25px", textAlign: "center" }}>
            <div style={{ fontSize: "13px", color: "#92400e", marginBottom: "4px" }}>TỔNG DỰ TOÁN TRỌN GÓI THAM KHẢO (ĐÃ GỒM ĐỘNG CƠ, CABIN, THI CÔNG &amp; KIỂM ĐỊNH):</div>
            <div style={{ fontSize: "22px", fontWeight: "bold", color: "#0b2246" }}>
              {formatVnd(result?.estimatedPriceMin)} - {formatVnd(result?.estimatedPriceMax)}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px", fontSize: "12px", textAlign: "center" }}>
            <div style={{ width: "200px" }}>
              <div style={{ fontWeight: "bold", marginBottom: "50px" }}>ĐẠI DIỆN KHÁCH HÀNG</div>
              <div>(Ký và ghi rõ họ tên)</div>
            </div>
            <div style={{ width: "220px" }}>
              <div style={{ fontWeight: "bold", marginBottom: "50px" }}>CÔNG TY CP THANG MÁY HÀ HỒNG</div>
              <div style={{ fontWeight: "bold", color: "#0b2246" }}>KỸ SƯ TRƯỞNG DUYỆT</div>
              <div style={{ fontSize: "11px", color: "#666" }}>(Đã ký &amp; đóng dấu số)</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
