import Hero from "@/components/Hero";
import ChatInterface from "@/components/ChatInterface";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Hero />
      <ChatInterface />
      <Footer />
    </div>
  );
};

export default Index;
