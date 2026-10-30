import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

import logoHaHong from "../assets/images/logo-ha-hong.jpg";
import { emailCongTy, soDienThoaiCongTy, soDienThoaiLienKet } from "../data/contactInfo";

function VnFlag() {
  return (
    <svg viewBox="0 0 32 32" width="18" height="18" aria-hidden="true" style={{ display: "block", borderRadius: "50%" }}>
      <circle cx="16" cy="16" r="16" fill="#da251d" />
      <polygon
        fill="#ffff00"
        points="16,6.2 18.9,15.2 28.4,15.2 20.7,20.8 23.6,29.8 16,24.2 8.4,29.8 11.3,20.8 3.6,15.2 13.1,15.2"
      />
    </svg>
  );
}

function UkFlag() {
  return (
    <svg viewBox="0 0 32 32" width="18" height="18" aria-hidden="true" style={{ display: "block", borderRadius: "50%" }}>
      <defs>
        <clipPath id="uk-flag-clip-header">
          <circle cx="16" cy="16" r="16" />
        </clipPath>
      </defs>
      <g clipPath="url(#uk-flag-clip-header)">
        <rect width="32" height="32" fill="#012169" />
        <path d="M0 0 L32 32 M32 0 L0 32" stroke="#ffffff" strokeWidth="5.5" />
        <path d="M0 0 L32 32 M32 0 L0 32" stroke="#c8102e" strokeWidth="3" />
        <path d="M16 0 V32 M0 16 H32" stroke="#ffffff" strokeWidth="8.5" />
        <path d="M16 0 V32 M0 16 H32" stroke="#c8102e" strokeWidth="5" />
      </g>
    </svg>
  );
}

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

              {/* NÚT CHUYỂN ĐỔI NGÔN NGỮ VIỆT NAM / ENGLISH HÌNH TRÒN TINH TẾ */}
              <button
                type="button"
                className="btn-lang-switcher notranslate"
                translate="no"
                onClick={toggleLanguage}
                title={lang === "vi" ? "Switch to English (Chuyển sang Tiếng Anh)" : "Chuyển về Tiếng Việt (Switch to Vietnamese)"}
                aria-label="Chuyển đổi ngôn ngữ Việt / Anh"
              >
                <span className="lang-flag-circle notranslate" translate="no">
                  {lang === "vi" ? <UkFlag /> : <VnFlag />}
                </span>
                <span className="lang-code-text notranslate" translate="no">
                  {lang === "vi" ? "Tiếng Anh" : "Tiếng Việt"}
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
