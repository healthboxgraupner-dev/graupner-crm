═══════════════════════════════════════════════════════════════
   HEALTHBOX CRM - DEPLOYMENT PAKET v2.2.2
═══════════════════════════════════════════════════════════════

✅ DIESES VERZEICHNIS IST DEPLOYMENT-FERTIG!

Alle notwendigen Dateien für Netlify sind in diesem Ordner.

═══════════════════════════════════════════════════════════════
📦 INHALT (23 Dateien):
═══════════════════════════════════════════════════════════════

Root-Dateien:
  ✓ index.html (Hauptdatei mit allen Updates)
  ✓ logo.svg (HEALTHBOX Logo)
  ✓ logo.png (HEALTHBOX Logo Fallback)

CSS:
  ✓ css/styles.css

JavaScript Core:
  ✓ js/utils.js
  ✓ js/database.js (MIT REGISTRATION FIX!)
  ✓ js/auth.js
  ✓ js/export.js
  ✓ js/app.js (mit Income Calculator Route)
  ✓ js/supabase-config.js
  ✓ js/supabase-db.js
  ✓ js/calendar-export.js (NEU!)

JavaScript Pages:
  ✓ js/pages/dashboard.js (mit Goal Progress)
  ✓ js/pages/leads.js
  ✓ js/pages/calls.js (mit Kalender Export)
  ✓ js/pages/followup.js (mit Kalender Export)
  ✓ js/pages/reflection.js (mit Kalender Export)
  ✓ js/pages/monthly.js
  ✓ js/pages/admin.js (mit Registration Fix)
  ✓ js/pages/profile.js
  ✓ js/pages/settings.js
  ✓ js/pages/materials.js
  ✓ js/pages/income-calculator.js (NEU!)

═══════════════════════════════════════════════════════════════
🚀 DEPLOYMENT OPTIONEN:
═══════════════════════════════════════════════════════════════

OPTION 1: ZIP erstellen und hochladen
---------------------------------------
1. Markiere ALLE Dateien in diesem Ordner (NICHT den Ordner selbst!)
2. Rechtsklick → "Komprimieren" / "Zu ZIP hinzufügen"
3. Lade die ZIP-Datei auf Netlify hoch

OPTION 2: Drag & Drop (empfohlen!)
---------------------------------------
1. Öffne Netlify → Deploys Tab
2. Ziehe diesen GESAMTEN ORDNER in den Upload-Bereich
3. Warte auf "Deploy successful"

OPTION 3: Netlify CLI
---------------------------------------
1. Terminal öffnen
2. cd deployment
3. netlify deploy --prod

═══════════════════════════════════════════════════════════════
✨ NEUE FEATURES IN v2.2.2:
═══════════════════════════════════════════════════════════════

✅ Kalender-Integration
   - Google Calendar direkt-Link
   - .ics Download für alle Kalender-Apps
   - Funktioniert für: Follow-ups, Calls, Reflections

✅ Einkommens-Kalkulator
   - Automatische Berechnung von Required Leads/Calls/Deals
   - Basierend auf: Einkommensziel, Provision, Conversion Rates
   - Tages- und Wochenplanung

✅ Registration Bug Fix
   - Neue Registrierungen erscheinen jetzt im Admin Panel
   - database.js wurde korrigiert (setPendingRegistrations)

✅ Passwort Anzeige/Verstecken
   - Auge-Icon auf Login & Registration Seiten
   - Toggle zwischen Passwort und Klartext

═══════════════════════════════════════════════════════════════
📋 NACH DEM DEPLOYMENT TESTEN:
═══════════════════════════════════════════════════════════════

1. ✓ Login funktioniert (mit Passwort Toggle)
2. ✓ Registration funktioniert
3. ✓ Admin Panel zeigt "Ausstehende Registrierungen"
4. ✓ Income Calculator ist erreichbar (Sidebar)
5. ✓ Kalender Export funktioniert (Follow-ups, Calls, Reflections)
6. ✓ Dashboard zeigt Goal Progress (wenn Calculator ausgefüllt)

═══════════════════════════════════════════════════════════════
🆘 SUPPORT:
═══════════════════════════════════════════════════════════════

Bei Problemen:
- Console öffnen (F12) und Fehlermeldungen prüfen
- Prüfen ob alle 23 Dateien hochgeladen wurden
- Cache leeren (Strg+F5 / Cmd+Shift+R)

Admin Login (Demo):
  E-Mail: admin@healthbox.com
  Passwort: admin123

═══════════════════════════════════════════════════════════════
Version: 2.2.2
Datum: 2024-11-13
Status: PRODUCTION READY ✅
═══════════════════════════════════════════════════════════════
