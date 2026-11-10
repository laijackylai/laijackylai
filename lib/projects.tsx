import type { ReactNode } from 'react'
import { PITCHPOSE, RBRMESH, type Study } from './case-studies'

export type Shot = { src: string, alt: string, width: number, height: number, caption: [string, string] }
export type Project = {
  id: string, kind: string, title: string, sub: ReactNode, points?: ReactNode[], tags?: string[],
  links?: { href: string, label: string, icon?: string }[], shot?: Shot, aside?: 'takcarly' | 'stack',
  study?: Study,
}

export const PROJECTS: Project[] = [
  {
    id: 'rbrmesh', kind: '3D reconstruction', title: 'rbrmesh',
    sub: 'Turns 360° road video into a textured, drivable stage for Richard Burns Rally.',
    points: ['12-stage pipeline with typed, hashed TOML configs and QA checks at every stage.', 'Camera poses and depth from MASt3R and Depth Anything V2; road found with SegFormer.', 'Continuous road mesh refined against multiple views, exported to the game via Blender.', 'Python, PyTorch, Open3D, OpenCV, Blender.'],
    shot: { src: '/images/rbrmesh.jpg', alt: 'rbrmesh road point cloud shown in isometric, top-down and driver views', width: 1400, height: 384, caption: ['Stage 7 · global alignment', '34M points'] },
    study: RBRMESH,
  },
  {
    id: 'pitchpose', kind: 'Computer vision', title: 'PitchPose',
    sub: 'Follows footballers through match video and estimates their 2D and 3D pose, facing and direction of travel.',
    points: ['Identity first: missing frames are acceptable, wrong-player frames are not.', 'One-command pipeline: SAM2 tracking, keypoints, anatomy and motion corrections, pose and heading.', 'Compares and fuses RTMPose, Sapiens2, GVHMR and MotionBERT.', 'Python, PyTorch, YOLO11-pose, OpenCV, Gradio.'],
    shot: { src: '/images/pitch-pose.jpg', alt: 'PitchPose review frame with player skeletons and facing-direction dials', width: 1400, height: 673, caption: ['Frame 186', 'Pose + heading'] },
    study: PITCHPOSE,
  },
  {
    id: 'flight', kind: '3D · Simulation', title: 'Flight Replay',
    sub: 'A 3D replay of Apollo 11 and Starship Flight 13 that you can play, pause and scrub, built from the real mission records.',
    points: ['Apollo 11 paths calculated with real physics and matched to NASA reports; lunar terrain from LRO data.', 'Starship flight read off the webcast frame by frame, with reconstructed parts labelled.', 'Automatic broadcast-style camera, NASA footage and subtitles in sync with mission time.', 'React, TypeScript, Three.js, Zustand, Vitest.'],
    links: [{ href: '/projects/flight/index.html', label: 'Live demo' }],
    shot: { src: '/images/flight-replay.jpg', alt: 'Apollo 11 lunar module descending over the Moon in Flight Replay', width: 1400, height: 875, caption: ['Eagle descent', 'Three.js · WebGL2'] },
  },
  {
    id: 'iceland', kind: 'Maps · Planning', title: 'Iceland Road Trip Planner',
    sub: 'An interactive map planner for a 14-day Iceland Ring Road and Highlands camping trip.',
    points: ['389 places with real road routing from OSRM and a day-by-day time budget.', 'Warns about overpacked days, late arrivals and highland roads that may still be closed.', 'Python data pipeline merging Wikidata, OpenStreetMap and 160 campsites.', 'React, TypeScript, Vite, Leaflet, SunCalc.'],
    links: [{ href: '/projects/iceland/index.html', label: 'Live demo' }],
    shot: { src: '/images/iceland-planner.jpg', alt: 'Iceland Road Trip Planner map with colour-coded daily routes and itinerary', width: 1400, height: 850, caption: ['14 days · 3,030 km', 'Leaflet + OSRM'] },
  },
  {
    id: 'tidal', kind: 'Senior design project', title: '3D Tidal and Cloud Visualization System',
    sub: 'Python processing for terrain, tidal and radar data, rendered in a React frontend.',
    links: [{ href: '/docs/FYP-Final-Report.pdf', label: 'Technical report · PDF 1.6 MB', icon: 'doc' }],
    aside: 'stack',
  },
  {
    id: 'loaders', kind: 'Open source contribution', title: 'loaders.gl terrain',
    sub: <>Contributed to <a className="link-underline" href="https://loaders.gl" target="_blank" rel="noopener noreferrer">@loaders.gl</a>.</>,
    points: [<>Added an alternative triangular mesh technique, <a className="link-underline" href="https://github.com/mapbox/delatin" target="_blank" rel="noopener noreferrer">Delatin</a>, as an option for the terrain loader.</>],
    links: [{ href: 'https://github.com/visgl/loaders.gl/pull/1372', label: 'Pull request #1372' }, { href: 'https://mapbox.github.io/delatin/', label: 'Delatin demo' }],
    shot: { src: '/images/delatin.png', alt: 'Delatin triangular mesh generated over a terrain height map', width: 1021, height: 192, caption: ['Delatin mesh', 'visgl/loaders.gl'] },
  },
  {
    id: 'fires', kind: 'Visualisation / ML', title: 'Canadian Fires',
    sub: 'Visualizing historical Canadian fires from 1930–2021 and predicting future fires in Ontario.',
    points: ['Historical fire map with Deck.gl', 'Natural-language search with NLTK', 'Ontario forecast with XGBoost regression', 'Flask and SQLite backend'],
    links: [{ href: 'https://canadian-fires.vercel.app/', label: 'Live demo' }, { href: 'https://github.com/laijackylai/canadianFires', label: 'Source' }],
    shot: { src: '/images/canadian-fires.png', alt: 'Canadian Fires map showing historical fire locations across Canada', width: 1400, height: 803, caption: ['1930–2021', 'canadian-fires.vercel.app'] },
  },
  {
    id: 'takcarly', kind: 'Mobile · iOS', title: 'Takcarly',
    sub: 'A two-in-one app for taking care of the elderly.',
    points: ['Caretakers set events and schedules, and push reminders and custom notifications to the person they look after.'],
    links: [{ href: 'https://apps.apple.com/ca/app/takcarly/id1664211405', label: 'App Store' }, { href: 'https://github.com/laijackylai/takcarly', label: 'Source' }],
    aside: 'takcarly',
  },
]

export const STACK = [
  ['3D terrain', 'Python', 'hkdsm'],
  ['Tidal data', 'Python', 'hktides'],
  ['Radar data', 'Python', 'hkradar'],
  ['Frontend', 'React.js', 'hkterrain'],
]

export const pnum = (i: number) => `P.${String(i + 1).padStart(2, '0')}`
