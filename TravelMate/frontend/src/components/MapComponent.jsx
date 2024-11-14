import React, { useState, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';

const MapComponent = ({ width = '100%', height = '300px' }) => {
  const containerStyle = {
    width: width,
    height: height,
  };

  const center = {
    lat: 39.8283, // Default center (USA)
    lng: -98.5795,
  };

  const [mapCenter, setMapCenter] = useState(center);
  const autocompleteRef = useRef(null); // Ref for Autocomplete component

  const handlePlaceSelected = () => {
    const place = autocompleteRef.current.getPlace();
    if (place && place.geometry) {
      const location = place.geometry.location;
      setMapCenter({ lat: location.lat(), lng: location.lng() });
    } else {
      alert("Location not found");
    }
  };

  return (
    <div>
      <LoadScript googleMapsApiKey="AIzaSyCbJ9OEK1bSd7DLg2XHOE8zT2PlBxODR1g" libraries={['places']}>
        <Autocomplete
          onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
          onPlaceChanged={handlePlaceSelected}
        >
          <input
            type="text"
            placeholder="Search location"
            style={{ width: '80%', padding: '8px' }}
          />
        </Autocomplete>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={5}
        >
          <Marker position={mapCenter} />
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default MapComponent;
