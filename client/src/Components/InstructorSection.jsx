import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFeaturedInstructors } from '../Redux/Slices/InstructorSlice';
import { getCoursesByInstructor } from '../Redux/Slices/CourseSlice';
import { FaGraduationCap, FaStar, FaUsers, FaBook, FaClock, FaLinkedin, FaTwitter, FaFacebook, FaWhatsapp, FaTimes, FaAward, FaArrowRight, FaEye, FaSort, FaFilter } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { generateImageUrl } from "../utils/fileUtils";
import { placeholderImages } from "../utils/placeholderImages";

const InstructorSection = () => {
  const dispatch = useDispatch();
  const { featuredInstructors, loading } = useSelector((state) => state.instructor);
  const { instructorCourses, instructorCoursesLoading } = useSelector((state) => state.course);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const [sortBy, setSortBy] = useState('created');
  const [sortOrder, setSortOrder] = useState('1');
  const [showSortOptions, setShowSortOptions] = useState(false);

  useEffect(() => {
    dispatch(getFeaturedInstructors({ sortBy, sortOrder }));
  }, [dispatch, sortBy, sortOrder]);

  const handleSortChange = (newSortBy, newSortOrder = '-1') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setShowSortOptions(false);
  };

  // Close sort options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSortOptions && !event.target.closest('.sort-dropdown')) {
        setShowSortOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSortOptions]);

  const getCurrentSortLabel = () => {
    switch (sortBy) {
      case 'name':
        return sortOrder === '1' ? 'الاسم (أ-ي)' : 'الاسم (ي-أ)';
      case 'rating':
        return 'التقييم (الأعلى أولاً)';
      case 'students':
        return 'عدد الطلاب (الأكثر أولاً)';
      case 'experience':
        return 'الخبرة (الأكثر أولاً)';
      case 'created':
        return sortOrder === '1' ? 'الأقدم أولاً' : 'الأحدث أولاً';
      case 'featured':
      default:
        return 'المميزون أولاً';
    }
  };

  const handleInstructorClick = (instructor) => {
    setSelectedInstructor(instructor);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInstructor(null);
    setShowCourses(false);
  };

  const handleShowCourses = (instructor) => {
    setSelectedInstructor(instructor);
    setShowCourses(true);
    // Use courses directly from instructor object instead of separate API call
    // dispatch(getCoursesByInstructor(instructor._id));
  };

  const handleImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = placeholderImages.avatar;
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`text-sm ${i <= rating ? 'text-blue-400' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <section className="py-20 bg-white dark:bg-gray-900" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-6">
            تعلم من أفضل الخبراء
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              مدرسونا المميزون لديهم خبرة واسعة ونهج تعليمي متميز لضمان تجربة تعليمية استثنائية
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
                <div className="w-full h-48 bg-gray-300 dark:bg-gray-600 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-20 bg-white dark:bg-gray-900" dir="rtl">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-6">
              تعلم من أفضل الخبراء
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              مدرسونا المميزون لديهم خبرة واسعة ونهج تعليمي متميز لضمان تجربة تعليمية استثنائية
            </p>
          </div>

       

          {/* Instructors Grid - Professional Compact Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredInstructors.map((instructor, index) => (
              <div
                key={instructor._id}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer"
                onClick={() => handleInstructorClick(instructor)}
              >
                {/* Compact Instructor Photo */}
                <div className="relative w-full aspect-square bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 overflow-hidden flex items-center justify-center">
                  {instructor.profileImage?.secure_url ? (
                    <img
                      src={generateImageUrl(instructor.profileImage.secure_url)}
                      alt={instructor.name || instructor.fullName}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={handleImgError}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaGraduationCap className="text-blue-300 dark:text-blue-600 text-5xl" />
                    </div>
                  )}
                  
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Card Content - Compact */}
                <div className="p-4">
                  {/* Instructor Name - Compact */}
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {instructor.name || instructor.fullName}
                  </h3>
                  
                  {/* Role/Specialization - Minimal Badge */}
                  <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-3">
                    <FaGraduationCap className="text-xs" />
                    <span className="line-clamp-1">{instructor.specialization}</span>
                  </div>
                  
                  {/* Stats Row */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-1">
                      <FaBook className="text-blue-500" />
                      <span>{instructor.courses?.length || 0} دورة</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(5).slice(0, 1)}
                      <span className="font-medium text-gray-700 dark:text-gray-300">5.0</span>
                    </div>
                  </div>

                  {/* Action Button - Professional */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowCourses(instructor);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <FaEye className="text-sm" />
                    <span>عرض الملف الشخصي</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* View All Instructors Button */}
          <div className="text-center mt-16">
            <Link
              to="/instructors"
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 hover:from-blue-600 hover:via-blue-700 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
            >
              عرض جميع المدرسين
              <FaGraduationCap className="mr-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Instructor Profile Modal */}
      {showModal && selectedInstructor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} dir="rtl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">الملف الشخصي للمدرس</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Instructor Header */}
              <div className="text-center mb-8">
                {selectedInstructor.profileImage?.secure_url ? (
                  <div className="w-28 h-28 rounded-xl bg-gray-100 dark:bg-gray-700 mx-auto mb-4 overflow-hidden flex items-center justify-center ring-1 ring-gray-200 dark:ring-gray-600">
                    <img
                      src={generateImageUrl(selectedInstructor.profileImage.secure_url)}
                      alt={selectedInstructor.name}
                      className="max-w-full max-h-full object-contain"
                      onError={handleImgError}
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-200 dark:bg-gray-600 rounded-xl flex items-center justify-center mx-auto mb-4 border-4 border-gray-200 dark:border-gray-600 shadow-lg">
                    <FaGraduationCap className="text-gray-400 dark:text-gray-500 text-4xl" />
                  </div>
                )}
                
                <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  {selectedInstructor.name}
                </h3>
                
                <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full font-semibold mb-4">
                  <FaGraduationCap className="ml-2" />
                  {selectedInstructor.specialization}
                </div>

                {/* Rating */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  {renderStars( 5)}
                  <span className="text-gray-600 dark:text-gray-400 font-semibold">
                    ({ 5})
                  </span>
                </div>
              </div>

              {/* Bio */}
              {selectedInstructor.bio && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">نبذة عن المدرس</h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-right">
                    {selectedInstructor.bio}
                  </p>
                </div>
              )}

              {/* Education */}
              {selectedInstructor.education && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">المؤهل العلمي</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-right">
                    {selectedInstructor.education}
                  </p>
                </div>
              )}

              {/* Social Links */}
              {(() => {
                                 const hasSocialLinks = (
                   (selectedInstructor.socialLinks?.linkedin && selectedInstructor.socialLinks.linkedin.trim() !== '') ||
                   (selectedInstructor.socialLinks?.twitter && selectedInstructor.socialLinks.twitter.trim() !== '') ||
                   (selectedInstructor.socialLinks?.facebook && selectedInstructor.socialLinks.facebook.trim() !== '') ||
                   (selectedInstructor.socialLinks?.whatsapp && selectedInstructor.socialLinks.whatsapp.trim() !== '')
                 );
                
                if (!hasSocialLinks) return null;
                
                return (
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">روابط التواصل</h4>
                    <div className="flex items-center justify-center gap-4">
                      {selectedInstructor.socialLinks?.linkedin && selectedInstructor.socialLinks.linkedin.trim() !== '' && (
                        <a
                          href={selectedInstructor.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          <FaLinkedin className="text-sm" />
                        </a>
                      )}
                      {selectedInstructor.socialLinks?.twitter && selectedInstructor.socialLinks.twitter.trim() !== '' && (
                        <a
                          href={selectedInstructor.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          <FaTwitter className="text-sm" />
                        </a>
                      )}
                                             {selectedInstructor.socialLinks?.facebook && selectedInstructor.socialLinks.facebook.trim() !== '' && (
                         <a
                           href={selectedInstructor.socialLinks.facebook}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white rounded-full flex items-center justify-center transition-colors"
                         >
                           <FaFacebook className="text-sm" />
                         </a>
                       )}
                      {selectedInstructor.socialLinks?.whatsapp && selectedInstructor.socialLinks.whatsapp.trim() !== '' && (
                        <a
                          href={`https://wa.me/${selectedInstructor.socialLinks.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          <FaWhatsapp className="text-sm" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Featured Badge */}
              {selectedInstructor.featured && (
                <div className="text-center mb-6">
                  <div className="inline-flex items-center bg-gradient-to-r from-blue-400 to-blue-500 text-white px-6 py-3 rounded-full font-bold">
                    <FaAward className="ml-2" />
                    مدرس مميز
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructor Courses Modal */}
      {showCourses && selectedInstructor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} dir="rtl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                دورات {selectedInstructor.name}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Modal Content - Professional Compact Design */}
            <div className="p-6">
              {selectedInstructor.courses && selectedInstructor.courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedInstructor.courses.map((course) => (
                    <div key={course._id} className="group bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-300 overflow-hidden">
                      {/* Course Image */}
                      {course.image?.secure_url ? (
                        <div className="relative w-full h-32 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                          <img
                            src={generateImageUrl(course.image.secure_url)}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={handleImgError}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                          
                      
                        </div>
                      ) : (
                        <div className="relative w-full h-32 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                          <FaBook className="text-blue-300 dark:text-blue-600 text-4xl" />
                          <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-blue-600 dark:text-blue-400">
                            {course.subject?.title || 'غير محدد'}
                          </div>
                        </div>
                      )}
                      
                      {/* Course Content */}
                      <div className="p-4">
                        {/* Course Title */}
                        <h3 className="text-base font-bold text-gray-800 dark:text-white mb-2 line-clamp-2 min-h-[3rem]">
                          {course.title}
                        </h3>
                    
                        
                        {/* Action Button */}
                        <Link
                          to={`/courses/${course._id}`}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          <FaEye className="text-sm" />
                          <span>عرض الدورة</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaBook className="text-blue-500 dark:text-blue-400 text-3xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    لا توجد دورات متاحة
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    لم يقم هذا المدرس بإنشاء أي دورات بعد
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstructorSection; 
