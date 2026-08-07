import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isLogin, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Shadow navbar saat discroll
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock scroll ketika menu dibuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, [isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
  logout();
  closeMenu();
  navigate("/login");
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <header
        className={`fixed top-0 left-0 w-full bg-white z-50 transition-all duration-300 ${
          isScrolled ? "shadow-md border-b border-gray-200" : ""
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <NavLink to="/">
              <img
                src="logo-video-belajar.png"
                alt="Logo"
                className="h-10"
              />
            </NavLink>

            {/* Menu Desktop */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-8">
              <NavLink
                to="/"
                className="hover:text-green-500 transition"
              >
                Home
              </NavLink>

              <NavLink
                to="/courses"
                className="hover:text-green-500 transition"
              >
                Courses
              </NavLink>

              <NavLink
                to="/about"
                className="hover:text-green-500 transition"
              >
                About
              </NavLink>

              <NavLink
                to="/program"
                className="hover:text-green-500 transition"
              >
                Program
              </NavLink>
            </div>

            {/* Button Desktop */}
            <div className="hidden md:flex gap-3">

  {!isLogin ? (
    <>
      <NavLink
        to="/login"
        className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition"
      >
        Login
      </NavLink>

      <NavLink
        to="/signup"
        className="border border-green-500 text-green-500 px-5 py-2 rounded-lg hover:bg-green-50 transition"
      >
        Sign Up
      </NavLink>
    </>
  ) : (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition"
    >
      Logout
    </button>
  )}

</div>

            {/* Hamburger Mobile */}
            <button
              className="md:hidden"
              onClick={() => setIsOpen(true)}
            >
              <HiOutlineMenuAlt3
                size={30}
                className="text-gray-700"
              />
            </button>
          </div>
        </div>
      </header>

      {/* ================= MOBILE MENU FULLSCREEN ================= */}
      <div
        className={`fixed inset-0 bg-white z-[100] md:hidden transform transition-all duration-300 ${
          isOpen
            ? "opacity-100 visible translate-x-0"
            : "opacity-0 invisible translate-x-full"
        }`}
      >
        {/* Header Mobile */}
        <div className="flex justify-between items-center h-20 px-6 border-b">
          <img
            src="logo-video-belajar.png"
            alt="Logo"
            className="h-10"
          />

          <button onClick={closeMenu}>
            <HiOutlineX
              size={32}
              className="text-gray-700"
            />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex flex-col justify-center items-center h-[calc(100vh-80px)] space-y-8">
          <NavLink
            to="/"
            onClick={closeMenu}
            className="text-2xl font-semibold hover:text-green-500 transition"
          >
            Home
          </NavLink>

          <NavLink
            to="/courses"
            onClick={closeMenu}
            className="text-2xl font-semibold hover:text-green-500 transition"
          >
            Courses
          </NavLink>

          <NavLink
            to="/about"
            onClick={closeMenu}
            className="text-2xl font-semibold hover:text-green-500 transition"
          >
            About
          </NavLink>

          <NavLink
            to="/program"
            onClick={closeMenu}
            className="text-2xl font-semibold hover:text-green-500 transition"
          >
            Program
          </NavLink>

          <div className="w-72 pt-6 space-y-4">

  {!isLogin ? (
    <>
      <NavLink
        to="/login"
        onClick={closeMenu}
        className="block w-full text-center bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition"
      >
        Login
      </NavLink>

      <NavLink
        to="/signup"
        onClick={closeMenu}
        className="block w-full text-center border border-green-500 text-green-500 py-3 rounded-lg hover:bg-green-50 transition"
      >
        Sign Up
      </NavLink>
    </>
  ) : (
    <button
      onClick={handleLogout}
      className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition"
    >
      Logout
    </button>
  )}

</div>
        </nav>
      </div>
    </>
  );
};

export default Navbar;