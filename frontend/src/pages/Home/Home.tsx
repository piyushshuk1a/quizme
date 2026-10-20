import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { Footer } from '@/components';
import {
  Categories,
  Features,
  GetStarted,
  HeroSection,
  HowItWorks,
} from '@/containers';

export const Home = () => {
  const { hash } = useLocation();

  // Scroll to in-page anchors (e.g. the "Features" navbar link) since
  // client-side navigation does not do this automatically.
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  return (
    <>
      <HeroSection />
      <Features />
      <Categories />
      <HowItWorks />
      <GetStarted />
      <Footer />
    </>
  );
};
