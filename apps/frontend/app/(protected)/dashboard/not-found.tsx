import Link from 'next/link'
import React from 'react'

function NotFound() {
  return (
    <section>
       <p> It seems that we are still working on this page, please check back later</p>
        
        <Link href="/dashboard">Go back to Dashboard</Link>
    </section>
  )
}

export default NotFound
