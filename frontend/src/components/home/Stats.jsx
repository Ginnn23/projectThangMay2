const statistics = [
  { value: "300+", label: "công trình" },
  { value: "10+", label: "năm kinh nghiệm" },
  { value: "24/7", label: "hỗ trợ kỹ thuật" },
  { value: "100%", label: "kiểm tra an toàn" },
];

function Stats() {
  return (
    <div className="hero-stats" data-aos="fade-up" data-aos-delay="220">
      {statistics.map((item) => (
        <article className="hero-stat-item" key={item.label}>
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </article>
      ))}
    </div>
  );
}

export default Stats;
