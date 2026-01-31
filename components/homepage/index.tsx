"use client";
import React from "react";
import { HeroSection } from "./HeroSection";
import { AudienceSection } from "./AudienceSection";
import { FeaturesSection } from "./FeatureSection";
import { BoatsSection } from "./BoatsSection";
import SectionDownloadApp from "./DownloadApp";

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <BoatsSection />
      <AudienceSection />
      <SectionDownloadApp />
    </div>
  );
};

export default HomePage;
