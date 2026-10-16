# FloatingMenu - Drag Refactor Test Report

## Tests à Effectuer

### Test 1: Drag 200px droite + 200px bas
**Procédure:**
1. Ouvre le navigateur (1440×900)
2. Menu visible en bas-droit (CSS default: `right-8 bottom-8` = 32px)
3. Saisis la poignée, déplace souris **200px à droite**
4. Puis déplace souris **200px vers le bas**
5. Relâche
6. Mesure: le menu doit avoir bougé exactement 200px à droite et 200px en bas
7. Le curseur doit rester au même point de la poignée pendant tout le drag

**Résultats attendus:**
```
Avant drag: position.right ≈ 32px, position.bottom ≈ 32px
Après 200px droit: position.right ≈ 232px (32 + 200)
Après 200px bas: position.bottom ≈ 232px (32 + 200)
Curseur reste aligné sur la poignée: OUI
```

**À rapporter:**
- [ ] Position initiale (right/bottom)
- [ ] Position après 200px droite (right/bottom)
- [ ] Position après 200px bas (right/bottom)
- [ ] Curseur aligné tout le long: OUI/NON

---

### Test 2: Mouvement lent vs rapide
**Procédure:**
1. Saisis poignée
2. Déplace **très lentement** de 100px (observer le mouvement)
3. Relâche
4. Saisis poignée
5. Déplace **très rapidement** de 100px (flick)
6. Relâche
7. Observe: pas de saut, pas de retard visible

**Résultats attendus:**
```
Mouvement lent: fluide, position = startPos + 100px
Mouvement rapide: fluide, position = startPos + 100px
Pas de lag entre curseur et menu: OUI
```

**À rapporter:**
- [ ] Mouvement lent: fluide/saccadé
- [ ] Mouvement rapide: fluide/saccadé
- [ ] Lag détecté: OUI/NON

---

### Test 3: Relâche hors de la fenêtre
**Procédure:**
1. Saisis poignée au milieu de l'écran
2. Déplace vers le bas jusqu'à sortir du viewport (pointercancel doit déclencher)
3. Relâche souris dehors
4. Menu doit toujours être visible après pointercancel

**Résultats attendus:**
```
Lors du pointercancel: transform cleared, position commitée
Menu visible et recadré: OUI
Position finale dans bounds: OUI
```

**À rapporter:**
- [ ] PointerCancel déclenché: OUI/NON
- [ ] Menu visible après: OUI/NON
- [ ] Position recadrée dans bounds: OUI/NON

---

### Test 4: Rechargement après drag
**Procédure:**
1. Drag menu à droite (ex: 200px)
2. Actualise la page (F5)
3. Menu doit être à la même position

**Résultats attendus:**
```
Avant reload: position.right = 232px (exemple)
Après reload: position.right = 232px
localStorage contient: {"right": 232, "bottom": 32}
```

**À rapporter:**
- [ ] Position avant reload
- [ ] Position après reload
- [ ] localStorage.getItem('floatingMenuPosition')
- [ ] Position restaurée exactement: OUI/NON

---

### Test 5: Resize fenêtre après drag
**Procédure:**
1. Fenêtre 1440×900, menu en position par défaut
2. Drag menu à droite (ex: position.right = 232px)
3. Redimensionne fenêtre à 800×600 (ex: F12 tools)
4. Menu doit rester visible, pas coupé, recadré si nécessaire

**Résultats attendus:**
```
Avant resize: menu visible, right = 232px
Après resize 800: right recadré (si 232 > 800 - barWidth - 8)
Menu visible: OUI
Position recadrée: YES (si nécessaire)
```

**À rapporter:**
- [ ] Position avant resize
- [ ] Taille fenêtre avant
- [ ] Taille fenêtre après
- [ ] Position après resize
- [ ] Menu visible: OUI/NON
- [ ] Position recadrée: OUI/NON

---

## Bonus: Cas Spéciaux

### Clic simple vs Drag
**Test:**
1. Clic sur poignée (< 4px movement) → panel reste fermé
2. Drag de 10px → panel fermé
3. Clic sur "Menu" → panel ouvre

**À rapporter:**
- [ ] Clic simple n'ouvre pas panel: OUI/NON
- [ ] Drag 10px n'ouvre pas panel: OUI/NON
- [ ] Clic Menu ouvre panel: OUI/NON

### Keyboard Nav
**Test:**
1. Focus sur poignée (Tab)
2. Appuie ArrowRight (8px)
3. Appuie Shift+ArrowRight (32px)
4. Appuie ArrowUp (8px)
5. Observe: menu se déplace correctement

**À rapporter:**
- [ ] ArrowRight: menu décale 8px: OUI/NON
- [ ] Shift+ArrowRight: menu décale 32px: OUI/NON
- [ ] ArrowUp: menu décale 8px: OUI/NON
- [ ] Tous les déplacements: fluides/saccadés

---

## Mesures Techniques (optionnel, pour débogage)

Pour chaque test, mesure (ouvre DevTools):

```javascript
// Dans la console:
// 1. Position du menu
document.querySelector('[data-floating-menu]').parentElement.style.right
document.querySelector('[data-floating-menu]').parentElement.style.bottom

// 2. localStorage
JSON.parse(localStorage.getItem('floatingMenuPosition'))

// 3. Transform pendant drag
document.querySelector('[data-floating-menu]').parentElement.style.transform

// 4. Classe dragging
document.querySelector('[data-floating-menu]').parentElement.classList.contains('dragging')
```

---

## Checklist de Validation Finale

- [ ] Test 1: Drag 200px droit + 200px bas = exact
- [ ] Test 2: Mouvement lent ET rapide = fluide
- [ ] Test 3: PointerCancel gère sortie écran
- [ ] Test 4: Position persiste après reload
- [ ] Test 5: Resize recadre le menu
- [ ] Bonus - Clic/Drag: distingué correctement
- [ ] Bonus - Keyboard: 8px/32px correct
- [ ] Light mode: OK
- [ ] Dark mode: OK
- [ ] Aucun scroll horizontal créé: OK

---

## Instrumentation de Test (si besoin)

Pour tester le drag sans navigateur:

```typescript
// Dans FloatingMenu.tsx, ajoute à la fin:
(window as any).__floatingMenuDebug = {
  getDragState: () => dragStateRef.current,
  getPosition: () => position,
  getContainerRect: () => containerRef.current?.getBoundingClientRect(),
  getClientDims: () => ({
    clientWidth: document.documentElement.clientWidth,
    clientHeight: document.documentElement.clientHeight,
  }),
}

// Dans console:
__floatingMenuDebug.getDragState()
__floatingMenuDebug.getPosition()
```

---

## Status

- [x] Code implémenté
- [x] Lint: Exit 0
- [ ] Test 1: Drag 200px×200px
- [ ] Test 2: Lent vs rapide
- [ ] Test 3: PointerCancel
- [ ] Test 4: Reload
- [ ] Test 5: Resize
- [ ] All tests passed

**Note:** À rapporter les résultats réels observés dans le navigateur.
