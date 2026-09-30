import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function SeoHead({
  title,
  description,
  keywords,
  canonical,
  ogImage = "https://thangmayhahong.xyz/og-image.jpg",
}) {
  const location = useLocation();

  useEffect(() => {
    const fullTitle = title
      ? (title.includes("Hà Hồng") ? title : `${title} | Thang Máy Hà Hồng`)
      : "Thang Máy Hà Hồng - Lắp Đặt, Cải Tạo & Bảo Trì Thang Máy Gia Đình Uy Tín TPHCM";

    document.title = fullTitle;

    const defaultDesc =
      "Công ty Thang Máy Hà Hồng chuyên tư vấn, thiết kế, lắp đặt thang máy gia đình, thang máy kính homelift, cải tạo và bảo trì thang máy uy tín giá tốt tại TPHCM. Hotline 24/7: 0909 9333 58.";
    const metaDesc = description || defaultDesc;

    const defaultKeywords =
      "thang máy, thang máy gia đình, thang máy gia đình tphcm, báo giá thang máy, thang máy kính, thang máy homelift, lắp đặt thang máy, bảo trì thang máy, thang máy hà hồng";
    const metaKeywords = keywords || defaultKeywords;

    const currentUrl = `https://thangmayhahong.xyz${location.pathname === "/" ? "" : location.pathname}`;
    const pageCanonical = canonical || currentUrl;

    // Update meta description
    let descEl = document.querySelector('meta[name="description"]');
    if (!descEl) {
      descEl = document.createElement("meta");
      descEl.setAttribute("name", "description");
      document.head.appendChild(descEl);
    }
    descEl.setAttribute("content", metaDesc);

    // Update meta keywords
    let kwEl = document.querySelector('meta[name="keywords"]');
    if (!kwEl) {
      kwEl = document.createElement("meta");
      kwEl.setAttribute("name", "keywords");
      document.head.appendChild(kwEl);
    }
    kwEl.setAttribute("content", metaKeywords);

    // Update canonical link
    let canEl = document.querySelector('link[rel="canonical"]');
    if (!canEl) {
      canEl = document.createElement("link");
      canEl.setAttribute("rel", "canonical");
      document.head.appendChild(canEl);
    }
    canEl.setAttribute("href", pageCanonical);

    // Update og:title
    let ogTitleEl = document.querySelector('meta[property="og:title"]');
    if (ogTitleEl) ogTitleEl.setAttribute("content", fullTitle);

    // Update og:description
    let ogDescEl = document.querySelector('meta[property="og:description"]');
    if (ogDescEl) ogDescEl.setAttribute("content", metaDesc);

    // Update og:url
    let ogUrlEl = document.querySelector('meta[property="og:url"]');
    if (ogUrlEl) ogUrlEl.setAttribute("content", pageCanonical);

    // Update og:image
    if (ogImage) {
      let ogImgEl = document.querySelector('meta[property="og:image"]');
      if (ogImgEl) ogImgEl.setAttribute("content", ogImage);
    }
  }, [title, description, keywords, canonical, ogImage, location.pathname]);

  return null;
}
