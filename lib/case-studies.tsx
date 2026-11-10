import type { ReactNode } from 'react'
import { EvidenceLadder, Headings, IdentityGate, PoseDag } from '../components/diagrams/pitchpose'
import { CameraRig, HeightField, QaGate, StageDag } from '../components/diagrams/rbrmesh'

type Img = { src: string, alt: string, width: number, height: number }
export type Study = {
  facts: [string, string][],
  problem: ReactNode[],
  stats: [string, string][],
  stages: { name: string, note: string, img?: Img }[],
  tech?: { title: string, body: ReactNode, fig: ReactNode, caption: [string, string] }[],
  specs?: string[][],
  compare?: { before: Img, after: Img, caption: [string, string] },
  hard: { title: string, body: ReactNode }[],
  next: string[],
}

const R = '/images/rbrmesh'

export const RBRMESH: Study = {
  facts: [
    ['Role', 'Solo · design, research, code'],
    ['Started', 'April 2026'],
    ['Status', 'Stages 0–11 run end to end'],
    ['Runs on', 'Apple Silicon (MPS), overnight'],
    ['Stack', 'Python 3.12, PyTorch, Open3D, OpenCV, Blender'],
  ],
  problem: [
    'Stages for Richard Burns Rally are built by hand. I wanted a personal tool that turns a drive down a real road into a stage I can race.',
    'rbrmesh takes 360° photos or video from a car roof and turns them into a textured, drivable road for the game, with no manual mesh editing. Getting the shape and scale of the route right matters most, then elevation and camber, then bumps, and looks come last.',
  ],
  stats: [['12', 'Pipeline stages'], ['34M', 'Points after alignment'], ['3', 'Camera faces per frame'], ['56', 'Frames, Dancer loop']],
  stages: [
    { name: 'Preprocess', note: 'Normalise JPGs or sample stitched video; read metadata.', img: { src: `${R}/00-equirect.jpg`, alt: 'Equirectangular 360° frame of a residential street', width: 1400, height: 462 } },
    { name: 'Cubemap', note: 'Project each frame to front left, centre and right faces.', img: { src: `${R}/01-faces.jpg`, alt: 'Left, centre and right perspective faces cut from the 360° frame', width: 1400, height: 467 } },
    { name: 'Camera poses', note: 'MASt3R recovers the trajectory and sparse depth.', img: { src: `${R}/02-trajectory.jpg`, alt: 'Bird’s-eye plot of recovered camera positions around the loop', width: 360, height: 600 } },
    { name: 'Depth', note: 'Depth Anything V2 monocular depth per face.', img: { src: `${R}/03-depth.jpg`, alt: 'Camera face beside its predicted depth map', width: 615, height: 272 } },
    { name: 'Segmentation', note: 'SegFormer road probabilities.' },
    { name: 'Geometry mask', note: 'Keep only road pixels the geometry agrees with.', img: { src: `${R}/05-mask.jpg`, alt: 'Road mask overlaid in green on the three camera faces', width: 1344, height: 448 } },
    { name: 'Fusion', note: 'Metric depth fusion and local L/C/R alignment.' },
    { name: 'Global assembly', note: 'Bundle alignment, plane refinement, filtering, blending.', img: { src: '/images/rbrmesh.jpg', alt: 'Aligned road point cloud in isometric, top-down and driver views', width: 1400, height: 384 } },
    { name: 'Mesh', note: 'Height field along the trajectory into one continuous road mesh.' },
    { name: 'Refinement', note: 'Multi-view image refinement with bounded pose and height corrections.' },
    { name: 'Texture', note: 'Route-space texture baking, OBJ/MTL export, DXT1 atlases.' },
    { name: 'RBR export', note: 'Blender scene build and native RSF package for the game.' },
  ],
  tech: [
    {
      title: 'Data flow', fig: <StageDag />, caption: ['Stage DAG', '12 stages · 1 QA gate each'],
      body: 'Stage 1 cuts each panorama into three pinhole faces, and those raw faces are the only RGB source downstream. Depth and segmentation run independently. Stage 5 is the first merge point: it decides which pixels are road. Stage 6 turns relative depth into metric point slabs. From there the data is a single cloud, then one mesh. Refinement and texturing go back to the original images and masks instead of trusting the mesh alone. Each stage owns one numbered output folder.',
    },
    {
      title: 'Camera rig', fig: <CameraRig />, caption: ['Stage 1 · cubemap faces', '2992 × 2992 px · 90° FOV'],
      body: 'Three 90° faces at −45°, 0° and +45° overlap by half a face. MASt3R runs two independent chains on the left and right faces, repairs body-frame slips, then fuses them rotation-first. The centre face feeds depth, segmentation, fusion and texture. Metric scale comes from the known 1.70 m camera height, not from GPS.',
    },
    {
      title: 'Height field, not Poisson', fig: <HeightField />, caption: ['Stage 8 · trajectory-local mesh', 'station × lateral × height'],
      body: 'The cloud is reprojected into route coordinates: station along the road, lateral offset, height. A robust local fit on a 5 cm grid gives one surface whose triangles share vertices, so there are no duplicate seams where slabs meet. Poisson reconstruction was ruled out because its watertight prior caps and balloons an open road ribbon. Small holes can be inferred. A full-width gap stops publication.',
    },
    {
      title: 'Config and QA', fig: <QaGate />, caption: ['Every stage', 'fail closed'],
      body: 'Defaults, a calibration profile, a user TOML and CLI flags resolve into one immutable, hashed JSON snapshot that every stage and QA check reads. After each stage the gate checks file format, schema, domain bounds, upstream hashes and drift against an accepted reference. Accepting new drift is an explicit review step, never automatic.',
    },
  ],
  specs: [
    ['Stage', 'Method', 'Key numbers', 'Output'],
    ['00 Preprocess', 'Normalise, EXIF/GPS', '2:1 equirect', '.jpg + manifest'],
    ['01 Cubemap', 'Ray-cast pinhole faces', '2992² px · 90° · ±45°', 'L/C/R .png'],
    ['02 Camera poses', 'MASt3R, dual L/R chain', '512×384 input', 'poses, sparse depth'],
    ['03 Depth', 'Depth Anything V2 Small', 'MPS', 'relative inverse depth'],
    ['04 Segmentation', 'SegFormer-B5 Cityscapes', 'class 0 · CPU', 'P(road)'],
    ['05 Geometry mask', 'Semantic cores, barriers, seeded connectivity', 'uint16 reason flags', 'mask .npz'],
    ['06 Fusion', 'Robust depth→metric fit, local 3-DOF', 'held-out overlap tests', 'L/C/R .ply slabs'],
    ['07 Assembly', 'Shared 3-DOF bundle + residual plane', '1 cm weighted voxels', 'road_cloud.ply'],
    ['08 Mesh', 'Robust local height field', '0.05 m grid · 0.25 m radius', 'road_mesh.ply'],
    ['09 Refinement', 'Bounded pose/height, held-out folds', 'publish or no_change', 'refined mesh'],
    ['10 Texture', 'Route-space multi-view bake', '16–256 px/m · 64 MiB DDS', 'OBJ/MTL + DXT1'],
    ['11 RBR export', 'Pinned Blender + exporter', 'NEAR / FAR / collision', 'native RSF'],
  ],
  compare: {
    before: { src: `${R}/05-rgb.jpg`, alt: 'Three camera faces of a street before masking', width: 1344, height: 448 },
    after: { src: `${R}/05-mask.jpg`, alt: 'Same faces with the validated road mask in green', width: 1344, height: 448 },
    caption: ['Stage 5 · geometry mask', 'Drag to compare'],
  },
  hard: [
    { title: 'Agreeing is not the same as being right', body: 'Left and right camera chains can agree with each other and both produce the wrong map shape. Smoothness and internal agreement do not prove the route is correct, so the next milestone measures accuracy against outside references and repeat drives.' },
    { title: 'Noise is not a bump', body: 'In a driving sim, reconstruction noise feels like real road roughness. The mesh stage fits a robust height field along the trajectory instead of trusting every point.' },
    { title: 'Averages hide defects', body: 'Some corrections improved the average score while moving errors somewhere else. Each stage writes QA checks and review images, and I look at the worst sections, not just the totals.' },
    { title: 'One capture is not proof', body: 'A gain on one capture failed to carry over to another. Old captures are kept as regression cases, and a separate capture is reserved for validation.' },
  ],
  next: [
    'GPS-assisted capture to fix broad route shape and scale.',
    'Measure stage 2 route accuracy against external evidence.',
    'Prove repeatability on local roads, then capture Route 507.',
  ],
}

const P = '/images/pitchpose'

export const PITCHPOSE: Study = {
  facts: [
    ['Role', 'Solo · design, research, code'],
    ['Started', 'August 2026'],
    ['Status', 'One-player pipeline runs end to end; all-player mode experimental'],
    ['Runs on', 'Mac, CPU + MPS, fully local'],
    ['Stack', 'Python, PyTorch, SAM2, RTMPose, Sapiens2, OpenCV, Gradio'],
  ],
  problem: [
    'I wanted to follow one footballer through ordinary match video and get their pose, which way they are facing and where they are heading, with no motion-capture suit and no calibrated cameras.',
    'The rule that shapes everything is identity first: a frame with no answer is fine, a frame that shows the wrong player is not. Tracker IDs are treated as short-lived guesses, never as who the player is. Raw model output is kept, anything inferred is marked, and unknowns stay blank.',
  ],
  stats: [['12', 'Pipeline stages'], ['26', 'Joints per player'], ['261', 'Frames, test clip'], ['26', 'Approved player tracks']],
  stages: [
    { name: 'Source', note: 'Hash and decode the video; record size, frame rate and timestamps.' },
    { name: 'Player mask', note: 'SAM2 follows the chosen player from one box.', img: { src: `${P}/01-mask.jpg`, alt: 'Selected footballer highlighted in green by the SAM2 mask', width: 323, height: 324 } },
    { name: 'Body26 pose', note: 'RTMPose-m gives 26 joints, including feet.', img: { src: `${P}/02-raw.jpg`, alt: 'Raw 26-joint skeleton drawn over the player', width: 323, height: 324 } },
    { name: 'Second observer', note: 'RTMO multi-person pose, run independently.' },
    { name: 'Dense pose', note: 'Sapiens2 0.4B on the GPU as a third opinion.' },
    { name: 'Pixel parts', note: 'Head, torso and limbs tracked separately inside the mask.', img: { src: `${P}/05-parts.jpg`, alt: 'Separate body-part tracks agreeing on the player', width: 323, height: 324 } },
    { name: 'Learned parts', note: 'Learned point correspondence over a tested window.' },
    { name: 'Refinement', note: 'Ownership, soft anatomy, momentum and gait, in order.' },
    { name: 'Heading', note: 'Travel direction and chest facing, estimated separately.', img: { src: `${P}/08-heading.jpg`, alt: 'Two dials: cyan travel arrow and orange chest-facing arrow', width: 394, height: 270 } },
    { name: 'Parsing', note: 'Optional body-part parser; never moves joints.' },
    { name: 'Review', note: 'Static HTML desk: every frame, every stage, side by side.', img: { src: '/images/pitch-pose.jpg', alt: 'PitchPose review frame with player skeletons and facing-direction dials', width: 1400, height: 673 } },
    { name: 'Export', note: 'NPZ and JSON bundle with hashes and per-stage receipts.' },
  ],
  tech: [
    {
      title: 'Data flow', fig: <PoseDag />, caption: ['Stage DAG', '12 stages · resumable'],
      body: 'One box on the first frame starts everything. SAM2 turns it into a mask and Body26 reads the 26 joints of the player inside it. That is the primary observation. RTMO and Sapiens2 look at the same player as independent evidence, while pixel and learned part tracks follow each limb on its own. Refinement joins it all back into one skeleton. Every stage records its inputs, versions and output hashes, so a rerun reuses only what still matches.',
    },
    {
      title: 'Identity before pose', fig: <IdentityGate />, caption: ['Identity state machine', 'fail closed'],
      body: 'Each candidate is scored on six cues: appearance, predicted trajectory, size for its place in the frame, limb proportions, kit colour and optical flow. The gates are conjunctive: a candidate must pass the score floor, the motion gate and the ambiguity margin against the runner-up. If not, the player goes uncertain, then lost. Those frames export as null. A user checkpoint re-runs only identity, using cached tracklets.',
    },
    {
      title: 'Refinement as an evidence ladder', fig: <EvidenceLadder />, caption: ['Stage 7 · refinement', 'six passes'],
      body: 'In a crowded box, pose models happily put a leg on the wrong player, or both legs on the same visible limb. Refinement first decides which pixels belong to this player, then lets each body part move on its own evidence, then applies soft length limits as seen through the camera, short-gap momentum and, only when a clear running cycle exists, a gait prior. Hidden legs can be inferred, but they are labelled as such.',
    },
    {
      title: 'Travel is not facing', fig: <Headings />, caption: ['Stage 8 · heading', 'two separate estimates'],
      body: 'A player running left while the camera pans left can look still on screen. Travel direction subtracts the background motion from the player’s screen motion. Chest facing is a separate estimate, relative to the camera: a player can jog backwards while facing play. Neither is a bearing on the pitch, since the pitch is not calibrated yet.',
    },
  ],
  specs: [
    ['Stage', 'Method', 'Key numbers', 'Output'],
    ['00 Source', 'Hash, orientation-aware decode', 'sha256 · timestamps', 'source inventory'],
    ['01 Player mask', 'SAM2.1 Hiera-tiny from one box', 'CPU', 'per-frame mask'],
    ['02 Body26', 'RTMPose-m Halpe26 (ONNX)', '26 joints · YOLO11n people', 'primary 2D pose'],
    ['03 Second observer', 'RTMO-m, multi-person', '17 joints · independent', 'pose evidence'],
    ['04 Dense pose', 'Sapiens2 0.4B', 'MPS · 263 forwards', 'pose evidence'],
    ['05 Pixel parts', 'Masked patch tracking', 'seeds every 5 frames · ≤1.5 px fwd-bwd', 'part tracks'],
    ['06 Learned parts', 'CoTracker3 correspondence', '91-frame window', 'part tracks'],
    ['07 Refinement', 'Ownership, anatomy, momentum, gait', 'raw scores kept', '26 joints + source'],
    ['08 Heading', 'Compensated travel + chest facing', 'camera-relative', 'two headings'],
    ['09 Parsing', 'Body-part parser (optional)', '29 classes · off by default', 'class maps'],
    ['10 Review', 'Static HTML review desk', '1,566 stage images', 'index.html'],
    ['11 Export', 'Bundle + receipts', 'hash per output', 'result.npz / .json'],
  ],
  compare: {
    before: { src: `${P}/all-before.jpg`, alt: 'Indoor five-a-side match frame with player labels and screen-motion arrows', width: 960, height: 540 },
    after: { src: `${P}/all-after.jpg`, alt: 'Same frame with skeletons and camera-compensated travel arrows for every player', width: 960, height: 540 },
    caption: ['Frame 116 · all players', 'Drag to compare'],
  },
  hard: [
    { title: 'Missing beats wrong', body: 'Tracker IDs swap whenever players cross. More coverage is easy if you accept wrong frames, so success is measured by wrong-player frames first and coverage second.' },
    { title: 'Whose leg is that?', body: 'During overlaps, every model tested at some point gave this player someone else’s leg, or both legs on one limb. An independent-leg fusion looked better on average and was rejected for exactly that.' },
    { title: 'Agreement is not accuracy', body: 'Several models agreeing, or a lower 3D projection error, does not prove the pose is right. Candidates are checked against the original pixels, frame by frame, before anything is adopted.' },
    { title: 'Cleanup must not invent a player', body: 'An audit found smoothing was filling in frames where identity was unresolved. Cleanup now runs inside confirmed spans only, and those frames stay null in every export.' },
  ],
  next: [
    'Learned 3D through the GVHMR adapter, replacing the labelled 2D-derived fallback.',
    'A labelled identity benchmark: wrong-player rate, recall and corrections per minute.',
    'All-player pose and heading review, then team classification and pitch calibration.',
  ],
}
