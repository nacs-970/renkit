import { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface Props {
  onGenerate: (location: string, radius: number) => void;
}

export const LocationScanner = ({ onGenerate }: Props) => {
  const [address, setAddress] = useState('');
  const [radius, setRadius] = useState(5);
  const autoCompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '',
      version: 'weekly',
      libraries: ['places']
    });

    (loader as any).load().then(() => {
      if (inputRef.current && !autoCompleteRef.current) {
        autoCompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['geocode']
        });

        autoCompleteRef.current.addListener('place_changed', () => {
          const place = autoCompleteRef.current?.getPlace();
          if (place?.formatted_address) {
            setAddress(place.formatted_address);
          }
        });
      }
    }).catch((err: Error) => {
      console.error('Error loading Google Maps:', err);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(address, radius);
  };

  return (
    <form onSubmit={handleSubmit} style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '20px', 
      maxWidth: '400px', 
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '12px', textTransform: 'uppercase', color: '#666' }}>Starting Point</label>
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter city or zip code..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{ 
            padding: '12px', 
            border: '1px solid #000', 
            fontFamily: 'Times New Roman, serif',
            fontSize: '18px'
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '12px', textTransform: 'uppercase', color: '#666' }}>
          Radius: {radius} km
        </label>
        <input
          type="range"
          min="1"
          max="50"
          value={radius}
          onChange={(e) => setRadius(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: '#000' }}
        />
      </div>

      <button 
        type="submit"
        disabled={!address}
        style={{ 
          background: '#000', 
          color: '#fff', 
          padding: '15px', 
          border: 'none', 
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginTop: '10px'
        }}
      >
        Generate Ticket
      </button>
    </form>
  );
};
