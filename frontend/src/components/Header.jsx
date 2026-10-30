import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

import logoHaHong from "../assets/images/logo-ha-hong.jpg";
import { emailCongTy, soDienThoaiCongTy, soDienThoaiLienKet } from "../data/contactInfo";

function Header() {
  const [menuDangMo, setMenuDangMo] = useState(false);
  const { lang, toggleLanguage, t } = useLanguage();

  const menuItems = [
    { label: t.home, to: "/", end: true },
    { label: t.about, to: "/gioi-thieu" },
    { label: t.services, to: "/dich-vu" },
    { label: t.projects, to: "/du-an" },
    { label: t.cabinStudio, to: "/thiet-ke-cabin" },
    { label: t.estimator, to: "/du-toan" },
    { label: t.news, to: "/tin-tuc" },
    { label: t.contact, to: "/lien-he" },
  ];

  const dongMenu = () => {
    setMenuDangMo(false);
  };

  return (
    <header className="site-header">
      <div className="top-bar">
        <div className="site-container top-bar-content">
          <a href={`tel:${soDienThoaiLienKet}`}>
            <i className="bi bi-telephone-fill"></i>
            {soDienThoaiCongTy}
          </a>
          <a href={`mailto:${emailCongTy}`}>
            <i className="bi bi-envelope-fill"></i>
            {emailCongTy}
          </a>
        </div>
      </div>

      <nav className="navbar navbar-expand-lg navbar-light bg-white main-navbar">
        <div className="site-container">
          <NavLink className="navbar-brand" to="/" onClick={dongMenu}>
            <span className="brand-logo-wrap">
              <img src={logoHaHong} alt="Logo Thang Máy Hà Hồng - Lắp đặt thang máy gia đình uy tín TPHCM" />
            </span>
            <span className="brand-text">
              <strong>HÀ HỒNG</strong>
              <small>ELEVATOR</small>
            </span>
          </NavLink>

          <button
            className={`navbar-toggler${menuDangMo ? "" : " collapsed"}`}
            type="button"
            aria-controls="mainMenu"
            aria-expanded={menuDangMo}
            aria-label="Mở menu"
            onClick={() => setMenuDangMo((prev) => !prev)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse justify-content-lg-center${menuDangMo ? " show" : ""}`} id="mainMenu">
            <ul className="navbar-nav align-items-lg-center mx-lg-auto">
              {menuItems.map((item) => (
                <li className="nav-item" key={item.to}>
                  <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} end={item.end} to={item.to} onClick={dongMenu}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="d-flex align-items-center gap-2 ms-lg-3 mt-3 mt-lg-0 flex-wrap">
              <NavLink className="btn navbar-quote-button" to="/lien-he" onClick={dongMenu}>
                {t.quoteButton}
                <i className="bi bi-arrow-up-right ms-2"></i>
              </NavLink>

              {/* NÚT CHUYỂN ĐỔI NGÔN NGỮ VIỆT NAM / ENGLISH HÌNH TRÒN TINH TẾ (CHỐNG DỊCH NHẦM THÀNH MẠNG SỐNG) */}
              <button
                type="button"
                className="btn-lang-switcher notranslate"
                translate="no"
                onClick={toggleLanguage}
                title={lang === "vi" ? "Switch to English (Chuyển sang Tiếng Anh)" : "Chuyển sang Tiếng Việt (Switch to Vietnamese)"}
                aria-label="Chuyển đổi ngôn ngữ Việt / Anh"
              >
                <span className="lang-flag-circle notranslate" translate="no">
                  {lang === "vi" ? "🇻🇳" : "🇬🇧"}
                </span>
                <span className="lang-code-text notranslate" translate="no">
                  {lang === "vi" ? "VN" : "EN"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
