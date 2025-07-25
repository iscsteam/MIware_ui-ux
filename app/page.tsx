import Header from "@/components/Header/page";
import Hero from "@/components/landing-page/Hero";
import FeaturesGrid from "@/components/landing-page/FeaturesGrid";
import Carousel from "@/components/landing-page/Carousel";
import Testimonial from "@/components/landing-page/Testimonial";
import Footer from "@/components/Footer/page";
import CTABanner from "@/components/landing-page/CTABanner";

const Index = () => {
  return (
    <div className="relative">
      <Header />
      <main className="">
        {" "}
        {/* space for fixed header */}
        <Hero />
        <FeaturesGrid />
        <Carousel />
        <Testimonial />
        {/* <CTABanner /> */}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
