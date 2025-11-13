import Course from '../models/course.model.js';
import Subject from '../models/subject.model.js';
import Stage from '../models/stage.model.js';
import User from '../models/user.model.js';

// Search courses with advanced filtering
const searchCourses = async (req, res) => {
  try {
    const { q, subject, stage, userStage, limit = 10, page = 1 } = req.query;
    
    // Build search query
    let query = {};
    
    // Text search across multiple fields with Arabic normalization
    if (q && q.trim()) {
      const searchTerm = q.trim();
      
      // Create normalized search patterns for better Arabic matching
      const normalizeArabic = (text) => {
        return text
          .replace(/أ|إ|آ/g, 'ا') // Normalize alef variations
          .replace(/ة/g, 'ه')     // Normalize ta marbuta
          .replace(/ى/g, 'ي')     // Normalize alif maqsura
          .replace(/ؤ/g, 'و')     // Normalize waw with hamza
          .replace(/ئ/g, 'ي')     // Normalize ya with hamza
          .replace(/ء/g, '')      // Remove hamza
          .replace(/\s+/g, ' ')   // Normalize spaces
          .trim();
      };
      
      const normalizedTerm = normalizeArabic(searchTerm);
      const originalTerm = searchTerm;
      
      // Create multiple search patterns
      const searchPatterns = [
        originalTerm,
        normalizedTerm,
        // Add variations for common Arabic words
        searchTerm.replace('ه', 'ة'), // ta marbuta variation
        searchTerm.replace('ة', 'ه'), // ha variation
        searchTerm.replace('ي', 'ى'), // alif maqsura variation
        searchTerm.replace('ى', 'ي'), // ya variation
      ].filter((pattern, index, arr) => arr.indexOf(pattern) === index); // Remove duplicates
      
      // Build regex pattern that matches any of the variations
      const regexPattern = searchPatterns.map(pattern => 
        pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
      ).join('|');
      
      query.$or = [
        { title: { $regex: regexPattern, $options: 'i' } },
        { description: { $regex: regexPattern, $options: 'i' } },
        { content: { $regex: regexPattern, $options: 'i' } },
        // Also search in populated fields
        { 'subject.name': { $regex: regexPattern, $options: 'i' } },
        { 'stage.name': { $regex: regexPattern, $options: 'i' } },
        { 'instructor.fullName': { $regex: regexPattern, $options: 'i' } }
      ];
    }
    
    // Subject filter
    if (subject) {
      const subjectObj = await Subject.findOne({ 
        name: { $regex: subject, $options: 'i' } 
      });
      if (subjectObj) {
        query.subject = subjectObj._id;
      }
    }
    
    // Stage filter
    if (stage) {
      const stageObj = await Stage.findOne({ 
        name: { $regex: stage, $options: 'i' } 
      });
      if (stageObj) {
        query.stage = stageObj._id;
      }
    }
    
    // User stage filter - when user is logged in, filter by their stage
    if (userStage) {
      const userStageObj = await Stage.findOne({ 
        name: { $regex: userStage, $options: 'i' } 
      });
      if (userStageObj) {
        query.stage = userStageObj._id;
      }
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute search with population
    const courses = await Course.find(query)
      .populate('subject', 'name')
      .populate('stage', 'name')
      .populate('instructor', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalCount = await Course.countDocuments(query);
    
    // Transform results to include search relevance
    const results = courses.map(course => {
      const courseObj = course.toObject();
      
      // Add search relevance score with Arabic normalization
      let relevanceScore = 0;
      if (q && q.trim()) {
        const searchTerm = q.toLowerCase().trim();
        const title = (course.title || '').toLowerCase();
        const description = (course.description || '').toLowerCase();
        const subjectName = (course.subject?.name || '').toLowerCase();
        const stageName = (course.stage?.name || '').toLowerCase();
        const instructorName = (course.instructor?.fullName || '').toLowerCase();
        
        // Normalize Arabic text for better matching
        const normalizeArabic = (text) => {
          return text
            .replace(/أ|إ|آ/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي')
            .replace(/ؤ/g, 'و')
            .replace(/ئ/g, 'ي')
            .replace(/ء/g, '');
        };
        
        const normalizedSearchTerm = normalizeArabic(searchTerm);
        const normalizedTitle = normalizeArabic(title);
        const normalizedDescription = normalizeArabic(description);
        const normalizedSubject = normalizeArabic(subjectName);
        const normalizedStage = normalizeArabic(stageName);
        const normalizedInstructor = normalizeArabic(instructorName);
        
        // Score based on matches (higher score = more relevant)
        if (normalizedTitle.includes(normalizedSearchTerm)) relevanceScore += 15;
        if (normalizedDescription.includes(normalizedSearchTerm)) relevanceScore += 8;
        if (normalizedSubject.includes(normalizedSearchTerm)) relevanceScore += 12;
        if (normalizedStage.includes(normalizedSearchTerm)) relevanceScore += 10;
        if (normalizedInstructor.includes(normalizedSearchTerm)) relevanceScore += 6;
        
        // Boost score for exact matches and starts with
        if (normalizedTitle === normalizedSearchTerm) relevanceScore += 25;
        if (normalizedTitle.startsWith(normalizedSearchTerm)) relevanceScore += 20;
        if (normalizedSubject === normalizedSearchTerm) relevanceScore += 18;
        if (normalizedSubject.startsWith(normalizedSearchTerm)) relevanceScore += 15;
        if (normalizedStage === normalizedSearchTerm) relevanceScore += 16;
        if (normalizedStage.startsWith(normalizedSearchTerm)) relevanceScore += 13;
        
        // Also check original text without normalization
        if (title.includes(searchTerm)) relevanceScore += 5;
        if (title === searchTerm) relevanceScore += 10;
        if (title.startsWith(searchTerm)) relevanceScore += 8;
      }
      
      courseObj.relevanceScore = relevanceScore;
      return courseObj;
    });
    
    // Sort by relevance score (highest first)
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: {
        courses: results,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalResults: totalCount,
          hasNextPage: skip + parseInt(limit) < totalCount,
          hasPrevPage: parseInt(page) > 1
        },
        searchQuery: q || '',
        filters: {
          subject: subject || null,
          stage: stage || null,
          userStage: userStage || null
        }
      }
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing search',
      error: error.message
    });
  }
};

// Get search suggestions/autocomplete
const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(200).json({
        success: true,
        data: {
          suggestions: [],
          courses: [],
          subjects: []
        }
      });
    }
    
    const searchTerm = q.trim();
    
    // Get course suggestions with Arabic normalization
    const normalizeArabic = (text) => {
      return text
        .replace(/أ|إ|آ/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/ؤ/g, 'و')
        .replace(/ئ/g, 'ي')
        .replace(/ء/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };
    
    const normalizedTerm = normalizeArabic(searchTerm);
    const originalTerm = searchTerm;
    
    // Create multiple search patterns for suggestions
    const searchPatterns = [
      originalTerm,
      normalizedTerm,
      searchTerm.replace('ه', 'ة'),
      searchTerm.replace('ة', 'ه'),
      searchTerm.replace('ي', 'ى'),
      searchTerm.replace('ى', 'ي'),
    ].filter((pattern, index, arr) => arr.indexOf(pattern) === index);
    
    const regexPattern = searchPatterns.map(pattern => 
      pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    ).join('|');
    
    const courseSuggestions = await Course.find({
      $or: [
        { title: { $regex: regexPattern, $options: 'i' } },
        { description: { $regex: regexPattern, $options: 'i' } },
        { 'subject.name': { $regex: regexPattern, $options: 'i' } }
      ]
    })
    .populate('subject', 'name')
    .select('title description subject')
    .limit(5);
    
    // Get subject suggestions with Arabic normalization
    const subjectSuggestions = await Subject.find({
      name: { $regex: regexPattern, $options: 'i' }
    })
    .select('name')
    .limit(5);
    
    // Get stage suggestions with Arabic normalization
    const stageSuggestions = await Stage.find({
      name: { $regex: regexPattern, $options: 'i' }
    })
    .select('name')
    .limit(5);
    
    res.status(200).json({
      success: true,
      data: {
        suggestions: [
          ...courseSuggestions.map(c => ({ type: 'course', text: c.title, description: c.description })),
          ...subjectSuggestions.map(s => ({ type: 'subject', text: s.name })),
          ...stageSuggestions.map(s => ({ type: 'stage', text: s.name }))
        ],
        courses: courseSuggestions,
        subjects: subjectSuggestions,
        stages: stageSuggestions
      }
    });
    
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting search suggestions',
      error: error.message
    });
  }
};

// Get popular search terms
const getPopularSearches = async (req, res) => {
  try {
    // This could be enhanced with actual analytics
    const popularTerms = [
      'رياضيات',
      'فيزياء',
      'كيمياء',
      'عربي',
      'انجليزي',
      'تاريخ',
      'جغرافيا',
      'علوم',
      'احياء'
    ];
    
    res.status(200).json({
      success: true,
      data: {
        popularTerms,
        message: 'Popular search terms retrieved successfully'
      }
    });
    
  } catch (error) {
    console.error('Popular searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting popular searches',
      error: error.message
    });
  }
};

export default {
  searchCourses,
  getSearchSuggestions,
  getPopularSearches
};
