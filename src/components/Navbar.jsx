import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, isLogin, logout } = useAuth();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    document.documentElement.style.overflow = isOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/login");
  };

  const profileButton = (
    <Link
      to="/profile"
      onClick={closeMenu}
      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-green-500 text-green-600 hover:bg-green-50 transition"
    >
      {user?.profileImage ? (
        <img
          src={user.profileImage}
          alt="Profile"
          className="w-7 h-7 rounded-full object-cover"
        />
      ) : (
        <span className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold">
          {(user?.nama || "U").charAt(0).toUpperCase()}
        </span>
      )}
      <span>Edit Profile</span>
    </Link>
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full bg-white z-50 transition-all duration-300 ${
          isScrolled ? "shadow-md border-b border-gray-200" : ""
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <NavLink to="/">
              <img
                src="logo-video-belajar.png"
                alt="Logo"
                className="h-10"
              />
            </NavLink>

            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-6">
              <NavLink to="/" className="hover:text-green-500 transition">
                Home
              </NavLink>
              <NavLink to="/courses" className="hover:text-green-500 transition">
                Courses
              </NavLink>
              <NavLink to="/about" className="hover:text-green-500 transition">
                About
              </NavLink>
              <NavLink to="/program" className="hover:text-green-500 transition">
                Program
              </NavLink>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {!isLogin ? (
                <>
                  <NavLink
                    to="/login"
                    className="bg-green-500 text-white px-1 py-2 rounded-lg hover:bg-green-600 transition"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/signup"
                    className="border border-green-500 text-green-500 px-1 py-2 rounded-lg hover:bg-green-50 transition"
                  >
                    Sign Up
                  </NavLink>
                </>
              ) : (
                <>
                  {profileButton}
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-1 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>

            <button
              className="md:hidden"
              onClick={() => setIsOpen(true)}
            >
              <HiOutlineMenuAlt3 size={30} className="text-gray-700" />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 bg-white z-[100] md:hidden transform transition-all duration-300 ${
          isOpen
            ? "opacity-100 visible translate-x-0"
            : "opacity-0 invisible translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center h-20 px-6 border-b">
          <NavLink to="/" onClick={closeMenu}>
            <img
              src="logo-video-belajar.png"
              alt="Logo"
              className="h-10"
            />
          </NavLink>

          <button onClick={closeMenu}>
            <HiOutlineX size={32} className="text-gray-700" />
          </button>
        </div>

        <nav className="flex flex-col justify-center items-center h-[calc(100vh-80px)] space-y-8">
          <NavLink to="/" onClick={closeMenu} className="text-2xl font-semibold hover:text-green-500">
            Home
          </NavLink>
          <NavLink to="/courses" onClick={closeMenu} className="text-2xl font-semibold hover:text-green-500">
            Courses
          </NavLink>
          <NavLink to="/about" onClick={closeMenu} className="text-2xl font-semibold hover:text-green-500">
            About
          </NavLink>
          <NavLink to="/program" onClick={closeMenu} className="text-2xl font-semibold hover:text-green-500">
            Program
          </NavLink>

          <div className="w-72 pt-6 space-y-4">
            {!isLogin ? (
              <>
                <NavLink
                  to="/login"
                  onClick={closeMenu}
                  className="block w-full text-center bg-green-500 text-white py-3 rounded-lg"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={closeMenu}
                  className="block w-full text-center border border-green-500 text-green-500 py-3 rounded-lg"
                >
                  Sign Up
                </NavLink>
              </>
            ) : (
              <>
                {profileButton}
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navbar;