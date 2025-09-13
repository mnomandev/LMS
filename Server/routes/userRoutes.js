import express from 'express';
import { getUserCourseProgress, getUserData, purchaseCourse, 
    updateUserCourseProgress, userEnrolledCourses, addUserRating } from '../controllers/userController.js';

const userRouter = express.Router();


userRouter.get('/data', getUserData);
userRouter.get('/enrolled-courses', userEnrolledCourses);
userRouter.post('/purchase', purchaseCourse);

userRouter.post('/update-course-progress', updateUserCourseProgress);
userRouter.get('/get-course-progress', getUserCourseProgress);
userRouter.get('/add-rating', addUserRating);

export default userRouter;