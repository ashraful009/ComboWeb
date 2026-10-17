import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, MapPin, Navigation, Search, Check, Layers, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { useLanguage } from '../context/LanguageContext';
import { bdDistricts } from '../utils/bd_geodata';

// Declare Leaflet global type
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    L: any;
  }
}

interface SelectedLocationInfo {
  address: string;
  district?: string;
  thana?: string;
  lat: number;
  lng: number;
}

interface MapLocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (info: SelectedLocationInfo) => void;
  currentDistrict?: string;
  currentThana?: string;
}

// Default coordinates for major divisions/districts in Bangladesh
const districtCoordinates: Record<string, [number, number]> = {
  Dhaka: [23.8103, 90.4125],
  Chattogram: [22.3569, 91.7832],
  Rajshahi: [24.3636, 88.6241],
  Khulna: [22.8456, 89.5403],
  Sylhet: [24.8949, 91.8687],
  Barishal: [22.7010, 90.3535],
  Rangpur: [25.7439, 89.2752],
  Mymensingh: [24.7471, 90.4203],
  Gazipur: [23.9999, 90.4203],
  Narayanganj: [23.6238, 90.5000],
  Cumilla: [23.4682, 91.1788],
  Bogura: [24.8465, 89.3777],
};

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  currentDistrict,
  currentThana,
}) => {
  const { lang } = useLanguage();
  const tr = (en: string, bn: string) => (lang === 'en' ? en : bn);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentTileLayerRef = useRef<any>(null);

  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);
  const [mapType, setMapType] = useState<'google_roadmap' | 'google_satellite' | 'osm'>('google_roadmap');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);

  // Current selected location state
  const [selectedCoords, setSelectedCoords] = useState<[number, number]>([23.8103, 90.4125]);
  const [formattedAddress, setFormattedAddress] = useState<string>('');
  const [detectedDistrict, setDetectedDistrict] = useState<string>('');
  const [detectedThana, setDetectedThana] = useState<string>('');
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // 1. Dynamically load Leaflet JS if not present
  useEffect(() => {
    if (window.L) {
      setIsLeafletLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => setIsLeafletLoaded(true);
    script.onerror = () => console.error('Failed to load Leaflet script');
    document.head.appendChild(script);
  }, []);

  // Determine starting coordinates
  const getInitialCoords = useCallback((): [number, number] => {
    if (currentDistrict && districtCoordinates[currentDistrict]) {
      return districtCoordinates[currentDistrict];
    }
    return [23.8103, 90.4125]; // Default Dhaka
  }, [currentDistrict]);

  // Reverse geocoding helper (Nominatim with retry/fallback)
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': lang === 'bn' ? 'bn,en' : 'en,bn'
          }
        }
      );
      if (!res.ok) throw new Error('Geocoding request failed');
      const data = await res.json();
      
      const addr = data.address || {};
      
      // Match district from bdDistricts list
      const stateDist = addr.state_district || addr.county || addr.city || addr.state || '';
      const matchedDist = bdDistricts.find(d => 
        stateDist.toLowerCase().includes(d.name.toLowerCase()) || 
        stateDist.toLowerCase().includes(d.bn_name.toLowerCase()) ||
        (data.display_name && data.display_name.toLowerCase().includes(d.name.toLowerCase()))
      );
      
      const distName = matchedDist ? matchedDist.name : (currentDistrict || '');
      setDetectedDistrict(distName);

      // Extract Thana/Area
      const thanaName = addr.suburb || addr.neighbourhood || addr.city_district || addr.town || addr.village || currentThana || '';
      setDetectedThana(thanaName);

      // Build clean, concise street address
      const parts: string[] = [];
      if (addr.house_number) parts.push(`House: ${addr.house_number}`);
      if (addr.building) parts.push(addr.building);
      if (addr.road) parts.push(addr.road);
      if (addr.neighbourhood && addr.neighbourhood !== addr.road) parts.push(addr.neighbourhood);
      if (addr.suburb && !parts.includes(addr.suburb)) parts.push(addr.suburb);
      if (thanaName && !parts.includes(thanaName)) parts.push(thanaName);

      let finalAddr = parts.join(', ');
      if (!finalAddr || parts.length < 2) {
        // Fallback to cleaned display_name without "Bangladesh"
        finalAddr = (data.display_name || '')
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s && !s.toLowerCase().includes('bangladesh') && !/^\d{4}$/.test(s))
          .slice(0, 4)
          .join(', ');
      }

      setFormattedAddress(finalAddr || data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
      setFormattedAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setIsGeocoding(false);
    }
  }, [lang, currentDistrict, currentThana]);

  // Helper to switch map tile layer
  const applyTileLayer = useCallback((map: any, type: 'google_roadmap' | 'google_satellite' | 'osm') => {
    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const L = window.L;
    let newLayer;

    if (type === 'google_roadmap') {
      newLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        attribution: '&copy; Google Maps'
      });
    } else if (type === 'google_satellite') {
      newLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        attribution: '&copy; Google Maps Satellite'
      });
    } else {
      newLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      });
    }

    newLayer.addTo(map);
    currentTileLayerRef.current = newLayer;
  }, []);

  // 2. Initialize map when modal opens and Leaflet is loaded
  useEffect(() => {
    if (!isOpen || !isLeafletLoaded || !mapContainerRef.current) return;

    const L = window.L;
    if (!L) return;

    const startCoords = getInitialCoords();
    setSelectedCoords(startCoords);

    // Clean up previous instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Create Leaflet map instance
    const map = L.map(mapContainerRef.current, {
      center: startCoords,
      zoom: 16,
      zoomControl: false,
    });
    mapInstanceRef.current = map;

    // Add zoom control on bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add Google Roadmap tile layer by default
    applyTileLayer(map, mapType);

    // Custom pulse pin icon
    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="position: relative; transform: translate(-50%, -100%);">
          <svg width="38" height="48" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
            <path d="M12 0C5.37258 0 0 5.37258 0 12C0 19.5 12 30 12 30C12 30 24 19.5 24 12C24 5.37258 18.6274 0 12 0Z" fill="#16a34a"/>
            <circle cx="12" cy="11" r="5" fill="#ffffff"/>
            <circle cx="12" cy="11" r="2.5" fill="#16a34a"/>
          </svg>
          <div style="width: 12px; height: 6px; background: rgba(0,0,0,0.25); border-radius: 50%; margin: -4px auto 0 auto; filter: blur(1px);"></div>
        </div>
      `,
      iconSize: [38, 48],
      iconAnchor: [19, 48],
    });

    // Create Draggable Marker
    const marker = L.marker(startCoords, {
      draggable: true,
      icon: customIcon,
    }).addTo(map);
    markerRef.current = marker;

    // Trigger initial reverse geocode
    reverseGeocode(startCoords[0], startCoords[1]);

    // Handle marker drag end
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      const coords: [number, number] = [position.lat, position.lng];
      setSelectedCoords(coords);
      reverseGeocode(position.lat, position.lng);
    });

    // Handle map click
    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setSelectedCoords([lat, lng]);
      reverseGeocode(lat, lng);
    });

    // Invalidate map size after animation/render
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, isLeafletLoaded, getInitialCoords, applyTileLayer, reverseGeocode]);

  // Handle Map Type Change
  const handleMapTypeChange = (newType: 'google_roadmap' | 'google_satellite' | 'osm') => {
    setMapType(newType);
    if (mapInstanceRef.current) {
      applyTileLayer(mapInstanceRef.current, newType);
    }
  };

  // 3. User Geolocation / GPS
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert(tr('Geolocation is not supported by your browser.', 'আপনার ব্রাউজারে লোকেশন সার্ভিস সাপোর্ট করছে না।'));
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        const coords: [number, number] = [latitude, longitude];

        setSelectedCoords(coords);
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo(coords, 18, { animate: true, duration: 1 });
          markerRef.current.setLatLng(coords);
        }
        reverseGeocode(latitude, longitude);
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation error:', error);
        alert(tr('Could not access your location. Please check browser permissions or search manually.', 'আপনার বর্তমান লোকেশন পাওয়া যায়নি। অনুগ্রহ করে ব্রাউজার পারমিশন চেক করুন অথবা সার্চ করুন।'));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // 4. Place Search (Nominatim inside Bangladesh)
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery + ' Bangladesh'
        )}&countrycodes=bd&limit=5&addressdetails=1`
      );
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setSearchResults(data);
      setShowResultsDropdown(true);
    } catch (err) {
      console.warn('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Select Search Result
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    const coords: [number, number] = [lat, lon];

    setSelectedCoords(coords);
    setShowResultsDropdown(false);
    setSearchQuery(result.display_name.split(',')[0]);

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo(coords, 17, { animate: true, duration: 1 });
      markerRef.current.setLatLng(coords);
    }

    reverseGeocode(lat, lon);
  };

  // 5. Confirm and apply location
  const handleConfirm = () => {
    onSelectLocation({
      address: formattedAddress,
      district: detectedDistrict,
      thana: detectedThana,
      lat: selectedCoords[0],
      lng: selectedCoords[1],
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                {tr('Select Delivery Location', 'ডেলিভারি লোকেশন নির্বাচন করুন')}
              </h3>
              <p className="text-xs text-slate-500">
                {tr('Drag the pin or click on the map to pinpoint your location', 'ম্যাপে পিন টেনে অথবা ক্লিক করে সঠিক অবস্থান চিহ্নিত করুন')}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-3 bg-white border-b border-slate-100 space-y-2">
          <form onSubmit={handleSearch} className="relative flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={tr('Search area, road, or landmark in Bangladesh...', 'এলাকা, রোড বা ল্যান্ডমার্ক সার্চ করুন (উদাঃ মিরপুর ১০, বনানী)...')}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              {isSearching && (
                <Loader2 className="w-4 h-4 text-primary animate-spin absolute right-3 top-2.5" />
              )}
            </div>
            <Button type="submit" variant="primary" className="px-4 py-2 text-xs sm:text-sm font-semibold h-auto">
              {tr('Search', 'খুঁজুন')}
            </Button>
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={isLocating}
              title={tr('Use My Current Location', 'আমার বর্তমান অবস্থান')}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 shrink-0"
            >
              {isLocating ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              ) : (
                <Navigation className="w-4 h-4 text-emerald-600" />
              )}
              <span className="hidden sm:inline">{tr('My Location', 'আমার অবস্থান')}</span>
            </button>
          </form>

          {/* Search Results Dropdown */}
          {showResultsDropdown && searchResults.length > 0 && (
            <div className="absolute left-3 right-3 top-28 z-[1000] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 flex items-start gap-2.5 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{res.display_name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Map Layer Switcher Tabs */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5 px-1">
            <div className="flex items-center gap-1.5 font-medium">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>{tr('Map View:', 'ম্যাপ ভিউ:')}</span>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => handleMapTypeChange('google_roadmap')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                    mapType === 'google_roadmap' ? 'bg-white text-primary shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Google Map
                </button>
                <button
                  type="button"
                  onClick={() => handleMapTypeChange('google_satellite')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                    mapType === 'google_satellite' ? 'bg-white text-primary shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Satellite
                </button>
                <button
                  type="button"
                  onClick={() => handleMapTypeChange('osm')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                    mapType === 'osm' ? 'bg-white text-primary shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  OSM
                </button>
              </div>
            </div>
            <span className="hidden sm:inline text-[11px] text-slate-400">
              💡 {tr('Click or drag pin to position', 'পিনটি টেনে বা ক্লিক করে অবস্থান ঠিক করুন')}
            </span>
          </div>
        </div>

        {/* Map Viewport Container */}
        <div className="relative flex-1 w-full min-h-[320px] sm:min-h-[380px] bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full min-h-[320px] sm:min-h-[380px]" />
          
          {/* Overlay loading spinner */}
          {(!isLeafletLoaded || isGeocoding) && (
            <div className="absolute top-3 left-3 z-[400] bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-full shadow-md border border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-700">
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
              <span>{isGeocoding ? tr('Detecting address...', 'ঠিকানা শনাক্ত করা হচ্ছে...') : tr('Loading map...', 'ম্যাপ লোড হচ্ছে...')}</span>
            </div>
          )}
        </div>

        {/* Selected Address Card & Confirmation Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-0.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>{tr('Selected Address:', 'নির্বাচিত ঠিকানা:')}</span>
              {detectedDistrict && (
                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px]">
                  {detectedDistrict} {detectedThana ? `• ${detectedThana}` : ''}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-800 line-clamp-2">
              {formattedAddress || tr('Move the pin on the map to detect your location address', 'ঠিকানা শনাক্ত করতে ম্যাপে পিনটি সরান')}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm h-auto"
            >
              {tr('Cancel', 'বাতিল')}
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={!formattedAddress || isGeocoding}
              className="px-5 py-2 text-xs sm:text-sm h-auto font-semibold shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{tr('Use This Address', 'এই ঠিকানাটি ব্যবহার করুন')}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
