import { authorize } from '@liveblocks/node'
import { NextApiRequest, NextApiResponse } from 'next'

const API_KEY = process.env.LIVEBLOCKS_SECRET_KEY

export default async function auth (req: NextApiRequest, res: NextApiResponse) {
  if (!API_KEY) {
    return res.status(403).end()
  }

  // userId === 42
  const userId = req.body.userId

  // Room storage: { creator: 42 }
  const response = await authorize({
    room: req.body.room,
    secret: API_KEY,

    // Callback provides room storage
    userInfo (storage: any) {
      return {
        createdRoom: userId === storage.creator, // True, current user is room creator
        picture: `/assets/avatars/${Math.floor(Math.random() * 10)}.png`
      }
    }

  })
  return res.status(response.status).end(response.body)
}
