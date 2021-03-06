import { authorize } from '@liveblocks/node'
import { NextApiRequest, NextApiResponse } from 'next'

const API_KEY = process.env.LIVEBLOCKS_SECRET_KEY

export default async function auth (req: NextApiRequest, res: NextApiResponse) {
  if (!API_KEY) {
    return res.status(403).end()
  }

  if (!req.body.userId) {
    return res.status(400).end()
  }

  // For the avatar example, we're generating random users
  // and set their info from the authentication endpoint
  // See https://liveblocks.io/docs/api-reference/liveblocks-node#authorize for more information
  const response = await authorize({
    room: req.body.room,
    secret: API_KEY,
    userId: req.body.userId, // userId is a special case, does not go in userInfo
    userInfo: {
      name: NAMES[Math.floor(Math.random() * NAMES.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      picture: `/assets/avatars/${Math.floor(Math.random() * 10)}.png`
    }
  })
  return res.status(response.status).end(response.body)
}

const COLORS = [
  '#f87171',
  '#fb923c',
  '#facc15',
  '#5fda15',
  '#4ade80',
  '#34ead2',
  '#22d3ee',
  '#60a5fa',
  '#c084fc',
  '#ff7dc0',
]

const NAMES = [
  'Charlie Layne',
  'Mislav Abha',
  'Tatum Paolo',
  'Anjali Wanda',
  'Jody Hekla',
  'Emil Joyce',
  'Jory Quispe',
  'Quinn Elton'
]
