import express from 'express';
import multer from 'multer';
import { extractResumeData } from '../controllers/ResumeController.js';

const router = express.Router();

// Store file in memory so we can pass the buffer directly to pdf-parse
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'), false);
    }
  },
});

// POST /api/resume/extract
router.post('/extract', upload.single('resume'), extractResumeData);

export default router;
