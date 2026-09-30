import heroImage from "../assets/images/hero-elevator.jpg";
import lobbyImage from "../assets/images/elevator-lobby.jpg";
import { soDienThoaiCongTy, soDienThoaiLienKet } from "../data/contactInfo";
import hotelLobbyImage from "../assets/images/elevator-hotel-lobby.jpg";
import SeoHead from "../components/SeoHead";

const diemNoiBat = [
  "Tư vấn dựa trên nhu cầu thực tế",
  "Thi công cẩn thận, đúng quy trình",
  "Đồng hành trong quá trình sử dụng",
];

const giaTriCotLoi = [
  {
    icon: "bi-bullseye",
    title: "Sứ mệnh",
    description:
      "Mang đến những giải pháp thang máy an toàn, phù hợp và thuận tiện cho từng không gian sống và làm việc.",
  },
  {
    icon: "bi-eye",
    title: "Tầm nhìn",
    description:
      "Hướng đến trở thành đơn vị thang máy được khách hàng tin tưởng nhờ chất lượng dịch vụ và tinh thần trách nhiệm.",
  },
  {
    icon: "bi-gem",
    title: "Giá trị cốt lõi",
    description: "An toàn - Chất lượng - Tận tâm - Minh bạch - Đồng hành.",
  },
];

const dichVu = [
  {
    icon: "bi-chat-square-text",
    title: "Tư vấn giải pháp thang máy",
    description:
      "Khảo sát công trình và đề xuất phương án phù hợp với nhu cầu sử dụng.",
  },
  {
    icon: "bi-building-gear",
    title: "Lắp đặt thang máy",
    description:
      "Triển khai lắp đặt cẩn thận, chú trọng kỹ thuật và an toàn vận hành.",
  },
  {
    icon: "bi-wrench-adjustable-circle",
    title: "Bảo trì và sửa chữa",
    description:
      "Kiểm tra định kỳ, xử lý sự cố và hỗ trợ duy trì hoạt động ổn định.",
  },
  {
    icon: "bi-arrow-repeat",
    title: "Cải tạo và nâng cấp",
    description:
      "Nâng cấp thiết bị, nội thất và hệ thống điều khiển cho thang máy đang sử dụng.",
  },
];

const quyTrinh = [
  {
    title: "Tiếp nhận nhu cầu",
    description: "Lắng nghe mục tiêu sử dụng, không gian lắp đặt và ngân sách dự kiến.",
  },
  {
    title: "Khảo sát công trình",
    description: "Đánh giá thực tế mặt bằng, hố thang, tải trọng và điều kiện kỹ thuật.",
  },
  {
    title: "Đề xuất giải pháp",
    description: "Tư vấn cấu hình thang máy, phương án thi công và kế hoạch triển khai.",
  },
  {
    title: "Thi công và kiểm tra",
    description: "Lắp đặt theo quy trình, kiểm tra an toàn và hiệu chỉnh vận hành.",
  },
  {
    title: "Bàn giao và bảo trì",
    description: "Hướng dẫn sử dụng, bàn giao hồ sơ và đồng hành bảo trì sau lắp đặt.",
  },
];

const camKetTrangGioiThieu = [
  "Thông tin tư vấn rõ ràng",
  "Thiết bị có nguồn gốc minh bạch",
  "Ưu tiên an toàn khi thi công",
  "Hỗ trợ sau khi bàn giao",
];

function AboutBanner() {
  return (
    <section
      className="about-banner"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(5, 14, 28, 0.94), rgba(5, 14, 28, 0.7)), url(${heroImage})`,
      }}
    >
      <div className="site-container">
        <nav className="about-breadcrumb" aria-label="breadcrumb">
          <a href="/">Trang chủ</a>
          <span>/</span>
          <span>Giới thiệu</span>
        </nav>
        <span className="section-eyebrow">VỀ CHÚNG TÔI</span>
        <h1>Thang Máy Hà Hồng</h1>
        <p>
          Đồng hành cùng khách hàng trong việc tư vấn, lắp đặt, nâng cấp và bảo
          trì các giải pháp thang máy phù hợp với từng công trình.
        </p>
      </div>
    </section>
  );
}

function SectionTitle({ eyebrow, title, description, center = false }) {
  return (
    <div className={`about-section-title${center ? " text-center mx-auto" : ""}`}>
      <span className="section-eyebrow">{eyebrow}</span>
      <h2 className="section-heading">{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

function GioiThieuDoanhNghiep() {
  return (
    <section className="about-company-section">
      <div className="site-container">
        <div className="row align-items-center g-5">
          <div className="col-lg-5" data-aos="fade-right">
            <div className="about-company-image">
              <img src={lobbyImage} alt="Không gian thang máy hiện đại" />
            </div>
          </div>

          <div className="col-lg-7" data-aos="fade-left">
            <SectionTitle
              eyebrow="HÀ HỒNG ELEVATOR"
              title="Giải pháp thang máy phù hợp cho từng công trình"
            />
            <p className="section-description">
              Thang Máy Hà Hồng hoạt động trong lĩnh vực tư vấn, cung cấp, lắp
              đặt, nâng cấp và bảo trì thang máy. Chúng tôi hướng đến những
              giải pháp phù hợp với nhu cầu sử dụng, đặc điểm công trình và
              ngân sách của từng khách hàng.
            </p>
            <p className="section-description">
              Với tinh thần trách nhiệm trong từng công đoạn, Hà Hồng chú trọng
              chất lượng thiết bị, kỹ thuật lắp đặt và khả năng hỗ trợ trong
              quá trình vận hành. Mục tiêu của chúng tôi là mang đến trải
              nghiệm di chuyển an toàn, thuận tiện và bền vững.
            </p>

            <div className="about-highlight-list">
              {diemNoiBat.map((item) => (
                <div key={item}>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GiaTriSection() {
  return (
    <section className="about-values-section">
      <div className="site-container">
        <div className="row g-4">
          {giaTriCotLoi.map((item, index) => (
            <div className="col-lg-4" key={item.title} data-aos="fade-up" data-aos-delay={index * 100}>
              <article className="about-value-card">
                <i className={`bi ${item.icon}`}></i>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DichVuSection() {
  return (
    <section className="about-services-section">
      <div className="site-container">
        <SectionTitle
          center
          eyebrow="DỊCH VỤ CỦA CHÚNG TÔI"
          title="Lĩnh vực hoạt động của Hà Hồng"
          description="Các dịch vụ được xây dựng để đồng hành với khách hàng từ giai đoạn tư vấn đến vận hành sau bàn giao."
        />

        <div className="row g-4">
          {dichVu.map((item, index) => (
            <div className="col-md-6 col-xl-3" key={item.title} data-aos="fade-up" data-aos-delay={index * 90}>
              <article className="about-service-card">
                <div className="about-service-icon">
                  <i className={`bi ${item.icon}`}></i>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <a href="/lien-he">
                  Tìm hiểu thêm
                  <i className="bi bi-arrow-right ms-2"></i>
                </a>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuyTrinhSection() {
  return (
    <section className="about-process-section">
      <div className="site-container">
        <SectionTitle
          center
          eyebrow="QUY TRÌNH LÀM VIỆC"
          title="Quy trình đồng hành cùng khách hàng"
        />

        <div className="about-process-timeline">
          {quyTrinh.map((item, index) => (
            <article className="about-process-item" key={item.title} data-aos="fade-up" data-aos-delay={index * 80}>
              <div className="about-process-number">{String(index + 1).padStart(2, "0")}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CamKetSection() {
  return (
    <section
      className="about-commitment-section"
      style={{
        backgroundImage: `linear-gradient(rgba(7, 19, 37, 0.92), rgba(7, 19, 37, 0.95)), url(${hotelLobbyImage})`,
      }}
    >
      <div className="site-container">
        <SectionTitle
          center
          eyebrow="CAM KẾT CỦA HÀ HỒNG"
          title="Cam kết trong từng công trình"
        />

        <div className="about-commitment-grid">
          {camKetTrangGioiThieu.map((item) => (
            <div className="about-commitment-item" key={item}>
              <i className="bi bi-check2-circle"></i>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="about-cta-section" id="lien-he">
      <div className="site-container">
        <div className="about-cta-content" data-aos="fade-up">
          <div>
            <span className="section-eyebrow">HỖ TRỢ TƯ VẤN</span>
            <h2>Bạn đang cần giải pháp thang máy cho công trình?</h2>
            <p>
              Hãy liên hệ với Hà Hồng để được trao đổi và tư vấn phương án phù
              hợp.
            </p>
          </div>
          <div className="about-cta-actions">
            <a href="/lien-he" className="btn hero-primary-button">
              Yêu cầu tư vấn
              <i className="bi bi-arrow-right ms-2"></i>
            </a>
            <a href={`tel:${soDienThoaiLienKet}`} className="btn about-call-button">
              Gọi ngay: {soDienThoaiCongTy}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function GioiThieu() {
  return (
    <main>
      <SeoHead
        title="Giới Thiệu Công Ty Thang Máy Hà Hồng - Uy Tín & Trách Nhiệm TPHCM"
        description="Thang Máy Hà Hồng - Đơn vị hàng đầu trong tư vấn, cung cấp, thi công lắp đặt thang máy gia đình, thang máy tải khách và bảo trì định kỳ chuyên nghiệp tại TPHCM."
        keywords="giới thiệu thang máy hà hồng, công ty thang máy tphcm, đơn vị lắp thang máy uy tín, bảo trì thang máy hà hồng"
        canonical="https://thangmayhahong.xyz/gioi-thieu"
      />
      <AboutBanner />
      <GioiThieuDoanhNghiep />
      <GiaTriSection />
      <DichVuSection />
      <QuyTrinhSection />
      <CamKetSection />
      <CtaSection />
    </main>
  );
}

export default GioiThieu;
