import React, { useEffect, useState } from "react";
import { FaBars, FaHome, FaUser, FaGraduationCap, FaBlog, FaQuestionCircle, FaSignOutAlt, FaPlus, FaList, FaInfoCircle, FaPhone, FaHistory, FaLightbulb, FaRocket, FaSearch } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../Redux/Slices/AuthSlice";
import logo from "../assets/logo.png";
import useScrollToTop from "../Helpers/useScrollToTop";
import CourseNotifications from "./CourseNotifications";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "light" ? false : true
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const { data: user, role } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Use scroll to top utility
  useScrollToTop();

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const toggleMenu = () => {
    // Trigger the Sidebar drawer instead of mobile menu
    const drawerToggle = document.getElementById('sidebar-drawer');
    
    if (drawerToggle) {
      console.log("Navbar burger clicked - toggling drawer");
      drawerToggle.checked = !drawerToggle.checked;
    } else {
      console.log("Drawer element not found");
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      // Focus the search input when opening
      setTimeout(() => {
        const searchInput = document.getElementById('course-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  };


  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Build search URL with user stage filter if user is logged in
      let searchUrl = `/courses?search=${encodeURIComponent(searchQuery.trim())}`;
      
      // Add user stage filter if user is logged in and has a stage
      if (user?.fullName && user?.stage?.name) {
        searchUrl += `&userStage=${encodeURIComponent(user.stage.name)}`;
      }
      
      // Navigate to courses page with search query
      window.location.href = searchUrl;
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Debounce search to avoid too many API calls
    const timeout = setTimeout(() => {
      if (query.trim().length > 1) {
        searchCourses(query.trim());
      } else {
        setSearchResults([]);
      }
    }, 300); // 300ms delay
    
    setSearchTimeout(timeout);
  };

  const searchCourses = async (query) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Build search URL with user stage filter if user is logged in
      let searchUrl = `${import.meta.env.VITE_REACT_APP_API_URL}/search/courses?q=${encodeURIComponent(query)}&limit=10`;
      
      // Add user stage filter if user is logged in and has a stage
      if (user?.fullName && user?.stage?.name) {
        searchUrl += `&userStage=${encodeURIComponent(user.stage.name)}`;
      }
      
      // Use the new search API
      const response = await fetch(searchUrl);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.data?.courses || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching courses:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCourseSelect = (course) => {
    // Navigate directly to the course
    window.location.href = `/courses/${course._id}`;
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsMenuOpen(false);
  };

  const handleLogoClick = () => {
    // Navigate to home page and scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const element = document.querySelector("html");
    element.classList.remove("light", "dark");
    if (darkMode) {
      element.classList.add("dark");
      element.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      element.classList.add("light");
      element.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Set dark mode as default on first load
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const element = document.querySelector("html");
    
    if (!savedTheme) {
      setDarkMode(true);
      localStorage.setItem("theme", "dark");
      element.setAttribute("data-theme", "dark");
    } else {
      element.setAttribute("data-theme", savedTheme);
    }
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setIsMenuOpen(false);
      }
      if (isSearchOpen && !event.target.closest('.search-container')) {
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };

    if (isMenuOpen || isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isSearchOpen]);

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const menuItems = [
    { name: "الرئيسية", path: "/", icon: FaHome },
    { name: "الكورسات ", path: "/subjects", icon: FaGraduationCap },
    { name: "الدورات", path: "/courses", icon: FaList },
    
    { name: "المدونة", path: "/blogs", icon: FaBlog },
    { name: "الأسئلة والأجوبة", path: "/qa", icon: FaQuestionCircle },
    { name: "تاريخ الامتحانات", path: "/exam-history", icon: FaHistory },
    { name: "حول", path: "/about", icon: FaInfoCircle },
    { name: "اتصل بنا", path: "/contact", icon: FaPhone },
  ];

  const adminMenuItems = [
    { name: "لوحة التحكم", path: "/admin", icon: FaUser },
    
    { name: "إدارة المستخدمين", path: "/admin/users", icon: FaUser },
    { name: "إدارة المدونة", path: "/admin/blogs", icon: FaBlog },
    { name: "إدارة الأسئلة والأجوبة", path: "/admin/qa", icon: FaQuestionCircle },
    { name: "إدارة المواد", path: "/admin/subjects", icon: FaGraduationCap },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0.5">
                 <div className="flex justify-between items-center h-20 md:h-24">
          {/* Modern Logo */}
                     <Link to="/" onClick={handleLogoClick} className="flex items-center space-x-2 md:space-x-4 group logo-hover">
        
            <div className="relative">
              {/* Logo Image */}
                             <img 
                 src={logo} 
                 alt="منصة  سنتر سقراط" 
                 className="w-16 h-16 md:w-20 md:h-20 object-contain group-hover:scale-110 transition-transform duration-300 dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] dark:group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"
               />
            </div>
          
          </Link>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button 
              className="theme-toggle p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={toggleDarkMode}
              title="Toggles light & dark" 
              aria-label="auto" 
              aria-live="polite"
            >
              <svg className="sun-and-moon" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
                <mask className="moon" id="moon-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  <circle cx="24" cy="10" r="6" fill="black" />
                </mask>
                <circle className="sun" cx="12" cy="12" r="6" mask="url(#moon-mask)" fill="currentColor" />
                <g className="sun-beams" stroke="currentColor">
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </g>
              </svg>
            </button>

            {/* Sign Up Button - ONLY show when NO user is logged in */}
            {!user?.fullName && (
              <Link
                to="/signup"
                className="inline-flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl text-xs md:text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 border"
                style={{
                  background: 'linear-gradient(90deg, #2563eb 0%, #bfdbfe 100%)',
                  borderColor: '#2563eb'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(90deg, #bfdbfe 0%, #2563eb 100%)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(90deg, #2563eb 0%, #bfdbfe 100%)';
                }}
              >
                <FaPlus className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">اعمل حساب</span>
                <span className="sm:hidden">اعمل حساب</span>
              </Link>
            )}

            {!user?.fullName && (
              <Link
                to="/login"
                className="inline-flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl text-xs md:text-sm font-semibold border-2 transition-all duration-300 shadow-md hover:shadow-xl"
                style={{
                  borderColor: '#2563eb',
                  color: '#2563eb'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(90deg, #2563eb 0%, #bfdbfe 100%)';
                  e.target.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#2563eb';
                }}
              >
                <FaUser className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">تسجيل الدخول</span>
                <span className="sm:hidden">دخول</span>
              </Link>
            )}

            {/* Menu Button - Visible on all devices */}
            <div className="flex items-center space-x-3">  
              {/* Search Button - Visible for all users */}
              <button
                onClick={toggleSearch}
                className="p-2.5 md:p-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 102, 0, 0.1) 0%, rgba(181, 30, 0, 0.1) 100%)',
                  borderColor: '#2563eb'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(255, 102, 0, 0.2) 0%, rgba(181, 30, 0, 0.2) 100%)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(255, 102, 0, 0.1) 0%, rgba(181, 30, 0, 0.1) 100%)';
                }}
              >
                <FaSearch className="w-4 h-4 md:w-5 md:h-5" style={{color: '#2563eb'}} />
              </button>

              {/* Course Notifications - ONLY show when user is logged in */}
              {user?.fullName && <CourseNotifications />}
              
              {/* Burger Menu Button - ONLY show when user is logged in */}
              {user?.fullName && (
                <button
                  onClick={toggleMenu}
                  className="p-2.5 md:p-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 102, 0, 0.1) 0%, rgba(181, 30, 0, 0.1) 100%)',
                    borderColor: '#2563eb'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, rgba(255, 102, 0, 0.2) 0%, rgba(181, 30, 0, 0.2) 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, rgba(255, 102, 0, 0.1) 0%, rgba(181, 30, 0, 0.1) 100%)';
                  }}
                >
                  <FaBars className="w-4 h-4 md:w-5 md:h-5" style={{color: '#2563eb'}} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search Dropdown - Show when search is open */}
        {isSearchOpen && (
          <div className="search-container absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    id="course-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="ابحث عن الكورس اللي نفسك فيه..."
                    className="w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    style={{
                      background: darkMode ? '#374151' : '#ffffff',
                      color: darkMode ? '#ffffff' : '#1f2937',
                      borderColor: '#2563eb'
                    }}
                    dir="rtl"
                  />
                  <FaSearch 
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    style={{color: '#2563eb'}}
                  />
                  {isSearching && (
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="px-4 py-3 rounded-xl font-semibold transition-all duration-300 border-2"
                  style={{
                    borderColor: '#2563eb',
                    color: '#2563eb'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #2563eb 0%, #bfdbfe 100%)';
                    e.target.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#2563eb';
                  }}
                >
                  إلغاء
                </button>
              </div>
              
              {/* Search Results */}
              {searchQuery.length > 1 && (
                <div className="mt-4 max-h-64 overflow-y-auto">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-600 dark:text-gray-400">جاري البحث...</span>
                      </div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                        النتائج ({searchResults.length})
                      </p>
                      {searchResults.map((course) => (
                        <button
                          key={course._id}
                          onClick={() => handleCourseSelect(course)}
                          className="w-full text-right p-4 rounded-xl border transition-all duration-300 hover:shadow-lg"
                          style={{
                            background: darkMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                            borderColor: darkMode ? '#4b5563' : '#e5e7eb',
                            color: darkMode ? '#e5e7eb' : '#1f2937'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = darkMode ? 'rgba(255, 102, 0, 0.1)' : 'rgba(255, 102, 0, 0.05)';
                            e.target.style.borderColor = '#2563eb';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = darkMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.8)';
                            e.target.style.borderColor = darkMode ? '#4b5563' : '#e5e7eb';
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {course.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                  {course.subject?.name || 'عام'}
                                </span>
                                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                  {course.stage?.name || 'جميع المراحل'}
                                </span>
                              </div>
                            </div>
                            <FaGraduationCap className="w-6 h-6 text-blue-500 ml-3" />
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FaGraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400">
                        مفيش كورسات مطابقة للبحث "{searchQuery}"
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        جرب كلمات مختلفة مثل: رياضيات، فيزياء، كيمياء، عربي، انجليزي
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
                        أو تحقق من الإملاء
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Menu - Enhanced Design */}
        <div
          className={`md:hidden mobile-menu-container transition-all duration-500 ease-in-out overflow-hidden ${
            isMenuOpen
              ? "max-h-screen opacity-100 visible"
              : "max-h-0 opacity-0 invisible"
          }`}
        >
          <div className="py-8 space-y-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            {/* Navigation Links */}
            <div className="space-y-3">
              <div className="px-6 py-3">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  التنقل
                </p>
              </div>
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-4 px-6 py-4 mx-4 rounded-2xl font-medium transition-all duration-300 mobile-menu-item ${
                    location.pathname === item.path
                      ? "shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  style={location.pathname === item.path ? {
                    color: '#2563eb',
                    background: 'linear-gradient(90deg, rgba(255, 102, 0, 0.1) 0%, rgba(181, 30, 0, 0.1) 100%)'
                  } : {}}
                  onMouseEnter={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.color = '#2563eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.color = '';
                    }
                  }}
                >
                  <div className={`p-3 rounded-xl shadow-lg`} style={location.pathname === item.path ? {
                    background: 'linear-gradient(90deg, rgba(255, 102, 0, 0.2) 0%, rgba(181, 30, 0, 0.2) 100%)'
                  } : {
                    background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 100%)'
                  }}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="font-semibold">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* User Menu Items */}
            {user && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="px-6 py-4 mx-4 rounded-2xl shadow-lg" style={{background: 'linear-gradient(90deg, rgba(255, 102, 0, 0.1) 0%, rgba(181, 30, 0, 0.1) 100%)'}}>
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl" style={{background: 'linear-gradient(90deg, #2563eb 0%, #bfdbfe 100%)'}}>
                        <span className="text-white font-bold text-lg">
                          {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white text-lg">
                          {user.fullName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user.email}
                        </p>
                        <p className="text-xs font-semibold uppercase tracking-wider" style={{color: '#2563eb'}}>
                          {user.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Menu */}
                {user.role === "ADMIN" && (
                  <div className="space-y-3">
                    <div className="px-6 py-3">
                      <p className="text-xs font-bold uppercase tracking-wider" style={{color: '#2563eb'}}>
                        لوحة الإدارة
                      </p>
                    </div>
                    {adminMenuItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center space-x-4 px-6 py-4 mx-4 rounded-2xl font-medium transition-all duration-300 mobile-menu-item ${
                          location.pathname === item.path
                            ? "shadow-lg"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                        style={location.pathname === item.path ? {
                          color: '#2563eb',
                          background: 'linear-gradient(90deg, rgba(255, 102, 0, 0.1) 0%, rgba(181, 30, 0, 0.1) 100%)'
                        } : {}}
                        onMouseEnter={(e) => {
                          if (location.pathname !== item.path) {
                            e.target.style.color = '#2563eb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (location.pathname !== item.path) {
                            e.target.style.color = '';
                          }
                        }}
                      >
                        <div className={`p-3 rounded-xl shadow-lg`} style={location.pathname === item.path ? {
                          background: 'linear-gradient(90deg, rgba(255, 102, 0, 0.2) 0%, rgba(181, 30, 0, 0.2) 100%)'
                        } : {
                          background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 100%)'
                        }}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className="font-semibold">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* User Actions */}
                <div className="space-y-3">
                  <div className="px-6 py-3">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      الحساب
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-4 px-6 py-4 mx-4 rounded-2xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 mobile-menu-item"
                    onMouseEnter={(e) => {
                      e.target.style.color = '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '';
                    }}
                  >
                    <div className="p-3 rounded-xl shadow-lg" style={{background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 100%)'}}>
                      <FaUser className="w-5 h-5" />
                    </div>
                    <span className="font-semibold">الملف الشخصي</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-4 px-6 py-4 mx-4 rounded-2xl font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 transition-all duration-300 w-full text-left mobile-menu-item"
                  >
                    <div className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30">
                      <FaSignOutAlt className="w-5 h-5" />
                    </div>
                    <span className="font-semibold">تسجيل الخروج</span>
                  </button>
                </div>
              </>
            )}

            {/* Guest Actions */}
            {!user && (
              <div className="space-y-4 px-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    انضم إلينا الآن
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ابدأ رحلة التعلم مع منصة  سنتر سقراط
                  </p>
                </div>
                
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 text-center text-white rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 mobile-menu-item shadow-lg hover:shadow-xl border-2"
                  style={{
                    background: 'linear-gradient(90deg, #2563eb 0%, #bfdbfe 100%)',
                    borderColor: '#2563eb'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(90deg, #bfdbfe 0%, #2563eb 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'linear-gradient(90deg, #2563eb 0%, #bfdbfe 100%)';
                  }}
                >
                  <FaUser className="w-4 h-4" />
                  تسجيل الدخول
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 text-center border-2 rounded-xl font-semibold text-sm transition-all duration-300 mobile-menu-item shadow-lg hover:shadow-xl"
                  style={{
                    borderColor: '#2563eb',
                    color: '#2563eb'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(90deg, #2563eb 0%, #bfdbfe 100%)';
                    e.target.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#2563eb';
                  }}
                >
                  <FaPlus className="w-4 h-4" />
                  إنشاء حساب جديد
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

