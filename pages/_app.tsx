import { LiveblocksProvider } from '@liveblocks/react'
import { createClient } from '@liveblocks/client'
import { AppProps } from 'next/app'
import 'tailwindcss/tailwind.css'
import '../styles/globals.css'

const client = createClient({
  authEndpoint: async (room) => {
    // Before connecting to Liveblocks, get ID from localstorage, or generate new ID and store
    let userId = localStorage.getItem('userId')
    if (!userId) {
      userId = Math.random().toString(36).substring(2, 10)
      localStorage.setItem('userId', userId)
    }

    // Connect to auth api and send userId, along with the room
    const response = await fetch('/api/auth', {
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

export default MyApp
