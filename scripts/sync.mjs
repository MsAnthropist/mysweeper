// Pulls the RPP (zone G) and street sweeping datasets from data.sf.gov and
// writes them into data/ for the web app to fetch directly.
//
// Requires Node 18+ (native fetch). Run with:
//   SOCRATA_APP_TOKEN=xxx node scripts/sync.mjs
//
// The app token is read from an environment variable rather than hardcoded
// here, since this repo (and this script) will likely be public — set
// SOCRATA_APP_TOKEN as a GitHub Actions secret rather than committing it.

import { writeFile } from 'node:fs/promises';

const APP_TOKEN = process.env.SOCRATA_APP_TOKEN;
if (!APP_TOKEN) {
  console.error('Missing SOCRATA_APP_TOKEN environment variable.');
  process.exit(1);
}

const RPP_QUERY = "SELECT * WHERE `rpparea1`='G' OR `rpparea2`='G' OR `rpparea3`='G'";

const SOURCES = {
  'data/rpp.geojson': `https://data.sf.gov/api/v3/views/hi6h-neyh/query.geojson?app_token=${APP_TOKEN}&query=${encodeURIComponent(RPP_QUERY)}`,
  'data/sweeping.geojson': `https://data.sf.gov/api/v3/views/yhqp-riqs/query.geojson?app_token=${APP_TOKEN}`,
};

async function fetchAllPages(baseUrl, pageSize = 1000) {
  let features = [];
  let pageNumber = 1;
  while (true) {
    const url = `${baseUrl}&pageSize=${pageSize}&pageNumber=${pageNumber}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed (${res.status}): ${url}`);
    const page = await res.json();
    features = features.concat(page.features);
    if (page.features.length < pageSize) break;
    pageNumber++;
  }
  return { type: 'FeatureCollection', features };
}

async function main() {
  for (const [path, url] of Object.entries(SOURCES)) {
    const collection = await fetchAllPages(url);
    await writeFile(path, JSON.stringify(collection));
    console.log(`Wrote ${collection.features.length} features to ${path}`);
  }

  await writeFile(
    'data/last-synced.json',
    JSON.stringify({ synced_at: new Date().toISOString() })
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
