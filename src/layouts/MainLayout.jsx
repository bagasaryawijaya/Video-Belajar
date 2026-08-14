import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";

export default function MainLayout() {
  return (
    <>
      {/* Selalu kembali ke posisi paling atas ketika pindah halaman */}
      <ScrollToTop />

      {/* Navbar */}
      <Navbar />

      {/* Isi halaman */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}