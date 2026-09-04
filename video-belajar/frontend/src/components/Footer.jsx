import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaXTwitter, FaLinkedinIn } from "react-icons/fa6";
import logo from "../assets/logo-video-belajar.png";

const Footer = () => {
  const programs = [
    ["UI/UX Design", "/courses?category=UI%2FUX%20Design"],
    ["Web Development", "/courses?category=Web%20Development"],
    ["Digital & Teknologi", "/courses?category=Digital%20%26%20Teknologi"],
    ["Bisnis Manajemen", "/courses?category=Bisnis%20Manajemen"],
  ];
  const services = [["Courses", "/courses"], ["Tentang Kami", "/about"], ["Blog", "/blog"], ["Profil", "/profile"]];
  const policies = [["Kebijakan Privasi", "/about#privacy"], ["Ketentuan Layanan", "/about#terms"], ["Bantuan", "/blog"]];

  return (
    <footer className="bg-[#DCE8D2] text-black">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link to="/"><img src={logo} alt="Video Belajar" className="h-10 w-auto object-contain sm:h-11" /></Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-gray-700">Belajar keterampilan digital melalui materi yang praktis, terstruktur, dan relevan dengan kebutuhan dunia kerja.</p>
          </div>
          <FooterGroup title="Program" items={programs} />
          <FooterGroup title="Service" items={services} />
          <FooterGroup title="Policy" items={policies} />
          <div>
            <h3 className="mb-4 text-xl font-bold">Kontak Kami</h3>
            <ul className="space-y-3 text-sm leading-6 text-gray-800 sm:text-base">
              <li><a href="mailto:hello@videobelajar.com" className="hover:text-green-600">hello@videobelajar.com</a></li>
              <li>Malang, Indonesia</li>
              <li><a href="tel:+6281123456789" className="hover:text-green-600">+62 811 2345 6789</a></li>
            </ul>
          </div>
        </div>
        <div className="my-10 border-t border-gray-400/70" />
        <div className="flex flex-col-reverse items-center justify-between gap-7 md:flex-row">
          <p className="text-center text-sm text-gray-700 md:text-left">Video Belajar. © 2026 All Rights Reserved.</p>
          <div className="flex gap-3">
            {[{label:"Facebook",icon:<FaFacebookF/>,href:"https://facebook.com"},{label:"Instagram",icon:<FaInstagram/>,href:"https://instagram.com"},{label:"X",icon:<FaXTwitter/>,href:"https://x.com"},{label:"LinkedIn",icon:<FaLinkedinIn/>,href:"https://linkedin.com"}].map((item)=><a key={item.label} href={item.href} target="_blank" rel="noreferrer" aria-label={item.label} className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-black transition hover:bg-black hover:text-white">{item.icon}</a>)}
          </div>
        </div>
      </div>
    </footer>
  );
};

function FooterGroup({ title, items }) {
  return <div><h3 className="mb-4 text-xl font-bold">{title}</h3><ul className="space-y-3 text-sm text-gray-800 sm:text-base">{items.map(([label,to])=><li key={label}><Link to={to} className="hover:text-green-600">{label}</Link></li>)}</ul></div>;
}

export default Footer;
