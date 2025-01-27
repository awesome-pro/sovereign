"use client"

import React from 'react'
import { useAuth } from '../hooks/useAuth'

function MainPage() {
  const { user } = useAuth();

  return (
    <main>
      <h1>Welcome to Sovereign!</h1>
      {user && (
        <div>
          <p>Email: {user.email}</p>
          <p>Role: {user.roles[0]?.role.name}</p>
        </div>
      )}
    </main>
  )
}

export default MainPage
