export type Theme = 'system' | 'light' | 'dark'

export function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function getCurrentTheme(): Theme {
  const stored = localStorage.getItem('theme') as Theme | null
  return stored ?? 'system'
}

export function applyTheme(theme: Theme): void {
  const html = document.documentElement

  if (theme === 'system') {
    localStorage.removeItem('theme')
    const isDark = getSystemTheme() === 'dark'
    html.classList.toggle('dark', isDark)
  } else {
    localStorage.setItem('theme', theme)
    html.classList.toggle('dark', theme === 'dark')
  }
}

export function initTheme(): void {
  const theme = getCurrentTheme()
  applyTheme(theme)

  // Listen to system preference changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleChange = () => {
    const current = getCurrentTheme()
    if (current === 'system') {
      applyTheme('system')
    }
  }

  mediaQuery.addEventListener('change', handleChange)
}
