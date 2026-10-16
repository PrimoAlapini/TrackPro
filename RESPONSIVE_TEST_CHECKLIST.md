# Responsive Test Checklist - TrackPro Layout Restructure

**Task 8 Verification Document**

Test viewport sizes: **1440px** (desktop), **768px** (tablet/mobile transition), **390px** (mobile)
Test themes: **Light mode** + **Dark mode**

---

## 1. Header Component (`Header.tsx`)

### 1440px (Desktop - Full Layout)
- [ ] **Light**: Logo clickable, "Dossier actif" label visible with full dossier selector (dropdown), "Admin" label + chevron in user menu, no search bar
- [ ] **Dark**: Same as light, colors inverted

### 768px (Tablet - Compact)
- [ ] **Light**: Dossier selector becomes compact, shows only "TRK-xxx" code, logo visible, user menu compact but still shows "Admin" label + chevron
- [ ] **Dark**: Same as light

### 390px (Mobile - Ultra-Compact)
- [ ] **Light**: Logo visible, dossier selector shows "TRK-xxx" only (inline), user menu icon only (no text), responsive padding
- [ ] **Dark**: Same as light

---

## 2. FloatingMenu Component (`FloatingMenu.tsx`)

### 1440px (Desktop - Always Visible)
- [ ] **Light**: Fixed bottom-right (32px offset), 52px height, grip handle visible, draggable, panel toggles up/down with chevron
- [ ] **Dark**: Same styling, colors for dark mode
- [ ] **Interaction**: Drag handle, keyboard arrow nav (up/down/left/right), localStorage persistence (position stays after refresh)
- [ ] **Panel**: Drops upward if space available, downward if near top, shows 5 nav items with current page badge

### 768px (Tablet - Visible)
- [ ] **Light**: Same as desktop, may need space adjustment
- [ ] **Dark**: Same

### 390px (Mobile - HIDDEN)
- [ ] **Light**: FloatingMenu should be `hidden` (lg:hidden)
- [ ] **Dark**: Confirmed hidden

---

## 3. BottomNav Component (`BottomNav.tsx`)

### 1440px (Desktop - HIDDEN)
- [ ] **Light**: BottomNav should NOT be visible (lg:hidden)
- [ ] **Dark**: Confirmed hidden

### 768px (Tablet - Visible)
- [ ] **Light**: Fixed bottom 72px, 5 icons (equal width), active icon = primary pill 48x40 rayon 12, safe-area padding
- [ ] **Dark**: Same styling for dark mode
- [ ] **Interaction**: Click each icon, verify active state changes, check aria-labels

### 390px (Mobile - Fully Visible)
- [ ] **Light**: All 5 icons visible, active icon highlighted with pill style, no text labels, touch-friendly spacing
- [ ] **Dark**: Same as light

---

## 4. AppLayout Component (`AppLayout.tsx`)

### Main Content Spacing
- [ ] **1440px (Desktop)**: `pb-[104px]` (FloatingMenu), no left margin (removed sidebar), full-width content
- [ ] **768px (Tablet)**: `pb-[120px]` (mobile), BottomNav visible
- [ ] **390px (Mobile)**: `pb-[120px]`, BottomNav visible with safe-area-inset-bottom

### Sidebar Removal
- [ ] All sizes: Sidebar import removed, `sidebarOpen` state removed, no backdrop
- [ ] Content should stretch full-width (no `lg:ml-[248px]` constraint)

---

## 5. Settings Page (`Settings.tsx`)

### 1440px (Desktop)
- [ ] **Light**: 
  - Two-column layout: Dossiers (left, ~1fr) + Compte (right, ~400px)
  - Dossier cards with 2-col info grid (Début/Date limite row 1, Resp. collecte/Resp. revue row 2)
  - Member avatars, piece count, progress bar
  - 3 action buttons (Activate/Edit/Delete)
  - "Nouveau dossier" button at top-right
  - Subtitle: "Gérez vos dossiers et votre compte"
- [ ] **Dark**: Same layout, dark colors

### 768px (Tablet)
- [ ] **Light**: Layout transitions smoothly, still 2-col but may need adjustment
- [ ] **Dark**: Same

### 390px (Mobile)
- [ ] **Light**: 
  - Stacked to single column (Dossiers full-width, then Compte below)
  - Dossier cards still readable, info grid stacks if needed
  - Buttons remain accessible
  - "Nouveau dossier" button on card header (responsive width)
- [ ] **Dark**: Same as light

---

## 6. Navigation Flow

### Desktop (1440px)
- [ ] FloatingMenu panel opens/closes, shows current page badge
- [ ] Click nav items in FloatingMenu, verify routing works
- [ ] Drag handle to new position, verify localStorage saves position

### Tablet (768px)
- [ ] BottomNav shows at bottom
- [ ] Click each icon, verify active state + routing
- [ ] FloatingMenu may be partially visible, check no overlap/conflicts

### Mobile (390px)
- [ ] BottomNav shows all 5 icons at bottom
- [ ] Click icons, verify active state + routing
- [ ] FloatingMenu NOT visible
- [ ] Safe-area-inset-bottom respected (device notches/rounded corners)

---

## 7. Responsive Breakpoints Verification

| Breakpoint | Component | Status |
|---|---|---|
| < 768px (mobile) | BottomNav | VISIBLE |
| < 768px (mobile) | FloatingMenu | HIDDEN |
| >= 768px (desktop) | BottomNav | HIDDEN |
| >= 768px (desktop) | FloatingMenu | VISIBLE |

---

## 8. Theme Switching

### Light Mode (all sizes)
- [ ] 390px: Text readable, contrast OK
- [ ] 768px: Text readable, contrast OK
- [ ] 1440px: Text readable, contrast OK

### Dark Mode (all sizes)
- [ ] 390px: Text readable, contrast OK, background dark
- [ ] 768px: Text readable, contrast OK, background dark
- [ ] 1440px: Text readable, contrast OK, background dark

---

## 9. Key Features to Verify

- [ ] **Header dossier selector**: Works at all sizes, shows/hides appropriately
- [ ] **User menu**: Accessible at all sizes, displays "Admin" label on desktop/tablet
- [ ] **FloatingMenu drag**: Smooth, position persists, keyboard nav works
- [ ] **BottomNav active state**: Updates correctly, aria-labels present
- [ ] **Settings Dossiers section**: Cards render correctly, actions work
- [ ] **No Sidebar artifacts**: Old Sidebar code removed, no visual remnants
- [ ] **No Search bar**: Removed from Header, confirmed gone at all sizes

---

## 10. Known Warnings (Non-Blocking)

- `panelHeight` unused in FloatingMenu (line 58) - can be removed or used for future expansion
- `isActive` unused in FloatingMenu (line 170) - check if needed
- SetState in effects in DossierContext, DialogContext - performance warnings, not blocking
- No errors on `npm run lint` (exit 0)

---

## Test Status

| Size | Light | Dark | Notes |
|---|---|---|---|
| 1440px | [ ] | [ ] | Desktop full layout |
| 768px | [ ] | [ ] | Tablet transition |
| 390px | [ ] | [ ] | Mobile compact |

**Overall Status**: [ ] READY FOR TASK 9

---

**Next Step**: After verification, proceed to Task 9 (Compare with maquettes, update tasks.md)
