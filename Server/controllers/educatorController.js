import {clerkClient} from '@clerk/express';
import Course from '../models/Course.js';
import { v2 as cloudinary } from 'cloudinary';

//update role to Educator

export const updateRoleToEducator = async (req, res)=>{
      try{
        const { userId } = req.auth();
        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator'
            }
        })
        res.json({success: true, message: 'You can publish a course now'});
      }

      catch(error){
        res.json({success: false, message: error.message});
      }
}

//add new course
export const addCourse = async (req, res)=>{
  try{
     const {courseData} = req.body;
     const imageFile = req.file;
     const { userId  } = req.auth();

     if(!imageFile){
      return res.json({success: false, message: 'Course thumbnail is required'});
     }
     const parsedCourseData = await JSON.parse(courseData);
     parsedCourseData.educator = userId;

     const newCourse =await Course.create(parsedCourseData)

     const imageUpload = await cloudinary.uploader.upload(imageFile.path);
     newCourse.courseThumbnail = imageUpload.secure_url;

     await newCourse.save();
     res.json({success: true, message: 'Course Added'});
  }
  catch(error){
    res.json({success: false, message: error.message});
  }
}