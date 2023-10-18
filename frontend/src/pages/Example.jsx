import { ResponsiveGeoMap } from '@nivo/geo'
import * as countries from "../../world_countries.json"

export default function Example(){
  console.log(countries);
  return (
    <div className=" h-full w-full flex flex-col items-center justify-start">
      <div className="h-[500px] w-[800px]">
        <ResponsiveGeoMap
            features={countries.features}
            borderWidth={0.5}
        />
      </div>
      <h1 className="text-3xl font-bold text-center mt-8">
        Hello example!
      </h1>
    </div>
  )
}
