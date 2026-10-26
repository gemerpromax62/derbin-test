import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// 1. Ultra High-Definition 2048x2048 SVG representation of the derbin liquid glass icon
const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" width="2048" height="2048">
  <defs>
    <!-- Background Ambient Glow -->
    <radialGradient id="ambientBg" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#0e2319" stop-opacity="1" />
      <stop offset="45%" stop-color="#08140f" stop-opacity="1" />
      <stop offset="100%" stop-color="#040907" stop-opacity="1" />
    </radialGradient>

    <!-- Glass Tile Base Gradient -->
    <linearGradient id="tileGlassBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#144d34" stop-opacity="0.9" />
      <stop offset="30%" stop-color="#0a2a1d" stop-opacity="0.85" />
      <stop offset="70%" stop-color="#071b13" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#030d09" stop-opacity="0.95" />
    </linearGradient>

    <!-- Glass Specular Rim Border -->
    <linearGradient id="specularRim" x1="0%" y1="0%" x2="70%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
      <stop offset="20%" stop-color="#a7f3d0" stop-opacity="0.65" />
      <stop offset="50%" stop-color="#34d399" stop-opacity="0.2" />
      <stop offset="80%" stop-color="#064e3b" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#10b981" stop-opacity="0.75" />
    </linearGradient>

    <!-- Internal Liquid Sheen -->
    <linearGradient id="innerSheen" x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45" />
      <stop offset="35%" stop-color="#34d399" stop-opacity="0.12" />
      <stop offset="65%" stop-color="#059669" stop-opacity="0.0" />
      <stop offset="100%" stop-color="#10b981" stop-opacity="0.25" />
    </linearGradient>

    <!-- Glowing D Neon Gradient -->
    <linearGradient id="letterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a7f3d0" />
      <stop offset="35%" stop-color="#34d399" />
      <stop offset="80%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>

    <!-- D Letter Rim Gloss Highlight -->
    <linearGradient id="letterHighlight" x1="0%" y1="0%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85" />
      <stop offset="45%" stop-color="#6ee7b7" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#10b981" stop-opacity="0.1" />
    </linearGradient>

    <!-- Dot Radial Glow -->
    <radialGradient id="dotRadial" cx="38%" cy="38%" r="65%">
      <stop offset="0%" stop-color="#ecfdf5" />
      <stop offset="40%" stop-color="#6ee7b7" />
      <stop offset="75%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#047857" />
    </radialGradient>

    <!-- Tile Drop Shadow Filter -->
    <filter id="tileShadow" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="0" dy="48" stdDeviation="64" flood-color="#000000" flood-opacity="0.85" />
      <feDropShadow dx="0" dy="16" stdDeviation="28" flood-color="#10b981" flood-opacity="0.25" />
    </filter>

    <!-- Neon Glow Filter for Glyph -->
    <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="32" result="blurBig" />
      <feGaussianBlur stdDeviation="12" result="blurMed" />
      <feMerge>
        <feMergeNode in="blurBig" />
        <feMergeNode in="blurMed" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="24" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Environment -->
  <rect width="2048" height="2048" fill="url(#ambientBg)" />

  <!-- Outer Atmospheric Diffuse Orbs -->
  <circle cx="1024" cy="1024" r="680" fill="#10b981" opacity="0.16" filter="url(#neonGlow)" />
  <circle cx="850" cy="850" r="420" fill="#34d399" opacity="0.12" filter="url(#neonGlow)" />

  <!-- MAIN SQUIRCLE TILE (Apple iOS Liquid Glass squircle) -->
  <g filter="url(#tileShadow)">
    <!-- Glass Base Plate -->
    <rect x="256" y="256" width="1536" height="1536" rx="420" ry="420" 
          fill="url(#tileGlassBody)" 
          stroke="url(#specularRim)" 
          stroke-width="24" />

    <!-- Inner Refraction Border Layer -->
    <rect x="286" y="286" width="1476" height="1476" rx="390" ry="390" 
          fill="url(#innerSheen)" 
          stroke="rgba(255, 255, 255, 0.16)" 
          stroke-width="8" />

    <!-- Top Specular Liquid Light Curve -->
    <path d="M 520 280 C 800 260, 1248 260, 1528 280 C 1380 340, 668 340, 520 280 Z" 
          fill="rgba(255, 255, 255, 0.55)" 
          filter="url(#softGlow)" />

    <!-- Corner Specular Sheen (top-left) -->
    <ellipse cx="620" cy="520" rx="260" ry="140" transform="rotate(-30 620 520)" 
             fill="rgba(255, 255, 255, 0.18)" 
             filter="url(#softGlow)" />
  </g>

  <!-- AMBIENT GLOW DIRECTLY BEHIND THE 'D' -->
  <ellipse cx="1024" cy="1024" rx="420" ry="420" fill="#10b981" opacity="0.32" filter="url(#neonGlow)" />
  <ellipse cx="1080" cy="1024" rx="260" ry="260" fill="#34d399" opacity="0.45" filter="url(#neonGlow)" />

  <!-- THE ICONIC DERBIN 'D' GLYPH -->
  <!-- Layer 1: Ambient Drop Glow -->
  <g filter="url(#neonGlow)" opacity="0.8">
    <path d="M 720 576 
             H 1040 
             C 1290 576, 1464 760, 1464 1024 
             C 1464 1288, 1290 1472, 1040 1472 
             H 720 
             Z" 
          fill="none" 
          stroke="#10b981" 
          stroke-width="170" 
          stroke-linejoin="round" 
          stroke-linecap="round" />
    <circle cx="1024" cy="1024" r="130" fill="#34d399" />
  </g>

  <!-- Layer 2: Main Solid 'D' Body with Rich Emerald Gradient -->
  <g>
    <!-- Outer D path stroke -->
    <path d="M 720 576 
             H 1040 
             C 1290 576, 1464 760, 1464 1024 
             C 1464 1288, 1290 1472, 1040 1472 
             H 720 
             Z" 
          fill="none" 
          stroke="url(#letterGrad)" 
          stroke-width="156" 
          stroke-linejoin="round" 
          stroke-linecap="round" />

    <!-- Top Gloss Rim on 'D' -->
    <path d="M 720 576 
             H 1040 
             C 1230 576, 1380 700, 1440 920" 
          fill="none" 
          stroke="url(#letterHighlight)" 
          stroke-width="48" 
          stroke-linecap="round" />

    <!-- Vertical Bar Left Specular Edge -->
    <line x1="642" y1="590" x2="642" y2="1458" 
          stroke="rgba(255, 255, 255, 0.7)" 
          stroke-width="24" 
          stroke-linecap="round" 
          filter="url(#softGlow)" />

    <!-- Center Aperture Circle / Dot -->
    <circle cx="1024" cy="1024" r="128" fill="url(#dotRadial)" />
    <!-- Specular Reflection on Dot -->
    <ellipse cx="980" cy="980" rx="42" ry="24" transform="rotate(-35 980 980)" fill="rgba(255, 255, 255, 0.85)" />
    <!-- Subtle Inner Rim on Dot -->
    <circle cx="1024" cy="1024" r="128" fill="none" stroke="rgba(255, 255, 255, 0.45)" stroke-width="8" />
  </g>

  <!-- Final Glass Surface Caustic Overlay -->
  <path d="M 270 900 C 600 1020, 1400 780, 1770 940 L 1770 270 L 270 270 Z" 
        fill="url(#innerSheen)" 
        opacity="0.18" 
        style="mix-blend-mode: overlay;" />

  <!-- Bottom Rim Ambient Reflection -->
  <path d="M 600 1780 C 850 1810, 1198 1810, 1448 1780" 
        stroke="rgba(52, 211, 153, 0.65)" 
        stroke-width="16" 
        fill="none" 
        stroke-linecap="round" 
        filter="url(#softGlow)" />
</svg>
`;

// 2. Also a 1920x1080 16:9 Full HD Wallpaper version
const svgWallpaper = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <radialGradient id="wallBg" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#0f261c" stop-opacity="1" />
      <stop offset="35%" stop-color="#0a1a13" stop-opacity="1" />
      <stop offset="70%" stop-color="#06100c" stop-opacity="1" />
      <stop offset="100%" stop-color="#030806" stop-opacity="1" />
    </radialGradient>

    <radialGradient id="lightBeam" cx="50%" cy="30%" r="55%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.22" />
      <stop offset="45%" stop-color="#34d399" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <linearGradient id="groundReflect" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.18" />
      <stop offset="60%" stop-color="#059669" stop-opacity="0.04" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </linearGradient>

    <!-- Glass Tile Base Gradient -->
    <linearGradient id="tileGlassBody2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#165338" stop-opacity="0.92" />
      <stop offset="30%" stop-color="#0b2e20" stop-opacity="0.88" />
      <stop offset="70%" stop-color="#071e15" stop-opacity="0.92" />
      <stop offset="100%" stop-color="#030e0a" stop-opacity="0.96" />
    </linearGradient>

    <linearGradient id="specularRim2" x1="0%" y1="0%" x2="70%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
      <stop offset="20%" stop-color="#a7f3d0" stop-opacity="0.7" />
      <stop offset="50%" stop-color="#34d399" stop-opacity="0.25" />
      <stop offset="80%" stop-color="#064e3b" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#10b981" stop-opacity="0.8" />
    </linearGradient>

    <linearGradient id="innerSheen2" x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4" />
      <stop offset="35%" stop-color="#34d399" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#10b981" stop-opacity="0.2" />
    </linearGradient>

    <linearGradient id="letterGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a7f3d0" />
      <stop offset="35%" stop-color="#34d399" />
      <stop offset="80%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>

    <radialGradient id="dotRadial2" cx="38%" cy="38%" r="65%">
      <stop offset="0%" stop-color="#ecfdf5" />
      <stop offset="40%" stop-color="#6ee7b7" />
      <stop offset="75%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#047857" />
    </radialGradient>

    <filter id="tileShadow2" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="0" dy="32" stdDeviation="40" flood-color="#000000" flood-opacity="0.9" />
      <feDropShadow dx="0" dy="12" stdDeviation="22" flood-color="#10b981" flood-opacity="0.3" />
    </filter>

    <filter id="neonGlow2" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="24" result="blurBig" />
      <feGaussianBlur stdDeviation="8" result="blurMed" />
      <feMerge>
        <feMergeNode in="blurBig" />
        <feMergeNode in="blurMed" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Background Environment -->
  <rect width="1920" height="1080" fill="url(#wallBg)" />
  <rect width="1920" height="1080" fill="url(#lightBeam)" />

  <!-- Pedestal ground reflection -->
  <ellipse cx="960" cy="880" rx="520" ry="110" fill="url(#groundReflect)" />

  <!-- Atmospheric bokeh floating orbs -->
  <circle cx="340" cy="280" r="180" fill="#10b981" opacity="0.08" filter="url(#neonGlow2)" />
  <circle cx="1620" cy="740" r="220" fill="#34d399" opacity="0.06" filter="url(#neonGlow2)" />
  <circle cx="1480" cy="240" r="140" fill="#10b981" opacity="0.09" filter="url(#neonGlow2)" />

  <!-- Centered Glass Icon Group (Scaled to 640x640, centered at 960, 520) -->
  <g transform="translate(640, 200)">
    
    <!-- Squircle Tile -->
    <g filter="url(#tileShadow2)">
      <rect x="0" y="0" width="640" height="640" rx="175" ry="175" 
            fill="url(#tileGlassBody2)" 
            stroke="url(#specularRim2)" 
            stroke-width="10" />

      <rect x="12" y="12" width="616" height="616" rx="163" ry="163" 
            fill="url(#innerSheen2)" 
            stroke="rgba(255, 255, 255, 0.16)" 
            stroke-width="3" />

      <!-- Top Specular Highlight -->
      <path d="M 110 12 C 220 4, 420 4, 530 12 C 480 34, 160 34, 110 12 Z" 
            fill="rgba(255, 255, 255, 0.6)" />
    </g>

    <!-- Glyph D Ambient Glow -->
    <ellipse cx="320" cy="320" rx="180" ry="180" fill="#10b981" opacity="0.35" filter="url(#neonGlow2)" />

    <!-- Outer D path stroke -->
    <g filter="url(#neonGlow2)" opacity="0.85">
      <path d="M 225 180 
               H 325 
               C 405 180, 460 238, 460 320 
               C 460 402, 405 460, 325 460 
               H 225 
               Z" 
            fill="none" 
            stroke="#10b981" 
            stroke-width="52" 
            stroke-linejoin="round" 
            stroke-linecap="round" />
      <circle cx="320" cy="320" r="42" fill="#34d399" />
    </g>

    <g>
      <path d="M 225 180 
               H 325 
               C 405 180, 460 238, 460 320 
               C 460 402, 405 460, 325 460 
               H 225 
               Z" 
            fill="none" 
            stroke="url(#letterGrad2)" 
            stroke-width="48" 
            stroke-linejoin="round" 
            stroke-linecap="round" />

      <!-- Top letter gloss -->
      <path d="M 225 180 H 325 C 385 180, 435 218, 452 288" 
            fill="none" 
            stroke="rgba(255, 255, 255, 0.85)" 
            stroke-width="14" 
            stroke-linecap="round" />

      <line x1="200" y1="184" x2="200" y2="456" 
            stroke="rgba(255, 255, 255, 0.75)" 
            stroke-width="8" 
            stroke-linecap="round" />

      <circle cx="320" cy="320" r="40" fill="url(#dotRadial2)" />
      <ellipse cx="306" cy="306" rx="13" ry="7" transform="rotate(-35 306 306)" fill="rgba(255, 255, 255, 0.85)" />
    </g>

  </g>

  <!-- Typography below icon in wallpaper -->
  <text x="960" y="930" text-anchor="middle" font-family="'Space Grotesk', -apple-system, sans-serif" font-weight="700" font-size="34" letter-spacing="8" fill="#ffffff">DERBIN</text>
  <text x="960" y="965" text-anchor="middle" font-family="-apple-system, sans-serif" font-weight="500" font-size="14" letter-spacing="4" fill="#34d399">NEXT-GEN CLIENT &amp; SECURITY PROTECTION</text>
</svg>
`;

async function main() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Save Full HD SVG files
  fs.writeFileSync(path.join(publicDir, 'derbin_icon_fhd.svg'), svgContent, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'derbin_wallpaper_fhd.svg'), svgWallpaper, 'utf-8');
  console.log('Saved SVG files.');

  // 2. Render 1920x1920 Full HD PNG icon (Square)
  await sharp(Buffer.from(svgContent))
    .resize(1920, 1920)
    .png({ quality: 100, compressionLevel: 8 })
    .toFile(path.join(publicDir, 'derbin_icon_fhd.png'));
  console.log('Rendered derbin_icon_fhd.png (1920x1920 Full HD).');

  // 3. Render 1024x1024 Standard HD icon
  await sharp(Buffer.from(svgContent))
    .resize(1024, 1024)
    .png({ quality: 100, compressionLevel: 8 })
    .toFile(path.join(publicDir, 'derbin_icon_1024.png'));
  console.log('Rendered derbin_icon_1024.png (1024x1024 HD).');

  // 4. Render 1920x1080 16:9 Full HD Wallpaper PNG
  await sharp(Buffer.from(svgWallpaper))
    .resize(1920, 1080)
    .png({ quality: 100, compressionLevel: 8 })
    .toFile(path.join(publicDir, 'derbin_wallpaper_fhd.png'));
  console.log('Rendered derbin_wallpaper_fhd.png (1920x1080 Full HD 16:9).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
