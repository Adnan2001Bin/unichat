'use client';

import React from 'react'
import ProfileHome from '@/components/ProfileHome';
import Link from 'next/link';
function home() {
  return (
    <div className='mx-[5%]'>
        <div className='mt-18 w-[20%] h-[35rem] '>
            <Link href={"/profile"}>
            <ProfileHome />
            </Link>
            
        </div>
    </div>
  )
}

export default home