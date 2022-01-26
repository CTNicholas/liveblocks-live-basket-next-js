import { APICall } from '../pages/basket'

export async function roomStorage (room: string): Promise<APICall> {
  return await fetch('/api/getRoomStorage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ room })
  }).then((res) => res.json())
}
