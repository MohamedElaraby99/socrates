import express from 'express';
import {
  createAchievement,
  getAllAchievements,
  getAchievementById,
  updateAchievement,
  deleteAchievement,
  generateAutoAchievements,
  getAchievementStats,
  getTopStudents,
  bulkDeleteAchievements,
  exportAchievements
} from '../controllers/achievement.controller.js';

import { isLoggedIn, authorisedRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (for logged-in users)
router.get('/', isLoggedIn, getAllAchievements);
router.get('/stats', isLoggedIn, getAchievementStats);
router.get('/top-students', isLoggedIn, getTopStudents);
router.get('/export', isLoggedIn, exportAchievements);
router.get('/:id', isLoggedIn, getAchievementById);

// Admin/Instructor routes
router.post('/', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'ASSISTANT'), createAchievement);
router.post('/generate-auto', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'ASSISTANT'), generateAutoAchievements);
router.put('/:id', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'ASSISTANT'), updateAchievement);
router.delete('/:id', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'ASSISTANT'), deleteAchievement);
router.delete('/bulk-delete', isLoggedIn, authorisedRoles('ADMIN', 'SUPER_ADMIN', 'ASSISTANT'), bulkDeleteAchievements);

export default router;
