import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, writeBatch, getDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// Load environment variables from .env.local if present
function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return {};
  const content = readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.substring(0, idx).trim();
    const val = trimmed.substring(idx + 1).trim();
    env[key] = val;
  }
  return env;
}

const env = { ...loadEnv(), ...process.env };

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
  console.error("❌ Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID in .env.local or process.env");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const email = process.argv[2] || process.env.SEED_EMAIL;
const password = process.argv[3] || process.env.SEED_PASSWORD;

async function seed() {
  console.log("🌱 Khmer E-Invitation: Dev Seed Script");
  console.log(`📦 Project ID: ${firebaseConfig.projectId}`);

  if (!email || !password) {
    console.error("\n⚠️  AUTHENTICATION REQUIRED");
    console.error("------------------------------------------------------------------");
    console.error("Firestore security rules require an authenticated user to write");
    console.error("invitations (request.auth.uid == ownerUid).\n");
    console.error("Choose one of the following methods:\n");
    console.error("  Method A (Terminal):");
    console.error("    node scripts/seed-mock-wedding.mjs <your-email> <your-password>");
    console.error("    OR:");
    console.error("    SEED_EMAIL=you@domain.com SEED_PASSWORD=yourpass npm run seed:wedding\n");
    console.error("  Method B (Web UI - Recommended):");
    console.error("    1. Start your local server: npm run dev");
    console.error("    2. Log in at http://localhost:3000/login");
    console.error("    3. Click the '✨ Seed Mock Wedding' button on your dashboard!");
    console.error("------------------------------------------------------------------\n");
    process.exit(1);
  }

  console.log(`🔐 Signing in as ${email}...`);
  let userCred;
  try {
    userCred = await signInWithEmailAndPassword(auth, email, password);
  } catch (authErr) {
    console.error("❌ Authentication failed:", authErr.message);
    process.exit(1);
  }

  const ownerUid = userCred.user.uid;
  console.log(`✅ Signed in successfully! Owner UID: ${ownerUid}`);

  const baseSlug = "chenda-monyroth-wedding";
  let slug = baseSlug;
  const existingSlugSnap = await getDoc(doc(db, "slugs", slug));
  if (existingSlugSnap.exists()) {
    slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    console.log(`ℹ️ Slug '${baseSlug}' was already taken. Using '${slug}' instead.`);
  }

  const invitationId = `mock-${slug}`;

  const invitationData = {
    invitationId,
    ownerUid,
    slug,
    category: "wedding",
    templateId: "classic-khmer-gold",
    defaultLocale: "km",
    status: "published",
    colorPalette: "royal-gold",
    eventDate: 1797552000000, // Dec 18, 2026 07:00 AM UTC+7
    coverVideoEmbedUrl: "https://www.youtube.com/watch?v=EngW7tLk6R8",
    content: {
      groomName: {
        km: "សុខ ចិន្តា",
        en: "Sok Chenda",
      },
      brideName: {
        km: "កែវ មុន្នីរ័ត្ន",
        en: "Keo Monyroth",
      },
      groomFamily: {
        father: {
          km: "លោក សុខ សំអាត",
          en: "Mr. Sok Sam At",
        },
        mother: {
          km: "លោកស្រី ម៉ៅ សុផល",
          en: "Mrs. Mao Sophal",
        },
      },
      brideFamily: {
        father: {
          km: "លោក កែវ វិបុល",
          en: "Mr. Keo Vibul",
        },
        mother: {
          km: "លោកស្រី ចាន់ ធីតា",
          en: "Mrs. Chan Thida",
        },
      },
      invitationText: {
        km: "យើងខ្ញុំមានកិត្តិយស និងសេចក្តីសោមនស្សរីករាយឥតឧបមា សូមគោរពអញ្ជើញ ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា ព្រមទាំងប្រិយមិត្តជិតឆ្ងាយទាំងអស់ ចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយស ដើម្បីប្រសិទ្ធពរជ័យ សិរីសួស្តី ជ័យមង្គល ក្នុងពិធីរៀបអាពាហ៍ពិពាហ៍កូនប្រុស-កូនស្រីរបស់យើងខ្ញុំ។ វត្តមានដ៏ឧត្តុង្គឧត្តមរបស់អស់លោកអ្នក គឺជាកិត្តិយសដ៏ធំធេង និងជាសក្ខីភាពនៃក្តីស្រឡាញ់ដ៏ជ្រាលជ្រៅសម្រាប់គ្រួសារយើងខ្ញុំទាំងពីរ។",
        en: "We have the immense honor and greatest joy of cordially inviting your Excellency, Lok Chumteav, ladies, gentlemen, and beloved friends and family to grace our celebration with your presence and bestow your warmest blessings upon the Holy Matrimony and wedding reception of our son and daughter. Your distinguished presence is a profound honor and testament to the cherished love shared with our two families.",
      },
      address: {
        km: "មជ្ឈមណ្ឌល ឌឹ ព្រេមៀ សែនសុខ (អគារ A - ជាន់ផ្ទាល់ដី) ផ្លូវ ១០០៣ សង្កាត់ភ្នំពេញថ្មី ខណ្ឌសែនសុខ រាជធានីភ្នំពេញ",
        en: "The Premier Centre Sen Sok (Building A - Ground Floor), Street 1003, Sangkat Phnom Penh Thmey, Khan Sen Sok, Phnom Penh, Cambodia",
      },
      mapUrl: "https://maps.google.com/?q=The+Premier+Centre+Sen+Sok+Phnom+Penh",
      story: [
        {
          title: {
            km: "ជំនួបដំបូងដ៏ផ្អែមល្ហែម",
            en: "When Our Paths First Crossed",
          },
          description: {
            km: "យើងបានជួបគ្នាជាលើកដំបូងនៅហាងកាហ្វេតូចមួយកណ្តាលរាជធានីភ្នំពេញក្នុងរដូវរំហើយ។ គ្រាន់តែឃើញស្នាមញញឹមដ៏ស្រទន់របស់នាងដំបូង បេះដូងខ្ញុំក៏ដឹងថា ពិភពលោករបស់ខ្ញុំនឹងលែងដូចមុនទៀតហើយ។",
            en: "We first met at a cozy café in central Phnom Penh on a breezy autumn afternoon. One gentle smile across the room was all it took for both of us to know our lives had changed forever.",
          },
          image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1000&q=80",
        },
        {
          title: {
            km: "ដំណើរកម្សាន្តនៅទឹកដីអង្គរ",
            en: "The Journey to Angkor",
          },
          description: {
            km: "ការឈរទស្សនាថ្ងៃរះនៅពីមុខប្រាសាទអង្គរវត្តជាមួយគ្នា បានធ្វើឱ្យយើងទាំងពីរកាន់តែយល់ចិត្ត និងចងក្រងនូវការចងចាំដ៏មានតម្លៃដែលមិនអាចបំភ្លេចបាន។",
            en: "Watching the golden sunrise illuminate Angkor Wat hand-in-hand taught us how beautiful life is when shared with your kindred soul.",
          },
          image: "https://images.unsplash.com/photo-1609137144822-4458cb5e33eb?auto=format&fit=crop&w=1000&q=80",
        },
        {
          title: {
            km: "ពាក្យសន្យានៅមាត់ទន្លេចតុមុខ",
            en: "The Sunset Proposal",
          },
          description: {
            km: "នៅក្រោមពន្លឺថ្ងៃលិចពណ៌មាសតាមបណ្តោយដងទន្លេចតុមុខ ចិន្តាបានលុតជង្គង់សុំមុន្នីរ័ត្នរៀបការ ជាមួយនឹងចម្លើយ 'យល់ព្រម' អមដោយទឹកភ្នែកនៃក្តីរំភើប។",
            en: "Under the golden sunset along the Chaktomuk riverfront, Chenda knelt down with a ring, and Monyroth said 'Yes' through tears of pure joy.",
          },
          image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1000&q=80",
        },
        {
          title: {
            km: "ការចាប់ផ្តើមនៃនិរន្តរភាព",
            en: "The Beginning of Forever",
          },
          description: {
            km: "ថ្ងៃនេះ យើងទាំងពីរសូមចាប់ដៃគ្នាសាងគ្រួសារដ៏កក់ក្តៅ និងដើរលើវិថីជីវិតជាមួយគ្នាដោយក្តីស្រឡាញ់ ភាពស្មោះត្រង់ និងការយល់ចិត្តជារៀងរហូត។",
            en: "Today, with humble and grateful hearts, we unite our souls to build a loving home and walk the journey of life as partners for eternity.",
          },
          image: "https://images.unsplash.com/photo-1519225429980-715cb0215aed?auto=format&fit=crop&w=1000&q=80",
        },
      ],
      agenda: [
        {
          time: "7:00 AM",
          title: {
            km: "ពិធីហែកូនកំលោះ និងរៀបរាប់ផ្លែឈើ (ហែជំនូន)",
            en: "Groom's Procession & Fruit Trays (Hai Neak)",
          },
        },
        {
          time: "8:30 AM",
          title: {
            km: "ពិធីពិសាកំណត់ និងសែនមេបា",
            en: "Ancestral Ceremony & Homage to Elders (Sen Me Ba)",
          },
        },
        {
          time: "9:30 AM",
          title: {
            km: "ពិធីកាត់សក់បង្កក់សិរី និងបាចផ្កាស្លា",
            en: "Hair Cutting & Cleansing Ceremony (Gaat Sahk)",
          },
        },
        {
          time: "11:00 AM",
          title: {
            km: "ពិធីសំពះផ្ទឹម និងចងដៃប្រសិទ្ធពរជ័យ",
            en: "Pairing & Thread-Tying Blessing Ceremony (Sompeas Phtem)",
          },
        },
        {
          time: "5:30 PM",
          title: {
            km: "ពិធីទទួលបដិសណ្ឋារកិច្ច និងពិសាភោជនាហារពេលល្ងាច",
            en: "Evening Reception Banquet & Dinner Celebration",
          },
        },
      ],
    },
    mediaUrls: {
      bgMusic: "https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-640.mp3",
      gallery: [
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80",
      ],
      digitalEnvelopeQr: "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=KHQR_BAKONG_MOCK_PAYMENT_SOK_CHINDA_KEO_MONYROTH",
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const batch = writeBatch(db);
  batch.set(doc(db, "invitations", invitationId), invitationData);
  batch.set(doc(db, "slugs", slug), { invitationId });

  // Sample RSVPs
  batch.set(doc(db, "rsvps", invitationId, "responses", "rsvp-001"), {
    responseId: "rsvp-001",
    guestName: "ឯកឧត្តម ជា សុខា",
    attending: true,
    message: "សូមប្រសិទ្ធពរជ័យឱ្យគូស្វាមីភរិយាថ្មី ជួបតែសុភមង្គល និងស្រឡាញ់គ្នារហូតដល់ចាស់កោងខ្នង!",
    createdAt: Date.now() - 3600000,
  });

  batch.set(doc(db, "rsvps", invitationId, "responses", "rsvp-002"), {
    responseId: "rsvp-002",
    guestName: "Mr. & Mrs. David Miller",
    attending: true,
    message: "Wishing Chenda & Monyroth a lifetime of endless love and happiness. Congratulations!",
    createdAt: Date.now() - 1800000,
  });

  await batch.commit();

  console.log("\n🎉 Seeding completed successfully!");
  console.log("------------------------------------------------------------------");
  console.log(`🔗 Public URL (Khmer):   http://localhost:3000/km/i/${slug}`);
  console.log(`🔗 Public URL (English): http://localhost:3000/en/i/${slug}`);
  console.log(`🔗 Personalized Link:    http://localhost:3000/km/i/${slug}?to=ឯកឧត្តម+ជា+សុខា`);
  console.log(`✏️ Dashboard Edit URL:   http://localhost:3000/dashboard/${invitationId}`);
  console.log("------------------------------------------------------------------\n");
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
