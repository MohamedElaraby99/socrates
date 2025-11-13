import express from 'express';
import searchController from '../controllers/search.controller.js';

const router = express.Router();

// Search courses
// GET /api/search/courses?q=searchTerm&subject=math&grade=primary&limit=10&page=1
router.get('/courses', searchController.searchCourses);

// Get search suggestions/autocomplete
// GET /api/search/suggestions?q=searchTerm
router.get('/suggestions', searchController.getSearchSuggestions);

// Get popular search terms
// GET /api/search/popular
router.get('/popular', searchController.getPopularSearches);

export default router;
