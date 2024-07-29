import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, MarkerF } from '@react-google-maps/api'; // Используйте MarkerF для совместимости с последними версиями

const IPInfo = () => {
  const [ipInfo, setIpInfo] = useState(null);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const VITE_IPINFO_TOKEN = import.meta.env.VITE_IPINFO_TOKEN;
  const VITE_GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  useEffect(() => {
    const fetchIPInfo = async () => {
      try {
        // Попытка получить текущий IP
        const response = await axios.get(`https://ipinfo.io/json?token=${VITE_IPINFO_TOKEN}`);
        const ip = response.data.ip;

        // Проверка на локальный IP
        if (ip.startsWith('192.168') || ip.startsWith('10.') || ip.startsWith('172.') || ip === '127.0.0.1') {
          throw new Error('Local IP detected');
        }

        setIpInfo(response.data);

        // Установка центра карты
        const [lat, lon] = response.data.loc.split(',');
        setMapCenter({ lat: parseFloat(lat), lng: parseFloat(lon) });

      } catch (err) {
        // Если ошибка, берем случайный IP
        const randomIP = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
        try {
          const response = await axios.get(`https://ipinfo.io/${randomIP}/json?token=${VITE_IPINFO_TOKEN}`);
          setIpInfo(response.data);

          // Установка центра карты
          const [lat, lon] = response.data.loc.split(',');
          setMapCenter({ lat: parseFloat(lat), lng: parseFloat(lon) });

        } catch (err) {
          setError('Failed to fetch IP information');
        }
      }
    };

    fetchIPInfo();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  if (!ipInfo || !mapCenter) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>IP Information</h1>
      <p><strong>IP:</strong> {ipInfo.ip}</p>
      <p><strong>City:</strong> {ipInfo.city}</p>
      <p><strong>Region:</strong> {ipInfo.region}</p>
      <p><strong>Country:</strong> {ipInfo.country}</p>
      <p><strong>Org:</strong> {ipInfo.org}</p>
      <p><strong>Mobile:</strong> {ipInfo.mobile || 'Not available'}</p>

      <div style={{ height: '400px', width: '100%' }}>
        <LoadScript googleMapsApiKey={VITE_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={{ height: '100%', width: '100%' }}
            center={mapCenter}
            zoom={12}
          >
            <MarkerF position={mapCenter} />
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
};

export default IPInfo;
