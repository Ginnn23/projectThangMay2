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
    }, 3000);

    return () => window.clearInterval(timer);
  }, [heroSettings.mainImages.length]);

  return (
    <div className="hero-gallery" data-aos="fade-left" data-aos-delay="120">
      <div className="hero-gallery-main">
        <img src={activeImage} alt="Lắp đặt thang máy gia đình hiện đại - Thang Máy Hà Hồng" key={activeImage} />
      </div>

      <div className="hero-gallery-side">
        <div className="hero-gallery-small">
          <img src={heroSettings.sideImages[0]} alt="Nội thất cabin thang máy inox sang trọng" />
        </div>
        <div className="hero-gallery-small">
          <img src={heroSettings.sideImages[1]} alt="Thi công thang máy trọn gói chất lượng cao" />
        </div>
        <div className="hero-gallery-badge">
          <i className="bi bi-shield-check"></i>
          <span>{heroSettings.badgeText}</span>
        </div>
      </div>
    </div>
  );
}

export default HeroGallery;
