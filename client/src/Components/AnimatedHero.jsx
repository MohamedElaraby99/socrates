import React, { useState, useEffect } from 'react';
import { FaPlay, FaGraduationCap, FaLightbulb } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import character from '../assets/character.webp';

const AnimatedHero = ({ onGetStarted }) => {
  const [darkMode, setDarkMode] = useState(false);
  const user = useSelector((state) => state.auth.data);

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setDarkMode(isDark);
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

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
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Hero Section - Character as Main Focus */}
        <div className="text-center mb-16">
          <div>
            {/* Main Character - Central Focus */}
            <div className="flex justify-center mb-12">
              <div>
                <div className="relative">
                  {/* Character Container */}
                  <div className="relative">
                    <img
                      src={character} 
                      alt="4G Platform Character" 
                      className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Title Section */}
            <div className="mt-2">
              {/* Main Title - Egyptian Style */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8" style={{color: darkMode ? '#60a5fa' : '#2563eb'}}>
                منصة سنتر سقراط
              </h1>
              
              {/* Subtitle - Egyptian Accent */}
              <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
                <FaLightbulb className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" style={{color: '#2563eb'}} />
                <p className="text-2xl md:text-3xl lg:text-4xl font-medium" style={{color: darkMode ? '#e5e7eb' : '#333333'}}>
                   منصة تعليم لطلبة المرحلة الابتدائية والإعدادية والثانوية ومعاهد التمريض
                </p>
                <FaGraduationCap className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" style={{color: '#2563eb'}} />
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-5xl mx-auto">
          <div>
            {/* Description */}
            <div className="text-center mb-10">
              <div className="relative">
                <p className="text-lg md:text-xl lg:text-2xl leading-relaxed max-w-4xl mx-auto p-6 rounded-2xl shadow-lg" style={{
                  color: darkMode ? '#e5e7eb' : '#333333',
                  background: darkMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid #2563eb'
                }}>
                         بنقدملك شروحات تفاعلية حلوة، فيديوهات تعليمية ممتعة، امتحانات متنوعة، ومذكرات PDF عشان تتفوق في الدراسة وتخش الجامعة اللي نفسك فيها.
                </p>
                {/* Trust Badges - Egyptian Style */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <span className="px-4 py-2 text-sm md:text-base rounded-full border" style={{
                    background: darkMode ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                    color: '#2563eb',
                    borderColor: '#2563eb'
                  }}>مطابق للمنهج المصري 100%</span>
                  <span className="px-4 py-2 text-sm md:text-base rounded-full border" style={{
                    background: darkMode ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                    color: '#2563eb',
                    borderColor: '#2563eb'
                  }}>تمارين وامتحانات تفاعلية </span>
                  <span className="px-4 py-2 text-sm md:text-base rounded-full border" style={{
                    background: darkMode ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                    color: '#2563eb',
                    borderColor: '#2563eb'
                  }}>مذكرات مراجعة PDF مجاناً</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="text-center mb-8 flex items-center justify-center gap-4 flex-wrap mt-8">
              <Link
                to="/courses"
                className="px-10 py-5 md:px-12 md:py-6 font-bold rounded-full text-lg md:text-xl hover:shadow-xl transition-all flex items-center gap-3"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                  color: '#FFFFFF',
                  border: '2px solid #2563eb'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
              >
                <FaPlay style={{color: '#FFFFFF'}} /> يلا بينا نبدأ المذاكرة دلوقتي!
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnimatedHero;
