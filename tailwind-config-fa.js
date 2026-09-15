// Same design tokens as tailwind-config.js, with fonts swapped to
// Vazirmatn for Persian pages (Latin fonts don't carry Persian glyphs).
tailwind.config = {
  theme: {
    extend: {
      colors: {
        ink: '#101B33',
        slate: '#47536B',
        fog: '#EDF0F5',
        brass: '#A9823D',
      },
      fontFamily: {
        serif: ['Vazirmatn', 'sans-serif'],
        sans: ['Vazirmatn', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      }
    }
  }
}