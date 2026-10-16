import Navbar from "../Navbar";
import Hero from "../Hero";
import Notice from "../Notice";
import About from "../About";
import Contact from "../Contact";
import Feedback from "../Feedback";
import Footer from "../Footer";
import CyberBackground from "../../../components/common/CyberBackground";

function Landing() {
  return (
    <div className="cyber-page">
      <CyberBackground />

      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Notice />
        <About />
        <Feedback />
        <Contact />
        <Footer />
      </div>
    </div>
  );
}

export default Landing;
