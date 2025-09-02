import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export function useGeolocation(options: GeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false,
  });
  const [isRequesting, setIsRequesting] = useState(false);

  const {
    enableHighAccuracy = true,
    timeout = 15000,
    maximumAge = 300000, // 5 minutes
  } = options;

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        loading: false,
      }));
      return;
    }

    // Prevent multiple simultaneous requests
    if (isRequesting) {
      return;
    }

    setIsRequesting(true);
    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });
        setIsRequesting(false);
      },
      (error) => {
        let errorMessage = 'An unknown error occurred';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }

        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
        setIsRequesting(false);
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );
  };

  useEffect(() => {
    let isMounted = true;
    
    // Modified getCurrentPosition for cleanup awareness
    const getPositionWithCleanup = () => {
      if (!navigator.geolocation) {
        if (isMounted) {
          setState(prev => ({
            ...prev,
            error: 'Geolocation is not supported by this browser',
            loading: false,
          }));
        }
        return;
      }

      if (isRequesting) return;

      setIsRequesting(true);
      if (isMounted) {
        setState(prev => ({ ...prev, loading: true, error: null }));
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (isMounted) {
            setState({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              error: null,
              loading: false,
            });
            setIsRequesting(false);
          }
        },
        (error) => {
          if (isMounted) {
            let errorMessage = 'An unknown error occurred';
            
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location access denied by user';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information is unavailable';
                break;
              case error.TIMEOUT:
                errorMessage = 'Location request timed out';
                break;
            }

            setState(prev => ({
              ...prev,
              error: errorMessage,
              loading: false,
            }));
            setIsRequesting(false);
          }
        },
        { enableHighAccuracy, timeout, maximumAge }
      );
    };
    
    // Automatically request location on hook initialization
    getPositionWithCleanup();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return {
    ...state,
    getCurrentPosition,
    isSupported: !!navigator.geolocation,
  };
}