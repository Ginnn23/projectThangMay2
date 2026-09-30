import { Suspense, lazy, useEffect } from "react";
import AOS from "aos";
import { Route, Routes, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import FloatingContact from "./components/FloatingContact";
import Home from "./pages/Home";

const Admin = lazy(() => import("./pages/Admin"));
const ChiTietDuAn = lazy(() => import("./pages/ChiTietDuAn"));
const DichVu = lazy(() => import("./pages/DichVu"));
const DuAn = lazy(() => import("./pages/DuAn"));
const GioiThieu = lazy(() => import("./pages/GioiThieu"));
const LienHe = lazy(() => import("./pages/LienHe"));

function PageLoader() {
  return (
    <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Đang tải...</span>
      </div>
    </div>
  );
}

function ScrollToTop() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (hash) {
      window.requestAnimationFrame(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
      });
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [hash, pathname]);

  return null;
}

function App() {
  const { pathname } = useLocation();
  const laTrangAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    AOS.init({
      duration: 900,
      easing: "ease-out-cubic",
      once: true,
      offset: 100,
    });
  }, []);

  return (
    <>
      <ScrollToTop />
      {!laTrangAdmin && <Header />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gioi-thieu" element={<GioiThieu />} />
          <Route path="/dich-vu" element={<DichVu />} />
          <Route path="/du-an" element={<DuAn />} />
          <Route path="/du-an/:slug" element={<ChiTietDuAn />} />
          <Route path="/lien-he" element={<LienHe />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Suspense>
      {!laTrangAdmin && <FloatingContact />}
      {!laTrangAdmin && <Footer />}
    </>
  );
}

export default App;
