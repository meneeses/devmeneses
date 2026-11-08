// Generates src/content/mapDots.json: land dots for the Atlantic region (Curitiba → Valencia map).
// Run: node scripts/build-map.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { feature } from 'topojson-client'
import { geoContains } from 'd3-geo'

const topo = JSON.parse(readFileSync('node_modules/world-atlas/land-50m.json', 'utf8'))
const land = feature(topo, topo.objects.land)

export const BOUNDS = { lonMin: -95, lonMax: 35, latMin: -45, latMax: 62 }
const STEP = 1.25
const dots = []
for (let lat = BOUNDS.latMax; lat >= BOUNDS.latMin; lat -= STEP) {
  for (let lon = BOUNDS.lonMin; lon <= BOUNDS.lonMax; lon += STEP) {
    if (geoContains(land, [lon, lat])) dots.push([+lon.toFixed(2), +lat.toFixed(2)])
  }
}
writeFileSync('src/content/mapDots.json', JSON.stringify({ bounds: BOUNDS, step: STEP, dots }))
console.log('dots:', dots.length)
