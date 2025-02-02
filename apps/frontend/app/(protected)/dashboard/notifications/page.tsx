"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react'

function Notifications() {
    const router = useRouter();
  return (
    <div>
      Notifications

      <Link href="/dashboard">Link</Link>
    </div>
  )
}

export default Notifications
