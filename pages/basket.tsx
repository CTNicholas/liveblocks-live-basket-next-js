import { RoomProvider, useBatch, useEventListener, useList, useMyPresence, useObject, useOthers, useRoom, useSelf } from '@liveblocks/react'
import { productList } from '../config/product-list'
import { useEffect, useState } from 'react'
import Logo from '../components/Logo'
import Image from 'next/image'

// https://www.pexels.com/collections/eating-vegan-1ivf0l1/
// https://www.pexels.com/collections/flower-power-mii4yiv/
// https://www.pexels.com/collections/tutti-frutti-bwxbmg7/
// https://www.pexels.com/collections/confectionery-fqhuzhu/
// https://www.pexels.com/collections/discover-the-world-vl4e0bx/

//type APICall = { data: any } | { error: any }
type APICall = {
  data?: any,
  error?: string
}

export default function Root () {
  let room: string = ''

  // If in browser, get value of ?room= from the URL
  // The room parameter is added in pages/_middleware.ts
  if (typeof window !== 'undefined') {
    room = new URLSearchParams(document.location.search).get('room') || ''
  }

  /*
  useEffect(() => {
    async function getRoomStorage () {
      const { data, error }: APICall = await fetch('/api/getRoomStorage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ room })
      }).then((res) => res.json())

      console.log(data, error)
    }

    getRoomStorage()
  }, [])

  return <div />

   */

  return (
    <RoomProvider id={room}>
      <BasketDemo />
    </RoomProvider>
  )
}

export type Product = {
  id: number
  name: string
  price: number
  image: StaticImageData | string
  quantity?: number
}

type User = {
  driver?: boolean
}

/**
 * NEW HOOK IDEA
 * const connected = useConnected()
 * This could return true if connection status === 'open', false otherwise
 */

function BasketDemo () {
  const [myPresence, updateMyPresence] = useMyPresence<User>()
  const self = useSelf()
  const others = useOthers<User>()
  const batch = useBatch()
  const basket = useList<Product>('basket')
  const basketProperties = useObject('basketProperties', { total: 0 })
  const [connected, setConnected] = useState<boolean>(false)

  function handleAddToBasket (product: Product) {
    if (!basket) {
      return
    }

    const basketIndex = basket.findIndex(item => item.id === product.id)

    if (basketIndex >= 0) {
      batch(() => {
        const oldQuantity = basket.get(basketIndex)?.quantity || 0
        basket.delete(basketIndex)
        product.quantity = (product.quantity || 0) + oldQuantity
        basket.insert(product, basketIndex)
      })
    } else {
      basket.push(product)
    }
  }

  function handleEmptyBasket () {
    if (basket) {
      batch(() => {
        basket.forEach(() => basket.delete(0))
      })
    }
  }

  function handleRemoveItem (itemId: number) {
    if (basket) {
      const basketIndex = basket.findIndex(item => item.id === itemId)
      basket.delete(basketIndex)
    }
  }

    return (
    <>
      <header className="flex justify-between items-center border-b px-6 py-3">
        <div className="w-9 h-9">
          <Logo />
        </div>
        <div className="flex items-center">
          <span className="mr-3">My name</span>
          <Avatar url="/assets/avatars/0.png" color="skyblue" />
        </div>
      </header>
      <div className="flex items-stretch mx-auto max-w-screen-2xl">
        <main className="flex-grow">
          <div className="font-title text-center py-12 text-5xl">
            Veganuary
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productList.map(p => <Item key={p.name} product={p} onAddToBasket={handleAddToBasket} />)}
          </div>
        </main>
        <aside className="w-80 bg-gray-50 px-6 flex-shrink-0">
          <div className="sticky top-10">

            <div className="text-lg font-bold my-6">Basket</div>
            {basket ? basket.map(item => (
              <div key={item.id} className="mb-4">
                <div>{item.name}</div>
                Quantity: {item.quantity}&nbsp;
                <button onClick={() => handleRemoveItem(item.id)}>Remove</button>
              </div>
            )) : (
              <>Loading...</>
            )}

            <button onClick={handleEmptyBasket}>Empty basket</button>

          </div>
        </aside>
      </div>
    </>
  )
}

type ItemProps = {
  product: Product
  onAddToBasket?: (product: Product) => void
}

function Item ({ product, onAddToBasket = () => {} }: ItemProps) {
  const [quantity, setQuantity] = useState(1)

  function handleOnClick () {
    onAddToBasket({ ...product, quantity })
    setQuantity(1)
  }

  return (
    <div className="p-6">
      <div className="w-full aspect-[1/1.3] overflow-hidden relative">
        <Image src={product.image} alt={product.name} layout="fill" objectFit="cover" />
      </div>
      <div>{product.name}</div>
      <div className="flex justify-between">
        <button disabled={quantity < 2} className="border w-10 rounded" onClick={() => setQuantity(quantity - 1)}>-</button>
        <button onClick={handleOnClick} className="p-2 rounded bg-gray-200">Add {quantity}</button>
        <button className="border w-10 rounded" onClick={() => setQuantity(quantity + 1)}>+</button>
      </div>
    </div>
  )
}

// Circular avatar
function Avatar ({ url = '', color = '' }) {
  return (
    <span className="inline-block relative">
      <img
        className="h-10 w-10 rounded-full ring-4 ring-white"
        src={url}
        alt=""
      />
      <span style={{ backgroundColor: color }} className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white" />
    </span>
  )
}
