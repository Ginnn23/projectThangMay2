import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { apiClient } from "../api/client";
import heroImage from "../assets/images/hero-elevator.jpg";
import { soDienThoaiCongTy, soDienThoaiLienKet } from "../data/contactInfo";
import { boLocDuAn, chuanHoaPhanLoaiDuAn, layNhanPhanLoaiDuAn } from "../data/projectCategories";
import { anhDuAnMacDinh, chuanHoaDuAn, duAnMau } from "../data/projectData";

const SO_DU_AN_MOI_TRANG = 9;

const duAnMauDaChuanHoa = duAnMau.map((duAn) => ({
  ...chuanHoaDuAn(duAn),
  category: chuanHoaPhanLoaiDuAn(duAn.category),
}));

function SectionTitle({ eyebrow, title, description, center = false }) {
  return (
    <div className={`about-section-title${center ? " text-center mx-auto" : ""}`}>
      <span className="section-eyebrow">{eyebrow}</span>
      <h2 className="section-heading">{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

function BannerDuAn() {
  return (
    <section className="about-banner project-banner" style={{ backgroundImage: `linear-gradient(90deg, rgba(5, 14, 28, 0.95), rgba(5, 14, 28, 0.68)), url(${heroImage})` }}>
      <div className="site-container">
        <nav className="about-breadcrumb" aria-label="breadcrumb">
          <a href="/">Trang chủ</a>
          <span>/</span>
          <span>Dự án</span>
        </nav>
        <span className="section-eyebrow">THƯ VIỆN DỰ ÁN</span>
        <h1>Giải pháp cho từng không gian</h1>
        <p>Tham khảo các dòng thang máy và hạng mục kỹ thuật phù hợp với nhà ở, văn phòng, doanh nghiệp, khách sạn và công trình thương mại.</p>
      </div>
    </section>
  );
}

function TheDuAn({ duAn }) {
  const [anhDangDung, setAnhDangDung] = useState(duAn.imageUrl);
  const fallbackImage = anhDuAnMacDinh[Math.abs(String(duAn.id || duAn.slug).length) % anhDuAnMacDinh.length];

  return (
    <article className="project-gallery-card" data-aos="fade-up">
      <Link to={`/du-an/${duAn.slug}`} target="_blank" rel="noopener noreferrer" className="project-gallery-image">
        <img
          src={anhDangDung}
          alt={duAn.name}
          loading="lazy"
          width="960"
          height="720"
          onError={() => setAnhDangDung((current) => current === fallbackImage ? current : fallbackImage)}
        />
        <div className="project-gallery-overlay"></div>
        <span className="project-reference-badge">{duAn.isSample ? "Dữ liệu tham khảo" : "Dự án Hà Hồng"}</span>
      </Link>
      <div className="project-gallery-content">
        <span>{layNhanPhanLoaiDuAn(duAn.category)}</span>
        <h3>{duAn.name}</h3>
        <p>{duAn.description}</p>
        <strong className="project-card-price">{duAn.priceRange}</strong>
        <Link className="project-view-link" to={`/du-an/${duAn.slug}`} target="_blank" rel="noopener noreferrer">
          Xem chi tiết
          <i className="bi bi-arrow-up-right ms-2"></i>
        </Link>
      </div>
    </article>
  );
}

function DuAn() {
  const [danhMucDangChon, setDanhMucDangChon] = useState("tat-ca");
  const [duAnHienThi, setDuAnHienThi] = useState(duAnMauDaChuanHoa);
  const [trangHienTai, setTrangHienTai] = useState(1);

  useEffect(() => {
    let dangHoatDong = true;

    const taiDuAn = async () => {
      try {
        const { data } = await apiClient.get("/projects");
        if (dangHoatDong && data.length) {
          const duAnTuApi = data.map((duAn, index) => ({
            ...chuanHoaDuAn(duAn),
            category: chuanHoaPhanLoaiDuAn(duAn.category),
            id: duAn.id || `api-${index}`,
          }));
          setDuAnHienThi(duAnTuApi);
        }
      } catch {
        // Giữ dữ liệu mẫu nếu API chưa sẵn sàng.
      }
    };

    taiDuAn();

    return () => {
      dangHoatDong = false;
    };
  }, []);

  const danhSachDaLoc = danhMucDangChon === "tat-ca"
    ? duAnHienThi
    : duAnHienThi.filter((duAn) => chuanHoaPhanLoaiDuAn(duAn.category) === danhMucDangChon);
  const tongSoTrang = Math.max(1, Math.ceil(danhSachDaLoc.length / SO_DU_AN_MOI_TRANG));
  const trangDangDung = Math.min(trangHienTai, tongSoTrang);
  const viTriBatDau = (trangDangDung - 1) * SO_DU_AN_MOI_TRANG;
  const duAnTrongTrang = danhSachDaLoc.slice(viTriBatDau, viTriBatDau + SO_DU_AN_MOI_TRANG);
  const viTriKetThuc = Math.min(viTriBatDau + SO_DU_AN_MOI_TRANG, danhSachDaLoc.length);

  const chuyenTrang = (trangMoi) => {
    setTrangHienTai(Math.min(tongSoTrang, Math.max(1, trangMoi)));
    window.requestAnimationFrame(() => {
      document.getElementById("danh-sach-du-an")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <main>
      <BannerDuAn />
      <section className="project-filter-section">
        <div className="site-container">
          <SectionTitle
            center
            eyebrow="DANH SÁCH THAM KHẢO"
            title="Mẫu công trình thang máy"
            description="Các mức giá trên website là khoảng tham khảo, chi phí thực tế phụ thuộc tải trọng, số điểm dừng, nội thất cabin và hiện trạng công trình."
          />
          <div className="project-filter-bar" aria-label="Bộ lọc dự án">
            {boLocDuAn.map((item) => (
              <button
                className={danhMucDangChon === item.value ? "active" : ""}
                key={item.value}
                type="button"
                onClick={() => {
                  setDanhMucDangChon(item.value);
                  setTrangHienTai(1);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="project-gallery-section" id="danh-sach-du-an">
        <div className="site-container">
          <div className="project-result-summary" aria-live="polite">
            {danhSachDaLoc.length > 0
              ? `Hiển thị ${viTriBatDau + 1}–${viTriKetThuc} trong ${danhSachDaLoc.length} dự án`
              : "Chưa có dự án phù hợp"}
          </div>
          <div className="row g-4 project-gallery-grid">
            {duAnTrongTrang.map((duAn) => (
              <div className="col-md-6 col-xl-4" key={duAn.id}>
                <TheDuAn duAn={duAn} />
              </div>
            ))}
          </div>
          {tongSoTrang > 1 && (
            <div className="site-pagination" aria-label="Phân trang dự án">
              <button type="button" aria-label="Trang trước" disabled={trangDangDung === 1} onClick={() => chuyenTrang(trangDangDung - 1)}>
                Trước
              </button>
              {Array.from({ length: tongSoTrang }, (_, index) => index + 1).map((trang) => (
                <button className={trangDangDung === trang ? "active" : ""} aria-current={trangDangDung === trang ? "page" : undefined} aria-label={`Trang ${trang}`} type="button" key={trang} onClick={() => chuyenTrang(trang)}>
                  {trang}
                </button>
              ))}
              <button type="button" aria-label="Trang sau" disabled={trangDangDung === tongSoTrang} onClick={() => chuyenTrang(trangDangDung + 1)}>
                Sau
              </button>
            </div>
          )}
        </div>
      </section>
      <section className="about-cta-section">
        <div className="site-container">
          <div className="about-cta-content" data-aos="fade-up">
            <div>
              <span className="section-eyebrow">TƯ VẤN CÔNG TRÌNH</span>
              <h2>Bạn đang chuẩn bị một công trình?</h2>
              <p>Hãy chia sẻ nhu cầu để Hà Hồng tư vấn phương án thang máy phù hợp và báo giá chi tiết hơn.</p>
            </div>
            <div className="about-cta-actions">
              <a href="/lien-he" className="btn hero-primary-button">Yêu cầu tư vấn<i className="bi bi-arrow-right ms-2"></i></a>
              <a href={`tel:${soDienThoaiLienKet}`} className="btn about-call-button">Gọi ngay: {soDienThoaiCongTy}</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default DuAn;
