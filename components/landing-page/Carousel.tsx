"use client";
import { useState, useEffect } from "react";
import { StaticImageData } from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import analyticsImage from "@/public/analytics-slide-N-UhDbm-.jpg";
import logisticsImage from "@/public/logistics-slide.jpg";
import supportImage from "@/public/support-slide.jpg";

interface Slide {
  id: number;
  headline: string;
  overlayText: string;
  backgroundImage: StaticImageData;
}

const Carousel = () => {
  const slides: Slide[] = [
    {
      id: 1,
      headline: "Real-Time Observability & Monitoring",
      overlayText:
        "Built high-throughput Producer-Broker-Consumer architecture using RabbitMQ message queues and MongoDB for durable event storage",
      backgroundImage: analyticsImage,
    },
    {
      id: 2,
      headline: "DevOps & Infrastructure Excellence ",
      overlayText: " Managed entire platform using Helm for third-party applications and Kustomize for custom microservices with GitOps workflows",
      backgroundImage: logisticsImage,
    },
    {
      id: 3,
      headline: "Business Impact & Transformation",
      overlayText: " Reduced pipeline development time from weeks to hours (80% improvement) through configuration-driven approach ",
      backgroundImage: supportImage,
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPlaying, slides.length]);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section
      role="region"
      aria-label="Image Carousel"
      className="relative overflow-hidden"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      <div className="carousel-slide relative h-[600px] md:h-[700px] flex items-center justify-center text-center">
        <div
          className="carousel-bg absolute inset-0 w-full h-full transition-all duration-1000"
          style={{
            backgroundImage: `url(${slides[currentSlide].backgroundImage.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            transform: `scale(1.1) translateX(${currentSlide * -2}px)`,
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-transparent z-[5]" />

        <div className="carousel-content relative z-10 max-w-3xl mx-auto px-2">
          <h2 className="font-poppins font-bold text-4xl md:text-6xl text-white mb-6">
            {slides[currentSlide].headline}
          </h2>
          <p className="font-inter text-xl md:text-2xl text-white/90">
            {slides[currentSlide].overlayText}
          </p>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-300 backdrop-blur-sm z-20"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-300 backdrop-blur-sm z-20"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? "bg-white"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Carousel;
