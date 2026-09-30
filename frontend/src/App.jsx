import { useEffect } from "react";
import AOS from "aos";
import { Route, Routes, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import FloatingContact from "./components/FloatingContact";
import AiConsultant from "./components/AiConsultant";
import Admin from "./pages/Admin";
import ChiTietDuAn from "./pages/ChiTietDuAn";
import DichVu from "./pages/DichVu";
import DuAn from "./pages/DuAn";
import GioiThieu from "./pages/GioiThieu";
import Home from "./pages/Home";
import LienHe from "./pages/LienHe";
import DuToanThangMay from "./pages/DuToanThangMay";

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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gioi-thieu" element={<GioiThieu />} />
        <Route path="/dich-vu" element={<DichVu />} />
        <Route path="/du-an" element={<DuAn />} />
        <Route path="/du-an/:slug" element={<ChiTietDuAn />} />
        <Route path="/lien-he" element={<LienHe />} />
        <Route path="/du-toan" element={<DuToanThangMay />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      {!laTrangAdmin && <FloatingContact />}
      {!laTrangAdmin && <AiConsultant />}
      {!laTrangAdmin && <Footer />}
    </>
  );
}

export default App;
