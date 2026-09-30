import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { apiClient } from "../api/client";
import { chuanHoaPhanLoaiDuAn, layNhanPhanLoaiDuAn } from "../data/projectCategories";
import { chuanHoaDuAn, duAnMau } from "../data/projectData";
import SeoHead from "../components/SeoHead";

const noiDungChiTietTheoSlug = {
  "thang-may-gia-dinh": {
    tongQuan:
      "Phù hợp nhà phố, biệt thự và công trình cải tạo cần tối ưu diện tích. Phương án thường ưu tiên tải trọng vừa phải, vận hành êm, nội thất gọn và các tính năng an toàn cho người lớn tuổi, trẻ nhỏ.",
    giaThanh: [
      ["Phân khúc tiết kiệm", "Khoảng 320 - 420 triệu VNĐ", "Cấu hình cơ bản, nội thất inox tiêu chuẩn, số điểm dừng ít."],
      ["Phân khúc phổ biến", "Khoảng 420 - 620 triệu VNĐ", "Cabin đẹp hơn, cửa tự động, vận hành êm, phù hợp nhà phố 4-6 tầng."],
      ["Phân khúc cao cấp", "Từ 650 triệu VNĐ trở lên", "Nội thất kính/inox cao cấp, nhiều tiện ích, yêu cầu kỹ thuật hoặc thiết kế riêng."],
    ],
    thongSo: [
      ["Tải trọng", "250kg - 450kg"],
      ["Số người", "3 - 6 người"],
      ["Kích thước cabin tham khảo", "900 x 800mm đến 1200 x 1050mm"],
      ["Hố pit tham khảo", "100mm - 550mm tùy công nghệ"],
      ["Chiều cao OH", "Khoảng 2800mm - 3800mm"],
      ["Nguồn điện", "1 pha hoặc 3 pha tùy cấu hình"],
    ],
    uuDiem: ["Tiết kiệm diện tích hơn cầu thang bộ khi bố trí hợp lý.", "Tăng tiện nghi cho gia đình có người lớn tuổi hoặc trẻ nhỏ.", "Nâng giá trị sử dụng và thẩm mỹ cho nhà phố, biệt thự.", "Có nhiều lựa chọn nội thất cabin theo ngân sách."],
    nhuocDiem: ["Cần khảo sát kỹ hố thang, chiều cao tầng và kết cấu hiện trạng.", "Chi phí thay đổi nhiều theo số tầng, tải trọng và vật liệu cabin.", "Cần bảo trì định kỳ để giữ vận hành êm và an toàn."],
    luuY: ["Nên chốt vị trí thang trước khi hoàn thiện nội thất.", "Với nhà cải tạo, cần kiểm tra móng, sàn và hướng mở cửa.", "Không nên chọn tải trọng quá nhỏ nếu gia đình thường vận chuyển đồ nặng."],
  },
  "thang-may-van-phong": {
    tongQuan:
      "Dành cho tòa nhà văn phòng, showroom hoặc công trình có tần suất di chuyển ổn định trong ngày. Thiết kế cần cân bằng tốc độ, độ bền, hình ảnh chuyên nghiệp và khả năng bảo trì thuận tiện.",
    giaThanh: [
      ["Tòa nhà nhỏ", "Khoảng 550 - 850 triệu VNĐ", "Tải khách vừa, số tầng thấp, cấu hình tiêu chuẩn."],
      ["Văn phòng trung bình", "Khoảng 850 triệu - 1,4 tỷ VNĐ", "Tần suất cao hơn, cabin rộng, cửa và điều khiển tốt hơn."],
      ["Cấu hình riêng", "Liên hệ khảo sát", "Nhiều điểm dừng, yêu cầu tốc độ, đồng bộ nội thất hoặc thương hiệu."],
    ],
    thongSo: [
      ["Tải trọng", "450kg - 1000kg"],
      ["Số người", "6 - 15 người"],
      ["Tốc độ tham khảo", "1.0 - 1.75 m/s"],
      ["Cửa tầng", "Cửa tự động 2 cánh hoặc 4 cánh"],
      ["Vật liệu cabin", "Inox sọc nhuyễn, inox gương, kính hoặc phối màu"],
      ["Ứng dụng", "Tòa nhà văn phòng, showroom, trung tâm dịch vụ"],
    ],
    uuDiem: ["Tăng năng lực phục vụ khách và nhân viên trong giờ cao điểm.", "Tạo hình ảnh chuyên nghiệp cho khu sảnh và tòa nhà.", "Dễ xây dựng lịch bảo trì theo giờ vận hành thực tế."],
    nhuocDiem: ["Cần tính đúng lưu lượng người để tránh chờ thang lâu.", "Chi phí tăng nếu yêu cầu tốc độ cao hoặc nhiều điểm dừng.", "Cần quản lý bảo trì tốt vì tần suất sử dụng lớn."],
    luuY: ["Nên tính luồng người giờ cao điểm trước khi chọn tải trọng.", "Khu sảnh nên đủ rộng để chờ thang và thoát người.", "Nên chuẩn bị phương án cứu hộ, điện dự phòng và lịch bảo trì rõ ràng."],
  },
  "thang-may-doanh-nghiep": {
    tongQuan:
      "Phù hợp nhà xưởng, kho, trụ sở doanh nghiệp hoặc khu sản xuất cần vận chuyển người, hàng nhẹ hoặc thiết bị. Trọng tâm là độ bền, tải trọng, an toàn vận hành và khả năng sửa chữa nhanh.",
    giaThanh: [
      ["Tải hàng nhẹ", "Khoảng 450 - 900 triệu VNĐ", "Phục vụ kho nhỏ, cửa mở thuận tiện, cabin chịu tải cơ bản."],
      ["Tải khách kết hợp", "Khoảng 700 triệu - 1,5 tỷ VNĐ", "Dùng cho văn phòng doanh nghiệp hoặc khu sản xuất có nhân sự."],
      ["Tải trọng lớn", "Khảo sát báo giá", "Yêu cầu riêng về cabin, cửa, ray, máy kéo và kết cấu hố thang."],
    ],
    thongSo: [
      ["Tải trọng", "750kg - 2000kg+"],
      ["Mục đích", "Chở người, hàng nhẹ hoặc thiết bị"],
      ["Sàn cabin", "Inox chống trượt hoặc thép chịu lực"],
      ["Cửa", "Cửa tự động hoặc cửa mở tay tùy nhu cầu"],
      ["Yêu cầu chính", "Bền, dễ bảo trì, chịu tần suất vận hành"],
      ["Khu vực lắp", "Kho, xưởng, trụ sở, khu hậu cần"],
    ],
    uuDiem: ["Tối ưu vận chuyển nội bộ giữa các tầng.", "Giảm sức lao động thủ công và rủi ro khi mang vác.", "Có thể thiết kế cabin theo kích thước hàng hóa thực tế."],
    nhuocDiem: ["Cần kết cấu chịu lực tốt hơn thang gia đình.", "Chi phí phụ thuộc mạnh vào tải trọng và loại cửa.", "Không nên dùng cấu hình dân dụng nếu vận chuyển hàng thường xuyên."],
    luuY: ["Cần xác định kích thước kiện hàng lớn nhất trước khi thiết kế.", "Nên tách luồng chở hàng và luồng khách nếu tần suất cao.", "Ưu tiên vật liệu dễ vệ sinh, khó trầy xước và chịu va đập."],
  },
  "thang-may-khach-san": {
    tongQuan:
      "Dành cho khách sạn, căn hộ dịch vụ và công trình lưu trú cần trải nghiệm đi thang êm, thẩm mỹ và ổn định. Nội thất cabin và độ yên tĩnh là yếu tố quan trọng vì ảnh hưởng trực tiếp cảm nhận khách hàng.",
    giaThanh: [
      ["Khách sạn nhỏ", "Khoảng 650 triệu - 1 tỷ VNĐ", "Tải khách vừa, nội thất đẹp, số tầng không quá cao."],
      ["Khách sạn trung cấp", "Khoảng 1 - 1,8 tỷ VNĐ", "Yêu cầu vận hành êm, cabin rộng, vật liệu cao cấp hơn."],
      ["Thiết kế cao cấp", "Khảo sát báo giá", "Đồng bộ sảnh, cabin theo nhận diện thương hiệu và tiêu chuẩn vận hành riêng."],
    ],
    thongSo: [
      ["Tải trọng", "630kg - 1000kg"],
      ["Số người", "8 - 15 người"],
      ["Ưu tiên", "Êm, ít ồn, nội thất sang"],
      ["Cabin", "Inox gương, champagne, kính, đá hoặc vân gỗ"],
      ["Tính năng", "Thẻ tầng, camera, intercom, cứu hộ tự động"],
      ["Ứng dụng", "Khách sạn, căn hộ dịch vụ, homestay cao cấp"],
    ],
    uuDiem: ["Nâng trải nghiệm khách hàng và hình ảnh công trình.", "Cabin có thể phối vật liệu theo phong cách nội thất.", "Phù hợp vận hành liên tục nếu chọn đúng cấu hình."],
    nhuocDiem: ["Chi phí nội thất cabin có thể cao hơn thang tiêu chuẩn.", "Cần kiểm soát tiếng ồn và độ rung tốt.", "Cần bảo trì đều để tránh ảnh hưởng trải nghiệm khách lưu trú."],
    luuY: ["Nên đồng bộ thiết kế cabin với sảnh tầng.", "Cần tính lưu lượng khách, nhân viên và hành lý.", "Nên có phương án xử lý khi mất điện hoặc sự cố ngoài giờ hành chính."],
  },
  "cua-sap": {
    tongQuan:
      "Cửa sập thường dùng cho khu kỹ thuật, kho, cửa lên mái hoặc vị trí cần đóng mở gọn và bảo vệ lối tiếp cận. Giải pháp cần chú trọng độ chắc, an toàn khóa và chống thấm nếu đặt ngoài trời.",
    giaThanh: [
      ["Cơ bản", "Liên hệ báo giá", "Kích thước nhỏ, vật liệu phổ thông, thao tác thủ công."],
      ["Gia cường", "Theo kích thước thực tế", "Khung thép/inox chắc hơn, yêu cầu tải và an toàn cao hơn."],
      ["Thiết kế riêng", "Khảo sát báo giá", "Kích thước đặc biệt, chống thấm, khóa an toàn hoặc tích hợp hệ thống khác."],
    ],
    thongSo: [
      ["Vật liệu", "Thép sơn, inox hoặc vật liệu theo yêu cầu"],
      ["Ứng dụng", "Kho, phòng máy, khu kỹ thuật, lối lên mái"],
      ["Cơ chế", "Mở tay, trợ lực hoặc theo thiết kế riêng"],
      ["Yêu cầu", "Chắc chắn, kín, an toàn khóa"],
      ["Hoàn thiện", "Sơn chống gỉ hoặc inox"],
      ["Kích thước", "Đo theo hiện trạng công trình"],
    ],
    uuDiem: ["Gọn, phù hợp khu vực kỹ thuật hoặc diện tích hạn chế.", "Có thể gia công theo kích thước thực tế.", "Dễ kiểm tra và thay thế phụ kiện khi cần."],
    nhuocDiem: ["Không phù hợp khu vực cần tính thẩm mỹ cao nếu không thiết kế kỹ.", "Cần thi công kín mép nếu khu vực có nước mưa.", "Bản lề, khóa và tay nâng cần được kiểm tra định kỳ."],
    luuY: ["Cần đo chính xác ô chờ trước khi gia công.", "Nếu đặt ngoài trời nên ưu tiên chống gỉ và chống thấm.", "Nên chọn khóa và bản lề phù hợp tần suất sử dụng."],
  },
  "thang-cuon": {
    tongQuan:
      "Thang cuốn phù hợp trung tâm thương mại, siêu thị, nhà ga hoặc tòa nhà công cộng có lưu lượng di chuyển lớn. Thiết kế cần quan tâm dòng người, hướng di chuyển, độ an toàn và kế hoạch bảo trì liên tục.",
    giaThanh: [
      ["Cấu hình tiêu chuẩn", "Liên hệ khảo sát", "Chiều cao tầng phổ biến, lưu lượng vừa, vị trí lắp thuận lợi."],
      ["Lưu lượng cao", "Theo cấu hình kỹ thuật", "Bản rộng, yêu cầu độ bền, cảm biến và vận hành lâu hơn."],
      ["Công trình đặc biệt", "Khảo sát báo giá", "Yêu cầu ngoài trời, chiều cao lớn hoặc đồng bộ nhiều thang."],
    ],
    thongSo: [
      ["Góc nghiêng", "30° hoặc 35° tùy mặt bằng"],
      ["Bề rộng bậc", "600mm, 800mm hoặc 1000mm"],
      ["Tốc độ tham khảo", "0.5 m/s"],
      ["Ứng dụng", "Trung tâm thương mại, siêu thị, nhà ga"],
      ["An toàn", "Cảm biến, nút dừng khẩn, chổi an toàn"],
      ["Bảo trì", "Cần kiểm tra định kỳ theo tần suất vận hành"],
    ],
    uuDiem: ["Phục vụ dòng người liên tục tốt hơn thang máy cabin.", "Tăng sự thuận tiện ở khu vực thương mại và công cộng.", "Tạo điểm dẫn hướng di chuyển rõ ràng trong công trình."],
    nhuocDiem: ["Cần nhiều diện tích lắp đặt hơn thang máy cabin.", "Chi phí phụ thuộc mạnh vào chiều cao tầng và điều kiện lắp.", "Cần bảo trì đều vì thiết bị vận hành gần như liên tục."],
    luuY: ["Cần tính hướng lưu thông trước khi đặt vị trí.", "Khu vực đầu/cuối thang phải đủ rộng để tránh ùn tắc.", "Nên có biển cảnh báo và kiểm tra an toàn định kỳ."],
  },
};

function dinhDangNgay(value) {
  if (!value) return "Đang cập nhật";
  return new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(new Date(value));
}

function layNoiDungChiTiet(duAn) {
  return noiDungChiTietTheoSlug[duAn.slug] || noiDungChiTietTheoSlug[duAn.category] || noiDungChiTietTheoSlug["thang-may-gia-dinh"];
}

function DanhSachIcon({ items, icon = "bi-check-circle-fill" }) {
  return (
    <ul className="project-detail-list">
      {items.map((item) => (
        <li key={item}>
          <i className={`bi ${icon}`}></i>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ChiTietDuAn() {
  const { slug } = useParams();
  const [duAn, setDuAn] = useState(() => chuanHoaDuAn(duAnMau.find((item) => item.slug === slug) || duAnMau[0]));
  const [duAnLienQuan, setDuAnLienQuan] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const noiDungChiTiet = useMemo(() => layNoiDungChiTiet(duAn), [duAn]);
  const projectImages = duAn.galleryImageUrls?.length ? duAn.galleryImageUrls : [duAn.imageUrl];
  const activeImage = projectImages[activeImageIndex] || projectImages[0];

  useEffect(() => {
    let dangHoatDong = true;

    const taiChiTiet = async () => {
      setDangTai(true);
      try {
        const { data } = await apiClient.get(`/projects/slug/${slug}`);
        if (dangHoatDong) {
          setDuAn(chuanHoaDuAn(data));
          setActiveImageIndex(0);
        }
      } catch {
        const duAnDuPhong = duAnMau.find((item) => item.slug === slug);
        if (dangHoatDong && duAnDuPhong) {
          setDuAn(chuanHoaDuAn(duAnDuPhong));
          setActiveImageIndex(0);
        }
      } finally {
        if (dangHoatDong) {
          setDangTai(false);
        }
      }
    };

    taiChiTiet();

    return () => {
      dangHoatDong = false;
    };
  }, [slug]);

  useEffect(() => {
    let dangHoatDong = true;

    const taiDuAnLienQuan = async () => {
      const phanLoaiHienTai = chuanHoaPhanLoaiDuAn(duAn.category);

      try {
        const { data } = await apiClient.get("/projects");
        if (!dangHoatDong) return;

        const danhSach = data.map((item, index) => chuanHoaDuAn(item, index));
        const lienQuan = danhSach
          .filter((item) => item.slug !== duAn.slug && chuanHoaPhanLoaiDuAn(item.category) === phanLoaiHienTai)
          .slice(0, 3);
        setDuAnLienQuan(lienQuan);
      } catch {
        if (!dangHoatDong) return;

        const lienQuanDuPhong = duAnMau
          .map((item, index) => chuanHoaDuAn(item, index))
          .filter((item) => item.slug !== duAn.slug && chuanHoaPhanLoaiDuAn(item.category) === phanLoaiHienTai)
          .slice(0, 3);
        setDuAnLienQuan(lienQuanDuPhong);
      }
    };

    taiDuAnLienQuan();

    return () => {
      dangHoatDong = false;
    };
  }, [duAn.category, duAn.slug]);

  useEffect(() => {
    if (projectImages.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setActiveImageIndex((currentIndex) => (currentIndex + 1) % projectImages.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [projectImages.length]);

  return (
    <main>
      <SeoHead
        title={`${duAn.name} - Thông Số Kỹ Thuật, Báo Giá & Hình Ảnh | Hà Hồng`}
        description={`${duAn.name} - ${duAn.description} Mức giá tham khảo: ${duAn.priceRange}. Đơn vị thi công lắp đặt thang máy uy tín TPHCM.`}
        keywords={`${duAn.name}, báo giá ${duAn.name.toLowerCase()}, thi công ${duAn.name.toLowerCase()}, thang máy hà hồng`}
        canonical={`https://thangmayhahong.xyz/du-an/${slug}`}
        ogImage={projectImages[0]}
      />
      <section className="project-detail-hero">
        <div className="site-container">
          <nav className="about-breadcrumb" aria-label="breadcrumb">
            <a href="/">Trang chủ</a>
            <span>/</span>
            <Link to="/du-an">Dự án</Link>
            <span>/</span>
            <span>{duAn.name}</span>
          </nav>
          <div className="project-detail-grid">
            <div className="project-detail-copy" data-aos="fade-right">
              <span className="section-eyebrow">{duAn.category}</span>
              <h1>{duAn.name}</h1>
              <p>{duAn.description}</p>
              <div className="project-detail-meta">
                <article>
                  <span>Giá tham khảo</span>
                  <strong>{duAn.priceRange}</strong>
                </article>
                <article>
                  <span>Khu vực</span>
                  <strong>{duAn.location}</strong>
                </article>
                <article>
                  <span>Thời gian</span>
                  <strong>{dinhDangNgay(duAn.completedAt)}</strong>
                </article>
              </div>
              <div className="hero-actions">
                <a className="btn hero-primary-button" href={`/lien-he?dichVu=${duAn.category}`}>
                  Yêu cầu báo giá
                  <i className="bi bi-arrow-right ms-2"></i>
                </a>
                <Link className="btn hero-outline-button" to="/du-an">Xem dự án khác</Link>
              </div>
            </div>
            <div className="project-detail-image" data-aos="fade-left">
              <img src={activeImage} alt={duAn.name} key={activeImage} />
              {projectImages.length > 1 && (
                <div className="project-detail-thumbs" aria-label="Ảnh dự án">
                  {projectImages.map((imageUrl, index) => (
                    <button
                      className={activeImageIndex === index ? "active" : ""}
                      type="button"
                      key={imageUrl}
                      onClick={() => setActiveImageIndex(index)}
                      aria-label={`Xem ảnh dự án ${index + 1}`}
                    >
                      <img src={imageUrl} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {dangTai && <p className="project-detail-loading">Đang đồng bộ dữ liệu mới nhất...</p>}
        </div>
      </section>

      <section className="project-detail-info">
        <div className="site-container">
          <div className="project-detail-section-heading" data-aos="fade-up">
            <span className="section-eyebrow">THÔNG TIN THAM KHẢO</span>
            <h2 className="section-heading">Chi tiết giải pháp và chi phí dự kiến</h2>
            <p>{noiDungChiTiet.tongQuan}</p>
          </div>

          <div className="row g-4">
            {[
              ["bi-rulers", "Khảo sát hiện trạng", "Kiểm tra mặt bằng, hố thang, chiều cao tầng và nhu cầu sử dụng thực tế."],
              ["bi-shield-check", "Ưu tiên an toàn", "Đề xuất cấu hình phù hợp tiêu chuẩn kỹ thuật, độ bền và khả năng vận hành ổn định."],
              ["bi-tools", "Bảo trì sau bàn giao", "Hỗ trợ kiểm tra định kỳ, xử lý sự cố và tư vấn nâng cấp khi cần."],
            ].map(([icon, title, description]) => (
              <div className="col-md-4" key={title}>
                <article className="project-detail-card">
                  <i className={`bi ${icon}`}></i>
                  <h2>{title}</h2>
                  <p>{description}</p>
                </article>
              </div>
            ))}
          </div>

          <div className="project-detail-content-grid">
            <article className="project-detail-panel project-detail-panel-wide" data-aos="fade-up">
              <div className="project-detail-panel-title">
                <i className="bi bi-cash-coin"></i>
                <div>
                  <span>GIÁ THÀNH</span>
                  <h2>Khoảng chi phí thường gặp</h2>
                </div>
              </div>
              <div className="project-price-table">
                {noiDungChiTiet.giaThanh.map(([goi, gia, ghiChu]) => (
                  <div className="project-price-row" key={goi}>
                    <strong>{goi}</strong>
                    <span>{gia}</span>
                    <p>{ghiChu}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="project-detail-panel" data-aos="fade-up" data-aos-delay="80">
              <div className="project-detail-panel-title">
                <i className="bi bi-clipboard2-check"></i>
                <div>
                  <span>THÔNG SỐ</span>
                  <h2>Cấu hình tham khảo</h2>
                </div>
              </div>
              <dl className="project-spec-list">
                {noiDungChiTiet.thongSo.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </article>

            <article className="project-detail-panel project-pros-panel" data-aos="fade-up">
              <div className="project-detail-panel-title">
                <i className="bi bi-hand-thumbs-up"></i>
                <div>
                  <span>ƯU ĐIỂM</span>
                  <h2>Điểm phù hợp</h2>
                </div>
              </div>
              <DanhSachIcon items={noiDungChiTiet.uuDiem} />
            </article>

            <article className="project-detail-panel project-cons-panel" data-aos="fade-up" data-aos-delay="80">
              <div className="project-detail-panel-title">
                <i className="bi bi-exclamation-triangle"></i>
                <div>
                  <span>NHƯỢC ĐIỂM</span>
                  <h2>Cần cân nhắc</h2>
                </div>
              </div>
              <DanhSachIcon items={noiDungChiTiet.nhuocDiem} icon="bi-dash-circle-fill" />
            </article>
          </div>

          <article className="project-note-box" data-aos="fade-up">
            <div>
              <span className="section-eyebrow">LƯU Ý TRƯỚC KHI LÀM</span>
              <h2>Các điểm Hà Hồng sẽ kiểm tra khi khảo sát</h2>
            </div>
            <DanhSachIcon items={noiDungChiTiet.luuY} icon="bi-info-circle-fill" />
          </article>

          <p className="project-price-note">
            Giá hiển thị là mức tham khảo theo mặt bằng thị trường và cấu hình phổ biến. Chi phí thực tế cần khảo sát công trình, số điểm dừng, tải trọng, vật liệu cabin, điều kiện thi công, nguồn điện và các yêu cầu nội thất riêng.
          </p>

          {duAnLienQuan.length > 0 && (
            <section className="project-related-section" data-aos="fade-up">
              <div className="project-related-heading">
                <div>
                  <span className="section-eyebrow">DỰ ÁN LIÊN QUAN</span>
                  <h2>Cùng phân loại {layNhanPhanLoaiDuAn(duAn.category)}</h2>
                </div>
                <Link className="btn hero-outline-button" to={`/du-an?loai=${chuanHoaPhanLoaiDuAn(duAn.category)}`}>
                  Xem tất cả
                  <i className="bi bi-arrow-right ms-2"></i>
                </Link>
              </div>
              <div className="project-related-grid">
                {duAnLienQuan.map((item) => (
                  <Link className="project-related-card" to={`/du-an/${item.slug}`} key={item.id || item.slug}>
                    <img src={item.imageUrl} alt={item.name} />
                    <div>
                      <span>{layNhanPhanLoaiDuAn(item.category)}</span>
                      <h3>{item.name}</h3>
                      <p>{item.location}</p>
                      <strong>{item.priceRange}</strong>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

export default ChiTietDuAn;
