import { Product } from '../pages/basket'
import greenSmoothie from '../public/assets/photos/green-smoothie.jpg'
import peanutButterToast from '../public/assets/photos/peanut-butter-toast.jpg'
import cashewMilk from '../public/assets/photos/cashew-milk.jpg'
import berrySmoothie from '../public/assets/photos/berry-smoothie.jpg'
import leafySalad from '../public/assets/photos/leafy-salad.jpg'
import freshCitrus from '../public/assets/photos/fresh-citrus.jpg'
import freshProduce from '../public/assets/photos/fresh-produce.jpg'
import nutBreakfast from '../public/assets/photos/nut-breakfast.jpg'

export const productList: Product[] = [
  {
    id: 0,
    name: 'Green smoothie',
    price: 7,
    image: greenSmoothie,
  },
  {
    id: 1,
    name: 'Peanut butter toast',
    price: 0,
    image: peanutButterToast,
  },
  {
    id: 2,
    name: 'Cashew milk',
    price: 0,
    image: cashewMilk,
  },
  {
    id: 3,
    name: 'Berry smoothie',
    price: 0,
    image: berrySmoothie,
  },
  {
    id: 4,
    name: 'Leafy salad',
    price: 0,
    image: leafySalad,
  },
  {
    id: 5,
    name: 'Fresh citrus',
    price: 0,
    image: freshCitrus,
  },
  {
    id: 6,
    name: 'Fresh produce',
    price: 0,
    image: freshProduce,
  },
  {
    id: 7,
    name: 'Nut breakfast',
    price: 0,
    image: nutBreakfast,
  }
]
