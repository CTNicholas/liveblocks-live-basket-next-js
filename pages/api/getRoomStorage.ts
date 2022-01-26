import { authorize } from '@liveblocks/node'
import { NextApiRequest, NextApiResponse } from 'next'

const API_KEY = process.env.LIVEBLOCKS_SECRET_KEY
const authUrl = 'https://liveblocks.io/api/authorize'
const roomUrl = (id: string) => `https://liveblocks.net/api/v1/room/${id}/storage/json`

export default async function auth (req: NextApiRequest, res: NextApiResponse) {
  if (!API_KEY) {
    return res.status(403).end()
  }

  const { room } = req.body
  if (!room) {
    return res.status(400).json({ error: 'No room id submitted' })
  }

  // Get JWT from Liveblocks
  const authResult = await fetch(authUrl, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    }
  })
  const authData = await authResult.json()

  if (!authResult.ok) {
    return res.status(500).json({ error: authData.error })
  }

  // Get room storage using JWT
  const roomResult = await fetch(roomUrl(room), {
    headers: {
      Authorization: `Bearer ${authData.token}`
    }
  })

  if (!roomResult.ok) {
    res.status(500).json({ error: 'Liveblocks room error' })
    return
  }

  const data = await roomResult.json()

  // Return room storage
  return res.status(200).json({ data })
}
