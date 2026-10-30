const statistics = [
  { value: "300+", label: "Công trình hoàn thiện" },
  { value: "10+", label: "Năm kinh nghiệm" },
  { value: "24/7", label: "Cứu hộ & Kỹ thuật" },
  { value: "100%", label: "Chuẩn kiểm định" },
];

function Stats() {
  return (
    <div className="hero-minimal-stats" data-aos="fade-up" data-aos-delay="200">
      {statistics.map((item, idx) => (
        <div className="hero-minimal-stat-item" key={item.label}>
          <div className="stat-number-wrap">
            <strong className="stat-value">{item.value}</strong>
          </div>
          <span className="stat-label">{item.label}</span>
          {idx < statistics.length - 1 && <div className="stat-separator" aria-hidden="true" />}
        </div>
      ))}
    </div>
  );
}

export default Stats;
