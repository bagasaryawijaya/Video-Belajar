
import ChooseUs from "../components/ChooseUs";
import Hero from "../components/Hero";
import About from "../components/About";
import OurClass from "../components/OurClass";
import Testimony from "../components/Testimony";

const Homepage = () => {
  return (
    <div className="home">
      {/* Hero */}
      <Hero />

      {/* Choose Us */}
      <ChooseUs />

      {/* About Us */}
      <About />

      {/* Our Class */}
      <OurClass />

      {/* Testimony */}
      <Testimony />
    </div>
  );
};

export default Homepage;

