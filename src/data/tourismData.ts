export interface Location {
  id: string;
  name: string;
  region: string;
  description: string;
  image: string;
  bestMonths: number[]; // 1-12
  tags: string[];
  coordinates: { lat: number; lng: number };
  reactions: {
    love: number;
    bucketList: number;
    beenThere: number;
  };
  metadata: {
    altitude: string;
    difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Extreme';
    duration: string;
  };
}

export const locations: Location[] = [
  {
    id: 'machu-picchu',
    name: 'Machu Picchu',
    region: 'Cusco',
    description: 'La ciudadela inca más famosa del mundo, una maravilla legendaria rodeada de nubes.',
    image: '/images/machu-picchu.png',
    bestMonths: [4, 5, 6, 7, 8, 9, 10],
    tags: ['Aventura', 'Historia', 'Cultura'],
    coordinates: { lat: -13.1631, lng: -72.5450 },
    reactions: { love: 1240, bucketList: 5400, beenThere: 850 },
    metadata: {
      altitude: '2,430m',
      difficulty: 'Moderate',
      duration: '1-2 Days'
    }
  },
  {
    id: 'laguna-69',
    name: 'Laguna 69',
    region: 'Ancash',
    description: 'Una joya turquesa a los pies del Nevado Chacraraju en la Cordillera Blanca.',
    image: '/images/laguna69.png',
    bestMonths: [5, 6, 7, 8, 9],
    tags: ['Hiking', 'Naturaleza', 'Glaciares'],
    coordinates: { lat: -9.0156, lng: -77.6186 },
    reactions: { love: 890, bucketList: 2100, beenThere: 320 },
    metadata: {
      altitude: '4,600m',
      difficulty: 'Challenging',
      duration: '1 Day'
    }
  },
  {
    id: 'iquitos',
    name: 'Selva de Iquitos',
    region: 'Loreto',
    description: 'El corazón latiente de la Amazonía peruana, donde el río Amazonas nace y la vida desborda.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop',
    bestMonths: [6, 7, 8, 9, 10, 11],
    tags: ['Eco-turismo', 'Amazonas', 'Aventura'],
    coordinates: { lat: -3.7489, lng: -73.2516 },
    reactions: { love: 750, bucketList: 1500, beenThere: 410 },
    metadata: {
      altitude: '106m',
      difficulty: 'Easy',
      duration: '3-5 Days'
    }
  },
  {
    id: 'colca',
    name: 'Cañón del Colca',
    region: 'Arequipa',
    description: 'Uno de los cañones más profundos del mundo y el hogar del majestuoso cóndor andino.',
    image: 'https://images.unsplash.com/photo-1483190656465-2c49e54d29f3?q=80&w=2070&auto=format&fit=crop',
    bestMonths: [4, 5, 6, 7, 8, 9, 10, 11],
    tags: ['Paisajes', 'Andes', 'Cóndores'],
    coordinates: { lat: -15.5667, lng: -71.8333 },
    reactions: { love: 640, bucketList: 1800, beenThere: 290 },
    metadata: {
      altitude: '3,635m',
      difficulty: 'Moderate',
      duration: '2-3 Days'
    }
  },
  {
    id: 'titicaca',
    name: 'Lago Titicaca',
    region: 'Puno',
    description: 'El lago navegable más alto del mundo, cuna de leyendas y culturas ancestrales.',
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=2070&auto=format&fit=crop',
    bestMonths: [4, 5, 6, 7, 8, 9, 10],
    tags: ['Lago', 'Cultura', 'Travesía'],
    coordinates: { lat: -15.8402, lng: -69.3354 },
    reactions: { love: 520, bucketList: 1200, beenThere: 180 },
    metadata: {
      altitude: '3,812m',
      difficulty: 'Easy',
      duration: '2 Days'
    }
  },
  {
    id: 'huacachina',
    name: 'Huacachina',
    region: 'Ica',
    description: 'Un oasis natural rodeado de dunas doradas, perfecto para la aventura y el relax.',
    image: 'https://images.unsplash.com/photo-1558271736-cd042ef2e2a4?q=80&w=2071&auto=format&fit=crop',
    bestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    tags: ['Oasis', 'Sandboarding', 'Sol'],
    coordinates: { lat: -14.0875, lng: -75.7626 },
    reactions: { love: 980, bucketList: 2500, beenThere: 640 },
    metadata: {
      altitude: '406m',
      difficulty: 'Easy',
      duration: '1 Day'
    }
  },
  {
    id: 'kuelap',
    name: 'Fortaleza de Kuélap',
    region: 'Amazonas',
    description: 'La imponente ciudad amurallada de la cultura Chachapoyas en los Andes amazónicos.',
    image: 'https://images.unsplash.com/photo-1600273202903-888e22f28ed5?q=80&w=2070&auto=format&fit=crop',
    bestMonths: [5, 6, 7, 8, 9, 10],
    tags: ['Arqueología', 'Amazonas', 'Historia'],
    coordinates: { lat: -6.4197, lng: -77.9261 },
    reactions: { love: 410, bucketList: 950, beenThere: 110 },
    metadata: {
      altitude: '3,000m',
      difficulty: 'Moderate',
      duration: '1-2 Days'
    }
  },
  {
    id: 'chan-chan',
    name: 'Chan Chan',
    region: 'La Libertad',
    description: 'La ciudad de barro más grande de la América precolombina, capital del reino Chimú.',
    image: 'https://images.unsplash.com/photo-1632204680873-67ba7ce65e52?q=80&w=2070&auto=format&fit=crop',
    bestMonths: [1, 2, 3, 4, 11, 12],
    tags: ['Arqueología', 'Costa', 'Historia'],
    coordinates: { lat: -8.1116, lng: -79.0653 },
    reactions: { love: 380, bucketList: 820, beenThere: 150 },
    metadata: {
      altitude: '34m',
      difficulty: 'Easy',
      duration: 'Half Day'
    }
  },
  {
    id: 'tambopata',
    name: 'Tambopata',
    region: 'Madre de Dios',
    description: 'Uno de los lugares con mayor biodiversidad del planeta, corazón de la selva virgen.',
    image: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?q=80&w=2070&auto=format&fit=crop',
    bestMonths: [5, 6, 7, 8, 9, 10],
    tags: ['Biodiversidad', 'Selva', 'Aventura'],
    coordinates: { lat: -12.8328, lng: -69.1731 },
    reactions: { love: 670, bucketList: 1400, beenThere: 190 },
    metadata: {
      altitude: '183m',
      difficulty: 'Moderate',
      duration: '3-4 Days'
    }
  }
];
