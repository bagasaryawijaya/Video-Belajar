import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaLinkedinIn,
} from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="bg-[#DCE8D2] text-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Logo */}
          <div className="lg:col-span-1">
            <h2 className="text-4xl font-bold">
              <span className="text-green-400">video</span>
              <span className="text-blue-500">belajar</span>
            </h2>
          </div>

          {/* Program */}
          <div>
            <h3 className="font-bold text-xl mb-4">Program</h3>

            <ul className="space-y-3 text-lg text-gray-800">
              <li>UI/UX Design</li>
              <li>Web Development</li>
              <li>Data Science</li>
            </ul>
          </div>

          {/* Service */}
          <div>
            <h3 className="font-bold text-xl mb-4">Service</h3>

            <ul className="space-y-3 text-lg text-gray-800">
              <li>Features</li>
              <li>About</li>
              <li>Pricing</li>
              <li>Blog</li>
            </ul>
          </div>

          {/* Policy */}
          <div>
            <h3 className="font-bold text-xl mb-4">Policy</h3>

            <ul className="space-y-3 text-lg text-gray-800">
              <li>Privacy Policy</li>
              <li>Cookie Policy</li>
              <li>Acceptable Use Policy</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-xl mb-4">Kontak Kami</h3>

            <ul className="space-y-3 text-lg text-gray-800">
              <li>consult@.com</li>
              <li>Bekasi, Indonesia</li>
              <li>(+62) 811 2345 6789</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-500 my-10"></div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Social Media */}
          <div className="flex gap-4">
            <a href="#" className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition"
            >
              <FaFacebookF size={18} />
            </a>

            <a
              href="#"
              className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition"
            >
              <FaInstagram size={18} />
            </a>

            <a
              href="#"
              className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition"
            >
              <FaXTwitter size={18} />
            </a>

            <a
              href="#"
              className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition"
            >
              <FaLinkedinIn size={18} />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-gray-800 text-center md:text-right">
            Bagas Arya Wijaya. © 2026
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;