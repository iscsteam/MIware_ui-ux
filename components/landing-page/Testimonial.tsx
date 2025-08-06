// "use client"
// import { useState, useEffect } from "react";
// import { Quote } from "lucide-react";

// const Testimonial = () => {
//   const [isVisible, setIsVisible] = useState(false);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsVisible(true);
//     }, 2000);

//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <section className="py-16 px-6 bg-muted/20">
//       <div className="max-w-4xl mx-auto text-center">
//         <div 
//           className={`transition-all duration-1000 ${
//             isVisible 
//               ? 'opacity-100 translate-y-0' 
//               : 'opacity-0 translate-y-8'
//           }`}
//         >
//           <Quote className="w-12 h-12 text-primary mx-auto mb-6" />
          
//           <blockquote className="font-inter text-2xl md:text-3xl text-foreground font-medium mb-6 italic">
//             "Mi-Ware tripled our deployment speed and transformed how we handle customer data. 
//             Their custom analytics dashboard gave us insights we never knew we needed."
//           </blockquote>
          
//           <cite className="font-poppins text-lg text-muted-foreground font-semibold">
//             {/* Operations Lead, South African Retail Group */}
//           </cite>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Testimonial;

"use client"
import { useState, useEffect } from "react";
import { Quote } from "lucide-react";

interface TestimonialData {
  quote: string;
  author: string;
  title: string;
}

const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const testimonials: TestimonialData[] = [
    {
      quote: "miWare transformed our data integration from a 3-week engineering bottleneck into a 4-hour self-service workflow. Our business analysts now deploy complex pipelines independently—it's revolutionary.",
      author: "Sarah Chen",
      title: "VP of Data Engineering, FinTech Innovations Ltd"
    },
    {
      quote: "With miWare's event-driven architecture, we went from reactive reporting to real-time business intelligence. The platform paid for itself in the first quarter through operational efficiency gains alone.",
      author: "Marcus Weber",
      title: "Chief Data Officer, Global Manufacturing Corp"
    },
    {
      quote: "miWare didn't just improve our data pipelines—it fundamentally changed how we compete. We now launch data products in days, not months. Our time-to-market advantage is unprecedented.",
      author: "James Rodriguez",
      title: "Chief Technology Officer, E-commerce Innovations"
    },
    {
      quote: "miWare's cloud-native architecture handles our 10TB daily processing loads effortlessly. The real-time observability gave us confidence to scale without fear—we've never looked back.",
      author: "Dr. Priya Patel",
      title: "Head of Analytics, Healthcare Systems International"
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 8000); // Change testimonial every 8 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className="py-16 px-6 bg-muted/20">
      <div className="max-w-4xl mx-auto text-center">
        <div 
          className={`transition-all duration-1000 ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          <Quote className="w-12 h-12 text-primary mx-auto mb-6" />
          
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <blockquote className="font-inter text-2xl md:text-3xl text-foreground font-medium mb-6 italic min-h-[120px] md:min-h-[100px] flex items-center justify-center">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  <cite className="font-poppins text-lg text-muted-foreground font-semibold">
                    {testimonial.author}, {testimonial.title}
                  </cite>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center space-x-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? "bg-primary"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;