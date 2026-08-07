

const OurClass = () => {
  const courses = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
      title: "Big 4 Auditor Financial Analyst",
      description: "Mulai transformasi dengan instruktur profesional, harga yang terjangkau, dan kurikulum terbaik.",
      instructor: "Jenna Ortega",
      role: "Senior Accountant di Gojek",
      rating: 5,
      reviews: 86,
      price: "Rp 300K",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
      title: "UI/UX Design Bootcamp",
      description: "Belajar UI/UX dari dasar hingga mahir bersama mentor profesional.",
      instructor: "John Ali",
      role: "UI Designer",
      rating: 4.5,
      reviews: 64,
      price: "Rp 400K",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
      title: "Fullstack Web Development",
      description: "Bangun aplikasi modern menggunakan React dan Node.js.",
      instructor: "Bambang",
      role: "Senior Developer",
      rating: 4.8,
      reviews: 91,
      price: "Rp 500K",
    },
  ];

  const renderStars = (rating) => {
    const filled = Math.round(rating);
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < filled ? "text-yellow-400 text-xs" : "text-gray-300 text-xs"}>★</span>
    ));
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-slate-800">
            Koleksi Video Pembelajaran Unggulan
          </h2>
          <p className="mt-3 text-gray-500 text-sm lg:text-lg">
            Jelajahi Dunia Pengetahuan Melalui Pilihan Kami!
          </p>
        </div>

        <div className="mt-10">
          <div className="hidden lg:flex justify-center">
            <div className="bg-gray-100 rounded-full p-2 flex gap-2">
              <button className="bg-white rounded-full px-8 py-3 shadow font-medium">Semua Kelas</button>
              <button className="px-8 py-3">UI/UX Design</button>
              <button className="px-8 py-3">Web Development</button>
              <button className="px-8 py-3">Data Science</button>
            </div>
          </div>

          <div className="lg:hidden overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 w-max">
              <button className="bg-white border rounded-full px-5 py-2 shadow">Semua Kelas</button>
              <button className="bg-gray-100 rounded-full px-5 py-2">UI/UX Design</button>
              <button className="bg-gray-100 rounded-full px-5 py-2">Web Development</button>
              <button className="bg-gray-100 rounded-full px-5 py-2">Data Science</button>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {courses.map((course)=>(
            <div key={course.id} className="bg-white border rounded-2xl shadow-sm hover:shadow-lg overflow-hidden">
              <div className="flex lg:hidden p-3 gap-3">
                <img src={course.image} alt="" className="w-32 h-28 rounded-xl object-cover"/>
                <div className="flex-1">
                  <h3 className="font-semibold line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <img src={`https://i.pravatar.cc/100?img=${course.id}`} className="w-8 h-8 rounded-full"/>
                    <div>
                      <p className="text-xs font-semibold">{course.instructor}</p>
                      <p className="text-[10px] text-gray-500">{course.role}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <div>
                      <div className="flex">{renderStars(course.rating)}</div>
                      <p className="text-[10px] text-gray-500">{course.rating} ({course.reviews})</p>
                    </div>
                    <p className="font-bold text-green-500">{course.price}</p>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block">
                <img src={course.image} alt="" className="w-full h-56 object-cover"/>
                <div className="p-5">
                  <h3 className="text-xl font-bold">{course.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">{course.description}</p>
                  <div className="flex items-center gap-3 mt-5">
                    <img src={`https://i.pravatar.cc/100?img=${course.id}`} className="w-12 h-12 rounded-full"/>
                    <div>
                      <p className="font-semibold">{course.instructor}</p>
                      <p className="text-sm text-gray-500">{course.role}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-6">
                    <div>
                      <div className="flex">{renderStars(course.rating)}</div>
                      <p className="text-sm text-gray-500">{course.rating} ({course.reviews})</p>
                    </div>
                    <p className="text-2xl font-bold text-green-500">{course.price}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-16">
          <button className="bg-green-500 hover:bg-green-600 text-white px-10 py-4 rounded-xl font-semibold">
            Lihat Semua Program
          </button>
        </div>
      </div>
    </section>
  );
};

export default OurClass;