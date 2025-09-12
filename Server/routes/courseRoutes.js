import express from 'express';
import { getAllCourse, getCourseById } from '../controllers/courseController.js';

const courseRouter = express.Router();

// Define course-related routes here
courseRouter.get('/all', getAllCourse);
courseRouter.get('/:id', getCourseById);

export default courseRouter;
