import { Link } from "react-router-dom";

import logoHaHong from "../assets/images/logo-ha-hong.jpg";
import {
  emailCongTy,
  googleMapsUrl,
  soDienThoaiCongTy,
  soDienThoaiLienKet,
} from "../data/contactInfo";

const dichVuFooter = [
  "Tư vấn thang máy",
  "Lắp đặt thang máy",
  "Bảo trì và sửa chữa",
  "Cải tạo và nâng cấp",
];

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container">
        <div className="row g-4">
          <div className="col-lg-4">
            <Link className="footer-brand" to="/">
              <span className="brand-logo-wrap footer-logo-wrap">
                <img src={logoHaHong} alt="Thang Máy Hà Hồng - Lắp đặt và bảo trì thang máy gia đình TPHCM" />
              </span>
              <span className="brand-text">
                <strong>HÀ HỒNG</strong>
                <small> ELEVATOR</small>
              </span>
            </Link>
            <p>
              Chuyên tư vấn, thiết kế, thi công lắp đặt thang máy gia đình, homelift kính và dịch vụ bảo trì thang máy 24/7 uy tín tại TPHCM.
            </p>
          </div>

          <div className="col-6 col-lg-2">
            <h3>Menu nhanh</h3>
            <Link to="/">Trang chủ</Link>
            <Link to="/gioi-thieu">Giới thiệu</Link>
            <Link to="/dich-vu">Dịch vụ</Link>
            <Link to="/du-an">Dự án</Link>
            <Link to="/du-toan">Dự toán báo giá</Link>
          </div>

          <div className="col-6 col-lg-3">
            <h3>Dịch vụ</h3>
            {dichVuFooter.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          <div className="col-lg-3">
            <h3>Liên hệ</h3>
            <a href={`tel:${soDienThoaiLienKet}`}>
              <i className="bi bi-telephone me-2"></i>
              {soDienThoaiCongTy}
            </a>
            <a href={`mailto:${emailCongTy}`}>
              <i className="bi bi-envelope me-2"></i>
              {emailCongTy}
            </a>
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
              <i className="bi bi-geo-alt me-2"></i>
              Xem vị trí trên Google Maps
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© Thang Máy Hà Hồng. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
