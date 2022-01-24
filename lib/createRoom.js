let jwt = ''

export default async function createRoom () {
  const userId = getUserId()
  const result = await fetch('/api/getToken')
  console.log(result)
}

// Before connecting to Liveblocks, get ID from localstorage, or generate new ID and store
function getUserId () {
  let userId = localStorage.getItem('userId')
  if (!userId) {
    userId = Math.random().toString(36).substring(2, 10)
    localStorage.setItem('userId', userId)
  }
  return userId
}
