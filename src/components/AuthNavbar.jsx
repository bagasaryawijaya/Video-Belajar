import { Link } from "react-router-dom";
import logo from "../assets/logo-video-belajar.png";

export default function AuthNavbar() {
  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-8 py-5">
        <Link to="/">
          <img
            src={logo}
            alt="Video Belajar"
            className="h-10"
          />
        </Link>
      </div>
    </header>
  );
}