import React from 'react'
import Basket from './basket'
import { ExampleWrapper } from '../components/ExampleWrapper'

/*
 * Check in `basket.tsx` for the live basket code and guided comments
 */

const info = {
  title: 'Live basket',
  description: 'Open in multiple windows, or share the link, to edit your basket live with others.',
  githubHref: 'https://github.com/CTNicholas/liveblocks-live-basket-next-js',
  codeSandboxHref: 'https://codesandbox.io/s/live-basket-with-liveblocks-next-js-xh3bm',
  twitterHref: 'https://twitter.com/ctnicholasdev',
  hide: false
}

const meta = {
  title: 'Live Basket • ctnicholas.dev',
  description: '',
  image: '/screenshot.png',
  url: 'https://livebasket.ctnicholas.dev',
  author: 'https://ctnicholas.dev',
  twitter: '@ctnicholasdev'
}

export default function Index (props: any) {
  return (
    <ExampleWrapper info={info} meta={meta} {...props}>
      <Basket />
    </ExampleWrapper>
  )
}

export function getStaticProps () {
  return {
    props: {
      isRunningOnCodeSandbox: process.env.CODESANDBOX_SSE != null,
      hasSetupLiveblocksKey: process.env.LIVEBLOCKS_SECRET_KEY != null
    }
  }
}
