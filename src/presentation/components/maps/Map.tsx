import { useRef, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Location } from '../../../infrastructure/interfaces/location';
import { useLocationStore } from '../../store/location/useLocationStore';
import { FAB } from '../ui/FAB';

interface Props {
  showUserLocation?: boolean;
  initialLocation: Location;
}

export const Map = ( { showUserLocation = true, initialLocation }: Props ) => {

  const mapRef = useRef<MapView | null>();
  const cameraLocation = useRef<Location>( initialLocation );
  const [ isFollowingUser, setIsFollowingUser ] = useState( true );
  const [ isShowingPolyline, setIsShowingPolyline ] = useState( true );

  const { getLocation, lastKnownLocation, watchLocation, clearWatchLocation, userLocationList } = useLocationStore();

  const moveCameraToLocation = ( location: Location ) => {
    if ( !lastKnownLocation ) {
      moveCameraToLocation( initialLocation );
    }

    if ( !mapRef.current ) return;

    mapRef.current.animateCamera( { center: location } );
  };

  const moveToCurrentLocation = async () => {
    const location = await getLocation();
    if ( !location ) return;
    moveCameraToLocation( location );
  };

  useEffect( () => {
    watchLocation();
    return () => {
      clearWatchLocation();
    };
  }, [] );

  useEffect( () => {
    if ( lastKnownLocation && isFollowingUser ) {
      moveCameraToLocation( lastKnownLocation );
    }
  }, [ lastKnownLocation, isFollowingUser ] );

  return (
    <>
      <MapView
        ref={ ( map ) => mapRef.current = map! }
        showsUserLocation={ showUserLocation }
        provider={ Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE }
        style={ { flex: 1 } }
        onTouchStart={ () => setIsFollowingUser( false ) }
        region={ {
          latitude: cameraLocation.current.latitude,
          longitude: cameraLocation.current.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        } }
      >

        <Marker coordinate={ {
          latitude: 37.78825,
          longitude: -122.4324,
        } }
          title="Este es el titulo del marcador"
          description="Este es el cuerpo del marcador"
          image={ require( '../../../assets/custom-marker.png' ) }
        />

        { isShowingPolyline && (
          <Polyline
            coordinates={ userLocationList }
            strokeColor="black"
            strokeWidth={ 5 }
          />
        ) }

      </MapView>

      <FAB
        iconName={ isShowingPolyline ? 'eye-outline' : 'eye-off-outline' }
        onPress={ () => setIsShowingPolyline( !isShowingPolyline ) }
        style={ {
          bottom: 140,
          right: 20,
        } }
      />

      <FAB
        iconName={ isFollowingUser ? 'walk-outline' : 'accessibility-outline' }
        onPress={ () => setIsFollowingUser( !isFollowingUser ) }
        style={ {
          bottom: 80,
          right: 20,
        } }
      />

      <FAB
        iconName="compass-outline"
        onPress={ moveToCurrentLocation }
        style={ {
          bottom: 20,
          right: 20,
        } }
      />

    </>
  );
};