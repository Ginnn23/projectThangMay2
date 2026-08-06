import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import elevatorDoorsImage from "../assets/images/elevator-doors.jpg";
import hotelLobbyImage from "../assets/images/elevator-hotel-lobby.jpg";
import lobbyImage from "../assets/images/elevator-lobby.jpg";
import Hero from "../components/home/Hero";
import TrustStrip from "../components/home/TrustStrip";
import { apiClient } from "../api/client";
import { soDienThoaiCongTy, soDienThoaiLienKet } from "../data/contactInfo";
import { layNhanPhanLoaiDuAn } from "../data/projectCategories";
import { chuanHoaDuAn } from "../data/projectData";

const services = [
  {
    icon: "bi-building-gear",
    number: "01",
    title: "Lắp đặt thang máy",
    description:
      "Khảo sát, tư vấn cấu hình, thiết kế bản vẽ và thi công đồng bộ cho nhà phố, biệt thự, văn phòng.",
  },
  {
    icon: "bi-shield-check",
    number: "02",
    title: "Bảo trì định kỳ",
    description:
      "Kiểm tra an toàn, hiệu chỉnh vận hành và bảo dưỡng thiết bị theo lịch để hạn chế rủi ro gián đoạn.",
  },
  {
    icon: "bi-tools",
    number: "03",
    title: "Sửa chữa và nâng cấp",
    description:
      "Xử lý sự cố, thay thế linh kiện, hiện đại hóa cabin, tủ điều khiển và hệ thống cửa tầng.",
  },
];

const advantages = [
  ["bi-patch-check", "Quy trình chuẩn", "Từng giai đoạn có checklist nghiệm thu rõ ràng."],
  ["bi-lightning-charge", "Phản hồi nhanh", "Tiếp nhận yêu cầu kỹ thuật và điều phối đội ngũ kịp thời."],
  ["bi-cpu", "Thiết bị phù hợp", "Tư vấn cấu hình theo tải trọng, tần suất và không gian thực tế."],
  ["bi-headset", "Đồng hành dài hạn", "Hỗ trợ sau bàn giao, bảo trì và nâng cấp khi công trình phát triển."],
];

const fallbackProjects = [
  {
    title: "Thang máy gia đình",
    category: "NHÀ PHỐ",
    location: "TP. Hồ Chí Minh",
    image: elevatorDoorsImage,
  },
  {
    title: "Sảnh thang văn phòng",
    category: "TÒA NHÀ",
    location: "Khu vực phía Nam",
    image: lobbyImage,
  },
  {
    title: "Hiện đại hóa hệ thống",
    category: "NÂNG CẤP",
    location: "Công trình dân dụng",
    image: hotelLobbyImage,
  },
];

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div>
      <span className="section-eyebrow">{eyebrow}</span>
      <h2 className="section-heading">{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

function Home() {
  const [featuredProjects, setFeaturedProjects] = useState(fallbackProjects);

  useEffect(() => {
    let isActive = true;

    const loadFeaturedProjects = async () => {
      try {
        const { data } = await apiClient.get("/projects/featured");
        if (isActive && Array.isArray(data) && data.length > 0) {
          setFeaturedProjects(data.slice(0, 3).map((project, index) => {
            const normalizedProject = chuanHoaDuAn(project, index);
            return {
              id: normalizedProject.id,
              slug: normalizedProject.slug,
              title: normalizedProject.name,
              category: layNhanPhanLoaiDuAn(normalizedProject.category),
              location: normalizedProject.location,
              image: normalizedProject.imageUrl,
            };
          }));
        }
      } catch {
        // Keep the bundled examples if the API is temporarily unavailable.
      }
    };

    loadFeaturedProjects();
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <main>
      <Hero />
      <TrustStrip />

      <section className="company-section" id="gioi-thieu">
        <div className="site-container">
          <div className="row align-items-center g-5">
            <div className="col-lg-5" data-aos="fade-right">
              <div className="company-visual" style={{ backgroundImage: `linear-gradient(rgba(5, 14, 28, .08), rgba(5, 14, 28, .78)), url(${lobbyImage})` }}>
                <div className="company-badge">
                  <strong>Uy tín</strong>
                  <span>Trong từng công trình</span>
                </div>
              </div>
            </div>

            <div className="col-lg-7" data-aos="fade-left">
              <span className="section-eyebrow">VỀ CHÚNG TÔI</span>
              <h2 className="section-heading">Đơn vị cung cấp giải pháp thang máy cho nhiều loại công trình</h2>
              <p className="section-description">
                Công ty Cổ phần Thương mại Dịch vụ Thang máy Hà Hồng tập trung vào chất lượng thi công, độ an toàn,
                khả năng vận hành ổn định và dịch vụ hỗ trợ sau bàn giao.
              </p>

              <div className="company-points">
                {[
                  "Tư vấn theo đặc điểm công trình",
                  "Quy trình làm việc rõ ràng",
                  "Bảo trì và kiểm tra định kỳ",
                  "Hỗ trợ kỹ thuật sau lắp đặt",
                ].map((item) => (
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

      <section className="services-section" id="dich-vu">
        <div className="site-container">
          <div className="section-header" data-aos="fade-up">
            <SectionTitle
              eyebrow="LĨNH VỰC HOẠT ĐỘNG"
              title="Dịch vụ thang máy toàn diện"
              description="Đồng hành từ khảo sát, tư vấn, thi công đến bảo trì và hỗ trợ vận hành sau bàn giao."
            />
          </div>

          <div className="row g-4">
            {services.map((service, index) => (
              <div className="col-lg-4" key={service.title} data-aos="fade-up" data-aos-delay={index * 120}>
                <article className="service-card">
                  <div className="service-number">{service.number}</div>
                  <div className="service-icon">
                    <i className={`bi ${service.icon}`}></i>
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <a href="/lien-he">Xem chi tiết<i className="bi bi-arrow-right ms-2"></i></a>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="advantages-section">
        <div className="site-container">
          <div className="text-center advantages-title" data-aos="fade-up">
            <span className="section-eyebrow">NĂNG LỰC DOANH NGHIỆP</span>
            <h2 className="section-heading">Vì sao khách hàng chọn Hà Hồng?</h2>
          </div>

          <div className="row g-4">
            {advantages.map(([icon, title, description], index) => (
              <div className="col-md-6 col-lg-3" key={title} data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="advantage-item">
                  <i className={`bi ${icon}`}></i>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="projects-section" id="du-an">
        <div className="site-container">
          <div className="section-header" data-aos="fade-up">
            <SectionTitle eyebrow="DỰ ÁN TIÊU BIỂU" title="Công trình đã triển khai" />
            <a href="/du-an" className="project-view-link">Xem tất cả dự án<i className="bi bi-arrow-right ms-2"></i></a>
          </div>

          <div className="row g-4">
            {featuredProjects.map((project, index) => (
              <div className="col-lg-4" key={project.id || project.title} data-aos="zoom-in" data-aos-delay={index * 100}>
                <article className="project-card">
                  <div className="project-image" style={{ backgroundImage: `linear-gradient(rgba(5, 14, 28, .1), rgba(5, 14, 28, .76)), url(${project.image})` }}>
                    <span>{project.category}</span>
                  </div>
                  <div className="project-content">
                    <h3>{project.title}</h3>
                    <p><i className="bi bi-geo-alt me-2"></i>{project.location}</p>
                    <Link to={project.slug ? `/du-an/${project.slug}` : "/du-an"}>Xem dự án<i className="bi bi-arrow-up-right ms-2"></i></Link>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-cta" id="lien-he">
        <div className="site-container">
          <div className="contact-cta-content" data-aos="fade-up">
            <div>
              <span>HỖ TRỢ TƯ VẤN</span>
              <h2>Bạn đang cần giải pháp thang máy cho công trình?</h2>
              <p>Liên hệ với Hà Hồng để được tư vấn phương án phù hợp với nhu cầu sử dụng, quy mô công trình và ngân sách đầu tư.</p>
            </div>

            <div className="contact-cta-actions">
              <a href={`tel:${soDienThoaiLienKet}`} className="btn contact-button-primary">
                <i className="bi bi-telephone-fill me-2"></i>
                {soDienThoaiCongTy}
              </a>
              <a href="/lien-he" className="btn contact-button-outline">Gửi yêu cầu báo giá</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
