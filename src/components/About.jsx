const About = () => {
  return (
    <div className="about bg-white py-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Statistik */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 text-center mb-24">
            <div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black">
              2<span className="text-green-500">+</span>
              </h2>
              <p className="mt-4 text-gray-500 text-lg">
              Years of experience
              </p>
            </div>

          <div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black">
              5<span className="text-green-500">+</span>
              </h2>
              <p className="mt-4 text-gray-500 text-lg">
                Program
              </p>
          </div>

          <div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black">
            1<span className="text-green-500">k</span>
            </h2>
            <p className="mt-4 text-gray-500 text-lg">
              Students worldwide
            </p>
          </div>

          <div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black">
            90<span className="text-green-500">%</span>
            </h2>
            <p className="mt-4 text-gray-500 text-lg">
              Student satisfactions
            </p>
          </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

      {/* Text */}
      <div>
        <span className="text-gray-500 text-xl">
          About us
        </span>

        <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-gray-900">
          Platform E-Learning untuk
          <br />
          Keterampilan Digital
        </h2>

        <p className="mt-6 text-lg text-gray-500 leading-8 max-w-lg">
          Lorem ipsum dolor sit amet consectetur. Porttitor scelerisque odio
          bibendum scelerisque massa fermentum. Purus lacus velit tincidunt
          consectetur.
        </p>

        <button type="button" className="mt-10 bg-green-500 hover:bg-green-600 transition text-white font-semibold px-10 py-4 rounded-xl shadow-sm">
          Pelajari lebih lanjut
        </button>
      </div>

      {/* Image */}
      <div>
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop"
          alt="About Us"
          className="w-full h-72 sm:h-96 lg:h-100 object-cover rounded-3xl"
        />
      </div>

    </div>
        </div>
      </div>
  )
}

export default About
