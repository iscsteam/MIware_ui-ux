// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { LoginPage } from '@/components/auth/loginpage';
// import { LoadingScreen } from '@/components/auth/loading-screen';
// import { ThemeProvider } from '@/components/theme-provider';

// interface User {
//   id: number;
//   email: string;
//   name: string;
//   unique_client_id: string;
//   role: string;
//   is_active: boolean;
// }

// export default function HomePage() {
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();

//   const handleLogin = (userData: User) => {
//     localStorage.setItem('userCredentials', JSON.stringify(userData));
//     setIsLoading(true);
//     router.push('/dashboard');
//   };

//   const handleLoadingComplete = () => {
//     setIsLoading(false);
//   };

//   useEffect(() => {
//     const savedCredentials = localStorage.getItem('userCredentials');
//     if (savedCredentials) {
//       router.push('/dashboard');
//     }
//   }, [router]);

//   if (isLoading) {
//     return (
//       <ThemeProvider defaultTheme="light" storageKey="workflow-theme">
//         <LoadingScreen onLoadingComplete={handleLoadingComplete} />
//       </ThemeProvider>
//     );
//   }

//   return (
//     <ThemeProvider defaultTheme="light" storageKey="workflow-theme">
//       <LoginPage onLogin={handleLogin} />
//     </ThemeProvider>
//   );
// };

// export default Index;


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