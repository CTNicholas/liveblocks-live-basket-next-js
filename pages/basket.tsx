import { RoomProvider, useBatch, useList, useObject, useOthers, useSelf } from '@liveblocks/react'
import { productList } from '../config/productList'
import { ChangeEvent, useEffect, useState } from 'react'
import Image from 'next/image'
import { LiveList } from '@liveblocks/client'
import { AnimatePresence, motion } from 'framer-motion'

/*
 * This example shows how to use Liveblocks to build a live basket shopping app.
 * Multiple users can connect at once, but only one user, the "driver" can control the basket.
 * The other users, the "passengers", can request an item, and the "driver" can choose to accept or reject the request.
 */
export default function Root () {
  let room: string = ''

  // If in browser, get value of ?room= from the URL
  // The room parameter is added in pages/_middleware.ts
  if (typeof window !== 'undefined') {
    room = new URLSearchParams(document.location.search).get('room') || ''
  }

  return (
    <RoomProvider id={'live-basket-' + room}>
      <BasketDemo />
    </RoomProvider>
  )
}

const monetaryUnit = '£'

export type Product = {
  id: number
  name: string
  price: number
  images: StaticImageData[] | string[]
  description: string
  quantity?: number
  requested?: boolean
}

type User = {
  name: string
  color: string
  picture: string
}

/*
 * The main basket is stored in a Liveblocks LiveList called `basket`, an array-like object
 * `requestedItems` is another LiveList, containing items that the passengers have requested
 * `basketProperties` is a LiveObject which contains other data, such as the unique id of the driver
 */
function BasketDemo () {
  const self = useSelf()
  const others = useOthers<User>()
  const batch = useBatch()
  const basket = useList<Product>('basket')
  const requestedItems = useList<Product>('requestedItems')
  const basketProperties = useObject('basketProperties', { driver: '' })
  const liveblocksLoaded = () => !!(basket && basketProperties && others && self?.id)

  // If no driver is set or online, and no other users are online, become driver
  useEffect(() => {
    if (liveblocksLoaded() && !iAmDriver() && others.count === 0) {
      basketProperties!.set('driver', self!.id as string)
    }
  }, [self])

  // If the driver goes offline, set a new driver
  useEffect(() => {
    if (!liveblocksLoaded() || iAmDriver()) {
      return
    }

    const otherDriver = [...others].some(other => other.id === basketProperties!.get('driver'))
    if (!otherDriver) {

      // The driver becomes `others[0]`, or if no one else is online, it becomes local user
      const driver = others.count ? [...others][0].id : self!.id
      if (driver) {
        basketProperties!.set('driver', driver)
      }

    }
  }, [others])

  // Returns true if local user is the driver
  function iAmDriver (): boolean {
    if (!self?.id || !basketProperties) {
      return false
    }
    return self.id === basketProperties.get('driver')
  }

  // Adds an item to the basket, or requested items list, (depending on whether local user is driver)
  function handleAddToBasket (product: Product) {
    const currentBasket = iAmDriver() ? basket : requestedItems
    if (!currentBasket) {
      return
    }

    const basketIndex = currentBasket.findIndex(item => item.id === product.id)
    if (basketIndex >= 0) {
      batch(() => {
        const oldQuantity = currentBasket.get(basketIndex)?.quantity || 0
        const newQuantity = (product.quantity || 0) + oldQuantity
        currentBasket.delete(basketIndex)
        product.quantity = newQuantity > 0 ? newQuantity : 0
        if (newQuantity > 0) {
          currentBasket.insert(product, basketIndex)
        }
      })
    } else {
      currentBasket.push(product)
    }
  }

  // If driver, empty main basket
  function handleEmptyBasket () {
    if (iAmDriver() && basket) {
      basket.clear()
    }
  }

  // If driver, remove an item from the basket or requested items, as defined by currentBasket
  function handleRemoveItem (itemId: number, currentBasket: LiveList<Product> | null) {
    if (iAmDriver() && currentBasket) {
      const basketIndex = currentBasket.findIndex(item => item.id === itemId)
      currentBasket.delete(basketIndex)
    }
  }

  // If driver, accept a requested item into the main basket
  function handleAcceptItem (itemId: number) {
    if (iAmDriver() && basket && requestedItems) {
      const item = requestedItems.find(item => item.id === itemId)
      if (item) {
        handleRemoveItem(itemId, requestedItems)
        handleAddToBasket(item)
      }
    }
  }

  // If driver, pass ownership of basket to user specified by userId
  function handleChangeDriver (userId: string) {
    if (iAmDriver() && basketProperties && userId) {
      basketProperties.set('driver', userId)
    }
  }

  // Get the total item price
  function getTotalPrice () {
    if (!basket) {
      return 0
    }
    return [...basket].reduce((acc, product) => acc + product.price * (product.quantity || 1), 0)
  }

  // Open and close mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  useEffect(() => {
    preventBodyScroll(mobileMenuOpen)
  }, [mobileMenuOpen])

  return (
    <>
      <header className="flex justify-between items-center border-b px-6 py-3 fixed top-0 left-0 right-0 z-10 bg-white min-h-[65px]">
        <div className="">
          <Logo />
        </div>
        {self && (
          <div className="flex items-center">
            <motion.span animate={{ opacity: liveblocksLoaded() ? 1 : 0}} className="hidden md:block mr-3 font-medium">
              {self ? self.info.name : ''}
            </motion.span>
            <motion.div animate={{ opacity: liveblocksLoaded() ? 1 : 0}} className="hidden md:block">
              <Avatar url={self.info.picture} />
            </motion.div>
            <button
              className="block md:hidden w-10 h-10 bg-gray-800 text-white rounded-full ml-3 flex justify-center items-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {!mobileMenuOpen ? (
                <BagIconLarge
                  className="w-6 h-6 -mt-1"
                  count={requestedItems && requestedItems.length || 0}
                  pulse={requestedItems && requestedItems?.length > 0 || false}
                />
              ) : <CloseIcon />}
            </button>
          </div>
        )}
      </header>
      <div className="flex items-stretch mt-16">
        <main className="flex-grow mx-auto max-w-screen-xl px-8 pb-16">
          <div className="mt-16 text-4xl font-bold tracking-tight">
            Bamboo socks
          </div>
          <div className="mb-12 mt-3 pb-8 border-b text-xl font-medium text-gray-500">
            TopSocks' finest collection of bamboo socks
          </div>
          <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-6 2xl:gap-x-12 gap-y-24 mb-12">
            {productList.map(p => <Item key={p.name} product={p} onAddToBasket={handleAddToBasket} driver={iAmDriver()} liveblocksLoaded={liveblocksLoaded()} />)}
          </div>
        </main>
        <aside className={`w-full fixed inset-0 md:relative md:w-80 bg-gray-50 px-6 flex-shrink-0 overflow-y-auto md:overflow-y-visible md:block ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="md:sticky md:top-24 mt-24 md:mt-0 pb-8 mb:pb-12 md:overflow-y-auto">
            <AnimatePresence>
              {liveblocksLoaded() && (
                <motion.div animate={{ opacity: [0, 1] }} className="opacity-0">
                    <div className="text-lg font-bold mt-6 mb-5">Users</div>
                    <div className="flex items-center mb-4">
                      <Avatar url={self!.info.picture} driver={iAmDriver()} />
                      <div className="ml-3">
                        <div className="font-medium">You</div>
                        <div className="text-sm text-gray-500">
                          {iAmDriver() ? 'Holding bag' : 'You can request items'}
                        </div>
                      </div>
                    </div>
                  {others.map(({ id, info }) => (
                    <div className="flex items-center mb-4">
                        <Avatar url={info.picture} driver={id === basketProperties!.get('driver')} />
                        <div className="ml-3">
                          <div className="font-medium">{info.name}</div>
                          {id === basketProperties!.get('driver') && (
                            <div className="text-sm text-gray-500">Holding bag</div>
                          )}
                          {iAmDriver() && id && (
                            <button onClick={() => handleChangeDriver(id)} className="text-sm text-cyan-600 block">
                              Give bag
                            </button>
                          )}
                        </div>
                      </div>
                  ))}
                  {requestedItems && requestedItems.length > 0 && (
                    <div className="text-lg font-bold my-6 pt-6 border-t">
                      Requested Items
                    </div>
                  )}
                  <div>
                    {requestedItems!.toArray().map(item => (
                      <div key={item.id} className="mb-5 flex justify-between">
                        <div className="flex">
                          <div className="w-10 h-10 overflow-hidden mr-3 rounded mt-1 relative">
                            <Image
                              height="40"
                              width="40"
                              src={item.images[0]}
                              layout="fill"
                              objectFit="cover"
                              placeholder="blur"
                              className="animate-pulse bg-gray-700"
                            />
                          </div>
                          <div className="flex flex-col justify-center items-start">
                            <div className="font-medium">{item.name}</div>
                            {iAmDriver() ? (
                              <div className="flex">
                                <button
                                  className="text-sm text-green-700 mr-2 inline-block"
                                  onClick={() => handleAcceptItem(item.id)}
                                >
                                  Add to bag
                                </button>
                                <button
                                  className="text-sm text-red-700 inline-block"
                                  onClick={() => handleRemoveItem(item.id, requestedItems)}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-700 block">Requested item</div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{monetaryUnit}{item.price.toFixed(2)}</div>
                          <div className="text-sm">
                            <span>x{item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {basket && basket.length > 0 && (
                    <div className="text-lg font-bold my-6 pt-6 border-t">
                        Shopping Bag
                      </div>
                  )}
                  <div>
                    {basket!.toArray().map(item => (
                      <div key={item.id} className="mb-5 flex justify-between">
                        <div className="flex">
                          <div className="w-10 h-10 overflow-hidden mr-3 rounded mt-1 relative">
                            <Image
                              height="40"
                              width="40"
                              src={item.images[0]}
                              layout="fill"
                              objectFit="cover"
                              placeholder="blur"
                              className="bg-gray-700"
                            />
                          </div>
                          <div className="flex flex-col justify-center items-start">
                            <div className="font-medium">{item.name}</div>
                            {iAmDriver() && (
                              <button
                                className="text-sm text-red-700 block"
                                onClick={() => handleRemoveItem(item.id, basket)}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{monetaryUnit}{item.price.toFixed(2)}</div>
                          <div className="text-sm">
                            <span>x{item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-right font-semibold flex justify-between border-t mt-6 pt-6">
                    <span>Total:</span> <span className="font-bold">{monetaryUnit}{getTotalPrice().toFixed(2)}</span>
                  </div>
                  {iAmDriver() && (
                    <button
                      className="hover:bg-red-100 disabled:hover:bg-transparent transition-colors mt-6 block text-red-700 border border-red-700 disabled:text-gray-500 disabled:border-gray-500 font-semibold block w-full rounded py-2 px-5"
                      disabled={basket!.length < 1}
                      onClick={handleEmptyBasket}
                    >
                      Empty bag
                    </button>
                  )}
                  </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </div>
    </>
  )
}

type ItemProps = {
  product: Product
  driver?: boolean
  onAddToBasket?: (product: Product) => void
  liveblocksLoaded?: boolean
}

const itemImageVariants = {
  loading: {
    scale: 1.1,
    filter: 'blur(10px)'
  },
  loaded: {
    scale: 1,
    filter: 'blur(0px)'
  }
}

// A single item in the shop
function Item ({ product, onAddToBasket = () => {}, driver = false, liveblocksLoaded}: ItemProps) {
  const quantityMax = 30
  const [quantity, setQuantity] = useState(1)
  const [imageLoaded, setImageLoaded] = useState(false)

  function handleOnClick () {
    onAddToBasket({ ...product, quantity })
    setQuantity(1)
  }

  return (
    <div className="group relative">
      <div className="w-full aspect-[1/0.7] xl:aspect-[1/1.3] overflow-hidden relative rounded-xl">
        <motion.div
          className="w-full h-full"
          variants={itemImageVariants}
          initial="loading"
          animate={imageLoaded ? 'loaded' : 'loading'}
          style={{ originX: 0.5, originY: 0.5 }}
          transition={{ duration: 0.8 }}
        >
          <Image
            className="relative"
            onLoadingComplete={() => setImageLoaded(true)}
            src={product.images[0]}
            alt={product.name}
            layout="fill"
            objectFit="cover"
            placeholder="blur"
          />
        </motion.div>
      </div>
      <div className="flex justify-between text-lg mt-5 font-medium text-gray-800">
        <div>{product.name}</div>
        <div className="">{monetaryUnit}{product.price.toFixed(2)}</div>
      </div>
      <div className="text-gray-500 mt-1.5">
        {product.description}
      </div>
          <div className="mt-6 flex justify-between justify-items-stretch w-full tabular-nums gap-3">
            <button
              disabled={!liveblocksLoaded}
              onClick={handleOnClick}
              className="disabled:bg-gray-600 disabled:text-gray-600 disabled:border-gray-600 flex-grow py-2 rounded bg-gray-800 hover:bg-gray-600 active:bg-gray-800 border border-black transition-colors text-white flex justify-center px-4 items-center block font-medium">
              {driver ? <>Add to bag<BagIcon className="w-5 h-5 -mt-2 ml-2 -mr-1.5" /></> : <>Request item<BagIcon className="w-5 h-5 -mt-2 ml-2 -mr-2" /></>}
            </button>
            <select
              disabled={!liveblocksLoaded}
              className="disabled:bg-gray-200 disabled:text-gray-200 disabled:border-gray-200 cursor-pointer text-gray-700 bg-white hover:bg-gray-100 border border-gray-600 rounded py-2 px-2 active:bg-gray-100 transition-colors"
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setQuantity(parseInt(e.target.value))}
              value={quantity}
            >
              {[...Array(quantityMax).keys()].map((_, i) => (
                <option key={i} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>

    </div>
  )
}

// Circular avatar
function Avatar ({ url = '', driver = false }) {
  return (
    <span className="block relative rounded-full">
      <img className="h-10 w-10 rounded-full ring-4 ring-gray-50" src={url} alt="" />
      <span style={{ display: driver ? 'block' : 'none' }} className="absolute bottom-0.5 -right-2 block text-gray-700 h-5 w-5">
        <BagIcon stroke={true} />
      </span>
    </span>
  )
}

// Stop body scrolling if mobileMenuOpen === true
function preventBodyScroll (mobileMenuOpen: boolean) {
  if (mobileMenuOpen) {
    document.body.classList.add('overflow-hidden', 'md:overflow-auto')
  } else {
    document.body.classList.remove('overflow-hidden', 'md:overflow-auto')
  }
}

function BagIcon ({ className = '', stroke = false }) {
  return (
    <div className={className}>
      <svg xmlns="http://www.w3.org/2000/svg" className="inline h-full w-full" viewBox="0 0 20 20" fill="currentColor">
        <path stroke="white" paintOrder="stroke" strokeWidth={stroke ? 5 : 0} strokeOpacity={stroke ? 1 : 0} fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
      </svg>
    </div>
  )
}

function BagIconLarge ({ className = '', count = 0, pulse = false }) {
  return (
    <div className={'relative ' + className}>
      <svg xmlns="http://www.w3.org/2000/svg" className={`inline h-full w-full ${pulse ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      {count > 0 && <span className="absolute -top-2 -right-3 block h-4 w-4 rounded-full bg-cyan-500 text-xs font-semibold">{count}</span>}
    </div>
  )
}

function CloseIcon () {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  )
}

function Logo () {
  return (
    <div className="flex justify-center items-center font-bold text-lg text-gray-900">
      <img className="w-7 h-7 opacity-80 mr-1.5" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABmJLR0QA/wD/AP+gvaeTAAACgElEQVRoge2ZPWsUQRyHH71GIiQmIKaLYBEbrdJ4RjuFBO5jCAE7XxpRrKzEb2CCoCA2poqViiY2RgxJZaGlETSIL3eYInixmF0yN/53d+Z2dnaX3APD7e3szfweZmd2bxfCcQh4DmwD1wL2651ZYDcqHd+NH/TdYAqHE7a9EFKkUAYi+5UR4C17k30XuFtqoj6QJGonkyZRGxlJ4j3QAn5TE5kkibGo/iw1kMmSiKm0zBFgld5w69F+iXNA2zj+TvEx00ma2B3gfMrvKjUyWatTLWSk00kqv4AzKe1Ip9mNwlIb2ErYyrSE4wvHVSJLRmrvWaEG2F2x04o5Z2yXbK8M099IJI2MNBKrJC/ZXmgASx4kdJmN0BIA1z1KSCWIxAjwXev0I3C1bhIAl4yOm9H+23WSAFjUOl426h5YhK2EBMAHrfObRt0oauKWJuHy8OGotr1p1P0A1hz7fgdcBH46/k7ERaStbQ8bdQ3ghENbXiVcec3eKfHYqJvD7ZRqhYksc0sL0gGORfungD+4ibRRd7ulcBL4q4V5AkwCX3GTqITMQyFMnutHG5gOahAxDnx2DFtZmSnyj4Qk06QEpL+lecs3YCKkRIz0wCBveRrUQCPvyMxHJf7exe3C6pV+ZeZRdxajqBek8f7LYeP34ioTS8S80eru9RPA1xurFdRbW5u3tQuo/zZdbd+Ott3wlCkX06SPjDkSAEP0LhpXQoXNIklGkgD10Fo/7nSYmHZIMvdREztmCCXR1Y55GTamHZLMNmpiv+L/a1AHOFVKUguawBbZq9gWMFNSRmuOo67YksAO8Ah1M5qLA3kbcGACuBB9doFPwAvgS8AMAwa48g+AvE7S2m/DfQAAAABJRU5ErkJggg==" alt="TopSocks logo" />
      TopSocks
    </div>
  )
}
