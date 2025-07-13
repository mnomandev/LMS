import React from 'react'
import { assets } from '../../assets/assets'

const Hero = () => {
  return (
    <div>
     <h1>Empower Your future with the courses designed to <span className='text-blue-600'> fit your choice.</span>
     <img src={assets.sketch} alt="sketch" className='md:block hidden absolute -bottom-7 right-0'/></h1>
    </div>
  )
}

export default Hero
