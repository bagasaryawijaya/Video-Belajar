import man from '../assets/Sample Man.png'
import man2 from '../assets/hafid-ardiansyah.jpg'
import women from '../assets/leandra-ayudhia.jpg'

import student1 from '../assets/student1.png'
import student2 from '../assets/student2.png'
import student3 from '../assets/student3.png'
import student4 from '../assets/student4.png'

import logo1 from '../assets/Google Logotype.png'
import logo2 from '../assets/Canva Logotype.png'
import logo3 from '../assets/Amazon.png'
import logo4 from '../assets/Sketch Logotype.png'

const Hero = () => {
  return (
    // Hero
    <div className="container max-w-6xl mx-auto px-4 lg:px-6 py-16 lg:py-20">
      <div className="grid lg:grid-cols-2 gap-14 items-center">

        {/* ================= LEFT ================= */}
        <div className="">

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-6xl font-bold leading-tight text-slate-800">
            Kuasai Keterampilan Digital dengan Mudah!
          </h1>

          {/* Description */}
          <p className="mt-5 text-gray-500 text-base lg:text-lg leading-8 max-w-xl">
            Raih penguasaan digital dengan mudah! Jelajahi dan tingkatkan
            keterampilan Anda melalui platform kami yang ramah pengguna.
          </p>

          {/* ===== Mobile Instructor Card ===== */}
          <div className="block lg:hidden mt-12">
            {/* ↑ mt-8 menjadi mt-12 agar jarak lebih jauh dari teks */}

            <div className="bg-white rounded-2xl shadow-lg p-5">

              <h3 className="font-bold text-lg mb-4">
                Instruktur Berpengalaman
              </h3>

              <div className="space-y-4">

                <div className="flex items-center gap-3">
                  <img
                    src={women}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                  />

                  <div>
                    <h4 className="font-semibold">Leandra Ayudhia</h4>
                    <p className="text-sm text-gray-500">
                      UI/UX Design
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={man2}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                  />

                  <div>
                    <h4 className="font-semibold">Hafid Ardiansyah</h4>
                    <p className="text-sm text-gray-500">
                      Web Development
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Hero Image Mobile */}
          <div className="flex justify-center lg:hidden mt-20">
            {/* ↑ mt-8 menjadi mt-20 agar jarak card ↔ gambar lumayan jauh */}
            <img
              src={man}
              alt=""
              className="w-72 object-contain"
            />
          </div>

          {/* Students */}
          <div className="flex items-center gap-5 mt-10">

            <div className="hidden lg:block w-1 h-24 bg-green-500 rounded-full"></div>

            <div>

              <h3 className="font-semibold text-xl lg:text-2xl mb-4">
                Total Students
              </h3>

              <div className="flex items-center">

                <img
                  src={student1}
                  className="w-12 h-12 rounded-full border-2 border-white"
                  alt=""
                />

                <img
                  src={student2}
                  className="w-12 h-12 rounded-full border-2 border-white -ml-3"
                  alt=""
                />

                <img
                  src={student3}
                  className="w-12 h-12 rounded-full border-2 border-white -ml-3"
                  alt=""
                />

                <img
                  src={student4}
                  className="w-12 h-12 rounded-full border-2 border-white -ml-3"
                  alt=""
                />

                <div className="-ml-3 w-12 h-12 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-white text-sm font-bold">
                  2K+
                </div>

              </div>

            </div>

          </div>

          {/* Button */}
          <div className="hidden lg:flex gap-5 mt-10">

            <button type="button" className="bg-green-500 hover:bg-green-600 transition text-white px-8 py-4 rounded-xl font-semibold">
              Start Learning
            </button>

            <button type="button" className="border border-green-500 px-8 py-4 rounded-xl hover:bg-green-500 hover:text-white transition">
              Learn More
            </button>

          </div>

          {/* Trusted */}
          <div className="mt-14">

            <h4 className="font-semibold text-gray-600 mb-5">
              Trusted by
            </h4>

            <div className="flex flex-wrap gap-8 items-center">

              <img src={logo1} alt="" className="h-7" />
              <img src={logo2} alt="" className="h-7" />
              <img src={logo3} alt="" className="h-7" />
              <img src={logo4} alt="" className="h-7" />

            </div>

          </div>

        </div>

        {/* ================= RIGHT ================= */}
        <div className="hidden lg:flex justify-center relative order-2">

          {/* Card Instructor – tetap di atas tapi gambar dibuat turun jauh */}
          <div className="absolute top-0 left-0 bg-white rounded-2xl shadow-xl p-6 w-80 z-10">

            <h3 className="font-bold text-xl mb-5">
              Instruktur Berpengalaman
            </h3>

            <div className="space-y-5">

              <div className="flex items-center gap-4">

                <img
                  src={women}
                  className="w-12 h-12 rounded-full object-cover"
                  alt=""
                />

                <div>

                  <h4 className="font-semibold">
                    Leandra Ayudhia
                  </h4>

                  <p className="text-sm text-gray-500">
                    UI/UX Design
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-4">

                <img
                  src={man2}
                  className="w-12 h-12 rounded-full object-cover"
                  alt=""
                />

                <div>

                  <h4 className="font-semibold">
                    Hafid Ardiansyah
                  </h4>

                  <p className="text-sm text-gray-500">
                    Web Development
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* Hero Image – mt-24 diganti mt-80 agar jarak card ↔ gambar sangat jauh */}
          <img
            src={man}
            alt=""
            className="w-80 mt-80 object-contain"
          />

        </div>

      </div>
    </div>
  )
}

export default Hero