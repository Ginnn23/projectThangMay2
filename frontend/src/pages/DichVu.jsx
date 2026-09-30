import { useEffect, useState } from "react";

import { API_BASE_URL, apiClient } from "../api/client";
import elevatorDoorsImage from "../assets/images/elevator-doors.jpg";
import heroImage from "../assets/images/hero-elevator.jpg";
import hotelLobbyImage from "../assets/images/elevator-hotel-lobby.jpg";
import lobbyImage from "../assets/images/elevator-lobby.jpg";
import { soDienThoaiCongTy, soDienThoaiLienKet } from "../data/contactInfo";
import SeoHead from "../components/SeoHead";

const anhDichVuMacDinh = [lobbyImage, heroImage, elevatorDoorsImage, hotelLobbyImage];

const danhSachDichVu = [
  {
    slug: "tu-van",
    icon: "bi-chat-dots",
    title: "Dịch vụ tư vấn",
    description: "Tiếp nhận nhu cầu, khảo sát thông tin ban đầu và đề xuất giải pháp thang máy phù hợp với công trình.",
    image: lobbyImage,
    imageAlt: "Tư vấn giải pháp thang máy",
    button: "Yêu cầu tư vấn",
  },
  {
    slug: "lap-dat",
    icon: "bi-building-gear",
    title: "Dịch vụ lắp đặt",
    description: "Triển khai lắp đặt thang máy cho nhà ở, văn phòng, khách sạn và công trình thương mại theo quy trình rõ ràng.",
    image: heroImage,
    imageAlt: "Lắp đặt thang máy",
    button: "Nhận báo giá lắp đặt",
  },
  {
    slug: "bao-tri",
    icon: "bi-shield-check",
    title: "Dịch vụ bảo trì",
    description: "Kiểm tra định kỳ, vệ sinh thiết bị, theo dõi vận hành và hỗ trợ kỹ thuật để thang máy hoạt động ổn định.",
    image: elevatorDoorsImage,
    imageAlt: "Bảo trì thang máy",
    button: "Đăng ký bảo trì",
  },
  {
    slug: "sua-chua",
    icon: "bi-tools",
    title: "Dịch vụ sửa chữa",
    description: "Xử lý sự cố, thay thế linh kiện phù hợp và hiệu chỉnh hệ thống khi thang máy có dấu hiệu bất thường.",
    image: hotelLobbyImage,
    imageAlt: "Sửa chữa thang máy",
    button: "Yêu cầu sửa chữa",
  },
];

const loaiCongTrinh = [
  ["bi-house-door", "Nhà ở gia đình", "Giải pháp thang máy gọn gàng cho nhu cầu di chuyển hằng ngày."],
  ["bi-buildings", "Văn phòng", "Cấu hình phù hợp tần suất sử dụng và không gian làm việc."],
  ["bi-door-open", "Khách sạn", "Chú trọng trải nghiệm di chuyển, độ êm và hình ảnh không gian chung."],
  ["bi-tools", "Công trình cải tạo", "Đánh giá hiện trạng để đề xuất phương án nâng cấp hoặc thay thế."],
];

const quyTrinhDichVu = [
  ["bi-inbox", "Tiếp nhận yêu cầu", "Ghi nhận nhu cầu, loại công trình và mong muốn của khách hàng."],
  ["bi-chat-dots", "Tư vấn ban đầu", "Trao đổi định hướng giải pháp, phạm vi công việc và bước khảo sát."],
  ["bi-search", "Khảo sát công trình", "Kiểm tra thực tế vị trí, điều kiện kỹ thuật và không gian lắp đặt."],
  ["bi-file-earmark-text", "Đề xuất phương án", "Trình bày phương án phù hợp với nhu cầu, ngân sách và tiến độ."],
  ["bi-gear", "Triển khai thực hiện", "Phối hợp thi công, lắp đặt, bảo trì hoặc sửa chữa theo kế hoạch."],
  ["bi-check2-circle", "Kiểm tra và bàn giao", "Kiểm tra vận hành, hướng dẫn sử dụng và chuẩn bị hỗ trợ sau bàn giao."],
];

const lyDoLuaChon = [
  "Tư vấn dựa trên nhu cầu thực tế",
  "Thông tin và phương án rõ ràng",
  "Chú trọng an toàn và kỹ thuật",
  "Hỗ trợ trong quá trình sử dụng",
];

const cauHoiThuongGap = [
  {
    question: "Công trình nhà ở có thể lắp loại thang máy nào?",
    answer: "Phương án phù hợp phụ thuộc diện tích, nhu cầu sử dụng, tải trọng mong muốn và điều kiện thi công thực tế.",
  },
  {
    question: "Khi nào cần khảo sát trước khi lắp đặt?",
    answer: "Nên khảo sát ngay khi có ý định lắp thang máy để xác định không gian, kỹ thuật và phương án triển khai phù hợp.",
  },
  {
    question: "Thang máy cần được bảo trì như thế nào?",
    answer: "Thang máy nên được kiểm tra định kỳ để phát hiện bất thường, vệ sinh thiết bị và duy trì khả năng vận hành ổn định.",
  },
  {
    question: "Làm sao để yêu cầu Hà Hồng tư vấn?",
    answer: `Khách hàng có thể gọi ${soDienThoaiCongTy} hoặc gửi yêu cầu để Hà Hồng tiếp nhận thông tin và trao đổi phương án phù hợp.`,
  },
];

function SectionTitle({ eyebrow, title, description, center = false }) {
  return (
    <div className={`about-section-title${center ? " text-center mx-auto" : ""}`}>
      <span className="section-eyebrow">{eyebrow}</span>
      <h2 className="section-heading">{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

function taoUrlAnhApi(imageUrl, fallbackImage) {
  if (!imageUrl || /source\.unsplash\.com/i.test(imageUrl)) return fallbackImage;
  if (/^https?:\/\//i.test(imageUrl) || imageUrl.startsWith("data:")) return imageUrl;
  if (!imageUrl.startsWith("/") || !/\.(jpg|jpeg|png|webp)$/i.test(imageUrl)) return fallbackImage;
  return `${API_BASE_URL.replace(/\/api$/, "")}${imageUrl}`;
}

function BannerTrang() {
  return (
    <section className="about-banner service-banner" style={{ backgroundImage: `linear-gradient(90deg, rgba(5, 14, 28, 0.94), rgba(5, 14, 28, 0.7)), url(${heroImage})` }}>
      <div className="site-container">
        <nav className="about-breadcrumb" aria-label="breadcrumb">
          <a href="/">Trang chủ</a>
          <span>/</span>
          <span>Dịch vụ</span>
        </nav>
        <span className="section-eyebrow">DỊCH VỤ</span>
        <h1>Giải pháp thang máy toàn diện</h1>
        <p>Từ tư vấn, lắp đặt đến bảo trì và sửa chữa, Hà Hồng đồng hành cùng khách hàng trong suốt quá trình sử dụng thang máy.</p>
      </div>
    </section>
  );
}

function GioiThieuDichVu() {
  return (
    <section className="service-intro-section">
      <div className="site-container">
        <SectionTitle
          center
          eyebrow="HÀ HỒNG ELEVATOR"
          title="Dịch vụ phù hợp cho từng nhu cầu"
          description="Mỗi công trình có đặc điểm và nhu cầu sử dụng khác nhau. Hà Hồng tiếp nhận thông tin, khảo sát và đề xuất giải pháp phù hợp, chú trọng sự an toàn, ổn định và thuận tiện trong quá trình vận hành."
        />
      </div>
    </section>
  );
}

function DanhSachDichVu() {
  const [dichVuHienThi, setDichVuHienThi] = useState(danhSachDichVu);

  useEffect(() => {
    let dangHoatDong = true;

    const taiDichVu = async () => {
      try {
        const { data } = await apiClient.get("/services");
        if (dangHoatDong && data.length) {
          setDichVuHienThi(
            data.map((item, index) => {
              const fallback = anhDichVuMacDinh[index % anhDichVuMacDinh.length];
              return {
                slug: item.slug,
                icon: item.icon || danhSachDichVu[index % danhSachDichVu.length].icon,
                title: item.name,
                description: item.description || item.shortDescription,
                image: taoUrlAnhApi(item.imageUrl, fallback),
                imageAlt: item.name,
                button: "Yêu cầu báo giá",
              };
            }),
          );
        }
      } catch {
        // Giữ dữ liệu mẫu nếu API chưa sẵn sàng.
      }
    };

    taiDichVu();

    return () => {
      dangHoatDong = false;
    };
  }, []);

  return (
    <section className="service-detail-section">
      <div className="site-container">
        {dichVuHienThi.map((item, index) => (
          <article className={`service-detail-item${index % 2 === 1 ? " service-detail-reverse" : ""}`} key={item.title}>
            <div className="service-detail-image" data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}>
              <img src={item.image} alt={item.imageAlt} onError={(event) => { event.currentTarget.src = anhDichVuMacDinh[index % anhDichVuMacDinh.length]; }} />
            </div>

            <div className="service-detail-content" data-aos={index % 2 === 0 ? "fade-left" : "fade-right"}>
              <div className="service-detail-icon">
                <i className={`bi ${item.icon}`}></i>
              </div>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <div className="service-detail-points">
                {["Tư vấn theo nhu cầu thực tế", "Khảo sát và đề xuất phương án", "Thi công đúng chuẩn kỹ thuật", "Hỗ trợ sau bàn giao"].map((point) => (
                  <div key={point}>
                    <i className="bi bi-check-circle-fill"></i>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
              <a className="btn hero-primary-button" href={`/lien-he?dichVu=${item.slug}`}>
                {item.button}
                <i className="bi bi-arrow-right ms-2"></i>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function LoaiCongTrinh() {
  return (
    <section className="service-project-types">
      <div className="site-container">
        <SectionTitle center eyebrow="CÔNG TRÌNH PHỤC VỤ" title="Giải pháp cho nhiều loại công trình" />
        <div className="row g-4">
          {loaiCongTrinh.map(([icon, title, description], index) => (
            <div className="col-md-6 col-xl-3" key={title} data-aos="fade-up" data-aos-delay={index * 80}>
              <article className="service-type-card">
                <i className={`bi ${icon}`}></i>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuyTrinhDichVu() {
  return (
    <section className="service-process-section">
      <div className="site-container">
        <SectionTitle center eyebrow="QUY TRÌNH" title="Quy trình làm việc" />
        <div className="service-process-timeline">
          {quyTrinhDichVu.map(([icon, title, description], index) => (
            <article className="service-process-item" key={title} data-aos="fade-up" data-aos-delay={index * 70}>
              <div className="service-process-number">{String(index + 1).padStart(2, "0")}</div>
              <i className={`bi ${icon}`}></i>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function LyDoLuaChon() {
  return (
    <section className="service-reasons-section">
      <div className="site-container">
        <SectionTitle center eyebrow="LÝ DO LỰA CHỌN" title="Vì sao khách hàng lựa chọn Hà Hồng?" />
        <div className="service-reasons-grid">
          {lyDoLuaChon.map((item) => (
            <div className="service-reason-item" key={item}>
              <i className="bi bi-check2-circle"></i>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CauHoiThuongGap() {
  return (
    <section className="service-faq-section">
      <div className="site-container">
        <SectionTitle center eyebrow="FAQ" title="Câu hỏi thường gặp" />
        <div className="accordion service-faq-accordion" id="serviceFaq">
          {cauHoiThuongGap.map((item, index) => (
            <div className="accordion-item" key={item.question}>
              <h3 className="accordion-header">
                <button className={`accordion-button${index === 0 ? "" : " collapsed"}`} type="button" data-bs-toggle="collapse" data-bs-target={`#serviceFaq${index}`} aria-expanded={index === 0 ? "true" : "false"} aria-controls={`serviceFaq${index}`}>
                  {item.question}
                </button>
              </h3>
              <div id={`serviceFaq${index}`} className={`accordion-collapse collapse${index === 0 ? " show" : ""}`} data-bs-parent="#serviceFaq">
                <div className="accordion-body">{item.answer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function KeuGoiHanhDong() {
  return (
    <section className="about-cta-section">
      <div className="site-container">
        <div className="about-cta-content" data-aos="fade-up">
          <div>
            <span className="section-eyebrow">HỖ TRỢ DỊCH VỤ</span>
            <h2>Bạn cần tư vấn dịch vụ thang máy?</h2>
            <p>Hãy gửi thông tin công trình để Hà Hồng có thể trao đổi và đề xuất phương án phù hợp.</p>
          </div>
          <div className="about-cta-actions">
            <a href="/lien-he" className="btn hero-primary-button">Yêu cầu tư vấn<i className="bi bi-arrow-right ms-2"></i></a>
            <a href={`tel:${soDienThoaiLienKet}`} className="btn about-call-button">Gọi ngay: {soDienThoaiCongTy}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function DichVu() {
  return (
    <main>
      <SeoHead
        title="Dịch Vụ Thang Máy Chuyên Nghiệp - Lắp Đặt, Bảo Trì & Sửa Chữa 24/7 | Hà Hồng"
        description="Dịch vụ thang máy trọn gói tại TPHCM: Tư vấn thiết kế, thi công lắp đặt thang máy gia đình, bảo trì bảo dưỡng định kỳ, cải tạo nâng cấp và cứu hộ khẩn cấp 24/7."
        keywords="dịch vụ thang máy, lắp đặt thang máy, bảo trì thang máy tphcm, sửa chữa thang máy, bảo dưỡng thang máy định kỳ, thang máy gia đình hà hồng"
        canonical="https://thangmayhahong.xyz/dich-vu"
      />
      <BannerTrang />
      <GioiThieuDichVu />
      <DanhSachDichVu />
      <LoaiCongTrinh />
      <QuyTrinhDichVu />
      <LyDoLuaChon />
      <CauHoiThuongGap />
      <KeuGoiHanhDong />
    </main>
  );
}

export default DichVu;
