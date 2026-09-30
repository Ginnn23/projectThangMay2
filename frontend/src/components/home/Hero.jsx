import HeroGallery from "./HeroGallery";
import Stats from "./Stats";

function Hero() {
  return (
    <section id="trang-chu" className="hero-section">
      <div className="site-container hero-container">
        <div className="hero-grid">
          <div className="hero-content" data-aos="fade-right">
            <span className="hero-eyebrow">CHUYÊN GIA THANG MÁY GIA ĐÌNH & CÔNG TRÌNH TPHCM</span>
            <h1>
              <span className="hero-title-line">Thang máy gia đình uy tín</span>
              <span className="hero-title-line hero-title-highlight">an toàn, tinh gọn</span>
              <span className="hero-title-line hero-title-highlight">và chuẩn kỹ thuật</span>
            </h1>
            <p>
              Tư vấn, báo giá, lắp đặt và bảo trì thang máy gia đình, homelift kính, thang máy tải khách tại TP. Hồ Chí Minh và khu vực phía Nam. Khảo sát công trình tận nơi miễn phí.
            </p>
            <div className="hero-actions">
              <a href="/lien-he" className="btn hero-primary-button">
                Yêu cầu báo giá
                <i className="bi bi-arrow-right ms-2"></i>
              </a>
              <a href="/du-an" className="btn hero-outline-button">
                Xem dự án
                <i className="bi bi-arrow-up-right ms-2"></i>
              </a>
            </div>
            <Stats />
          </div>

          <HeroGallery />
        </div>
      </div>
    </section>
  );
}

export default Hero;
