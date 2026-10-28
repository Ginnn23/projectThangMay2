import { Link } from "react-router-dom";
import SeoHead from "../components/SeoHead";
import heroImage from "../assets/images/hero-elevator.jpg";
import lobbyImage from "../assets/images/elevator-lobby.jpg";
import hotelLobbyImage from "../assets/images/elevator-hotel-lobby.jpg";
import {
  tenCongTy,
  tenQuocTe,
  maSoThue,
  ngayThanhLap,
  nguoiDaiDien,
  diaChiDangKy,
  diaChiVPGD,
  soDienThoaiCongTy,
  soDienThoaiLienKet,
  emailCongTy,
  googleMapsUrl,
} from "../data/contactInfo";
import "./GioiThieu.css";

/* =====================================================================
   DỮ LIỆU THỰC TẾ CÔNG TY (tra từ CSDL doanh nghiệp quốc gia)
   ===================================================================== */

const thongKeCongTy = [
  {
    icon: "bi-calendar2-check-fill",
    num: "2016",
    title: "Năm thành lập",
    desc: "Giấy CNĐKKD cấp ngày 11/07/2016 bởi Sở KH&ĐT TP.HCM"
  },
  {
    icon: "bi-buildings-fill",
    num: "500+",
    title: "Công trình hoàn thiện",
    desc: "Nhà phố, biệt thự, homelift kính tại TP.HCM & miền Nam"
  },
  {
    icon: "bi-shield-fill-check",
    num: "100%",
    title: "Linh kiện chính hãng",
    desc: "CO/CQ minh bạch, nhập khẩu trực tiếp từ nhà sản xuất"
  },
  {
    icon: "bi-clock-fill",
    num: "24/7",
    title: "Hỗ trợ kỹ thuật",
    desc: "Đội kỹ thuật túc trực hỗ trợ sự cố và bảo trì xuyên ngày đêm"
  }
];

const thongTinPhapLy = [
  { label: "Tên đầy đủ", value: tenCongTy },
  { label: "Tên quốc tế", value: tenQuocTe },
  { label: "Mã số thuế", value: maSoThue },
  { label: "Ngày thành lập", value: ngayThanhLap },
  { label: "Người đại diện", value: nguoiDaiDien },
  { label: "Địa chỉ ĐKKD", value: diaChiDangKy },
  { label: "Văn phòng giao dịch", value: diaChiVPGD },
  { label: "Hotline", value: soDienThoaiCongTy },
  { label: "Email", value: emailCongTy },
];

const giaTriCotLoi = [
  {
    icon: "bi-shield-shaded",
    title: "An Toàn Là Ưu Tiên Số 1",
    desc: "Mọi công trình đều được kiểm định bởi Trung tâm Kiểm định Kỹ thuật An toàn Khu vực II. Trang bị đầy đủ phanh cơ học chống rơi, ARD cứu hộ tự động khi mất điện, rèm quang học chống kẹt cửa."
  },
  {
    icon: "bi-cpu-fill",
    title: "Kỹ Thuật Chính Xác",
    desc: "Đội ngũ kỹ sư cơ điện lắp đặt ray dẫn hướng sai số dưới 0.5mm. Căn chỉnh cabin, đo tải và hiệu chỉnh dừng tầng chính xác trước khi nghiệm thu bàn giao."
  },
  {
    icon: "bi-gem",
    title: "Đa Dạng Giải Pháp",
    desc: "Từ thang máy gia đình hố PIT nông chỉ 300mm, homelift kính Panorama toàn cảnh, đến thang máy tải hàng và thang bệnh viện. Tư vấn phù hợp ngân sách và hiện trạng từng công trình."
  },
  {
    icon: "bi-heart-fill",
    title: "Tận Tâm Hậu Mãi",
    desc: "Bảo hành 24 tháng toàn hệ thống, bảo trì định kỳ miễn phí 18 tháng đầu. Hotline kỹ thuật 24/7 – kỹ thuật viên có mặt xử lý sự cố trong vòng 60 phút tại nội thành TP.HCM."
  }
];

const danhMucDichVu = [
  {
    icon: "bi-house-add-fill",
    title: "Thang Máy Gia Đình & Homelift",
    desc: "Thiết kế tối ưu cho nhà phố xây mới và cải tạo. Hố PIT nông từ 300mm, không cần phòng máy (MRL), tiết kiệm tối đa diện tích sàn."
  },
  {
    icon: "bi-eye-fill",
    title: "Thang Kính Panorama Toàn Cảnh",
    desc: "Cabin kính cường lực 2 lớp toàn cảnh, khung Inox PVD Gold/Black. Tạo điểm nhấn kiến trúc vượt trội cho nhà ở cao cấp và biệt thự."
  },
  {
    icon: "bi-building",
    title: "Thang Máy Tải Khách Thương Mại",
    desc: "Giải pháp cho văn phòng, tòa nhà, khách sạn. Tần suất vận hành cao, cabin inox bền bỉ, hệ điều khiển phân tầng tối ưu chờ đợi."
  },
  {
    icon: "bi-truck",
    title: "Thang Tải Hàng & Thực Phẩm",
    desc: "Tải trọng 500kg - 5.000kg theo yêu cầu. Đáp ứng kho xưởng, nhà hàng, siêu thị và bệnh viện. Chứng nhận an toàn kiểm định nhà nước."
  },
  {
    icon: "bi-wrench-adjustable-circle",
    title: "Bảo Trì & Sửa Chữa Định Kỳ",
    desc: "Kiểm tra, vệ sinh và tra dầu định kỳ 1 - 2 tháng/lần. Phát hiện sớm hao mòn linh kiện, đảm bảo thang vận hành ổn định lâu dài."
  },
  {
    icon: "bi-arrow-repeat",
    title: "Cải Tạo & Nâng Cấp Thang Cũ",
    desc: "Thay động cơ, hệ điều khiển và nâng cấp nội thất cabin cho thang máy đang sử dụng. Kéo dài tuổi thọ thiết bị, tiết kiệm chi phí đầu tư mới."
  }
];

const quyTrinhSauBuoc = [
  {
    num: "01",
    title: "Tiếp Nhận & Khảo Sát",
    desc: "Kỹ sư đến tận nơi đo đạc hố thang, đánh giá kết cấu, nguồn điện và hiện trạng công trình hoàn toàn miễn phí."
  },
  {
    num: "02",
    title: "Tư Vấn & Lên Phương Án",
    desc: "Đề xuất phương án kỹ thuật phù hợp ngân sách, thiết kế bản vẽ 2D/3D cấu hình thang máy theo yêu cầu thực tế."
  },
  {
    num: "03",
    title: "Báo Giá & Ký Hợp Đồng",
    desc: "Báo giá chi tiết, minh bạch từng hạng mục. Hợp đồng quy định rõ tiến độ, tiêu chuẩn kỹ thuật và chính sách bảo hành."
  },
  {
    num: "04",
    title: "Thi Công Lắp Đặt",
    desc: "Đội thợ chuyên nghiệp lắp dựng ray, kéo cáp, thả cabin và đấu nối hệ điều khiển theo quy trình kiểm soát chất lượng nghiêm ngặt."
  },
  {
    num: "05",
    title: "Kiểm Định & Nghiệm Thu",
    desc: "Phối hợp với Trung tâm Kiểm định Kỹ thuật An toàn thử tải, thử phanh và cấp tem an toàn trước khi đưa vào sử dụng."
  },
  {
    num: "06",
    title: "Bàn Giao & Bảo Hành",
    desc: "Hướng dẫn vận hành, bàn giao toàn bộ hồ sơ kỹ thuật. Kích hoạt chế độ bảo hành 24 tháng và bảo trì định kỳ theo hợp đồng."
  }
];

export default function GioiThieu() {
  const companySchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://thangmayhahong.xyz/#organization",
    name: tenCongTy,
    alternateName: "Thang Máy Hà Hồng",
    legalName: tenCongTy,
    url: "https://thangmayhahong.xyz",
    logo: "https://thangmayhahong.xyz/logo-ha-hong.jpg",
    foundingDate: "2016-07-11",
    taxID: maSoThue,
    description:
      "Công ty Cổ phần Thương mại Dịch vụ Thang máy Hà Hồng (MST: 0313908417) chuyên tư vấn, thiết kế, lắp đặt thang máy gia đình, thang máy kính homelift, thang tải hàng và bảo trì sửa chữa 24/7 tại TP.HCM.",
    telephone: "+84909933358",
    email: emailCongTy,
    address: {
      "@type": "PostalAddress",
      streetAddress: "100 Tân Sơn, Phường 15",
      addressLocality: "Quận Tân Bình",
      addressRegion: "TP. Hồ Chí Minh",
      addressCountry: "VN"
    },
    priceRange: "280.000.000 VNĐ - 850.000.000 VNĐ",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
        opens: "08:00",
        closes: "17:30"
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: "https://thangmayhahong.xyz/" },
      { "@type": "ListItem", position: 2, name: "Giới thiệu", item: "https://thangmayhahong.xyz/gioi-thieu" }
    ]
  };

  return (
    <main className="about-page-wrap">
      <SeoHead
        title="Giới Thiệu Công Ty Cổ Phần Thương Mại Dịch Vụ Thang Máy Hà Hồng | MST 0313908417"
        description="Thang Máy Hà Hồng (MST: 0313908417) thành lập 11/07/2016 tại TP.HCM. Chuyên tư vấn, lắp đặt thang máy gia đình, homelift kính, thang tải hàng và bảo trì 24/7. Đại diện pháp lý: Ông Vũ Tuyên Khôi."
        keywords="giới thiệu thang máy hà hồng, công ty cổ phần thương mại dịch vụ thang máy hà hồng, mã số thuế 0313908417, ha hong lift trading service corporation, thang máy tphcm"
        canonical="https://thangmayhahong.xyz/gioi-thieu"
        jsonLd={[companySchema, breadcrumbSchema]}
      />

      {/* ── 1. HERO BANNER ── */}
      <section
        className="about-banner"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(5,14,28,0.95), rgba(5,14,28,0.68)), url(${heroImage})`,
          backgroundPosition: "center",
          backgroundSize: "cover"
        }}
      >
        <div className="site-container">
          <nav className="about-breadcrumb" aria-label="breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span>Giới thiệu công ty</span>
          </nav>
          <span className="section-eyebrow">VỀ CHÚNG TÔI</span>
          <h1>Công Ty Cổ Phần Thương Mại Dịch Vụ Thang Máy Hà Hồng</h1>
          <p>
            Thành lập từ năm 2016 tại TP. Hồ Chí Minh — Đồng hành cùng hàng trăm công trình nhà phố, biệt thự và tòa nhà thương mại trên toàn miền Nam với giải pháp thang máy an toàn, bền vững và thẩm mỹ.
          </p>
        </div>
      </section>

      {/* ── 2. STATS STRIP ── */}
      <section className="about-stats-strip">
        <div className="site-container">
          <div className="row g-3">
            {thongKeCongTy.map((stat, idx) => (
              <div className="col-6 col-lg-3" key={idx}>
                <div className="about-stat-item">
                  <div className="about-stat-icon">
                    <i className={`bi ${stat.icon}`}></i>
                  </div>
                  <div className="about-stat-content">
                    <h3>{stat.num}</h3>
                    <p>{stat.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. THÔNG TIN PHÁP LÝ & CÂU CHUYỆN CÔNG TY ── */}
      <section className="about-story-section">
        <div className="site-container">
          <div className="row align-items-stretch g-5">

            {/* CỘT TRÁI – Giới thiệu tự sự */}
            <div className="col-lg-7">
              <div className="about-section-header">
                <span className="about-tag-eyebrow">
                  <i className="bi bi-building-fill-check"></i> GIỚI THIỆU DOANH NGHIỆP
                </span>
                <h2 className="about-section-heading">
                  Hành Trình Xây Dựng Niềm Tin Từ Chất Lượng &amp; Tận Tâm
                </h2>
              </div>

              <div className="about-story-card">
                <p className="about-story-lead">
                  Được thành lập chính thức vào ngày <strong>11/07/2016</strong> với Giấy chứng nhận đăng ký doanh nghiệp tại Sở Kế hoạch &amp; Đầu tư TP. Hồ Chí Minh, <strong>Công ty Cổ phần Thương mại Dịch vụ Thang máy Hà Hồng</strong> (tên quốc tế: <em>HA HONG LIFT TRADING - SERVICE CORPORATION</em>) ra đời từ khát vọng mang đến những giải pháp thang máy an toàn, minh bạch và phù hợp với từng ngôi nhà Việt.
                </p>
                <p className="about-story-text">
                  Trải qua gần một thập kỷ hoạt động, công ty đã phát triển từ một đơn vị nhỏ chuyên bảo trì sửa chữa thành một nhà thầu thi công thang máy uy tín tại khu vực TP.HCM và các tỉnh thành miền Nam. Chúng tôi tự hào đã hoàn thiện hàng trăm công trình từ nhà phố hẹp, biệt thự cao cấp cho đến tòa nhà văn phòng và cơ sở y tế.
                </p>
                <p className="about-story-text">
                  Dưới sự lãnh đạo của người đại diện pháp luật <strong>Ông Vũ Tuyên Khôi</strong>, Hà Hồng kiên định xây dựng văn hóa doanh nghiệp đặt <em>an toàn kỹ thuật</em> và <em>sự hài lòng của khách hàng</em> làm trọng tâm trong mọi quyết định kinh doanh.
                </p>

                <div className="about-story-features">
                  <div className="about-story-feat-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Kiểm định nhà nước theo TCVN 6395</span>
                  </div>
                  <div className="about-story-feat-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Hợp đồng minh bạch, rõ ràng từng hạng mục</span>
                  </div>
                  <div className="about-story-feat-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Linh kiện nhập khẩu CO/CQ gốc</span>
                  </div>
                  <div className="about-story-feat-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Đội kỹ thuật hơn 10 năm kinh nghiệm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI – Bảng thông tin pháp lý */}
            <div className="col-lg-5">
              <div className="about-legal-card">
                <div className="about-legal-header">
                  <i className="bi bi-patch-check-fill"></i>
                  <h3>Thông Tin Doanh Nghiệp</h3>
                </div>
                <ul className="about-legal-list">
                  {thongTinPhapLy.map((item, idx) => (
                    <li key={idx}>
                      <span className="about-legal-label">{item.label}</span>
                      <span className="about-legal-value">{item.value}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="about-map-btn"
                >
                  <i className="bi bi-geo-alt-fill"></i>
                  Xem vị trí trên Google Maps
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. GIÁ TRỊ CỐT LÕI ── */}
      <section className="about-values-grid-section">
        <div className="site-container">
          <div className="about-section-header text-center">
            <span className="about-tag-eyebrow">
              <i className="bi bi-compass-fill"></i> TÔN CHỈ HOẠT ĐỘNG
            </span>
            <h2 className="about-section-heading">Giá Trị Cốt Lõi Của Hà Hồng</h2>
            <p className="about-section-desc">
              Bốn cam kết nền tảng dẫn dắt mọi hành động của đội ngũ Thang Máy Hà Hồng từ ngày đầu thành lập cho đến hôm nay.
            </p>
          </div>
          <div className="row g-4">
            {giaTriCotLoi.map((val, idx) => (
              <div className="col-md-6 col-lg-3" key={idx}>
                <div className="about-pillar-card">
                  <div className="about-pillar-icon">
                    <i className={`bi ${val.icon}`}></i>
                  </div>
                  <h3>{val.title}</h3>
                  <p>{val.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. DANH MỤC DỊCH VỤ ── */}
      <section className="about-services-section-new">
        <div className="site-container">
          <div className="about-section-header text-center">
            <span className="about-tag-eyebrow">
              <i className="bi bi-grid-fill"></i> LĨNH VỰC HOẠT ĐỘNG
            </span>
            <h2 className="about-section-heading">Các Dịch Vụ Của Hà Hồng</h2>
            <p className="about-section-desc">
              Giải pháp thang máy toàn diện — từ thiết kế, thi công đến bảo trì — cho mọi loại công trình và ngân sách.
            </p>
          </div>
          <div className="row g-4">
            {danhMucDichVu.map((sv, idx) => (
              <div className="col-md-6 col-lg-4" key={idx}>
                <article className="about-service-item">
                  <div className="about-service-icon-wrap">
                    <i className={`bi ${sv.icon}`}></i>
                  </div>
                  <h3>{sv.title}</h3>
                  <p>{sv.desc}</p>
                  <Link to="/lien-he" className="about-service-link">
                    Tư vấn miễn phí <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. QUY TRÌNH 6 BƯỚC ── */}
      <section className="about-process-grid-section">
        <div className="site-container">
          <div className="about-section-header text-center">
            <span className="about-tag-eyebrow">
              <i className="bi bi-gear-wide-connected"></i> QUY TRÌNH LÀM VIỆC
            </span>
            <h2 className="about-section-heading">6 Bước Đồng Hành Cùng Khách Hàng</h2>
            <p className="about-section-desc">
              Từ cuộc khảo sát đầu tiên đến khi bàn giao chìa khóa — mọi bước đều được kiểm soát chặt chẽ và minh bạch.
            </p>
          </div>
          <div className="row g-4">
            {quyTrinhSauBuoc.map((step, idx) => (
              <div className="col-md-6 col-lg-4" key={idx}>
                <div className="about-workflow-card">
                  <div className="about-workflow-num">{step.num}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. CAM KẾT BẢO HÀNH ── */}
      <section className="about-commitment-badge-section">
        <div className="site-container">
          <div className="about-section-header text-center">
            <span className="about-tag-eyebrow">
              <i className="bi bi-award-fill"></i> CAM KẾT CHẤT LƯỢNG
            </span>
            <h2 className="about-section-heading">Chính Sách Bảo Hành &amp; Hậu Mãi</h2>
          </div>
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="about-commit-card">
                <div className="about-commit-icon">
                  <i className="bi bi-shield-check"></i>
                </div>
                <div className="about-commit-content">
                  <h3>Bảo Hành 24 Tháng</h3>
                  <p>Bảo hành toàn hệ thống cơ điện — động cơ, biến tần, tủ điện điều khiển và toàn bộ linh kiện chính hãng. Đổi mới miễn phí nếu có lỗi sản xuất.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="about-commit-card">
                <div className="about-commit-icon">
                  <i className="bi bi-tools"></i>
                </div>
                <div className="about-commit-content">
                  <h3>Bảo Trì Định Kỳ Miễn Phí</h3>
                  <p>Kiểm tra, vệ sinh và bôi trơn định kỳ 1–2 tháng/lần trong 18 tháng đầu sau bàn giao. Phát hiện sớm hao mòn, giữ thang luôn êm ái như mới.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="about-commit-card">
                <div className="about-commit-icon">
                  <i className="bi bi-telephone-inbound-fill"></i>
                </div>
                <div className="about-commit-content">
                  <h3>Cứu Hộ Khẩn Cấp 24/7</h3>
                  <p>Hotline kỹ thuật trực 24 giờ, 7 ngày, kể cả ngày lễ Tết. Kỹ thuật viên có mặt xử lý sự cố trong 30–60 phút tại các quận nội thành TP.HCM.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. CTA ── */}
      <section className="about-cta-container">
        <div className="site-container">
          <div className="about-cta-box">
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <span className="about-tag-eyebrow" style={{ background: "rgba(217,164,65,0.25)", color: "#facc15" }}>
                  <i className="bi bi-headset"></i> TƯ VẤN MIỄN PHÍ
                </span>
                <h2>Bạn Đang Cần Lắp Đặt Hoặc Bảo Trì Thang Máy?</h2>
                <p>
                  Kỹ sư Hà Hồng sẵn sàng đến tận nơi khảo sát mặt bằng hố thang và tư vấn phương án kỹ thuật tối ưu — <strong>hoàn toàn miễn phí</strong>, không ràng buộc.
                </p>
                <div className="about-cta-btns">
                  <Link to="/du-toan" className="about-btn-gold">
                    <i className="bi bi-calculator"></i> Tính Dự Toán Online
                  </Link>
                  <Link to="/lien-he" className="about-btn-outline">
                    <i className="bi bi-envelope-fill"></i> Gửi Yêu Cầu Tư Vấn
                  </Link>
                  <a href={`tel:${soDienThoaiLienKet}`} className="about-btn-outline">
                    <i className="bi bi-telephone-fill"></i> {soDienThoaiCongTy}
                  </a>
                </div>
              </div>
              <div className="col-lg-4 text-center d-none d-lg-block">
                <img
                  src={hotelLobbyImage}
                  alt="Thang máy sang trọng Hà Hồng"
                  style={{
                    maxWidth: "100%",
                    borderRadius: "16px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                    border: "2px solid rgba(217,164,65,0.4)"
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
