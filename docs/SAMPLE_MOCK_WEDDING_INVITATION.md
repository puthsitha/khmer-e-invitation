# Sample Mock Docs: Khmer Wedding Invitation (Dev Environment)

This document provides a **complete, production-grade mock wedding invitation dataset** and setup guide for the **Khmer E-Invitation** application in the development environment.

It includes:
- **Full Data Schema** covering 100% of the `Invitation` model without missing any fields.
- **Realistic Bilingual Content** in formal Khmer (`km`) and English (`en`) for couple names, parent names, formal invitations, address, and ceremonial timeline.
- **Working Media Assets**:
  - **Cover Video**: Direct YouTube link compatible with the application's background video embed parser (`src/lib/embed.ts`).
  - **Background Music**: Direct streaming MP3 wedding audio URL.
  - **Photo Gallery**: 8 high-resolution wedding photography URLs (Unsplash CDN).
  - **Love Story Timeline**: 4 milestones with bilingual narratives and photography.
  - **Ceremony Agenda**: 5 traditional Khmer wedding ceremony milestones with 12-hour timestamps.
  - **Digital Envelope**: Scannable KHQR / Bakong digital gift QR code image.
  - **Google Maps**: Direct Google Maps venue URL and embed coordinates.
  - **RSVP Responses**: Sample mock guest responses.

---

## Table of Contents

1. [Quick Overview & Dev Routes](#1-quick-overview--dev-routes)
2. [Complete Mock Invitation Document (JSON Payload)](#2-complete-mock-invitation-document-json-payload)
3. [Associated Firestore Documents (`slugs`, `templates`, `palettes`, `rsvps`)](#3-associated-firestore-documents)
4. [Method 1: One-Click Button in Dev Dashboard UI (Recommended)](#4-method-1-one-click-button-in-dev-dashboard-ui-recommended)
5. [Method 2: Authenticated CLI Seeding Script (Node.js)](#5-method-2-authenticated-cli-seeding-script-nodejs)
6. [Method 3: Direct Firestore Console / Emulator Import](#6-method-3-direct-firestore-console--emulator-import)
7. [Testing and Verification in Dev Browser](#7-testing-and-verification-in-dev-browser)

---

## 1. Quick Overview & Dev Routes

When running `npm run dev`, you can access and test the invitation at:

| Purpose | Route / URL |
| :--- | :--- |
| **Khmer Viewer** | `http://localhost:3000/km/i/chenda-monyroth-wedding` |
| **English Viewer** | `http://localhost:3000/en/i/chenda-monyroth-wedding` |
| **Personalized Guest Link** | `http://localhost:3000/km/i/chenda-monyroth-wedding?to=ឯកឧត្តម+ជា+សុខា` |
| **Dashboard Editor** | `http://localhost:3000/dashboard/mock-wedding-chenda-monyroth` |
| **Create New Invitation** | `http://localhost:3000/dashboard/new` |

---

## 2. Complete Mock Invitation Document (JSON Payload)

**Collection:** `invitations`  
**Document ID:** `mock-wedding-chenda-monyroth`

```json
{
  "invitationId": "mock-wedding-chenda-monyroth",
  "ownerUid": "dev-user-001",
  "slug": "chenda-monyroth-wedding",
  "category": "wedding",
  "templateId": "classic-khmer-gold",
  "defaultLocale": "km",
  "status": "published",
  "colorPalette": "royal-gold",
  "eventDate": 1797552000000,
  "coverVideoEmbedUrl": "https://www.youtube.com/watch?v=EngW7tLk6R8",
  "content": {
    "groomName": {
      "km": "សុខ ចិន្តា",
      "en": "Sok Chenda"
    },
    "brideName": {
      "km": "កែវ មុន្នីរ័ត្ន",
      "en": "Keo Monyroth"
    },
    "groomFamily": {
      "father": {
        "km": "លោក សុខ សំអាត",
        "en": "Mr. Sok Sam At"
      },
      "mother": {
        "km": "លោកស្រី ម៉ៅ សុផល",
        "en": "Mrs. Mao Sophal"
      }
    },
    "brideFamily": {
      "father": {
        "km": "លោក កែវ វិបុល",
        "en": "Mr. Keo Vibul"
      },
      "mother": {
        "km": "លោកស្រី ចាន់ ធីតា",
        "en": "Mrs. Chan Thida"
      }
    },
    "invitationText": {
      "km": "យើងខ្ញុំមានកិត្តិយស និងសេចក្តីសោមនស្សរីករាយឥតឧបមា សូមគោរពអញ្ជើញ ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា ព្រមទាំងប្រិយមិត្តជិតឆ្ងាយទាំងអស់ ចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយស ដើម្បីប្រសិទ្ធពរជ័យ សិរីសួស្តី ជ័យមង្គល ក្នុងពិធីរៀបអាពាហ៍ពិពាហ៍កូនប្រុស-កូនស្រីរបស់យើងខ្ញុំ។ វត្តមានដ៏ឧត្តុង្គឧត្តមរបស់អស់លោកអ្នក គឺជាកិត្តិយសដ៏ធំធេង និងជាសក្ខីភាពនៃក្តីស្រឡាញ់ដ៏ជ្រាលជ្រៅសម្រាប់គ្រួសារយើងខ្ញុំទាំងពីរ។",
      "en": "We have the immense honor and greatest joy of cordially inviting your Excellency, Lok Chumteav, ladies, gentlemen, and beloved friends and family to grace our celebration with your presence and bestow your warmest blessings upon the Holy Matrimony and wedding reception of our son and daughter. Your distinguished presence is a profound honor and testament to the cherished love shared with our two families."
    },
    "address": {
      "km": "មជ្ឈមណ្ឌល ឌឹ ព្រេមៀ សែនសុខ (អគារ A - ជាន់ផ្ទាល់ដី) ផ្លូវ ១០០៣ សង្កាត់ភ្នំពេញថ្មី ខណ្ឌសែនសុខ រាជធានីភ្នំពេញ",
      "en": "The Premier Centre Sen Sok (Building A - Ground Floor), Street 1003, Sangkat Phnom Penh Thmey, Khan Sen Sok, Phnom Penh, Cambodia"
    },
    "mapUrl": "https://maps.google.com/?q=The+Premier+Centre+Sen+Sok+Phnom+Penh",
    "story": [
      {
        "title": {
          "km": "ជំនួបដំបូងដ៏ផ្អែមល្ហែម",
          "en": "When Our Paths First Crossed"
        },
        "description": {
          "km": "យើងបានជួបគ្នាជាលើកដំបូងនៅហាងកាហ្វេតូចមួយកណ្តាលរាជធានីភ្នំពេញក្នុងរដូវរំហើយ។ គ្រាន់តែឃើញស្នាមញញឹមដ៏ស្រទន់របស់នាងដំបូង បេះដូងខ្ញុំក៏ដឹងថា ពិភពលោករបស់ខ្ញុំនឹងលែងដូចមុនទៀតហើយ។",
          "en": "We first met at a cozy café in central Phnom Penh on a breezy autumn afternoon. One gentle smile across the room was all it took for both of us to know our lives had changed forever."
        },
        "image": "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1000&q=80"
      },
      {
        "title": {
          "km": "ដំណើរកម្សាន្តនៅទឹកដីអង្គរ",
          "en": "The Journey to Angkor"
        },
        "description": {
          "km": "ការឈរទស្សនាថ្ងៃរះនៅពីមុខប្រាសាទអង្គរវត្តជាមួយគ្នា បានធ្វើឱ្យយើងទាំងពីរកាន់តែយល់ចិត្ត និងចងក្រងនូវការចងចាំដ៏មានតម្លៃដែលមិនអាចបំភ្លេចបាន។",
          "en": "Watching the golden sunrise illuminate Angkor Wat hand-in-hand taught us how beautiful life is when shared with your kindred soul."
        },
        "image": "https://images.unsplash.com/photo-1609137144822-4458cb5e33eb?auto=format&fit=crop&w=1000&q=80"
      },
      {
        "title": {
          "km": "ពាក្យសន្យានៅមាត់ទន្លេចតុមុខ",
          "en": "The Sunset Proposal"
        },
        "description": {
          "km": "នៅក្រោមពន្លឺថ្ងៃលិចពណ៌មាសតាមបណ្តោយដងទន្លេចតុមុខ ចិន្តាបានលុតជង្គង់សុំមុន្នីរ័ត្នរៀបការ ជាមួយនឹងចម្លើយ 'យល់ព្រម' អមដោយទឹកភ្នែកនៃក្តីរំភើប។",
          "en": "Under the golden sunset along the Chaktomuk riverfront, Chenda knelt down with a ring, and Monyroth said 'Yes' through tears of pure joy."
        },
        "image": "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1000&q=80"
      },
      {
        "title": {
          "km": "ការចាប់ផ្តើមនៃនិរន្តរភាព",
          "en": "The Beginning of Forever"
        },
        "description": {
          "km": "ថ្ងៃនេះ យើងទាំងពីរសូមចាប់ដៃគ្នាសាងគ្រួសារដ៏កក់ក្តៅ និងដើរលើវិថីជីវិតជាមួយគ្នាដោយក្តីស្រឡាញ់ ភាពស្មោះត្រង់ និងការយល់ចិត្តជារៀងរហូត។",
          "en": "Today, with humble and grateful hearts, we unite our souls to build a loving home and walk the journey of life as partners for eternity."
        },
        "image": "https://images.unsplash.com/photo-1519225429980-715cb0215aed?auto=format&fit=crop&w=1000&q=80"
      }
    ],
    "agenda": [
      {
        "time": "7:00 AM",
        "title": {
          "km": "ពិធីហែកូនកំលោះ និងរៀបរាប់ផ្លែឈើ (ហែជំនូន)",
          "en": "Groom's Procession & Fruit Trays (Hai Neak)"
        }
      },
      {
        "time": "8:30 AM",
        "title": {
          "km": "ពិធីពិសាកំណត់ និងសែនមេបា",
          "en": "Ancestral Ceremony & Homage to Elders (Sen Me Ba)"
        }
      },
      {
        "time": "9:30 AM",
        "title": {
          "km": "ពិធីកាត់សក់បង្កក់សិរី និងបាចផ្កាស្លា",
          "en": "Hair Cutting & Cleansing Ceremony (Gaat Sahk)"
        }
      },
      {
        "time": "11:00 AM",
        "title": {
          "km": "ពិធីសំពះផ្ទឹម និងចងដៃប្រសិទ្ធពរជ័យ",
          "en": "Pairing & Thread-Tying Blessing Ceremony (Sompeas Phtem)"
        }
      },
      {
        "time": "5:30 PM",
        "title": {
          "km": "ពិធីទទួលបដិសណ្ឋារកិច្ច និងពិសាភោជនាហារពេលល្ងាច",
          "en": "Evening Reception Banquet & Dinner Celebration"
        }
      }
    ]
  },
  "mediaUrls": {
    "bgMusic": "https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-640.mp3",
    "gallery": [
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80"
    ],
    "digitalEnvelopeQr": "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=KHQR_BAKONG_MOCK_PAYMENT_SOK_CHINDA_KEO_MONYROTH"
  },
  "createdAt": 1726000000000,
  "updatedAt": 1726000000000
}
```

---

## 3. Associated Firestore Documents

For the invitation above to resolve properly in both the **public viewer** and the **admin dashboard**, the following supporting documents should also exist in Firestore:

### A. Slug Reservation Document
- **Collection:** `slugs`
- **Document ID:** `chenda-monyroth-wedding`
- **Data:**
  ```json
  {
    "invitationId": "mock-wedding-chenda-monyroth"
  }
  ```

### B. Template Document
- **Collection:** `templates`
- **Document ID:** `classic-khmer-gold`
- **Data:**
  ```json
  {
    "templateId": "classic-khmer-gold",
    "category": "wedding",
    "name": "Classic Khmer Gold Wedding",
    "previewImage": "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80",
    "defaultColorPalette": "royal-gold",
    "defaultFonts": {
      "heading": "Moul",
      "body": "Kantumruy Pro"
    }
  }
  ```

### C. Color Palette Document
- **Collection:** `palettes`
- **Document ID:** `royal-gold`
- **Data:**
  ```json
  {
    "paletteId": "royal-gold",
    "name": "Royal Gold",
    "primary": "#c9a24b",
    "primaryLight": "#e6cd8a",
    "secondary": "#7a1f2b",
    "background": "#fdf8f0"
  }
  ```

### D. Mock RSVP Responses
- **Collection:** `rsvps/mock-wedding-chenda-monyroth/responses`

1. **Document ID:** `rsvp-001`
   ```json
   {
     "responseId": "rsvp-001",
     "guestName": "ឯកឧត្តម ជា សុខា",
     "attending": true,
     "message": "សូមប្រសិទ្ធពរជ័យឱ្យគូស្វាមីភរិយាថ្មី ជួបតែសុភមង្គល និងស្រឡាញ់គ្នារហូតដល់ចាស់កោងខ្នង!",
     "createdAt": 1726001000000
   }
   ```

2. **Document ID:** `rsvp-002`
   ```json
   {
     "responseId": "rsvp-002",
     "guestName": "Mr. & Mrs. David Miller",
     "attending": true,
     "message": "Wishing Chenda & Monyroth a lifetime of endless love and happiness. Congratulations!",
     "createdAt": 1726002000000
   }
   ```

---

## 4. Method 1: One-Click Button in Dev Dashboard UI (Recommended)

Since Firestore security rules require an authenticated user (`request.auth.uid == ownerUid`), the fastest, 100% permission-safe way is directly inside your authenticated browser session:

1. Start your local dev server:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:3000/login` and sign in.
3. On your dashboard (`http://localhost:3000/dashboard`), click the **"⚡ Seed Mock Wedding"** button in the header (or in the empty state card).
4. The system automatically creates the unique slug, saves the full invitation, seeds sample RSVPs, and opens the editor immediately.

---

## 5. Method 2: Authenticated CLI Seeding Script (Node.js)

If you prefer using the terminal, pass your Firebase Auth credentials so Firestore security rules allow the write:

```bash
node scripts/seed-mock-wedding.mjs <your-email> <your-password>
```

Or pass via environment variables:

```bash
SEED_EMAIL=you@example.com SEED_PASSWORD=yourpass npm run seed:wedding
```

Once authenticated, the script automatically:
- Signs in via Firebase Auth
- Detects your `ownerUid`
- Generates a conflict-free unique slug
- Writes `invitations` and `slugs` atomically
- Seeds sample RSVPs
- Outputs the ready-to-test URLs

---

## 6. Method 3: Direct Firestore Console / Emulator Import

If you are using the **Firebase Local Emulator Suite** (`firebase emulators:start`) or the **Firebase Console**:

1. Open the Firestore Database tab.
2. Under collection `invitations`, add document `mock-wedding-chenda-monyroth` with the JSON payload from [Section 2](#2-complete-mock-invitation-document-json-payload).
   > **Note:** Set your real user `uid` into `ownerUid` so it appears in your `/dashboard` list.
3. Under collection `slugs`, add document `chenda-monyroth-wedding` with `{ "invitationId": "mock-wedding-chenda-monyroth" }`.
4. Under subcollection `rsvps/mock-wedding-chenda-monyroth/responses`, add the sample RSVP documents from [Section 3-D](#d-mock-rsvp-responses).

---

## 7. Testing and Verification in Dev Browser

After applying the mock document, test all features in the viewer:

1. **Wax Seal & Envelope Animation:**
   - Open `http://localhost:3000/km/i/chenda-monyroth-wedding`.
   - Click the interactive wax seal. Verify that the envelope unrolls smoothly and romantic background audio starts.

2. **Hero Screen & YouTube Background:**
   - Verify the YouTube background video (`EngW7tLk6R8`) autoplays silently in the background behind the frosted glass backdrop.
   - Verify couple names `សុខ ចិន្តា` & `កែវ មុន្នីរ័ត្ន` appear with gold script typography.

3. **Guest Personalization (`?to=...`):**
   - Open `http://localhost:3000/km/i/chenda-monyroth-wedding?to=ឯកឧត្តម+ជា+សុខា`.
   - Verify the ornate gold nameframe greets the specified guest name.

4. **Language Switcher:**
   - Click the language toggle button in the top floating bar.
   - Toggle between `KM` (Khmer) and `EN` (English).
   - Verify that all content dynamically updates without reloading.

5. **Countdown & Add to Calendar (.ics):**
   - Check that the countdown clock displays live animated digits.
   - Click **Add to Calendar** to download the `.ics` calendar invite and verify the event details.

6. **Interactive Orbit Gallery & Lightbox:**
   - Check the rotating circular gallery of wedding photos.
   - Click on any photo to open the full-screen photo lightbox with keyboard and swipe navigation.

7. **Google Maps Embed:**
   - Verify the embedded Google Map for The Premier Centre Sen Sok renders.
   - Click **Open in Google Maps** to test the external redirect.

8. **Love Story Timeline:**
   - Verify all 4 story cards display with typewriter text reveal animations and high-resolution photos.

9. **Digital Envelope (KHQR / Bakong):**
   - Verify the QR code displays clearly inside the ornate container with monetary gift blessing note.

10. **RSVP Form Submission:**
    - Scroll to the RSVP section or visit the dashboard to review real-time responses.
