import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { chuanHoaCaiDatHero, homeHeroFallbackSettings } from "../../data/homeHeroSettings";

function HeroGallery() {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [heroSettings, setHeroSettings] = useState(() => chuanHoaCaiDatHero(homeHeroFallbackSettings));
  const activeImage = heroSettings.mainImages[activeImageIndex] || heroSettings.mainImages[0];

  useEffect(() => {
    let dangHoatDong = true;

    const taiCaiDatHero = async () => {
      try {
        const { data } = await apiClient.get("/site-settings/home-hero");
        if (dangHoatDong) {
          setHeroSettings(chuanHoaCaiDatHero(data));
          setActiveImageIndex(0);
        }
      } catch {
        if (dangHoatDong) {
          setHeroSettings(chuanHoaCaiDatHero(homeHeroFallbackSettings));
        }
      }
    };

    taiCaiDatHero();

    return () => {
      dangHoatDong = false;
    };
  }, []);

  useEffect(() => {
    if (heroSettings.mainImages.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setActiveImageIndex((currentIndex) => (currentIndex + 1) % heroSettings.mainImages.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [heroSettings.mainImages.length]);

  return (
    <div className="hero-showcase-wrap" data-aos="fade-left" data-aos-delay="150">
      {/* Khung trưng bày kiến trúc đơn nhất, đẳng cấp phong cách Nhật / Châu Âu */}
      <div className="hero-showcase-frame">
        <div className="hero-showcase-glow"></div>
        <img
          key={activeImage}
          src={activeImage}
          alt="Kiến trúc thang máy gia đình cao cấp Hà Hồng"
          className="hero-showcase-image"
        />

        {/* Tag kiến trúc may đo góc trên */}
        <div className="hero-showcase-top-badge">
          <span className="live-status-dot"></span>
          <span>KIẾN TRÚC MAY ĐO 2026</span>
        </div>

        {/* Thanh thông tin & điều hướng tối giản góc dưới */}
        <div className="hero-showcase-overlay">
          <div className="hero-showcase-caption">
            <i className="bi bi-shield-check"></i>
            <div>
              <strong>Tiêu Chuẩn Kỹ Thuật Quốc Tế</strong>
              <small>{heroSettings.badgeText || "Động Cơ Fuji Nhật Bản • Êm Ái & Bền Bỉ"}</small>
            </div>
          </div>

          {/* Dấu chấm chuyển slide tinh tế */}
          {heroSettings.mainImages.length > 1 && (
            <div className="hero-showcase-dots">
              {heroSettings.mainImages.map((img, idx) => (
                <button
                  type="button"
                  key={img + idx}
                  className={`showcase-dot ${idx === activeImageIndex ? "active" : ""}`}
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`Xem ảnh số ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HeroGallery;
