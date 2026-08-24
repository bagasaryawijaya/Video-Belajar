import icon1 from '../assets/MonitorPlay.png'
import icon2 from '../assets/Person.png'
import icon3 from '../assets/KeyOpen.png'
import icon4 from '../assets/Certificate.png'


const ChooseUs = () => {
  return (
    <div className="choose-us bg-green-400 py-16 lg:py-24">
        {/* Judul */}
        <h2 className="text-3xl lg:text-5xl font-bold text-center mb-20">
          Kenapa Memilih Kami?
        </h2>

        {/* Content */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto px-5">
          {/* Item 1: Pembelajaran Interaktif */}
          <div className="choose-item1 flex flex-col items-center text-center">
            <div className="choose-icon">
              <img src={icon1} alt="" className="monitor-play"/>
            </div>
          <p className="choose-text">Pembelajaran<br />Interaktif</p>
          </div>

          {/* Item 2: Instruktur Berpengalaman */}
          <div className="choose-item2 flex flex-col items-center text-center">
            <div className="choose-icon">
              <img src={icon2} alt="" className="logo-google"/>
            </div>
            <p className="choose-text">Instruktur<br />Berpengalaman</p>
          </div>

          {/* Item 3: Akses Seumur Hidup */}
          <div className="choose-item3 flex flex-col items-center text-center">
            <div className="choose-icon">
              <img src={icon3} alt="" className="logo-google"/>
            </div>
            <p className="choose-text">Akses Seumur Hidup</p>
          </div>

          {/* Item 4: Sertifikat Terverifikasi */}
          <div className="choose-item4 flex flex-col items-center text-center">
            <div className="choose-icon">
              <img src={icon4} alt="" className="logo-google"/>
            </div>
            <p className="choose-text">Sertifikat Terverifikasi</p>
          </div>

        </div>
      </div>
  )
}

export default ChooseUs
