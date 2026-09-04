import { Navigate, NavLink, Outlet } from "react-router-dom";
import { FiUser, FiBookOpen, FiShoppingBag } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const items = [
  { label: "Profil Saya", to: "/profile", icon: FiUser },
  { label: "Kelas Saya", to: "/my-courses", icon: FiBookOpen },
  { label: "Pesanan Saya", to: "/orders", icon: FiShoppingBag },
];

export default function AccountLayout() {
  const { user, isLogin } = useAuth();
  if (!isLogin) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-[#fffdf4] pt-20 sm:pt-[88px]">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-9 lg:py-12">
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="mb-4">
            <h1 className="text-xl font-bold text-gray-800">Akun Saya</h1>
            <p className="mt-1 text-sm text-gray-500">Kelola data dan pembelajaran Anda</p>
          </div>
          <nav className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            {items.map(({ label, to, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) =>
                `mb-1 flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-semibold transition last:mb-0 ${
                  isActive ? "border border-orange-400 bg-[#fff8df] text-orange-500" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                }`
              }>
                <Icon className="shrink-0 text-lg" />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 hidden rounded-xl border border-gray-200 bg-white p-4 lg:block">
            <p className="text-xs text-gray-400">Login sebagai</p>
            <p className="mt-1 truncate text-sm font-semibold text-gray-800">{user?.nama}</p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
          </div>
        </aside>

        <section className="min-w-0">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
