import React, { useEffect, useState } from 'react';
import { FaArrowRight, FaPlay, FaStar, FaUsers, FaGraduationCap, FaAward, FaRocket, FaGlobe, FaFlask, FaAtom, FaMicroscope, FaLightbulb } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import character from '../assets/character.webp';

const AnimatedHero = ({ onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const user = useSelector((state) => state.auth.data);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setDarkMode(isDark);
    };

    // Check initially
    checkDarkMode();

    // Watch for changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

 
  const buttonText = 'ابدأ المذاكرة دلوقتي';

  const handleExploreCourses = () => {
    // Navigate to courses page
    window.location.href = '/courses';
  };

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden" 
      dir="rtl" 
      style={{
        background: darkMode 
          ? 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #1f2937 100%)'
          : 'linear-gradient(135deg, #eff6ff 0%, #FFFFFF 50%, #dbeafe 100%)'
      }}
    >
      {/* Thunder & Ice Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Electric Blue Lightning Effects */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-1/4 w-1 h-32 bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-60 animate-pulse" style={{
            filter: 'drop-shadow(0 0 10px #60a5fa)',
            animation: 'lightning 3s ease-in-out infinite'
          }}></div>
          <div className="absolute top-20 right-1/3 w-1 h-24 bg-gradient-to-b from-transparent via-cyan-300 to-transparent opacity-50 animate-pulse animation-delay-2000" style={{
            filter: 'drop-shadow(0 0 8px #67e8f9)'
          }}></div>
        </div>

        {/* Ice Crystal Shapes */}
        <div className="absolute top-1/4 right-10 w-32 h-32 opacity-20 animate-float">
          <div className="w-full h-full" style={{
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)',
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            filter: 'drop-shadow(0 0 20px #bfdbfe)'
          }}></div>
        </div>
        
        <div className="absolute bottom-1/4 left-10 w-24 h-24 opacity-20 animate-float animation-delay-2000">
          <div className="w-full h-full" style={{
            background: 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 50%, #60a5fa 100%)',
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            filter: 'drop-shadow(0 0 15px #93c5fd)'
          }}></div>
        </div>

        {/* Thunder Blue Glow */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl" style={{
          background: 'radial-gradient(circle, #2563eb 0%, #1e40af 40%, transparent 70%)',
          animation: 'pulse 4s ease-in-out infinite'
        }}></div>
        
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl animation-delay-2000" style={{
          background: 'radial-gradient(circle, #bfdbfe 0%, #dbeafe 40%, transparent 70%)',
          animation: 'pulse 5s ease-in-out infinite'
        }}></div>

        {/* Electric Particles */}
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-70 animate-pulse" style={{
          boxShadow: '0 0 10px #60a5fa, 0 0 20px #60a5fa'
        }}></div>
        <div className="absolute top-2/3 left-1/3 w-3 h-3 bg-cyan-300 rounded-full opacity-60 animate-pulse animation-delay-2000" style={{
          boxShadow: '0 0 15px #67e8f9, 0 0 25px #67e8f9'
        }}></div>
        <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-blue-500 rounded-full opacity-80 animate-pulse animation-delay-4000" style={{
          boxShadow: '0 0 12px #3b82f6, 0 0 22px #3b82f6'
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Hero Section - Character as Main Focus */}
        <div className="text-center mb-16">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
            {/* Main Character - Central Focus */}
            <div className="flex justify-center mb-12">
              <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="relative">
                  {/* Character Background Effect - Enhanced */}
                  <div className="absolute inset-0 rounded-full blur-3xl opacity-40 animate-pulse" style={{background: 'linear-gradient(135deg, #2563eb 0%, #bfdbfe 50%, #2563eb 100%)'}}></div>
                  
                  {/* Character Container - Larger and More Prominent */}
                  <div className="relative">
                    <img
                      src={character} 
                      alt="4G Platform Character" 
                      className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain drop-shadow-2xl animate-float"
                      style={{
                        filter: 'drop-shadow(0 20px 40px rgba(37, 99, 235, 0.4))'
                      }}
                    />
                  </div>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-24 md:w-32 lg:w-40 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-pulse" style={{
                    background: 'linear-gradient(to right, transparent 0%, #2563eb 20%, #2563eb 80%, transparent 100%)',
                    boxShadow: '0 0 10px rgba(37, 99, 235, 0.6)'
                  }}></div>
                </div>
              </div>
            </div>
            
            {/* Title Section - Enhanced */}
            <div className="mt-2">
              {/* Main Title - Egyptian Style */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8" style={{color: darkMode ? '#ffffff' : '#1f2937'}}>
                أهلاً وسهلاً في منصة سنتر سقراط
              </h1>
              
              {/* Subtitle - Egyptian Accent */}
              <div className="mt-6 flex items-center justify-center gap-4">
                <FaLightbulb className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" style={{color: '#2563eb'}} />
                <p className="text-2xl md:text-3xl lg:text-4xl font-medium" style={{color: darkMode ? '#e5e7eb' : '#333333'}}>
                  منصة تعليم مصرية لطلبة الإعدادي والثانوي
                </p>
                <FaGraduationCap className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" style={{color: '#2563eb'}} />
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-5xl mx-auto">
          <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
         
            {/* Description */}
            <div className="text-center mb-10">
              <div className="relative">
                <p className="text-lg md:text-xl lg:text-2xl leading-relaxed max-w-4xl mx-auto p-6 rounded-2xl backdrop-blur-sm shadow-lg" style={{
                  color: darkMode ? '#e5e7eb' : '#333333',
                  background: darkMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid #2563eb'
                }}>
                  منصة تعليم مصرية  لطلبة الإعدادي والثانوي! بنقدملك شروحات تفاعلية حلوة، فيديوهات تعليمية ممتعة، امتحانات متنوعة، ومذكرات PDF عشان تتفوق في الدراسة وتخش الجامعة اللي نفسك فيها.
                </p>
                {/* Trust Badges - Egyptian Style */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <span className="px-3 py-1 text-sm md:text-base rounded-full border" style={{
                    background: darkMode ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                    color: '#2563eb',
                    borderColor: '#2563eb'
                  }}>مطابق للمنهج المصري 100%</span>
                  <span className="px-3 py-1 text-sm md:text-base rounded-full border" style={{
                    background: darkMode ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                    color: '#2563eb',
                    borderColor: '#2563eb'
                  }}>تمارين وامتحانات تفاعلية </span>
                  <span className="px-3 py-1 text-sm md:text-base rounded-full border" style={{
                    background: darkMode ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                    color: '#2563eb',
                    borderColor: '#2563eb'
                  }}>مذكرات مراجعة PDF مجاناً</span>
                </div>
              </div>
            </div>

            {/* Connection Line from Character to Button */}
            <div className="relative flex justify-center mb-8">
              {/* Animated Connection Line */}
              <div className="relative w-1 h-16 md:h-20 bg-gradient-to-b from-transparent via-orange-400 to-blue-600 rounded-full animate-pulse" style={{
                background: 'linear-gradient(to bottom, transparent 0%, rgba(37, 99, 235, 0.3) 30%, rgba(37, 99, 235, 0.8) 70%, #2563eb 100%)',
                boxShadow: '0 0 10px rgba(37, 99, 235, 0.5)'
              }}>
                {/* Floating dots along the line */}
                <div className="absolute top-1/4 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{
                  left: '-0.5px',
                  background: '#2563eb',
                  boxShadow: '0 0 8px rgba(37, 99, 235, 0.8)'
                }}></div>
                <div className="absolute top-1/2 w-2 h-2 bg-blue-400 rounded-full animate-bounce animation-delay-2000" style={{
                  left: '-0.5px',
                  background: '#2563eb',
                  boxShadow: '0 0 8px rgba(37, 99, 235, 0.8)'
                }}></div>
                <div className="absolute top-3/4 w-2 h-2 bg-blue-400 rounded-full animate-bounce animation-delay-4000" style={{
                  left: '-0.5px',
                  background: '#2563eb',
                  boxShadow: '0 0 8px rgba(37, 99, 235, 0.8)'
                }}></div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="text-center mb-8 flex items-center justify-center gap-4 flex-wrap">
              <Link
                to="/courses"
                className="px-10 py-5 md:px-12 md:py-6 font-bold rounded-full text-lg md:text-xl backdrop-blur hover:shadow-lg transition-all flex items-center gap-3 relative"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #bfdbfe 100%)',
                  color: '#FFFFFF',
                  border: '2px solid #2563eb',
                  boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #bfdbfe 0%, #2563eb 100%)';
                  e.target.style.boxShadow = '0 0 30px rgba(37, 99, 235, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #2563eb 0%, #bfdbfe 100%)';
                  e.target.style.boxShadow = '0 0 20px rgba(37, 99, 235, 0.4)';
                }}
              >
                {/* Button connection point */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-400 rounded-full animate-pulse" style={{
                  background: '#2563eb',
                  boxShadow: '0 0 15px rgba(37, 99, 235, 0.8)'
                }}></div>
                <FaPlay style={{color: '#FFFFFF'}} /> يلا بنا نبدأ المذاكرة دلوقتي!
              </Link>
            </div>

           
          </div>
        </div>
      </div>

      {/* Additional Floating Elements */}
      <div className="absolute bottom-10 right-10 animate-float">
        <div className="w-3 h-3 md:w-4 md:h-4 rounded-full opacity-30" style={{background: '#2563eb'}}></div>
      </div>
      <div className="absolute top-10 left-10 animate-float animation-delay-4000">
        <div className="w-4 h-4 md:w-6 md:h-6 rounded-full opacity-30" style={{background: '#4C4C4C'}}></div>
      </div>
    </section>
  );
};

export default AnimatedHero; 
