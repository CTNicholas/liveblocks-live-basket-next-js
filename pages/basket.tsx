import { RoomProvider, useBatch, useList, useObject, useOthers, useSelf } from '@liveblocks/react'
import { productList } from '../config/productList'
import { useEffect, useState } from 'react'
import Logo from '../components/Logo'
import Image from 'next/image'
import { LiveList } from '@liveblocks/client'

// https://www.pexels.com/collections/eating-vegan-1ivf0l1/
// https://www.pexels.com/collections/flower-power-mii4yiv/
// https://www.pexels.com/collections/tutti-frutti-bwxbmg7/
// https://www.pexels.com/collections/confectionery-fqhuzhu/
// https://www.pexels.com/collections/discover-the-world-vl4e0bx/

// APICall returns either { data } or { error }
export type APICall = {
  data: any
  error: undefined
} | {
  data: undefined
  error: string
}

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

function BasketDemo () {
  const self = useSelf()
  const others = useOthers<User>()
  const batch = useBatch()
  const basket = useList<Product>('basket')
  const requestedItems = useList<Product>('requestedItems')
  const basketProperties = useObject('basketProperties', { driver: '' })

  const liveblocksLoaded = () => (basket && basketProperties && self?.id && others)

  useEffect(() => {
    if (!basketProperties || !self?.id || !others) {
      return
    }

    const driverId = basketProperties.get('driver')
    if (!driverId) {
      basketProperties.set('driver', self.id)
    }
  }, [basketProperties])

  useEffect(() => {
    if (liveblocksLoaded() && !iAmDriver()) {
      const otherDriver = others.toArray().some(other => other.id === basketProperties!.get('driver'))
      if (!otherDriver) {
        const driver = others!.count ? others!.toArray()[0].id : self!.id
        if (driver) {
          basketProperties!.set('driver', driver)
        }
      }
    }
  }, [others])

  function getTotalPrice () {
    if (!basket) {
      return 0
    }
    return basket.toArray().reduce((acc, product) => acc + product.price * (product.quantity || 1), 0)
  }

  function iAmDriver (): boolean {
    if (!self?.id || !basketProperties) {
      return false
    }
    return self.id === basketProperties.get('driver')
  }

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
        if (newQuantity) {
          currentBasket.insert(product, basketIndex)
        }
      })
    } else {
      currentBasket.push(product)
    }
  }

  function handleEmptyBasket () {
    if (basket && iAmDriver()) {
      batch(() => {
        basket.forEach(() => basket.delete(0))
      })
    }
  }

  function handleRemoveItem (itemId: number, currentBasket: LiveList<Product>|null) {
    if (currentBasket && iAmDriver()) {
      const basketIndex = currentBasket.findIndex(item => item.id === itemId)
      currentBasket.delete(basketIndex)
    }
  }

  function handleAcceptItem (itemId: number) {
    if (basket && requestedItems) {
      const item = requestedItems.find(item => item.id === itemId)
      if (item) {
        handleRemoveItem(itemId, requestedItems)
        handleAddToBasket(item)
      }
    }
  }

  function handleChangeDriver (userId: string) {
    if (basketProperties && userId) {
      basketProperties.set('driver', userId)
    }
  }

    return (
    <>
      <header className="flex justify-between items-center border-b px-6 py-3">
        <div className="">
          <Logo />
        </div>
        {self && (
          <div className="flex items-center">
            <span className="mr-3 font-medium">{self ? self.info.name : ''}</span>
            <Avatar url={self.info.picture} />
          </div>
        )}
      </header>
      <div className="flex items-stretch">
        <main className="flex-grow mx-auto max-w-screen-xl px-8 pb-16">
          <div className="mt-16 text-4xl font-bold tracking-tight">
            Bamboo socks
          </div>
          <div className="mb-12 mt-3 pb-8 border-b text-xl font-medium text-gray-500">
            TopSocks' finest collection of bamboo socks
          </div>
          <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-6 2xl:gap-x-12 gap-y-24">
            {productList.map(p => <Item key={p.name} product={p} onAddToBasket={handleAddToBasket} driver={iAmDriver()} />)}
          </div>
        </main>
        <aside className="w-80 bg-gray-50 px-6 flex-shrink-0 pb-8">
          <div className="sticky top-10">
            {liveblocksLoaded() ? (
                <div className="">
                  <div className="text-lg font-bold mt-6 mb-5">Users</div>
                  <div className="flex items-center mb-4">
                    <Avatar url={self!.info.picture} driver={iAmDriver()} />
                    <div className="ml-3">
                      <div className="font-medium">You</div>
                      <div className="text-sm text-gray-500">
                        {iAmDriver() ? 'Holding basket' : 'You can request items'}
                      </div>
                    </div>
                  </div>
                  {others.map(({ id, info }) => (
                    <div className="flex items-center mb-4">
                      <Avatar url={info.picture} driver={id === basketProperties!.get('driver')} />
                      <div className="ml-3">
                        <div className="font-medium">{info.name}</div>
                        {id === basketProperties!.get('driver') && (
                          <div className="text-sm text-gray-500">Holding basket</div>
                        )}
                        {iAmDriver() && id && (
                          <button onClick={() => handleChangeDriver(id)} className="text-sm text-cyan-600">
                            Give basket
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
                                src={item.images[0]}
                                className="animate-pulse"
                                layout="fill"
                                objectFit="cover"
                              />
                            </div>
                            <div className="flex flex-col justify-center items-start">
                              <div className="font-medium">{item.name}</div>
                              {iAmDriver() ? (
                                <div>
                                  <button
                                    className="text-sm text-green-700 mr-2"
                                    onClick={() => handleAcceptItem(item.id)}
                                  >
                                    Allow
                                  </button>
                                  <button
                                    className="text-sm text-red-700"
                                    onClick={() => handleRemoveItem(item.id, requestedItems)}
                                  >
                                    Deny
                                  </button>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-700">Requested</div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">£{item.price.toFixed(2)}</div>
                            <div className="text-sm">
                              <span>x{item.quantity}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  {basket && basket.length > 0 && (
                    <div className="text-lg font-bold my-6 pt-6 border-t">
                      Basket
                    </div>
                  )}
                    <div>
                      {basket!.toArray().map(item => (
                        <div key={item.id} className="mb-5 flex justify-between">
                          <div className="flex">
                            <div className="w-10 h-10 overflow-hidden mr-3 rounded mt-1 relative">
                              <Image
                                src={item.images[0]}
                                layout="fill"
                                objectFit="cover"
                              />
                            </div>
                            <div className="flex flex-col justify-center items-start">
                              <div className="font-medium">{item.name}</div>
                              {iAmDriver() && (
                                <button
                                  className="text-sm text-red-700"
                                  onClick={() => handleRemoveItem(item.id, basket)}
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">£{item.price.toFixed(2)}</div>
                            <div className="text-sm">
                              <span>x{item.quantity}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-right font-semibold flex justify-between border-t mt-6 pt-6">
                      <span>Total:</span> <span className="font-bold">£{getTotalPrice().toFixed(2)}</span>
                    </div>
                  {iAmDriver() && (
                    <button
                      className="mt-6 block text-red-700 border border-red-700 disabled:text-gray-500 disabled:border-gray-500 font-semibold block w-full rounded py-2 px-5"
                      disabled={basket!.length < 1}
                      onClick={handleEmptyBasket}
                    >
                      Empty basket
                    </button>
                    )}


                </div>


            ) : (
              <div>Loading...</div>
            )}

          </div>




        </aside>
      </div>
      <footer className="bg-gray-100">asfasg</footer>
    </>
  )
}

type ItemProps = {
  product: Product
  driver?: boolean
  onAddToBasket?: (product: Product) => void
}

function Item ({ product, onAddToBasket = () => {}, driver = false }: ItemProps) {
  const [quantity, setQuantity] = useState(1)

  function handleOnClick () {
    onAddToBasket({ ...product, quantity })
    setQuantity(1)
  }

  return (
    <div className="group relative">
      <div className="w-full aspect-[1/0.7] xl:aspect-[1/1.3] overflow-hidden relative rounded-xl">
        <Image src={product.images[0]} alt={product.name} layout="fill" objectFit="cover" />
      </div>
      <div className="flex justify-between text-lg mt-5 font-medium text-gray-800">
        <div>{product.name}</div>
        <div className="">£{product.price}</div>
      </div>
      <div className="text-gray-500 mt-1.5">
        {product.description}
      </div>
      <div className="mt-6 flex justify-between justify-items-stretch w-full tabular-nums gap-3">
        <button
          disabled={quantity < 2}
          className="flex justify-center items-center font-semibold text-gray-700 border border-gray-600 w-10 rounded py-2 active:bg-gray-100 transition-colors"
          onClick={() => setQuantity(quantity - 1)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-4 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={handleOnClick}
          className="flex-grow py-2 rounded bg-gray-800 hover:bg-gray-600 active:bg-gray-800 transition-colors text-white">
          {driver ? 'Add' : 'Request'} {quantity}
        </button>
        <button
          className="flex justify-center items-center font-semibold text-gray-700 border border-gray-600 w-10 rounded py-2 active:bg-gray-100 transition-colors"
          onClick={() => setQuantity(quantity + 1)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Circular avatar
function Avatar ({ url = '', driver = false }) {
  return (
    <span className="inline-block relative">
      <img
        className="h-10 w-10 rounded-full ring-4 ring-gray-50"
        src={url}
        alt=""
      />
      <span style={{ display: driver ? 'block' : 'none' }} className="bg-cyan-500 absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-gray-50" />
    </span>
  )
}

