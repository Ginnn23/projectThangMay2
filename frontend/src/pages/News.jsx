import { useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import SeoHead from "../components/SeoHead";
import { categories, newsArticles } from "../data/newsData";
import { soDienThoaiCongTy, soDienThoaiLienKet } from "../data/contactInfo";
import "./News.css";

// Helper renderer cho markdown đơn giản trong bài viết
function renderArticleContent(rawContent) {
  if (!rawContent) return null;

  const lines = rawContent.trim().split("\n");
  const elements = [];
  let inTable = false;
  let tableHeader = [];
  let tableRows = [];

  const flushTable = (key) => {
    if (inTable && tableHeader.length > 0) {
      elements.push(
        <div className="table-responsive" key={`table-${key}`}>
          <table>
            <thead>
              <tr>
                {tableHeader.map((th, i) => (
                  <th key={i}>{parseInline(th.trim())}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx}>{parseInline(cell.trim())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      inTable = false;
      tableHeader = [];
      tableRows = [];
    }
  };

  const parseInline = (text) => {
    const parts = [];
    const regex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(<strong key={match.index}>{match[1]}</strong>);
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts.length > 0 ? parts : text;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const cells = trimmed.split("|").slice(1, -1);
      if (trimmed.includes("---") || trimmed.includes(":---")) {
        // separator row, skip
        return;
      }
      if (!inTable) {
        inTable = true;
        tableHeader = cells;
      } else {
        tableRows.push(cells);
      }
      return;
    }

    if (inTable) {
      flushTable(index);
    }

    if (trimmed.startsWith("### ")) {
      elements.push(<h3 key={index}>{trimmed.replace("### ", "")}</h3>);
    } else if (trimmed.startsWith("## ")) {
      elements.push(<h2 key={index}>{trimmed.replace("## ", "")}</h2>);
    } else if (trimmed.startsWith("> ")) {
      elements.push(
        <blockquote key={index}>
          {parseInline(trimmed.replace("> ", ""))}
        </blockquote>
      );
    } else if (trimmed.startsWith("- ")) {
      elements.push(
        <li key={index} className="ms-3 mb-1">
          {parseInline(trimmed.replace("- ", ""))}
        </li>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      elements.push(
        <div key={index} className="fw-semibold mt-2 mb-1 text-dark">
          {parseInline(trimmed)}
        </div>
      );
    } else if (trimmed.length > 0) {
      elements.push(<p key={index}>{parseInline(trimmed)}</p>);
    }
  });

  if (inTable) {
    flushTable("end");
  }

  return elements;
}

export default function News() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  // Tìm bài viết theo slug nếu đang ở trang chi tiết
  const currentArticle = useMemo(() => {
    if (!slug) return null;
    return newsArticles.find((a) => a.slug === slug);
  }, [slug]);

  // Lọc bài viết theo category và search
  const filteredArticles = useMemo(() => {
    return newsArticles.filter((article) => {
      const matchCat =
        selectedCategory === "Tất cả" || article.category === selectedCategory;
      const matchSearch =
        searchQuery === "" ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredArticle = useMemo(() => {
    return newsArticles.find((a) => a.featured) || newsArticles[0];
  }, []);

  // Chi tiết bài viết (/tin-tuc/:slug)
  if (slug) {
    if (!currentArticle) {
      return (
        <div className="news-page py-5">
          <SeoHead
            title="Không tìm thấy bài viết | Thang Máy Hà Hồng"
            description="Bài viết không tồn tại hoặc đã được chuyển sang địa chỉ mới."
          />
          <div className="site-container text-center py-5">
            <i className="bi bi-journal-x fs-1 text-warning mb-3 d-block"></i>
            <h2 className="fw-bold mb-3">Bài Viết Không Tồn Tại</h2>
            <p className="text-muted mb-4">
              Bài viết quý khách đang tìm kiếm không tồn tại hoặc đã được cập nhật đường dẫn mới.
            </p>
            <button
              type="button"
              className="btn btn-warning fw-bold px-4 py-2"
              onClick={() => navigate("/tin-tuc")}
            >
              <i className="bi bi-arrow-left me-2"></i> Quay lại Danh sách Tin tức
            </button>
          </div>
        </div>
      );
    }

    const relatedArticles = newsArticles
      .filter((a) => a.id !== currentArticle.id)
      .slice(0, 3);

    return (
      <div className="news-page">
        <SeoHead
          title={`${currentArticle.title} | Thang Máy Hà Hồng`}
          description={currentArticle.summary}
          keywords={currentArticle.tags.join(", ")}
          ogImage={currentArticle.image}
        />

        <div className="article-detail-wrap">
          <div className="site-container">
            {/* Breadcrumbs */}
            <div className="article-breadcrumbs d-flex align-items-center gap-2">
              <Link to="/">Trang chủ</Link>
              <span>/</span>
              <Link to="/tin-tuc">Tin tức &amp; Cẩm nang</Link>
              <span>/</span>
              <span className="text-truncate" style={{ maxWidth: "350px" }}>
                {currentArticle.title}
              </span>
            </div>

            <div className="row g-4">
              <div className="col-lg-8">
                {/* Header bài viết */}
                <div className="article-detail-header">
                  <span className="badge bg-warning text-dark fw-bold px-3 py-1.5 mb-2" style={{ fontSize: "12px" }}>
                    {currentArticle.category}
                  </span>
                  <h1 className="article-detail-title">{currentArticle.title}</h1>
                  <div className="article-meta-info">
                    <span>
                      <i className="bi bi-person-fill text-warning me-1"></i>
                      {currentArticle.author}
                    </span>
                    <span>
                      <i className="bi bi-calendar3 text-warning me-1"></i>
                      {currentArticle.date}
                    </span>
                    <span>
                      <i className="bi bi-clock-history text-warning me-1"></i>
                      {currentArticle.readTime}
                    </span>
                  </div>
                </div>

                {/* Ảnh bài viết */}
                <div className="article-hero-img-wrap">
                  <img
                    src={currentArticle.image}
                    alt={currentArticle.title}
                    className="article-hero-img"
                  />
                </div>

                {/* Tóm tắt mở đầu */}
                <div
                  className="p-3 mb-4 rounded-3 fw-semibold"
                  style={{
                    background: "rgba(217, 164, 65, 0.08)",
                    borderLeft: "4px solid #d9a441",
                    color: "#0b2246",
                    fontSize: "1.05rem",
                    lineHeight: "1.6"
                  }}
                >
                  {currentArticle.summary}
                </div>

                {/* Nội dung bài viết */}
                <div className="article-body-content">
                  {renderArticleContent(currentArticle.content)}
                </div>

                {/* Tags */}
                <div className="article-tags-wrap">
                  <span className="fw-bold me-2 text-dark align-self-center">
                    <i className="bi bi-tags-fill text-warning me-1"></i> Từ khóa:
                  </span>
                  {currentArticle.tags.map((tag, idx) => (
                    <span key={idx} className="article-tag-item">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Nút chia sẻ */}
                <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-white border mb-4">
                  <span className="fw-bold text-dark">Chia sẻ bài viết:</span>
                  <a
                    href={`https://zalo.me/share?url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm"
                  >
                    Chia sẻ Zalo
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm"
                  >
                    Chia sẻ Facebook
                  </a>
                </div>
              </div>

              {/* Sidebar */}
              <div className="col-lg-4">
                {/* CTA Card */}
                <div className="article-sidebar-cta">
                  <h5>Nhận Báo Giá Trọn Gói 2026</h5>
                  <p>
                    Tự động tính toán chi phí lắp đặt thang máy gia đình Fuji, Mitsubishi chính xác theo số tầng và kích thước thực tế.
                  </p>
                  <Link
                    to="/du-toan"
                    className="btn btn-warning text-dark fw-bold w-100 py-2.5 mb-2 d-flex align-items-center justify-content-center gap-2"
                  >
                    <i className="bi bi-calculator"></i>
                    Tính Báo Giá Ngay
                  </Link>
                  <a
                    href={`tel:${soDienThoaiLienKet}`}
                    className="btn btn-outline-light w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                  >
                    <i className="bi bi-telephone-fill text-warning"></i>
                    Hotline: {soDienThoaiCongTy}
                  </a>
                </div>

                {/* Bài viết liên quan */}
                <div className="bg-white p-3.5 rounded-3 border shadow-sm">
                  <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
                    <i className="bi bi-bookmark-star-fill text-warning me-1"></i>
                    BÀI VIẾT NỔI BẬT KHÁC
                  </h6>
                  <div className="d-flex flex-column gap-3">
                    {relatedArticles.map((art) => (
                      <Link
                        key={art.id}
                        to={`/tin-tuc/${art.slug}`}
                        className="text-decoration-none text-dark d-flex gap-2.5 align-items-start"
                      >
                        <img
                          src={art.image}
                          alt={art.title}
                          style={{
                            width: "75px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "8px"
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            className="fw-bold small line-clamp-2"
                            style={{ lineHeight: "1.3", color: "#0b2246" }}
                          >
                            {art.title}
                          </div>
                          <small className="text-muted" style={{ fontSize: "11px" }}>
                            {art.date}
                          </small>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Danh sách bài viết (/tin-tuc)
  return (
    <div className="news-page">
      <SeoHead
        title="Tin Tức & Cẩm Nang Thang Máy Gia Đình Mới Nhất | Thang Máy Hà Hồng"
        description="Tổng hợp tin tức, cẩm nang chọn thang máy homelift kính, báo giá mới nhất 2026, giải pháp cải tạo nhà phố và nâng tầm đẳng cấp không gian sống."
        keywords="tin tức thang máy, cẩm nang thang máy, thang máy homelift kính, báo giá thang máy 2026, nâng tầm đời sống bằng thang máy, thang máy hà hồng"
      />

      {/* Hero Header Section */}
      <section className="news-hero-section">
        <div className="site-container">
          <div className="row align-items-center justify-content-between g-4">
            <div className="col-lg-7">
              <span className="badge bg-warning text-dark fw-bold px-3 py-1.5 mb-2" style={{ fontSize: "12px" }}>
                <i className="bi bi-newspaper me-1"></i> KIẾN THỨC &amp; XU HƯỚNG
              </span>
              <h1 className="display-6 fw-bold text-white mb-2">
                Tin Tức &amp; Cẩm Nang Thang Máy Hà Hồng
              </h1>
              <p className="text-light opacity-75 mb-0" style={{ fontSize: "1.05rem" }}>
                Khám phá các giải pháp thang máy hiện đại, kinh nghiệm chọn kích thước hố thang, báo giá trọn gói và bí quyết nâng tầm không gian sống cho gia đình bạn.
              </p>
            </div>

            <div className="col-lg-5 text-lg-end">
              <div className="news-search-bar ms-lg-auto">
                <i className="bi bi-search news-search-icon"></i>
                <input
                  type="text"
                  className="news-search-input"
                  placeholder="Tìm kiếm bài viết, từ khóa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="news-category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`news-category-pill ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-5">
        <div className="site-container">
          {/* Featured Article (Chỉ hiển thị khi ở tab Tất cả và không search) */}
          {selectedCategory === "Tất cả" && searchQuery === "" && featuredArticle && (
            <div className="featured-article-card">
              <div className="row g-0 align-items-center">
                <div className="col-lg-7">
                  <div className="overflow-hidden">
                    <img
                      src={featuredArticle.image}
                      alt={featuredArticle.title}
                      className="featured-article-img"
                    />
                  </div>
                </div>
                <div className="col-lg-5 p-4 p-lg-5">
                  <span className="badge bg-warning text-dark fw-bold px-3 py-1 mb-2" style={{ fontSize: "11px" }}>
                    ⭐ BÀI VIẾT NỔI BẬT
                  </span>
                  <h3 className="fw-bold mb-3" style={{ color: "#0b2246", lineHeight: "1.3" }}>
                    <Link
                      to={`/tin-tuc/${featuredArticle.slug}`}
                      className="text-decoration-none"
                      style={{ color: "inherit" }}
                    >
                      {featuredArticle.title}
                    </Link>
                  </h3>
                  <p className="text-muted mb-4" style={{ lineHeight: "1.6" }}>
                    {featuredArticle.summary}
                  </p>
                  <div className="d-flex align-items-center justify-content-between">
                    <small className="text-secondary">
                      <i className="bi bi-clock-history me-1"></i>
                      {featuredArticle.readTime} • {featuredArticle.date}
                    </small>
                    <Link
                      to={`/tin-tuc/${featuredArticle.slug}`}
                      className="btn btn-warning text-dark fw-bold px-3 py-1.5 rounded-3"
                    >
                      Đọc bài viết <i className="bi bi-arrow-right ms-1"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lưới bài viết */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h4 className="fw-bold mb-0" style={{ color: "#0b2246" }}>
              {selectedCategory === "Tất cả" ? "Tất Cả Bài Viết" : selectedCategory} ({filteredArticles.length})
            </h4>
            {searchQuery && (
              <small className="text-muted">
                Kết quả tìm kiếm cho: <strong>"{searchQuery}"</strong>
              </small>
            )}
          </div>

          {filteredArticles.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-3 border">
              <i className="bi bi-search fs-1 text-muted mb-2 d-block"></i>
              <h5 className="fw-bold">Không tìm thấy bài viết phù hợp</h5>
              <p className="text-muted">Quý khách vui lòng thử lại với từ khóa hoặc danh mục khác.</p>
              <button
                type="button"
                className="btn btn-outline-warning"
                onClick={() => {
                  setSelectedCategory("Tất cả");
                  setSearchQuery("");
                }}
              >
                Xem tất cả bài viết
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {filteredArticles.map((article) => (
                <div className="col-md-6 col-lg-4" key={article.id}>
                  <div className="news-card">
                    <div className="news-card-img-wrap">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="news-card-img"
                      />
                      <span className="news-card-badge">{article.category}</span>
                    </div>

                    <div className="news-card-body">
                      <Link
                        to={`/tin-tuc/${article.slug}`}
                        className="text-decoration-none"
                      >
                        <h5 className="news-card-title">{article.title}</h5>
                      </Link>
                      <p className="news-card-summary">{article.summary}</p>

                      <div className="news-card-footer">
                        <span>
                          <i className="bi bi-calendar3 me-1"></i>
                          {article.date}
                        </span>
                        <Link
                          to={`/tin-tuc/${article.slug}`}
                          className="news-read-more-link"
                        >
                          Đọc tiếp <i className="bi bi-arrow-right"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Banner CTA Báo Giá Cuối Trang */}
          <div
            className="mt-5 p-4 p-lg-5 rounded-4 text-center text-white"
            style={{
              background: "linear-gradient(135deg, #07192f 0%, #0b2246 100%)",
              border: "1px solid rgba(217, 164, 65, 0.4)",
              boxShadow: "0 12px 36px rgba(7, 25, 47, 0.2)"
            }}
          >
            <h3 className="fw-bold text-white mb-2">
              Bạn Đang Cần Khảo Sát &amp; Lắp Đặt Thang Máy Cho Ngôi Nhà Của Mình?
            </h3>
            <p className="text-light opacity-75 max-w-2xl mx-auto mb-4" style={{ maxWidth: "600px", margin: "0 auto" }}>
              Đội ngũ kỹ sư giàu kinh nghiệm của Thang Máy Hà Hồng sẵn sàng tư vấn giải pháp giếng thang và hỗ trợ đo laser miễn phí tận nơi.
            </p>
            <div className="d-flex flex-wrap gap-3 justify-content-center">
              <Link to="/du-toan" className="btn btn-warning text-dark fw-bold px-4 py-2.5 rounded-3">
                <i className="bi bi-calculator me-2"></i> Dự Toán Báo Giá Online
              </Link>
              <a
                href={`tel:${soDienThoaiLienKet}`}
                className="btn btn-outline-light fw-bold px-4 py-2.5 rounded-3"
              >
                <i className="bi bi-telephone-fill text-warning me-2"></i> Gọi Kỹ Sư: {soDienThoaiCongTy}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
