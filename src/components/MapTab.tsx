import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { geocodeLocation } from '../lib/geocoding';
import type { GeoPoint } from '../lib/geocoding';
import { getRoute } from '../lib/routing';
import type { Activity } from '../data/itinerary';
import { Loader2, MapPin } from 'lucide-react';

// Fix for Leaflet default icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapTabProps {
  activities: Activity[];
  destination: string;
}

function RecenterMap({ points }: { points: GeoPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);
  return null;
}

export function MapTab({ activities, destination }: MapTabProps) {
  const [points, setPoints] = useState<GeoPoint[]>([]);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPointsAndRoute() {
      setIsLoading(true);
      const geoPoints: GeoPoint[] = [];
      
      for (const activity of activities) {
        // Usamos el destino como contexto para evitar confusiones geográficas
        const point = await geocodeLocation(activity.location, activity.title, destination);
        if (point) {
          geoPoints.push(point);
        }
      }
      
      setPoints(geoPoints);

      if (geoPoints.length >= 2) {
        const realRoute = await getRoute(geoPoints);
        setRoute(realRoute);
      } else {
        setRoute(geoPoints.map(p => [p.lat, p.lng]));
      }

      setIsLoading(false);
    }

    loadPointsAndRoute();
  }, [activities, destination]);

  if (isLoading) {
    return (
      <div className="h-[500px] bg-stone/20 rounded-3xl flex flex-col items-center justify-center gap-4 border border-stone/50 backdrop-blur-sm">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
        <p className="text-midnight/60 font-medium">Geolocalizando paradas del día...</p>
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div className="h-[500px] bg-stone/20 rounded-3xl flex flex-col items-center justify-center gap-4 border border-stone/50">
        <MapPin className="w-8 h-8 text-midnight/20" />
        <p className="text-midnight/40">No se pudieron localizar las direcciones en el mapa.</p>
      </div>
    );
  }

  return (
    <div className="h-[500px] rounded-3xl overflow-hidden shadow-dramatic border border-stone relative z-0">
      <MapContainer 
        center={[points[0].lat, points[0].lng]} 
        zoom={13} 
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {points.map((point, idx) => (
          <Marker key={idx} position={[point.lat, point.lng]}>
            <Popup>
              <div className="font-sans">
                <strong className="text-midnight block mb-1">{idx + 1}. {point.title}</strong>
                <span className="text-xs text-muted-foreground">{activities[idx].time}</span>
              </div>
            </Popup>
          </Marker>
        ))}

        <Polyline 
          positions={route} 
          pathOptions={{ color: '#D4AF37', weight: 5, opacity: 0.8 }} 
        />
        
        <RecenterMap points={points} />
      </MapContainer>
    </div>
  );
}
