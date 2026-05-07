export interface Activity {
  time: string;
  title: string;
  location: string;
  notes: string;
  image?: string;
  price?: string;
  category: 'museum' | 'food' | 'transport' | 'sightseeing' | 'nature' | 'shopping' | 'relax';
  funFact?: string;
  tips?: string[];
  coordinates?: { lat: number; lng: number };
}

export interface Day {
  id: string;
  date: string;
  label: string;
  activities: Activity[];
  dayNumber: number;
  weather: {
    temp: number;
    condition: 'sunny' | 'cloudy' | 'partly-cloudy' | 'rainy';
  };
  expenses: {
    transport: number;
    food: number;
    tickets: number;
    other: number;
  };
}

export interface TripData {
  tripName: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: Day[];
  tips: {
    id: string;
    category: 'transport' | 'food' | 'reservations' | 'money' | 'general';
    title: string;
    description: string;
    icon: string;
  }[];
  secrets: {
    id: string;
    name: string;
    description: string;
    image: string;
    location: string;
    dayId: string;
  }[];
}

export const itineraryData: TripData = {
  tripName: "París: El corazón histórico y sus secretos",
  destination: "París y Puteaux, Francia",
  startDate: "2026-05-13",
  endDate: "2026-05-18",
  tips: [
    {
      id: 'tip-1',
      category: 'transport',
      title: 'Pase Navigo Easy',
      description: 'Para 5 días, saca el abono en tu tarjeta Navigo Easy o usa la app del teléfono. Evita billetes de papel.',
      icon: 'train',
    },
    {
      id: 'tip-2',
      category: 'reservations',
      title: 'Reservas prioritarias',
      description: 'Louvre, Versalles y Torre Eiffel deben comprarse con semanas de antelación en sus páginas oficiales.',
      icon: 'ticket',
    },
    {
      id: 'tip-3',
      category: 'food',
      title: 'Agua del grifo',
      description: 'El agua del grifo en París es excelente. Pide siempre "Une carafe d\'eau s\'il vous plaît" para evitar cobros.',
      icon: 'cup-soda',
    },
    {
      id: 'tip-4',
      category: 'transport',
      title: 'Metro vs RER',
      description: 'Desde La Défense, la línea 1 es directa al Louvre. El RER C a Versalles es una vuelta enorme.',
      icon: 'map-pin',
    },
    {
      id: 'tip-5',
      category: 'money',
      title: 'Presupuesto picnic',
      description: 'Lleva provisiones del mercado para picnic. El Jardin des Tuileries y el Gran Canal son perfectos.',
      icon: 'wallet',
    },
    {
      id: 'tip-6',
      category: 'general',
      title: 'Bouillon para comer barato',
      description: 'Bouillon Chartier o Pigalle ofrecen comida tradicional francesa a 10-12€ por plato principal.',
      icon: 'utensils',
    },
  ],
  secrets: [
    {
      id: 'secret-1',
      name: 'Place Dauphine',
      description: 'Plaza triangular escondida junto a Notre-Dame donde los locales juegan a la petanca bajo los árboles. Un rincón auténtico y poco turístico.',
      image: '/images/placedauphine.jpg',
      location: 'Île de la Cité',
      dayId: 'day-1',
    },
    {
      id: 'secret-2',
      name: 'Square du Vert-Galant',
      description: 'La punta de la isla, perfecta para ver atardecer sobre el Sena. Un jardín suspendido sobre el agua con vistas incomparables.',
      image: '/images/placedauphine.jpg',
      location: 'Île de la Cité',
      dayId: 'day-1',
    },
    {
      id: 'secret-3',
      name: 'Hameau de la Reine',
      description: 'La aldea rústica donde María Antonieta jugaba a ser campesina. Precioso, menos concurrido y con un romanticismo especial.',
      image: '/images/versailles.jpg',
      location: 'Dominio de Versalles',
      dayId: 'day-2',
    },
    {
      id: 'secret-4',
      name: 'Petit Palais',
      description: 'Entrada gratuita a su colección permanente. Su patio interior con jardín y cafetería es un oasis de paz bellísimo cerca de los Campos Elíseos.',
      image: '/images/petitpalais.jpg',
      location: 'Avenida Winston Churchill',
      dayId: 'day-3',
    },
    {
      id: 'secret-5',
      name: 'Rue de l\'Abreuvoir',
      description: 'Conocida como la calle más bonita de París. Huir de las multitudes de Montmartre para encontrar esta joya con fachadas encantadoras.',
      image: '/images/montmartre.jpg',
      location: 'Montmartre',
      dayId: 'day-4',
    },
    {
      id: 'secret-6',
      name: 'Village Saint-Paul',
      description: 'Red de patios interiores interconectados llenos de anticuarios y artesanos. Un secreto a voces entre los parisinos.',
      image: '/images/placedesvosges.jpg',
      location: 'Le Marais',
      dayId: 'day-4',
    },
    {
      id: 'secret-7',
      name: 'Place des Vosges',
      description: 'La plaza planificada más antigua de la ciudad. Red brick, arcadas perfectas y jardín central. Uno de los lugares más bellos de París.',
      image: '/images/placedesvosges.jpg',
      location: 'Le Marais',
      dayId: 'day-4',
    },
  ],
  days: [
    {
      id: 'day-0',
      date: '2026-05-13',
      label: 'Día 0: Llegada inteligente',
      dayNumber: 0,
      weather: { temp: 18, condition: 'partly-cloudy' },
      expenses: { transport: 0, food: 0, tickets: 0, other: 0 },
      activities: [
        {
          time: '22:00',
          title: 'Llegada y Descanso',
          location: 'Apartamento en Puteaux',
          notes: 'Nada de salir a buscar restaurantes abiertos o supermercados. Utilicen la despensa llena en el maletero para preparar algo rápido, descansen y guarden energías.',
          category: 'relax',
          tips: ['Usa las provisiones del maletero', 'Descansa para los días intensos que vienen'],
        },
      ],
    },
    {
      id: 'day-1',
      date: '2026-05-14',
      label: 'Día 1: El corazón histórico',
      dayNumber: 1,
      weather: { temp: 20, condition: 'sunny' },
      expenses: { transport: 0, food: 0, tickets: 22, other: 0 },
      activities: [
        {
          time: '08:00',
          title: 'Salida hacia el Louvre',
          location: 'Metro Línea 1 (La Défense)',
          notes: 'Directo y toma unos 15-20 min, mucho mejor que el RER.',
          category: 'transport',
          funFact: 'La línea 1 del metro parisino es la más antigua de Francia, inaugurada en 1900.',
        },
        {
          time: '09:00',
          title: 'Museo del Louvre',
          location: 'Palacio del Louvre',
          notes: 'Entrar a las 9:00 es clave. Tres horas es el tiempo perfecto para ver las obras maestras (La Victoria de Samotracia, la Venus de Milo, la Gioconda y la zona egipcia).',
          image: '/images/louvre.jpg',
          price: '~22€',
          category: 'museum',
          funFact: 'El Louvre alberga más de 380,000 obras de arte, pero solo exhibe alrededor de 35,000.',
          tips: ['Reserva con semanas de antelación', 'Ve directo a las obras maestras', 'La zona egipcia es impresionante'],
          coordinates: { lat: 48.8606, lng: 2.3376 },
        },
        {
          time: '12:45',
          title: 'Almuerzo (Picnic)',
          location: 'Jardin des Tuileries',
          notes: 'Coman los bocadillos preparados por la mañana frente al Louvre. Un lujo gratuito.',
          image: '/images/louvre.jpg',
          category: 'food',
          funFact: 'Los jardines fueron diseñados por André Le Nôtre en el siglo XVII.',
          tips: ['Prepara bocadillos por la mañana', 'Encuentra una silla verde clásica'],
          coordinates: { lat: 48.8634, lng: 2.3275 },
        },
        {
          time: '14:00',
          title: 'Île de la Cité y Notre-Dame',
          location: 'Notre-Dame',
          notes: 'Caminar bordeando el Sena hasta la catedral para admirar su reapertura reciente y recorrer el interior.',
          image: '/images/notredame.jpg',
          category: 'sightseeing',
          funFact: 'Notre-Dame tardó casi 200 años en construirse (1163-1345) y su reciente restauración costó más de 800 millones de euros.',
          tips: ['La reapertura tras el incendio es reciente', 'Recorre el interior con calma'],
          coordinates: { lat: 48.8529, lng: 2.3499 },
        },
        {
          time: '16:30',
          title: 'El rincón parisino',
          location: 'Place Dauphine y Square du Vert-Galant',
          notes: 'Busquen la Place Dauphine escondida para ver a los locales jugar petanca. Luego, bajen a la punta de la isla (Square du Vert-Galant) para ver el atardecer sobre el río.',
          image: '/images/placedauphine.jpg',
          category: 'nature',
          funFact: 'La Place Dauphine fue construida por Enrique IV entre 1607 y 1612, en honor a su hijo el Delfín.',
          tips: ['Observa a los locales jugar petanca', 'El atardecer en Square du Vert-Galant es mágico'],
          coordinates: { lat: 48.8565, lng: 2.3424 },
        },
      ],
    },
    {
      id: 'day-2',
      date: '2026-05-15',
      label: 'Día 2: Versalles',
      dayNumber: 2,
      weather: { temp: 22, condition: 'sunny' },
      expenses: { transport: 6, food: 0, tickets: 32, other: 0 },
      activities: [
        {
          time: '08:30',
          title: 'El secreto del transporte',
          location: 'Estación La Défense',
          notes: 'Tren Transilien (Línea L o U) directo a Versailles Rive Droite. Va por la superficie y se camina solo 15 minutos hasta el palacio.',
          price: '~6€',
          category: 'transport',
          funFact: 'El Transilien L pasa por zonas residenciales con vistas encantadoras de la región parisina.',
          tips: ['Evita el RER C desde Puteaux', 'El tren va por superficie con mejores vistas'],
        },
        {
          time: '09:30',
          title: 'Palacio de Versalles',
          location: 'Château de Versailles',
          notes: 'Recorrido interior del palacio. Passeport Versalles: ~32€.',
          image: '/images/versailles.jpg',
          price: '~32€',
          category: 'museum',
          funFact: 'El Palacio de Versalles tiene más de 2,300 habitaciones y fue la residencia de tres reyes de Francia.',
          tips: ['Reserva el Passeport con antelación', 'No te pierdas la Galería de los Espejos'],
          coordinates: { lat: 48.8048, lng: 2.1203 },
        },
        {
          time: '13:30',
          title: 'Almuerzo (Picnic Real)',
          location: 'Gran Canal (Jardines)',
          notes: 'Alquilar bicicleta o caminar hasta el Gran Canal para comer provisiones en el césped, rodeados de cisnes.',
          image: '/images/versailles.jpg',
          category: 'food',
          funFact: 'El Gran Canal mide 1.6 km de largo y fue construido para recrear el Gran Canal de Venecia.',
          tips: ['Lleva provisiones', 'Alquila una bicicleta para llegar más lejos'],
        },
        {
          time: '14:30',
          title: 'El Dominio de María Antonieta',
          location: 'Grand Trianon y Hameau de la Reine',
          notes: 'Visiten el Grand Trianon y la aldea rústica de María Antonieta. Es precioso y menos concurrido.',
          image: '/images/versailles.jpg',
          category: 'sightseeing',
          funFact: 'María Antonieta se escapaba aquí para evitar la rigidez de la corte. El Hameau tenía una granja funcional.',
          tips: ['Es menos concurrido que el palacio principal', 'Una experiencia más íntima'],
        },
      ],
    },
    {
      id: 'day-3',
      date: '2026-05-16',
      label: 'Día 3: La Dama de Hierro',
      dayNumber: 3,
      weather: { temp: 19, condition: 'cloudy' },
      expenses: { transport: 0, food: 18, tickets: 41, other: 0 },
      activities: [
        {
          time: '09:00',
          title: 'Trocadéro y Torre Eiffel',
          location: 'Plaza del Trocadéro (Metro 6 o 9)',
          notes: 'Llegar temprano para las mejores fotos, luego bajar a la torre.',
          image: '/images/eiffel.jpg',
          price: '~25-35€',
          category: 'sightseeing',
          funFact: 'La Torre Eiffel fue construida en 1889 para la Exposición Universal y debía ser demolida en 1909.',
          tips: ['Llega antes de las 9:30 para fotos sin multitudes', 'Reserva con antelación'],
          coordinates: { lat: 48.8584, lng: 2.2945 },
        },
        {
          time: '12:00',
          title: 'Almuerzo barato y tradicional',
          location: 'Bouillon Chartier o Bouillon Pigalle',
          notes: 'Restaurantes históricos de comida tradicional francesa muy barata (platos a 10-12€). Ruidoso, rápido y 100% parisino.',
          price: '~15-20€',
          category: 'food',
          funFact: 'Los Bouillons existen desde el siglo XIX y fueron creados para dar comida económica a los trabajadores.',
          tips: ['Pide "Une carafe d\'eau s\'il vous plaît"', 'Platos principales a 10-12€'],
        },
        {
          time: '14:30',
          title: 'Un secreto cerca del bullicio',
          location: 'Petit Palais',
          notes: 'Entrada gratuita a su colección permanente. Disfruten su patio interior con jardín y cafetería.',
          image: '/images/petitpalais.jpg',
          category: 'museum',
          funFact: 'El Petit Palais fue construido para la Exposición Universal de 1900 y su arquitectura es de estilo Beaux-Arts.',
          tips: ['Entrada gratuita', 'El patio interior es un oasis de paz'],
          coordinates: { lat: 48.8661, lng: 2.3136 },
        },
        {
          time: '16:30',
          title: 'Champs-Élysées y Arco de Triunfo',
          location: 'Avenida y Arco',
          notes: 'Paseo por la avenida. Subir al Arco al atardecer para vistas espectaculares y ver la Torre Eiffel iluminándose.',
          image: '/images/arc.jpg',
          price: '~16€',
          category: 'sightseeing',
          funFact: 'El Arco de Triunfo tiene 284 escalones y en su cima se encendió la llama de la Victoria en 1923.',
          tips: ['Sube al atardecer', 'Vistas espectaculares de la Torre Eiffel iluminándose'],
          coordinates: { lat: 48.8738, lng: 2.295 },
        },
      ],
    },
    {
      id: 'day-4',
      date: '2026-05-17',
      label: 'Día 4: Barrios con alma',
      dayNumber: 4,
      weather: { temp: 21, condition: 'sunny' },
      expenses: { transport: 0, food: 10, tickets: 0, other: 17 },
      activities: [
        {
          time: '09:30',
          title: 'Montmartre',
          location: 'Basílica del Sacré-Cœur',
          notes: 'Suban al Sacré-Cœur y huyan de las multitudes. Busquen la Rue de l\'Abreuvoir, la Plaza Dalida, las Vignes du Clos Montmartre y la Villa Léandre.',
          image: '/images/montmartre.jpg',
          category: 'sightseeing',
          funFact: 'Montmartre fue un pueblo independiente hasta 1860. Artistas como Picasso, Van Gogh y Renoir vivieron aquí.',
          tips: ['Huye de las multitudes de Place du Tertre', 'La Rue de l\'Abreuvoir es la calle más bonita de París'],
          coordinates: { lat: 48.8867, lng: 2.3431 },
        },
        {
          time: '13:30',
          title: 'Le Marais y el Falafel',
          location: 'L\'As du Fallafel (Rue des Rosiers)',
          notes: 'Tomen el metro al barrio Le Marais. Compren shawarma o falafel (~8€) y coman de pie o en un parque cercano.',
          price: '~8€',
          category: 'food',
          funFact: 'La Rue des Rosiers es el corazón del barrio judío de París, con más de 700 años de historia.',
          tips: ['L\'As du Fallafel es legendario', 'Comer de pie es parte de la experiencia'],
        },
        {
          time: '15:00',
          title: 'Rincones secretos del Marais',
          location: 'Place des Vosges y Village Saint-Paul',
          notes: 'Visiten la Place des Vosges. Luego, recorran el Village Saint-Paul, una red de patios llenos de anticuarios y artesanos.',
          image: '/images/placedesvosges.jpg',
          category: 'sightseeing',
          funFact: 'La Place des Vosges fue inaugurada en 1612 con una justa entre Luis XIII y su madre María de Medici.',
          tips: ['La plaza más antigua planificada de París', 'Village Saint-Paul es un secreto local'],
        },
        {
          time: '20:00',
          title: 'Crucero por el Sena',
          location: 'Pont Neuf',
          notes: 'Actividad opcional ideal para cerrar un día económico.',
          price: '~17€',
          image: '/images/seine.jpg',
          category: 'sightseeing',
          funFact: 'Los Bateaux Mouches han navegado el Sena desde 1949 y el Pont Neuf es el puente más antiguo de París.',
          tips: ['El crucero nocturno es más romántico', 'Pont Neuf es el puente más antiguo de París'],
        },
      ],
    },
    {
      id: 'day-5',
      date: '2026-05-18',
      label: 'Día 5: Despedida moderna',
      dayNumber: 5,
      weather: { temp: 20, condition: 'partly-cloudy' },
      expenses: { transport: 0, food: 0, tickets: 0, other: 0 },
      activities: [
        {
          time: '09:00',
          title: 'La Défense y Puteaux',
          location: 'La Défense',
          notes: 'Desayuno tranquilo en Puteaux y caminata por la explanada de La Défense para ver el Grande Arche y la arquitectura ultramoderna.',
          image: '/images/ladefense.jpg',
          category: 'sightseeing',
          funFact: 'La Grande Arche mide 110 metros de alto y está perfectamente alineada con el Arco de Triunfo y el Louvre.',
          tips: ['Contraste fantástico con los días anteriores', 'Hay esculturas al aire libre por todas partes'],
        },
        {
          time: '12:00',
          title: 'Organización y almuerzo',
          location: 'Apartamento en Puteaux',
          notes: 'Regreso al apartamento, organizar el carro, y tener un almuerzo ligero con las últimas provisiones.',
          category: 'relax',
          tips: ['Organiza el carro con tiempo', 'Últimas provisiones del picnic'],
        },
        {
          time: '14:00',
          title: 'Salida a la carretera',
          location: 'Rumbo al próximo destino',
          notes: 'Salida con tiempo y calma. Recuerda usar el abono en la tarjeta Navigo Easy para los viajes en transporte público de días anteriores.',
          category: 'transport',
          tips: ['Salida con calma', 'Revisa que no olvides nada'],
        },
      ],
    },
  ],
};

export const categoryColors: Record<string, { bg: string; text: string; icon: string }> = {
  museum: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'landmark' },
  food: { bg: 'bg-green-50', text: 'text-green-700', icon: 'utensils' },
  transport: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'train' },
  sightseeing: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'camera' },
  nature: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'tree-pine' },
  shopping: { bg: 'bg-pink-50', text: 'text-pink-700', icon: 'shopping-bag' },
  relax: { bg: 'bg-slate-50', text: 'text-slate-700', icon: 'coffee' },
};

export const categoryLabels: Record<string, string> = {
  museum: 'Museo',
  food: 'Gastronomía',
  transport: 'Transporte',
  sightseeing: 'Visita',
  nature: 'Naturaleza',
  shopping: 'Compras',
  relax: 'Descanso',
};

export function getTotalExpenses(day: Day): number {
  return day.expenses.transport + day.expenses.food + day.expenses.tickets + day.expenses.other;
}

export function getTripTotalExpenses(days: Day[]): number {
  return days.reduce((sum, day) => sum + getTotalExpenses(day), 0);
}
