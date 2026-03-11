# AgriConnect Icons for PWA

## Required Icons:

You need to create these icon files in the `frontend/public/` directory:

### **icon-192.png** (192x192 pixels)

- Your AgriConnect logo at 192x192 pixels
- PNG format with transparent background recommended

### **icon-512.png** (512x512 pixels)

- Your AgriConnect logo at 512x512 pixels
- Used for splash screens and larger displays
- PNG format with transparent background recommended

---

## How to Create Icons:

### Option 1: Use Online Tool (Easiest)

1. Go to https://realfavicongenerator.net/
2. Upload your logo
3. Generate all sizes automatically
4. Download and add to `/public/` folder

### Option 2: Use Image Editor

1. Open your logo in Photoshop/GIMP/Canva
2. Resize to 512x512 pixels (high quality)
3. Export as PNG with transparent background
4. Save as `icon-512.png`
5. Resize to 192x192 pixels
6. Save as `icon-192.png`

### Option 3: Quick Placeholder (Temporary)

For now, you can use colored squares:

- Create a 512x512px green square with "A" text
- Save as both icon files

---

## Where to Place:

```
frontend/
  public/
    icon-192.png  ← Add here
    icon-512.png  ← Add here
    manifest.json ✅ Already created
    service-worker.js ✅ Already created
    offline.html ✅ Already created
```

---

## Test Your Icons:

After adding icons:

1. Deploy to Vercel
2. Open on mobile Chrome/Safari
3. Look for "Install App" prompt
4. Icons should appear correctly on home screen
