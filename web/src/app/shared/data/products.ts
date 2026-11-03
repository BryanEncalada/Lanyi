export interface Product {
  id: string;
  sku?: string;
  seoTitle?: string;
  seoDescription?: string;
  categoryId?: number;
  subcategory?: string;
  imageUrl?: string;
  gallery?: string[];
  featured?: boolean;
  technical?: Record<string, string>;
  name: string;
  material: string;
  finish: string;
  height?: number;
  category: 'pisos' | 'accesorios';
  photoSource?: 'home' | 'catalog';
  spec?: string;
  price?: string;
  usage: string[];
  description: string;
  colors: string[];
  colorFamilies: string[];
  photo: readonly number[];
}

// Illustrative catalogue transcribed from the supplied reference.
export const PRODUCTS: Product[] = [
  {
    category: 'accesorios',
    id: 'mdf-blanco',
    colorFamilies: ['Blanco', 'Gris'],
    name: 'Zócalo MDF Blanco',
    material: 'MDF',
    finish: 'Liso',
    height: 80,
    usage: ['Hogar', 'Oficina'],
    description: 'Ideal para interiores modernos',
    colors: ['#fafafa', '#a5a19a', '#62615e'],
    photo: [256, 386, 192, 141],
  },
  {
    category: 'accesorios',
    id: 'mdf-roble',
    colorFamilies: ['Arena', 'Roble'],
    name: 'Zócalo MDF Roble',
    material: 'MDF',
    finish: 'Melamínico',
    height: 80,
    usage: ['Hogar', 'Oficina'],
    description: 'Gran resistencia y fácil limpieza',
    colors: ['#cfaa70', '#b77e38', '#8b531c'],
    photo: [469, 386, 192, 141],
  },
  {
    category: 'accesorios',
    id: 'madera-cedro',
    colorFamilies: ['Nogal', 'Canela'],
    name: 'Zócalo de Madera Cedro',
    material: 'Madera',
    finish: 'Natural',
    height: 70,
    usage: ['Hogar', 'Comercial'],
    description: 'Realza la calidez de tus espacios',
    colors: ['#c7813f', '#79401b', '#b99161'],
    photo: [682, 386, 192, 141],
  },
  {
    category: 'accesorios',
    id: 'spc-gris',
    colorFamilies: ['Gris'],
    name: 'Rodón SPC Gris',
    material: 'SPC / Rodón',
    finish: 'Texturizado',
    height: 60,
    usage: ['Oficina', 'Alto tránsito'],
    description: 'Ideal para alto tránsito',
    colors: ['#b2b1ad', '#8b8985', '#5b5a57'],
    photo: [256, 691, 192, 143],
  },
  {
    category: 'accesorios',
    id: 'mdf-gris',
    colorFamilies: ['Gris'],
    name: 'Zócalo MDF Gris Claro',
    material: 'MDF',
    finish: 'Liso',
    height: 80,
    usage: ['Hogar', 'Oficina'],
    description: 'Diseño minimalista',
    colors: ['#c1bcb1', '#969089', '#53514e'],
    photo: [469, 691, 192, 143],
  },
  {
    category: 'accesorios',
    id: 'madera-nogal',
    colorFamilies: ['Nogal', 'Canela'],
    name: 'Zócalo de Madera Nogal',
    material: 'Madera',
    finish: 'Natural',
    height: 70,
    usage: ['Hogar', 'Comercial'],
    description: 'Estilo clásico y elegante',
    colors: ['#aa6028', '#713a17', '#865030'],
    photo: [682, 691, 192, 143],
  },
  {
    category: 'accesorios',
    id: 'mdf-canela',
    colorFamilies: ['Canela', 'Roble'],
    name: 'Zócalo MDF Canela',
    material: 'MDF',
    finish: 'Melamínico',
    height: 80,
    usage: ['Hogar', 'Comercial'],
    description: 'Tono cálido y moderno',
    colors: ['#c49c6b', '#a56c32', '#754525'],
    photo: [256, 1000, 192, 142],
  },
  {
    category: 'accesorios',
    id: 'madera-natural',
    colorFamilies: ['Arena', 'Roble'],
    name: 'Zócalo Madera Natural',
    material: 'Madera',
    finish: 'Natural',
    height: 80,
    usage: ['Hogar'],
    description: 'Ideal para ambientes rústicos y cálidos',
    colors: ['#d6b07a', '#b47c45', '#88512c'],
    photo: [469, 1000, 192, 142],
  },
  {
    category: 'accesorios',
    id: 'spc-arena',
    colorFamilies: ['Arena', 'Roble'],
    name: 'Rodón SPC Arena',
    material: 'SPC / Rodón',
    finish: 'Texturizado',
    height: 60,
    usage: ['Hogar', 'Alto tránsito'],
    description: 'Moderno y versátil',
    colors: ['#d2b99a', '#b99d7d', '#9b836a'],
    photo: [682, 1000, 192, 142],
  },
];

export function quotationUrl(name: string): string {
  return (
    'https://wa.me/51971924719?text=' +
    encodeURIComponent('Hola, quisiera solicitar una cotización de ' + name + '.')
  );
}
