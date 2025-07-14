import { createContext} from "react";
import { dummyCourses } from "../assets/assets";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AppContext = createContext();

 const AppContextProvider = (props) =>{
    const currency = import.meta.env.VITE_CURRENCY;
    const navigate = useNavigate();
    const [allCourses, setAllCourses] = useState([]);
     const [isEducator, setIsEducator] = useState(true);

    // Fetch courses from an API or any other source
    const fetchAllCourses = async () => {
        setAllCourses(dummyCourses);
    }
    // Call the fetch function when the component mounts
    useState(() => {
        fetchAllCourses();
    }, []);

    const calculateRating = (course)=>{
        if(course.courseRatings.length === 0){
       return 0;    
        }
        let totalRating = 0;
        course.courseRatings.forEach(rating =>{
            totalRating += rating.rating;
        })
        return (totalRating / course.courseRatings.length);
    }
    const value ={
          currency,
          allCourses,
          navigate,
          calculateRating,
          isEducator,
          setIsEducator,
    }
   return(
    <AppContext.Provider value={value}>
        {props.children}
    </AppContext.Provider>
   )
}

export { AppContext, AppContextProvider };