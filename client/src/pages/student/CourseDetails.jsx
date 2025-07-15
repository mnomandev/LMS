import { useParams } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";

const CourseDetail = () => {
  const {id} = useParams();
  const[courseData, setCourseData] = useState(null);
  const {allCourses} = useContext(AppContext);

  const fetchCourseData =async ()=>{
    const findCourse = allCourses.find(course => course._id === id) 
    setCourseData(findCourse);
  }

useEffect(()=>{
 fetchCourseData();
},[])
  return courseData ? (
    <>
    <div className="flex md:flex-row flex-col-reversegap-10
       relative items-start justify-between md:px-36 px-8 md:pt-30 pt-20 text-left">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-cyan-100/70"></div>
       {/* left column */}
       <div >
        <h1 className="text-[26px] leading-[36px] md:text-[36px]
         md:leading-[44px] font-semibold text-gray-800">
          {courseData.courseTitle}</h1>
        <p dangerouslySetInnerHTML={{__html: courseData.courseDescription.slice(0,204)}}></p>
       </div>
       {/* right column */}
       <div></div>
      
    </div>
    </>
  ) : <Loading/>;
}

export default CourseDetail
