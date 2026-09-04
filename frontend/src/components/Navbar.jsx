import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo-video-belajar.png";
import defaultAvatar from "../assets/Avatar1.png";

const links = [
  { label: "Home", to: "/" },
  { label: "Courses", to: "/courses" },
  { label: "About", to: "/about" },
  { label: "Blog", to: "/blog" },
];

const linkClass = ({ isActive }) =>
  `relative py-2 text-sm font-medium transition-colors lg:text-base ${
    isActive
      ? "text-green-600"
      : "text-gray-700 hover:text-green-600"
  } after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-green-500 ${
    isActive ? "after:w-full" : "after:w-0 hover:after:w-full"
  }`;

export default function Navbar() {
  const { user, isLogin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setIsOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const go = (path) => {
    setIsOpen(false);
    navigate(path);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const avatar = user?.profileImage ? user.profileImage : defaultAvatar;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b bg-white transition-shadow ${
        isScrolled ? "border-gray-100 shadow-md" : "border-gray-200"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-[72px]">
          {/* Logo */}
          <Link to="/" onClick={() => go("/")} className="shrink-0">
            <img
              src={logo}
              alt="Video Belajar"
              className="h-9 w-auto sm:h-10 lg:h-11"
            />
          </Link>

          {/* Desktop navigation - tetap muncul meskipun pengguna sudah login */}
          <nav className="hidden items-center gap-6 md:flex lg:gap-9">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop right side */}
          <div className="hidden items-center gap-3 md:flex lg:gap-5">
            {isLogin ? (
              <>
                {user?.role === "admin" || user?.role === "superadmin" ? (
                  <Link to="/admin" className="rounded-lg border border-green-500 px-4 py-2 text-sm font-semibold text-green-600 hover:bg-green-50">Dashboard</Link>
                ) : null}
                <Link
                  to="/profile"
                  aria-label="Buka profil"
                  className="rounded-xl outline-none ring-green-500 transition hover:scale-105 focus:ring-2"
                >
                  <img
                    src={avatar}
                    alt="Foto profil"
                    className="h-10 w-10 rounded-xl object-cover sm:h-11 sm:w-11"
                  />
                </Link>
                <LogoutButton onLogout={() => {
                  logout();
                  go("/");
                }} />
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => go("/login")}
                  className="rounded-lg bg-green-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => go("/signup")}
                  className="rounded-lg border border-green-500 px-5 py-2.5 text-sm font-semibold text-green-600 transition hover:bg-green-50"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-2 md:hidden">
            {isLogin && (
              <Link
                to="/profile"
                aria-label="Buka profil"
                className="rounded-xl outline-none ring-green-500 focus:ring-2"
              >
                <img
                  src={avatar}
                  alt="Foto profil"
                  className="h-9 w-9 rounded-xl object-cover"
                />
              </Link>
            )}
            <button
              type="button"
              aria-label={isOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={isOpen}
              onClick={() => setIsOpen((value) => !value)}
              className="rounded-lg p-2 text-2xl text-gray-700 hover:bg-gray-100"
            >
              {isOpen ? <HiOutlineX /> : <HiOutlineMenuAlt3 />}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div
          className={`overflow-hidden transition-all duration-300 md:hidden ${
            isOpen ? "max-h-[620px] pb-5" : "max-h-0"
          }`}
        >
          <nav className="flex flex-col gap-1 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-semibold ${
                    isActive
                      ? "bg-green-50 text-green-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {isLogin ? (
              <>
                {user?.role === "admin" || user?.role === "superadmin" ? (
                  <Link to="/admin" className="rounded-lg border border-green-500 px-4 py-2 text-sm font-semibold text-green-600 hover:bg-green-50">Dashboard</Link>
                ) : null}
                <LogoutButton mobile onLogout={() => {
                  logout();
                  go("/");
                }} />
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Profil Saya
                </Link>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => go("/login")}
                  className="rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-white"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => go("/signup")}
                  className="rounded-xl border border-green-500 px-4 py-3 text-sm font-semibold text-green-600"
                >
                  Sign Up
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}


function LogoutButton({ onLogout, mobile = false }) {
  return (
    <button
      type="button"
      onClick={onLogout}
      className={mobile
        ? "mt-1 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-500 hover:bg-red-50"
        : "rounded-lg border border-red-400 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"}
    >
      Logout
    </button>
  );
}
