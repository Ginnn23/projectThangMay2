import { Link } from "react-router-dom";
import SeoHead from "../components/SeoHead";
import heroImage from "../assets/images/hero-elevator.jpg";
import lobbyImage from "../assets/images/elevator-lobby.jpg";
import hotelLobbyImage from "../assets/images/elevator-hotel-lobby.jpg";
import {
  soDienThoaiCongTy,
  soDienThoaiLienKet,
  googleMapsUrl,
} from "../data/contactInfo";
import "./GioiThieu.css";

const thongKeCongTy = [
  { icon: "bi-calendar2-check-fill", num: "2016", title: "Năm thành lập", desc: "Hoạt động chính thức từ tháng 7/2016 tại TP. Hồ Chí Minh" },
  { icon: "bi-buildings-fill", num: "500+", title: "Công trình hoàn thiện", desc: "Nhà phố, biệt thự, văn phòng, cơ sở y tế tại TP.HCM & miền Nam" },
  { icon: "bi-shield-fill-check", num: "100%", title: "Linh kiện chính hãng", desc: "CO/CQ minh bạch, nhập khẩu trực tiếp từ nhà sản xuất uy tín" },
  { icon: "bi-clock-fill", num: "24/7", title: "Hỗ trợ kỹ thuật", desc: "Đội kỹ thuật túc trực xử lý sự cố xuyên ngày đêm, kể cả ngày lễ" },
];

const giaTriCotLoi = [
  {
    icon: "bi-shield-shaded",
    title: "An Toàn Là Ưu Tiên Tuyệt Đối",
    desc: `Với Thang Máy Hà Hồng, an toàn không phải là khẩu hiệu mà là tiêu chuẩn bất di bất dịch trong từng hạng mục thi công. Mọi sản phẩm đều được kiểm định bởi Trung tâm Kiểm định Kỹ thuật An toàn Khu vực II – Bộ Lao động Thương binh và Xã hội, cấp tem an toàn theo tiêu chuẩn TCVN 6395:2008 trước khi bàn giao sử dụng.

Hệ thống bảo vệ đa tầng được tích hợp trong mọi sản phẩm bao gồm: phanh cơ học chống rơi tự do, bộ cứu hộ tự động ARD khi mất điện đột ngột, rèm quang học mành cửa chống kẹp, công tắc hành trình đầu giếng và đáy hầm, cùng hệ thống giám sát áp lực cáp thời gian thực. Đây là nền tảng để gia chủ yên tâm cho người thân lớn tuổi, trẻ nhỏ sử dụng mỗi ngày.`,
  },
  {
    icon: "bi-cpu-fill",
    title: "Kỹ Thuật Chính Xác – Thi Công Nghiêm Ngặt",
    desc: `Đội ngũ kỹ thuật viên và kỹ sư cơ điện của Hà Hồng đều được đào tạo bài bản, tích lũy nhiều năm kinh nghiệm thực tế trên nhiều loại công trình khác nhau. Quy trình lắp đặt được chuẩn hóa theo checklist kỹ thuật gồm hơn 48 điểm kiểm soát, từ căn chỉnh ray dẫn hướng với sai số dưới 0.5mm, kiểm tra tốc độ đặt tầng, đến đo tải trọng thực tế trước nghiệm thu.

Cabin thang máy được cân chỉnh để dừng tầng với độ lệch sàn không vượt quá ±5mm, đảm bảo hành trình êm ái, không có cảm giác hẫng hay rung lắc. Tất cả đường điện, đường cáp đều đi cố định gọn gàng trong ống gen bảo vệ chống chuột và ẩm, đạt tiêu chuẩn công trình dân dụng cấp cao.`,
  },
  {
    icon: "bi-gem",
    title: "Đa Dạng Giải Pháp – Phù Hợp Mọi Công Trình",
    desc: `Không có một thiết kế thang máy nào phù hợp với mọi ngôi nhà. Hà Hồng hiểu rõ điều này và luôn tiếp cận từng dự án theo hướng tùy chỉnh cá nhân hóa. Từ những căn nhà phố hẹp chỉ 2.2m chiều rộng mặt tiền, hố thang vuông vức chỉ 1m x 1m, PIT nông 300mm – Hà Hồng vẫn có thể thiết kế giải pháp homelift phù hợp mà không phá vỡ kết cấu móng hay chiếm dụng thêm diện tích sàn.

Với các biệt thự và công trình cao cấp, Hà Hồng cung cấp dòng cabin kính Panorama toàn cảnh, khung Inox PVD Gold hoặc Black, sàn đá hoa cương tự nhiên nẹp đồng và hệ đèn vòm LED nghệ thuật – biến chiếc thang máy thành điểm nhấn kiến trúc sang trọng cho cả không gian nội thất.`,
  },
  {
    icon: "bi-heart-fill",
    title: "Tận Tâm Hậu Mãi – Đồng Hành Trọn Đời",
    desc: `Mối quan hệ giữa Hà Hồng và khách hàng không kết thúc sau khi bàn giao chìa khóa. Chúng tôi cam kết bảo hành toàn hệ thống 24 tháng, bảo trì định kỳ miễn phí 18 tháng đầu sau lắp đặt với chu kỳ 1–2 tháng/lần. Kỹ thuật viên sẽ kiểm tra, vệ sinh và tra dầu toàn bộ cơ cấu truyền động, đảm bảo thang luôn hoạt động êm ái như ngày đầu.

Hotline kỹ thuật 24/7 – kể cả ngày lễ, ngày Tết – luôn có người trực. Khi phát sinh sự cố, kỹ thuật viên có mặt tại hiện trường trong vòng 30–60 phút tại nội thành TP.HCM, 60–90 phút tại các quận huyện ngoại thành. Đây là cam kết có văn bản trong hợp đồng bảo trì, không phải lời hứa miệng.`,
  },
  {
    icon: "bi-cash-coin",
    title: "Minh Bạch Chi Phí – Không Phát Sinh",
    desc: `Hà Hồng tin rằng sự tin tưởng bắt đầu từ sự minh bạch. Mọi báo giá đều được lập chi tiết từng hạng mục: thiết bị, nhân công, vật tư phụ kiện, phí kiểm định, phí cẩu thang và phí đào tạo vận hành – không có khoản "phát sinh" bất ngờ sau khi ký hợp đồng.

Khách hàng được nhận bản dự toán PDF chi tiết, có thể tham chiếu đối chiếu với thị trường. Hợp đồng quy định rõ tiến độ thanh toán theo từng giai đoạn thi công, đặt cọc hợp lý, không ép trả trước 100%. Chúng tôi tự hào rằng hơn 60% khách hàng mới đến qua giới thiệu từ khách hàng cũ – minh chứng sống động nhất cho sự uy tín và minh bạch.`,
  },
  {
    icon: "bi-award-fill",
    title: "Chất Lượng Chuẩn Quốc Gia – Linh Kiện Nhập Khẩu",
    desc: `Hà Hồng chỉ sử dụng linh kiện nhập khẩu chính hãng có đầy đủ chứng từ CO (Certificate of Origin) và CQ (Certificate of Quality) theo quy định của Tổng cục Hải quan Việt Nam. Động cơ không hộp số (Gearless PMSM) nhập từ các nhà sản xuất uy tín tại Nhật Bản và châu Âu, biến tần VVVF điều khiển tốc độ mượt mà, tủ điện điều khiển lập trình PLC thế hệ mới.

Cabin được gia công tại xưởng cơ khí chính xác với vật liệu Inox SUS304, vật liệu kính cường lực 2 lớp PVB chống vỡ theo tiêu chuẩn xây dựng. Mỗi sản phẩm xuất xưởng đều có phiếu kiểm tra chất lượng nội bộ trước khi đưa ra công trình.`,
  },
];

const danhMucDichVu = [
  {
    icon: "bi-house-add-fill",
    title: "Thang Máy Gia Đình & Nhà Phố",
    desc: `Đây là dòng sản phẩm chủ lực của Hà Hồng, phục vụ nhu cầu di chuyển hàng ngày cho các gia đình 3–5 thế hệ sống chung trong nhà phố cao tầng. Chúng tôi thiết kế tối ưu cho không gian hẹp, hố thang từ 900×900mm, tải trọng 200–450kg (3–6 người), không cần phòng máy (MRL – Machine Room Less), tiết kiệm tối đa diện tích sàn mỗi tầng.

Cabin được tùy biến theo phong cách nội thất nhà: từ inox gương trắng sang trọng, inox vân gỗ ấm áp, đến kính cường lực toàn cảnh cho nhà mặt phố muốn tạo điểm nhấn thị giác. Hệ thống vận hành êm ái với biến tần VVVF, tốc độ 0.4–1.0 m/s phù hợp nhà 4–7 tầng.`,
  },
  {
    icon: "bi-eye-fill",
    title: "Thang Kính Homelift Panorama Toàn Cảnh",
    desc: `Là xu hướng kiến trúc được ưa chuộng nhất hiện nay trong phân khúc nhà phố cao cấp và biệt thự hiện đại. Thang kính Homelift Panorama của Hà Hồng sử dụng kính cường lực 2 lớp PVB 8+8mm chống vỡ vụn, khung kết cấu Inox PVD Gold hoặc PVD Black tùy chọn, cabin không có vách kín tạo cảm giác thông thoáng, rộng rãi và hòa nhập với không gian kiến trúc mở.

Đặc biệt phù hợp với nhà phố cải tạo có sẵn giếng thang, hố PIT nông chỉ 300mm mà không cần phá móng. Không cần phòng máy phía trên, không ảnh hưởng đến trần sân thượng. Tải trọng từ 200–320kg, lắp đặt trong 7–10 ngày làm việc tùy quy mô công trình.`,
  },
  {
    icon: "bi-building",
    title: "Thang Máy Tải Khách Thương Mại",
    desc: `Phục vụ các công trình văn phòng, tòa nhà căn hộ, trung tâm thương mại và khách sạn có nhu cầu vận chuyển hành khách với tần suất cao và liên tục trong giờ cao điểm. Tải trọng từ 630–1.600kg (8–21 người), tốc độ 1.0–2.5 m/s tùy số tầng.

Hệ điều khiển phân tầng thông minh (Collective Selective Control) tối ưu thời gian chờ, giảm số lần dừng trung gian không cần thiết. Cabin inox bền bỉ, thiết kế mặt bằng rộng rãi, đèn chiếu sáng LED tiết kiệm điện, sàn chịu lực cao với bề mặt chống trượt theo tiêu chuẩn công trình công cộng.`,
  },
  {
    icon: "bi-truck",
    title: "Thang Tải Hàng & Thang Thực Phẩm",
    desc: `Giải pháp vận chuyển hàng hóa nặng cho kho xưởng sản xuất, siêu thị, trung tâm phân phối và nhà hàng – khách sạn. Tải trọng từ 500kg đến 5.000kg tùy nhu cầu, thiết kế cabin không cần thẩm mỹ cao nhưng ưu tiên độ bền cơ khí và khả năng chịu tải liên tục nhiều giờ.

Thang thực phẩm (Dumbwaiter) là loại thang nhỏ chuyên dụng cho nhà hàng nhiều tầng, tải trọng 50–200kg, vận hành yên tĩnh, bề mặt cabin dễ vệ sinh theo tiêu chuẩn vệ sinh an toàn thực phẩm. Tất cả đều được kiểm định nhà nước và cấp phép trước khi đưa vào sử dụng thương mại.`,
  },
  {
    icon: "bi-hospital",
    title: "Thang Máy Bệnh Viện & Y Tế",
    desc: `Dòng thang đặc biệt thiết kế riêng cho cơ sở y tế: phòng khám tư nhân, bệnh viện đa khoa và nhà dưỡng lão. Kích thước cabin rộng đủ để vào ra cáng bệnh nhân và xe lăn dễ dàng (tiêu chuẩn tối thiểu 1.400×2.100mm), vận hành cực kỳ êm ái để không làm ảnh hưởng đến bệnh nhân trong quá trình vận chuyển.

Trang bị nội thất y tế chuyên dụng: tay vịn bao quanh 3 mặt, gương quan sát phía sau, sàn chống trượt tiêu chuẩn bệnh viện, hệ thống thông gió cưỡng bức, đèn khẩn cấp tự động khi mất điện. Đặc biệt không phát ra tiếng ồn vượt quá 45dB để phù hợp với môi trường chữa bệnh.`,
  },
  {
    icon: "bi-wrench-adjustable-circle",
    title: "Bảo Trì, Sửa Chữa & Nâng Cấp",
    desc: `Hà Hồng cung cấp dịch vụ bảo trì định kỳ cho tất cả các hãng thang máy hiện có: Mitsubishi, Schindler, OTIS, Hyundai, Fuji, Kone và nhiều hãng khác. Kỹ thuật viên được đào tạo chuyên sâu theo từng dòng sản phẩm, sử dụng phụ tùng chính hãng hoặc tương đương chất lượng cao, không dùng hàng nhái.

Ngoài ra, Hà Hồng còn thực hiện nâng cấp thang cũ: thay động cơ tiết kiệm điện, thay hệ điều khiển mới tăng độ tin cậy, thay cửa tầng cũ kỹ gây tiếng ồn, làm mới nội thất cabin giữ nguyên kết cấu giếng thang. Giải pháp này tiết kiệm 40–60% chi phí so với tháo toàn bộ lắp mới.`,
  },
];

const quyTrinhSauBuoc = [
  {
    num: "01",
    title: "Tiếp Nhận Thông Tin & Tư Vấn Ban Đầu",
    desc: `Khách hàng có thể liên hệ qua hotline, Zalo, email hoặc đến trực tiếp văn phòng tại Quận Tân Bình. Đội ngũ tư vấn của Hà Hồng sẽ lắng nghe nhu cầu, số tầng, loại công trình, phong cách nội thất mong muốn và ngân sách dự kiến để đề xuất giải pháp phù hợp ngay trong buổi tư vấn đầu tiên – hoàn toàn miễn phí, không ràng buộc.`,
  },
  {
    num: "02",
    title: "Khảo Sát Thực Địa & Đo Đạc Hố Thang",
    desc: `Kỹ sư kỹ thuật đến tận công trình để đo đạc chính xác kích thước hố thang (chiều rộng, chiều sâu, chiều cao giếng), kiểm tra kết cấu bê tông, xác định vị trí nguồn điện 3 pha và đánh giá điều kiện thi công. Đặc biệt với nhà cải tạo, kỹ sư sẽ kiểm tra độ sâu PIT hiện có, tình trạng móng và khả năng bố trí phòng máy hoặc áp dụng giải pháp MRL phù hợp.`,
  },
  {
    num: "03",
    title: "Lên Bản Vẽ 2D/3D & Báo Giá Chi Tiết",
    desc: `Dựa trên số liệu khảo sát thực tế, bộ phận kỹ thuật thiết kế bản vẽ mặt bằng hố thang 2D, phối cảnh cabin 3D theo phong cách nội thất khách hàng mong muốn. Báo giá được lập chi tiết theo từng hạng mục: thiết bị, nhân công lắp đặt, vật tư phụ kiện, phí kiểm định nhà nước, tem an toàn và chi phí đào tạo vận hành – không có khoản phát sinh ẩn.`,
  },
  {
    num: "04",
    title: "Ký Hợp Đồng & Sản Xuất Gia Công",
    desc: `Hợp đồng được soạn thảo rõ ràng, quy định cụ thể: tiêu chuẩn kỹ thuật, tiến độ từng giai đoạn thi công, điều kiện nghiệm thu, chính sách bảo hành và lịch bảo trì định kỳ. Sau khi ký kết, bộ phận sản xuất bắt đầu gia công cabin, gia công khung ray và đặt nhập khẩu thiết bị điều khiển, động cơ theo đúng cấu hình đã thỏa thuận.`,
  },
  {
    num: "05",
    title: "Thi Công Lắp Đặt Trên Công Trình",
    desc: `Đội thi công triển khai theo quy trình nghiêm ngặt: lắp dựng dàn giáo trong giếng thang, neo ray dẫn hướng, kéo và neo cáp thang, thả cabin và đối trọng, lắp tủ điện điều khiển và đi dây hoàn chỉnh. Toàn bộ tiến trình được giám sát bởi kỹ sư trưởng, có biên bản kiểm tra từng hạng mục theo checklist 48 điểm trước khi chạy thử.`,
  },
  {
    num: "06",
    title: "Kiểm Định – Nghiệm Thu – Bàn Giao Chính Thức",
    desc: `Phối hợp với Trung tâm Kiểm định Kỹ thuật An toàn Khu vực II tiến hành thử tải 125% tải định mức, thử phanh hãm tốc và kiểm tra toàn bộ thiết bị an toàn. Sau khi có Biên bản kiểm định đạt yêu cầu và tem an toàn, Hà Hồng bàn giao toàn bộ hồ sơ gốc (bản vẽ hoàn công, sổ tay vận hành, phiếu kiểm định), hướng dẫn gia chủ vận hành và kích hoạt chế độ bảo hành 24 tháng.`,
  },
];

export default function GioiThieu() {
  const companySchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://thangmayhahong.xyz/#organization",
    name: "Công Ty Cổ Phần Thương Mại Dịch Vụ Thang Máy Hà Hồng",
    alternateName: "Thang Máy Hà Hồng",
    url: "https://thangmayhahong.xyz",
    logo: "https://thangmayhahong.xyz/logo-ha-hong.jpg",
    foundingDate: "2016-07-11",
    taxID: "0313908417",
    description: "Công ty Cổ phần Thương mại Dịch vụ Thang máy Hà Hồng thành lập năm 2016 tại TP.HCM, chuyên lắp đặt thang máy gia đình, homelift kính, thang tải hàng và bảo trì 24/7.",
    telephone: "+84909933358",
    address: {
      "@type": "PostalAddress",
      streetAddress: "100 Tân Sơn, Phường 15",
      addressLocality: "Quận Tân Bình",
      addressRegion: "TP. Hồ Chí Minh",
      addressCountry: "VN",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: "https://thangmayhahong.xyz/" },
      { "@type": "ListItem", position: 2, name: "Giới thiệu", item: "https://thangmayhahong.xyz/gioi-thieu" },
    ],
  };

  return (
    <main className="about-page-wrap">
      <SeoHead
        title="Giới Thiệu Công Ty Thang Máy Hà Hồng | Lắp Đặt Bảo Trì Uy Tín TP.HCM"
        description="Thang Máy Hà Hồng (Cổ phần Thương mại Dịch vụ – MST 0313908417) thành lập 2016. Chuyên lắp đặt thang máy gia đình, homelift kính Panorama, thang tải hàng, bảo trì 24/7 tại TP.HCM và miền Nam."
        keywords="giới thiệu thang máy hà hồng, công ty cổ phần thương mại dịch vụ thang máy hà hồng, lắp đặt thang máy tphcm uy tín, thang máy gia đình homelift"
        canonical="https://thangmayhahong.xyz/gioi-thieu"
        jsonLd={[companySchema, breadcrumbSchema]}
      />

      {/* ── HERO BANNER ── */}
      <section
        className="about-banner"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(5,14,28,0.95), rgba(5,14,28,0.68)), url(${heroImage})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="site-container">
          <nav className="about-breadcrumb" aria-label="breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span>Giới thiệu công ty</span>
          </nav>
          <span className="section-eyebrow">VỀ CHÚNG TÔI</span>
          <h1>Thang Máy Hà Hồng – Uy Tín Xây Từng Công Trình</h1>
          <p>
            Thành lập năm 2016 tại TP. Hồ Chí Minh, Hà Hồng đã và đang đồng hành cùng hàng trăm gia đình và doanh nghiệp trên hành trình xây dựng không gian sống tiện nghi, an toàn và đẳng cấp hơn mỗi ngày.
          </p>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="about-stats-strip">
        <div className="site-container">
          <div className="row g-3">
            {thongKeCongTy.map((stat, idx) => (
              <div className="col-6 col-lg-3" key={idx}>
                <div className="about-stat-item">
                  <div className="about-stat-icon">
                    <i className={`bi ${stat.icon}`}></i>
                  </div>
                  <div className="about-stat-content">
                    <h3>{stat.num}</h3>
                    <p>{stat.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GIỚI THIỆU DẠNG BÀI VIẾT ── */}
      <section className="gt-intro-section">
        <div className="site-container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-7">
              <div className="about-section-header">
                <span className="about-tag-eyebrow">
                  <i className="bi bi-building-fill-check"></i> GIỚI THIỆU
                </span>
                <h2 className="about-section-heading">Về Công Ty Thang Máy Hà Hồng</h2>
              </div>

              <div className="gt-prose">
                <p>
                  <strong>Công ty Cổ phần Thương mại Dịch vụ Thang máy Hà Hồng</strong> được thành lập vào năm 2016 tại Thành phố Hồ Chí Minh. Trải qua gần một thập kỷ xây dựng và phát triển, Hà Hồng đã trở thành một trong những đơn vị uy tín trong lĩnh vực tư vấn, thiết kế, thi công lắp đặt và bảo trì thang máy tại khu vực TP.HCM và các tỉnh thành miền Nam.
                </p>
                <p>
                  Từ những ngày đầu hoạt động với đội ngũ kỹ sư nhỏ tập trung vào bảo trì sửa chữa, Hà Hồng từng bước mở rộng sang thi công lắp đặt mới, đầu tư xưởng gia công cơ khí chính xác và xây dựng hệ thống cung ứng thiết bị chính hãng nhập khẩu. Đến nay, công ty sở hữu đội ngũ kỹ sư và kỹ thuật viên lành nghề, có thể đảm nhận các dự án thang máy từ nhà phố gia đình, biệt thự cao cấp, văn phòng thương mại cho đến cơ sở y tế và công trình công nghiệp.
                </p>
                <p>
                  Hà Hồng đặc biệt chú trọng vào việc tối ưu hóa giải pháp cho từng công trình cụ thể, đặc biệt là các nhà phố cải tạo – vốn là thách thức lớn với nhiều đơn vị thi công do hạn chế về không gian hố thang, độ sâu hầm PIT nông và kết cấu móng cũ. Với kinh nghiệm và giải pháp kỹ thuật linh hoạt, Hà Hồng đã thành công lắp đặt thang máy cho hàng trăm công trình mà trước đó nhiều người cho là "không thể lắp được".
                </p>
                <p>
                  Phương châm hoạt động của Hà Hồng là: <strong>"An toàn – Chất lượng – Tận tâm"</strong>. Không chỉ là khẩu hiệu, đây là cam kết được thể hiện qua từng mối hàn, từng vít bắt ray, từng lần chỉnh cabin và từng cuộc gọi hỗ trợ kỹ thuật lúc nửa đêm khi khách hàng gặp sự cố. Đó là lý do vì sao hơn 60% khách hàng mới của Hà Hồng đến từ giới thiệu của khách hàng cũ đã hài lòng.
                </p>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="about-story-visual-wrap">
                <img src={lobbyImage} alt="Thang máy Hà Hồng thi công tại TP.HCM" />
                <div className="about-story-badge-floating">
                  <i className="bi bi-patch-check-fill"></i>
                  <div>
                    <strong>Phương châm: An Toàn – Chất Lượng – Tận Tâm</strong>
                    <span>Hơn 60% khách hàng mới đến qua giới thiệu từ khách hàng cũ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GIÁ TRỊ CỐT LÕI ── */}
      <section className="about-values-grid-section">
        <div className="site-container">
          <div className="about-section-header text-center">
            <span className="about-tag-eyebrow">
              <i className="bi bi-compass-fill"></i> TÔN CHỈ HOẠT ĐỘNG
            </span>
            <h2 className="about-section-heading">Giá Trị Cốt Lõi Của Hà Hồng</h2>
            <p className="about-section-desc">
              Sáu cam kết nền tảng dẫn dắt mọi hành động của đội ngũ Thang Máy Hà Hồng từ ngày đầu thành lập cho đến hôm nay.
            </p>
          </div>
          <div className="row g-4">
            {giaTriCotLoi.map((val, idx) => (
              <div className="col-md-6" key={idx}>
                <div className="gt-value-card">
                  <div className="gt-value-icon">
                    <i className={`bi ${val.icon}`}></i>
                  </div>
                  <div className="gt-value-body">
                    <h3>{val.title}</h3>
                    {val.desc.split("\n\n").map((para, pIdx) => (
                      <p key={pIdx}>{para}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DANH MỤC DỊCH VỤ ── */}
      <section className="gt-services-section">
        <div className="site-container">
          <div className="about-section-header text-center">
            <span className="about-tag-eyebrow">
              <i className="bi bi-grid-fill"></i> LĨNH VỰC HOẠT ĐỘNG
            </span>
            <h2 className="about-section-heading">Các Dịch Vụ Của Hà Hồng</h2>
            <p className="about-section-desc">
              Giải pháp thang máy toàn diện – từ tư vấn thiết kế, thi công đến bảo trì lâu dài – cho mọi loại công trình và ngân sách tại TP.HCM và miền Nam.
            </p>
          </div>
          <div className="row g-4">
            {danhMucDichVu.map((sv, idx) => (
              <div className="col-md-6 col-lg-4" key={idx}>
                <article className="gt-service-card">
                  <div className="gt-service-icon">
                    <i className={`bi ${sv.icon}`}></i>
                  </div>
                  <h3>{sv.title}</h3>
                  {sv.desc.split("\n\n").map((para, pIdx) => (
                    <p key={pIdx}>{para}</p>
                  ))}
                  <Link to="/lien-he" className="gt-service-link">
                    Tư vấn miễn phí <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUY TRÌNH 6 BƯỚC ── */}
      <section className="gt-process-section">
        <div className="site-container">
          <div className="about-section-header text-center">
            <span className="about-tag-eyebrow">
              <i className="bi bi-gear-wide-connected"></i> QUY TRÌNH LÀM VIỆC
            </span>
            <h2 className="about-section-heading">6 Bước Đồng Hành Cùng Khách Hàng</h2>
            <p className="about-section-desc">
              Từ cuộc điện thoại đầu tiên đến ngày bàn giao chìa khóa – mọi bước đều minh bạch, có văn bản xác nhận và đúng tiến độ cam kết.
            </p>
          </div>
          <div className="row g-4">
            {quyTrinhSauBuoc.map((step, idx) => (
              <div className="col-md-6 col-lg-4" key={idx}>
                <div className="gt-step-card">
                  <div className="gt-step-num">{step.num}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BẢO HÀNH ── */}
      <section className="about-commitment-badge-section">
        <div className="site-container">
          <div className="about-section-header text-center">
            <span className="about-tag-eyebrow">
              <i className="bi bi-award-fill"></i> CAM KẾT CHẤT LƯỢNG
            </span>
            <h2 className="about-section-heading">Chính Sách Bảo Hành &amp; Hậu Mãi</h2>
          </div>
          <div className="row g-4">
            {[
              {
                icon: "bi-shield-check",
                title: "Bảo Hành 24 Tháng Toàn Hệ Thống",
                desc: "Bảo hành toàn bộ cơ điện: động cơ, biến tần, tủ điều khiển, ray, cáp và linh kiện chính hãng. Miễn phí đổi mới nếu có lỗi sản xuất.",
              },
              {
                icon: "bi-tools",
                title: "Bảo Trì Định Kỳ Miễn Phí 18 Tháng",
                desc: "Kiểm tra, vệ sinh và bôi trơn 1–2 tháng/lần trong 18 tháng đầu. Phát hiện sớm hao mòn, đảm bảo thang vận hành ổn định lâu dài.",
              },
              {
                icon: "bi-telephone-inbound-fill",
                title: "Hotline Kỹ Thuật 24/7 – Cứu Hộ 30 Phút",
                desc: "Đường dây kỹ thuật trực xuyên ngày đêm kể cả ngày lễ Tết. Kỹ thuật viên có mặt tại nội thành TP.HCM trong 30–60 phút.",
              },
            ].map((item, idx) => (
              <div className="col-lg-4" key={idx}>
                <div className="about-commit-card">
                  <div className="about-commit-icon">
                    <i className={`bi ${item.icon}`}></i>
                  </div>
                  <div className="about-commit-content">
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta-container">
        <div className="site-container">
          <div className="about-cta-box">
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <span className="about-tag-eyebrow" style={{ background: "rgba(217,164,65,0.25)", color: "#facc15" }}>
                  <i className="bi bi-headset"></i> TƯ VẤN MIỄN PHÍ
                </span>
                <h2>Bạn Đang Cần Lắp Đặt Hoặc Bảo Trì Thang Máy?</h2>
                <p>
                  Kỹ sư Hà Hồng sẵn sàng đến tận nơi khảo sát hố thang và tư vấn phương án kỹ thuật tối ưu — <strong>hoàn toàn miễn phí</strong>, không ràng buộc.
                </p>
                <div className="about-cta-btns">
                  <Link to="/du-toan" className="about-btn-gold">
                    <i className="bi bi-calculator"></i> Tính Dự Toán Online
                  </Link>
                  <Link to="/lien-he" className="about-btn-outline">
                    <i className="bi bi-envelope-fill"></i> Gửi Yêu Cầu Tư Vấn
                  </Link>
                  <a href={`tel:${soDienThoaiLienKet}`} className="about-btn-outline">
                    <i className="bi bi-telephone-fill"></i> {soDienThoaiCongTy}
                  </a>
                </div>
              </div>
              <div className="col-lg-4 text-center d-none d-lg-block">
                <img
                  src={hotelLobbyImage}
                  alt="Thang máy sang trọng Hà Hồng"
                  style={{
                    maxWidth: "100%",
                    borderRadius: "16px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                    border: "2px solid rgba(217,164,65,0.4)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
