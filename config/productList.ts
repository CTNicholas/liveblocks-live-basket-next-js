import { Product } from '../pages/basket'
import geometric from '../public/assets/socks/color-geometric-socks.jpg'
import cat from '../public/assets/socks/grey-and-white-stripe-socks.jpg'
import paw from '../public/assets/socks/puppy-paw-socks.jpg'
import white from '../public/assets/socks/white-socks.jpg'
import hotdog from '../public/assets/socks/hotdog-socks.jpg'
import pug from '../public/assets/socks/pug-dog-socks.jpg'
import jungle from '../public/assets/socks/jungle-socks-2.jpg'
import floral from '../public/assets/socks/floral-socks.jpg'

import whiteBack from '../public/assets/socks/white-socks-back.jpg'
import whiteBack2 from '../public/assets/socks/white-socks-back-2.jpg'
import pawBack from '../public/assets/socks/puppy-paw-socks-back.jpg'
import catBack from '../public/assets/socks/grey-and-white-stripe-socks-back.jpg'
import jungleBack from '../public/assets/socks/jungle-socks-back-2.jpg'
import floralBack from '../public/assets/socks/floral-socks-back.jpg'

export const productList: Product[] = [
  {
    id: 0,
    name: 'Geometric socks',
    price: 7.00,
    images: [geometric, whiteBack2],
    description: 'Pink, blue and yellow'
  },
  {
    id: 1,
    name: 'Cat socks',
    price: 3.00,
    images: [cat, catBack],
    description: 'Light blue, gray and white'
  },
  {
    id: 2,
    name: 'Puppy paw socks',
    price: 1.20,
    images: [paw, pawBack],
    description: 'Light brown and white'
  },
  {
    id: 3,
    name: 'White socks',
    price: 2.10,
    images: [white, whiteBack],
    description: 'Plain white'
  },
  {
    id: 6,
    name: 'Jungle socks',
    price: 0.75,
    images: [jungle, jungleBack],
    description: 'Dark green'
  },
  {
    id: 6,
    name: 'Hotdog socks',
    price: 0.75,
    images: [hotdog, whiteBack2],
    description: 'Brown, red and yellow'
  },
  {
    id: 6,
    name: 'Floral socks',
    price: 0.75,
    images: [floral, floralBack],
    description: 'White, green and pink'
  },
  {
    id: 7,
    name: 'Pug socks',
    price: 0.75,
    images: [pug, whiteBack],
    description: 'White, brown and pink'
  }
]
