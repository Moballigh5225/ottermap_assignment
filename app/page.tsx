// Import React hooks and components
import { useEffect, useState } from "react";
// @ts-ignore Suppress error for missing type declaration
import Synchronize from "ol-ext/interaction/Synchronize";
import Map1 from "./(components)/Map1"; // Import Map1 component
import "ol-ext/dist/ol-ext.css"; // Import OpenLayers-Ext CSS

// Define DualMap component
function DualMap() {
  // State to hold the reference to the map object
  const [map1Object, setMap1Object] = useState<any>(null);

  // useEffect hook to synchronize maps when map1Object changes
  useEffect(() => {
    // Check if map1Object is not null
    if (!map1Object) return;

    // Create a Synchronize interaction to sync both maps
    const synchronize_12 = new Synchronize({ maps: [map1Object] });

    // Add the synchronize interaction to map1Object
    map1Object.addInteraction(synchronize_12);

    // Cleanup function to remove the synchronize interaction when component unmounts or map1Object changes
    return () => {
      if (map1Object) map1Object.removeInteraction(synchronize_12);
    };
  }, [map1Object]);

  // Render DualMap component
  return (
    <div className="flex h-[100vh] gap-[2px] bg-white/70">
      <div className="relative w-full border border-transparent">
        {/* Render Map1 component and pass setMap1Object function as prop */}
        <Map1 setMap1Object={setMap1Object} />
      </div>
    </div>
  );
}

// Export DualMap component as default
export default DualMap;
