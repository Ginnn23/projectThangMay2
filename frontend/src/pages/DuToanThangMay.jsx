import { useEffect, useState, useRef } from "react";
import { apiClient } from "../api/client";
import { soDienThoaiCongTy, soDienThoaiLienKet, emailCongTy } from "../data/contactInfo";
import SeoHead from "../components/SeoHead";
import logoHaHong from "../assets/images/logo-ha-hong.jpg";

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

  // Result state
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [savedEstimateId, setSavedEstimateId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

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
    // Chỉ cho phép nhập số, lọc bỏ chữ cái và ký tự đặc biệt
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
        customerNotes: customerNotes.trim() || null
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
      <section className="about-banner estimator-banner">
        <div className="site-container">
          <nav className="about-breadcrumb" aria-label="breadcrumb">
            <a href="/">Trang chủ</a>
            <span>/</span>
            <span>Dự toán & Cấu hình thang máy</span>
          </nav>
          <span className="section-eyebrow">CÔNG CỤ KỸ THUẬT TRỰC TUYẾN</span>
          <h1>Dự Toán Chi Phí & Kích Thước Thang Máy</h1>
          <p>
            Tùy biến cấu hình thang máy theo hiện trạng công trình của bạn. Hệ thống tự động bóc tách vật tư, tính toán kích thước hố thang và xuất bảng báo giá kỹ thuật PDF tức thì.
          </p>
        </div>
      </section>

      <section className="estimator-content-section py-5">
        <div className="site-container">
          <div className="row g-4">
            {/* Left Column: Interactive Wizard Controls */}
            <div className="col-lg-7">
              <div className="estimator-card p-4 bg-white rounded-3 shadow-sm border mb-4">
                <h2 className="estimator-step-title mb-4">
                  <span className="step-num me-2">1</span>
                  Loại công trình của bạn
                </h2>
                <div className="row g-3">
                  {[
                    { id: "nha-pho-xay-moi", icon: "bi-house-add", label: "Nhà phố xây mới", desc: "Hố bê tông hoặc khung thép chuẩn" },
                    { id: "nha-pho-cai-tao", icon: "bi-house-gear", label: "Nhà phố cải tạo", desc: "Pit nông, tối ưu giếng thang hẹp" },
                    { id: "biet-thu", icon: "bi-buildings", label: "Biệt thự / Villa", desc: "Không gian sang trọng, nội thất cao cấp" },
                    { id: "van-phong", icon: "bi-building", label: "Văn phòng / Tòa nhà", desc: "Tần suất cao, vận hành bền bỉ" }
                  ].map((item) => (
                    <div className="col-sm-6" key={item.id}>
                      <button
                        type="button"
                        className={`estimator-option-btn w-100 text-start p-3 rounded-2 border ${buildingType === item.id ? "active-option" : ""}`}
                        onClick={() => setBuildingType(item.id)}
                      >
                        <div className="d-flex align-items-center mb-1">
                          <i className={`bi ${item.icon} fs-4 me-2 text-primary`}></i>
                          <strong className="fs-6">{item.label}</strong>
                        </div>
                        <small className="text-muted d-block">{item.desc}</small>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: Stops and Capacity */}
              <div className="estimator-card p-4 bg-white rounded-3 shadow-sm border mb-4">
                <h2 className="estimator-step-title mb-4">
                  <span className="step-num me-2">2</span>
                  Số tầng & Tải trọng
                </h2>

                <div className="mb-4">
                  <label className="form-label fw-bold d-flex justify-content-between">
                    <span>Số tầng phục vụ (Số điểm dừng):</span>
                    <span className="badge bg-primary fs-6 px-3">{stops} Tầng ({stops} Stops)</span>
                  </label>
                  <div className="d-flex flex-wrap gap-2 pt-2">
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`btn ${stops === num ? "btn-primary" : "btn-outline-secondary"} px-3 py-2`}
                        onClick={() => setStops(num)}
                      >
                        {num} Tầng
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="form-label fw-bold d-block mb-3">Tải trọng cabin đề xuất:</label>
                  <div className="row g-3">
                    {[
                      { kg: 300, people: "3 - 4 người", desc: "Homelift mini, diện tích giếng từ 1.2m" },
                      { kg: 350, people: "4 - 5 người", desc: "Lựa chọn vàng cho nhà phố gia đình" },
                      { kg: 450, people: "6 người", desc: "Rộng rãi, chở đồ đạc và xe lăn" },
                      { kg: 630, people: "8 - 9 người", desc: "Tải khách, văn phòng, homestay" }
                    ].map((cap) => (
                      <div className="col-sm-6" key={cap.kg}>
                        <button
                          type="button"
                          className={`estimator-option-btn w-100 text-start p-3 rounded-2 border ${capacityKg === cap.kg ? "active-option" : ""}`}
                          onClick={() => setCapacityKg(cap.kg)}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <strong className="text-primary fs-5">{cap.kg} kg</strong>
                            <span className="badge bg-light text-dark border">{cap.people}</span>
                          </div>
                          <small className="text-muted d-block">{cap.desc}</small>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 3: Elevator Type and Style */}
              <div className="estimator-card p-4 bg-white rounded-3 shadow-sm border mb-4">
                <h2 className="estimator-step-title mb-4">
                  <span className="step-num me-2">3</span>
                  Phong cách Cabin & Kết cấu
                </h2>
                <div className="row g-3">
                  {[
                    { id: "homelift-kinh", label: "Thang Kính Homelift", badge: "Cao cấp & Sang trọng", desc: "Khung nhôm/thép bọc kính cường lực 4 mặt, pit nông 25-35cm" },
                    { id: "inox-tieu-chuan", label: "Inox 304 Tiêu Chuẩn", badge: "Bền bỉ & Tối ưu", desc: "Inox sọc nhuyễn chống xước phối inox gương, phù hợp mọi nhà" },
                    { id: "inox-guong-vang", label: "Inox Gương Vàng Luxury", badge: "Phong cách Hoàng Gia", desc: "Inox gương vàng khắc hoa văn laser tinh xảo, trần LED cao cấp" }
                  ].map((style) => (
                    <div className="col-12" key={style.id}>
                      <button
                        type="button"
                        className={`estimator-option-btn w-100 text-start p-3 rounded-2 border ${elevatorType === style.id ? "active-option" : ""}`}
                        onClick={() => setElevatorType(style.id)}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <strong className="fs-6">{style.label}</strong>
                          <span className="badge bg-secondary">{style.badge}</span>
                        </div>
                        <small className="text-muted">{style.desc}</small>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 4: Motor Brand */}
              <div className="estimator-card p-4 bg-white rounded-3 shadow-sm border mb-4">
                <h2 className="estimator-step-title mb-4">
                  <span className="step-num me-2">4</span>
                  Thương hiệu Động cơ (Không hộp số)
                </h2>
                <div className="row g-3">
                  {[
                    { id: "Fuji", label: "Fuji", origin: "Công nghệ Nhật Bản", desc: "Biến tần đồng bộ, vận hành êm, tiết kiệm điện, chi phí hợp lý nhất." },
                    { id: "Mitsubishi", label: "Mitsubishi", origin: "Thái Lan / Nhật Bản", desc: "Thương hiệu nổi tiếng về độ bền bỉ, êm ái và phụ tùng dễ thay thế." },
                    { id: "Montanari", label: "Montanari", origin: "Nhập khẩu nguyên chiếc Ý", desc: "Đạt chuẩn Châu Âu khắt khe, không hộp số, vận hành êm tuyệt đối." }
                  ].map((motor) => (
                    <div className="col-md-4" key={motor.id}>
                      <button
                        type="button"
                        className={`estimator-option-btn w-100 text-start p-3 rounded-2 border h-100 ${motorBrand === motor.id ? "active-option" : ""}`}
                        onClick={() => setMotorBrand(motor.id)}
                      >
                        <strong className="text-primary fs-5 d-block">{motor.label}</strong>
                        <span className="badge bg-light text-dark border mb-2 d-inline-block">{motor.origin}</span>
                        <small className="text-muted d-block" style={{ fontSize: "12px" }}>{motor.desc}</small>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Live Estimates & Blueprint Display */}
            <div className="col-lg-5">
              <div className="estimator-sticky-sidebar">
                {/* Price Display Card */}
                <div className="card shadow-sm border-0 mb-4 overflow-hidden rounded-3">
                  <div className="card-header bg-primary text-white p-3">
                    <span className="text-uppercase tracking-wider fs-7 opacity-75 d-block">DỰ TOÁN CHI PHÍ TRỌN GÓI</span>
                    <h3 className="card-title h4 mb-0 text-white">Thang Máy Hà Hồng</h3>
                  </div>
                  <div className="card-body p-4 bg-light">
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-2 text-muted">Đang cập nhật tính toán...</p>
                      </div>
                    ) : (
                      <>
                        <div className="price-highlight-box p-3 bg-white rounded-3 border text-center mb-4">
                          <small className="text-muted d-block mb-1">Khoảng giá dự toán tham khảo ({stops} tầng):</small>
                          <div className="fs-3 fw-bold text-danger">
                            {formatVnd(result?.estimatedPriceMin)} - {formatVnd(result?.estimatedPriceMax)}
                          </div>
                          <small className="text-success d-block mt-1">
                            <i className="bi bi-shield-check me-1"></i>
                            Đã bao gồm động cơ, cabin, kiểm định nhà nước & lắp đặt trọn gói
                          </small>
                        </div>

                        {/* Breakdown accordion */}
                        <div className="cost-breakdown mb-4">
                          <h6 className="fw-bold mb-3 text-secondary text-uppercase fs-7">Bóc tách chi phí ước tính:</h6>
                          <div className="list-group list-group-flush border rounded-2 bg-white">
                            {result?.breakdownItems?.map((item, idx) => (
                              <div className="list-group-item p-3" key={idx}>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <strong className="fs-6">{item.category}</strong>
                                  <span className="badge bg-primary-subtle text-primary">
                                    {formatVnd(item.minPrice)}
                                  </span>
                                </div>
                                <small className="text-muted d-block">{item.title}</small>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Blueprint technical specifications */}
                        <div className="specs-box bg-white p-3 rounded-2 border mb-4">
                          <h6 className="fw-bold mb-3 text-secondary text-uppercase fs-7">
                            <i className="bi bi-rulers me-2"></i>
                            Thông số giếng thang đề xuất:
                          </h6>
                          <div className="table-responsive">
                            <table className="table table-sm table-borderless mb-0" style={{ fontSize: "13px" }}>
                              <tbody>
                                <tr>
                                  <td className="text-muted">Kích thước lọt lòng hố (W x D):</td>
                                  <td className="text-end fw-bold text-primary">{result?.shaftWidth} x {result?.shaftDepth} mm</td>
                                </tr>
                                <tr>
                                  <td className="text-muted">Kích thước cabin (W x D x H):</td>
                                  <td className="text-end fw-bold">{result?.cabinWidth} x {result?.cabinDepth} x 2200 mm</td>
                                </tr>
                                <tr>
                                  <td className="text-muted">Chiều sâu hố PIT yêu cầu:</td>
                                  <td className="text-end fw-bold">{result?.pitDepth} mm</td>
                                </tr>
                                <tr>
                                  <td className="text-muted">Chiều cao tầng trên cùng (OH):</td>
                                  <td className="text-end fw-bold">{result?.overheadHeight} mm</td>
                                </tr>
                                <tr>
                                  <td className="text-muted">Cửa tầng tự động (W x H):</td>
                                  <td className="text-end fw-bold">{result?.doorWidth} x 2100 mm</td>
                                </tr>
                                <tr>
                                  <td className="text-muted">Nguồn điện yêu cầu:</td>
                                  <td className="text-end fw-bold">{result?.powerSupply}</td>
                                </tr>
                                <tr>
                                  <td className="text-muted">Thời gian bảo hành:</td>
                                  <td className="text-end fw-bold text-success">{result?.warrantyMonths} tháng chính hãng</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Customer Info Form for PDF & Survey */}
                    <div className="quote-form-card p-3 bg-white rounded-2 border">
                      <h6 className="fw-bold mb-2">Nhận Bảng Báo Giá Chi Tiết (PDF)</h6>
                      <p className="text-muted mb-3" style={{ fontSize: "13px" }}>
                        Điền thông tin để xuất file PDF in ấn có đóng dấu kỹ thuật hoặc nhận khảo sát công trình tận nơi miễn phí.
                      </p>

                      {submitSuccess ? (
                        <div className="alert alert-success py-3 text-center mb-0">
                          <i className="bi bi-check-circle-fill fs-3 d-block mb-1 text-success"></i>
                          <strong>Gửi thông tin thành công!</strong>
                          <p className="mb-2" style={{ fontSize: "13px" }}>
                            Kỹ sư Thang Máy Hà Hồng sẽ liên hệ qua SĐT <strong>{phoneNumber}</strong> và gửi bảng dự toán qua Gmail <strong>{email}</strong> trong vòng 15 phút.
                          </p>
                          <button
                            type="button"
                            className="btn btn-outline-success btn-sm w-100"
                            onClick={handlePrint}
                          >
                            <i className="bi bi-printer me-2"></i>
                            In / Tải file Báo Giá PDF ngay
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleFormSubmit}>
                          {errorMsg && <div className="alert alert-danger py-2 mb-2" style={{ fontSize: "12px" }}>{errorMsg}</div>}
                          <div className="mb-2">
                            <label className="form-label mb-1" style={{ fontSize: "12px", fontWeight: "600" }}>
                              Họ và tên của bạn <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Họ và tên của bạn *"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              required
                              maxLength={100}
                            />
                          </div>
                          <div className="mb-2">
                            <label className="form-label mb-1" style={{ fontSize: "12px", fontWeight: "600" }}>
                              Số điện thoại (đúng 10 chữ số) <span className="text-danger">*</span>
                            </label>
                            <input
                              type="tel"
                              className="form-control form-control-sm"
                              placeholder="Số điện thoại (10 chữ số, chỉ nhập số) *"
                              value={phoneNumber}
                              onChange={handlePhoneChange}
                              maxLength={10}
                              inputMode="numeric"
                              pattern="[0-9]*"
                              required
                            />
                            <small className="text-muted" style={{ fontSize: "11px" }}>Chỉ nhập 10 chữ số, bắt đầu bằng số 0 (VD: 0912345678)</small>
                          </div>
                          <div className="mb-2">
                            <label className="form-label mb-1" style={{ fontSize: "12px", fontWeight: "600" }}>
                              Địa chỉ Gmail <span className="text-danger">*</span>
                            </label>
                            <input
                              type="email"
                              className="form-control form-control-sm"
                              placeholder="Địa chỉ Gmail (VD: example@gmail.com) *"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              maxLength={150}
                              required
                            />
                            <small className="text-muted" style={{ fontSize: "11px" }}>Bắt buộc phải có đuôi @gmail.com để nhận file báo giá</small>
                          </div>
                          <div className="mb-2">
                            <label className="form-label mb-1" style={{ fontSize: "12px", fontWeight: "600" }}>
                              Địa chỉ công trình
                            </label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Địa chỉ công trình (Quận/Huyện, Tỉnh thành)"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              maxLength={250}
                            />
                          </div>

                          <div className="d-grid gap-2 pt-2">
                            <button
                              type="submit"
                              className="btn btn-primary fw-bold"
                              disabled={submitting}
                            >
                              {submitting ? "Đang xử lý..." : "Lưu & Nhận Báo Giá Kỹ Thuật"}
                              <i className="bi bi-arrow-right ms-2"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={handlePrint}
                            >
                              <i className="bi bi-file-earmark-pdf me-2 text-danger"></i>
                              Xem trước & Tải file PDF
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                </div>

                <div className="alert alert-info border-0 shadow-sm d-flex align-items-center">
                  <i className="bi bi-headset fs-2 me-3 text-primary"></i>
                  <div>
                    <strong className="d-block">Cần kỹ sư tư vấn kết cấu trực tiếp?</strong>
                    <small className="text-muted">Hotline 24/7: </small>
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

      {/* Printable Quotation Template (Active only during print/PDF generation) */}
      <div id="print-quotation" className="d-none d-print-block" ref={printRef}>
        <div style={{ padding: "40px", fontFamily: "Arial, sans-serif", color: "#111", maxWidth: "800px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #0056b3", paddingBottom: "15px", marginBottom: "25px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <img src={logoHaHong} alt="Logo" style={{ height: "65px", borderRadius: "6px" }} />
              <div>
                <h2 style={{ margin: "0", color: "#0056b3", fontSize: "20px", textTransform: "uppercase" }}>CÔNG TY TNHH THANG MÁY HÀ HỒNG</h2>
                <small style={{ color: "#555" }}>Chuyên Gia Thang Máy Gia Đình & Dịch Vụ Kỹ Thuật TPHCM</small><br />
                <small style={{ color: "#555" }}>Hotline: {soDienThoaiCongTy} | Email: {emailCongTy} | Web: thangmayhahong.xyz</small>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <strong style={{ color: "#d9534f", fontSize: "16px" }}>BẢNG DỰ TOÁN BÁO GIÁ</strong><br />
              <small style={{ color: "#777" }}>Mã: HH-{savedEstimateId || Date.now().toString().slice(-6)}</small><br />
              <small style={{ color: "#777" }}>Ngày: {new Date().toLocaleDateString("vi-VN")}</small>
            </div>
          </div>

          {/* Customer info */}
          <div style={{ backgroundColor: "#f9f9f9", padding: "12px 18px", borderRadius: "6px", marginBottom: "20px", border: "1px solid #eee" }}>
            <table style={{ width: "100%", fontSize: "14px" }}>
              <tbody>
                <tr>
                  <td style={{ width: "18%", color: "#666" }}>Kính gửi:</td>
                  <td style={{ width: "32%" }}><strong>{customerName || "Quý khách hàng"}</strong></td>
                  <td style={{ width: "18%", color: "#666" }}>Số điện thoại:</td>
                  <td style={{ width: "32%" }}><strong>{phoneNumber || "---"}</strong></td>
                </tr>
                <tr>
                  <td style={{ color: "#666" }}>Địa chỉ Gmail:</td>
                  <td><strong>{email || "---"}</strong></td>
                  <td style={{ color: "#666" }}>Địa chỉ công trình:</td>
                  <td>{address || "TP. Hồ Chí Minh"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Specs Summary */}
          <h3 style={{ fontSize: "16px", color: "#0056b3", borderLeft: "4px solid #0056b3", paddingLeft: "8px", margin: "15px 0 10px" }}>
            I. THÔNG SỐ KỸ THUẬT CƠ BẢN
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginBottom: "20px" }}>
            <thead>
              <tr style={{ backgroundColor: "#0056b3", color: "#fff" }}>
                <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Hạng mục</th>
                <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Thông số kỹ thuật đề xuất</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>Số tầng phục vụ</td><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}><strong>{stops} Điểm dừng (Stops)</strong></td></tr>
              <tr><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>Tải trọng định mức</td><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}><strong>{capacityKg} kg</strong> (Khoảng 4 - 6 người)</td></tr>
              <tr><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>Dòng thang máy</td><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>{elevatorType === "homelift-kinh" ? "Thang máy kính Homelift Panorama" : (elevatorType === "inox-guong-vang" ? "Cabin Inox Gương Vàng Luxury" : "Inox 304 Tiêu Chuẩn")}</td></tr>
              <tr><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>Động cơ chính</td><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}><strong>{motorBrand}</strong> {result?.motorPowerKw}kW (Không hộp số tiết kiệm điện)</td></tr>
              <tr><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>Kích thước giếng thang (W x D)</td><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>{result?.shaftWidth} x {result?.shaftDepth} mm</td></tr>
              <tr><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>Kích thước cabin (W x D x H)</td><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>{result?.cabinWidth} x {result?.cabinDepth} x 2200 mm</td></tr>
              <tr><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>Chiều sâu hố PIT / Chiều cao OH</td><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>PIT: {result?.pitDepth} mm | OH: {result?.overheadHeight} mm</td></tr>
              <tr><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>Nguồn điện yêu cầu</td><td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>{result?.powerSupply}</td></tr>
            </tbody>
          </table>

          {/* Pricing Table */}
          <h3 style={{ fontSize: "16px", color: "#0056b3", borderLeft: "4px solid #0056b3", paddingLeft: "8px", margin: "15px 0 10px" }}>
            II. BẢNG BÓC TÁCH DỰ TOÁN CHI PHÍ TRỌN GÓI
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginBottom: "20px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", width: "40px" }}>STT</th>
                <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Nội dung công việc / Thiết bị</th>
                <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right", width: "180px" }}>Khoảng giá dự toán (VNĐ)</th>
              </tr>
            </thead>
            <tbody>
              {result?.breakdownItems?.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ border: "1px solid #ddd", padding: "6px 8px", textAlign: "center" }}>{idx + 1}</td>
                  <td style={{ border: "1px solid #ddd", padding: "6px 8px" }}>
                    <strong>{item.category}:</strong> {item.title}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "6px 8px", textAlign: "right" }}>
                    {formatVnd(item.minPrice)}
                  </td>
                </tr>
              ))}
              <tr style={{ backgroundColor: "#eef6ff", fontWeight: "bold" }}>
                <td colSpan="2" style={{ border: "1px solid #ddd", padding: "10px 8px", textAlign: "right", fontSize: "14px" }}>
                  TỔNG GIÁ TRỊ DỰ TOÁN TRỌN GÓI:
                </td>
                <td style={{ border: "1px solid #ddd", padding: "10px 8px", textAlign: "right", fontSize: "15px", color: "#d9534f" }}>
                  {formatVnd(result?.estimatedPriceMin)} - {formatVnd(result?.estimatedPriceMax)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Terms & Warranty */}
          <div style={{ fontSize: "12px", color: "#555", marginTop: "15px", lineHeight: "1.6" }}>
            <strong>Chính sách cam kết của Thang Máy Hà Hồng:</strong><br />
            • Bảo hành toàn bộ thiết bị chính hãng: <strong>{result?.warrantyMonths} tháng</strong>.<br />
            • Tặng gói dịch vụ bảo trì định kỳ miễn phí: <strong>{result?.freeMaintenanceMonths} tháng</strong>.<br />
            • Cứu hộ kỹ thuật khẩn cấp 24/7 có mặt xử lý trong 30 - 60 phút tại khu vực TPHCM.<br />
            • Đã bao gồm trọn gói: Hồ sơ thiết kế kỹ thuật, kiểm định an toàn của cơ quan Nhà nước và bảo hiểm công trình.
          </div>

          {/* Signature block */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px", textAlign: "center", fontSize: "13px" }}>
            <div>
              <strong>ĐẠI DIỆN KHÁCH HÀNG</strong><br />
              <small style={{ color: "#777" }}>(Ký và ghi rõ họ tên)</small>
            </div>
            <div>
              <strong>CÔNG TY TNHH THANG MÁY HÀ HỒNG</strong><br />
              <small style={{ color: "#777" }}>(Đã duyệt dự toán kỹ thuật)</small>
              <div style={{ marginTop: "45px", color: "#d9534f", fontWeight: "bold" }}>
                [HÀ HỒNG ELEVATOR]
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
