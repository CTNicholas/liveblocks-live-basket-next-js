import { LiveblocksProvider } from '@liveblocks/react'
import { createClient } from '@liveblocks/client'
import { AppProps } from 'next/app'
import 'tailwindcss/tailwind.css'
import '../styles/globals.css'

/**
 * createClient with callback. We're using this so pass a userId to the client
 */
const client = createClient({
  authEndpoint: async (room) => {
    // A unique ID for current user (e.g. from a database)
    const userId = await getUserId()

    // Connect to auth api and send userId, along with the room
    const response = await fetch('/api/authWithUserId', {
      method: 'POST',
      headers: {
        Authentication: 'token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ room, userId })
    })
    return await response.json()
  }
})

function MyApp ({ Component, pageProps }: AppProps) {
  return (
    /**
     * Add a LiveblocksProvider at the root of your app
     * to be able to use Liveblocks react hooks in your components
     **/
    <LiveblocksProvider client={client}>
      <Component {...pageProps} />
    </LiveblocksProvider>
  )
}

// Simulate a userId taken from a database using localStorage
async function getUserId () {
  return Math.random().toString(36).substring(2, 10)

/*
  let userId = localStorage.getItem('userId')
  if (!userId) {
    userId = Math.random().toString(36).substring(2, 10)
    localStorage.setItem('userId', userId)
  }
  return userId
   */
}

export default MyApp
