import Hero from "../components/Hero";
import ChooseUs from "../components/ChooseUs";
import About from "../components/About";
import OurClass from "../components/OurClass";
import Testimony from "../components/Testimony";



const Homepage = () => {
  return (
    <div className="home">

      {/* HERO */}
      <Hero />

      {/* CHOOSE US */}
      <ChooseUs />

      {/* ABOUT */}
      <About />

      {/* OUR CLASS */}
      <OurClass />

      {/* TESTIMONY */}
      <Testimony />

    </div>
  );
};

export default Homepage;