const Testimony = () => {
  // Data dummy untuk testimoni
  const testimonials = [
    {
      id: 1,
      name: "Rafi Ramdani",
      role: "UI-UX Research & Design",
      // Gunakan URL gambar asli Anda atau placeholder di sini
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      text: "Lorem ipsum dolor sit amet consectetur. Porttitor scelerisque odio bibendum scelerisque massa fermentum. Purus lacus velit tincidunt consectetur."
    },
    {
      id: 2,
      name: "Marlin Roslina",
      role: "Web Development",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      text: "Lorem ipsum dolor sit amet consectetur. Porttitor scelerisque odio bibendum scelerisque massa fermentum. Purus lacus velit tincidunt consectetur."
    },
    {
      id: 3,
      name: "Putri Erika",
      role: "Digital Marketing",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      text: "Lorem ipsum dolor sit amet consectetur. Porttitor scelerisque odio bibendum scelerisque massa fermentum. Purus lacus velit tincidunt consectetur."
    }
  ];

  return (
    // Section Background abu-abu muda sesuai gambar
    <section className="bg-[#f8f9fa] py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900">
            Alumni Testimoni
          </h2>
          
          {/* Garis hijau di bawah judul */}
          <div className="w-24 h-1 bg-green-500 rounded-full mx-auto mt-3 mb-5"></div>
          
          <p className="text-gray-500 max-w-4xl mx-auto text-sm sm:text-base leading-relaxed">
            Lorem ipsum dolor sit amet consectetur. Porttitor scelerisque odio bibendum scelerisque massa fermentum. Purus lacus velit tincidunt consectetur.
          </p>
        </div>

        {/* Grid Kartu Testimoni */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {testimonials.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] px-8 pb-10 pt-4 text-center relative"
            >
              {/* Avatar dengan negative margin agar keluar dari card */}
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg mx-auto -mt-14 mb-4"
              />
              
              <h3 className="text-xl font-bold text-gray-900 mt-2">
                {item.name}
              </h3>
              
              {/* Role / Bidang dengan warna salmon/merah muda */}
              <p className="text-rose-500 text-sm font-medium mb-4">
                {item.role}
              </p>
              
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                {item.text}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimony;