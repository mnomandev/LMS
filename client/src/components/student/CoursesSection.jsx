import React from 'react'
import { Link } from 'react-router-dom'

const CoursesSection = () => {
  return (
    <div className='py-16 md:px-40 px-8'>
     <h2 className='text-3xl font-medium text-gray-800'>Learn from the best</h2>
     <p className='text-sm md:text-base text-gray-500 mt-3'>Discover our top-rated courses across various categories. From coding and design to 
      bussiness and wellness, our courses are craft to deliver results.</p>


      <Link to={"/course-list"} onClick={() => scroll(0,0)} className='text-gray-500 border
      border-gray-500/30 px-10 py-3 rounded'>Show all c ourses</Link>
    </div>
  )
}

export default CoursesSection
