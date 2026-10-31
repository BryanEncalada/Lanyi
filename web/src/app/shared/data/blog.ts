export const BLOG_ARTICLES: Record<string, string[]> = {
    'como-elegir-el-piso-ideal': [
      'Antes de elegir un piso, considera el uso del ambiente, la cantidad de luz natural y los tonos de tus muebles. Una muestra física te ayudará a comparar colores en tu propio espacio.',
      'Consulta la ficha técnica del fabricante para conocer las condiciones de instalación, resistencia y mantenimiento. Nuestro equipo puede orientarte según tu proyecto y presupuesto.',
    ],
    'diferencias-pisos-laminados-madera-bambu': [
      'Los pisos laminados ofrecen una amplia variedad de acabados decorativos. La madera destaca por sus vetas naturales, mientras que el bambú aporta una apariencia cálida y distintiva.',
      'La elección depende del ambiente y de las especificaciones de cada producto. Compara muestras, mantenimiento y compatibilidad con el lugar de instalación antes de decidir.',
    ],
    'zocalos-el-detalle-que-hace-la-diferencia': [
      'Los zócalos acompañan el encuentro entre la pared y el piso y ayudan a proteger la parte inferior del muro. Su altura, tono y acabado influyen en el resultado visual del ambiente.',
      'Puedes elegir un color similar al piso para dar continuidad, o un tono que combine con las paredes. Revisa las condiciones de humedad y las instrucciones de instalación de cada material.',
    ],
  };
export const BLOG_POSTS = [
    {
      slug: 'como-elegir-el-piso-ideal',
      title: '¿Cómo elegir el piso ideal para tu hogar?',
      description: 'Conoce los factores más importantes a considerar antes de instalar un piso.',
      date: '2026-10-15',
      displayDate: '15 oct. 2026',
      image: 'piso-ideal.jpg',
    },
    {
      slug: 'diferencias-pisos-laminados-madera-bambu',
      title: 'Diferencias entre pisos laminados, de madera y bambú',
      description: 'Te explicamos las características, ventajas y usos de cada tipo de piso.',
      date: '2026-10-10',
      displayDate: '10 oct. 2026',
      image: 'tipos-de-pisos.jpg',
    },
    {
      slug: 'zocalos-el-detalle-que-hace-la-diferencia',
      title: 'Zócalos: el detalle que hace la diferencia',
      description: 'Descubre cómo los zócalos complementan y protegen tus espacios.',
      date: '2026-10-05',
      displayDate: '5 oct. 2026',
      image: 'zocalos.jpg',
    },
  ];

const PHOTOS = [[42,1259,203,63], [259,1259,203,63], [476,1259,202,63]];
export const BLOG_LIST = BLOG_POSTS.map((p, i) => ({...p, photo: PHOTOS[i], category: ['Consejos', 'Comparativas', 'Zócalos'][i], tags: [['Consejos', 'Pisos Laminados'], ['Pisos Laminados', 'Madera', 'Bambú'], ['Zócalos']][i]})).concat([{
    slug: 'errores-comunes-al-instalar', title: 'Errores comunes al instalar un piso (y cómo evitarlos)', description: 'Conoce los errores más frecuentes y nuestros consejos para una instalación exitosa.', date: '2026-09-28', displayDate: '28 set. 2026', image: '', photo: PHOTOS[1], category: 'Instalación', tags: ['Instalación']
  }]);
export const BLOG_RECOMMENDATIONS = [
    { slug: 'tendencias', title: 'Tendencias en pisos para 2026', category: 'Diseño de interiores', date: '2026-09-22', displayDate: '22 set. 2026', description: 'Tonos naturales y acabados que aportan calidez a tus espacios.', photo: PHOTOS[0] },
    { slug: 'terrazas', title: 'Pisos para terrazas y exteriores: qué materiales elegir', category: 'Exteriores', date: '2026-09-18', displayDate: '18 set. 2026', description: 'Consulta materiales aptos para las condiciones de tu terraza antes de elegir.', photo: PHOTOS[1] },
    { slug: 'mantenimiento', title: 'Cómo mantener tu piso como nuevo por más tiempo', category: 'Mantenimiento', date: '2026-09-12', displayDate: '12 set. 2026', description: 'Sigue las instrucciones de limpieza del fabricante y utiliza productos compatibles con tu piso.', photo: PHOTOS[2] },
  ];
