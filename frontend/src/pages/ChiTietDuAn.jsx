import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { apiClient } from "../api/client";
import { chuanHoaPhanLoaiDuAn, layNhanPhanLoaiDuAn } from "../data/projectCategories";
import { chuanHoaDuAn, duAnMau } from "../data/projectData";
import SeoHead from "../components/SeoHead";
import "./ChiTietDuAn.css";

const noiDungChiTietTheoSlug = {
  "thang-may-gia-dinh": {
    tongQuan:
      "Phù hợp nhà phố, biệt thự và công trình cải tạo cần tối ưu diện tích. Phương án thường ưu tiên tải trọng vừa phải, vận hành êm ái, nội thất gọn gàng và các tính năng an toàn cho người lớn tuổi, trẻ nhỏ.",
    studioType: "homelift-kinh",
    studioTitle: "Cabin Thang Máy Gia Đình & Homelift Kính Panorama",
    cauHinhThietBi: [
      {
        icon: "bi-gear-wide-connected",
        title: "Máy Kéo & Động Cơ",
        badge: "Công Nghệ Nhật / Ý",
        summary: "Fuji Gearless không hộp số nam châm vĩnh cửu",
        specs: [
          "Công suất: 2.2kW - 3.7kW tiết kiệm 40% điện năng",
          "Vận hành êm ái dưới 50dB, không phát tiếng ồn",
          "Thiết kế nhỏ gọn, không cần xây phòng máy (MRL)"
        ]
      },
      {
        icon: "bi-link-45deg",
        title: "Dây Cáp & Ray Dẫn Hướng",
        badge: "Chống Rung Lắc",
        summary: "Cáp thép dẻo bọc nhựa tổng hợp hoặc đai thép êm",
        specs: [
          "Cáp chuyên dụng chịu lực kéo cao, tuổi thọ gấp 3 lần",
          "Ray dẫn hướng T-beam T75 gia công nguội chuẩn xác",
          "Puly dẫn hướng bọc composite polymer triệt tiêu ma sát"
        ]
      },
      {
        icon: "bi-box-seam",
        title: "Kết Cấu Cabin & Khung Thang",
        badge: "Tùy Biến 2D",
        summary: "Khung hợp kim nhôm / thép mạ kẽm cường độ cao",
        specs: [
          "Vách kính Panorama cường lực 10mm hoặc Inox 304 xước / Gương PVD",
          "Sàn đá Marble Nero Marquina nẹp đồng hoặc sàn gỗ tự nhiên",
          "Trần LED gián tiếp 3000K dịu mắt, tay vịn bo tròn an toàn"
        ]
      },
      {
        icon: "bi-cpu",
        title: "Tủ Điều Khiển & Biến Tần",
        badge: "Vi Xử Lý 32-Bit",
        summary: "Tủ điều khiển vi xử lý thông minh & Biến tần VVVF",
        specs: [
          "Biến tần VVVF điều khiển vô cấp điện áp & tần số siêu êm",
          "Dừng tầng chuẩn xác từng milimet, không giật khi tăng tốc",
          "Bảng gọi tầng COP/LOP nút bấm viền LED Halo sang trọng"
        ]
      },
      {
        icon: "bi-shield-check",
        title: "Hệ Thống An Toàn Đa Tầng",
        badge: "Chuẩn Quốc Tế",
        summary: "Cứu hộ tự động ARD & Phanh hãm Governor",
        specs: [
          "Bộ cứu hộ ARD tự động đưa cabin về tầng gần nhất khi mất điện",
          "Mành hồng ngoại Photocell đa điểm chống kẹp cửa toàn thân",
          "Bộ khống chế vượt tốc (Governor) và phanh cơ khí tức thì"
        ]
      },
      {
        icon: "bi-building-gear",
        title: "Yêu Cầu Hố Thang & Điện",
        badge: "Tối Ưu Diện Tích",
        summary: "Hố Pit siêu nông, không đụng móng bè",
        specs: [
          "Hố Pit nông: Chỉ từ 200mm - 450mm, bảo toàn móng nhà",
          "Chiều cao đỉnh tầng OH: Khoảng 2800mm - 3400mm",
          "Nguồn điện: Linh hoạt điện 1 pha 220V hoặc 3 pha 380V"
        ]
      }
    ],
    giaThanh: [
      ["Phân khúc tiết kiệm", "Khoảng 320 - 420 triệu VNĐ", "Cấu hình cơ bản, nội thất inox tiêu chuẩn, số điểm dừng ít, phù hợp nhà 3-4 tầng."],
      ["Phân khúc phổ biến", "Khoảng 420 - 620 triệu VNĐ", "Cabin đẹp hơn, cửa tự động, động cơ Fuji không hộp số, phù hợp nhà phố 4-6 tầng."],
      ["Phân khúc cao cấp", "Từ 650 triệu VNĐ trở lên", "Nội thất kính Panorama / Inox gương vàng PVD, thiết kế riêng biệt thự sang trọng."],
    ],
    thongSo: [
      ["Tải trọng", "250kg - 450kg (3 - 6 người)"],
      ["Số người", "3 - 6 người"],
      ["Kích thước cabin tham khảo", "900 x 800mm đến 1200 x 1050mm"],
      ["Hố pit tham khảo", "200mm - 450mm tùy công nghệ"],
      ["Chiều cao OH", "Khoảng 2800mm - 3500mm"],
      ["Nguồn điện", "1 pha 220V hoặc 3 pha 380V tùy cấu hình"],
    ],
    uuDiem: [
      "Tiết kiệm diện tích hơn cầu thang bộ khi bố trí hợp lý trong giếng trời hoặc góc nhà.",
      "Tăng tiện nghi vượt trội cho gia đình có người lớn tuổi, phụ nữ mang thai hoặc trẻ nhỏ.",
      "Nâng giá trị bất động sản và thẩm mỹ kiến trúc cho nhà phố, biệt thự.",
      "Có thể xem trước và phối màu nội thất cabin 2D thời gian thực theo sở thích."
    ],
    nhuocDiem: [
      "Cần khảo sát kỹ vị trí hố thang, dầm đà và kết cấu chịu lực hiện trạng trước khi chốt.",
      "Chi phí thay đổi theo số tầng thực tế, vật liệu vách kính hay inox cao cấp.",
      "Cần bảo trì định kỳ 1 - 2 tháng/lần để giữ tuổi thọ vận hành êm ái tối đa."
    ],
    luuY: [
      "Nên chốt vị trí thang máy ngay từ bản vẽ thiết kế kiến trúc để tránh đục phá dầm sàn.",
      "Với nhà cải tạo, kỹ sư Hà Hồng sẽ đo đạc móng, sàn và tư vấn kết cấu khung thép lắp ghép.",
      "Nên chọn tải trọng từ 350kg - 450kg để vừa vặn đi từ 4 - 6 người và vận chuyển hành lý dễ dàng."
    ],
  },
  "thang-may-van-phong": {
    tongQuan:
      "Dành cho tòa nhà văn phòng, showroom hoặc công trình có tần suất di chuyển ổn định trong ngày. Thiết kế cần cân bằng tốc độ, độ bền, hình ảnh chuyên nghiệp và khả năng bảo trì thuận tiện.",
    studioType: "inox-tieu-chuan",
    studioTitle: "Cabin Thang Máy Văn Phòng Inox 304 Bền Bỉ",
    cauHinhThietBi: [
      {
        icon: "bi-gear-wide-connected",
        title: "Máy Kéo & Động Cơ",
        badge: "Tần Suất Cao",
        summary: "Động cơ công suất lớn 3.7kW - 7.5kW (Fuji / Montanari Ý)",
        specs: [
          "Tốc độ vận hành nhanh: 1.0m/s đến 1.75m/s",
          "Chịu chu kỳ khởi động và dừng liên tục suốt 24/7",
          "Hệ thống làm mát cưỡng bức tự động bảo vệ cuộn dây"
        ]
      },
      {
        icon: "bi-link-45deg",
        title: "Dây Cáp Tải & Ray Dẫn Hướng",
        badge: "Tiêu Chuẩn DIN EN",
        summary: "Cáp thép đa lõi chuyên dụng và ray dẫn hướng T-car hạng nặng",
        specs: [
          "Cáp thép chuyên dụng nhiều tao chịu tải trọng giật và kéo căng cao",
          "Ray T89/T90 gia công máy chuẩn xác khử độ lắc ngang",
          "Khối đối trọng bê tông đúc khuôn bọc thép cân bằng hoàn hảo"
        ]
      },
      {
        icon: "bi-box-seam",
        title: "Kết Cấu Cabin & Cửa Tầng",
        badge: "Inox Chống Vân Tay",
        summary: "Inox SUS 304 xước hairline dày 1.5mm phối gương bỉ",
        specs: [
          "Bề mặt chải xước satin chống trầy xước, dễ lau chùi vệ sinh",
          "Gương soi bỉ 8K mở rộng không gian và tạo độ sâu cabin",
          "Trần LED chiếu sáng tiết kiệm điện hoạt động bền bỉ 24/7"
        ]
      },
      {
        icon: "bi-cpu",
        title: "Tủ Điều Khiển Thông Minh",
        badge: "Hệ Điều Khiển Nhóm",
        summary: "Hệ vi xử lý phân tầng thông minh & Thẻ từ RFID / FaceID",
        specs: [
          "Thuật toán điều khiển Duplex/Simplex tối ưu thời gian chờ thang",
          "Tích hợp đầu đọc thẻ từ phân quyền tầng cho từng doanh nghiệp",
          "Màn hình LCD hiển thị tầng, hướng chạy và bản tin nội bộ"
        ]
      },
      {
        icon: "bi-shield-check",
        title: "An Toàn & Cứu Hộ Độc Lập",
        badge: "Cấp An Toàn Tối Cao",
        summary: "Bộ lưu điện UPS công suất lớn & Rèm hồng ngoại",
        specs: [
          "UPS cứu hộ tự động đưa cabin về tầng gần nhất khi mất điện lưới",
          "Cảm biến mành hồng ngoại 2 bên cửa chống va chạm hành khách",
          "Thắng cơ governor kép và công tắc giới hạn hành trình an toàn"
        ]
      },
      {
        icon: "bi-building-gear",
        title: "Hố Thang & Yêu Cầu Xây Dựng",
        badge: "Hố Thang Tiêu Chuẩn",
        summary: "Hố bê tông cốt thép hoặc khung thép chịu lực",
        specs: [
          "Hố Pit: Từ 1200mm - 1400mm đảm bảo khoảng an toàn kỹ thuật",
          "Chiều cao tầng trên cùng OH: Khoảng 4200mm - 4500mm",
          "Nguồn điện: Điện 3 pha 380V công nghiệp ổn định"
        ]
      }
    ],
    giaThanh: [
      ["Tòa nhà nhỏ", "Khoảng 550 - 850 triệu VNĐ", "Tải khách vừa, số tầng thấp (4-6 tầng), cấu hình tiêu chuẩn bền bỉ."],
      ["Văn phòng trung bình", "Khoảng 850 triệu - 1,4 tỷ VNĐ", "Tần suất cao hơn, cabin rộng rãi, cửa tự động êm, biến tần cao cấp."],
      ["Cấu hình riêng", "Liên hệ khảo sát", "Nhiều điểm dừng (7-12 tầng), tốc độ cao 1.75m/s, thẻ từ phân tầng."],
    ],
    thongSo: [
      ["Tải trọng", "450kg - 1000kg (6 - 15 người)"],
      ["Số người", "6 - 15 người"],
      ["Tốc độ tham khảo", "1.0 - 1.75 m/s"],
      ["Cửa tầng", "Cửa tự động 2 cánh mở tim (CO) hoặc 4 cánh"],
      ["Vật liệu cabin", "Inox 304 sọc nhuyễn chống vân tay, phối Inox gương"],
      ["Ứng dụng", "Tòa nhà văn phòng, showroom, trụ sở công ty"],
    ],
    uuDiem: [
      "Tăng năng lực phục vụ nhân viên và khách hàng trong giờ cao điểm sáng - trưa - chiều.",
      "Tạo hình ảnh sang trọng, chuyên nghiệp và nâng tầm đẳng cấp tòa nhà.",
      "Hệ thống thẻ từ phân quyền giúp kiểm soát an ninh từng văn phòng hiệu quả.",
      "Dễ bảo trì định kỳ ngoài giờ hành chính mà không gián đoạn công việc."
    ],
    nhuocDiem: [
      "Cần tính toán đúng lưu lượng người để chọn tải trọng và tốc độ phù hợp.",
      "Yêu cầu nguồn điện 3 pha ổn định và hố thang có kích thước tiêu chuẩn.",
      "Chi phí đầu tư ban đầu cao hơn so với thang máy tải trọng nhỏ gia đình."
    ],
    luuY: [
      "Nên khảo sát diện tích sảnh chờ thang để đảm bảo luồng người không bị ùn tắc.",
      "Cần bố trí máy phát điện dự phòng hoặc tủ cứu hộ UPS tự động.",
      "Lập hợp đồng bảo trì định kỳ hàng tháng để kiểm tra cáp và hệ thống phanh an toàn."
    ],
  },
  "thang-may-doanh-nghiep": {
    tongQuan:
      "Phù hợp nhà xưởng, kho, trụ sở doanh nghiệp hoặc khu sản xuất cần vận chuyển người, hàng nhẹ hoặc thiết bị. Trọng tâm là độ bền, tải trọng, an toàn vận hành và khả năng sửa chữa nhanh.",
    studioType: "inox-tieu-chuan",
    studioTitle: "Cabin Thang Máy Doanh Nghiệp Chịu Tải Cao",
    cauHinhThietBi: [
      {
        icon: "bi-gear-wide-connected",
        title: "Máy Kéo Chịu Tải Lớn",
        badge: "Moment Xoắn Lớn",
        summary: "Động cơ chịu tải nặng từ 750kg đến 3000kg+",
        specs: [
          "Mô-men xoắn cực đại, kéo tải hàng hóa và pallet êm ru",
          "Hộp số giảm tốc chịu tải liên tục hoặc máy kéo gearless công suất cao",
          "Hệ thống phanh đôi chống trôi cabin khi xếp hàng nặng"
        ]
      },
      {
        icon: "bi-link-45deg",
        title: "Cáp Tải & Ray Hạng Nặng",
        badge: "Gia Cường Chịu Lực",
        summary: "Cáp tải cường độ cao & Ray dẫn hướng T-beam cỡ lớn",
        specs: [
          "Ray dẫn hướng bản dày chống vặn xoắn khi xe nâng đưa hàng vào",
          "Nhiều tao cáp thép đúc bôi trơn chuyên dụng chống mài mòn",
          "Bộ giảm chấn thủy lực đáy hố hành trình dài chống va đập"
        ]
      },
      {
        icon: "bi-box-seam",
        title: "Cabin & Sàn Chống Trượt",
        badge: "Thép Chống Va Đập",
        summary: "Thép chấn dập gân dày 2-3mm hoặc Inox tấm chịu lực",
        specs: [
          "Sàn cabin thép tấm gân chống trượt hoặc tôn nhám siêu chịu tải",
          "Nẹp cản va cao su công nghiệp bảo vệ vách cabin không bị trầy móp",
          "Cửa mở rộng tối đa (2S hoặc 4CO) cho xe nâng tay và pallet ra vào"
        ]
      },
      {
        icon: "bi-cpu",
        title: "Tủ Điều Khiển Chuyên Dụng",
        badge: "Chống Nhiễu Công Nghiệp",
        summary: "Tủ điện công nghiệp chịu bụi và chống ẩm tốt",
        specs: [
          "Linh kiện công nghiệp chịu nhiệt độ cao và độ ẩm nhà xưởng",
          "Chế độ giữ cửa mở lâu khi bốc dỡ hàng hóa thuận tiện",
          "Nút bấm to rõ ràng, có khóa chuyên dụng cho nhân viên kho"
        ]
      },
      {
        icon: "bi-shield-check",
        title: "Cảm Biến Quá Tải & Khóa Cửa",
        badge: "An Toàn Chở Hàng",
        summary: "Cân tải trọng điện tử & Khóa liên động cơ điện",
        specs: [
          "Bộ cảm biến cân tải: Báo còi và không chạy khi vượt tải trọng cho phép",
          "Khóa cơ điện liên động cửa tầng tuyệt đối an toàn khi cabin chưa tới",
          "Hệ thống liên lạc intercom khẩn cấp nối về phòng điều hành"
        ]
      },
      {
        icon: "bi-building-gear",
        title: "Hố Thang Nhà Xưởng",
        badge: "Kết Cấu Bền Vững",
        summary: "Khung thép hình H hoặc giếng bê tông chịu lực lớn",
        specs: [
          "Đáy hố Pit đổ bê tông chống thấm và chịu lực va đập lớn",
          "Chiều cao tầng trên cùng OH thiết kế linh hoạt theo khẩu độ mái kho",
          "Nguồn điện 3 pha công nghiệp 380V riêng biệt"
        ]
      }
    ],
    giaThanh: [
      ["Tải hàng nhẹ", "Khoảng 450 - 900 triệu VNĐ", "Tải trọng 500-750kg, phục vụ kho nhỏ, cửa mở tay hoặc tự động, cabin cơ bản."],
      ["Tải khách kết hợp", "Khoảng 700 triệu - 1,5 tỷ VNĐ", "Dùng cho văn phòng doanh nghiệp hoặc khu sản xuất có nhân sự di chuyển."],
      ["Tải trọng lớn", "Khảo sát báo giá", "Tải trọng 1000kg - 3000kg+, yêu cầu ray nặng, cửa rộng và máy kéo công suất lớn."],
    ],
    thongSo: [
      ["Tải trọng", "750kg - 2500kg+"],
      ["Mục đích", "Chở người, hàng hóa, thiết bị, pallet hàng"],
      ["Sàn cabin", "Thép gân chống trượt hoặc Inox tấm chịu lực"],
      ["Cửa", "Cửa tự động 2 cánh mở lùa (2S) hoặc 4 cánh mở tim (4CO)"],
      ["Yêu cầu chính", "Bền bỉ, chịu va đập, dễ bảo trì, hoạt động liên tục"],
      ["Khu vực lắp", "Nhà xưởng, kho logistics, trụ sở công ty"],
    ],
    uuDiem: [
      "Tối ưu vận chuyển hàng hóa nội bộ giữa các tầng nhanh chóng, an toàn.",
      "Giảm đáng kể chi phí nhân công bốc vác thủ công và hạn chế rơi vỡ hàng.",
      "Thiết kế kích thước cabin may đo chính xác theo pallet và kiện hàng thực tế.",
      "Khung thang chịu lực cao hoạt động bền bỉ trong môi trường công nghiệp."
    ],
    nhuocDiem: [
      "Yêu cầu kết cấu móng và hố thang chịu tải trọng lớn hơn thang dân dụng.",
      "Chi phí đầu tư phụ thuộc lớn vào tải trọng và kích thước khẩu độ cửa.",
      "Cần kiểm tra định kỳ hệ thống cáp tải và bộ cảm biến quá tải."
    ],
    luuY: [
      "Cần xác định kích thước kiện hàng lớn nhất và loại xe đẩy trước khi lên bản vẽ.",
      "Nên tách luồng chở hàng nặng và luồng nhân viên nếu tần suất sử dụng cao.",
      "Chọn vật liệu vách và sàn dễ vệ sinh, khó trầy xước và chịu lực va đập tốt."
    ],
  },
  "thang-may-khach-san": {
    tongQuan:
      "Dành cho khách sạn, căn hộ dịch vụ và công trình lưu trú cần trải nghiệm đi thang êm, thẩm mỹ sang trọng và ổn định. Nội thất cabin và độ yên tĩnh là yếu tố quan trọng vì ảnh hưởng trực tiếp cảm nhận khách hàng.",
    studioType: "inox-guong-vang",
    studioTitle: "Cabin Khách Sạn Hoàng Gia Inox Gương Vàng PVD",
    cauHinhThietBi: [
      {
        icon: "bi-gear-wide-connected",
        title: "Máy Kéo Êm Ái Chuẩn VDI 2566",
        badge: "Triệt Tiêu Rung Ồn",
        summary: "Động cơ đồng bộ nam châm vĩnh cửu tiêu chuẩn 5 sao",
        specs: [
          "Độ ồn cực thấp dưới 45dB, đệm cao su giảm chấn kép dưới bệ máy",
          "Khởi động và dừng êm tuyệt đối, không gây tiếng vang vào phòng ngủ",
          "Tiết kiệm điện năng tối đa khi hoạt động liên tục đón khách"
        ]
      },
      {
        icon: "bi-link-45deg",
        title: "Cáp Tải & Puly Composite",
        badge: "Êm Ái Tuyệt Đối",
        summary: "Cáp kéo chuyên dụng êm ái kết hợp puly đúc chống ồn",
        specs: [
          "Cáp thép dẻo bọc nhựa polymer giảm thiểu ma sát âm thanh",
          "Puly dẫn hướng bọc lớp giảm ồn cao cấp, khử rung dọc hố thang",
          "Ray dẫn hướng gia công độ bóng cao giúp guốc trượt lướt êm ái"
        ]
      },
      {
        icon: "bi-box-seam",
        title: "Cabin Hoàng Gia Luxury",
        badge: "Tùy Biến 2D",
        summary: "Inox gương vàng PVD 8K, ốp gỗ Walnut và sàn đá CNC",
        specs: [
          "Vách Inox gương vàng PVD 8K khắc hoa văn laser tinh xảo",
          "Sàn đá cẩm thạch CNC Mandala hoặc đá hoa cương nẹp chỉ đồng",
          "Trần khe hắt LED vàng ấm 3000K, tay vịn gỗ tròn bọc đầu kim loại"
        ]
      },
      {
        icon: "bi-cpu",
        title: "Hệ Điều Khiển Thẻ Phòng Khách Sạn",
        badge: "Bảo Mật Keycard",
        summary: "Tích hợp hệ thống khóa thẻ tầng RFID / thẻ từ phòng khách",
        specs: [
          "Khách quẹt thẻ phòng chỉ bấm được đúng tầng lưu trú của mình",
          "Màn hình LCD hiển thị video quảng bá dịch vụ và phát nhạc nền êm dịu",
          "Bộ điều khiển thông minh tự động về sảnh chính chờ khách"
        ]
      },
      {
        icon: "bi-shield-check",
        title: "An Toàn & Cứu Hộ Độc Lập",
        badge: "An Toàn 24/7",
        summary: "Hệ thống cứu hộ tự động ARD kép & Camera cabin",
        specs: [
          "Bộ ARD đưa cabin về tầng gần nhất và mở cửa ngay khi có sự cố điện",
          "Cảm biến cửa toàn chiều cao không kẹp hành lý và trẻ nhỏ",
          "Điện thoại Intercom nối trực tiếp đến quầy lễ tân trực 24/24"
        ]
      },
      {
        icon: "bi-building-gear",
        title: "Hố Thang & Mỹ Quan Sảnh",
        badge: "Đồng Bộ Kiến Trúc",
        summary: "Cửa tầng ốp Inox vàng đồng bộ với sảnh đón tiếp",
        specs: [
          "Bao che cửa tầng và chỉ viền mạ vàng PVD sang trọng",
          "Hố thang bê tông hoặc khung thép kính tùy biến theo phong cách sảnh",
          "Hệ thống cách âm hố giếng thang chống lọt tiếng vào phòng ngủ"
        ]
      }
    ],
    giaThanh: [
      ["Khách sạn nhỏ / Homestay", "Khoảng 650 triệu - 1 tỷ VNĐ", "Tải khách 450-630kg, nội thất đẹp mắt, số tầng 4-6, động cơ không hộp số."],
      ["Khách sạn 3-4 sao", "Khoảng 1 - 1,8 tỷ VNĐ", "Tải trọng 800-1000kg, vận hành siêu êm, cabin Inox gương vàng, tích hợp thẻ phòng."],
      ["Thiết kế cao cấp 5 sao", "Khảo sát báo giá", "Đồng bộ nhận diện thương hiệu, màn hình LCD đa phương tiện, tốc độ cao."],
    ],
    thongSo: [
      ["Tải trọng", "630kg - 1000kg (8 - 15 người)"],
      ["Số người", "8 - 15 người"],
      ["Ưu tiên", "Vận hành siêu êm, không tiếng ồn, nội thất sang trọng"],
      ["Cabin", "Inox gương vàng PVD, champagne, kính Panorama, đá hoa cương"],
      ["Tính năng", "Tích hợp thẻ phòng, camera, intercom 24/7, cứu hộ tự động ARD"],
      ["Ứng dụng", "Khách sạn, căn hộ dịch vụ cao cấp, resort, homestay VIP"],
    ],
    uuDiem: [
      "Nâng tầm trải nghiệm khách lưu trú và khẳng định đẳng cấp công trình khách sạn.",
      "Thiết kế cabin sang trọng, lung linh giúp khách check-in và ấn tượng sâu sắc.",
      "Phù hợp vận hành đón khách liên tục với độ ổn định cao, tiết kiệm điện năng.",
      "Tích hợp thẻ phòng thông minh đảm bảo an ninh tuyệt đối cho khách hàng."
    ],
    nhuocDiem: [
      "Chi phí hoàn thiện nội thất cabin và vật liệu mạ PVD cao hơn dòng thông thường.",
      "Yêu cầu kiểm soát độ rung và tiếng ồn khắt khe để tránh ảnh hưởng giấc ngủ khách.",
      "Cần kế hoạch bảo dưỡng định kỳ đều đặn để giữ thiết bị luôn mới đẹp."
    ],
    luuY: [
      "Nên thiết kế bao che cửa tầng đồng bộ với phong cách nội thất sảnh đón tiếp.",
      "Tính toán kỹ lưu lượng khách giờ nhận/trả phòng và nhân viên dọn phòng để chọn tải trọng.",
      "Bố trí phương án cứu hộ tự động và đường dây khẩn cấp hoạt động 24/7."
    ],
  },
  "cua-sap": {
    tongQuan:
      "Cửa sập thường dùng cho khu kỹ thuật, kho, cửa lên mái hoặc vị trí cần đóng mở gọn và bảo vệ lối tiếp cận. Giải pháp cần chú trọng độ chắc, an toàn khóa và chống thấm nếu đặt ngoài trời.",
    studioType: "inox-tieu-chuan",
    studioTitle: "Thiết Kế Cơ Khí & Cửa Sập Chuyên Dụng",
    cauHinhThietBi: [
      {
        icon: "bi-shield-shaded",
        title: "Khung Thép & Vật Liệu",
        badge: "Thép / Inox 304",
        summary: "Thép mạ kẽm sơn tĩnh điện hoặc Inox SUS 304 chống gỉ",
        specs: [
          "Khung thép chấn dày 2.5 - 4mm chịu lực giẫm đạp và tải trọng nặng",
          "Vật liệu chống oxy hóa, chống rỉ sét ngay cả khi đặt ngoài trời",
          "Mối hàn xử lý ngấu phẳng, tính thẩm mỹ cơ khí cao"
        ]
      },
      {
        icon: "bi-arrow-down-up",
        title: "Cơ Chế Mở & Trợ Lực",
        badge: "Piston Trợ Lực",
        summary: "Hệ thống ty đẩy thủy lực hoặc lò xo trợ lực nhẹ nhàng",
        specs: [
          "Piston thủy lực trợ lực nâng giúp mở cửa dễ dàng chỉ bằng một tay",
          "Cơ cấu chặn hành trình chống sập cửa đột ngột gây nguy hiểm",
          "Có thể tích hợp motor kéo tự động điều khiển bằng remote"
        ]
      },
      {
        icon: "bi-droplet-half",
        title: "Ron Cao Su Chống Nước",
        badge: "Kín Khít Chống Thấm",
        summary: "Hệ thống rãnh thoát nước và gioăng cao su EPDM",
        specs: [
          "Gioăng cao su đôi EPDM ngăn nước mưa và bụi bẩn xâm nhập",
          "Máng thu nước âm quanh miệng khung xả ra ngoài trời",
          "Ngăn mùi và cách âm hiệu quả cho phòng kỹ thuật"
        ]
      },
      {
        icon: "bi-key",
        title: "Hệ Thống Khóa An Toàn",
        badge: "Bảo Mật Cao",
        summary: "Khóa âm chống cạy phá hoặc khóa chốt an toàn 2 mặt",
        specs: [
          "Khóa cơ âm giấu lỗ chống cắt và cạy phá từ bên ngoài",
          "Tay gạt mở khẩn cấp từ bên trong khi cần thoát hiểm",
          "Có thể tích hợp công tắc cảm biến chống đột nhập"
        ]
      },
      {
        icon: "bi-rulers",
        title: "Kích Thước May Đo Hiện Trạng",
        badge: "Gia Công Theo Yêu Cầu",
        summary: "Đo đạc và sản xuất chuẩn theo kích thước ô chờ công trình",
        specs: [
          "Khảo sát đo đạc hiện trạng ô chờ chính xác đến từng milimet",
          "Chế tạo theo tải trọng yêu cầu (chở người, xe máy hoặc máy móc)",
          "Lắp đặt hoàn thiện nhanh chóng trong ngày"
        ]
      },
      {
        icon: "bi-wrench-adjustable",
        title: "Bảo Trì & Thay Thế Phụ Kiện",
        badge: "Dễ Dàng Bảo Dưỡng",
        summary: "Bản lề cối và phụ kiện tiêu chuẩn dễ thay thế",
        specs: [
          "Bản lề cối chịu lực mạ kẽm hoặc inox tuổi thọ cao",
          "Ty đẩy thủy lực dễ dàng thay mới định kỳ sau nhiều năm sử dụng",
          "Bảo hành cơ khí dài hạn từ Hà Hồng Elevator"
        ]
      }
    ],
    giaThanh: [
      ["Cơ bản", "Liên hệ báo giá", "Kích thước nhỏ, vật liệu thép sơn chống gỉ, thao tác tay thủ công."],
      ["Gia cường trợ lực", "Theo kích thước thực tế", "Khung thép/inox dày, ty đẩy thủy lực trợ lực nhẹ, khóa âm an toàn."],
      ["Thiết kế riêng tự động", "Khảo sát báo giá", "Kích thước đặc biệt, chống thấm ngoài trời tuyệt đối, motor đóng mở remote."],
    ],
    thongSo: [
      ["Vật liệu", "Thép mạ kẽm sơn tĩnh điện, Inox SUS 304"],
      ["Ứng dụng", "Kho, phòng máy thang máy, khu kỹ thuật, lối lên sân thượng"],
      ["Cơ chế mở", "Mở tay trợ lực piston thủy lực hoặc motor điện"],
      ["Yêu cầu", "Chắc chắn, kín khít chống thấm, an toàn khóa chống cạy"],
      ["Hoàn thiện", "Sơn sần chống trầy, sơn tĩnh điện hoặc Inox xước hairline"],
      ["Kích thước", "Gia công may đo theo thực tế hiện trạng công trình"],
    ],
    uuDiem: [
      "Thiết kế gọn gàng, tối ưu diện tích cho khu vực kỹ thuật và lối lên mái.",
      "Gia công may đo chuẩn xác theo kích thước ô chờ hiện trạng.",
      "Hệ thống piston trợ lực giúp đóng mở nhẹ nhàng, không tốn sức.",
      "Dễ kiểm tra và thay thế phụ kiện cơ khí khi cần thiết."
    ],
    nhuocDiem: [
      "Không phù hợp khu vực sảnh chính cần tính thẩm mỹ kiến trúc mở.",
      "Cần thi công rãnh thoát nước kín mép nếu lắp đặt trực tiếp ngoài trời.",
      "Bản lề và ty đẩy thủy lực cần tra dầu mỡ bảo dưỡng định kỳ."
    ],
    luuY: [
      "Cần đo chính xác ô chờ sàn bê tông trước khi đặt xưởng gia công.",
      "Nếu đặt ngoài trời bắt buộc dùng thép mạ kẽm sơn tĩnh điện hoặc Inox 304.",
      "Nên chọn cơ chế có khóa an toàn bên trong để đảm bảo thoát hiểm khi cần."
    ],
  },
  "thang-cuon": {
    tongQuan:
      "Thang cuốn phù hợp trung tâm thương mại, siêu thị, nhà ga hoặc tòa nhà công cộng có lưu lượng di chuyển lớn. Thiết kế cần quan tâm dòng người, hướng di chuyển, độ an toàn và kế hoạch bảo trì liên tục.",
    studioType: "homelift-kinh",
    studioTitle: "Thiết Kế Thang Cuốn Hiện Đại Cho Tòa Nhà Thương Mại",
    cauHinhThietBi: [
      {
        icon: "bi-gear-wide-connected",
        title: "Động Cơ & Hộp Số Thang Cuốn",
        badge: "Vận Hành Bền Bỉ",
        summary: "Động cơ công suất lớn chịu tải dòng người liên tục",
        specs: [
          "Hộp số bánh răng xoắn hiệu suất cao, vận hành liên tục 16-24h/ngày",
          "Phanh phụ trợ tự động kích hoạt khi có sự cố đứt xích hoặc trôi thang",
          "Biến tần tiết kiệm điện tự giảm tốc độ khi không có hành khách"
        ]
      },
      {
        icon: "bi-link-45deg",
        title: "Hệ Xích Tải & Bậc Thang",
        badge: "Hợp Kim Nhôm Đúc",
        summary: "Xích tải con lăn kép và bậc thang hợp kim nhôm định hình",
        specs: [
          "Bậc thang nhôm đúc nguyên khối chịu lực cao, rãnh chống trượt sắc nét",
          "Viền chỉ vàng cảnh báo an toàn quanh 3 cạnh bậc thang",
          "Hệ xích tải chịu lực kéo đứt cao với bôi trơn tự động vi xử lý"
        ]
      },
      {
        icon: "bi-hand-index-thumb",
        title: "Tay Vịnh & Lan Can Kính",
        badge: "Kính Cường Lực",
        summary: "Tay vịn cao su tổng hợp đồng bộ tốc độ và lan can kính 10mm",
        specs: [
          "Tay vịn chuyển động đồng bộ chính xác với tốc độ bậc thang",
          "Lan can kính cường lực an toàn trong suốt 10mm sang trọng",
          "Đèn LED chiếu sáng rãnh bậc và gầm tay vịn hiện đại"
        ]
      },
      {
        icon: "bi-cpu",
        title: "Tủ Điều Khiển Vi Xử Lý",
        badge: "Cảm Biến Tự Động",
        summary: "Hệ thống vi xử lý giám sát an toàn toàn diện",
        specs: [
          "Màn hình chẩn đoán lỗi hiển thị mã số hỗ trợ bảo trì nhanh",
          "Mắt thần cảm biến quang học phát hiện người bước vào để tăng tốc",
          "Hệ thống tự động đảo chiều di chuyển theo giờ cao điểm"
        ]
      },
      {
        icon: "bi-shield-check",
        title: "Hệ Thống An Toàn Đa Điểm",
        badge: "30+ Cảm Biến",
        summary: "Nút dừng khẩn cấp, cảm biến kẹp váy và chổi an toàn",
        specs: [
          "Chổi an toàn skirt brush chống kẹp giày dép vào khe hông",
          "Nút dừng khẩn cấp (Emergency Stop) bố trí ở cả 2 đầu thang",
          "Cảm biến lược đĩa comb plate tự ngắt khi kẹt dị vật"
        ]
      },
      {
        icon: "bi-building-gear",
        title: "Kết Cấu Giàn Thép Truss",
        badge: "Thép Chịu Lực Cao",
        summary: "Giàn thép kết cấu tam giác chịu lực võng cực nhỏ",
        specs: [
          "Giàn thép mạ kẽm sơn chống gỉ tuổi thọ trên 30 năm",
          "Gối đỡ giảm chấn cách âm tiếp xúc với dầm bê tông sàn",
          "Góc nghiêng 30° hoặc 35° tối ưu theo chiều cao tầng công trình"
        ]
      }
    ],
    giaThanh: [
      ["Cấu hình tiêu chuẩn", "Liên hệ khảo sát", "Chiều cao tầng phổ biến (3.5m - 4.5m), lưu lượng vừa, vị trí lắp thuận lợi."],
      ["Lưu lượng cao", "Theo cấu hình kỹ thuật", "Bản rộng 1000mm, kính cường lực, cảm biến tự động tiết kiệm điện."],
      ["Công trình đặc biệt", "Khảo sát báo giá", "Yêu cầu ngoài trời, chiều cao vượt nhịp lớn hoặc đồng bộ chuỗi thang cuốn."],
    ],
    thongSo: [
      ["Góc nghiêng", "30° hoặc 35° tùy theo mặt bằng kiến trúc"],
      ["Bề rộng bậc", "600mm, 800mm hoặc 1000mm"],
      ["Tốc độ tham khảo", "0.5 m/s (tiêu chuẩn quốc tế)"],
      ["Ứng dụng", "Trung tâm thương mại, siêu thị, nhà ga, sân bay"],
      ["An toàn", "30+ cảm biến, chổi an toàn skirt brush, nút dừng khẩn cấp"],
      ["Bảo trì", "Kiểm tra định kỳ hàng tháng theo tần suất vận hành liên tục"],
    ],
    uuDiem: [
      "Phục vụ dòng người di chuyển liên tục tốt nhất, không có thời gian chờ.",
      "Tăng tính thuận tiện và kích thích lưu thông mua sắm tại trung tâm thương mại.",
      "Tạo điểm nhấn thị giác hiện đại, hoành tráng trong không gian thông tầng.",
      "Độ bền cơ khí cực cao, vận hành bền bỉ nhiều năm liên tục."
    ],
    nhuocDiem: [
      "Chiếm diện tích mặt bằng sàn lớn hơn thang máy cabin thẳng đứng.",
      "Chi phí đầu tư và vận chuyển phụ thuộc lớn vào chiều dài giàn thép truss.",
      "Cần lịch bảo trì, tra mỡ xích và kiểm tra cảm biến an toàn thường xuyên."
    ],
    luuY: [
      "Cần tính toán hướng lưu thông của khách để đặt thang đúng luồng giao thông chính.",
      "Khu vực đầu và cuối thang phải có khoảng đệm tối thiểu 2.5m để tránh ùn tắc.",
      "Nên bố trí biển cảnh báo và kiểm định an toàn nghiêm ngặt trước khi khai trương."
    ],
  },
};

function dinhDangNgay(value) {
  if (!value) return "Đang cập nhật";
  return new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(new Date(value));
}

function layNoiDungChiTiet(duAn) {
  const cat = chuanHoaPhanLoaiDuAn(duAn.category || "");
  return (
    noiDungChiTietTheoSlug[duAn.slug] ||
    noiDungChiTietTheoSlug[cat] ||
    noiDungChiTietTheoSlug[`thang-may-${cat}`] ||
    noiDungChiTietTheoSlug[duAn.category] ||
    noiDungChiTietTheoSlug["thang-may-gia-dinh"]
  );
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
            <span className="section-eyebrow">GIẢI PHÁP THIẾT KẾ &amp; THI CÔNG</span>
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

          {/* =====================================================================
              1. CẤU HÌNH THIẾT BỊ & BỘ PHẬN CỐT LÕI (Loại thang máy này cần gì?)
              Bento Grid 6 thẻ: Động cơ/Máy kéo, Cáp kéo, Cabin, Tủ điện, An toàn, Hố thang
             ===================================================================== */}
          {noiDungChiTiet.cauHinhThietBi && (
            <div className="project-equip-section" data-aos="fade-up">
              <div className="project-equip-heading">
                <span className="section-eyebrow">CẤU HÌNH KỸ THUẬT CỐT LÕI</span>
                <h2>Dòng thang này cần trang bị những thiết bị gì?</h2>
                <p>
                  Hà Hồng Elevator tuyển chọn các bộ phận cơ khí và điện tử chuẩn quốc tế, đảm bảo vận hành êm ái, bền bỉ và an toàn tuyệt đối cho người sử dụng.
                </p>
              </div>

              <div className="project-equip-grid">
                {noiDungChiTiet.cauHinhThietBi.map((item) => (
                  <article className="project-equip-card" key={item.title}>
                    <div className="equip-card-top">
                      <div className="equip-card-icon">
                        <i className={`bi ${item.icon}`}></i>
                      </div>
                      <div className="equip-card-meta">
                        <h3>{item.title}</h3>
                        <span className="equip-card-badge">{item.badge}</span>
                      </div>
                    </div>
                    <div className="equip-card-summary">{item.summary}</div>
                    <ul className="equip-card-specs">
                      {item.specs.map((spec, sIdx) => (
                        <li key={sIdx}>
                          <i className="bi bi-check2-circle"></i>
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================================
              2. BANNER KÊU GỌI TRẢI NGHIỆM THỬ PHÒNG THIẾT KẾ CABIN 2D TRỰC TUYẾN
             ===================================================================== */}
          <section className="project-studio-banner" data-aos="fade-up">
            <div className="project-studio-banner-inner">
              <div className="project-studio-info">
                <span className="project-studio-tag">
                  <i className="bi bi-palette-fill"></i>
                  STUDIO THIẾT KẾ CABIN 2D HÀ HỒNG
                </span>
                <h2>Xem Thử &amp; Tùy Biến Mẫu Cabin 2D Thực Tế</h2>
                <p>
                  Quý khách muốn xem mẫu <strong>{noiDungChiTiet.studioTitle || duAn.name}</strong> khi lên hình sẽ như thế nào? Hãy thử phối màu vách Inox gương vàng PVD, vách kính Panorama 360°, sàn đá hoa cương nẹp đồng và hệ thống trần đèn LED ngay trên trình duyệt!
                </p>
              </div>

              <div className="project-studio-actions">
                <Link
                  to={`/thiet-ke-cabin?type=${noiDungChiTiet.studioType || "homelift-kinh"}`}
                  className="btn-studio-primary"
                >
                  <i className="bi bi-palette2"></i>
                  <span>Thử Phối Màu Cabin 2D</span>
                  <i className="bi bi-arrow-right"></i>
                </Link>

                <Link to="/du-toan" className="btn-studio-secondary">
                  <i className="bi bi-calculator"></i>
                  <span>Nhận Dự Toán Chi Tiết</span>
                </Link>
              </div>
            </div>
          </section>

          {/* =====================================================================
              3. BẢNG GIÁ DỰ KIẾN & THÔNG SỐ THAM KHẢO (ĐÃ TINH GỌN, KHÔNG RỐI MẮT)
             ===================================================================== */}
          <div className="project-detail-content-grid">
            <article className="project-detail-panel project-detail-panel-wide" data-aos="fade-up">
              <div className="project-detail-panel-title">
                <i className="bi bi-cash-coin"></i>
                <div>
                  <span>GIÁ THÀNH</span>
                  <h2>Khoảng chi phí thường gặp</h2>
                </div>
              </div>
              <div className="project-price-table-clean">
                {noiDungChiTiet.giaThanh.map(([goi, gia, ghiChu]) => (
                  <div className="project-price-card" key={goi}>
                    <div className="project-price-card-header">
                      <span className="project-price-tier-name">{goi}</span>
                      <span className="project-price-tier-val">{gia}</span>
                    </div>
                    <p className="project-price-card-desc">{ghiChu}</p>
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
              <dl className="project-spec-list-clean">
                {noiDungChiTiet.thongSo.map(([label, value]) => (
                  <div className="project-spec-row" key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          </div>

          {/* =====================================================================
              4. ƯU ĐIỂM & CẦN CÂN NHẮC (THIẾT KẾ ĐỐI XỨNG CÂN ĐỐI, DỄ ĐỌC)
             ===================================================================== */}
          <div className="project-pros-cons-grid" data-aos="fade-up">
            <div className="project-pros-card">
              <div className="pros-cons-title">
                <i className="bi bi-check-circle-fill fs-5"></i>
                <span>Điểm Phù Hợp &amp; Ưu Thế</span>
              </div>
              <ul className="pros-cons-list">
                {noiDungChiTiet.uuDiem.map((item) => (
                  <li key={item}>
                    <i className="bi bi-check-lg"></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="project-cons-card">
              <div className="pros-cons-title">
                <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                <span>Cần Cân Nhắc &amp; Lưu Ý</span>
              </div>
              <ul className="pros-cons-list">
                {noiDungChiTiet.nhuocDiem.map((item) => (
                  <li key={item}>
                    <i className="bi bi-dot fs-4"></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* LƯU Ý KHI KHẢO SÁT */}
          <article className="project-note-box mt-4" data-aos="fade-up">
            <div>
              <span className="section-eyebrow">LƯU Ý TRƯỚC KHI THI CÔNG</span>
              <h2>Các điểm kỹ sư Hà Hồng sẽ kiểm tra khi khảo sát công trình</h2>
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
