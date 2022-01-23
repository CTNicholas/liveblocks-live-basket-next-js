import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'

export function middleware (request: NextRequest, event: NextFetchEvent) {
  const {pathname, searchParams } = request.nextUrl
  const room = searchParams.get('room')

  // If not visiting website index, or if ?room= is already set, continue
  if (pathname !== '/' || room) {
    return NextResponse.next()
  }

  // Add random room id to URL and continue
  return NextResponse.redirect(`/?room=${id()}`)
}

function id () {
  return 'xxxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
    return (Math.random() * 16 | 0).toString(16)
  })
}
