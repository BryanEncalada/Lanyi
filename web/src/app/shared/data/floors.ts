import { Product } from './products';
export const FLOORS = [
  {
    id: 'roble-natural',
    name: 'Piso Laminado Roble Natural',
    spec: 'AC4 | 8 mm',
    price: '69.90',
    description: 'Un acabado cálido y natural que acompaña espacios contemporáneos.',
    photo: [42, 685, 149, 77],
  },
  {
    id: 'gris-artico',
    name: 'Piso Laminado Gris Ártico',
    spec: 'AC4 | 8 mm',
    price: '69.90',
    description: 'Tonos grises suaves para interiores luminosos y modernos.',
    photo: [204, 685, 150, 77],
  },
  {
    id: 'bambu-caramelo',
    name: 'Piso de Bambú Caramelo',
    spec: 'Alta resistencia',
    price: '89.90',
    description: 'La textura y calidez del bambú para dar carácter a tu hogar.',
    photo: [367, 685, 150, 77],
  },
  {
    id: 'madera-nogal',
    name: 'Piso de Madera Nogal',
    spec: 'Madera natural',
    price: '129.90',
    description: 'Vetas profundas y tonos elegantes de madera natural.',
    photo: [531, 685, 147, 77],
  },
];

const metadata = [
  {
    material: 'Laminado',
    finish: 'Diseño madera',
    height: 8,
    colors: ['#c6a579'],
    colorFamilies: ['Arena', 'Roble'],
  },
  {
    material: 'Laminado',
    finish: 'Diseño madera',
    height: 8,
    colors: ['#b6b0a5'],
    colorFamilies: ['Gris'],
  },
  { material: 'Bambú', finish: 'Bambú', colors: ['#bd834b'], colorFamilies: ['Canela', 'Roble'] },
  { material: 'Madera', finish: 'Madera natural', colors: ['#80512f'], colorFamilies: ['Nogal'] },
];
/** The floor catalogue reuses Home's products; unknown dimensions are left unset. */
export const FLOOR_CATALOG: Product[] = FLOORS.map((floor, index) => ({
  ...floor,
  ...metadata[index],
  category: 'pisos',
  photoSource: 'home',
  usage: ['Hogar'],
}));
