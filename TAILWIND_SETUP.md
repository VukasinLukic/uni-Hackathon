# 🎨 Tailwind CSS Setup - RoadSense Project

## ✅ Instalacija Kompletirana

Tailwind CSS je uspješno konfigurisan za **Web** i **Mobile** (NativeWind).

---

## 🖥️ WEB DASHBOARD SETUP

### Fajlovi
- ✅ `web/tailwind.config.js` - Tailwind konfiguracija
- ✅ `web/postcss.config.js` - PostCSS konfiguracija
- ✅ `web/src/index.css` - Custom Tailwind utilities
- ✅ `web/src/App.tsx` - Demo aplikacija

### Color System
```javascript
colors: {
  primary: '#2563eb',        // RoadSense Blue
  background: '#0a0a0a',     // Dark background
  foreground: '#ffffff',     // White text
  card: '#1a1a1a',          // Card background
  border: 'rgba(37, 99, 235, 0.2)',  // Blue border with opacity
}
```

### Custom Classes

#### Glass Card
```tsx
<div className="glass-card p-8">
  Card with glass morphism effect
</div>
```

#### Gradient Text
```tsx
<h1 className="text-gradient">
  RoadSense Timișoara
</h1>
```

#### Buttons
```tsx
<button className="btn-primary">Primary Button</button>
<button className="btn-secondary">Secondary Button</button>
```

#### Form Input
```tsx
<input className="form-input" type="text" placeholder="Enter text..." />
```

### Animations
```tsx
<div className="fade-in">Animated content</div>
```

### Running Demo
```bash
cd web
npm install
npm run dev
```

Visit http://localhost:5173 to see Tailwind in action!

---

## 📱 MOBILE APP SETUP (NativeWind)

### Fajlovi
- ✅ `mobile/tailwind.config.js` - Tailwind konfiguracija
- ✅ `mobile/babel.config.js` - Babel sa NativeWind plugin
- ✅ `mobile/App.tsx` - Demo aplikacija

### Using Tailwind in React Native

#### Text Components
```tsx
<Text className="text-white text-2xl font-bold">
  Hello World
</Text>
```

#### View Components
```tsx
<View className="bg-primary p-4 rounded-xl">
  <Text className="text-white">Content</Text>
</View>
```

#### Buttons (TouchableOpacity)
```tsx
<TouchableOpacity className="bg-primary px-6 py-3 rounded-xl">
  <Text className="text-white font-semibold">Press Me</Text>
</TouchableOpacity>
```

#### Flex Layout
```tsx
<View className="flex-row items-center justify-between gap-4">
  <Text>Left</Text>
  <Text>Right</Text>
</View>
```

### Running Demo
```bash
cd mobile
npm install
npm start
```

Press `i` for iOS simulator or scan QR with Expo Go app.

---

## 🎨 Common Utility Classes

### Spacing
```
p-4, p-6, p-8          # Padding
m-4, m-6, m-8          # Margin
gap-4, gap-6, gap-8    # Gap in flex/grid
```

### Colors
```
text-white, text-gray-400, text-primary
bg-background, bg-primary, bg-white/5
border-white/10, border-primary/30
```

### Typography
```
text-xl, text-2xl, text-4xl
font-semibold, font-bold, font-black
text-center, text-left
```

### Layout
```
flex, flex-row, flex-col
items-center, justify-center
gap-4, space-x-4, space-y-4
```

### Border & Radius
```
border, border-2
border-white/10, border-primary
rounded-xl, rounded-2xl, rounded-full
```

### Effects
```
opacity-50, opacity-100
hover:opacity-80 (web only)
transition-all duration-200
```

---

## 💡 Best Practices

### 1. Use Consistent Spacing
```tsx
// ✅ Good
<div className="p-6 gap-4">

// ❌ Avoid
<div className="p-5 gap-3">
```

### 2. Use Opacity for Transparency
```tsx
// ✅ Good
<div className="bg-white/5 border-white/10">

// ❌ Avoid
<div style={{backgroundColor: 'rgba(255,255,255,0.05)'}}>
```

### 3. Use Custom Classes for Reusable Styles
```tsx
// ✅ Good
<div className="glass-card">

// ❌ Avoid repeating
<div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
```

### 4. Mobile-First Responsive Design (Web)
```tsx
// ✅ Good
<div className="text-2xl md:text-4xl lg:text-6xl">

// ❌ Avoid
<div className="lg:text-2xl md:text-4xl text-6xl">
```

---

## 🔧 VS Code Setup

Install: **Tailwind CSS IntelliSense** extension

Add to `.vscode/settings.json`:
```json
{
  "tailwindCSS.experimental.classRegex": [
    ["className\s*=\s*['\"`]([^'\"`]*)['\"`]"]
  ]
}
```

---

## 🐛 Troubleshooting

### Web: Tailwind not working
```bash
# Make sure PostCSS and Tailwind are installed
cd web
npm install -D tailwindcss postcss autoprefixer

# Restart dev server
npm run dev
```

### Mobile: NativeWind not working
```bash
# Make sure NativeWind is installed
cd mobile
npm install nativewind

# Clear cache and restart
npm start -- --clear
```

### Styles not updating
- **Web**: Hard refresh (Ctrl+Shift+R)
- **Mobile**: Shake device and reload

---

## 📚 Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [NativeWind Docs](https://www.nativewind.dev/)
- [Tailwind Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)

---

## ✅ Verification Checklist

- [x] Web project has Tailwind configured
- [x] Mobile project has NativeWind configured
- [x] Demo pages created showing Tailwind working
- [x] Custom utilities documented
- [x] .gitkeep files added to empty folders
- [x] Projects ready to push to Git

---

**Everything is ready! 🚀**

Start development by reading your implementation plans and following the Quick Start guide.
