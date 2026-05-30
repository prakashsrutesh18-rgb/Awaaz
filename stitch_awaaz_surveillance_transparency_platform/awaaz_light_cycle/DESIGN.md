---
name: AWAAZ Light-Cycle
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1b1b1b'
  on-surface-variant: '#4d4354'
  inverse-surface: '#303030'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7385'
  outline-variant: '#cfc2d6'
  surface-tint: '#842bd2'
  primary: '#8127cf'
  on-primary: '#ffffff'
  primary-container: '#9c48ea'
  on-primary-container: '#fffbff'
  inverse-primary: '#ddb7ff'
  secondary: '#006877'
  on-secondary: '#ffffff'
  secondary-container: '#3fe1fd'
  on-secondary-container: '#00616f'
  tertiary: '#456500'
  on-tertiary: '#ffffff'
  tertiary-container: '#598000'
  on-tertiary-container: '#faffe8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#f0dbff'
  primary-fixed-dim: '#ddb7ff'
  on-primary-fixed: '#2c0051'
  on-primary-fixed-variant: '#6900b3'
  secondary-fixed: '#a2eeff'
  secondary-fixed-dim: '#2fd9f4'
  on-secondary-fixed: '#001f25'
  on-secondary-fixed-variant: '#004e5a'
  tertiary-fixed: '#bff365'
  tertiary-fixed-dim: '#a4d64c'
  on-tertiary-fixed: '#131f00'
  on-tertiary-fixed-variant: '#354e00'
  background: '#f9f9f9'
  on-background: '#1b1b1b'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 72px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.1'
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.1'
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  body-lg:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.0'
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 40px
  border-thin: 2px
  border-thick: 4px
---

## Brand & Style

The design system embodies **Neon Cyber-Brutalism**. It is a high-contrast, unapologetically digital aesthetic that prioritizes functional clarity through a raw, structural lens. It captures the tension between the grit of a hardware interface and the vibrancy of neon energy.

The personality is **Aggressive, Precise, and Systematic**. It is designed for users who value information density and a "developer-tool" level of control, wrapped in a high-fashion, futuristic editorial shell.

**Key Visual Principles:**
- **Structural Integrity:** Visible layout lines and grid-paper backgrounds expose the "skeleton" of the UI.
- **Neon Utility:** Vibrant colors are not merely decorative; they serve as high-voltage signals for interaction and status.
- **Digital Rawness:** Deliberate use of monospaced fonts, heavy borders, and sharp geometric forms to reject traditional "soft" consumer design.

## Colors

The palette utilizes a stark **Light Mode** foundation to maximize the "pop" of neon accents. 

- **Base:** `#F4F4F4` provides a clean, industrial canvas.
- **Primary (Neon Purple):** Used for primary actions, active navigation states, and high-energy highlights.
- **Secondary (Neon Cyan):** Reserved for "Processing," "Info," or "Standard" signal states.
- **Tertiary (Acid Green):** High-visibility "Success" or "Operational" signal states.
- **Neutral (Deep Black):** Used for all structural elements, borders, and primary text to ensure maximum contrast.

**Interaction States:**
Interactive elements use the primary purple with an added inner glow or outer "bloom" effect on hover to simulate neon illumination against the flat background.

## Typography

Typography is split between **Space Grotesk** for high-impact display and **JetBrains Mono** for all functional text.

- **Headlines:** Must be set with tight leading. Large headers should utilize uppercase styling to reinforce the brutalist tone.
- **Body & Data:** JetBrains Mono is used for all descriptive text, inputs, and data points to maintain a technical, "terminal" feel.
- **Labels:** Use "label-caps" for section headers and button text, emphasizing the systematic nature of the interface.

## Layout & Spacing

This design system uses a **Fixed-Fluid Hybrid Grid** based on a 4px baseline unit.

- **Grid Background:** All main surfaces feature a 16px or 32px grid-line pattern in `#E5E5E5` to ground the elements.
- **Structural Lines:** Use `#000000` lines (2px) to separate major layout sections (header, sidebar, content). These lines should extend to the edge of the viewport where possible.
- **Breakpoints:**
  - **Mobile (<768px):** Single column, 16px margins, borders reduced to 2px.
  - **Desktop (>768px):** 12-column grid with heavy 4px borders on primary containers.
- **Gutters:** Gutters are "hard" gaps—no soft padding between cards; use black borders to define boundaries.

## Elevation & Depth

Depth is achieved through **Hard Offsets** rather than soft shadows, following Brutalist traditions.

- **Stacking:** Use "Tonal Layers" where secondary panels are slightly darker (`#EBEBEB`) or layered with a grid pattern.
- **Shadows:** Avoid ambient blurs. Use "Hard Shadows"—a 4px or 8px solid black offset (`drop-shadow(4px 4px 0px #000)`) to give buttons and cards a physical, "popped" appearance.
- **Neon Glow:** For primary interactive elements, apply a `0px 0px 12px` outer glow using the primary purple color only during `:hover` or `:active` states.
- **Overlays:** Use 20% opacity black overlays for modals, maintaining a sharp border around the modal container itself.

## Shapes

The shape language is strictly **Geometric and Sharp**. 

- **Corners:** 0px radius on all elements (Buttons, Cards, Inputs).
- **Accents:** Use 45-degree "clipped corners" (dog-ears) on decorative elements or status chips to evoke military/cyberpunk hardware.
- **Dividers:** Use thick black lines (2px-4px) or repeating forward slashes (`////`) as texture-based dividers.

## Components

### Buttons
- **Primary:** Neon Purple background, black text, 2px black border, sharp corners. On hover, apply a hard black shadow offset.
- **Ghost:** No background, 2px black border, purple text.
- **Icon Buttons:** Use square containers with centered icons. Include a small "bracket" decorative element in the corners.

### Input Fields
- **Styling:** White background, 2px black border. On focus, the border changes to Neon Purple with a subtle inner glow. 
- **Labels:** Always placed above the input in `label-caps` style, often preceded by a `>` or `$` symbol.

### Chips & Signals
- **Status Chips:** Use tertiary Acid Green for "Active" and secondary Cyan for "System." Use a "clipped corner" shape for these small tags.

### Cards
- **Construction:** White background, 4px solid black border. Include a "Header Bar" within the card that has a black background and white/purple mono text.

### Layout Extras
- **Crosshairs:** Small `+` symbols at the intersections of major grid lines.
- **Scanlines:** A very faint horizontal pattern overlay on large image containers or the main background.
- **Progress Bars:** Blocky, segmented bars rather than smooth fills.