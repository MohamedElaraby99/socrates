import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaBookOpen, FaUsers, FaChartLine, FaCalendarAlt, FaVideo, FaFilePdf, FaClipboardList } from 'react-icons/fa';
import { axiosInstance } from '../../Helpers/axiosInstance.js';

const InstructorDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCourses: 0,
        totalStudents: 0,
        totalLessons: 0,
        totalExams: 0
    });

    const { user } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        fetchInstructorCourses();
    }, []);

    const fetchInstructorCourses = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/instructors/my-courses');
            
            if (response.data.success) {
                setCourses(response.data.data);
                
                // Calculate stats
                const totalLessons = response.data.data.reduce((acc, course) => {
                    const directLessons = course.directLessons ? course.directLessons.length : 0;
                    const unitLessons = course.units ? course.units.reduce((unitAcc, unit) => {
                        return unitAcc + (unit.lessons ? unit.lessons.length : 0);
                    }, 0) : 0;
                    return acc + directLessons + unitLessons;
                }, 0);

                const totalExams = response.data.data.reduce((acc, course) => {
                    const directExamLessons = course.directLessons ? course.directLessons.filter(lesson => lesson.exams && lesson.exams.length > 0) : [];
                    const unitExamLessons = course.units ? course.units.reduce((unitAcc, unit) => {
                        const unitExamLessons = unit.lessons ? unit.lessons.filter(lesson => lesson.exams && lesson.exams.length > 0) : [];
                        return unitAcc + unitExamLessons.length;
                    }, 0) : 0;
                    return acc + directExamLessons.length + unitExamLessons;
                }, 0);

                setStats({
                    totalCourses: response.data.data.length,
                    totalStudents: 0, // This would need to be calculated from enrollment data
                    totalLessons,
                    totalExams
                });
            }
        } catch (error) {
            console.error('Error fetching instructor courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getCourseStats = (course) => {
        const directLessons = course.directLessons ? course.directLessons.length : 0;
        const unitLessons = course.units ? course.units.reduce((acc, unit) => {
            return acc + (unit.lessons ? unit.lessons.length : 0);
        }, 0) : 0;
        const totalLessons = directLessons + unitLessons;

        const directExams = course.directLessons ? course.directLessons.filter(lesson => lesson.exams && lesson.exams.length > 0) : [];
        const unitExams = course.units ? course.units.reduce((acc, unit) => {
            const unitExamLessons = unit.lessons ? unit.lessons.filter(lesson => lesson.exams && lesson.exams.length > 0) : [];
            return acc + unitExamLessons.length;
        }, 0) : 0;
        const totalExams = directExams.length + unitExams;

        return { totalLessons, totalExams };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل البيانات...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            لوحة تحكم المدرب
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            مرحباً {user?.fullName}، يمكنك هنا عرض وإدارة الدورات المخصصة لك
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FaBookOpen className="h-8 w-8 text-purple-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                        إجمالي الدورات
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                                        {stats.totalCourses}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FaUsers className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                        إجمالي الطلاب
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                                        {stats.totalStudents}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FaVideo className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                        إجمالي الدروس
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                                        {stats.totalLessons}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FaClipboardList className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                        إجمالي الامتحانات
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                                        {stats.totalExams}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Courses List */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            الدورات المخصصة لك
                        </h2>
                    </div>
                    
                    <div className="p-6">
                        {courses.length === 0 ? (
                            <div className="text-center py-12">
                                <FaBookOpen className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                    لا توجد دورات مخصصة لك
                                </h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    اتصل بالمدير لإضافة دورات جديدة
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {courses.map((course) => {
                                    const courseStats = getCourseStats(course);
                                    return (
                                        <div key={course._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {course.title}
                                                </h3>
                                                {course.featured && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                        مميز
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                                {course.description || 'لا يوجد وصف متاح'}
                                            </p>
                                            
                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                    <FaVideo className="h-4 w-4 mr-2" />
                                                    <span>{courseStats.totalLessons} درس</span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                    <FaClipboardList className="h-4 w-4 mr-2" />
                                                    <span>{courseStats.totalExams} امتحان</span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                    <FaCalendarAlt className="h-4 w-4 mr-2" />
                                                    <span>منذ {formatDate(course.createdAt)}</span>
                                                </div>
                                            </div>
                                            
                                            {course.image && course.image.secure_url && (
                                                <div className="mt-4">
                                                    <img 
                                                        src={course.image.secure_url} 
                                                        alt={course.title}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructorDashboard;
