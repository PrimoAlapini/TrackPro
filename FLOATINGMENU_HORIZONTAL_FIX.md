# FloatingMenu - Horizontal Position Fix

## Corrections Appliquées

### 1. Interface Position (Ligne 18-20)
**Avant**:
```typescript
interface Position {
  x: number
  y: number
}
const DEFAULT_POSITION = { x: 32, y: window.innerHeight - 32 - 60 }
```

**Après**:
```typescript
interface Position {
  right: number
  bottom: number
}
const DEFAULT_RIGHT = 32
const DEFAULT_BOTTOM = 32
```

**Raison**: Utiliser `right/bottom` au lieu de `left/top` empêche le décalage lors du resize de la fenêtre et des barres de défilement.

---

### 2. État Position (Ligne 32)
**Avant**: `const [position, setPosition] = useState<Position>(DEFAULT_POSITION)`
**Après**: `const [position, setPosition] = useState<Position | null>(null)`

**Raison**: Quand `null`, utilise l'ancrage CSS par défaut (`right-8 bottom-8`). Après drag, stocke la vraie position.

---

### 3. Style Conteneur (Ligne 271-277)
**Avant**:
```typescript
style={{
  left: `${position.x}px`,
  top: panelDirection === 'up' ? 'auto' : `${position.y}px`,
  bottom: panelDirection === 'up' ? `calc(100vh - ${position.y}px)` : 'auto',
}}
```

**Après**:
```typescript
className="... right-8 bottom-8"
style={position ? {
  right: `${position.right}px`,
  bottom: `${position.bottom}px`,
} : {}}
```

**Raison**: 
- CSS par défaut: `right-8 bottom-8` (32px)
- Après drag: override avec vraie position
- Pas de calcul complexe, juste `right/bottom`

---

### 4. Drag Handler (Ligne 103-160)
**Avant**:
```typescript
const clampedX = Math.max(32, Math.min(newX, window.innerWidth - 32 - 60))
const clampedY = Math.max(minY, Math.min(newY, maxY))
```

**Après**:
```typescript
const clientWidth = document.documentElement.clientWidth // Exclude scrollbar
const clientHeight = document.documentElement.clientHeight
const barWidth = barRect.width // Measured
const barHeight = barRect.height
const panelWidth = 248 // w-60 actual

const minRight = Math.max(buffer, panelWidth + buffer - barWidth)
const maxRight = clientWidth - barWidth - buffer
newRight = Math.max(minRight, Math.min(newRight, maxRight))

const minBottom = buffer + 256 + barHeight
const maxBottom = clientHeight - barHeight - buffer
newBottom = Math.max(minBottom, Math.min(newBottom, maxBottom))
```

**Raison**:
- `clientWidth/clientHeight`: dimensions réelles (exclut scrollbars)
- `barRect.width/height`: mesure réelle de la barre
- `panelWidth = 248`: calcul correct (w-60 + border)
- Clamping correct: panel ne dépasse jamais

---

### 5. Keyboard Navigation (Ligne 162-189)
**Avant**: Utilisait `left/top` + `window.innerWidth/Height`
**Après**: Utilise `right/bottom` + `clientWidth/clientHeight`

**Raison**: Cohérence avec le drag.

---

## Tests à Effectuer

- [ ] **1440×900**: Menu visible bas-droit, panneau entier, pas coupé
- [ ] **1024×600**: Même chose (petite hauteur)
- [ ] **Avec scrollbar verticale**: Menu colle au bord droit (pas affecté par scrollbar)
- [ ] **Sans scrollbar verticale**: Même comportement
- [ ] **Drag menu à gauche**: Panneau aligné à gauche, pas coupé
- [ ] **Drag menu à droite**: Panneau ancré à droite, pas débordement
- [ ] **Resize fenêtre après drag**: Menu recadré automatiquement
- [ ] **Rechargement**: Position restaurée, recadrée
- [ ] **Thème clair/sombre**: Aucune différence
- [ ] **Aucun scroll horizontal**: `document.documentElement.scrollWidth === clientWidth`

---

## Mesures Attendues (à rapporter)

Pour chaque test:
1. `barRect = containerRef.current.getBoundingClientRect()`
2. `panelRect = panelRef.current.getBoundingClientRect()` (si ouvert)
3. `clientWidth = document.documentElement.clientWidth`
4. `scrollWidth = document.documentElement.scrollWidth`

Exemple:
```
Test: 1440×900, default position
barRect: { width: 180, right: 212 }
panelRect: { width: 248, right: 248 }
clientWidth: 1440
scrollWidth: 1440
✓ Panel visible, right edge at 248px, no overflow
```

---

## Fichiers Modifiés

- `src/components/layout/FloatingMenu.tsx`: Refactor complet position/drag/clamp

## Status

- [x] Code modifié
- [x] Lint: Exit 0
- [ ] Browser testing (MANUAL - user to verify)
- [ ] All 10 test cases passed
- [ ] Measurements confirmed
