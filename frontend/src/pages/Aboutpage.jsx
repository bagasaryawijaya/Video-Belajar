import { FiBookOpen, FiBriefcase, FiCheckCircle, FiCompass, FiGlobe, FiLayers, FiPlayCircle, FiUsers } from "react-icons/fi";

const visionItems = [
  { icon: FiGlobe, title: "Akses Belajar untuk Semua", description: "Menjadi platform pembelajaran digital yang mudah diakses kapan saja dan dari mana saja oleh siapa pun yang ingin berkembang." },
  { icon: FiBookOpen, title: "Materi yang Relevan", description: "Menyediakan video dan materi pembelajaran yang praktis, terstruktur, dan mengikuti kebutuhan keterampilan di dunia profesional." },
  { icon: FiBriefcase, title: "Siap untuk Dunia Kerja", description: "Membantu peserta membangun kompetensi yang dapat diterapkan melalui studi kasus, latihan, dan pembelajaran berbasis praktik." },
  { icon: FiUsers, title: "Belajar Bersama Mentor", description: "Menghubungkan peserta dengan tutor dan praktisi berpengalaman agar proses belajar lebih terarah dan kontekstual." },
];

const missionItems = [
  { icon: FiPlayCircle, title: "Pembelajaran Berkualitas", description: "Menghadirkan video pembelajaran yang jelas, ringkas, dan mudah dipahami dengan struktur materi yang terukur." },
  { icon: FiLayers, title: "Materi Terstruktur", description: "Menyusun materi dari tingkat dasar hingga lanjutan sehingga peserta dapat belajar secara bertahap tanpa merasa kewalahan." },
  { icon: FiCompass, title: "Mendorong Perkembangan", description: "Memberikan pengalaman belajar yang mendorong peserta untuk terus meningkatkan kemampuan dan membangun portofolio." },
  { icon: FiCheckCircle, title: "Berorientasi pada Hasil", description: "Mengutamakan praktik dan evaluasi agar pengetahuan yang diperoleh dapat digunakan untuk kebutuhan akademik maupun profesional." },
];

function InfoCard({ item }) {
  const Icon = item.icon;
  return (
    <article className="rounded-2xl bg-white p-6 text-justify shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md sm:p-7">
      <div className="flex flex-col items-center justify-center text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-500 ring-1 ring-green-100"><Icon size={26} /></div>
      <h3 className="mt-5 text-center text-lg font-bold text-gray-900">{item.title}</h3></div>
      <p className="mt-3 text-sm leading-6 text-gray-500">{item.description}</p>
    </article>
  );
}

export default function Aboutpage() {
  return (
    <main className="min-h-screen bg-[#f5f6f8] pt-16 text-gray-900 lg:pt-[72px]">
      <section className="border-b border-green-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-2 lg:items-center lg:px-10">
          <h1 className="text-center text-3xl font-bold tracking-tight sm:text-4xl lg:text-left lg:text-5xl">About Video Belajar</h1>
          <p className="text-justify text-sm leading-7 text-gray-500 sm:text-base">Video Belajar adalah platform pembelajaran online yang membantu siapa pun mempelajari keterampilan baru melalui video dan materi pembelajaran yang praktis. Kami menggabungkan materi terstruktur, tutor profesional, dan latihan yang relevan agar proses belajar terasa sederhana, fleksibel, dan bermanfaat untuk kebutuhan dunia nyata.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Visi Kami</h2>
          <p className="mt-4 text-sm leading-6 text-gray-500 sm:text-base">Membangun ekosistem pembelajaran digital yang terpercaya, terjangkau, dan relevan sehingga setiap peserta memiliki kesempatan untuk berkembang dan siap menghadapi perubahan dunia kerja.</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">{visionItems.map((item) => <InfoCard key={item.title} item={item} />)}</div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Misi Kami</h2>
            <p className="mt-4 text-sm leading-6 text-gray-500 sm:text-base">Mengembangkan platform video pembelajaran yang mengutamakan kualitas materi, pengalaman belajar yang mudah, dan keterampilan yang dapat langsung diterapkan.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">{missionItems.map((item) => <InfoCard key={item.title} item={item} />)}</div>
        </div>
      </section>
    </main>
  );
}
