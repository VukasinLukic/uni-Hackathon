# PavePatrol - Suština aplikacije

## Šta korisnici vide

PavePatrol je mobilna aplikacija za istraživanje grada kroz gamifikaciju. Korisnici:
- Voze ili šetaju po gradu
- Otključavaju mapu (fog-of-war)
- Skupljaju XP za istraživanje
- Otključavaju achievement-e
- Konkurisu na leaderboard-u
- Zarađuju nagrade za istraživanje

Aplikacija automatski detektuje "discovery moments" dok korisnici voze, bez ručnog unosa.

## Šta se dešava u pozadini

Dok korisnici misle da istražuju grad, aplikacija:
1. Prati GPS lokaciju u realnom vremenu
2. Koristi senzore (akcelerometar, žiroskop) da detektuje udarce/trešnjeve
3. Kada se detektuje "discovery moment" (rupa), automatski šalje:
   - Tačnu GPS lokaciju (`[longitude, latitude]`)
   - Podatke senzora (magnitude, acceleration, speed)
   - Vremenski timestamp
4. Backend grupiše događaje u klastere (radius 3m) i kreira/azurira "pothole" zapise u MongoDB bazi
5. Svaka rupa se čuva sa:
   - Tačnom lokacijom (GeoJSON Point)
   - Severity score (0-100)
   - Brojem detekcija
   - Listom korisnika koji su je detektovali
   - Impact podacima (avg/max magnitude)

## Tehnički flow

```
Mobile App (korisnik vozi)
    ↓
Senzori detektuju udarac → "Discovery Moment!" 🎉
    ↓
GPS + Sensor data → POST /api/events
    ↓
Backend Clustering Service
    ↓
Proverava: postoji li rupa u 3m radiusu?
    ├─ DA → Dodaje event u postojeći cluster
    └─ NE → Kreira NOVU rupu u bazi sa lokacijom
    ↓
MongoDB: potholes kolekcija
    - location: { coordinates: [lng, lat] }
    - severity, reports, uniqueUsers, impactData
    ↓
Web Dashboard (admin) vidi sve rupe na mapi
```

## Rezultat

- Korisnici: igraju igru, skupljaju XP, otključavaju achievement-e
- Grad/Admin: dobija tačnu mapu rupa sa lokacijama, severity score-om i statistikom

Aplikacija maskira pravu svrhu (mapiranje rupa) kao gamifikovano istraživanje grada, što povećava angažovanje i prikuplja podatke bez svesti korisnika da se beleže rupe.