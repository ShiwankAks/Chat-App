import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'

const ProfilePage = () => {

  const {authUser, updateProfile} = useContext(AuthContext)

  const [selectedImg,setSelectedImg] = useState(null)
  const [name,setName] = useState(authUser.fullName)
  const [bio,setBio] = useState(authUser.bio)
  const navigate= useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedImg) {
      await updateProfile({fullName: name, bio})
      navigate("/")
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedImg);
    reader.onload = async()=>{
      const base64Image = reader.result;
      await updateProfile({profilePic: base64Image, fullName: name, bio})
      navigate("/")
    }
  }

  return (
    <div className=' min-h-screen bg-no-repeat bg-cover flex items-center justify-center ' >
      <div className=' w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 
      flex items-center justify-between max-sm:flex-col-reverse rounded-lg '>
      <form onSubmit={handleSubmit} className=' flex flex-col gap-5 p-10 flex-1 '>
        <h3 className='text-lg'>Profile Details</h3>
        <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
          <input onChange={(e)=>{setSelectedImg(e.target.files[0])}} type="file" id='avatar' 
          accept='.jpeg , .png, .jpg' hidden />
          <img src={selectedImg? URL.createObjectURL(selectedImg) : assets.avatar_icon}
          className={`w-12 h-12 ${selectedImg && 'rounded-full'}`} alt="" />
          Upload profile image
        </label>
        <input type="text" onChange={(e)=>setName(e.target.value)} value={name} required
         placeholder='Your name' className='border border-gray-500 rounded-md pt-2 focus:outline-none focus:ring-2 focus:ring-violet-500  ' />
        <textarea onChange={(e)=>setBio(e.target.value)} placeholder='Write profile bio' value={bio}
         required rows={4} className='border border-gray-500 rounded-md pt-2 focus:outline-none
          focus:ring-2 focus:ring-violet-500'>
          </textarea>

          <button type='submit' className='bg-gradient-to-r from-purple-400 to-violet-600 
          p-2 rounded-full text-lg cursor-pointer'>
            Save
            </button>
      </form>
      
      <img className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 ${selectedImg && 'rounded-full'}`} 
      src={authUser?.profilePic || assets.logo_icon} alt="" />
      
      </div>
    </div>
  )
}

export default ProfilePage 
