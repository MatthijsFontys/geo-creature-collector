import * as proj4 from 'proj4';

export const GEO_JSON_EPSG = 'EPSG:4326';
export const NL_EPSG = 'EPSG:28992';


proj4.defs([
  [
    /**
     * WGS84 (EPSG:4326) - Standard global coordinate system used by GPS
     * Represents coordinates in latitude and longitude
     */
    GEO_JSON_EPSG, 
    '+proj=longlat +datum=WGS84 +no_defs'
  ],
  [
    /**
     * Dutch RD New (EPSG:28992) - Official coordinate system for the Netherlands
     * Used for precise mapping and geospatial operations within the Netherlands
     */
    NL_EPSG, 
    '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs'
  ]
]);
