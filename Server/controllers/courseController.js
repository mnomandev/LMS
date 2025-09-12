import Course from "../models/Course.js";

//Get all courses

export const getAllCourse = async (req, res)=>{
   try{
     const courses = await Course.find({isPublished: true}).select(
    ['-courseContent',
    '-enrolledStudents',
     ]).populate({path: 'educator'})
    res.json({success: true, courses})
   }
   catch(error){
     res.json({success: false, message: error.message})
   }
}

//get course by Id

export const getCourseById = async (req, res)=>{
    try{
        const {id} = req.params;

        const courseData = await Course.findById(id).populate({path: 'educator'});

//Remove lecture URL is ispreview is false
        courseData.courseContent.forEach(chapter =>{
            chapter.chapterContent.forEach(lecture =>{
                if(!lecture.isPreviewFree){
                    lecture.lectureUrl = '';
                }
            })
        })
        res.json({success: true, courseData});
    }
    catch(error){
        res.json({success: false, message: error.message})
    }
}