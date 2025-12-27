import HeroSection from '../components/HeroSection';
import ProblemSection from '../components/ProblemSection';
import HowItWorks from '../components/HowItWorks';

const LandingPage = () => {
  return (
    <div className="pt-16">
      <HeroSection />
      <ProblemSection />
      <HowItWorks />
    </div>
  );
};

export default LandingPage;
