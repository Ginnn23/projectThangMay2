import { useEffect, useState, useMemo } from "react";
import { apiClient } from "../api/client";

export default function DoanhThuAdmin({ onShowToast }) {
  // Stats & Contracts state
  const [stats, setStats] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [period, setPeriod] = useState("all"); // "all" | "year" | "quarter" | "month" | "custom"
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [customFromDate, setCustomFromDate] = useState("");
  const [customToDate, setCustomToDate] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("all");
  const [filterProjectStatus, setFilterProjectStatus] = useState("all");

  // Chart view mode
  const [chartMetricMode, setChartMetricMode] = useState("cash_vs_contract"); // "cash_vs_contract" | "cost_vs_profit" | "receivables" | "all"
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [contractForm, setContractForm] = useState(getInitialContractForm());
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Payment Recording Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedContractForPayment, setSelectedContractForPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState(getInitialPaymentForm());
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Ledger Detail View Modal
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [selectedContractForLedger, setSelectedContractForLedger] = useState(null);

  function getInitialContractForm() {
    return {
      contractCode: "",
      customerName: "",
      phoneNumber: "",
      email: "",
      projectName: "",
      address: "",
      elevatorType: "homelift-kinh",
      stops: 4,
      capacityKg: 450,
      motorBrand: "Fuji",
      doorType: "CO",
      contractDate: new Date().toISOString().slice(0, 10),
      expectedDeliveryDate: new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10),
      totalValue: 750000000,
      depositRate: 50,
      initialDepositAmount: 0,
      costEquipment: 410000000,
      costShipping: 20000000,
      costInstallation: 60000000,
      costOther: 20000000,
      paymentStatus: "ChuaDatCoc",
      projectStatus: "ChoDatCoc",
      estimateId: null,
      adminNotes: ""
    };
  }

  function getInitialPaymentForm() {
    return {
      paymentDate: new Date().toISOString().slice(0, 10),
      amount: "",
      paymentMethod: "Chuyển khoản",
      stage: "Đặt cọc đợt 1 (50%)",
      receiptCode: "",
      note: ""
    };
  }

  // Formatting helpers
  const formatVND = (val) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val || 0);

  const formatShortVND = (val) => {
    if (!val || val === 0) return "0 ₫";
    if (Math.abs(val) >= 1000000000) return (val / 1000000000).toFixed(2) + " Tỷ";
    if (Math.abs(val) >= 1000000) return (val / 1000000).toFixed(0) + " Tr";
    return formatVND(val);
  };

  const mapElevatorTypeName = (type) => {
    switch (type) {
      case "homelift-kinh":
        return "Homelift Kính Panorama";
      case "inox-guong-vang":
        return "Inox Gương Vàng Luxury";
      case "inox-tieu-chuan":
        return "Inox 304 Tiêu Chuẩn";
      default:
        return type || "Thang Máy Tiêu Chuẩn";
    }
  };

  const paymentStatusMap = {
    ChuaDatCoc: { label: "Chưa đặt cọc", color: "#64748b", bg: "#f1f5f9", icon: "bi-circle" },
    DaDatCoc: { label: "Đã đặt cọc", color: "#2563eb", bg: "#dbeafe", icon: "bi-shield-check" },
    ThanhToanMotPhan: { label: "Thanh toán 1 phần", color: "#d97706", bg: "#fef3c7", icon: "bi-pie-chart" },
    ThanhToanDu: { label: "Đã thanh toán đủ", color: "#16a34a", bg: "#dcfce7", icon: "bi-check2-all" },
    QuaHan: { label: "Quá hạn thanh toán", color: "#dc2626", bg: "#fee2e2", icon: "bi-exclamation-triangle" }
  };

  const projectStatusMap = {
    ChoDatCoc: { label: "1. Chờ đặt cọc", color: "#64748b", bg: "#f8fafc" },
    DaNhanCoc: { label: "2. Đã nhận cọc", color: "#0284c7", bg: "#e0f2fe" },
    DangNhapThietBi: { label: "3. Đang nhập thiết bị", color: "#7c3aed", bg: "#ede9fe" },
    DangLapDat: { label: "4. Đang lắp đặt", color: "#d97706", bg: "#fef3c7" },
    ChoNghiemThu: { label: "5. Chờ nghiệm thu", color: "#ea580c", bg: "#ffedd5" },
    DaBanGiao: { label: "6. Đã bàn giao", color: "#059669", bg: "#d1fae5" },
    HoanTat: { label: "7. Hoàn tất", color: "#15803d", bg: "#dcfce7" },
    TamDungHuy: { label: "8. Tạm dừng / Hủy", color: "#b91c1c", bg: "#fee2e2" }
  };

  // Fetch Dashboard Stats & Contracts
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Build query params
      const params = new URLSearchParams();
      params.append("period", period);
      if (period === "year") params.append("year", selectedYear);
      if (period === "quarter") {
        params.append("year", selectedYear);
        params.append("quarter", selectedQuarter);
      }
      if (period === "month") {
        params.append("year", selectedYear);
        params.append("month", selectedMonth);
      }
      if (period === "custom") {
        if (customFromDate) params.append("fromDate", customFromDate);
        if (customToDate) params.append("toDate", customToDate);
      }

      const [statsRes, contractsRes, estimatesRes] = await Promise.all([
        apiClient.get(`/contracts/stats?${params.toString()}`),
        apiClient.get("/contracts"),
        apiClient.get("/estimates/admin").catch(() => ({ data: [] }))
      ]);

      setStats(statsRes.data);
      setContracts(contractsRes.data || []);
      setEstimates(estimatesRes.data || []);
    } catch (err) {
      setError("Không thể tải dữ liệu điều hành doanh thu. Vui lòng kiểm tra API.");
      onShowToast?.("Lỗi kết nối API quản trị doanh thu.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period, selectedYear, selectedQuarter, selectedMonth, customFromDate, customToDate]);

  // Filtered Contracts Table Data
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      if (filterPaymentStatus !== "all" && c.paymentStatus !== filterPaymentStatus) return false;
      if (filterProjectStatus !== "all" && c.projectStatus !== filterProjectStatus) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        (c.contractCode || "").toLowerCase().includes(term) ||
        (c.customerName || "").toLowerCase().includes(term) ||
        (c.projectName || "").toLowerCase().includes(term) ||
        (c.phoneNumber || "").includes(term) ||
        (c.address || "").toLowerCase().includes(term)
      );
    });
  }, [contracts, filterPaymentStatus, filterProjectStatus, searchTerm]);

  // Quick Create from Estimate
  const handleSelectEstimateSource = (estId) => {
    if (!estId) return;
    const est = estimates.find((e) => e.id === Number(estId));
    if (!est) return;

    const totalVal = Math.round((est.estimatedPriceMin + est.estimatedPriceMax) / 2);
    setContractForm((prev) => ({
      ...prev,
      estimateId: est.id,
      customerName: est.customerName,
      phoneNumber: est.phoneNumber,
      email: est.email || "",
      projectName: `Thang máy ${est.customerName} - ${est.buildingType}`,
      address: est.address || "",
      elevatorType: est.elevatorType || "homelift-kinh",
      stops: est.stops || 4,
      capacityKg: est.capacityKg || 450,
      motorBrand: est.motorBrand || "Fuji",
      doorType: est.doorType || "CO",
      totalValue: totalVal,
      costEquipment: Math.round(totalVal * 0.55),
      costShipping: Math.round(totalVal * 0.03),
      costInstallation: Math.round(totalVal * 0.08),
      costOther: Math.round(totalVal * 0.04),
      adminNotes: `Nguồn từ dự toán #${est.id}. ${est.adminNotes || ""}`
    }));
  };

  // Submit Create or Edit Contract
  const handleSaveContract = async (e) => {
    e.preventDefault();
    if (!contractForm.customerName.trim() || !contractForm.phoneNumber.trim() || !contractForm.projectName.trim()) {
      onShowToast?.("Vui lòng điền họ tên khách, SĐT và tên công trình.", "warning");
      return;
    }

    setCreating(true);
    try {
      if (isEditing && editingId) {
        await apiClient.put(`/contracts/${editingId}`, {
          customerName: contractForm.customerName.trim(),
          phoneNumber: contractForm.phoneNumber.trim(),
          email: contractForm.email.trim() || null,
          projectName: contractForm.projectName.trim(),
          address: contractForm.address.trim() || null,
          elevatorType: contractForm.elevatorType,
          stops: Number(contractForm.stops),
          capacityKg: Number(contractForm.capacityKg),
          motorBrand: contractForm.motorBrand,
          doorType: contractForm.doorType,
          contractDate: contractForm.contractDate,
          expectedDeliveryDate: contractForm.expectedDeliveryDate || null,
          totalValue: Number(contractForm.totalValue),
          depositRate: Number(contractForm.depositRate),
          costEquipment: Number(contractForm.costEquipment),
          costShipping: Number(contractForm.costShipping),
          costInstallation: Number(contractForm.costInstallation),
          costOther: Number(contractForm.costOther),
          paymentStatus: contractForm.paymentStatus,
          projectStatus: contractForm.projectStatus,
          adminNotes: contractForm.adminNotes
        });
        onShowToast?.("Đã cập nhật thông tin hợp đồng thành công!", "success");
      } else {
        await apiClient.post("/contracts", {
          contractCode: contractForm.contractCode.trim(),
          customerName: contractForm.customerName.trim(),
          phoneNumber: contractForm.phoneNumber.trim(),
          email: contractForm.email.trim() || null,
          projectName: contractForm.projectName.trim(),
          address: contractForm.address.trim() || null,
          elevatorType: contractForm.elevatorType,
          stops: Number(contractForm.stops),
          capacityKg: Number(contractForm.capacityKg),
          motorBrand: contractForm.motorBrand,
          doorType: contractForm.doorType,
          contractDate: contractForm.contractDate,
          expectedDeliveryDate: contractForm.expectedDeliveryDate || null,
          totalValue: Number(contractForm.totalValue),
          depositRate: Number(contractForm.depositRate),
          initialDepositAmount: Number(contractForm.initialDepositAmount) || 0,
          costEquipment: Number(contractForm.costEquipment),
          costShipping: Number(contractForm.costShipping),
          costInstallation: Number(contractForm.costInstallation),
          costOther: Number(contractForm.costOther),
          paymentStatus: contractForm.paymentStatus,
          projectStatus: contractForm.projectStatus,
          estimateId: contractForm.estimateId,
          adminNotes: contractForm.adminNotes
        });
        onShowToast?.("Đã ký kết hợp đồng mới thành công!", "success");
      }

      setShowCreateModal(false);
      setIsEditing(false);
      setEditingId(null);
      setContractForm(getInitialContractForm());
      fetchData();
    } catch (err) {
      onShowToast?.(err?.response?.data?.message || "Không thể lưu hợp đồng.", "error");
    } finally {
      setCreating(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (contract) => {
    setIsEditing(true);
    setEditingId(contract.id);
    setContractForm({
      contractCode: contract.contractCode,
      customerName: contract.customerName,
      phoneNumber: contract.phoneNumber,
      email: contract.email || "",
      projectName: contract.projectName,
      address: contract.address || "",
      elevatorType: contract.elevatorType || "homelift-kinh",
      stops: contract.stops || 4,
      capacityKg: contract.capacityKg || 450,
      motorBrand: contract.motorBrand || "Fuji",
      doorType: contract.doorType || "CO",
      contractDate: contract.contractDate ? contract.contractDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
      expectedDeliveryDate: contract.expectedDeliveryDate ? contract.expectedDeliveryDate.slice(0, 10) : "",
      totalValue: contract.totalValue,
      depositRate: contract.depositRate,
      initialDepositAmount: 0,
      costEquipment: contract.costEquipment,
      costShipping: contract.costShipping,
      costInstallation: contract.costInstallation,
      costOther: contract.costOther,
      paymentStatus: contract.paymentStatus,
      projectStatus: contract.projectStatus,
      estimateId: contract.estimateId,
      adminNotes: contract.adminNotes || ""
    });
    setShowCreateModal(true);
  };

  // Delete Contract
  const handleDeleteContract = async (id, code) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hợp đồng "${code}" và tất cả dữ liệu thanh toán liên quan?`)) return;
    try {
      await apiClient.delete(`/contracts/${id}`);
      onShowToast?.(`Đã xóa hợp đồng ${code}.`, "info");
      fetchData();
    } catch {
      onShowToast?.("Không thể xóa hợp đồng.", "error");
    }
  };

  // Open Payment Modal
  const handleOpenPayment = (contract) => {
    setSelectedContractForPayment(contract);
    setPaymentForm({
      paymentDate: new Date().toISOString().slice(0, 10),
      amount: contract.remainingAmount > 0 ? contract.remainingAmount : 50000000,
      paymentMethod: "Chuyển khoản",
      stage: contract.totalPaid === 0 ? "Đặt cọc đợt 1 (50%)" : "Thanh toán đợt tiếp theo",
      receiptCode: `UNC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      note: ""
    });
    setShowPaymentModal(true);
  };

  // Submit Payment Record
  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      onShowToast?.("Vui lòng nhập số tiền thanh toán hợp lệ.", "warning");
      return;
    }

    setSubmittingPayment(true);
    try {
      await apiClient.post(`/contracts/${selectedContractForPayment.id}/payments`, {
        paymentDate: paymentForm.paymentDate,
        amount: Number(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        stage: paymentForm.stage,
        receiptCode: paymentForm.receiptCode,
        note: paymentForm.note
      });

      onShowToast?.("Đã ghi nhận thanh toán thành công! Dòng tiền và công nợ đã được cập nhật.", "success");
      setShowPaymentModal(false);
      fetchData();
    } catch {
      onShowToast?.("Không thể ghi nhận thanh toán.", "error");
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Delete a Payment
  const handleDeletePayment = async (contractId, paymentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đợt thanh toán này?")) return;
    try {
      const res = await apiClient.delete(`/contracts/${contractId}/payments/${paymentId}`);
      onShowToast?.("Đã xóa đợt thanh toán và tính toán lại công nợ.", "info");
      setSelectedContractForLedger(res.data);
      fetchData();
    } catch {
      onShowToast?.("Không thể xóa đợt thanh toán.", "error");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (contracts.length === 0) {
      onShowToast?.("Chưa có dữ liệu hợp đồng để xuất.", "warning");
      return;
    }

    const headers = [
      "Mã Hợp Đồng",
      "Khách Hàng",
      "Số Điện Thoại",
      "Email",
      "Tên Công Trình",
      "Loại Thang",
      "Tổng Giá Trị (VND)",
      "Tỷ Lệ Cọc (%)",
      "Tiền Đã Cọc (VND)",
      "Đã Thanh Toán Thêm (VND)",
      "Tổng Tiền Đã Thu (VND)",
      "Công Nợ Còn Lại (VND)",
      "CP Thiết Bị (VND)",
      "CP Vận Chuyển (VND)",
      "CP Lắp Đặt (VND)",
      "CP Khác (VND)",
      "Tổng Chi Phí (VND)",
      "Lợi Nhuận Dự Kiến (VND)",
      "Trạng Thái Thanh Toán",
      "Trạng Thái Tiến Độ",
      "Ngày Ký"
    ];

    const rows = contracts.map((c) => [
      `"${c.contractCode}"`,
      `"${(c.customerName || "").replace(/"/g, '""')}"`,
      `"${c.phoneNumber || ""}"`,
      `"${c.email || ""}"`,
      `"${(c.projectName || "").replace(/"/g, '""')}"`,
      `"${mapElevatorTypeName(c.elevatorType)}"`,
      c.totalValue,
      c.depositRate,
      c.depositAmount,
      c.additionalPaidAmount,
      c.totalPaid,
      c.remainingAmount,
      c.costEquipment,
      c.costShipping,
      c.costInstallation,
      c.costOther,
      c.totalCost,
      c.expectedProfit,
      `"${paymentStatusMap[c.paymentStatus]?.label || c.paymentStatus}"`,
      `"${projectStatusMap[c.projectStatus]?.label || c.projectStatus}"`,
      `"${new Date(c.contractDate).toLocaleDateString("vi-VN")}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Bao_Cao_Doanh_Thu_Hop_Dong_Ha_Hong_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast?.("Đã xuất báo cáo doanh thu & công nợ CSV thành công!", "success");
  };

  // Monthly Chart Calculations
  const monthlyData = stats?.monthlyStats || [];
  const maxMonthlyVal = useMemo(() => {
    if (!monthlyData.length) return 1000000000;
    return Math.max(
      ...monthlyData.map((m) =>
        Math.max(
          m.signedContractValue,
          m.actualCollectedCash,
          m.deploymentCost,
          m.expectedProfit,
          m.outstandingDebt
        )
      ),
      500000000
    );
  }, [monthlyData]);

  if (loading && !stats) {
    return (
      <div className="doanh-thu-admin">
        <div className="dt-loading-box">
          <div className="spinner-border text-primary" role="status"></div>
          <p style={{ fontWeight: 600, color: "#0B1F3A", marginTop: 12 }}>
            Đang tổng hợp dữ liệu doanh thu, dòng tiền & tiến độ hợp đồng...
          </p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="doanh-thu-admin">
        <div className="dt-error-box">
          <i className="bi bi-exclamation-octagon-fill text-danger fs-1"></i>
          <h4 style={{ marginTop: 12, color: "#991b1b" }}>Không Thể Kết Nối Báo Cáo Doanh Thu</h4>
          <p style={{ color: "#64748b" }}>{error}</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={fetchData}>
            <i className="bi bi-arrow-clockwise"></i> Thử Lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="doanh-thu-admin">
      {/* 1. EXECUTIVE COMMAND HEADER & ADVANCED TIME FILTERS */}
      <div className="dt-hero-header">
        <div className="dt-hero-info">
          <div className="dt-hero-badge">
            <i className="bi bi-shield-check"></i> Ban Giám Đốc • Điều Hành Dòng Tiền & Hợp Đồng
          </div>
          <h2 className="dt-hero-title">
            <i className="bi bi-bar-chart-fill" style={{ color: "#D9A441" }}></i>
            Quản Trị Doanh Thu & Tiến Độ Hợp Đồng
          </h2>
          <p className="dt-hero-subtitle">
            Hệ thống phân tách chuẩn hóa giữa <strong>Doanh số ký kết</strong>, <strong>Dòng tiền thực thu</strong>, <strong>Công nợ dự án</strong> và <strong>Chi phí triển khai</strong>.
          </p>
        </div>

        {/* Global Filter Bar */}
        <div className="dt-hero-actions">
          {/* Segmented Period Tabs */}
          <div className="dt-period-segmented">
            <button
              type="button"
              className={`dt-period-btn ${period === "all" ? "active" : ""}`}
              onClick={() => setPeriod("all")}
            >
              Toàn Bộ
            </button>
            <button
              type="button"
              className={`dt-period-btn ${period === "year" ? "active" : ""}`}
              onClick={() => setPeriod("year")}
            >
              Năm
            </button>
            <button
              type="button"
              className={`dt-period-btn ${period === "quarter" ? "active" : ""}`}
              onClick={() => setPeriod("quarter")}
            >
              Quý
            </button>
            <button
              type="button"
              className={`dt-period-btn ${period === "month" ? "active" : ""}`}
              onClick={() => setPeriod("month")}
            >
              Tháng
            </button>
            <button
              type="button"
              className={`dt-period-btn ${period === "custom" ? "active" : ""}`}
              onClick={() => setPeriod("custom")}
            >
              Tùy Chọn
            </button>
          </div>

          {/* Sub Controls for Year/Quarter/Month/Custom */}
          {period === "year" && (
            <select
              className="form-select form-select-sm dt-subfilter-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {[2026, 2025, 2024].map((y) => (
                <option key={y} value={y}>Năm {y}</option>
              ))}
            </select>
          )}

          {period === "quarter" && (
            <div className="d-flex gap-2">
              <select
                className="form-select form-select-sm dt-subfilter-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {[2026, 2025].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <select
                className="form-select form-select-sm dt-subfilter-select"
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(Number(e.target.value))}
              >
                {[1, 2, 3, 4].map((q) => (
                  <option key={q} value={q}>Quý {q}</option>
                ))}
              </select>
            </div>
          )}

          {period === "month" && (
            <div className="d-flex gap-2">
              <select
                className="form-select form-select-sm dt-subfilter-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {[2026, 2025].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <select
                className="form-select form-select-sm dt-subfilter-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>Tháng {m}</option>
                ))}
              </select>
            </div>
          )}

          {period === "custom" && (
            <div className="d-flex gap-1 align-items-center">
              <input
                type="date"
                className="form-control form-control-sm"
                value={customFromDate}
                onChange={(e) => setCustomFromDate(e.target.value)}
              />
              <span className="text-muted small">→</span>
              <input
                type="date"
                className="form-control form-control-sm"
                value={customToDate}
                onChange={(e) => setCustomToDate(e.target.value)}
              />
            </div>
          )}

          {/* Action Buttons */}
          <button
            type="button"
            className="dt-action-btn dt-action-btn-primary"
            onClick={() => {
              setIsEditing(false);
              setEditingId(null);
              setContractForm(getInitialContractForm());
              setShowCreateModal(true);
            }}
          >
            <i className="bi bi-file-earmark-plus"></i> Ký Hợp Đồng Mới
          </button>

          <button type="button" className="dt-action-btn" onClick={handleExportCSV} title="Xuất file CSV báo cáo">
            <i className="bi bi-download"></i> Xuất CSV
          </button>

          <button type="button" className="dt-action-btn" onClick={fetchData} title="Làm mới dữ liệu">
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>

      {/* 2. THE 5 CORE METRIC KPI CARDS */}
      <div className="dt-metrics-grid">
        {/* Card 1: Tổng giá trị hợp đồng */}
        <div className="dt-metric-card card-navy" title={formatVND(stats?.totalContractValue)}>
          <div className="dt-metric-top">
            <div className="dt-metric-icon-wrap icon-navy">
              <i className="bi bi-file-earmark-check-fill"></i>
            </div>
            <span className="dt-metric-badge badge-navy">
              <i className="bi bi-pen"></i> Đã Ký Kết
            </span>
          </div>
          <div className="dt-metric-body">
            <span className="dt-metric-label">Tổng Giá Trị Hợp Đồng</span>
            <strong className="dt-metric-value" style={{ color: "#1e40af" }}>
              {formatShortVND(stats?.totalContractValue)}
            </strong>
            <p className="dt-metric-subtext">
              <i className="bi bi-check-circle-fill text-primary"></i> Tổng giá trị các hợp đồng mua bán & lắp đặt ({stats?.totalContractsCount || 0} HĐ)
            </p>
          </div>
        </div>

        {/* Card 2: Tiền thực tế đã thu */}
        <div className="dt-metric-card card-emerald" title={formatVND(stats?.totalPaid)}>
          <div className="dt-metric-top">
            <div className="dt-metric-icon-wrap icon-emerald">
              <i className="bi bi-cash-coin"></i>
            </div>
            <span className="dt-metric-badge badge-emerald">
              <i className="bi bi-wallet2"></i> Dòng Tiền Thực
            </span>
          </div>
          <div className="dt-metric-body">
            <span className="dt-metric-label">Tiền Thực Tế Đã Thu</span>
            <strong className="dt-metric-value" style={{ color: "#059669" }}>
              {formatShortVND(stats?.totalPaid)}
            </strong>
            <p className="dt-metric-subtext">
              <i className="bi bi-arrow-down-left-circle-fill text-success"></i> Số tiền thực tế khách hàng đã thanh toán qua cọc & các đợt
            </p>
          </div>
        </div>

        {/* Card 3: Công nợ phải thu */}
        <div className="dt-metric-card card-amber" title={formatVND(stats?.remainingDebt)}>
          <div className="dt-metric-top">
            <div className="dt-metric-icon-wrap icon-amber">
              <i className="bi bi-hourglass-split"></i>
            </div>
            <span className="dt-metric-badge badge-amber">
              <i className="bi bi-clock-history"></i> Phải Thu
            </span>
          </div>
          <div className="dt-metric-body">
            <span className="dt-metric-label">Công Nợ Phải Thu</span>
            <strong className="dt-metric-value" style={{ color: "#d97706" }}>
              {formatShortVND(stats?.remainingDebt)}
            </strong>
            <p className="dt-metric-subtext">
              <i className="bi bi-exclamation-circle-fill text-warning"></i> Tiền khách còn nợ, sẽ thu theo tiến độ nhập hàng & nghiệm thu
            </p>
          </div>
        </div>

        {/* Card 4: Chi phí triển khai */}
        <div className="dt-metric-card card-rose" title={formatVND(stats?.totalDeploymentCost)}>
          <div className="dt-metric-top">
            <div className="dt-metric-icon-wrap icon-rose">
              <i className="bi bi-tools"></i>
            </div>
            <span className="dt-metric-badge badge-rose">
              <i className="bi bi-truck"></i> Giá Vốn & Thi Công
            </span>
          </div>
          <div className="dt-metric-body">
            <span className="dt-metric-label">Chi Phí Triển Khai</span>
            <strong className="dt-metric-value" style={{ color: "#dc2626" }}>
              {formatShortVND(stats?.totalDeploymentCost)}
            </strong>
            <p className="dt-metric-subtext">
              <i className="bi bi-box-seam text-danger"></i> Chi phí nhập thiết bị, vận chuyển, cẩu kéo & nhân công lắp đặt
            </p>
          </div>
        </div>

        {/* Card 5: Lợi nhuận dự kiến */}
        <div className="dt-metric-card card-teal" title={formatVND(stats?.expectedProfit)}>
          <div className="dt-metric-top">
            <div className="dt-metric-icon-wrap icon-teal">
              <i className="bi bi-graph-up-arrow"></i>
            </div>
            <span className="dt-metric-badge badge-teal">
              <i className="bi bi-trophy-fill"></i> Biên Lợi Nhuận
            </span>
          </div>
          <div className="dt-metric-body">
            <span className="dt-metric-label">Lợi Nhuận Dự Kiến</span>
            <strong className="dt-metric-value" style={{ color: "#0d9488" }}>
              {formatShortVND(stats?.expectedProfit)}
            </strong>
            <p className="dt-metric-subtext">
              <i className="bi bi-stars text-teal"></i> Giá trị HĐ trừ tổng chi phí ({stats?.totalContractValue > 0 ? ((stats.expectedProfit / stats.totalContractValue) * 100).toFixed(1) : 0}% doanh thu)
            </p>
          </div>
        </div>
      </div>

      {/* 3. CHARTS SECTION & SALES FUNNEL */}
      <div className="dt-charts-grid">
        {/* Left: Monthly Financial Analytics Multi-Chart */}
        <div className="dt-chart-card">
          <div className="dt-chart-card-header">
            <div className="dt-chart-title-group">
              <h3>
                <i className="bi bi-bar-chart-line-fill" style={{ color: "#D9A441" }}></i>
                Biểu Đồ Tài Chính & Dòng Tiền Theo Tháng
              </h3>
              <p>Phân tích đa chiều: Giá trị HĐ đã ký, Tiền thực tế đã thu, Chi phí và Lợi nhuận</p>
            </div>

            {/* Metric Mode Toggle */}
            <div className="dt-chart-toggle-group">
              <button
                type="button"
                className={`dt-chart-toggle-pill ${chartMetricMode === "cash_vs_contract" ? "active" : ""}`}
                onClick={() => setChartMetricMode("cash_vs_contract")}
              >
                Hợp Đồng vs Thực Thu
              </button>
              <button
                type="button"
                className={`dt-chart-toggle-pill ${chartMetricMode === "cost_vs_profit" ? "active" : ""}`}
                onClick={() => setChartMetricMode("cost_vs_profit")}
              >
                Chi Phí vs Lợi Nhuận
              </button>
              <button
                type="button"
                className={`dt-chart-toggle-pill ${chartMetricMode === "receivables" ? "active" : ""}`}
                onClick={() => setChartMetricMode("receivables")}
              >
                Công Nợ Phải Thu
              </button>
              <button
                type="button"
                className={`dt-chart-toggle-pill ${chartMetricMode === "all" ? "active" : ""}`}
                onClick={() => setChartMetricMode("all")}
              >
                Tất Cả
              </button>
            </div>
          </div>

          {/* Interactive Legend */}
          <div className="dt-chart-legend px-3 pt-2">
            {(chartMetricMode === "cash_vs_contract" || chartMetricMode === "all") && (
              <>
                <div className="dt-legend-item">
                  <span className="dt-legend-dot" style={{ background: "#2563eb" }}></span>
                  <span>HĐ Ký Mới</span>
                </div>
                <div className="dt-legend-item">
                  <span className="dt-legend-dot" style={{ background: "#16a34a" }}></span>
                  <span>Tiền Thực Thu</span>
                </div>
              </>
            )}

            {(chartMetricMode === "cost_vs_profit" || chartMetricMode === "all") && (
              <>
                <div className="dt-legend-item">
                  <span className="dt-legend-dot" style={{ background: "#dc2626" }}></span>
                  <span>Chi Phí Triển Khai</span>
                </div>
                <div className="dt-legend-item">
                  <span className="dt-legend-dot" style={{ background: "#0d9488" }}></span>
                  <span>Lợi Nhuận Dự Kiến</span>
                </div>
              </>
            )}

            {(chartMetricMode === "receivables" || chartMetricMode === "all") && (
              <div className="dt-legend-item">
                <span className="dt-legend-dot" style={{ background: "#d97706" }}></span>
                <span>Công Nợ Chưa Thu</span>
              </div>
            )}
          </div>

          {/* SVG Multi-Bar & Line Chart */}
          <div className="dt-svg-chart-wrap">
            <svg viewBox="0 0 620 250" className="dt-svg-chart" preserveAspectRatio="none">
              <defs>
                <linearGradient id="blueBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id="greenBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="redBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
                <linearGradient id="tealBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
                <linearGradient id="amberBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="50" y1="35" x2="600" y2="35" className="dt-grid-line" />
              <line x1="50" y1="85" x2="600" y2="85" className="dt-grid-line" />
              <line x1="50" y1="135" x2="600" y2="135" className="dt-grid-line" />
              <line x1="50" y1="185" x2="600" y2="185" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Y-axis Labels */}
              <text x="42" y="39" textAnchor="end" className="dt-axis-text">{formatShortVND(maxMonthlyVal)}</text>
              <text x="42" y="89" textAnchor="end" className="dt-axis-text">{formatShortVND(maxMonthlyVal * 0.66)}</text>
              <text x="42" y="139" textAnchor="end" className="dt-axis-text">{formatShortVND(maxMonthlyVal * 0.33)}</text>
              <text x="42" y="189" textAnchor="end" className="dt-axis-text">0</text>

              {/* Month Bars */}
              {monthlyData.map((m, idx) => {
                const totalMonths = monthlyData.length || 12;
                const colWidth = (550) / totalMonths;
                const colX = 50 + idx * colWidth;
                const barW = Math.min(colWidth / 3 - 2, 12);
                const isHovered = hoveredMonthIdx === idx;

                const calcHeight = (val) => Math.max((val / maxMonthlyVal) * 150, val > 0 ? 6 : 0);

                const signedH = calcHeight(m.signedContractValue);
                const paidH = calcHeight(m.actualCollectedCash);
                const costH = calcHeight(m.deploymentCost);
                const profitH = calcHeight(m.expectedProfit);
                const debtH = calcHeight(m.outstandingDebt);

                return (
                  <g
                    key={m.month}
                    onMouseEnter={() => setHoveredMonthIdx(idx)}
                    onMouseLeave={() => setHoveredMonthIdx(null)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Hover highlight column */}
                    {isHovered && (
                      <rect
                        x={colX}
                        y="20"
                        width={colWidth}
                        height="170"
                        fill="rgba(11, 31, 58, 0.04)"
                        rx="4"
                      />
                    )}

                    {/* Mode 1: Cash vs Contract */}
                    {chartMetricMode === "cash_vs_contract" && (
                      <>
                        <rect
                          x={colX + colWidth / 2 - barW - 2}
                          y={185 - signedH}
                          width={barW}
                          height={signedH}
                          rx="3"
                          fill="url(#blueBarGrad)"
                        />
                        <rect
                          x={colX + colWidth / 2 + 2}
                          y={185 - paidH}
                          width={barW}
                          height={paidH}
                          rx="3"
                          fill="url(#greenBarGrad)"
                        />
                      </>
                    )}

                    {/* Mode 2: Cost vs Profit */}
                    {chartMetricMode === "cost_vs_profit" && (
                      <>
                        <rect
                          x={colX + colWidth / 2 - barW - 2}
                          y={185 - costH}
                          width={barW}
                          height={costH}
                          rx="3"
                          fill="url(#redBarGrad)"
                        />
                        <rect
                          x={colX + colWidth / 2 + 2}
                          y={185 - profitH}
                          width={barW}
                          height={profitH}
                          rx="3"
                          fill="url(#tealBarGrad)"
                        />
                      </>
                    )}

                    {/* Mode 3: Receivables */}
                    {chartMetricMode === "receivables" && (
                      <rect
                        x={colX + colWidth / 2 - barW}
                        y={185 - debtH}
                        width={barW * 2}
                        height={debtH}
                        rx="3"
                        fill="url(#amberBarGrad)"
                      />
                    )}

                    {/* Mode 4: All */}
                    {chartMetricMode === "all" && (
                      <>
                        <rect x={colX + 2} y={185 - signedH} width={7} height={signedH} rx="2" fill="url(#blueBarGrad)" />
                        <rect x={colX + 11} y={185 - paidH} width={7} height={paidH} rx="2" fill="url(#greenBarGrad)" />
                        <rect x={colX + 20} y={185 - costH} width={7} height={costH} rx="2" fill="url(#redBarGrad)" />
                        <rect x={colX + 29} y={185 - profitH} width={7} height={profitH} rx="2" fill="url(#tealBarGrad)" />
                        <rect x={colX + 38} y={185 - debtH} width={7} height={debtH} rx="2" fill="url(#amberBarGrad)" />
                      </>
                    )}

                    {/* Month Label */}
                    <text
                      x={colX + colWidth / 2}
                      y="210"
                      textAnchor="middle"
                      className="dt-axis-text"
                      fill={isHovered ? "#0B1F3A" : "#64748b"}
                      fontWeight={isHovered ? "700" : "500"}
                    >
                      {m.label}
                    </text>

                    {/* Tooltip on Hover */}
                    {isHovered && (
                      <g>
                        <rect
                          x={Math.min(Math.max(colX - 80, 50), 450)}
                          y="10"
                          width="160"
                          height="95"
                          rx="8"
                          fill="#0B1F3A"
                          opacity="0.95"
                          stroke="#e2e8f0"
                          strokeWidth="1"
                        />
                        <text x={Math.min(Math.max(colX - 80, 50) + 80, 530)} y="28" textAnchor="middle" fill="#D9A441" fontWeight="700" fontSize="11">
                          {m.month} • {m.signedCount} Hợp Đồng
                        </text>
                        <text x={Math.min(Math.max(colX - 80, 50) + 10, 460)} y="45" fill="#ffffff" fontSize="9.5">
                          Ký Mới: {formatShortVND(m.signedContractValue)}
                        </text>
                        <text x={Math.min(Math.max(colX - 80, 50) + 10, 460)} y="60" fill="#4ade80" fontSize="9.5">
                          Thực Thu: {formatShortVND(m.actualCollectedCash)}
                        </text>
                        <text x={Math.min(Math.max(colX - 80, 50) + 10, 460)} y="75" fill="#fca5a5" fontSize="9.5">
                          Chi Phí: {formatShortVND(m.deploymentCost)}
                        </text>
                        <text x={Math.min(Math.max(colX - 80, 50) + 10, 460)} y="90" fill="#fbbf24" fontSize="9.5">
                          Công Nợ: {formatShortVND(m.outstandingDebt)}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right: Sales & Delivery Conversion Funnel (Phễu Chuyển Đổi 8 Bước) */}
        <div className="dt-donut-card">
          <div className="dt-donut-header">
            <h3>
              <i className="bi bi-funnel-fill" style={{ color: "#2563eb" }}></i>
              Phễu Chuyển Đổi Kinh Doanh Thang Máy
            </h3>
            <p>Hành trình 8 bước từ liên hệ ban đầu đến tất toán & bảo hành 24 tháng</p>
          </div>

          <div className="dt-funnel-container">
            {stats?.funnelSteps?.map((s) => (
              <div key={s.step} className="dt-funnel-row">
                <div className="dt-funnel-step-badge">{s.step}</div>
                <div className="dt-funnel-info">
                  <div className="dt-funnel-info-top">
                    <span className="dt-funnel-name">{s.name}</span>
                    <strong className="dt-funnel-count">{s.count}</strong>
                  </div>
                  <div className="dt-funnel-bar-bg">
                    <div
                      className="dt-funnel-bar-fill"
                      style={{
                        width: `${Math.max(s.percentage, 8)}%`,
                        background: getFunnelGradient(s.step)
                      }}
                    ></div>
                  </div>
                  <span className="dt-funnel-desc">{s.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. STATUS DISTRIBUTIONS SUMMARY (Project & Payment) */}
      <div className="row g-3">
        {/* Project Status Breakdown */}
        <div className="col-lg-6">
          <div className="dt-status-panel">
            <h4 className="dt-status-panel-title">
              <i className="bi bi-diagram-3-fill text-primary"></i> Phân Bổ Tiến Độ Công Trình (8 Giai Đoạn)
            </h4>
            <div className="dt-status-tags-grid">
              {stats?.projectStatusDistribution?.map((item) => (
                <div
                  key={item.key}
                  className={`dt-status-tag-card ${filterProjectStatus === item.key ? "active" : ""}`}
                  onClick={() => setFilterProjectStatus(filterProjectStatus === item.key ? "all" : item.key)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="dt-status-tag-name">{item.label}</span>
                    <span className="badge bg-light text-dark rounded-pill">{item.count}</span>
                  </div>
                  <div className="dt-status-tag-val">{formatShortVND(item.totalAmount)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Status Breakdown */}
        <div className="col-lg-6">
          <div className="dt-status-panel">
            <h4 className="dt-status-panel-title">
              <i className="bi bi-credit-card-2-front-fill text-success"></i> Phân Bổ Trạng Thái Thanh Toán
            </h4>
            <div className="dt-status-tags-grid">
              {stats?.paymentStatusDistribution?.map((item) => (
                <div
                  key={item.key}
                  className={`dt-status-tag-card ${filterPaymentStatus === item.key ? "active" : ""}`}
                  onClick={() => setFilterPaymentStatus(filterPaymentStatus === item.key ? "all" : item.key)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="dt-status-tag-name">{item.label}</span>
                    <span className="badge bg-light text-dark rounded-pill">{item.count}</span>
                  </div>
                  <div className="dt-status-tag-val">{formatShortVND(item.totalAmount)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. CONTRACTS & PAYMENT PROGRESS TABLE */}
      <div className="dt-table-container">
        <div className="dt-table-header">
          <div className="dt-table-title-group">
            <h3>
              <i className="bi bi-card-checklist" style={{ color: "#D9A441" }}></i>
              Quản Lý Hợp Đồng & Tiến Độ Thanh Toán Chi Tiết
            </h3>
            <p>
              Hiển thị {filteredContracts.length} / {contracts.length} hợp đồng • Theo dõi độc lập giữa tiến độ thi công và dòng tiền
            </p>
          </div>

          <div className="dt-table-filters">
            {/* Search Input */}
            <div className="dt-search-input-wrap">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Tìm mã HĐ, tên khách, công trình..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button type="button" className="dt-search-clear" onClick={() => setSearchTerm("")}>
                  ×
                </button>
              )}
            </div>

            {/* Filter Payment Status */}
            <select
              className="form-select form-select-sm dt-table-select"
              value={filterPaymentStatus}
              onChange={(e) => setFilterPaymentStatus(e.target.value)}
            >
              <option value="all">Tất Cả TT Thanh Toán</option>
              {Object.entries(paymentStatusMap).map(([key, info]) => (
                <option key={key} value={key}>{info.label}</option>
              ))}
            </select>

            {/* Filter Project Status */}
            <select
              className="form-select form-select-sm dt-table-select"
              value={filterProjectStatus}
              onChange={(e) => setFilterProjectStatus(e.target.value)}
            >
              <option value="all">Tất Cả Tiến Độ Thi Công</option>
              {Object.entries(projectStatusMap).map(([key, info]) => (
                <option key={key} value={key}>{info.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="table-responsive">
          <table className="table dt-table mb-0">
            <thead>
              <tr>
                <th>Mã HĐ & Công Trình</th>
                <th>Khách Hàng</th>
                <th>Giá Trị HĐ</th>
                <th>Đã Cọc (50%)</th>
                <th>Đã Đóng Thêm</th>
                <th>Tổng Thực Thu</th>
                <th>Công Nợ Còn</th>
                <th>Tổng Chi Phí</th>
                <th>Lợi Nhuận</th>
                <th>TT Thanh Toán</th>
                <th>Tiến Độ Thi Công</th>
                <th className="text-end">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                    Không có hợp đồng nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredContracts.map((c) => {
                  const payInfo = paymentStatusMap[c.paymentStatus] || { label: c.paymentStatus, color: "#64748b", bg: "#f1f5f9" };
                  const projInfo = projectStatusMap[c.projectStatus] || { label: c.projectStatus, color: "#64748b", bg: "#f1f5f9" };

                  return (
                    <tr key={c.id}>
                      {/* Code & Project */}
                      <td>
                        <div className="dt-cell-strong text-primary">{c.contractCode}</div>
                        <div className="dt-cell-subtext" title={c.projectName}>{c.projectName}</div>
                        <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                          {new Date(c.contractDate).toLocaleDateString("vi-VN")}
                        </small>
                      </td>

                      {/* Customer */}
                      <td>
                        <div className="dt-cell-strong">{c.customerName}</div>
                        <a href={`tel:${c.phoneNumber}`} className="dt-cell-phone">
                          <i className="bi bi-telephone-fill"></i> {c.phoneNumber}
                        </a>
                      </td>

                      {/* Contract Value */}
                      <td>
                        <div className="dt-cell-val font-weight-bold" style={{ color: "#0B1F3A" }}>
                          {formatVND(c.totalValue)}
                        </div>
                        <small className="text-muted">Cọc {c.depositRate}%</small>
                      </td>

                      {/* Deposit Paid */}
                      <td>
                        <span className="text-primary font-weight-semibold">
                          {formatVND(c.depositAmount)}
                        </span>
                      </td>

                      {/* Additional Paid */}
                      <td>
                        <span className="text-muted">
                          {formatVND(c.additionalPaidAmount)}
                        </span>
                      </td>

                      {/* Total Paid */}
                      <td>
                        <strong className="text-success">
                          {formatVND(c.totalPaid)}
                        </strong>
                      </td>

                      {/* Remaining Debt */}
                      <td>
                        <strong style={{ color: c.remainingAmount > 0 ? "#d97706" : "#16a34a" }}>
                          {c.remainingAmount > 0 ? formatVND(c.remainingAmount) : "Đã thu đủ ✓"}
                        </strong>
                      </td>

                      {/* Deployment Cost */}
                      <td>
                        <span className="text-danger">
                          {formatVND(c.totalCost)}
                        </span>
                        <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                          Thiết bị: {formatShortVND(c.costEquipment)}
                        </div>
                      </td>

                      {/* Expected Profit */}
                      <td>
                        <strong className="text-teal" style={{ color: "#0d9488" }}>
                          {formatVND(c.expectedProfit)}
                        </strong>
                      </td>

                      {/* Payment Status Badge */}
                      <td>
                        <span
                          className="dt-badge-pill"
                          style={{ color: payInfo.color, background: payInfo.bg, border: `1px solid ${payInfo.color}30` }}
                        >
                          <i className={`bi ${payInfo.icon || "bi-circle"}`}></i> {payInfo.label}
                        </span>
                      </td>

                      {/* Project Progress Badge */}
                      <td>
                        <span
                          className="dt-badge-pill"
                          style={{ color: projInfo.color, background: projInfo.bg, border: `1px solid ${projInfo.color}30` }}
                        >
                          {projInfo.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="text-end">
                        <div className="d-flex gap-1 justify-content-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success"
                            title="Ghi nhận thanh toán mới"
                            onClick={() => handleOpenPayment(c)}
                          >
                            <i className="bi bi-cash-stack"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-info"
                            title="Xem lịch sử thanh toán & chi phí"
                            onClick={() => {
                              setSelectedContractForLedger(c);
                              setShowLedgerModal(true);
                            }}
                          >
                            <i className="bi bi-receipt"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            title="Chỉnh sửa hợp đồng"
                            onClick={() => handleOpenEdit(c)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            title="Xóa hợp đồng"
                            onClick={() => handleDeleteContract(c.id, c.contractCode)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL 1: CREATE / EDIT CONTRACT ================= */}
      {showCreateModal && (
        <div className="dt-modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="dt-modal-dialog dt-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="dt-modal-header">
              <h5 className="dt-modal-title">
                <i className="bi bi-file-earmark-ruled-fill text-primary me-2"></i>
                {isEditing ? `Chỉnh Sửa Hợp Đồng: ${contractForm.contractCode}` : "Tạo Hợp Đồng Mua Bán & Lắp Đặt Thang Máy"}
              </h5>
              <button type="button" className="dt-modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            <form onSubmit={handleSaveContract}>
              <div className="dt-modal-body">
                {/* Source Selection if New */}
                {!isEditing && estimates.length > 0 && (
                  <div className="dt-form-alert mb-3">
                    <label className="form-label font-weight-bold text-primary mb-1">
                      <i className="bi bi-magic me-1"></i> Chuyển Đổi Nhanh Từ Báo Giá / Dự Toán Khách Hàng (Tùy Chọn):
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={contractForm.estimateId || ""}
                      onChange={(e) => handleSelectEstimateSource(e.target.value)}
                    >
                      <option value="">-- Tạo hợp đồng mới thủ công --</option>
                      {estimates.map((est) => (
                        <option key={est.id} value={est.id}>
                          #{est.id} - {est.customerName} ({est.phoneNumber}) • {est.buildingType} • {formatShortVND((est.estimatedPriceMin + est.estimatedPriceMax) / 2)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Section 1: Customer & Project Information */}
                <h6 className="dt-form-section-title">
                  <i className="bi bi-person-badge text-primary"></i> 1. Thông Tin Khách Hàng & Công Trình
                </h6>
                <div className="row g-2 mb-3">
                  <div className="col-md-4">
                    <label className="form-label">Mã Hợp Đồng *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      required
                      placeholder="VD: HD-HH-2026-007"
                      value={contractForm.contractCode}
                      onChange={(e) => setContractForm({ ...contractForm, contractCode: e.target.value })}
                      disabled={isEditing}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Họ & Tên Khách Hàng *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      required
                      placeholder="VD: Nguyễn Văn A"
                      value={contractForm.customerName}
                      onChange={(e) => setContractForm({ ...contractForm, customerName: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Số Điện Thoại *</label>
                    <input
                      type="tel"
                      className="form-control form-control-sm"
                      required
                      placeholder="VD: 0908123456"
                      value={contractForm.phoneNumber}
                      onChange={(e) => setContractForm({ ...contractForm, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Tên Công Trình *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      required
                      placeholder="VD: Biệt Thự Thảo Điền - TP. Thủ Đức"
                      value={contractForm.projectName}
                      onChange={(e) => setContractForm({ ...contractForm, projectName: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Địa Chỉ Lắp Đặt</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="VD: 123 Nguyễn Văn Hưởng, P. Thảo Điền..."
                      value={contractForm.address}
                      onChange={(e) => setContractForm({ ...contractForm, address: e.target.value })}
                    />
                  </div>
                </div>

                {/* Section 2: Elevator Specifications */}
                <h6 className="dt-form-section-title">
                  <i className="bi bi-gear-wide-connected text-primary"></i> 2. Thông Số Kỹ Thuật Thang Máy
                </h6>
                <div className="row g-2 mb-3">
                  <div className="col-md-3">
                    <label className="form-label">Loại Thang</label>
                    <select
                      className="form-select form-select-sm"
                      value={contractForm.elevatorType}
                      onChange={(e) => setContractForm({ ...contractForm, elevatorType: e.target.value })}
                    >
                      <option value="homelift-kinh">Homelift Kính Panorama</option>
                      <option value="inox-guong-vang">Inox Gương Vàng Luxury</option>
                      <option value="inox-tieu-chuan">Inox 304 Tiêu Chuẩn</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Động Cơ (Motor)</label>
                    <select
                      className="form-select form-select-sm"
                      value={contractForm.motorBrand}
                      onChange={(e) => setContractForm({ ...contractForm, motorBrand: e.target.value })}
                    >
                      <option value="Fuji">Fuji (Nhật Bản / Malaysia)</option>
                      <option value="Mitsubishi">Mitsubishi (Thái Lan)</option>
                      <option value="Montanari">Montanari (Ý)</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Tải Trọng (kg)</label>
                    <select
                      className="form-select form-select-sm"
                      value={contractForm.capacityKg}
                      onChange={(e) => setContractForm({ ...contractForm, capacityKg: Number(e.target.value) })}
                    >
                      <option value="300">300 kg (4 người)</option>
                      <option value="350">350 kg (5 người)</option>
                      <option value="450">450 kg (6 người)</option>
                      <option value="630">630 kg (8 người)</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Số Điểm Dừng (Stops)</label>
                    <input
                      type="number"
                      min="2"
                      max="15"
                      className="form-control form-control-sm"
                      value={contractForm.stops}
                      onChange={(e) => setContractForm({ ...contractForm, stops: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Section 3: Financials, Pricing & Costs */}
                <h6 className="dt-form-section-title">
                  <i className="bi bi-cash-stack text-success"></i> 3. Giá Trị Hợp Đồng, Tỷ Lệ Cọc & Chi Phí Triển Khai
                </h6>
                <div className="row g-2 mb-3">
                  <div className="col-md-4">
                    <label className="form-label">Tổng Giá Trị HĐ (VNĐ) *</label>
                    <input
                      type="number"
                      step="1000000"
                      className="form-control form-control-sm font-weight-bold text-primary"
                      required
                      value={contractForm.totalValue}
                      onChange={(e) => setContractForm({ ...contractForm, totalValue: Number(e.target.value) })}
                    />
                    <small className="text-muted">{formatVND(contractForm.totalValue)}</small>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Tỷ Lệ Đặt Cọc Đợt 1 (%)</label>
                    <input
                      type="number"
                      min="10"
                      max="100"
                      className="form-control form-control-sm"
                      value={contractForm.depositRate}
                      onChange={(e) => setContractForm({ ...contractForm, depositRate: Number(e.target.value) })}
                    />
                    <small className="text-muted">Tiền cọc yêu cầu: {formatVND(contractForm.totalValue * (contractForm.depositRate / 100))}</small>
                  </div>

                  {!isEditing && (
                    <div className="col-md-4">
                      <label className="form-label">Thu Ngay Tiền Cọc Đợt 1 (VNĐ)</label>
                      <input
                        type="number"
                        step="1000000"
                        className="form-control form-control-sm"
                        placeholder="0 nếu chưa thu"
                        value={contractForm.initialDepositAmount}
                        onChange={(e) => setContractForm({ ...contractForm, initialDepositAmount: Number(e.target.value) })}
                      />
                    </div>
                  )}

                  {/* 4 Cost Breakdown Elements */}
                  <div className="col-md-3">
                    <label className="form-label">1. CP Nhập Thiết Bị (VNĐ)</label>
                    <input
                      type="number"
                      step="1000000"
                      className="form-control form-control-sm"
                      value={contractForm.costEquipment}
                      onChange={(e) => setContractForm({ ...contractForm, costEquipment: Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">2. CP Vận Chuyển / Cẩu</label>
                    <input
                      type="number"
                      step="1000000"
                      className="form-control form-control-sm"
                      value={contractForm.costShipping}
                      onChange={(e) => setContractForm({ ...contractForm, costShipping: Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">3. CP Lắp Đặt & Cơ Khí</label>
                    <input
                      type="number"
                      step="1000000"
                      className="form-control form-control-sm"
                      value={contractForm.costInstallation}
                      onChange={(e) => setContractForm({ ...contractForm, costInstallation: Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">4. CP Phát Sinh / Phụ Trợ</label>
                    <input
                      type="number"
                      step="1000000"
                      className="form-control form-control-sm"
                      value={contractForm.costOther}
                      onChange={(e) => setContractForm({ ...contractForm, costOther: Number(e.target.value) })}
                    />
                  </div>

                  {/* Profit Real-time Preview Banner */}
                  <div className="col-12 mt-2">
                    {(() => {
                      const totalC = (Number(contractForm.costEquipment) || 0) + (Number(contractForm.costShipping) || 0) + (Number(contractForm.costInstallation) || 0) + (Number(contractForm.costOther) || 0);
                      const profit = (Number(contractForm.totalValue) || 0) - totalC;
                      const margin = contractForm.totalValue > 0 ? ((profit / contractForm.totalValue) * 100).toFixed(1) : 0;
                      return (
                        <div className="dt-profit-preview-banner">
                          <span>Tổng Chi Phí Dự Kiến: <strong>{formatVND(totalC)}</strong></span>
                          <span>•</span>
                          <span>Lợi Nhuận Dự Kiến: <strong style={{ color: "#0d9488" }}>{formatVND(profit)}</strong> ({margin}%)</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Section 4: Progress & Payment Status */}
                <h6 className="dt-form-section-title">
                  <i className="bi bi-clock-history text-primary"></i> 4. Trạng Thái Hợp Đồng & Thanh Toán
                </h6>
                <div className="row g-2 mb-2">
                  <div className="col-md-6">
                    <label className="form-label">Trạng Thái Tiến Độ Thi Công</label>
                    <select
                      className="form-select form-select-sm"
                      value={contractForm.projectStatus}
                      onChange={(e) => setContractForm({ ...contractForm, projectStatus: e.target.value })}
                    >
                      {Object.entries(projectStatusMap).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Trạng Thái Thanh Toán</label>
                    <select
                      className="form-select form-select-sm"
                      value={contractForm.paymentStatus}
                      onChange={(e) => setContractForm({ ...contractForm, paymentStatus: e.target.value })}
                    >
                      {Object.entries(paymentStatusMap).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Ghi Chú Hợp Đồng / Ban Quản Lý</label>
                    <textarea
                      rows="2"
                      className="form-control form-control-sm"
                      placeholder="Chi tiết thỏa thuận thanh toán, tiến độ giao hàng, bảo hành..."
                      value={contractForm.adminNotes}
                      onChange={(e) => setContractForm({ ...contractForm, adminNotes: e.target.value })}
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="dt-modal-footer">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowCreateModal(false)}>
                  Đóng
                </button>
                <button type="submit" className="btn btn-sm btn-primary" disabled={creating}>
                  {creating ? "Đang xử lý..." : isEditing ? "Cập Nhật Hợp Đồng" : "Lưu & Ký Kết Hợp Đồng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: RECORD PAYMENT (NHIỀU ĐỢT) ================= */}
      {showPaymentModal && selectedContractForPayment && (
        <div className="dt-modal-backdrop" onClick={() => setShowPaymentModal(false)}>
          <div className="dt-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dt-modal-header">
              <h5 className="dt-modal-title">
                <i className="bi bi-cash-stack text-success me-2"></i>
                Ghi Nhận Thanh Toán: {selectedContractForPayment.contractCode}
              </h5>
              <button type="button" className="dt-modal-close" onClick={() => setShowPaymentModal(false)}>×</button>
            </div>

            <form onSubmit={handleSavePayment}>
              <div className="dt-modal-body">
                {/* Contract Financial Snapshot */}
                <div className="dt-payment-summary-box mb-3">
                  <div><strong>Khách hàng:</strong> {selectedContractForPayment.customerName}</div>
                  <div><strong>Tổng giá trị:</strong> {formatVND(selectedContractForPayment.totalValue)}</div>
                  <div><strong>Đã thanh toán:</strong> <span className="text-success">{formatVND(selectedContractForPayment.totalPaid)}</span></div>
                  <div><strong>Công nợ còn lại:</strong> <span className="text-warning font-weight-bold">{formatVND(selectedContractForPayment.remainingAmount)}</span></div>
                </div>

                <div className="mb-2">
                  <label className="form-label">Số Tiền Thanh Toán (VNĐ) *</label>
                  <input
                    type="number"
                    step="100000"
                    required
                    className="form-control form-control-sm font-weight-bold text-success"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  />
                  <small className="text-muted">{formatVND(paymentForm.amount)}</small>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-md-6">
                    <label className="form-label">Ngày Thanh Toán *</label>
                    <input
                      type="date"
                      required
                      className="form-control form-control-sm"
                      value={paymentForm.paymentDate}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phương Thức Thanh Toán</label>
                    <select
                      className="form-select form-select-sm"
                      value={paymentForm.paymentMethod}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    >
                      <option value="Chuyển khoản">Chuyển khoản ngân hàng</option>
                      <option value="Tiền mặt">Tiền mặt tại công ty</option>
                      <option value="Thẻ tín dụng">Thẻ tín dụng / POS</option>
                    </select>
                  </div>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-md-6">
                    <label className="form-label">Giai Đoạn / Đợt Thanh Toán</label>
                    <select
                      className="form-select form-select-sm"
                      value={paymentForm.stage}
                      onChange={(e) => setPaymentForm({ ...paymentForm, stage: e.target.value })}
                    >
                      <option value="Đặt cọc đợt 1 (50%)">Đặt cọc đợt 1 (50%)</option>
                      <option value="Thanh toán đợt 2 (Kéo máy)">Thanh toán đợt 2 (Kéo máy)</option>
                      <option value="Thanh toán đợt 3 (Lắp đặt xong)">Thanh toán đợt 3 (Lắp đặt xong)</option>
                      <option value="Tất toán đợt cuối (Nghiệm thu bàn giao)">Tất toán đợt cuối (Nghiệm thu bàn giao)</option>
                      <option value="Thanh toán phát sinh">Thanh toán phát sinh / Tùy chọn khác</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Mã Chứng Từ / Ủy Nhiệm Chi (UNC)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="VD: UNC-VCB-88219"
                      value={paymentForm.receiptCode}
                      onChange={(e) => setPaymentForm({ ...paymentForm, receiptCode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label">Ghi Chú Kế Toán</label>
                  <textarea
                    rows="2"
                    className="form-control form-control-sm"
                    placeholder="Ghi chú chi tiết giao dịch hoặc tên người nộp..."
                    value={paymentForm.note}
                    onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div className="dt-modal-footer">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowPaymentModal(false)}>
                  Hủy Bỏ
                </button>
                <button type="submit" className="btn btn-sm btn-success" disabled={submittingPayment}>
                  {submittingPayment ? "Đang ghi nhận..." : "Xác Nhận Thu Tiền"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: FULL PAYMENTS LEDGER VIEW ================= */}
      {showLedgerModal && selectedContractForLedger && (
        <div className="dt-modal-backdrop" onClick={() => setShowLedgerModal(false)}>
          <div className="dt-modal-dialog dt-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="dt-modal-header">
              <h5 className="dt-modal-title">
                <i className="bi bi-receipt-cutoff text-primary me-2"></i>
                Lịch Sử Thanh Toán & Chi Phí: {selectedContractForLedger.contractCode}
              </h5>
              <button type="button" className="dt-modal-close" onClick={() => setShowLedgerModal(false)}>×</button>
            </div>

            <div className="dt-modal-body">
              {/* Financial Balance Summary */}
              <div className="row g-2 mb-3">
                <div className="col-md-3">
                  <div className="dt-ledger-card">
                    <span className="text-muted small">Tổng Hợp Đồng</span>
                    <strong className="text-primary fs-6">{formatVND(selectedContractForLedger.totalValue)}</strong>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="dt-ledger-card">
                    <span className="text-muted small">Tổng Đã Thu</span>
                    <strong className="text-success fs-6">{formatVND(selectedContractForLedger.totalPaid)}</strong>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="dt-ledger-card">
                    <span className="text-muted small">Công Nợ Còn Lại</span>
                    <strong className="text-warning fs-6">{formatVND(selectedContractForLedger.remainingAmount)}</strong>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="dt-ledger-card">
                    <span className="text-muted small">Lợi Nhuận Dự Kiến</span>
                    <strong className="text-teal fs-6">{formatVND(selectedContractForLedger.expectedProfit)}</strong>
                  </div>
                </div>
              </div>

              {/* Payments List */}
              <h6 className="font-weight-bold mb-2 text-dark">
                <i className="bi bi-card-checklist text-success me-1"></i> Các Đợt Thanh Toán Đã Ghi Nhận ({selectedContractForLedger.payments?.length || 0} đợt)
              </h6>
              {(!selectedContractForLedger.payments || selectedContractForLedger.payments.length === 0) ? (
                <div className="alert alert-light text-center py-3">Chưa có giao dịch thanh toán nào cho hợp đồng này.</div>
              ) : (
                <div className="table-responsive mb-3">
                  <table className="table table-sm table-bordered dt-ledger-table mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Ngày</th>
                        <th>Giai Đoạn / Đợt</th>
                        <th>Số Tiền</th>
                        <th>Hình Thức</th>
                        <th>Mã Chứng Từ</th>
                        <th>Ghi Chú</th>
                        <th className="text-center">Xóa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedContractForLedger.payments.map((p, idx) => (
                        <tr key={p.id}>
                          <td>{idx + 1}</td>
                          <td>{new Date(p.paymentDate).toLocaleDateString("vi-VN")}</td>
                          <td><strong>{p.stage}</strong></td>
                          <td className="text-success font-weight-bold">{formatVND(p.amount)}</td>
                          <td>{p.paymentMethod}</td>
                          <td><code>{p.receiptCode || "-"}</code></td>
                          <td className="small">{p.note || "-"}</td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-xs btn-outline-danger"
                              onClick={() => handleDeletePayment(selectedContractForLedger.id, p.id)}
                              title="Xóa đợt này"
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Costs Breakdown */}
              <h6 className="font-weight-bold mb-2 text-dark">
                <i className="bi bi-pie-chart text-danger me-1"></i> Cơ Cấu Chi Phí Triển Khai
              </h6>
              <div className="row g-2">
                <div className="col-3">
                  <div className="p-2 border rounded bg-light">
                    <small className="text-muted d-block">CP Thiết Bị</small>
                    <strong>{formatVND(selectedContractForLedger.costEquipment)}</strong>
                  </div>
                </div>
                <div className="col-3">
                  <div className="p-2 border rounded bg-light">
                    <small className="text-muted d-block">CP Vận Chuyển</small>
                    <strong>{formatVND(selectedContractForLedger.costShipping)}</strong>
                  </div>
                </div>
                <div className="col-3">
                  <div className="p-2 border rounded bg-light">
                    <small className="text-muted d-block">CP Lắp Đặt</small>
                    <strong>{formatVND(selectedContractForLedger.costInstallation)}</strong>
                  </div>
                </div>
                <div className="col-3">
                  <div className="p-2 border rounded bg-light">
                    <small className="text-muted d-block">CP Khác</small>
                    <strong>{formatVND(selectedContractForLedger.costOther)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="dt-modal-footer">
              <button
                type="button"
                className="btn btn-sm btn-success me-auto"
                onClick={() => {
                  setShowLedgerModal(false);
                  handleOpenPayment(selectedContractForLedger);
                }}
              >
                <i className="bi bi-plus-circle me-1"></i> Thêm Đợt Thanh Toán
              </button>
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowLedgerModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Funnel Step Gradient Generator
function getFunnelGradient(step) {
  switch (step) {
    case 1:
      return "linear-gradient(90deg, #3b82f6, #60a5fa)";
    case 2:
      return "linear-gradient(90deg, #0284c7, #38bdf8)";
    case 3:
      return "linear-gradient(90deg, #6366f1, #818cf8)";
    case 4:
      return "linear-gradient(90deg, #d97706, #fbbf24)";
    case 5:
      return "linear-gradient(90deg, #2563eb, #60a5fa)";
    case 6:
      return "linear-gradient(90deg, #7c3aed, #a78bfa)";
    case 7:
      return "linear-gradient(90deg, #059669, #34d399)";
    case 8:
      return "linear-gradient(90deg, #15803d, #22c55e)";
    default:
      return "#3b82f6";
  }
}
