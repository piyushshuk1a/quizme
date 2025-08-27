import { Footer } from '@/components';
import { Categories, Features, GetStarted, HeroSection } from '@/containers';

export const Home = () => {
  return (
    <>
      <HeroSection />
      <Features />
      <Categories />
      <GetStarted />
      <Footer />
    </>
  );
};
