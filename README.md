# [Live Basket](https://livebasket.ctnicholas.dev)

This repo shows how to build a live shopping basket with [Liveblocks](https://liveblocks.io) and [Next.js](https://nextjs.org/).

![Live piano screenshot](https://livebasket.ctnicholas.dev/screenshot.png)


## [Try it out](https://livebasket.ctnicholas.dev)

This shopping basket isn't only shared between users, but contains a demo of a driver/passenger relationship.
Only one user can hold the basket at a time (the "driver"), and they have control over what is added or 
removed from the basket. Other users, the "passengers", can only request an item is added, and then wait for
a response. If the driver goes offline, the first passenger still online becomes the new driver.

## Getting started

### Run examples locally

- Install all dependencies with `npm install`

- Create an account on [liveblocks.io](https://liveblocks.io/dashboard)

- Copy your secret key from the [administration](https://liveblocks.io/dashboard/apikeys)

- Create a file named `.env.local` and add your Liveblocks secret as environment variable `LIVEBLOCKS_SECRET_KEY=sk_test_yourkey`

### Run examples on CodeSandbox

- Open this repository on CodeSandbox with this [link](https://codesandbox.io/s/live-piano-with-liveblocks-and-next-js-pgkp5)

- Create an account on [liveblocks.io](https://liveblocks.io/dashboard)

- Copy your secret key from the [administration](https://liveblocks.io/dashboard/apikeys)

- Create [secret](https://codesandbox.io/docs/secrets) named `LIVEBLOCKS_SECRET_KEY` with the secret key you just copied. You need to create an account on CodeSandbox to add an environment variable.

- Refresh your browser and you should be good to go!


## More

- On my blog, [ctnicholas.dev](https://www.ctnicholas.dev/), I wrote an interactive article
about [using Liveblocks to add live cursors to your website](https://www.ctnicholas.dev/articles/live-cursors-with-liveblocks).
- I recently built a [live piano](https://github.com/CTNicholas/liveblocks-live-piano-next-js) with Liveblocks.
