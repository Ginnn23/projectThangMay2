import { useState, useEffect, useRef } from "react";
import "./CabinVisualizer.css";

// =============================================================================
// DỮ LIỆU CẤU HÌNH VẬT LIỆU CHUẨN KIẾN TRÚC THANG MÁY CAO CẤP
// (Dựa trên ảnh thực tế: Inox xước Hairline, PVD Gold, Gỗ Óc Chó, Đá Chevron nẹp đồng,
//  Đá Marble tia chớp Nero Marquina, Sàn gỗ ghép thanh, Terrazzo cát mịn)
// =============================================================================

// 1. VÁCH CABIN (6 TÙY CHỌN CHÂN THỰC)
export const WALL_OPTIONS = [
  {
    id: "wood-walnut-mirror",
    code: "HAHONG-W01",
    name: "Gỗ Óc Chó Phối Gương Soi & Nẹp Inox",
    spec: "Gỗ Walnut 15mm • Gương bỉ 5mm • Nẹp titan",
    desc: "Vách gỗ óc chó tự nhiên phối gương soi trung tâm & nẹp kim loại sang trọng (Chuẩn Villa & Dinh Thự)",
    badge: "Villa & Dinh Thự 5★",
    syncValue: "biet-thu-walnut",
    type: "wood-mirror"
  },
  {
    id: "inox-tieu-chuan",
    code: "HAHONG-W02",
    name: "Inox 304 Sọc Nhuyễn Hairline",
    spec: "SUS 304 dày 1.5mm • Vân xước satin mịn",
    desc: "Bề mặt chải xước kim loại satin chống bám vân tay, bền bỉ cơ học vĩnh cửu",
    badge: "Tiêu chuẩn bền bỉ",
    syncValue: "inox-tieu-chuan",
    type: "hairline"
  },
  {
    id: "inox-guong-vang",
    code: "HAHONG-W03",
    name: "Inox Gương Vàng PVD Hoàng Gia",
    spec: "Mạ PVD Champagne Gold 8K • Titan chống xước",
    desc: "Mạ titan PVD vàng Champagne kim loại quý phái, phản chiếu ánh sáng tự nhiên",
    badge: "Sang trọng PVD",
    syncValue: "inox-guong-vang",
    type: "gold-pvd"
  },
  {
    id: "inox-guong-bac",
    code: "HAHONG-W04",
    name: "Inox Gương Bạc Phản Chiếu 8K",
    spec: "SUS 304 đánh bóng gương 8K • Mở rộng không gian",
    desc: "Độ phản chiếu quang học trong trẻo, tạo chiều sâu vô tận cho cabin",
    badge: "Gương 8K mở rộng",
    syncValue: "inox-tieu-chuan",
    type: "silver-mirror"
  },
  {
    id: "wood-oak-scandi",
    code: "HAHONG-W05",
    name: "Gỗ Sồi Tự Nhiên Nẹp Chỉ Đen Bắc Âu",
    spec: "Gỗ Oak sáng màu • Nẹp chỉ kim loại đen mờ",
    desc: "Gỗ sồi phong cách Scandinavian chia mảng nẹp chỉ đen thanh lịch, ấm áp",
    badge: "Bắc Âu Tinh Tế",
    syncValue: "inox-tieu-chuan",
    type: "oak-scandi"
  },
  {
    id: "kinh-cuong-luc",
    code: "HAHONG-W06",
    name: "Kính Cường Lực Trong Suốt Panorama",
    spec: "Kính an toàn 10mm siêu trong • Mài vát cạnh",
    desc: "Kính an toàn lấy sáng tự nhiên tối đa, ngắm cảnh quan 4 mặt cho thang Homelift",
    badge: "Homelift Panorama",
    syncValue: "homelift-kinh",
    type: "glass"
  }
];

// 2. SÀN ĐÁ & GỖ CABIN (5 TÙY CHỌN TỪ ẢNH CHỤP THỰC TẾ)
export const FLOOR_OPTIONS = [
  {
    id: "floor-chevron-brass",
    code: "HAHONG-F01",
    name: "Đá Cẩm Thạch Nẹp Chỉ Đồng Xương Cá",
    spec: "Đá sáng mài bóng • Nẹp chỉ đồng vàng Chevron",
    desc: "Nền đá tự nhiên nẹp các đường chỉ kim loại đồng vàng hình xương cá Chevron độc đáo",
    badge: "Chỉ đồng nghệ thuật",
    type: "chevron"
  },
  {
    id: "floor-wood-plank",
    code: "HAHONG-F02",
    name: "Sàn Gỗ Tự Nhiên Ghép Thanh Chống Trượt",
    spec: "Gỗ Walnut tự nhiên • Xử lý chịu lực công nghiệp",
    desc: "Các thanh ván gỗ tự nhiên màu nâu ấm ghép dọc theo chiều sâu cabin ấm cúng",
    badge: "Gỗ tự nhiên",
    type: "wood"
  },
  {
    id: "floor-marquina-black",
    code: "HAHONG-F03",
    name: "Đá Marble Đen Tia Chớp Nero Marquina",
    spec: "Cẩm thạch đen Tây Ban Nha • Vân tia chớp trắng",
    desc: "Nền đá đen tuyền huyền bí với các đường vân tia chớp trắng phản chiếu ánh sáng kiêu sa",
    badge: "Cẩm thạch Ý",
    type: "marquina"
  },
  {
    id: "floor-terrazzo-sand",
    code: "HAHONG-F04",
    name: "Đá Terrazzo Hạt Nhỏ Cát Be Tinh Tế",
    spec: "Đá mài Terrazzo hạt thạch anh mịn • Chống trơn",
    desc: "Hạt đá ngọc trai li ti màu kem cát nhã nhặn, chống trầy xước và chống trơn trượt tối đa",
    badge: "Hiện đại tối giản",
    type: "terrazzo"
  },
  {
    id: "floor-royal-cnc",
    code: "HAHONG-F05",
    name: "Đá Thảm CNC Mandala Hoàng Gia",
    spec: "Cắt CNC hoa văn Mandala • Viền đá granite đen",
    desc: "Cẩm thạch tự nhiên cắt CNC hoa văn tròn đối xứng vàng đen sang trọng chuẩn biệt thự",
    badge: "Tân cổ điển đẳng cấp",
    type: "royal-cnc"
  }
];

// 3. TRẦN ĐÈN LED (3 KIỂU CHIẾU SÁNG KIẾN TRÚC THỰC TẾ)
export const CEILING_OPTIONS = [
  {
    id: "ceil-cove-warm",
    code: "HAHONG-C01",
    name: "Trần Gián Tiếp Hắt Khe LED (3000K Vàng Ấm)",
    spec: "LED âm gián tiếp 3000K • Mặt trần phẳng viền titan",
    desc: "Hệ trần giật cấp hắt ánh sáng LED âm gián tiếp màu vàng ấm 3000K dịu mắt, chống chói",
    badge: "Vàng ấm 3000K",
    lightType: "warm-cove",
    lightColor: "rgba(254, 240, 138, 0.45)"
  },
  {
    id: "ceil-coffered-linear",
    code: "HAHONG-C02",
    name: "Trần Inox Gương Chia Ô & Thanh LED (4000K)",
    spec: "Trần inox chia ô vuông • 2 dải LED dài âm trần",
    desc: "Mặt trần inox gương chia ô kiến trúc kết hợp dải thanh LED âm màu trung tính hiện đại",
    badge: "Trung tính 4000K",
    lightType: "neutral-linear",
    lightColor: "rgba(241, 245, 249, 0.55)"
  },
  {
    id: "ceil-spotlight-frame",
    code: "HAHONG-C03",
    name: "Trần Nẹp Khung Đen & Đèn Downlight (5000K)",
    spec: "Khung nẹp nhôm đen mờ • 4 đèn rọi spotlight",
    desc: "Trần phẳng nẹp viền đen thanh lịch kết hợp đèn downlight rọi điểm sắc sảo chuẩn showroom",
    badge: "Ánh sáng trắng 5000K",
    lightType: "cool-spotlight",
    lightColor: "rgba(224, 242, 254, 0.6)"
  }
];

// 4. TAY VỊN CABIN (4 TÙY CHỌN CHUẨN KIẾN TRÚC THỰC TẾ)
export const HANDRAIL_OPTIONS = [
  {
    id: "round-inox",
    code: "HAHONG-R04",
    name: "Tay Vịn Tròn Inox SUS 304 Chuyên Homelift",
    spec: "SUS 304 phi 38mm chải xước satin • Bo tròn 2 đầu",
    desc: "Tay vịn tròn tiêu chuẩn kiến trúc Homelift nhà phố & thang kính, chống bám vân tay, êm tay tuyệt đối",
    badge: "Homelift Nhà Phố",
    type: "round-inox"
  },
  {
    id: "wood-brass",
    code: "HAHONG-R01",
    name: "Tay Vịn Gỗ Tự Nhiên Đầu Bọc Nẹp Kim Loại",
    spec: "Thân gỗ tròn phi 38 • Đầu bọc nẹp PVD vàng đồng",
    desc: "Thân gỗ tròn ấm tay, hai đầu bọc nẹp kim loại mạ PVD chống oxy hóa (Như Ảnh 1 & 3)",
    badge: "Gỗ & Nẹp Kim Loại",
    type: "wood-brass"
  },
  {
    id: "flat-satin",
    code: "HAHONG-R02",
    name: "Tay Vịn Bản Dẹp Inox 304 Xước Satin",
    spec: "Inox 304 bản dẹp 40x10mm • Bát bắt tường giấu vít",
    desc: "Bản dẹp 40mm chống trơn trượt, góc bo cạnh satin cao cấp công thái học (Như Ảnh 2)",
    badge: "Inox dẹp công thái học",
    type: "flat-satin"
  },
  {
    id: "round-pvd",
    code: "HAHONG-R03",
    name: "Tay Vịn Tròn Inox Gương Vàng PVD Champagne",
    spec: "Inox 304 phi 38mm mạ PVD • Bo cong hai đầu",
    desc: "Inox bóng bẩy mạ PVD vàng Champagne đồng bộ vách gương sang trọng (Như Ảnh 4)",
    badge: "Hoàng Gia PVD",
    type: "round-pvd"
  }
];

export default function CabinVisualizer({
  elevatorType = "homelift-kinh",
  onChangeElevatorType,
  capacityKg = 450,
  stops = 4,
  doorType = "CO",
  onChangeDoorType,
  onApplyConfig,
  onRequestConsultation,
  selectedWallProp,
  selectedFloorProp,
  selectedCeilingProp,
  selectedHandrailProp,
  onMaterialChange
}) {
  // Tabs: 'walls' (1) | 'flooring' (2) | 'ceiling' (3) | 'handrail' (4)
  const [activeTab, setActiveTab] = useState("walls");

  const normalizeRailId = (id) => (id === "flat-inox" ? "flat-satin" : id);

  // State các tùy chọn vật liệu (Mặc định chọn mẫu cao cấp nhất từ ảnh thực tế của khách)
  const [selectedWallId, setSelectedWallId] = useState(
    selectedWallProp || (
      elevatorType === "inox-guong-vang" ? "inox-guong-vang" :
      elevatorType === "inox-tieu-chuan" ? "inox-tieu-chuan" : "wood-walnut-mirror"
    )
  );
  const [selectedFloorId, setSelectedFloorId] = useState(selectedFloorProp || "floor-chevron-brass");
  const [selectedCeilingId, setSelectedCeilingId] = useState(selectedCeilingProp || "ceil-cove-warm");
  const [selectedHandrailId, setSelectedHandrailId] = useState(
    normalizeRailId(selectedHandrailProp) || "wood-brass"
  );

  // Đồng bộ props bên ngoài nếu có (dành cho Preset từ Studio)
  useEffect(() => {
    if (selectedWallProp) setSelectedWallId(selectedWallProp);
  }, [selectedWallProp]);

  useEffect(() => {
    if (selectedFloorProp) setSelectedFloorId(selectedFloorProp);
  }, [selectedFloorProp]);

  useEffect(() => {
    if (selectedCeilingProp) setSelectedCeilingId(selectedCeilingProp);
  }, [selectedCeilingProp]);

  useEffect(() => {
    if (selectedHandrailProp) setSelectedHandrailId(normalizeRailId(selectedHandrailProp));
  }, [selectedHandrailProp]);

  // State điều khiển Cửa & Đèn
  const [isDoorsOpen, setIsDoorsOpen] = useState(true);
  const [isLightOn, setIsLightOn] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  // State MÔ PHỎNG THANG MÁY CHẠY TẦNG (Tự động đóng cửa, chạy tầng, chuông Ding, mở cửa)
  const [currentFloor, setCurrentFloor] = useState(1);
  const [targetFloor, setTargetFloor] = useState(1);
  const [elevatorStatus, setElevatorStatus] = useState("idle"); // 'idle' | 'closing' | 'moving' | 'opening'
  const [moveDirection, setMoveDirection] = useState(null); // 'up' | 'down' | null
  const tripIntervalRef = useRef(null);

  // Danh sách tầng (1 .. stops)
  const totalStops = Math.min(Math.max(Number(stops) || 4, 2), 10);
  const floorList = Array.from({ length: totalStops }, (_, i) => i + 1);

  useEffect(() => {
    if (currentFloor > totalStops) {
      setCurrentFloor(totalStops);
      setTargetFloor(totalStops);
    }
  }, [totalStops, currentFloor]);

  // Đồng bộ với Bước 3 bên ngoài (Chỉ khi không có selectedWallProp để tránh ghi đè preset hoặc tùy chọn thủ công)
  const prevElevatorTypeRef = useRef(elevatorType);
  useEffect(() => {
    if (!selectedWallProp && prevElevatorTypeRef.current !== elevatorType) {
      if (elevatorType === "inox-guong-vang") {
        setSelectedWallId("inox-guong-vang");
      } else if (elevatorType === "inox-tieu-chuan") {
        setSelectedWallId("inox-tieu-chuan");
      } else if (elevatorType === "homelift-kinh") {
        setSelectedWallId("kinh-cuong-luc");
      } else if (elevatorType === "biet-thu-walnut") {
        setSelectedWallId("wood-walnut-mirror");
      }
    }
    prevElevatorTypeRef.current = elevatorType;
  }, [elevatorType, selectedWallProp]);

  useEffect(() => {
    return () => {
      if (tripIntervalRef.current) clearInterval(tripIntervalRef.current);
    };
  }, []);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2800);
  };

  const handleToggleDoorType = (type) => {
    if (onChangeDoorType) {
      onChangeDoorType(type);
    }
    triggerToast(type === "CO" ? "Đã chọn Cửa Mở Tim (CO) • Mở từ giữa sang 2 bên" : "Đã chọn Cửa Mở Lùa (SO) • Mở dồn về 1 bên");
  };

  const notifyParent = (overrides = {}) => {
    if (onApplyConfig) {
      const wId = overrides.wallId || selectedWallId;
      const fId = overrides.floorId || selectedFloorId;
      const cId = overrides.ceilingId || selectedCeilingId;
      const hId = overrides.handrailId || selectedHandrailId;

      const wObj = WALL_OPTIONS.find(w => w.id === wId) || WALL_OPTIONS[0];
      const fObj = FLOOR_OPTIONS.find(f => f.id === fId) || FLOOR_OPTIONS[0];
      const cObj = CEILING_OPTIONS.find(c => c.id === cId) || CEILING_OPTIONS[0];
      const hObj = HANDRAIL_OPTIONS.find(h => h.id === hId) || HANDRAIL_OPTIONS[0];

      onApplyConfig({
        wall: wObj.name,
        floor: fObj.name,
        ceiling: cObj.name,
        handrail: hObj.name
      });
    }
  };

  // -------------------------------------------------------------
  // CHỨC NĂNG BẤM TẦNG THANG MÁY TỰ ĐÓNG VÀ MỞ CỬA TẠI TẦNG ĐÍCH
  // -------------------------------------------------------------
  const handleCallFloor = (target) => {
    if (elevatorStatus !== "idle") {
      triggerToast("Thang máy đang di chuyển, vui lòng chờ...");
      return;
    }

    if (target === currentFloor) {
      if (!isDoorsOpen) {
        setIsDoorsOpen(true);
        triggerToast(`Thang máy đang ở Tầng ${target} • Đang mở cửa đón khách`);
      } else {
        triggerToast(`Thang máy hiện đang đỗ sẵn tại Tầng ${target}`);
      }
      return;
    }

    const direction = target > currentFloor ? "up" : "down";
    setTargetFloor(target);
    setMoveDirection(direction);
    setElevatorStatus("closing");
    triggerToast(`Đã bấm Tầng ${target} • Cửa đang tự động đóng lại...`);

    // Bước 1: Tự động ĐÓNG CỬA
    setIsDoorsOpen(false);

    // Bước 2: Cửa đóng kín sau 850ms -> Bắt đầu chạy thang
    setTimeout(() => {
      setElevatorStatus("moving");
      const stepsToTravel = Math.abs(target - currentFloor);
      let stepCount = 0;
      let activeFloor = currentFloor;

      tripIntervalRef.current = setInterval(() => {
        stepCount++;
        activeFloor = direction === "up" ? activeFloor + 1 : activeFloor - 1;
        setCurrentFloor(activeFloor);

        if (activeFloor === target || stepCount >= stepsToTravel) {
          clearInterval(tripIntervalRef.current);
          tripIntervalRef.current = null;

          // Bước 3: Chuông Ding & Tự động MỞ CỬA tại tầng đó
          setTimeout(() => {
            setElevatorStatus("opening");
            setMoveDirection(null);
            triggerToast(`🔔 Ding! Đã đến Tầng ${target} • Cửa đang tự động mở ra`);
            setIsDoorsOpen(true);

            setTimeout(() => {
              setElevatorStatus("idle");
            }, 900);
          }, 450);
        }
      }, 750);
    }, 900);
  };

  const handleManualDoorToggle = () => {
    if (elevatorStatus === "moving") {
      triggerToast("Thang máy đang di chuyển giữa các tầng, không thể mở cửa!");
      return;
    }
    const next = !isDoorsOpen;
    setIsDoorsOpen(next);
    triggerToast(next ? "Cửa thang máy đang mở ra" : "Cửa thang máy đã đóng kín");
  };

  const handleToggleLight = () => {
    const next = !isLightOn;
    setIsLightOn(next);
    triggerToast(next ? "Đèn cabin bật sáng" : "Đèn cabin tắt • Chế độ ban đêm");
  };

  const handleSelectWall = (item) => {
    setSelectedWallId(item.id);
    if (onChangeElevatorType && item.syncValue) {
      onChangeElevatorType(item.syncValue);
    }
    triggerToast(`Đã đổi vách: ${item.name}`);
    notifyParent({ wallId: item.id });
  };

  const handleSelectFloor = (item) => {
    setSelectedFloorId(item.id);
    triggerToast(`Đã đổi sàn: ${item.name}`);
    notifyParent({ floorId: item.id });
  };

  const handleSelectCeiling = (item) => {
    setSelectedCeilingId(item.id);
    triggerToast(`Đã đổi kiểu đèn: ${item.name}`);
    notifyParent({ ceilingId: item.id });
  };

  const handleSelectHandrail = (item) => {
    setSelectedHandrailId(item.id);
    triggerToast(`Đã đổi tay vịn: ${item.name}`);
    notifyParent({ handrailId: item.id });
  };

  const handleReset = () => {
    setSelectedWallId("wood-walnut-mirror");
    setSelectedFloorId("floor-chevron-brass");
    setSelectedCeilingId("ceil-cove-warm");
    setSelectedHandrailId("wood-brass");
    setIsDoorsOpen(true);
    setIsLightOn(true);
    setCurrentFloor(1);
    setTargetFloor(1);
    setElevatorStatus("idle");
    setMoveDirection(null);
    if (onChangeElevatorType) {
      onChangeElevatorType("homelift-kinh");
    }
    triggerToast("Đã khôi phục cấu hình nội thất cao cấp tiêu chuẩn");
    notifyParent({
      wallId: "wood-walnut-mirror",
      floorId: "floor-chevron-brass",
      ceilingId: "ceil-cove-warm",
      handrailId: "wood-brass"
    });
  };

  const handleConsultClick = () => {
    const curWall = WALL_OPTIONS.find(w => w.id === selectedWallId)?.name || "";
    const curFloor = FLOOR_OPTIONS.find(f => f.id === selectedFloorId)?.name || "";
    const curCeil = CEILING_OPTIONS.find(c => c.id === selectedCeilingId)?.name || "";
    const curRail = HANDRAIL_OPTIONS.find(h => h.id === selectedHandrailId)?.name || "";

    if (onRequestConsultation) {
      onRequestConsultation({
        wall: curWall,
        floor: curFloor,
        ceiling: curCeil,
        handrail: curRail
      });
    } else {
      const quoteForm = document.querySelector(".quote-form-card");
      if (quoteForm) {
        quoteForm.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const curWallObj = WALL_OPTIONS.find(w => w.id === selectedWallId) || WALL_OPTIONS[0];
  const curFloorObj = FLOOR_OPTIONS.find(f => f.id === selectedFloorId) || FLOOR_OPTIONS[0];
  const curCeilObj = CEILING_OPTIONS.find(c => c.id === selectedCeilingId) || CEILING_OPTIONS[0];
  const curRailObj = HANDRAIL_OPTIONS.find(h => h.id === selectedHandrailId) || HANDRAIL_OPTIONS[0];

  useEffect(() => {
    if (onMaterialChange) {
      onMaterialChange({
        wall: curWallObj,
        floor: curFloorObj,
        ceiling: curCeilObj,
        handrail: curRailObj,
        wallId: selectedWallId,
        floorId: selectedFloorId,
        ceilingId: selectedCeilingId,
        handrailId: selectedHandrailId
      });
    }
  }, [selectedWallId, selectedFloorId, selectedCeilingId, selectedHandrailId]);

  return (
    <div className="cabin-visualizer-container">
      {/* =====================================================================
          SVG ARCHITECTURAL DEFINITIONS & TEXTURE SHADERS
          (Định nghĩa bề mặt kim loại xước Hairline, vàng PVD, đá nẹp chỉ đồng,
           vân gỗ tự nhiên, đá marble đen tia chớp, đá terrazzo cát mịn)
         ===================================================================== */}
      <svg className="cabin-defs-container" aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
        <defs>
          {/* 1. Inox 304 Sọc Nhuyễn Hairline Pattern */}
          <pattern id="pat-hairline-fine" width="60" height="60" patternUnits="userSpaceOnUse">
            <rect width="60" height="60" fill="#94a3b8" />
            <line x1="0" y1="2" x2="60" y2="2" stroke="#cbd5e1" strokeWidth="1" opacity="0.6" />
            <line x1="0" y1="5" x2="60" y2="5" stroke="#64748b" strokeWidth="0.8" opacity="0.4" />
            <line x1="0" y1="9" x2="60" y2="9" stroke="#f1f5f9" strokeWidth="0.75" opacity="0.7" />
            <line x1="0" y1="14" x2="60" y2="14" stroke="#475569" strokeWidth="0.9" opacity="0.5" />
            <line x1="0" y1="18" x2="60" y2="18" stroke="#cbd5e1" strokeWidth="0.75" opacity="0.5" />
            <line x1="0" y1="23" x2="60" y2="23" stroke="#f8fafc" strokeWidth="1" opacity="0.8" />
            <line x1="0" y1="28" x2="60" y2="28" stroke="#64748b" strokeWidth="0.8" opacity="0.4" />
            <line x1="0" y1="34" x2="60" y2="34" stroke="#cbd5e1" strokeWidth="0.75" opacity="0.6" />
            <line x1="0" y1="39" x2="60" y2="39" stroke="#334155" strokeWidth="0.9" opacity="0.3" />
            <line x1="0" y1="44" x2="60" y2="44" stroke="#f1f5f9" strokeWidth="0.8" opacity="0.7" />
            <line x1="0" y1="50" x2="60" y2="50" stroke="#64748b" strokeWidth="0.8" opacity="0.5" />
            <line x1="0" y1="56" x2="60" y2="56" stroke="#cbd5e1" strokeWidth="0.75" opacity="0.6" />
          </pattern>

          {/* 2. Sàn Đá Nẹp Chỉ Đồng Xương Cá (Chevron Brass Inlay Pattern - Như Ảnh 2) */}
          <pattern id="pat-chevron-brass-inlay" width="100" height="50" patternUnits="userSpaceOnUse">
            <rect width="100" height="50" fill="#e2e8f0" />
            {/* Hạt đá ngọc trai li ti */}
            <circle cx="15" cy="12" r="1.2" fill="#94a3b8" opacity="0.6" />
            <circle cx="35" cy="38" r="1" fill="#64748b" opacity="0.5" />
            <circle cx="68" cy="18" r="1.4" fill="#cbd5e1" opacity="0.7" />
            <circle cx="85" cy="42" r="1.1" fill="#94a3b8" opacity="0.6" />
            {/* Đường chỉ đồng trục giữa */}
            <line x1="50" y1="0" x2="50" y2="50" stroke="#ca8a04" strokeWidth="2.5" />
            <line x1="50" y1="0" x2="50" y2="50" stroke="#facc15" strokeWidth="1" />
            {/* Các nhánh xương cá nẹp chỉ đồng đối xứng */}
            <line x1="50" y1="10" x2="10" y2="45" stroke="#ca8a04" strokeWidth="2" />
            <line x1="50" y1="10" x2="10" y2="45" stroke="#fef08a" strokeWidth="0.75" />
            <line x1="50" y1="10" x2="90" y2="45" stroke="#ca8a04" strokeWidth="2" />
            <line x1="50" y1="10" x2="90" y2="45" stroke="#fef08a" strokeWidth="0.75" />

            <line x1="50" y1="-15" x2="10" y2="20" stroke="#475569" strokeWidth="1.8" />
            <line x1="50" y1="-15" x2="90" y2="20" stroke="#475569" strokeWidth="1.8" />

            <line x1="50" y1="35" x2="10" y2="70" stroke="#475569" strokeWidth="1.8" />
            <line x1="50" y1="35" x2="90" y2="70" stroke="#475569" strokeWidth="1.8" />
          </pattern>

          {/* 3. Gỗ Óc Chó Walnut Tự Nhiên (Như Ảnh 1 & 4) */}
          <pattern id="pat-wood-walnut-texture" width="80" height="120" patternUnits="userSpaceOnUse">
            <rect width="80" height="120" fill="#451a03" />
            <path d="M0 0 Q 20 60 0 120" stroke="#78350f" strokeWidth="2" fill="none" opacity="0.7" />
            <path d="M25 0 Q 35 70 25 120" stroke="#2e1001" strokeWidth="2.5" fill="none" opacity="0.6" />
            <path d="M50 0 Q 60 50 50 120" stroke="#92400e" strokeWidth="2" fill="none" opacity="0.5" />
            <path d="M75 0 Q 70 80 75 120" stroke="#78350f" strokeWidth="2.5" fill="none" opacity="0.7" />
            <line x1="79" y1="0" x2="79" y2="120" stroke="#1c0a00" strokeWidth="1.5" opacity="0.8" />
          </pattern>

          {/* 4. Đá Marble Đen Tia Chớp Nero Marquina (Như Ảnh 4) */}
          <pattern id="pat-marquina-black-texture" width="120" height="100" patternUnits="userSpaceOnUse">
            <rect width="120" height="100" fill="#09090b" />
            {/* Vân tia chớp trắng cẩm thạch sắc sảo */}
            <path d="M5 15 L 28 32 L 40 28 L 65 55 L 85 50 L 115 88" stroke="#ffffff" strokeWidth="1.6" fill="none" opacity="0.8" />
            <path d="M40 28 L 52 12 L 75 18" stroke="#ffffff" strokeWidth="0.9" fill="none" opacity="0.6" />
            <path d="M65 55 L 75 75 L 98 80" stroke="#cbd5e1" strokeWidth="1" fill="none" opacity="0.5" />
            <path d="M10 85 L 30 70 L 45 78 L 70 98" stroke="#f1f5f9" strokeWidth="1.1" fill="none" opacity="0.65" />
          </pattern>

          {/* 5. Đá Terrazzo Cát Mịn (Như Ảnh 3) */}
          <pattern id="pat-terrazzo-sand-texture" width="50" height="50" patternUnits="userSpaceOnUse">
            <rect width="50" height="50" fill="#f1f5f9" />
            <circle cx="8" cy="12" r="1.5" fill="#ca8a04" opacity="0.4" />
            <circle cx="22" cy="7" r="1.2" fill="#64748b" opacity="0.4" />
            <circle cx="38" cy="18" r="2" fill="#cbd5e1" opacity="0.7" />
            <circle cx="16" cy="34" r="1.8" fill="#94a3b8" opacity="0.5" />
            <circle cx="42" cy="40" r="1.2" fill="#78350f" opacity="0.35" />
            <circle cx="28" cy="24" r="1" fill="#475569" opacity="0.5" />
          </pattern>

          {/* Gradient Inox Gương Vàng PVD (Champagne Gold 8K) */}
          <linearGradient id="grad-pvd-champagne" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="18%" stopColor="#ca8a04" />
            <stop offset="35%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="70%" stopColor="#ca8a04" />
            <stop offset="88%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>

          {/* Gradient Inox Gương Bạc 8K */}
          <linearGradient id="grad-mirror-silver-8k" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="25%" stopColor="#94a3b8" />
            <stop offset="48%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="#cbd5e1" />
            <stop offset="85%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Rãnh ngưỡng cửa hợp kim nhôm định hình */}
          <pattern id="pat-door-sill-grooves" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="#475569" />
            <line x1="0" y1="5" x2="20" y2="5" stroke="#1e293b" strokeWidth="2.5" />
            <line x1="0" y1="6" x2="20" y2="6" stroke="#94a3b8" strokeWidth="1" />
            <line x1="0" y1="14" x2="20" y2="14" stroke="#1e293b" strokeWidth="2.5" />
            <line x1="0" y1="15" x2="20" y2="15" stroke="#94a3b8" strokeWidth="1" />
          </pattern>
        </defs>
      </svg>

      {/* 1. Header Toolbar (TÍCH HỢP BẢNG CHỈ BÁO TẦNG CAO, KHÔNG CHE THANG MÁY) */}
      <div className="cabin-viz-header">
        <div className="cabin-viz-title">
          <i className="bi bi-shield-check text-warning fs-5"></i>
          <div>
            <span className="d-block fw-bold" style={{ fontSize: "14px", letterSpacing: "0.5px" }}>
              PHỐI CẢNH CABIN KIẾN TRÚC CAO CẤP 2.5D
            </span>
            <small className="text-secondary" style={{ fontSize: "11px" }}>
              Tiêu chuẩn thực tế • Tầm nhìn toàn cảnh cabin thoáng đãng
            </small>
          </div>
        </div>

        {/* BẢNG CHỈ BÁO TẦNG ĐẶT TRÊN HEADER TOOLBAR (KHÔNG CHE PHẦN TRÊN CỦA CABIN) */}
        <div className="cabin-landing-indicator">
          <span className="floor-num">{currentFloor}F</span>
          <span className={`dir-arrow ${moveDirection ? "moving" : ""}`}>
            {moveDirection === "up" ? "▲" : moveDirection === "down" ? "▼" : "●"}
          </span>
          <span className="capacity-badge">
            {elevatorStatus === "moving"
              ? `Đang chạy ${moveDirection === "up" ? "lên" : "xuống"} Tầng ${targetFloor}...`
              : `${capacityKg}kg • ${Math.round(capacityKg / 75)} người`}
          </span>
        </div>

        <div className="cabin-viz-actions">
          {/* Nút bật / tắt đèn */}
          <button
            type="button"
            className={`cabin-viz-btn-action ${isLightOn ? "active" : ""}`}
            onClick={handleToggleLight}
            title={isLightOn ? "Tắt đèn chiếu sáng cabin" : "Bật đèn chiếu sáng cabin"}
          >
            <i className={`bi ${isLightOn ? "bi-lightbulb-fill text-warning" : "bi-lightbulb"}`}></i>
            <span>{isLightOn ? "Đèn Bật" : "Đèn Tắt"}</span>
          </button>

          {/* Nút mở / đóng cửa thủ công */}
          <button
            type="button"
            className={`cabin-viz-btn-action ${isDoorsOpen ? "active" : ""}`}
            onClick={handleManualDoorToggle}
            title={isDoorsOpen ? "Đóng cửa cabin" : "Mở cửa cabin"}
            disabled={elevatorStatus === "moving"}
          >
            <i className={`bi ${isDoorsOpen ? "bi-door-open-fill text-info" : "bi-door-closed-fill"}`}></i>
            <span>{isDoorsOpen ? "Cửa Mở" : "Cửa Đóng"}</span>
          </button>
        </div>
      </div>

      {/* 2. Sân khấu 3D Perspective Box (Chuẩn kiến trúc cabin thực tế, không bị che chắn) */}
      <div className="cabin-stage">
        {/* Toast thông báo tương tác */}
        {toastMsg && (
          <div className="cabin-live-toast">
            <i className="bi bi-info-circle-fill me-1 text-info"></i>
            {toastMsg}
          </div>
        )}

        {/* Khung bao sảnh tầng bên ngoài (Lobby Inox Frame) */}
        <div className="cabin-landing-surround">
          <div className="lobby-jamb jamb-top"></div>
          <div className="lobby-jamb jamb-left"></div>
          <div className="lobby-jamb jamb-right"></div>
        </div>

        {/* KHỐI HỘP 3D CABIN KIẾN TRÚC THỰC TẾ (Elevator Car 3D Architectural Box) */}
        <div className={`cabin-car-box door-mode-${doorType} ${isDoorsOpen ? "doors-open" : ""} ${!isLightOn ? "light-off" : ""}`}>
          
          {/* TRẦN CABIN & ĐÈN CHIẾU SÁNG (Kiểu đèn 3: Ứng với Tab 3) */}
          <div
            className={`cabin-ceiling ceil-type-${selectedCeilingId} ${isLightOn ? "light-on" : "light-off"}`}
            onClick={() => setActiveTab("ceiling")}
            title="Bấm để chọn mẫu Trần Đèn LED (Số 3)"
          >
            {/* Hệ thống đèn trần kiến trúc */}
            <div className="cabin-ceiling-frame">
              {selectedCeilingId === "ceil-cove-warm" && (
                <div className="cove-led-perimeter">
                  <div className="cove-inner-panel"></div>
                </div>
              )}
              {selectedCeilingId === "ceil-coffered-linear" && (
                <div className="coffered-mirror-grid">
                  <span className="grid-bar"></span>
                  <span className="grid-bar"></span>
                  <span className="grid-bar"></span>
                </div>
              )}
              {selectedCeilingId === "ceil-spotlight-frame" && (
                <div className="spotlight-frame-array">
                  <span className="spot-lens"></span>
                  <span className="spot-lens"></span>
                  <span className="spot-lens"></span>
                  <span className="spot-lens"></span>
                </div>
              )}

              {/* Điểm ghim Số 3: Trần LED */}
              {isDoorsOpen && (
                <div className="cabin-hotspot-pin pin-ceiling" title="Ghim số 3: Trần LED">
                  3
                </div>
              )}
            </div>
          </div>

          {/* CHÙM SÁNG CHIẾU RỌI TỰ NHIÊN (Natural Architectural Downlight) */}
          {isLightOn && (
            <div className={`cabin-ambient-light light-effect-${selectedCeilingId}`}></div>
          )}

          {/* VÁCH HÔNG TRÁI (LEFT WALL) - GÓC NGHIÊNG PHỐI CẢNH 3D */}
          <div className={`cabin-wall-side wall-side-left wall-${selectedWallId}`}>
            <div className="side-wall-panel"></div>
            {/* Nẹp chân tường Inox kickplate vách trái */}
            <div className="wall-kickplate kickplate-left"></div>
            {/* Tay vịn hông trái */}
            <div className={`side-handrail handrail-${selectedHandrailId}`}></div>
          </div>

          {/* VÁCH HÔNG PHẢI (RIGHT WALL) - GÓC NGHIÊNG PHỐI CẢNH 3D VỚI BẢNG ĐIỀU KHIỂN COP */}
          <div className={`cabin-wall-side wall-side-right wall-${selectedWallId}`}>
            <div className="side-wall-panel"></div>
            {/* Nẹp chân tường Inox kickplate vách phải */}
            <div className="wall-kickplate kickplate-right"></div>
            {/* Tay vịn hông phải */}
            <div className={`side-handrail handrail-${selectedHandrailId}`}></div>

            {/* BẢNG ĐIỀU KHIỂN CABIN CHÂN THỰC (CAR OPERATING PANEL - COP) */}
            <div className="cabin-cop-panel">
              {/* Màn hình hiển thị LCD/LED */}
              <div className="cabin-cop-screen">
                <span className="cop-floor">{currentFloor}</span>
                <span className="cop-arrow">{moveDirection === "up" ? "▲" : moveDirection === "down" ? "▼" : "●"}</span>
              </div>
              {/* Hàng nút bấm inox tròn viền đèn Halo Ring */}
              <div className="cabin-cop-buttons">
                {floorList.slice(0, 5).map((fNum) => (
                  <div
                    key={fNum}
                    className={`cop-dot ${currentFloor === fNum ? "active" : ""} ${targetFloor === fNum && elevatorStatus !== "idle" ? "calling" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCallFloor(fNum);
                    }}
                    title={`Đi Tầng ${fNum}`}
                  >
                    <span>{fNum}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* VÁCH SAU CABIN (BACK WALL) - CHIA MẢNG PANEL KIẾN TRÚC & GƯƠNG SOI TRUNG TÂM */}
          <div
            className={`cabin-back-wall wall-${selectedWallId}`}
            onClick={() => setActiveTab("walls")}
            title="Bấm để chọn mẫu Vách Cabin (Số 1)"
          >
            {/* Trường hợp Vách Kính Panorama: Hiện cảnh quan bên ngoài */}
            {selectedWallId === "kinh-cuong-luc" && (
              <div
                className="cabin-scenery-backdrop"
                style={{ transform: `translateY(${(currentFloor - 1) * -20}px)` }}
              >
                <div className="glass-reflection-glare"></div>
              </div>
            )}

            {/* Mảng Panel Kiến Trúc Vách Sau (3 Phân Mảng Chuẩn Khách Sạn & Căn Hộ) */}
            <div className="back-wall-layout">
              {/* Tấm vách trái */}
              <div className="back-panel panel-sub-left"></div>

              {/* Tấm trung tâm (Gương soi 8K sạch sẽ, KHÔNG CHỨA CHỮ RỜI RẠC) */}
              <div className="back-panel panel-center-feature">
                {selectedWallId === "wood-walnut-mirror" && (
                  <div className="feature-mirror-glass">
                    <span className="mirror-bevel-edge"></span>
                  </div>
                )}
                {selectedWallId === "inox-guong-vang" && (
                  <div className="feature-gold-motif">
                    <span className="motif-border"></span>
                  </div>
                )}
              </div>

              {/* Tấm vách phải */}
              <div className="back-panel panel-sub-right"></div>
            </div>

            {/* Điểm ghim Số 1: Vách Cabin */}
            {isDoorsOpen && (
              <div className="cabin-hotspot-pin pin-wall" title="Ghim số 1: Vách Cabin">
                1
              </div>
            )}

            {/* TAY VỊN TRONG CABIN CHẠY NGANG (Kiểu tay vịn 4: Ứng với Tab 4 - HIỂN THỊ RÕ RÀNG) */}
            <div
              className={`cabin-handrail handrail-${selectedHandrailId}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab("handrail");
              }}
              title="Bấm để chọn mẫu Tay Vịn (Số 4)"
            >
              <span className="handrail-bar"></span>
              <span className="handrail-bracket bracket-left"></span>
              <span className="handrail-bracket bracket-right"></span>

              {/* Điểm ghim Số 4: Tay Vịn */}
              {isDoorsOpen && (
                <div className="cabin-hotspot-pin pin-handrail" title="Ghim số 4: Tay Vịn">
                  4
                </div>
              )}
            </div>

            {/* Nẹp chân tường Inox kickplate vách sau */}
            <div className="wall-kickplate kickplate-back"></div>

            {/* DẢI ĐÈN LED ÂM CHÂN TƯỜNG (KICKPLATE COVE LIGHT - NHƯ ẢNH 4) */}
            {isLightOn && (
              <div className="kickplate-cove-led-wash"></div>
            )}
          </div>

          {/* SÀN ĐÁ & GỖ CABIN (FLOORING - GÓC NGHIÊNG 3D 25 DEG CHUẨN KIẾN TRÚC) */}
          <div
            className={`cabin-floor floor-${selectedFloorId}`}
            onClick={() => setActiveTab("flooring")}
            title="Bấm để chọn mẫu Sàn Cabin (Số 2)"
          >
            {/* Mặt texture sàn theo đúng chất liệu thực tế */}
            <div className={`floor-surface-layer surface-${selectedFloorId}`}></div>

            {/* Vệt phản chiếu ánh sáng tự nhiên mờ nhẹ trên mặt sàn bóng */}
            {isLightOn && (
              <div className={`floor-specular-glow glow-${selectedCeilingId}`}></div>
            )}

            {/* Điểm ghim Số 2: Sàn Đá / Gỗ */}
            {isDoorsOpen && (
              <div className="cabin-hotspot-pin pin-floor" title="Ghim số 2: Sàn Cabin">
                2
              </div>
            )}
          </div>

          {/* NGƯỠNG CỬA HỢP KIM NHÔM (DOOR SILL GUIDE GROOVES) */}
          <div className="cabin-door-sill-bar"></div>

          {/* CỬA TẦNG TỰ ĐỘNG SLIDING DOORS (TRƯỢT MỞ/ĐÓNG THẬT) */}
          <div className={`cabin-door door-left door-wall-${selectedWallId}`}>
            <span className="door-panel-texture"></span>
            <span className="door-edge-trim"></span>
          </div>
          <div className={`cabin-door door-right door-wall-${selectedWallId}`}>
            <span className="door-panel-texture"></span>
            <span className="door-edge-trim"></span>
          </div>
        </div>
      </div>

      {/* 2.5. THANH THÔNG TIN VẬT LIỆU & NÚT CHỌN KIỂU CỬA (NẰM DƯỚI KHUNG 3D, KHÔNG CHE SÀN CABIN) */}
      <div className="cabin-summary-ribbon">
        <div className="summary-specs">
          <i className="bi bi-layers-fill text-warning me-2"></i>
          <span className="spec-text">
            {!isDoorsOpen ? "Cửa thang máy đang đóng kín" : `${curWallObj.name} • ${curFloorObj.name}`}
          </span>
        </div>

        {/* Nút chọn kiểu mở cửa: CO (Mở tim) vs SO (Mở lùa) */}
        <div className="door-type-switch-group">
          <span className="door-switch-label">Kiểu mở cửa:</span>
          <button
            type="button"
            className={`btn-door-toggle ${doorType === "CO" ? "active" : ""}`}
            onClick={() => handleToggleDoorType("CO")}
            title="Cửa mở tim từ giữa sang hai bên"
          >
            Mở tim (CO)
          </button>
          <button
            type="button"
            className={`btn-door-toggle ${doorType === "SO" ? "active" : ""}`}
            onClick={() => handleToggleDoorType("SO")}
            title="Cửa mở lùa trượt dồn về một bên"
          >
            Mở lùa (SO)
          </button>
        </div>
      </div>

      {/* 3. BẢNG GỌI TẦNG THỰC TẾ (BẤM TẦNG THANG TỰ ĐỘNG CHẠY) */}
      <div className="cabin-floor-call-station">
        <div className="floor-station-header">
          <span className="station-title">
            <i className="bi bi-joystick text-warning me-2"></i>
            BẤM GỌI TẦNG TRẢI NGHIỆM:
          </span>
          <span className="station-status">
            {elevatorStatus === "idle" && (
              <span className="text-success fw-semibold">
                <i className="bi bi-check-circle-fill me-1"></i>Đang dừng tại Tầng {currentFloor} (Sẵn sàng)
              </span>
            )}
            {elevatorStatus === "closing" && (
              <span className="text-warning fw-semibold">
                <i className="bi bi-hourglass-split me-1"></i>Cửa đang tự động đóng lại...
              </span>
            )}
            {elevatorStatus === "moving" && (
              <span className="text-info fw-bold">
                <i className="bi bi-arrow-repeat me-1 animate-spin"></i>Đang chạy {moveDirection === "up" ? "lên" : "xuống"} Tầng {targetFloor}...
              </span>
            )}
            {elevatorStatus === "opening" && (
              <span className="text-primary fw-bold">
                <i className="bi bi-bell-fill text-warning me-1"></i>Ding! Đã đến Tầng {targetFloor} • Đang mở cửa
              </span>
            )}
          </span>
        </div>

        <div className="floor-buttons-row">
          {floorList.map((fNum) => {
            const isCurrent = currentFloor === fNum;
            const isTarget = targetFloor === fNum && elevatorStatus !== "idle";
            return (
              <button
                key={fNum}
                type="button"
                className={`btn-floor-call ${isCurrent ? "current" : ""} ${isTarget ? "calling" : ""}`}
                onClick={() => handleCallFloor(fNum)}
                title={`Bấm để đi thang máy đến Tầng ${fNum}`}
              >
                <span className="floor-number">{fNum}F</span>
                <span className="floor-subtext">
                  {isTarget ? "Đang đến..." : isCurrent ? "Đang đỗ" : `Tầng ${fNum}`}
                </span>
                {isCurrent && <span className="floor-active-dot"></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. BỘ CHỌN VẬT LIỆU CAO CẤP (TABS & THẺ SWATCH THIẾT KẾ ĐẸP MẮT) */}
      <div className="cabin-cfg-controls">
        <div className="cabin-tabs-nav">
          <button
            type="button"
            className={`cabin-tab-item ${activeTab === "walls" ? "active" : ""}`}
            onClick={() => setActiveTab("walls")}
          >
            <i className="bi bi-palette2"></i>
            1. Vách Cabin ({WALL_OPTIONS.length})
          </button>
          <button
            type="button"
            className={`cabin-tab-item ${activeTab === "flooring" ? "active" : ""}`}
            onClick={() => setActiveTab("flooring")}
          >
            <i className="bi bi-grid-3x3"></i>
            2. Sàn Đá / Gỗ ({FLOOR_OPTIONS.length})
          </button>
          <button
            type="button"
            className={`cabin-tab-item ${activeTab === "ceiling" ? "active" : ""}`}
            onClick={() => setActiveTab("ceiling")}
          >
            <i className="bi bi-brightness-high"></i>
            3. Trần LED ({CEILING_OPTIONS.length})
          </button>
          <button
            type="button"
            className={`cabin-tab-item ${activeTab === "handrail" ? "active" : ""}`}
            onClick={() => setActiveTab("handrail")}
          >
            <i className="bi bi-slash-circle"></i>
            4. Tay Vịn ({HANDRAIL_OPTIONS.length})
          </button>
        </div>

        {/* Tab 1: Vách Cabin */}
        {activeTab === "walls" && (
          <div className="cabin-cards-grid">
            {WALL_OPTIONS.map((item) => {
              const isSelected = selectedWallId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`cabin-material-card ${isSelected ? "active" : ""}`}
                  onClick={() => handleSelectWall(item)}
                >
                  <div className={`swatch-preview-box swatch-wall-${item.id}`}>
                    <span className="swatch-code-tag">{item.code}</span>
                    {isSelected && (
                      <div className="swatch-check-icon">
                        <i className="bi bi-check-lg"></i>
                      </div>
                    )}
                  </div>
                  <div className="swatch-content">
                    <span className="swatch-name">{item.name}</span>
                    <span className="swatch-spec">{item.spec}</span>
                    <span className="swatch-desc">{item.desc}</span>
                    <span className="swatch-badge">{item.badge}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 2: Sàn Đá & Gỗ */}
        {activeTab === "flooring" && (
          <div className="cabin-cards-grid">
            {FLOOR_OPTIONS.map((item) => {
              const isSelected = selectedFloorId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`cabin-material-card ${isSelected ? "active" : ""}`}
                  onClick={() => handleSelectFloor(item)}
                >
                  <div className={`swatch-preview-box swatch-floor-${item.id}`}>
                    <span className="swatch-code-tag">{item.code}</span>
                    {isSelected && (
                      <div className="swatch-check-icon">
                        <i className="bi bi-check-lg"></i>
                      </div>
                    )}
                  </div>
                  <div className="swatch-content">
                    <span className="swatch-name">{item.name}</span>
                    <span className="swatch-spec">{item.spec}</span>
                    <span className="swatch-desc">{item.desc}</span>
                    <span className="swatch-badge">{item.badge}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 3: Trần LED */}
        {activeTab === "ceiling" && (
          <div className="cabin-cards-grid">
            {CEILING_OPTIONS.map((item) => {
              const isSelected = selectedCeilingId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`cabin-material-card ${isSelected ? "active" : ""}`}
                  onClick={() => handleSelectCeiling(item)}
                >
                  <div className={`swatch-preview-box swatch-ceil-${item.id}`}>
                    <span className="swatch-code-tag">{item.code}</span>
                    {isSelected && (
                      <div className="swatch-check-icon">
                        <i className="bi bi-check-lg"></i>
                      </div>
                    )}
                  </div>
                  <div className="swatch-content">
                    <span className="swatch-name">{item.name}</span>
                    <span className="swatch-spec">{item.spec}</span>
                    <span className="swatch-desc">{item.desc}</span>
                    <span className="swatch-badge">{item.badge}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 4: Tay Vịn */}
        {activeTab === "handrail" && (
          <div className="cabin-cards-grid">
            {HANDRAIL_OPTIONS.map((item) => {
              const isSelected = selectedHandrailId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`cabin-material-card ${isSelected ? "active" : ""}`}
                  onClick={() => handleSelectHandrail(item)}
                >
                  <div className={`swatch-preview-box swatch-rail-${item.id}`}>
                    <span className="swatch-code-tag">{item.code}</span>
                    {isSelected && (
                      <div className="swatch-check-icon">
                        <i className="bi bi-check-lg"></i>
                      </div>
                    )}
                  </div>
                  <div className="swatch-content">
                    <span className="swatch-name">{item.name}</span>
                    <span className="swatch-spec">{item.spec}</span>
                    <span className="swatch-desc">{item.desc}</span>
                    <span className="swatch-badge">{item.badge}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Footer & Đồng bộ Dự toán */}
      <div className="cabin-viz-footer">
        <div className="cabin-selected-badges">
          <span className="badge-item">
            1. Vách: <strong>{curWallObj.name}</strong>
          </span>
          <span className="badge-item">
            2. Sàn: <strong>{curFloorObj.name}</strong>
          </span>
          <span className="badge-item">
            3. Trần: <strong>{curCeilObj.name}</strong>
          </span>
          <span className="badge-item">
            4. Tay vịn: <strong>{curRailObj.name}</strong>
          </span>
        </div>

        <div className="cabin-footer-actions">
          <button
            type="button"
            className="btn-viz-reset"
            onClick={handleReset}
            title="Khôi phục cấu hình tiêu chuẩn"
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i>
            Đặt lại
          </button>
          <button
            type="button"
            className="btn-viz-apply"
            onClick={handleConsultClick}
            title="Chuyển cấu hình này vào bảng dự toán"
          >
            <span>Tư vấn cấu hình này</span>
            <i className="bi bi-arrow-down-short fs-5"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
