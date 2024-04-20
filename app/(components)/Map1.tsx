import { useEffect, useRef } from "react";
import "ol/ol.css";
import * as ol from "ol";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import Overlay from "ol/Overlay";
import { fromLonLat } from "ol/proj";
import { Draw, Modify, Snap } from "ol/interaction";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import { Map, Feature } from "ol";
import { getArea, getLength } from "ol/sphere";

// Importing specific geometry types from OpenLayers
import Polygon from "ol/geom/Polygon";
import LineString from "ol/geom/LineString";

// Defining interface for props expected by the Map1 component
interface MapProps {
  setMap1Object: any; // Using 'any' for setMap1Object prop
}

// Map1 component
const Map1: React.FC<MapProps> = ({ setMap1Object }) => {
  const map1Container = useRef<any>(null); // Reference to map container with 'any'
  const map1Object = useRef<any>(null); // Reference to map object with 'any'
  const measureTooltipElement = useRef<any>(null); // Reference to tooltip element with 'any'
  const measureTooltip = useRef<any>(null); // Reference to tooltip overlay with 'any'

  // useEffect hook to initialize map and set up interactions
  useEffect(() => {
    const map = new Map({
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
    });

    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        fill: new Fill({
          color: "rgba(255, 255, 255, 0.2)",
        }),
        stroke: new Stroke({
          color: "#ffcc33",
          width: 2,
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: "#ffcc33",
          }),
        }),
      }),
    });
    map.addLayer(vectorLayer);

    const drawInteraction = new Draw({
      source: vectorSource,
      type: "Polygon",
      style: new Style({
        fill: new Fill({
          color: "rgba(255, 255, 255, 0.2)",
        }),
        stroke: new Stroke({
          color: "#ffcc33",
          width: 2,
        }),
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({ color: "red" }),
          stroke: new Stroke({ color: "white", width: 1 }),
        }),
      }),
    });

    map.addInteraction(drawInteraction);

    const modifyInteraction = new Modify({ source: vectorSource });
    map.addInteraction(modifyInteraction);

    const snapInteraction = new Snap({ source: vectorSource });
    map.addInteraction(snapInteraction);

    // Event listeners for draw start and end
    drawInteraction.on("drawstart", (event: any) => {
      createMeasureTooltip();
    });

    drawInteraction.on("drawend", (event: any) => {
      if (measureTooltipElement.current) {
        measureTooltipElement.current.classList.add("hidden");
      }
    });

    // Event listener for map click
    map.on("click", (event: any) => {
      const features = map.getFeaturesAtPixel(event.pixel);
      if (features && features.length > 0) {
        const geometry = features[0].getGeometry();
        if (geometry) {
          if (geometry instanceof Polygon) {
            const area = getArea(geometry);
            const formattedArea = formatArea(area);
            showTooltip(event.coordinate, formattedArea);
          } else if (geometry instanceof LineString) {
            const length = getLength(geometry);
            const formattedLength = formatLength(length);
            showTooltip(event.coordinate, formattedLength);
          }
        }
      }
    });

    // Setting map target and updating state
    if (map1Container.current) {
      map.setTarget(map1Container.current);
    }

    setMap1Object(map);
    map1Object.current = map;

    // Cleanup function
    return () => {
      if (map1Container.current) {
        map.setTarget(undefined);
      }
      setMap1Object(null);
    };
  }, [setMap1Object]);

  // Function to create measure tooltip
  const createMeasureTooltip = () => {
    if (measureTooltipElement.current && map1Object.current) {
      measureTooltipElement.current.parentNode?.removeChild(
        measureTooltipElement.current
      );
      measureTooltipElement.current = document.createElement("div");
      measureTooltipElement.current.className = "tooltip tooltip-measure";
      measureTooltipElement.current.classList.add("hidden");
      measureTooltip.current = new Overlay({
        element: measureTooltipElement.current,
        offset: [0, -15],
        positioning: "bottom-center",
      });
      map1Object.current.addOverlay(measureTooltip.current);
    }
  };

  // Function to show tooltip
  const showTooltip = (coordinate: [number, number], text: string) => {
    if (measureTooltipElement.current && measureTooltip.current) {
      measureTooltipElement.current.innerHTML = text;
      measureTooltip.current.setPosition(coordinate);
      measureTooltipElement.current.classList.remove("hidden");
    }
  };

  // Function to format length
  const formatLength = (length: number) => {
    let output;
    if (length > 1000) {
      output = Math.round((length / 1000) * 100) / 100 + " km";
    } else {
      output = Math.round(length * 100) / 100 + " m";
    }
    return output;
  };

  // Function to format area
  const formatArea = (area: number) => {
    let output;
    if (area > 10000) {
      output = Math.round((area / 1000000) * 100) / 100 + " km<sup>2</sup>";
    } else {
      output = Math.round(area * 100) / 100 + " m<sup>2</sup>";
    }
    return output;
  };

  // Rendering map container
  return (
    <div ref={map1Container} className="absolute inset-0 w-full h-full"></div>
  );
};

export default Map1;
