import ChooseUs from '../components/ChooseUs'
import Hero from '../components/Hero'
import About from '../components/About'
import OurClass from '../components/OurClass'
import Testimony from '../components/Testimony'

const Homepage = () => {
  return (
    
    <div className="home pt-20 lg:pt-28">
      {/* Hero */}
      <Hero/>

      {/* Choose Us */}
      <ChooseUs/>

      {/* About Us */}
      <About/>

      {/* Our Class */}
      <OurClass/>

      {/* Testimony */}
      <Testimony/>
      
    </div>
  )
}

export default Homepage