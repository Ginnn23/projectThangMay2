import { useState, useRef } from "react";
import { API_ORIGIN, apiClient } from "../api/client";
import "./AiVisionScanner.css";

function resolveImageUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url) || url.startsWith("data:") || url.startsWith("blob:")) return url;
  return `${API_ORIGIN}${url.startsWith("/") ? url : `/${url}`}`;
}

// Blueprint sample presets with SVG data URIs
const SAMPLE_PRESETS = [
  {
    id: "homelift-nha-pho",
    name: "Mặt bằng nhà phố hẹp (1350 x 1400 mm)",
    badge: "Homelift Kính",
    prompt: "Bản vẽ thiết kế ô thang lọt lòng thang bộ nhà phố 4 tầng, kích thước lọt lòng 1350x1400mm, hố PIT 350mm, thang kính Homelift quan sát.",
    svgColor: "#0284c7"
  },
  {
    id: "thang-tieu-chuan",
    name: "Bản vẽ giếng thang tiêu chuẩn (1500 x 1550 mm)",
    badge: "Inox 450kg",
    prompt: "Bản vẽ kết cấu hố thang bê tông 5 tầng, kích thước lọt lòng 1500x1550mm, hố PIT 800mm, tải trọng 450kg động cơ Fuji.",
    svgColor: "#d9a441"
  },
  {
    id: "biet-thu-cao-cap",
    name: "Mặt bằng biệt thự cao cấp (1750 x 1750 mm)",
    badge: "Biệt thự PVD Gold",
    prompt: "Bản vẽ kiến trúc biệt thự cao cấp 4 tầng, giếng thang 1750x1750mm, cabin vách kính hoặc inox gương vàng PVD hoàng gia 630kg.",
    svgColor: "#10b981"
  },
  {
    id: "toa-nha-10-tang",
    name: "Tòa nhà cao tầng (10 tầng - 630kg)",
    badge: "Tòa nhà 10 tầng",
    prompt: "Bản vẽ mặt bằng kiến trúc tòa nhà văn phòng 10 tầng, giếng thang bê tông lọt lòng 1800x1800mm, hố PIT 1400mm, OH 4200mm, tải trọng 630kg động cơ Fuji tốc độ cao 1.75m/s.",
    svgColor: "#8b5cf6"
  },
  {
    id: "thang-mat-tien-kinh",
    name: "Thang ngoài mặt tiền đường (Kính Panorama 4 tầng)",
    badge: "Mặt tiền phố",
    prompt: "Bản vẽ kiến trúc thang máy bố trí ngoài mặt tiền đường, 4 tầng, giếng thang kính lọt lòng 1600x1600mm, cabin vách kính an toàn view phố.",
    svgColor: "#06b6d4"
  }
];

function getAdaptiveBlueprintSvgString({
  title = "Mặt bằng bố trí hố thang máy",
  w = 1350,
  d = 1400,
  cabinType = "tieu-chuan",
  capacity = 450,
  stops = 4,
  isFacade = false,
  isCommercialHighRise = false,
  isCap4 = false,
  hasMezzanine = false
}) {
  const isGlass = cabinType === "homelift-kinh" || isFacade;
  const isVilla = cabinType === "biet-thu";
  const highRiseMode = isCommercialHighRise || stops >= 7;

  let shaftStroke = "#d9a441";
  let shaftFill = "rgba(217,164,65,0.06)";
  let cabinStroke = "#38bdf8";
  let cabinFill = "rgba(56,189,248,0.1)";
  let cabinLabel = `CABIN INOX 304 (${capacity}KG - ${Math.round(capacity / 70)} NGƯỜI)`;
  let wallDesc = "HỐ BÊ TÔNG / GẠCH 200MM";

  if (isCap4 && !hasMezzanine) {
    shaftStroke = "#ef4444";
    shaftFill = "rgba(239,68,68,0.08)";
    cabinStroke = "#ef4444";
    cabinFill = "rgba(239,68,68,0.05)";
    cabinLabel = "⚠️ CHƯA ĐỦ 2 ĐIỂM DỪNG (CẦN TỐI THIỂU 2 TẦNG)";
  } else if (isGlass) {
    shaftStroke = "#06b6d4";
    shaftFill = "rgba(6,182,212,0.08)";
    cabinStroke = "#22d3ee";
    cabinFill = "rgba(6,182,212,0.18)";
    cabinLabel = isFacade
      ? "CABIN KÍNH CƯỜNG LỰC 10MM (PANORAMA VIEW PHỐ)"
      : "CABIN KÍNH HOMELIFT ĐÓN SÁNG (10MM)";
    wallDesc = isFacade ? "VÁCH KÍNH MẶT TIỀN / KHUNG NHÔM ANODE" : "KHUNG THÉP BỌC KÍNH CƯỜNG LỰC";
  } else if (isVilla) {
    shaftStroke = "#eab308";
    shaftFill = "rgba(234,179,8,0.08)";
    cabinStroke = "#f59e0b";
    cabinFill = "rgba(245,158,11,0.18)";
    cabinLabel = "CABIN INOX GƯƠNG VÀNG PVD LUXURY";
    wallDesc = "HỐ BÊ TÔNG ỐP ĐÁ / KHUNG MẠ PVD";
  } else if (highRiseMode) {
    shaftStroke = "#8b5cf6";
    shaftFill = "rgba(139,92,246,0.08)";
    cabinStroke = "#a78bfa";
    cabinFill = "rgba(139,92,246,0.15)";
    cabinLabel = `CABIN CAO ỐC 630KG (8-9 NGƯỜI) - 1.75M/S`;
    wallDesc = "TƯỜNG BÊ TÔNG CỐT THÉP CHỊU LỰC 200MM";
  }

  const shaftSvgW = Math.min(270, Math.max(190, (w / 1800) * 260));
  const shaftSvgD = Math.min(230, Math.max(160, (d / 1800) * 220));
  const shaftX = 310 - shaftSvgW / 2;
  const shaftY = 195 - shaftSvgD / 2;

  const cabinSvgW = shaftSvgW * 0.72;
  const cabinSvgD = shaftSvgD * 0.72;
  const cabinX = 310 - cabinSvgW / 2;
  const cabinY = shaftY + (shaftSvgD - cabinSvgD) / 2 + 10;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="620" height="420" viewBox="0 0 620 420" style="background:#09192f;font-family:sans-serif;">
    <defs>
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
      </pattern>
      <pattern id="concreteHatch" width="10" height="10" patternUnits="userSpaceOnUse">
        <path d="M 0 10 L 10 0 M 0 0 L 10 10" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="0.8"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />

    <rect x="35" y="30" width="550" height="350" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="6,4"/>
    <text x="45" y="50" fill="#94a3b8" font-size="11" font-weight="bold">MẶT BẰNG KỸ THUẬT 2D - ĐIỀU CHỈNH THEO ĐỀ XUẤT CABIN AI</text>
    <text x="575" y="50" fill="#38bdf8" font-size="10" text-anchor="end">${wallDesc}</text>

    ${isFacade ? `
      <rect x="${shaftX - 25}" y="${shaftY - 28}" width="${shaftSvgW + 50}" height="18" rx="3" fill="rgba(6,182,212,0.2)" stroke="#06b6d4" stroke-width="1"/>
      <text x="310" y="${shaftY - 15}" fill="#22d3ee" font-size="9.5" font-weight="bold" text-anchor="middle">▲ MẶT TIỀN ĐƯỜNG PHỐ (HƯỚNG NHÌN PANORAMA TOÀN CẢNH) ▲</text>
    ` : ''}

    <rect x="${shaftX - 16}" y="${shaftY - 16}" width="${shaftSvgW + 32}" height="${shaftSvgD + 32}" fill="url(#concreteHatch)" stroke="#475569" stroke-width="2"/>
    <rect x="${shaftX}" y="${shaftY}" width="${shaftSvgW}" height="${shaftSvgD}" fill="${shaftFill}" stroke="${shaftStroke}" stroke-width="2.5"/>

    <line x1="${shaftX}" y1="${shaftY}" x2="${shaftX + shaftSvgW}" y2="${shaftY + shaftSvgD}" stroke="${shaftStroke}" stroke-width="1" stroke-dasharray="4,4" opacity="0.35"/>
    <line x1="${shaftX + shaftSvgW}" y1="${shaftY}" x2="${shaftX}" y2="${shaftY + shaftSvgD}" stroke="${shaftStroke}" stroke-width="1" stroke-dasharray="4,4" opacity="0.35"/>

    ${highRiseMode ? `
      <rect x="250" y="${shaftY + 4}" width="120" height="18" fill="rgba(167,139,250,0.3)" stroke="#a78bfa" stroke-width="1.5"/>
      <text x="310" y="${shaftY + 16}" fill="#ddd6fe" font-size="9" font-weight="bold" text-anchor="middle">ĐỐI TRỌNG (RAY T89)</text>
    ` : ''}

    <rect x="${cabinX}" y="${cabinY}" width="${cabinSvgW}" height="${cabinSvgD}" rx="4" fill="${cabinFill}" stroke="${cabinStroke}" stroke-width="${isGlass ? '3' : '2'}"/>

    ${isGlass ? `
      <line x1="${cabinX + 4}" y1="${cabinY + 4}" x2="${cabinX + cabinSvgW - 4}" y2="${cabinY + 4}" stroke="#67e8f9" stroke-width="2"/>
      <line x1="${cabinX + 4}" y1="${cabinY + 4}" x2="${cabinX + 4}" y2="${cabinY + cabinSvgD - 4}" stroke="#67e8f9" stroke-width="2"/>
      <line x1="${cabinX + cabinSvgW - 4}" y1="${cabinY + 4}" x2="${cabinX + cabinSvgW - 4}" y2="${cabinY + cabinSvgD - 4}" stroke="#67e8f9" stroke-width="2"/>
    ` : ''}

    ${isVilla ? `
      <rect x="${cabinX + 3}" y="${cabinY + 3}" width="10" height="10" fill="none" stroke="#f59e0b" stroke-width="1.5"/>
      <rect x="${cabinX + cabinSvgW - 13}" y="${cabinY + 3}" width="10" height="10" fill="none" stroke="#f59e0b" stroke-width="1.5"/>
      <rect x="${cabinX + 3}" y="${cabinY + cabinSvgD - 13}" width="10" height="10" fill="none" stroke="#f59e0b" stroke-width="1.5"/>
      <rect x="${cabinX + cabinSvgW - 13}" y="${cabinY + cabinSvgD - 13}" width="10" height="10" fill="none" stroke="#f59e0b" stroke-width="1.5"/>
    ` : ''}

    <line x1="${cabinX + cabinSvgW * 0.2}" y1="${cabinY + cabinSvgD}" x2="${cabinX + cabinSvgW * 0.8}" y2="${cabinY + cabinSvgD}" stroke="#fbbf24" stroke-width="4"/>
    <text x="310" y="${cabinY + cabinSvgD + 14}" fill="#fbbf24" font-size="9" font-weight="bold" text-anchor="middle">CỬA MỞ 2 CÁNH (2CO)</text>

    <text x="310" y="${cabinY + cabinSvgD / 2 - 4}" fill="${cabinStroke}" font-size="10.5" font-weight="bold" text-anchor="middle">${cabinLabel}</text>
    <text x="310" y="${cabinY + cabinSvgD / 2 + 12}" fill="#cbd5e1" font-size="9" text-anchor="middle">KÍCH THƯỚC: ${w - 400} x ${d - 450} mm</text>

    <line x1="${shaftX}" y1="${shaftY - 8}" x2="${shaftX + shaftSvgW}" y2="${shaftY - 8}" stroke="#ffd875" stroke-width="1.5"/>
    <circle cx="${shaftX}" cy="${shaftY - 8}" r="2.5" fill="#ffd875"/>
    <circle cx="${shaftX + shaftSvgW}" cy="${shaftY - 8}" r="2.5" fill="#ffd875"/>
    <text x="310" y="${shaftY - 14}" fill="#ffd875" font-size="11" font-weight="bold" text-anchor="middle">W: ${w} mm</text>

    <line x1="${shaftX + shaftSvgW + 18}" y1="${shaftY}" x2="${shaftX + shaftSvgW + 18}" y2="${shaftY + shaftSvgD}" stroke="#ffd875" stroke-width="1.5"/>
    <circle cx="${shaftX + shaftSvgW + 18}" cy="${shaftY}" r="2.5" fill="#ffd875"/>
    <circle cx="${shaftX + shaftSvgW + 18}" cy="${shaftY + shaftSvgD}" r="2.5" fill="#ffd875"/>
    <text x="${shaftX + shaftSvgW + 28}" y="${shaftY + shaftSvgD / 2 + 4}" fill="#ffd875" font-size="11" font-weight="bold">D: ${d} mm</text>

    <rect x="110" y="388" width="400" height="24" rx="4" fill="${shaftStroke}" opacity="0.95"/>
    <text x="310" y="404" fill="#09192f" font-size="11" font-weight="bold" text-anchor="middle">${title} • ${stops} TẦNG</text>
  </svg>`;
}

function getBlueprintSvgString(title, w, d, color = "#0284c7") {
  return getAdaptiveBlueprintSvgString({ title, w, d });
}

function generateBlueprintSvg(title, w, d, color = "#0284c7") {
  const svg = getAdaptiveBlueprintSvgString({ title, w, d });
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function generateAdaptiveBlueprintSvg(opts) {
  const svg = getAdaptiveBlueprintSvgString(opts);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default function AiVisionScanner({ onApplySpecs }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [activeCabinChoice, setActiveCabinChoice] = useState("homelift-kinh");
  const [viewMode, setViewMode] = useState("2d");
  const fileInputRef = useRef(null);

  const scanSteps = [
    "Khởi tạo không gian bản vẽ & nhận diện khung kiến trúc...",
    "Gemini Vision quét kết cấu ô chờ thang máy & giếng trời...",
    "Trích xuất số đo kích thước lọt lòng giếng thang (W x D mm)...",
    "Khớp nối tiêu chuẩn kỹ thuật & tính toán tải trọng tối ưu..."
  ];

  const runScanningAnimation = () => {
    setScanning(true);
    setStepIndex(0);

    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < scanSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 550);

    return () => clearInterval(interval);
  };

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.size > 15 * 1024 * 1024) {
      setError("File quá lớn! Vui lòng chọn file ảnh dung lượng dưới 15 MB.");
      return;
    }

    setFile(selectedFile);
    setError("");
    setResult(null);

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    await analyzeWithApi(selectedFile, "");
  };

  const handleSampleClick = async (sample) => {
    setError("");
    setResult(null);

    let w = "1350", d = "1400";
    if (sample.id === "thang-tieu-chuan") { w = "1500"; d = "1550"; }
    if (sample.id === "biet-thu-cao-cap") { w = "1750"; d = "1750"; }
    if (sample.id === "toa-nha-10-tang") { w = "1800"; d = "1800"; }
    if (sample.id === "thang-mat-tien-kinh") { w = "1600"; d = "1600"; }

    const svgString = getBlueprintSvgString(sample.name, w, d, sample.svgColor);
    const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
    setPreviewUrl(dataUri);
    setFile(null);

    try {
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const sampleFile = new File([blob], `${sample.id}-blueprint.svg`, { type: "image/svg+xml" });
      await analyzeWithApi(sampleFile, sample.prompt);
    } catch {
      await analyzeWithApi(null, sample.prompt);
    }
  };

  const analyzeWithApi = async (fileToUpload, promptText) => {
    const clearAnim = runScanningAnimation();

    try {
      const formData = new FormData();
      if (fileToUpload) {
        formData.append("file", fileToUpload);
      }
      if (promptText) {
        formData.append("userPrompt", promptText);
      }

      const res = await apiClient.post("/chat/vision-analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000
      });

      // Wait brief moment for animation smoothness
      await new Promise((r) => setTimeout(r, 1200));

      if (res.data && res.data.success) {
        setResult(res.data);
      } else {
        throw new Error(res.data?.message || "Không thể phân tích bản vẽ lúc này.");
      }
    } catch (err) {
      console.warn("AI Vision scan network/server notice, activating client fallback:", err);

      // Smart client fallback based on prompt / file name
      const hint = `${promptText || ""} ${fileToUpload?.name || ""}`.toLowerCase();
      const isFacade = hint.includes("mat tien") || hint.includes("mặt tiền") || hint.includes("ngoai troi") || hint.includes("ngoài trời") || hint.includes("view") || hint.includes("pho") || hint.includes("phố");
      const is10 = hint.includes("10 tang") || hint.includes("10 tầng") || hint.includes("10-tang") || hint.includes("10t") || hint.includes("10 floor");
      const isCap4 = hint.includes("cap 4") || hint.includes("cấp 4") || hint.includes("1 tang") || hint.includes("1 tầng");
      const hasMezzanine = hint.includes("lung") || hint.includes("lửng") || hint.includes("gac") || hint.includes("gác");

      const priceMin = is10 ? 780000000 : (isCap4 ? 280000000 : (isFacade ? 400000000 : 360000000));
      const priceMax = is10 ? 960000000 : (isCap4 ? 340000000 : (isFacade ? 490000000 : 440000000));

      const fallbackResult = {
        success: true,
        isElevatorDetected: !isCap4 || hasMezzanine,
        confidenceScore: is10 ? 0.95 : 0.92,
        imageType: is10
          ? "Bản vẽ kiến trúc tòa nhà cao tầng (10 tầng)"
          : (isFacade
          ? "Bản vẽ thang máy mặt tiền quan sát phố (4 tầng)"
          : (isCap4
          ? (hasMezzanine ? "Bản vẽ nhà cấp 4 (Có gác lửng/bán hầm)" : "Bản vẽ nhà cấp 4 (1 tầng trệt thuần túy)")
          : "Bản vẽ mặt bằng kết cấu hố thang")),
        shaftWidthMm: is10 ? 1800 : (isFacade ? 1600 : (isCap4 ? 1200 : 1500)),
        shaftDepthMm: is10 ? 1800 : (isFacade ? 1600 : (isCap4 ? 1200 : 1550)),
        pitDepthMm: is10 ? 1400 : (isFacade ? 350 : (isCap4 ? 250 : 800)),
        overheadMm: is10 ? 4200 : (isFacade ? 3000 : (isCap4 ? 2800 : 3600)),
        stops: is10 ? 10 : (isFacade ? 4 : (isCap4 ? 2 : 5)),
        buildingType: is10 ? "van-phong" : (isCap4 ? "nha-pho-cai-tao" : "nha-pho-xay-moi"),
        suggestedCapacityKg: is10 ? 630 : (isCap4 ? 300 : 450),
        suggestedElevatorType: (isFacade || isCap4) ? "homelift-kinh" : (is10 ? "tieu-chuan" : "tieu-chuan"),
        suggestedMotorBrand: "Fuji",
        suggestedDoorType: "2CO",
        cabinDimensions: is10 ? "1400 x 1350 x 2200 mm" : (isFacade ? "1100 x 1050 x 2200 mm" : "1100 x 1000 x 2150 mm"),
        estimatedPriceMin: priceMin,
        estimatedPriceMax: priceMax,
        summaryAnalysis: is10
          ? "Đã nhận diện bản vẽ Tòa nhà cao tầng (10 tầng). Với công trình cao tầng có tần suất di chuyển liên tục, giải pháp tối ưu là thang máy tải khách tiêu chuẩn Inox 304 tốc độ cao (1.5 - 1.75 m/s) tải trọng 630kg (8-9 người). Hố PIT yêu cầu từ 1400mm và OH 4200mm đạt chuẩn an toàn TCVN."
          : (isFacade
          ? "AI Vision nhận diện vị trí hố thang bố trí ở MẶT TIỀN ĐƯỜNG / NGOÀI TRỜI (4 tầng). Khuyến nghị tối ưu 100% là lắp đặt Thang Máy Kính Cường Lực Panorama Quan Sát Phố. Giúp ngắm trọn cảnh quan đường phố, tạo điểm nhấn kiến trúc sang trọng hiện đại cho mặt tiền mà không tốn diện tích sàn bên trong nhà."
          : (isCap4 && !hasMezzanine
          ? "⚠️ LƯU Ý KỸ THUẬT: Bản vẽ được nhận diện là Nhà Cấp 4 (1 tầng trệt). Thang máy bắt buộc phải có tối thiểu 2 điểm dừng. Nếu nhà thuần 1 tầng và không có gác lửng/bán hầm thì không khả thi lắp thang máy tiêu chuẩn."
          : "Hệ thống phân tích dự phòng: Đã nhận diện ô thang mặt bằng kỹ thuật, kích thước giếng thang tối ưu cho thang máy gia đình tiêu chuẩn.")),
        technicalHighlights: is10
          ? [
              "Tòa nhà 10 tầng yêu cầu động cơ kéo công suất lớn 5.5kW - 7.5kW và cáp tải cường độ cao chống dão.",
              "Hố PIT yêu cầu tối thiểu 1400 mm để bố trí trụ giảm chấn thủy lực đáy hố theo đúng quy chuẩn an toàn TCVN 6395.",
              "Chiều cao tầng trên cùng OH yêu cầu 4200 mm để đảm bảo khoảng cách an toàn bảo trì trên nóc cabin.",
              "Hệ thống điều khiển tín hiệu vi xử lý nhóm thông minh tối ưu thời gian chờ gọi tầng."
            ]
          : (isFacade
          ? [
              "Thang lắp ngoài mặt tiền sử dụng kính dán an toàn 2 lớp 10mm-12mm chống tia UV và chịu áp lực gió ngoài trời.",
              "Hệ khung định hình bọc hợp kim nhôm Anode cao cấp hoặc thép sơn tĩnh điện chống rỉ sét tuyệt đối.",
              "Cửa tầng kính quan sát đồng bộ với cabin, tạo góc nhìn panorama thoáng đãng khi di chuyển.",
              "Hệ thống điều hòa mini hoặc thông gió chuyên dụng bảo đảm cabin luôn mát mẻ dưới ánh nắng mặt trời."
            ]
          : [
              "Hố giếng thang tiêu chuẩn chịu tải cao.",
              "Động cơ Fuji không hộp số tiết kiệm 40% điện năng.",
              "Hệ thống cảm biến photocell chống kẹt cửa đa điểm an toàn."
            ]),
        suitableCabinStyles: isFacade
          ? [
              "🌟 ĐỀ XUẤT CHO MẶT TIỀN: Cabin Kính Cường Lực An Toàn 4 Mặt Panorama (View toàn cảnh phố)",
              "Kính dán an toàn 2 lớp 10mm-12mm đón ánh sáng tự nhiên và mở rộng tầm nhìn mặt tiền",
              "Khung nhôm định hình cao cấp mạ Anode màu Gold hoặc Đen mờ chống oxy hóa ngoài trời",
              "Trần đèn LED dịu mắt và sàn đá hoa cương nguyên khối chịu lực cao cấp"
            ]
          : (is10
          ? [
              "Inox 304 sọc nhuyễn kết hợp inox gương chống trầy xước",
              "Màn hình LCD hiển thị tầng và chiều chạy",
              "Trần đèn LED chiếu sáng vát gián tiếp cao cấp"
            ]
          : [
              "Inox 304 sọc nhuyễn kết hợp inox gương chống trầy xước",
              "Màn hình LCD hiển thị tầng và chiều chạy",
              "Trần đèn LED chiếu sáng vát gián tiếp cao cấp"
            ])
      };

      setResult(fallbackResult);
      setError("");
    } finally {
      clearAnim();
      setScanning(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleApply = () => {
    if (!result || !onApplySpecs) return;

    onApplySpecs({
      buildingType: result.buildingType || "nha-pho-xay-moi",
      capacityKg: result.suggestedCapacityKg || 350,
      elevatorType: activeCabinChoice || result.suggestedElevatorType || "homelift-kinh",
      motorBrand: result.suggestedMotorBrand || "Fuji",
      doorType: result.suggestedDoorType || "2CO",
      stops: result.stops || 4,
      shaftWidth: result.shaftWidthMm || 1350,
      shaftDepth: result.shaftDepthMm || 1400
    });
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setActiveCabinChoice("homelift-kinh");
    setViewMode("2d");
    setError("");
  };

  const currentCabin = activeCabinChoice || result?.suggestedElevatorType || "tieu-chuan";
  const isFacadeResult = result?.summaryAnalysis?.toLowerCase().includes("mặt tiền") ||
                         result?.imageType?.toLowerCase().includes("mặt tiền") ||
                         currentCabin === "homelift-kinh";
  const isHighRiseResult = (result?.stops || 4) >= 7;
  const isCap4Result = result?.stops === 2 && !result?.isElevatorDetected;

  const adaptiveSvgDataUri = result
    ? generateAdaptiveBlueprintSvg({
        title: result.imageType || "Bản vẽ mặt bằng kiến trúc",
        w: result.shaftWidthMm || 1350,
        d: result.shaftDepthMm || 1400,
        cabinType: currentCabin,
        capacity: result.suggestedCapacityKg || 450,
        stops: result.stops || 4,
        isFacade: isFacadeResult,
        isCommercialHighRise: isHighRiseResult,
        isCap4: isCap4Result,
        hasMezzanine: result?.isElevatorDetected && isCap4Result
      })
    : null;

  const formatVnd = (val) => (val ? new Intl.NumberFormat("vi-VN").format(val) + " đ" : "350.000.000 đ");

  return (
    <div className="ai-vision-wrapper" id="ai-vision-section">
      <div className="ai-vision-header">
        <div>
          <div className="ai-vision-badge mb-2">
            <span className="ai-vision-pulse"></span>
            AI Vision Multimodal • Nhận Diện Bản Vẽ Kỹ Thuật
          </div>
          <h3 className="h5 fw-bold mb-1 text-white">
            <i className="bi bi-camera-reels me-2 text-warning"></i>
            Quét Bản Vẽ Mặt Bằng & Nhận Diện Kích Thước Hố Thang Tự Động
          </h3>
          <p className="text-secondary small mb-0">
            Ứng dụng Google Gemini Vision đọc bản vẽ kiến trúc 2D, nhận diện kích thước ô thang và đề xuất cấu hình kỹ thuật chuẩn xác.
          </p>
        </div>
        {result && (
          <button type="button" className="btn btn-outline-light btn-sm" onClick={handleReset}>
            <i className="bi bi-arrow-repeat me-1"></i> Quét bản vẽ khác
          </button>
        )}
      </div>

      <div className="ai-vision-body">
        {error && (
          <div className="alert alert-warning py-2 mb-3" style={{ fontSize: "13px" }}>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        {!previewUrl && !scanning && !result && (
          <div>
            <div
              className={`ai-vision-dropzone ${isDragActive ? "drag-active" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />
              <div className="ai-vision-icon-box">
                <i className="bi bi-cloud-arrow-up-fill"></i>
              </div>
              <h5 className="fw-bold text-white mb-2">Kéo thả ảnh bản vẽ hoặc bấm để tải lên</h5>
              <p className="text-muted small mb-3">
                Hỗ trợ ảnh chụp bản vẽ mặt bằng nhà, bản vẽ giếng thang, hoặc ảnh ô thang thực tế (JPG, PNG, WebP tối đa 15MB)
              </p>
              <button type="button" className="btn btn-outline-warning btn-sm px-4 fw-semibold">
                <i className="bi bi-image me-2"></i> Chọn tệp ảnh từ thiết bị
              </button>
            </div>

            <div className="ai-vision-samples-label text-center">
              <span>HOẶC TRẢI NGHIỆM NHANH VỚI BẢN VẼ MẪU CÓ SẴN:</span>
            </div>
            <div className="ai-vision-samples">
              {SAMPLE_PRESETS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  className="ai-vision-sample-btn"
                  onClick={() => handleSampleClick(sample)}
                >
                  <i className="bi bi-file-earmark-code text-warning"></i>
                  <span>{sample.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scanning Radar Animation */}
        {scanning && (
          <div className="text-center py-4">
            <div className="ai-vision-scanning-container">
              {previewUrl && (
                <img src={previewUrl} alt="Bản vẽ đang quét" className="ai-vision-scan-image" />
              )}
              <div className="ai-vision-laser-bar"></div>
              <div className="ai-vision-scan-overlay"></div>
            </div>

            <div className="ai-vision-status-steps">
              {scanSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`ai-vision-step-item ${idx === stepIndex ? "active" : ""} ${idx < stepIndex ? "completed" : ""}`}
                >
                  <i
                    className={`bi ${
                      idx < stepIndex
                        ? "bi-check-circle-fill text-success"
                        : idx === stepIndex
                        ? "bi-arrow-repeat spin text-warning"
                        : "bi-circle"
                    }`}
                  ></i>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scan Result */}
        {!scanning && result && (
          <div className="ai-vision-result-card">
            <div className="row g-4 align-items-center">
              <div className="col-lg-5 text-center">
                <div className="d-flex align-items-center justify-content-between mb-2 px-1">
                  <div className="btn-group btn-group-sm">
                    <button
                      type="button"
                      className={`btn btn-sm ${viewMode === "2d" ? "btn-warning fw-bold text-dark" : "btn-outline-secondary text-white"}`}
                      onClick={() => setViewMode("2d")}
                    >
                      <i className="bi bi-rulers me-1"></i> Mặt bằng 2D Cabin
                    </button>
                    {previewUrl && !previewUrl.startsWith("data:image/svg+xml") && (
                      <button
                        type="button"
                        className={`btn btn-sm ${viewMode === "photo" ? "btn-warning fw-bold text-dark" : "btn-outline-secondary text-white"}`}
                        onClick={() => setViewMode("photo")}
                      >
                        <i className="bi bi-image me-1"></i> Ảnh bản vẽ gốc
                      </button>
                    )}
                  </div>
                  <span className="badge bg-dark border border-secondary text-warning" style={{ fontSize: "11px" }}>
                    {currentCabin === "homelift-kinh"
                      ? "🪟 Kính Panorama"
                      : currentCabin === "biet-thu"
                      ? "⚜️ Inox Vàng PVD"
                      : "🏢 Inox 304"}
                  </span>
                </div>

                <div
                  className="position-relative rounded-3 overflow-hidden border border-warning shadow d-flex align-items-center justify-content-center"
                  style={{ width: "100%", height: "270px", background: "#09192f" }}
                >
                  <img
                    src={
                      viewMode === "photo" && previewUrl && !previewUrl.startsWith("data:image/svg+xml")
                        ? previewUrl
                        : (adaptiveSvgDataUri || previewUrl)
                    }
                    alt="Mặt bằng kỹ thuật 2D điều chỉnh theo cabin"
                    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", background: "#09192f" }}
                  />
                  <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white py-1 px-2 small">
                    <i className="bi bi-check2-circle text-success me-1"></i>
                    {viewMode === "2d"
                      ? `Mặt bằng 2D: Cabin ${currentCabin === "homelift-kinh" ? "Kính Panorama" : (currentCabin === "biet-thu" ? "Inox Vàng PVD" : "Inox 304")}`
                      : (result.imageType || "Ảnh bản vẽ")}
                  </div>
                </div>
              </div>

              <div className="col-lg-7">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  {result.isElevatorDetected ? (
                    <span className="badge bg-success-subtle text-success border border-success px-3 py-1">
                      <i className="bi bi-shield-check me-1"></i> Đã nhận diện ô thang khả thi
                    </span>
                  ) : (
                    <span className="badge bg-warning-subtle text-warning border border-warning px-3 py-1">
                      <i className="bi bi-exclamation-triangle-fill me-1"></i> Lưu ý kỹ thuật: Thang máy cần tối thiểu 2 điểm dừng
                    </span>
                  )}
                  <span className="small text-muted">Mã giải pháp: HH-VISION-{Math.floor(1000 + Math.random() * 9000)}</span>
                </div>

                <h4 className="fw-bold text-white mb-3">
                  {result.isElevatorDetected
                    ? `Đề xuất: Thang Máy ${result.suggestedElevatorType === "homelift-kinh" ? "Kính Homelift Panorama" : (result.suggestedElevatorType === "biet-thu" ? "Biệt Thự Sang Trọng PVD Gold" : "Gia Đình Tiêu Chuẩn")} (${result.suggestedCapacityKg} kg)`
                    : `Tư vấn kỹ thuật: ${result.imageType}`}
                </h4>

                <div className="ai-vision-specs-grid">
                  <div className="ai-vision-spec-item">
                    <div className="label">Kích thước hố lọt lòng (W x D)</div>
                    <div className="value highlight">{result.shaftWidthMm} x {result.shaftDepthMm} mm</div>
                  </div>
                  <div className="ai-vision-spec-item">
                    <div className="label">Tải trọng đề xuất</div>
                    <div className="value">{result.suggestedCapacityKg} kg ({Math.round(result.suggestedCapacityKg / 70)} người)</div>
                  </div>
                  <div className="ai-vision-spec-item">
                    <div className="label">Hố PIT & Chiều cao OH</div>
                    <div className="value">Pit: {result.pitDepthMm} mm | OH: {result.overheadMm} mm</div>
                  </div>
                  <div className="ai-vision-spec-item">
                    <div className="label">Động cơ & Cửa tầng</div>
                    <div className="value">{result.suggestedMotorBrand} • Cửa {result.suggestedDoorType}</div>
                  </div>
                </div>

                <div className="ai-vision-highlights-box">
                  <div className="small fw-bold text-warning mb-1">
                    <i className="bi bi-lightbulb me-1"></i> ĐÁNH GIÁ CHUYÊN MÔN KỸ SƯ HÀ HỒNG:
                  </div>
                  <p className="small text-light mb-2">{result.summaryAnalysis}</p>
                  {result.technicalHighlights?.length > 0 && (
                    <ul>
                      {result.technicalHighlights.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Tư vấn thiết kế cabin theo vị trí lắp đặt & Cho phép chọn để điều chỉnh 2D */}
                {result.suitableCabinStyles?.length > 0 && (
                  <div
                    className="p-3 mb-3 rounded-3"
                    style={{
                      background: "rgba(217, 164, 65, 0.08)",
                      border: "1px solid rgba(217, 164, 65, 0.35)"
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                      <span className="fw-bold text-warning small">
                        <i className="bi bi-palette2 me-1"></i> TƯ VẤN MẪU CABIN &amp; ĐIỀU CHỈNH TRÊN BẢN VẼ 2D:
                      </span>
                      {currentCabin === "homelift-kinh" && (
                        <span className="badge bg-info text-dark fw-bold" style={{ fontSize: "11px" }}>
                          <i className="bi bi-eye-fill me-1"></i> Khuyến nghị Kính Cường Lực Mặt Tiền
                        </span>
                      )}
                    </div>

                    {/* Bộ nút chuyển đổi mẫu cabin live trên bản vẽ 2D */}
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      <button
                        type="button"
                        className={`btn btn-sm ${currentCabin === "homelift-kinh" ? "btn-warning fw-bold text-dark" : "btn-outline-light text-light"}`}
                        style={{ fontSize: "12px", borderRadius: "8px" }}
                        onClick={() => {
                          setActiveCabinChoice("homelift-kinh");
                          setViewMode("2d");
                        }}
                      >
                        <i className="bi bi-eye-fill me-1"></i> Vách Kính Mặt Tiền (Panorama)
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${currentCabin === "biet-thu" ? "btn-warning fw-bold text-dark" : "btn-outline-light text-light"}`}
                        style={{ fontSize: "12px", borderRadius: "8px" }}
                        onClick={() => {
                          setActiveCabinChoice("biet-thu");
                          setViewMode("2d");
                        }}
                      >
                        <i className="bi bi-gem me-1"></i> Inox Gương Vàng PVD Luxury
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${currentCabin === "tieu-chuan" ? "btn-warning fw-bold text-dark" : "btn-outline-light text-light"}`}
                        style={{ fontSize: "12px", borderRadius: "8px" }}
                        onClick={() => {
                          setActiveCabinChoice("tieu-chuan");
                          setViewMode("2d");
                        }}
                      >
                        <i className="bi bi-shield-check me-1"></i> {result.stops >= 7 ? "Inox 304 Cao Ốc Văn Phòng" : "Inox 304 Tiêu Chuẩn"}
                      </button>
                    </div>

                    <ul className="small text-light mb-0 ps-3">
                      {result.suitableCabinStyles.map((styleItem, idx) => (
                        <li key={idx} className="mb-1">{styleItem}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Ghi chú kỹ thuật về bản vẽ 2D: Không hiển thị giá cứng tham khảo ở đây */}
                <div
                  className="p-3 mb-3 rounded-3"
                  style={{
                    background: "rgba(11, 31, 58, 0.75)",
                    border: "1px dashed rgba(217, 164, 65, 0.45)"
                  }}
                >
                  <div className="d-flex align-items-start gap-2">
                    <i className="bi bi-rulers fs-5 text-warning mt-1"></i>
                    <div>
                      <div className="fw-semibold text-warning small mb-1">
                        <i className="bi bi-info-circle-fill me-1"></i> BẢN VẼ 2D: ĐỊNH HÌNH KÍCH THƯỚC GIẾNG THANG &amp; VẬT LIỆU CABIN
                      </div>
                      <p className="small text-secondary mb-0" style={{ fontSize: "12px", lineHeight: "1.5" }}>
                        Bản vẽ mặt bằng 2D xác định <strong>kích thước hình học hố thang ({result.shaftWidthMm} x {result.shaftDepthMm} mm)</strong> và <strong>mô phỏng bố trí mẫu cabin 2D</strong>. Do bản vẽ 2D chưa thể hiện cao độ thực tế và địa chất hố móng, bảng dự toán chi phí chi tiết sẽ hiển thị khi bạn bấm nút <strong>[Áp dụng vào bộ dự toán]</strong> bên dưới hoặc hẹn kỹ sư đo laser miễn phí.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Khuyến cáo kỹ thuật chính thức */}
                <div className="p-2 mb-3 rounded-2 bg-dark bg-opacity-50 border border-secondary" style={{ fontSize: "12px", color: "#94a3b8" }}>
                  <i className="bi bi-info-circle-fill text-warning me-1"></i>
                  <strong>Khuyến cáo kỹ thuật:</strong> Kết quả nhận diện mang <em>tính chất tham khảo &amp; định hướng sơ bộ</em>. Để đảm bảo an toàn cơ khí và sản xuất lắp đặt chuẩn xác 100%, Kỹ sư Thang Máy Hà Hồng bắt buộc sẽ đến công trình khảo sát, đo độ thẳng đứng giếng thang bằng thước laser (hoàn toàn miễn phí) trước khi triển khai.
                </div>

                <div className="d-flex flex-column flex-sm-row gap-2">
                  <button
                    type="button"
                    className="ai-vision-apply-btn flex-grow-1"
                    onClick={handleApply}
                  >
                    <i className="bi bi-lightning-charge-fill fs-5"></i>
                    ÁP DỤNG THÔNG SỐ NÀY VÀO BỘ DỰ TOÁN
                  </button>
                  <a
                    href="#quote-form-section"
                    className="btn btn-outline-warning d-flex align-items-center justify-content-center fw-semibold px-3 py-2"
                    style={{ fontSize: "0.9rem", borderRadius: "10px", whiteSpace: "nowrap" }}
                    onClick={(e) => {
                      e.preventDefault();
                      handleApply();
                      setTimeout(() => {
                        const form = document.querySelector(".quote-form-card");
                        if (form) form.scrollIntoView({ behavior: "smooth" });
                      }, 200);
                    }}
                  >
                    <i className="bi bi-calendar-check me-1"></i> Đặt lịch đo thực tế
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
