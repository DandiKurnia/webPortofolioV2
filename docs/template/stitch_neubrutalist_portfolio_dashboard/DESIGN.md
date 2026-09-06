---
name: Neubrutalist Pop
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
  on-surface-variant: '#484831'
  inverse-surface: '#303030'
  inverse-on-surface: '#f1f1f1'
  outline: '#79785f'
  outline-variant: '#cac8aa'
  surface-tint: '#626200'
  primary: '#626200'
  on-primary: '#ffffff'
  primary-container: '#ffff00'
  on-primary-container: '#757500'
  inverse-primary: '#cdcd00'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#ac2471'
  on-tertiary: '#ffffff'
  tertiary-container: '#fff4f6'
  on-tertiary-container: '#c43984'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#eaea00'
  primary-fixed-dim: '#cdcd00'
  on-primary-fixed: '#1d1d00'
  on-primary-fixed-variant: '#494900'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#ffd8e6'
  tertiary-fixed-dim: '#ffb0d0'
  on-tertiary-fixed: '#3d0024'
  on-tertiary-fixed-variant: '#8c0058'
  background: '#f9f9f9'
  on-background: '#1b1b1b'
  surface-variant: '#e2e2e2'
typography:
  display-2xl:
    fontFamily: Montserrat
    fontSize: 96px
    fontWeight: '900'
    lineHeight: 100%
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '900'
    lineHeight: 110%
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '900'
    lineHeight: 110%
  body-md:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 150%
  label-bold:
    fontFamily: Space Mono
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 120%
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  border-width: 4px
  shadow-offset: 8px
---

## Brand & Style

This design system embraces the "Neubrutalism" movement, characterized by a raw, unapologetic aesthetic that prioritizes high energy and functional irony. It rejects traditional digital polish in favor of "ugly-cool" aesthetics, using massive contrast and intentional clashing to command attention.

The visual language is edgy and playful, drawing heavily from 90s pop-art and early web interfaces. It is designed for brands that want to appear disruptive, youthful, and confident. The mood is intentionally loud, high-contrast, and tactile through the use of hard, physical metaphors like thick borders and un-blurred shadows.

## Colors

This design system utilizes a palette of clashing neon vibrants set against a foundation of pure black (#000000). 

- **Primary & Backgrounds:** Neon Yellow and Hot Pink serve as high-impact background fills.
- **Accents:** Fiery Orange and Lime Green are used for functional indicators, secondary buttons, or decorative elements.
- **Structural Black:** Pure black is used exclusively for all text, borders, and hard shadows to maintain maximum legibility amidst the chaotic color palette.
- **System Colors:** A secondary Bright Blue is utilized for primary actions or "links" to evoke a retro web feel.

## Typography

Typography is massive, geometric, and aggressive. We use **Montserrat** (Black weight) for headlines to create a heavy, block-like visual presence. 

- **Headlines:** Must be set with tight line-height and negative letter spacing to feel like solid objects.
- **Body:** **Space Grotesk** provides a technical, slightly quirky feel that balances the brutality of the headers while remaining readable.
- **Labels:** **Space Mono** is used for metadata, buttons, and "system" text to reinforce the retro computer aesthetic.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for desktop (12 columns) and a fluid model for mobile. However, the visual execution is "anti-grid" in appearance, often featuring overlapping elements and offset components.

- **Gutters:** Standard 24px gutters keep components separated, ensuring the thick borders don't merge.
- **Margins:** Heavy outer margins (64px+) help frame the high-energy content, creating a "windowed" effect.
- **Rhythm:** Spacing follows an 8px base unit. All component padding should be generous to accommodate the thick 4px strokes without crowding the content inside.

## Elevation & Depth

Depth is conveyed through **Hard Shadows** rather than Z-axis blurring or lighting effects. 

- **The Offset:** Every "elevated" element (cards, buttons, inputs) must feature a solid black shadow offset precisely at 8px (bottom) and 8px (right). 
- **No Blur:** Shadows must have 0px blur radius. They are treated as duplicated geometric shapes shifted behind the primary element.
- **Interactivity:** On hover or active states, the shadow offset may decrease (e.g., from 8px to 4px) to simulate the physical "pressing" of a button.

## Shapes

The primary shape language is **Sharp (0px)**. Rectilinear forms reinforce the brutalist, architectural nature of the design. 

- **Exceptions:** Very specific "Computer-Window" containers or "Stickers" may use a slight roundness (4px-8px) to mimic physical objects or legacy OS windows, but the default for standard UI components remains sharp-edged.
- **Strokes:** All shapes must be enclosed in a **4px solid black border**. No ghost borders or subtle dividers are permitted.

## Components

### Buttons
Buttons must have a 4px black border and a neon fill (Yellow or Blue). They utilize the standard 8px black offset shadow. On click, the button shifts 4px down and right, and the shadow shrinks to 4px.

### Computer-Windows
Used for primary content containers. These feature a black "title bar" at the top with three small circular "control buttons" (Red #FF5F56, Yellow #FFBD2E, Green #27C93F) on the top-left. The window body is a white or neon fill with a 4px border.

### Inputs & Form Fields
Fields are white with 4px borders. Labels sit above the field in **Space Mono Bold**. Focused states change the border color to Hot Pink or add a thicker shadow.

### Cards & Chips
Cards are used to group information, often featuring a "sticker" style (angled slightly or overlapping). Chips use a pill-shape (the only common exception to the sharp rule) with a 2px border and high-contrast text.

### Icons
Use thick-stroke, monolinear icons. Avoid filled icons unless they are used as large decorative "stickers." All icons must be pure black.