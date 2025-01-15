"use client";
import { useState, useEffect } from "react";
import { data } from "@/types/main";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/skills/Skills";
import Projects from "@/components/projects/Projects";
import Socials from "@/components/Socials";
import Experiences from "@/components/experiences/Experiences";
import Contact from "@/components/Contact";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTopButton from "./ScrollToTop";
import Chatbot from "./Chatbot";

interface Props {
  data: data;
}

const HomePage = ({ data }: Props) => {
  const [showScroll, setShowScroll] = useState(false);

  const [chatVisible, setChatVisible] = useState(false);

  const toggleChat = () => {
    setChatVisible((prev) => !prev);
  };
  // Handle scroll event to show/hide the sticky hook
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  return (
    <>
      <Header logo={data.main.name} />
      <Hero mainData={data.main} />
      <Socials socials={data.socials} />
      <About aboutData={data.about} name={data.main.name} />
      <Skills skillData={data.skills} />
      <Projects projectsData={data.projects} />
      <Experiences
        experienceData={data.experiences}
        educationData={data.educations}
      />
      <Contact />
      <Footer socials={data.socials} name={data.main.name} />
      <ScrollToTopButton showScroll={showScroll} onClick={scrollToTop} />
      <Chatbot />
    </>
  );
};

export default HomePage;
