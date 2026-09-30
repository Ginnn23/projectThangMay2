import { useState } from "react";
import { NavLink } from "react-router-dom";

import logoHaHong from "../assets/images/logo-ha-hong.jpg";
import { emailCongTy, soDienThoaiCongTy, soDienThoaiLienKet } from "../data/contactInfo";

const menuItems = [
  { label: "Trang chủ", to: "/", end: true },
  { label: "Giới thiệu", to: "/gioi-thieu" },
  { label: "Dịch vụ", to: "/dich-vu" },
  { label: "Dự án", to: "/du-an" },
  { label: "Dự toán báo giá", to: "/du-toan" },
  { label: "Liên hệ", to: "/lien-he" },
];

function Header() {
  const [menuDangMo, setMenuDangMo] = useState(false);

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
                <li className="nav-item" key={item.label}>
                  <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} end={item.end} to={item.to} onClick={dongMenu}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <NavLink className="btn navbar-quote-button ms-lg-3" to="/lien-he" onClick={dongMenu}>
              Yêu cầu báo giá
              <i className="bi bi-arrow-up-right ms-2"></i>
            </NavLink>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
