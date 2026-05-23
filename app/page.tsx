import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Certifications from "@/components/Certifications";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="w-full min-w-0 max-w-[1440px] mx-auto overflow-hidden">
        <Hero />
        <Skills />
        <Projects />
        <Certifications />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
