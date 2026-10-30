import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import { apiClient } from "../api/client";
import heroImage from "../assets/images/hero-elevator.jpg";
import {
  emailCongTy,
  googleMapsEmbedUrl,
  googleMapsUrl,
  soDienThoaiCongTy,
  soDienThoaiLienKet,
} from "../data/contactInfo";
import SeoHead from "../components/SeoHead";

const soDienThoai = soDienThoaiCongTy;
const emailLienHe = emailCongTy;

const anhXaDichVuCongTy = {
  "tu-van": "Dịch vụ tư vấn",
  "khao-sat": "Dịch vụ tư vấn",
  "lap-dat": "Dịch vụ lắp đặt",
  "bao-tri": "Dịch vụ bảo trì",
  "sua-chua": "Dịch vụ sửa chữa",
  "nang-cap": "Dịch vụ sửa chữa",
  "gia-dinh": "Dịch vụ tư vấn",
  "van-phong": "Dịch vụ tư vấn",
  "doanh-nghiep": "Dịch vụ tư vấn",
  "khach-san": "Dịch vụ tư vấn",
  "cua-sap": "Dịch vụ tư vấn",
  "thang-cuon": "Dịch vụ tư vấn",
};

const dichVuCongTy = [
  "Dịch vụ tư vấn",
  "Dịch vụ lắp đặt",
  "Dịch vụ bảo trì",
  "Dịch vụ sửa chữa",
  "Dịch vụ khác",
];

const loaiThangMayCongTy = [
  "Thang máy gia đình",
  "Thang máy văn phòng",
  "Thang máy doanh nghiệp",
  "Thang máy khách sạn",
  "Cửa sập",
  "Thang cuốn",
  "Khác",
];

const thongTinLienHe = [
  { icon: "bi-telephone", title: "Điện thoại", content: soDienThoai, href: `tel:${soDienThoaiLienKet}` },
  { icon: "bi-envelope", title: "Email", content: emailLienHe, href: `mailto:${emailLienHe}` },
  { icon: "bi-geo-alt", title: "Địa chỉ", content: "Xem vị trí công ty trên Google Maps", href: googleMapsUrl },
  { icon: "bi-clock", title: "Thời gian làm việc", content: "Thứ 2 - Thứ 7: 08:00 - 17:30. Hỗ trợ kỹ thuật 24/7." },
];

const cauHoiNhanh = [
  {
    question: "Tôi cần chuẩn bị thông tin gì trước khi yêu cầu tư vấn?",
    answer:
      "Bạn nên chuẩn bị loại công trình, nhu cầu sử dụng, vị trí dự kiến lắp đặt và các thông tin hiện trạng nếu có.",
  },
  {
    question: "Hà Hồng có cần khảo sát công trình trước khi báo phương án không?",
    answer:
      "Việc khảo sát giúp đánh giá điều kiện thực tế để trao đổi phương án phù hợp hơn với công trình.",
  },
  {
    question: "Tôi có thể yêu cầu tư vấn bảo trì thang máy đang sử dụng không?",
    answer:
      "Có. Bạn có thể gửi thông tin tình trạng thang máy hiện tại để Hà Hồng tiếp nhận và trao đổi hướng kiểm tra phù hợp.",
  },
];

const giaTriMacDinh = {
  hoTen: "",
  soDienThoai: "",
  email: "",
  dichVu: "",
  loaiCongTrinh: "",
  diaDiem: "",
  noiDung: "",
  dongY: false,
};

function SectionTitle({ eyebrow, title, description, center = false }) {
  return (
    <div className={`about-section-title${center ? " text-center mx-auto" : ""}`}>
      <span className="section-eyebrow">{eyebrow}</span>
      <h2 className="section-heading">{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

function BannerLienHe() {
  return (
    <section
      className="about-banner contact-banner"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(5, 14, 28, 0.95), rgba(5, 14, 28, 0.68)), url(${heroImage})`,
      }}
    >
      <div className="site-container">
        <nav className="about-breadcrumb" aria-label="breadcrumb">
          <a href="/">Trang chủ</a>
          <span>/</span>
          <span>Liên hệ</span>
        </nav>
        <span className="section-eyebrow">LIÊN HỆ</span>
        <h1>Hãy chia sẻ nhu cầu của bạn</h1>
        <p>
          Hà Hồng sẵn sàng tiếp nhận thông tin và tư vấn giải pháp thang máy phù hợp với công trình.
        </p>
      </div>
    </section>
  );
}

function ThongTinLienHe() {
  return (
    <section className="contact-info-section">
      <div className="site-container">
        <div className="row g-4">
          {thongTinLienHe.map((item, index) => (
            <div className="col-md-6 col-xl-3" key={item.title} data-aos="fade-up" data-aos-delay={index * 80}>
              <article className="contact-info-card">
                <i className={`bi ${item.icon}`}></i>
                <h2>{item.title}</h2>
                {item.href ? <a href={item.href}>{item.content}</a> : <p>{item.content}</p>}
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function chuanHoaSoDienThoai(value) {
  return value.replace(/[\s.-]/g, "");
}

function taoNoiDungGuiApi(formData) {
  return [
    `Dịch vụ quan tâm: ${formData.dichVu}`,
    `Loại công trình: ${formData.loaiCongTrinh || "Chưa cung cấp"}`,
    `Địa điểm công trình: ${formData.diaDiem || "Chưa cung cấp"}`,
    "",
    "Nội dung yêu cầu:",
    formData.noiDung.trim(),
  ].join("\n");
}

function kiemTraForm(formData) {
  const loi = {};
  const soDienThoaiDaChuanHoa = chuanHoaSoDienThoai(formData.soDienThoai);

  if (!formData.hoTen.trim()) {
    loi.hoTen = "Vui lòng nhập họ và tên.";
  }

  if (!/^0\d{9}$/.test(soDienThoaiDaChuanHoa)) {
    loi.soDienThoai = "Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0.";
  }

  if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
    loi.email = "Vui lòng nhập email đúng định dạng.";
  }

  if (!formData.dichVu) {
    loi.dichVu = "Vui lòng chọn dịch vụ quan tâm.";
  }

  const noiDungDaTrim = formData.noiDung.trim();
  if (noiDungDaTrim.length < 10) {
    loi.noiDung = "Nội dung yêu cầu cần tối thiểu 10 ký tự.";
  } else if (noiDungDaTrim.length > 1000) {
    loi.noiDung = "Nội dung yêu cầu không vượt quá 1000 ký tự.";
  }

  if (!formData.dongY) {
    loi.dongY = "Vui lòng xác nhận đồng ý để Hà Hồng liên hệ tư vấn.";
  }

  return loi;
}

function FormLienHe() {
  const { search } = useLocation();
  const dichVuMacDinh = anhXaDichVuCongTy[new URLSearchParams(search).get("dichVu")] || "";
  const [formData, setFormData] = useState({ ...giaTriMacDinh, dichVu: dichVuMacDinh });
  const [loi, setLoi] = useState({});
  const [dangGui, setDangGui] = useState(false);
  const [thongBao, setThongBao] = useState(null);
  const inputRefs = useRef({});

  const capNhatTruong = (event) => {
    const { checked, name, type, value } = event.target;
    const giaTriMoi = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: giaTriMoi }));
    setLoi((prev) => {
      const duLieuMoi = { ...formData, [name]: giaTriMoi };
      const loiMoi = kiemTraForm(duLieuMoi);
      return { ...prev, [name]: loiMoi[name] };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const loiMoi = kiemTraForm(formData);
    setLoi(loiMoi);
    setThongBao(null);

    const truongLoiDauTien = Object.keys(loiMoi)[0];
    if (truongLoiDauTien) {
      inputRefs.current[truongLoiDauTien]?.focus();
      return;
    }

    setDangGui(true);

    try {
      await apiClient.post("/contacts", {
        fullName: formData.hoTen.trim(),
        phoneNumber: chuanHoaSoDienThoai(formData.soDienThoai),
        email: formData.email.trim() || null,
        subject: formData.dichVu,
        message: taoNoiDungGuiApi(formData),
      });

      setFormData(giaTriMacDinh);
      setThongBao({
        type: "success",
        message: "Cảm ơn bạn. Hà Hồng đã nhận thông tin và sẽ liên hệ lại trong thời gian sớm nhất.",
      });
    } catch (error) {
      if (error?.response?.status === 429) {
        setThongBao({
          type: "warning",
          message: error.response.data?.message || "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.",
        });
        return;
      }

      setThongBao({
        type: "danger",
        message: "Chưa gửi được yêu cầu. Vui lòng kiểm tra API hoặc thử lại sau.",
      });
    } finally {
      setDangGui(false);
    }
  };

  return (
    <section className="contact-form-section">
      <div className="site-container">
        <div className="row g-5 align-items-start">
          <div className="col-lg-5" data-aos="fade-right">
            <SectionTitle
              eyebrow="GỬI YÊU CẦU"
              title="Nhận tư vấn giải pháp thang máy"
              description="Vui lòng cung cấp một số thông tin về nhu cầu và công trình. Hà Hồng sẽ dựa trên thông tin này để trao đổi phương án phù hợp."
            />
            <div className="contact-side-list">
              <a href={`tel:${soDienThoaiLienKet}`}>
                <i className="bi bi-telephone-fill"></i>
                {soDienThoai}
              </a>
              <a href={`mailto:${emailLienHe}`}>
                <i className="bi bi-envelope-fill"></i>
                {emailLienHe}
              </a>
            </div>
            <p className="contact-privacy-note">
              Thông tin của bạn chỉ được sử dụng để tiếp nhận và phản hồi yêu cầu tư vấn.
            </p>
          </div>

          <div className="col-lg-7" data-aos="fade-left">
            <form className="contact-form" noValidate onSubmit={handleSubmit}>
              {thongBao && (
                <div className={`alert alert-${thongBao.type} contact-form-alert`} role="alert">
                  <p>{thongBao.message}</p>
                </div>
              )}

              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="hoTen">Họ và tên *</label>
                  <input id="hoTen" name="hoTen" type="text" autoComplete="name" value={formData.hoTen} ref={(element) => { inputRefs.current.hoTen = element; }} aria-describedby={loi.hoTen ? "hoTen-error" : undefined} aria-invalid={!!loi.hoTen} onChange={capNhatTruong} />
                  {loi.hoTen && <div className="form-error" id="hoTen-error">{loi.hoTen}</div>}
                </div>

                <div className="col-md-6">
                  <label htmlFor="soDienThoai">Số điện thoại *</label>
                  <input id="soDienThoai" name="soDienThoai" type="tel" autoComplete="tel" value={formData.soDienThoai} ref={(element) => { inputRefs.current.soDienThoai = element; }} aria-describedby={loi.soDienThoai ? "soDienThoai-error" : undefined} aria-invalid={!!loi.soDienThoai} onChange={capNhatTruong} />
                  {loi.soDienThoai && <div className="form-error" id="soDienThoai-error">{loi.soDienThoai}</div>}
                </div>

                <div className="col-md-6">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" autoComplete="email" value={formData.email} ref={(element) => { inputRefs.current.email = element; }} aria-describedby={loi.email ? "email-error" : undefined} aria-invalid={!!loi.email} onChange={capNhatTruong} />
                  {loi.email && <div className="form-error" id="email-error">{loi.email}</div>}
                </div>

                <div className="col-md-6">
                  <label htmlFor="dichVu">Dịch vụ quan tâm *</label>
                  <select id="dichVu" name="dichVu" value={formData.dichVu} ref={(element) => { inputRefs.current.dichVu = element; }} aria-describedby={loi.dichVu ? "dichVu-error" : undefined} aria-invalid={!!loi.dichVu} onChange={capNhatTruong}>
                    <option value="">Chọn dịch vụ</option>
                    {dichVuCongTy.map((item) => <option value={item} key={item}>{item}</option>)}
                  </select>
                  {loi.dichVu && <div className="form-error" id="dichVu-error">{loi.dichVu}</div>}
                </div>

                <div className="col-md-6">
                  <label htmlFor="loaiCongTrinh">Loại thang máy / công trình</label>
                  <select id="loaiCongTrinh" name="loaiCongTrinh" value={formData.loaiCongTrinh} onChange={capNhatTruong}>
                    <option value="">Chọn loại thang máy</option>
                    {loaiThangMayCongTy.map((item) => <option value={item} key={item}>{item}</option>)}
                  </select>
                </div>

                <div className="col-md-6">
                  <label htmlFor="diaDiem">Địa điểm công trình</label>
                  <input id="diaDiem" name="diaDiem" type="text" autoComplete="street-address" value={formData.diaDiem} onChange={capNhatTruong} />
                </div>

                <div className="col-12">
                  <label htmlFor="noiDung">Nội dung yêu cầu *</label>
                  <textarea id="noiDung" name="noiDung" rows="5" maxLength="1000" value={formData.noiDung} ref={(element) => { inputRefs.current.noiDung = element; }} aria-describedby={loi.noiDung ? "noiDung-error" : "noiDung-hint"} aria-invalid={!!loi.noiDung} onChange={capNhatTruong}></textarea>
                  <div className="form-hint" id="noiDung-hint">{formData.noiDung.length}/1000 ký tự</div>
                  {loi.noiDung && <div className="form-error" id="noiDung-error">{loi.noiDung}</div>}
                </div>

                <div className="col-12">
                  <label className="contact-checkbox" htmlFor="dongY">
                    <input id="dongY" name="dongY" type="checkbox" checked={formData.dongY} ref={(element) => { inputRefs.current.dongY = element; }} aria-describedby={loi.dongY ? "dongY-error" : undefined} aria-invalid={!!loi.dongY} onChange={capNhatTruong} />
                    <span>Tôi đồng ý để Hà Hồng sử dụng thông tin này nhằm liên hệ và tư vấn.</span>
                  </label>
                  {loi.dongY && <div className="form-error" id="dongY-error">{loi.dongY}</div>}
                </div>

                <div className="col-12">
                  <button className="btn hero-primary-button contact-submit-button" type="submit" disabled={dangGui}>
                    {dangGui ? "Đang gửi..." : "Gửi yêu cầu tư vấn"}
                    <i className="bi bi-arrow-right ms-2"></i>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function BanDoLienHe() {
  return (
    <section className="contact-map-section">
      <div className="site-container">
        <div className="contact-map-card">
          <div className="contact-map-copy">
            <span className="section-eyebrow">BẢN ĐỒ</span>
            <h2>Vị trí Thang Máy Hà Hồng</h2>
            <p>Bấm vào bản đồ hoặc nút bên dưới để mở vị trí công ty trên Google Maps.</p>
            <a className="btn hero-primary-button" href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
              Mở Google Maps
              <i className="bi bi-arrow-up-right ms-2"></i>
            </a>
          </div>
          <iframe
            title="Bản đồ Thang Máy Hà Hồng"
            src={googleMapsEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </section>
  );
}

function CauHoiLienHe() {
  return (
    <section className="contact-faq-section">
      <div className="site-container">
        <SectionTitle center eyebrow="CÂU HỎI NHANH" title="Một số thông tin trước khi liên hệ" />
        <div className="accordion service-faq-accordion" id="contactFaq">
          {cauHoiNhanh.map((item, index) => (
            <div className="accordion-item" key={item.question}>
              <h3 className="accordion-header">
                <button className={`accordion-button${index === 0 ? "" : " collapsed"}`} type="button" data-bs-toggle="collapse" data-bs-target={`#contactFaq${index}`} aria-expanded={index === 0 ? "true" : "false"} aria-controls={`contactFaq${index}`}>
                  {item.question}
                </button>
              </h3>
              <div id={`contactFaq${index}`} className={`accordion-collapse collapse${index === 0 ? " show" : ""}`} data-bs-parent="#contactFaq">
                <div className="accordion-body">{item.answer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function KeuGoiLienHe() {
  return (
    <section className="contact-final-cta">
      <div className="site-container">
        <div className="about-cta-content" data-aos="fade-up">
          <div>
            <span className="section-eyebrow">LIÊN HỆ TRỰC TIẾP</span>
            <h2>Cần trao đổi trực tiếp?</h2>
            <p>Liên hệ với Hà Hồng qua điện thoại hoặc email để gửi thông tin về nhu cầu của bạn.</p>
          </div>
          <div className="about-cta-actions">
            <a href={`tel:${soDienThoaiLienKet}`} className="btn hero-primary-button">Gọi {soDienThoai}</a>
            <a href={`mailto:${emailLienHe}`} className="btn about-call-button">Gửi email</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function LienHe() {
  return (
    <main>
      <SeoHead
        title="Liên Hệ & Yêu Cầu Báo Giá Thang Máy Gia Đình | Thang Máy Hà Hồng"
        description="Liên hệ ngay Thang Máy Hà Hồng để nhận tư vấn kỹ thuật miễn phí, khảo sát công trình và bảng báo giá thang máy gia đình, homelift ưu đãi nhất TPHCM. Hotline: 0909 9333 58."
        keywords="báo giá thang máy gia đình, liên hệ thang máy hà hồng, tư vấn lắp đặt thang máy, khảo sát thang máy tphcm"
        canonical="https://thangmayhahong.xyz/lien-he"
      />
      <BannerLienHe />
      <ThongTinLienHe />
      <FormLienHe />
      <BanDoLienHe />
      <CauHoiLienHe />
      <KeuGoiLienHe />
    </main>
  );
}

export default LienHe;
