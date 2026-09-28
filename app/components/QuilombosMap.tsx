'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, LayerGroup } from 'react-leaflet';

interface Quilombo {
  id: string;
  nome: string;
  us_referencia: string;
  lat: number;
  lon: number;
  pop_ibge_setor: number;
  pop_estimativa_local: number;
}

export default function QuilombosMap() {
  const [quilombos, setQuilombos] = useState<Quilombo[]>([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  fetch('https://cautious-parakeet-r7gw7w56654w3x976-8000.app.github.dev/api/quilombos')
    .then((res) => res.json())
    .then((data) => {
      // Garante que pega a lista tratada, mesmo que venha em data.data ou direto em data
      const lista = Array.isArray(data) ? data : data.data || [];
      setQuilombos(lista);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Erro ao carregar quilombos:", err);
      setQuilombos([]); // Garante array vazio em caso de erro de rede
      setLoading(false);
    });
}, []);

  if (loading) {
    return <div className="p-4 text-center">Carregando mapa dos quilombos...</div>;
  }

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden shadow-lg border border-slate-700">
      <MapContainer 
        center={[-30.0400, -51.1800]} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
      >
        {/* TileLayer do Esri que contorna o erro 403 do OSM */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          attribution="&copy; Esri &mdash; IBGE Censo 2022"
        />

        <LayerGroup>
          {quilombos.map((q) => (
            <CircleMarker
              key={q.id}
              center={[q.lat, q.lon]}
              radius={Math.min(q.pop_ibge_setor / 15, 20) + 4}
              pathOptions={{
                color: '#1b4f72',
                fillColor: '#2980b9',
                fillOpacity: 0.75,
              }}
            >
              <Popup>
                <div className="p-1 font-sans text-slate-900">
                  <h3 className="font-bold text-base text-sky-900 m-0 mb-1">{q.nome}</h3>
                  <p className="text-xs bg-slate-100 p-1 rounded font-semibold text-slate-700 my-1">
                    🏥 Unidade de Saúde: {q.us_referencia}
                  </p>
                  <div className="text-xs border-t border-slate-200 pt-1 mt-1 space-y-1">
                    <p className="m-0 text-emerald-700 font-medium">
                      <strong>IBGE (Setor Censitário):</strong> {q.pop_ibge_setor} autodeclarados
                    </p>
                    <p className="m-0 text-rose-700 font-medium">
                      <strong>Estimativa Territorial:</strong> ~{q.pop_estimativa_local} moradores
                    </p>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </LayerGroup>
      </MapContainer>
    </div>
  );
}