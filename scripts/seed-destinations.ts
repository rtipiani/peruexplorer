
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const locations = [
  {
    id: 'machu-picchu',
    name: 'Machu Picchu',
    region: 'Cusco',
    description: 'La ciudadela inca más famosa del mundo, una maravilla legendaria rodeada de nubes.',
    image: '/images/machu-picchu.png',
    bestMonths: [4, 5, 6, 7, 8, 9, 10],
    tags: ['Aventura', 'Historia', 'Cultura'],
    coordinates: { lat: -13.1631, lng: -72.5450 },
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
    metadata: {
      altitude: '183m',
      difficulty: 'Moderate',
      duration: '3-4 Days'
    }
  },
  {
    id: 'paracas',
    name: 'Reserva de Paracas',
    region: 'Ica',
    description: 'Donde el desierto se encuentra con el océano en una explosión de vida y color.',
    image: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=2070&auto=format&fit=crop',
    bestMonths: [1, 2, 3, 11, 12],
    tags: ['Naturaleza', 'Océano', 'Fauna'],
    coordinates: { lat: -13.8406, lng: -76.2163 },
    metadata: {
      altitude: '0m',
      difficulty: 'Easy',
      duration: '1 Day'
    }
  },
  {
    id: 'mancora',
    name: 'Máncora',
    region: 'Piura',
    description: 'El paraíso del surf y el sol eterno en el norte del Perú.',
    image: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?q=80&w=2070&auto=format&fit=crop',
    bestMonths: [1, 2, 3, 4, 12],
    tags: ['Surf', 'Playa', 'Relax'],
    coordinates: { lat: -4.1067, lng: -81.0475 },
    metadata: {
      altitude: '5m',
      difficulty: 'Easy',
      duration: '3-5 Days'
    }
  },
  {
    id: 'gocta',
    name: 'Catarata Gocta',
    region: 'Amazonas',
    description: 'Una de las caídas de agua más altas y majestuosas del mundo, escondida en la selva alta.',
    image: 'https://images.unsplash.com/photo-1582239014131-41f239014131?q=80&w=2070&auto=format&fit=crop',
    bestMonths: [5, 6, 7, 8, 9, 10],
    tags: ['Catarata', 'Hiking', 'Selva'],
    coordinates: { lat: -6.0122, lng: -77.8864 },
    metadata: {
      altitude: '2,231m',
      difficulty: 'Moderate',
      duration: '1 Day'
    }
  },
  {
    id: 'choquequirao',
    name: 'Choquequirao',
    region: 'Cusco',
    description: 'La "hermana sagrada" de Machu Picchu, una ciudadela inca remota y fascinante.',
    image: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?q=80&w=2070&auto=format&fit=crop',
    bestMonths: [5, 6, 7, 8, 9],
    tags: ['Trekking', 'Historia', 'Aventura'],
    coordinates: { lat: -13.3934, lng: -72.8722 },
    metadata: {
      altitude: '3,050m',
      difficulty: 'Extreme',
      duration: '4-5 Days'
    }
  },
  {
    id: 'caral',
    name: 'Caral',
    region: 'Lima',
    description: 'La civilización más antigua de América, un testimonio eterno de ingeniería y cultura.',
    image: 'https://images.unsplash.com/photo-1541414779316-956a5084c0d4?q=80&w=2070&auto=format&fit=crop',
    bestMonths: [1, 2, 3, 4, 11, 12],
    tags: ['Historia', 'Cultura', 'Costa'],
    coordinates: { lat: -10.8931, lng: -77.5255 },
    metadata: {
      altitude: '350m',
      difficulty: 'Easy',
      duration: '1 Day'
    }
  },
  {
    id: 'chavin',
    name: 'Chavín de Huántar',
    region: 'Ancash',
    description: 'Centro ceremonial milenario con impresionantes galerías subterráneas y cabezas clavas.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop',
    bestMonths: [5, 6, 7, 8, 9, 10],
    tags: ['Arqueología', 'Andes', 'Cultura'],
    coordinates: { lat: -9.5938, lng: -77.1772 },
    metadata: {
      altitude: '3,180m',
      difficulty: 'Easy',
      duration: '1 Day'
    }
  },
  {
    id: 'nazca',
    name: 'Líneas de Nazca',
    region: 'Ica',
    description: 'Enigmáticos geoglifos gigantescos trazados en el desierto, visibles solo desde el aire.',
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=2070&auto=format&fit=crop',
    bestMonths: [1, 2, 3, 4, 11, 12],
    tags: ['Misterio', 'Vuelo', 'Historia'],
    coordinates: { lat: -14.7390, lng: -75.1300 },
    metadata: {
      altitude: '520m',
      difficulty: 'Easy',
      duration: 'Half Day'
    }
  },
  {
    id: 'ballestas',
    name: 'Islas Ballestas',
    region: 'Ica',
    description: 'El "Galápagos peruano", un santuario de leones marinos, pingüinos y miles de aves guaneras.',
    image: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=2070&auto=format&fit=crop',
    bestMonths: [1, 2, 3, 11, 12],
    tags: ['Fauna', 'Océano', 'Aventura'],
    coordinates: { lat: -13.7371, lng: -76.3980 },
    metadata: {
      altitude: '0m',
      difficulty: 'Easy',
      duration: 'Half Day'
    }
  },
  {
    id: 'tarapoto',
    name: 'Tarapoto',
    region: 'San Martín',
    description: 'La Ciudad de las Palmeras, puerta de entrada a cataratas cristalinas y lagunas mágicas.',
    image: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?q=80&w=2070&auto=format&fit=crop',
    bestMonths: [5, 6, 7, 8, 9, 10],
    tags: ['Cataratas', 'Selva Alta', 'Naturaleza'],
    coordinates: { lat: -6.4861, lng: -76.3725 },
    metadata: {
      altitude: '350m',
      difficulty: 'Easy',
      duration: '3-4 Days'
    }
  },
  {
    id: 'huascaran',
    name: 'Nevado Huascarán',
    region: 'Ancash',
    description: 'El pico más alto del Perú y de los trópicos, un gigante de hielo que domina los Andes.',
    image: 'https://images.unsplash.com/photo-1483190656465-2c49e54d29f3?q=80&w=2070&auto=format&fit=crop',
    bestMonths: [5, 6, 7, 8, 9],
    tags: ['Andinismo', 'Glaciares', 'Aventura'],
    coordinates: { lat: -9.1167, lng: -77.6000 },
    metadata: {
      altitude: '6,768m',
      difficulty: 'Extreme',
      duration: '5-7 Days'
    }
  },
  {
    id: 'valle-sagrado',
    name: 'Valle Sagrado',
    region: 'Cusco',
    description: 'El corazón del Imperio Inca, un valle fértil salpicado de pueblos pintorescos y ruinas majestuosas.',
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=2070&auto=format&fit=crop',
    bestMonths: [4, 5, 6, 7, 8, 9, 10],
    tags: ['Cultura', 'Paisajes', 'Historia'],
    coordinates: { lat: -13.3333, lng: -72.0833 },
    metadata: {
      altitude: '2,800m',
      difficulty: 'Easy',
      duration: '1-2 Days'
    }
  },
  {
    id: 'pachacamac',
    name: 'Santuario de Pachacámac',
    region: 'Lima',
    description: 'El oráculo más importante de la costa central andina, un complejo de templos frente al mar.',
    image: 'https://images.unsplash.com/photo-1564344790226-702336338e9c?q=80&w=2070&auto=format&fit=crop',
    bestMonths: [1, 2, 3, 4, 11, 12],
    tags: ['Arqueología', 'Historia', 'Costa'],
    coordinates: { lat: -12.2575, lng: -76.9014 },
    metadata: {
      altitude: '20m',
      difficulty: 'Easy',
      duration: 'Half Day'
    }
  }
];

async function main() {
  console.log('Seeding tourist locations...');
  for (const loc of locations) {
    await prisma.touristLocation.upsert({
      where: { id: loc.id },
      update: {
        name: loc.name,
        region: loc.region,
        description: loc.description,
        image: loc.image,
        latitude: loc.coordinates.lat,
        longitude: loc.coordinates.lng,
        tags: loc.tags,
        bestMonths: loc.bestMonths,
        altitude: loc.metadata.altitude,
        difficulty: loc.metadata.difficulty,
        duration: loc.metadata.duration,
      },
      create: {
        id: loc.id,
        name: loc.name,
        region: loc.region,
        description: loc.description,
        image: loc.image,
        latitude: loc.coordinates.lat,
        longitude: loc.coordinates.lng,
        tags: loc.tags,
        bestMonths: loc.bestMonths,
        altitude: loc.metadata.altitude,
        difficulty: loc.metadata.difficulty,
        duration: loc.metadata.duration,
      }
    });
  }
  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
