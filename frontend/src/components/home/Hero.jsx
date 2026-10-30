import HeroGallery from "./HeroGallery";
import Stats from "./Stats";

function Hero() {
  return (
    <section id="trang-chu" className="hero-section">
      <div className="site-container hero-container">
        <div className="hero-grid">
          <div className="hero-content" data-aos="fade-right">
            <div className="hero-eyebrow-pill">
              <span className="badge-bullet"></span>
              <span>GIẢI PHÁP THANG MÁY GIA ĐÌNH CAO CẤP TPHCM</span>
            </div>

            <h1 className="hero-main-title">
              <span className="hero-title-top">Thang Máy Gia Đình May Đo</span>
              <span className="hero-title-bottom">Chuẩn An Toàn &amp; Thẩm Mỹ</span>
            </h1>

            <p className="hero-description">
              Tư vấn, thiết kế bản vẽ và thi công thang máy gia đình, homelift kính Panorama tối ưu diện tích hố thang cho nhà phố, biệt thự. Vận hành êm ái dưới 50dB, bảo hành chính hãng 24 tháng.
            </p>

            <div className="hero-actions">
              <a href="/lien-he" className="btn hero-primary-button">
                <span>Yêu Cầu Báo Giá</span>
                <i className="bi bi-arrow-right ms-2"></i>
              </a>

              <a href="/thiet-ke-cabin" className="btn hero-studio-button">
                <i className="bi bi-box-seam me-2"></i>
                <span>Thử Phối Cảnh Cabin 2.5D</span>
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
