import { Link } from "react-router-dom";
import SeoHead from "../components/SeoHead";
import heroImage from "../assets/images/hero-elevator.jpg";
import lobbyImage from "../assets/images/elevator-lobby.jpg";
import hotelLobbyImage from "../assets/images/elevator-hotel-lobby.jpg";
import elevatorDoorsImage from "../assets/images/elevator-doors.jpg";
import { soDienThoaiCongTy, soDienThoaiLienKet, emailCongTy } from "../data/contactInfo";
import "./GioiThieu.css";

// Thống kê chủ đạo
const thongKeCongTy = [
  {
    icon: "bi-award-fill",
    num: "12+ Năm",
    title: "Kinh nghiệm chuyên sâu",
    desc: "Cơ khí chính xác & công nghệ thang máy hiện đại"
  },
  {
    icon: "bi-buildings-fill",
    num: "1.000+",
    title: "Công trình hoàn thiện",
    desc: "Nhà phố, biệt thự, homelift kính tại TPHCM & miền Nam"
  },
  {
    icon: "bi-shield-fill-check",
    num: "100%",
    title: "Linh kiện chính hãng",
    desc: "CO/CQ minh bạch từ Fuji (Nhật) & Montanari (Ý)"
  },
  {
    icon: "bi-clock-fill",
    num: "30-60 Phút",
    title: "Cứu hộ khẩn cấp 24/7",
    desc: "Đội phản ứng nhanh kỹ thuật túc trực 24/7 xuyên lễ Tết"
  }
];

// Các mốc lịch sử hình thành & phát triển
const mocLichSu = [
  {
    year: "2014",
    title: "Khởi Sự Từ Niềm Đam Mê Cơ Khí",
    desc: "Thành lập xưởng gia công cơ khí chính xác và cung cấp dịch vụ bảo trì thang máy tại TP.HCM. Ngay từ những ngày đầu, đội ngũ kỹ sư sáng lập đã đặt chữ 'TÂM' và tiêu chuẩn an toàn kỹ thuật lên hàng đầu.",
    side: "left"
  },
  {
    year: "2017",
    title: "Thành Lập Công Ty Thang Máy Hà Hồng",
    desc: "Chính thức thành lập pháp nhân Công ty TNHH Thang Máy Hà Hồng. Chuẩn hóa quy trình lắp đặt, kiểm định nghiêm ngặt theo tiêu chuẩn quốc gia TCVN 6395:2008 và TCVN 6396.",
    side: "right"
  },
  {
    year: "2019",
    title: "Đối Tác Chiến Lược Quốc Tế",
    desc: "Ký kết hợp tác chuyển giao công nghệ và phân phối động cơ, biến tần chính hãng từ các tập đoàn hàng đầu thế giới: Fuji Electric (Nhật Bản), Montanari Giulio (Italy) và Sicor (Italy).",
    side: "left"
  },
  {
    year: "2021",
    title: "Tiên Phong Giải Pháp Homelift Kính Panorama",
    desc: "Đón đầu xu hướng kiến trúc mở, Hà Hồng tiên phong giải pháp thang máy kính không phòng máy (MRL), tối ưu hố PIT nông chỉ 300mm cho các công trình nhà phố cải tạo mà không phá vỡ kết cấu móng.",
    side: "right"
  },
  {
    year: "2024 - Hiện Tại",
    title: "Vượt Mốc 1.000+ Công Trình & Kỷ Nguyên Số",
    desc: "Cán mốc hơn 1.000+ công trình thang máy dân dụng và thương mại. Ứng dụng công nghệ AI Vision chẩn đoán mặt bằng hố thang, bộ cứu hộ tự động ARD đa tầng và hệ sinh thái bảo trì số hóa 24/7.",
    side: "left"
  }
];

// 4 Giá trị cốt lõi
const giaTriCotLoi = [
  {
    icon: "bi-shield-shaded",
    title: "An Toàn Là Sinh Mệnh",
    desc: "Không thỏa hiệp với bất kỳ sai số nào. Hệ thống trang bị 10+ tầng bảo vệ kép: Thắng cơ chống rơi, phanh điện từ kép, rèm quang học mành cửa chống kẹt, và bộ cứu hộ tự động ARD khi mất điện."
  },
  {
    icon: "bi-cpu-fill",
    title: "Kỹ Thuật Chuẩn Xác",
    desc: "Đội ngũ kỹ sư cơ điện tử đào tạo chính quy, thi công ray dẫn hướng với sai số dưới 0.5mm. Đảm bảo cabin vận hành êm ái tuyệt đối, độ ồn dưới 48dB (tương đương tiếng thì thầm trong thư viện)."
  },
  {
    icon: "bi-gem",
    title: "Thẩm Mỹ Tinh Tế Bespoke",
    desc: "Mỗi chiếc thang máy là một tác phẩm nội thất đắt giá. Tùy biến vách Inox PVD Gold, vách kính cường lực 2 lớp Panorama, sàn đá hoa cương tự nhiên nẹp đồng và hệ trần vòm âm LED nghệ thuật."
  },
  {
    icon: "bi-heart-fill",
    title: "Đồng Hành Trọn Đời 24/7",
    desc: "Cam kết đồng hành từ bản vẽ sơ bộ, thi công, cấp tem kiểm định nhà nước đến bảo trì định kỳ trọn vòng đời. Đội kỹ thuật trực cứu hộ khẩn cấp có mặt chỉ trong 30-60 phút tại TP.HCM."
  }
];

// Đối tác công nghệ
const doiTacQuocTe = [
  {
    brand: "FUJI ELECTRIC",
    origin: "Nhật Bản",
    headline: "Động cơ không hộp số PMSM",
    desc: "Nam châm vĩnh cửu siêu tiết kiệm điện (giảm 45% tiêu thụ), vận hành êm ái, tuổi thọ trên 20 năm không cần thay dầu bôi trơn định kỳ."
  },
  {
    brand: "MONTANARI GIULIO",
    origin: "Italy",
    headline: "Đẳng cấp cơ khí châu Âu",
    desc: "Nhập khẩu nguyên chiếc từ Modena, Ý. Tiêu chuẩn khắt khe CE châu Âu, lực kéo mạnh mẽ, thiết kế tinh gọn hoàn hảo cho thang kính Homelift."
  },
  {
    brand: "YASKAWA ELECTRIC",
    origin: "Nhật Bản",
    headline: "Biến tần điều khiển VVVF",
    desc: "Thuật toán điều khiển vector khép kín độc quyền, triệt tiêu hoàn toàn cảm giác hẫng hay giật khi dừng tầng, mang lại hành trình êm ái như trôi."
  },
  {
    brand: "SCHMERSAL",
    origin: "CHLB Đức",
    headline: "Hệ thống cảm biến & khóa an toàn",
    desc: "Thiết bị an toàn cửa tầng và công tắc hành trình đạt tiêu chuẩn SIL3/PLe cao nhất thế giới về an toàn thang máy công nghiệp."
  }
];

// Quy trình 6 bước
const quyTrinhSauBuoc = [
  {
    num: "01",
    title: "Khảo sát Laser & Trắc đạc",
    desc: "Kỹ sư đo đạc laser chính xác từng milimet hiện trạng hố thang, dầm đà, nguồn điện và kết cấu móng nhà."
  },
  {
    num: "02",
    title: "Tư vấn & Lên bản vẽ 2D/3D",
    desc: "Thiết kế mặt bằng công năng, tính toán tải trọng tối ưu và dựng mô phỏng cabin 3D phù hợp với kiến trúc nội thất."
  },
  {
    num: "03",
    title: "Gia công & Nhập khẩu linh kiện",
    desc: "Nhập khẩu thiết bị chính hãng có đầy đủ CO/CQ, gia công khung thép và cabin tại xưởng với độ chính xác cao."
  },
  {
    num: "04",
    title: "Lắp đặt kỹ thuật chuẩn xác",
    desc: "Đội ngũ thợ lành nghề lắp dựng ray, kéo cáp, thả cabin và đấu nối hệ điều khiển theo quy trình kiểm soát 48 bước."
  },
  {
    num: "05",
    title: "Kiểm định cấp phép nhà nước",
    desc: "Trung tâm Kiểm định Kỹ thuật An toàn Khu vực II đo tải, thử phanh và cấp tem chứng nhận an toàn trước khi bàn giao."
  },
  {
    num: "06",
    title: "Bàn giao & Bảo trì 24/7",
    desc: "Hướng dẫn gia chủ vận hành an toàn, bàn giao nhật ký công trình và kích hoạt chế độ bảo hành chính hãng 24-36 tháng."
  }
];

export default function GioiThieu() {
  const companySchema = {
    "@context": "https://schema.org",
    "@type": "ElevatorContractor",
    name: "Công Ty TNHH Thang Máy Hà Hồng",
    alternateName: "Thang Máy Hà Hồng",
    url: "https://thangmayhahong.xyz",
    logo: "https://thangmayhahong.xyz/logo-ha-hong.jpg",
    image: "https://thangmayhahong.xyz/hero-elevator.jpg",
    foundingDate: "2014",
    description:
      "Thang Máy Hà Hồng là đơn vị hàng đầu tại TP.HCM chuyên tư vấn, thiết kế, thi công lắp đặt thang máy gia đình, thang máy kính homelift và bảo trì sửa chữa 24/7.",
    telephone: "+84909933358",
    email: emailCongTy,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Thành phố Hồ Chí Minh",
      addressCountry: "VN"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 10.776889,
      longitude: 106.700806
    },
    priceRange: "280.000.000 VNĐ - 850.000.000 VNĐ",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "00:00",
        closes: "23:59"
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: "https://thangmayhahong.xyz/"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Giới thiệu",
        item: "https://thangmayhahong.xyz/gioi-thieu"
      }
    ]
  };

  return (
    <main className="about-page-wrap">
      <SeoHead
        title="Giới Thiệu Công Ty Thang Máy Hà Hồng - Lịch Sử & Năng Lực Kỹ Thuật 2026"
        description="Tìm hiểu lịch sử phát triển hơn 12 năm của Thang Máy Hà Hồng: Tầm nhìn, sứ mệnh, 1.000+ công trình hoàn thiện và cam kết an toàn tuyệt đối với động cơ Fuji, Montanari nhập khẩu."
        keywords="giới thiệu thang máy hà hồng, lịch sử công ty thang máy hà hồng, công ty thang máy tphcm, năng lực thi công thang máy, thang máy kính homelift"
        canonical="https://thangmayhahong.xyz/gioi-thieu"
        jsonLd={[companySchema, breadcrumbSchema]}
      />

      {/* 1. HERO BANNER (Đồng bộ chuẩn About-Banner như Dự Án & Dự Toán) */}
      <section
        className="about-banner"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(5, 14, 28, 0.95), rgba(5, 14, 28, 0.68)), url(${heroImage})`,
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
          <span className="section-eyebrow">VỀ CHÚNG TÔI - HÀ HỒNG ELEVATOR</span>
          <h1>Khẳng Định Đẳng Cấp Không Gian Sống Bằng Đỉnh Cao Kỹ Thuật</h1>
          <p>
            Hơn một thập kỷ kiến tạo những hành trình di chuyển êm ái, an toàn và sang trọng cho hàng ngàn công trình nhà phố, biệt thự và công trình thương mại trên toàn quốc.
          </p>
        </div>
      </section>

      {/* 2. STATS STRIP */}
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

      {/* 3. CÂU CHUYỆN & LỊCH SỬ HÀ HỒNG */}
      <section className="about-story-section">
        <div className="site-container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="about-section-header">
                <span className="about-tag-eyebrow">
                  <i className="bi bi-clock-history"></i> CÂU CHUYỆN DOANH NGHIỆP
                </span>
                <h2 className="about-section-heading">
                  Hành Trình Kiến Tạo An Toàn &amp; Nâng Tầm Giá Trị Ngôi Nhà Việt
                </h2>
              </div>
              <div className="about-story-card">
                <p className="about-story-lead">
                  Khởi nguồn từ trăn trở: Làm sao để mỗi người già, trẻ nhỏ trong những ngôi nhà cao tầng có thể di chuyển an toàn, tiện lợi nhất mà không phải hi sinh diện tích sinh hoạt quý giá.
                </p>
                <p className="about-story-text">
                  Được sáng lập bởi đội ngũ kỹ sư cơ điện giàu nhiệt huyết tại TP.HCM từ năm 2014, <strong>Thang Máy Hà Hồng</strong> đã chọn con đường riêng: Chú trọng độ bền bỉ cơ khí, độ chuẩn xác đến từng milimet trong lắp đặt và dịch vụ hậu mãi có trách nhiệm trọn vòng đời sản phẩm.
                </p>
                <p className="about-story-text">
                  Từ những công trình cải tạo hẹp lòng nhà phố quận nội thành chỉ 1m2 cho tới những biệt thự triệu đô đòi hỏi cabin kính Panorama mạ vàng PVD, Hà Hồng luôn kiên định với tôn chỉ: <em>&ldquo;Lắp một chiếc thang máy là trao đi một cam kết an toàn trọn đời cho một tổ ấm&rdquo;</em>.
                </p>

                <div className="about-story-features">
                  <div className="about-story-feat-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Chứng nhận TCVN 6395:2008</span>
                  </div>
                  <div className="about-story-feat-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Đội ngũ kỹ sư cơ điện chính quy</span>
                  </div>
                  <div className="about-story-feat-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Tối ưu hố PIT nông chỉ từ 300mm</span>
                  </div>
                  <div className="about-story-feat-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Linh kiện nhập khẩu CO/CQ gốc</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="about-story-visual-wrap">
                <img src={lobbyImage} alt="Công trình thang máy Hà Hồng thi công" />
                <div className="about-story-badge-floating">
                  <i className="bi bi-patch-check-fill"></i>
                  <div>
                    <strong>Chất Lượng Được Khẳng Định Qua 1.000+ Công Trình</strong>
                    <span>Khảo sát thực tế - Báo giá minh bạch - Thi công đúng tiến độ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DÒNG THỜI GIAN LỊCH SỬ (MILESTONES TIMELINE) */}
      <section className="about-timeline-section">
        <div className="site-container">
          <div className="about-section-header text-center">
            <span className="about-tag-eyebrow">
              <i className="bi bi-flag-fill"></i> DẤU ẤN PHÁT TRIỂN
            </span>
            <h2 className="about-section-heading">
              Các Mốc Son Lịch Sử Của Thang Máy Hà Hồng
            </h2>
            <p className="about-section-desc">
              Hành trình hơn một thập kỷ tôi luyện tay nghề, tiếp nhận công nghệ quốc tế và liên tục đổi mới để dẫn đầu xu thế thang máy gia đình cao cấp.
            </p>
          </div>

          <div className="about-timeline-track">
            {mocLichSu.map((item, idx) => (
              <div key={idx} className={`about-timeline-node ${item.side}`}>
                <div className="about-timeline-dot">
                  <i className="bi bi-record-circle"></i>
                </div>
                <div className="about-timeline-card">
                  <span className="about-timeline-year">{item.year}</span>
                  <h3 className="about-timeline-title">{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TẦM NHÌN - SỨ MỆNH - GIÁ TRỊ CỐT LÕI */}
      <section className="about-values-grid-section">
        <div className="site-container">
          <div className="about-section-header text-center">
            <span className="about-tag-eyebrow">
              <i className="bi bi-compass-fill"></i> TÔN CHỈ HOẠT ĐỘNG
            </span>
            <h2 className="about-section-heading">4 Trụ Cột Giá Trị Cốt Lõi</h2>
            <p className="about-section-desc">
              Những nguyên tắc vàng dẫn lối cho từng hành động của mọi kỹ sư và nhân viên Thang Máy Hà Hồng.
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

      {/* 6. ĐỐI TÁC CÔNG NGHỆ QUỐC TẾ */}
      <section className="about-partners-showcase">
        <div className="site-container">
          <div className="about-section-header text-center">
            <span className="about-tag-eyebrow" style={{ background: "rgba(217, 164, 65, 0.2)" }}>
              <i className="bi bi-globe2"></i> CÔNG NGHỆ ĐỈNH CAO
            </span>
            <h2 className="about-section-heading">Đối Tác Công Nghệ Toàn Cầu</h2>
            <p className="about-section-desc">
              Hà Hồng trực tiếp nhập khẩu các cấu kiện quan trọng nhất từ các tập đoàn hàng đầu thế giới, đảm bảo nguồn gốc CO/CQ rõ ràng và độ bền vượt trội.
            </p>
          </div>

          <div className="row g-4">
            {doiTacQuocTe.map((partner, idx) => (
              <div className="col-md-6 col-lg-3" key={idx}>
                <div className="about-partner-card">
                  <div className="about-partner-top">
                    <div className="about-partner-brand">{partner.brand}</div>
                    <span className="about-partner-origin">{partner.origin}</span>
                  </div>
                  <h4>{partner.headline}</h4>
                  <p>{partner.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. QUY TRÌNH 6 BƯỚC THI CÔNG CHUẨN XÁC */}
      <section className="about-process-grid-section">
        <div className="site-container">
          <div className="about-section-header text-center">
            <span className="about-tag-eyebrow">
              <i className="bi bi-gear-wide-connected"></i> QUY TRÌNH CHUẨN HÓA
            </span>
            <h2 className="about-section-heading">6 Bước Thi Công Nghiêm Ngặt</h2>
            <p className="about-section-desc">
              Quy trình kiểm soát chất lượng khép kín từ trắc đạc laser ban đầu đến khi bàn giao chìa khóa cho gia chủ.
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

      {/* 8. CHÍNH SÁCH BẢO HÀNH & CAM KẾT CHẤT LƯỢNG */}
      <section className="about-commitment-badge-section">
        <div className="site-container">
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="about-commit-card">
                <div className="about-commit-icon">
                  <i className="bi bi-shield-check"></i>
                </div>
                <div className="about-commit-content">
                  <h3>Bảo Hành 24 - 36 Tháng</h3>
                  <p>Bảo hành chính hãng cho động cơ, biến tần và toàn bộ hệ thống cơ điện. Đổi mới linh kiện nếu có lỗi sản xuất.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="about-commit-card">
                <div className="about-commit-icon">
                  <i className="bi bi-tools"></i>
                </div>
                <div className="about-commit-content">
                  <h3>Bảo Dưỡng Định Kỳ Miễn Phí</h3>
                  <p>Tặng gói bảo trì định kỳ 1-2 tháng/lần trong suốt 18-24 tháng đầu tiên để thang luôn vận hành êm ái như mới.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="about-commit-card">
                <div className="about-commit-icon">
                  <i className="bi bi-telephone-inbound-fill"></i>
                </div>
                <div className="about-commit-content">
                  <h3>Cứu Hộ Phản Ứng Nhanh 24/7</h3>
                  <p>Hotline khẩn cấp túc trực 24/7. Kỹ thuật viên có mặt xử lý trong 30-60 phút tại các quận huyện TP.HCM.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CALL TO ACTION (CTA) */}
      <section className="about-cta-container">
        <div className="site-container">
          <div className="about-cta-box">
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <span className="about-tag-eyebrow" style={{ background: "rgba(217, 164, 65, 0.25)", color: "#facc15" }}>
                  <i className="bi bi-headset"></i> ĐỒNG HÀNH CÙNG NGÔI NHÀ BẠN
                </span>
                <h2>Bạn Cần Tư Vấn Kích Thước Hoặc Báo Giá Thang Máy?</h2>
                <p>
                  Đội ngũ kỹ sư trưởng Thang Máy Hà Hồng sẵn sàng đến tận nơi khảo sát mặt bằng hố thang và tư vấn phương án kỹ thuật tối ưu chi phí hoàn toàn miễn phí.
                </p>
                <div className="about-cta-btns">
                  <Link to="/du-toan" className="about-btn-gold">
                    <i className="bi bi-calculator"></i> Tính Dự Toán Chi Phí Online
                  </Link>
                  <Link to="/studio-cabin" className="about-btn-outline">
                    <i className="bi bi-palette"></i> Trải Nghiệm Studio Cabin 3D
                  </Link>
                  <a href={`tel:${soDienThoaiLienKet}`} className="about-btn-outline">
                    <i className="bi bi-telephone-fill"></i> Hotline: {soDienThoaiCongTy}
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
                    border: "2px solid rgba(217, 164, 65, 0.4)"
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
