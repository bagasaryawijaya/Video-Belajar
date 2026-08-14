import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, isLogin, logout } = useAuth();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // =========================
  // SCROLL EFFECT
  // =========================
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // =========================
  // LOCK BODY WHEN MOBILE MENU OPEN
  // =========================
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  // =========================
  // CLOSE MOBILE MENU
  // =========================
  const closeMenu = () => {
    setIsOpen(false);
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/login");
  };

  // =========================
  // NAV LINK STYLE
  // =========================
  const navLinkClass = ({ isActive }) =>
    `
      relative
      py-2
      text-sm
      lg:text-base
      font-medium
      transition-colors
      duration-200
      ${
        isActive
          ? "text-green-600"
          : "text-gray-700 hover:text-green-600"
      }

      after:absolute
      after:left-0
      after:-bottom-1
      after:h-[2px]
      after:bg-green-500
      after:transition-all
      after:duration-200
      ${
        isActive
          ? "after:w-full"
          : "after:w-0 hover:after:w-full"
      }
    `;

  // =========================
  // PROFILE BUTTON
  // =========================
  const profileButton = (
    <Link
      to="/profile"
      onClick={closeMenu}
      className="
        flex
        items-center
        justify-center
        gap-2

        min-w-[150px]
        h-10

        px-4
        rounded-lg

        border
        border-green-500

        text-green-600
        text-sm
        font-medium

        hover:bg-green-50

        transition
        duration-200
      "
    >
      {user?.profileImage ? (
        <img
          src={user.profileImage}
          alt="Profile"
          className="
            w-7
            h-7
            rounded-full
            object-cover
            flex-shrink-0
          "
        />
      ) : (
        <span
          className="
            w-7
            h-7
            rounded-full
            bg-green-100
            text-green-700

            flex
            items-center
            justify-center

            font-semibold
            flex-shrink-0
          "
        >
          {(user?.nama || "U").charAt(0).toUpperCase()}
        </span>
      )}

      <span>Edit Profile</span>
    </Link>
  );

  return (
    <>
      {/* =====================================================
          DESKTOP / TABLET NAVBAR
      ====================================================== */}
      <header
        className={`
          fixed
          top-0
          left-0
          right-0
          z-50

          bg-white

          transition-all
          duration-300

          ${
            isScrolled
              ? "shadow-md border-b border-gray-200"
              : "border-b border-transparent"
          }
        `}
      >
        <div
          className="
            max-w-7xl
            mx-auto

            px-4
            sm:px-6
            lg:px-8
          "
        >
          <div
            className="
              h-16
              lg:h-[72px]

              flex
              items-center
              justify-between
            "
          >
            {/* =====================
                LOGO
            ====================== */}
            <NavLink
              to="/"
              className="
                flex
                items-center
                flex-shrink-0
              "
            >
              <img
                src="logo-video-belajar.png"
                alt="Logo Video Belajar"
                className="
                  h-9
                  sm:h-10
                  lg:h-11
                  w-auto
                  object-contain
                "
              />
            </NavLink>

            {/* =====================
                DESKTOP / TABLET MENU
            ====================== */}
            <nav
              className="
                hidden
                md:flex

                items-center

                gap-5
                lg:gap-8

                mx-6
                lg:mx-10
              "
            >
              <NavLink to="/" className={navLinkClass}>
                Home
              </NavLink>

              <NavLink to="/courses" className={navLinkClass}>
                Courses
              </NavLink>

              <NavLink to="/about" className={navLinkClass}>
                About
              </NavLink>

              <NavLink to="/contact" className={navLinkClass}>
                Contact
              </NavLink>
            </nav>

            {/* =====================
                AUTH BUTTONS
            ====================== */}
            <div
              className="
                hidden
                md:flex

                items-center
                justify-end

                gap-2
                lg:gap-3

                flex-shrink-0
              "
            >
              {!isLogin ? (
                <>
                  {/* LOGIN */}
                  <NavLink
                    to="/login"
                    className="
                      inline-flex
                      items-center
                      justify-center

                      min-w-[100px]
                      lg:min-w-[110px]

                      h-10
                      lg:h-11

                      px-5

                      rounded-lg

                      bg-green-500
                      text-white

                      text-sm
                      lg:text-base
                      font-medium

                      hover:bg-green-600
                      active:scale-95

                      transition-all
                      duration-200
                    "
                  >
                    Login
                  </NavLink>

                  {/* SIGN UP */}
                  <NavLink
                    to="/signup"
                    className="
                      inline-flex
                      items-center
                      justify-center

                      min-w-[100px]
                      lg:min-w-[110px]

                      h-10
                      lg:h-11

                      px-5

                      rounded-lg

                      border
                      border-green-500

                      text-green-500

                      text-sm
                      lg:text-base
                      font-medium

                      hover:bg-green-50
                      active:scale-95

                      transition-all
                      duration-200
                    "
                  >
                    Sign Up
                  </NavLink>
                </>
              ) : (
                <>
                  {profileButton}

                  {/* LOGOUT */}
                  <button
                    onClick={handleLogout}
                    className="
                      inline-flex
                      items-center
                      justify-center

                      min-w-[100px]
                      lg:min-w-[110px]

                      h-10
                      lg:h-11

                      px-5

                      rounded-lg

                      bg-red-500
                      text-white

                      text-sm
                      lg:text-base
                      font-medium

                      hover:bg-red-600
                      active:scale-95

                      transition-all
                      duration-200
                    "
                  >
                    Logout
                  </button>
                </>
              )}
            </div>

            {/* =====================
                MOBILE HAMBURGER
            ====================== */}
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setIsOpen(true)}
              className="
                md:hidden

                w-10
                h-10

                flex
                items-center
                justify-center

                rounded-lg

                hover:bg-gray-100

                transition
              "
            >
              <HiOutlineMenuAlt3
                size={30}
                className="text-gray-700"
              />
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}
      <div
        className={`
          fixed
          inset-0
          z-[100]

          bg-white

          md:hidden

          transition-all
          duration-300
          ease-in-out

          ${
            isOpen
              ? "opacity-100 visible translate-x-0"
              : "opacity-0 invisible translate-x-full"
          }
        `}
      >
        {/* =====================
            MOBILE HEADER
        ====================== */}
        <div
          className="
            h-[72px]

            px-4
            sm:px-6

            flex
            items-center
            justify-between

            border-b
            border-gray-200
          "
        >
          {/* LOGO */}
          <NavLink
            to="/"
            onClick={closeMenu}
            className="flex items-center"
          >
            <img
              src="logo-video-belajar.png"
              alt="Logo Video Belajar"
              className="
                h-9
                sm:h-10
                w-auto
              "
            />
          </NavLink>

          {/* CLOSE BUTTON */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeMenu}
            className="
              w-10
              h-10

              flex
              items-center
              justify-center

              rounded-lg

              hover:bg-gray-100

              transition
            "
          >
            <HiOutlineX
              size={32}
              className="text-gray-700"
            />
          </button>
        </div>

        {/* =====================
            MOBILE CONTENT
        ====================== */}
        <div
          className="
            h-[calc(100vh-72px)]

            overflow-y-auto

            px-6
            sm:px-10

            py-10
          "
        >
          <nav
            className="
              max-w-sm
              mx-auto

              flex
              flex-col

              items-center

              gap-7
            "
          >
            {/* HOME */}
            <NavLink
              to="/"
              onClick={closeMenu}
              className={({ isActive }) => `
                w-full
                text-center

                py-2

                text-xl
                sm:text-2xl

                font-semibold

                transition-colors

                ${
                  isActive
                    ? "text-green-600"
                    : "text-gray-800 hover:text-green-600"
                }
              `}
            >
              Home
            </NavLink>

            {/* COURSES */}
            <NavLink
              to="/courses"
              onClick={closeMenu}
              className={({ isActive }) => `
                w-full
                text-center

                py-2

                text-xl
                sm:text-2xl

                font-semibold

                transition-colors

                ${
                  isActive
                    ? "text-green-600"
                    : "text-gray-800 hover:text-green-600"
                }
              `}
            >
              Courses
            </NavLink>

            {/* ABOUT */}
            <NavLink
              to="/about"
              onClick={closeMenu}
              className={({ isActive }) => `
                w-full
                text-center

                py-2

                text-xl
                sm:text-2xl

                font-semibold

                transition-colors

                ${
                  isActive
                    ? "text-green-600"
                    : "text-gray-800 hover:text-green-600"
                }
              `}
            >
              About
            </NavLink>

            {/* PROGRAM */}
            <NavLink
              to="/program"
              onClick={closeMenu}
              className={({ isActive }) => `
                w-full
                text-center

                py-2

                text-xl
                sm:text-2xl

                font-semibold

                transition-colors

                ${
                  isActive
                    ? "text-green-600"
                    : "text-gray-800 hover:text-green-600"
                }
              `}
            >
              Program
            </NavLink>

            {/* =====================
                MOBILE AUTH
            ====================== */}
            <div
              className="
                w-full

                max-w-xs
                sm:max-w-sm

                pt-5

                flex
                flex-col

                gap-3
              "
            >
              {!isLogin ? (
                <>
                  {/* MOBILE LOGIN */}
                  <NavLink
                    to="/login"
                    onClick={closeMenu}
                    className="
                      w-full

                      min-h-[46px]

                      px-6

                      flex
                      items-center
                      justify-center

                      rounded-lg

                      bg-green-500
                      text-white

                      font-medium

                      hover:bg-green-600

                      transition
                    "
                  >
                    Login
                  </NavLink>

                  {/* MOBILE SIGN UP */}
                  <NavLink
                    to="/signup"
                    onClick={closeMenu}
                    className="
                      w-full

                      min-h-[46px]

                      px-6

                      flex
                      items-center
                      justify-center

                      rounded-lg

                      border
                      border-green-500

                      text-green-500

                      font-medium

                      hover:bg-green-50

                      transition
                    "
                  >
                    Sign Up
                  </NavLink>
                </>
              ) : (
                <>
                  {/* MOBILE PROFILE */}
                  <div className="w-full">
                    {profileButton}
                  </div>

                  {/* MOBILE LOGOUT */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      w-full

                      min-h-[46px]

                      px-6

                      flex
                      items-center
                      justify-center

                      rounded-lg

                      bg-red-500
                      text-white

                      font-medium

                      hover:bg-red-600

                      transition
                    "
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navbar;