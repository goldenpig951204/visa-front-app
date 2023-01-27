import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps";

const MapWithAMarker = withScriptjs(withGoogleMap(props => {
  let { lat, lng } = props;

  return (
    <GoogleMap
      defaultZoom={12}
      defaultCenter={{ lat: lat ? lat : -34.397, lng: lng ? lng : 150.644 }}
    >
      <Marker position={{ lat: lat ? lat : -34.397, lng: lng ? lng : 150.644 }} />
    </GoogleMap>
  )
}))

const Map = (props) => {
  let { lat, lng } = props

  return (
    <MapWithAMarker
      googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY}&v=3.exp&libraries=geometry,drawing,places`}
      loadingElement={<div style={{ height: `100%` }} />}
      containerElement={<div style={{ height: `100%` }} />}
      mapElement={<div style={{ height: `100%` }} />}
      lat={lat}
      lng={lng}
    />
  )
}

export default Map;
