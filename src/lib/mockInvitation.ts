import type { Invitation, Palette, Template, RsvpResponse } from "@/types";

export const MOCK_WEDDING_INVITATION: Invitation = {
  invitationId: "mock-wedding-chenda-monyroth",
  ownerUid: "dev-user-001",
  slug: "chenda-monyroth-wedding",
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
        image:
          "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1000&q=80",
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
        image:
          "https://images.unsplash.com/photo-1609137144822-4458cb5e33eb?auto=format&fit=crop&w=1000&q=80",
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
        image:
          "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1000&q=80",
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
        image:
          "https://images.unsplash.com/photo-1519225429980-715cb0215aed?auto=format&fit=crop&w=1000&q=80",
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
    bgMusic:
      "https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-640.mp3",
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
    digitalEnvelopeQr:
      "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=KHQR_BAKONG_MOCK_PAYMENT_SOK_CHINDA_KEO_MONYROTH",
  },
  createdAt: 1726000000000,
  updatedAt: 1726000000000,
};

export const MOCK_TEMPLATE: Template = {
  templateId: "classic-khmer-gold",
  category: "wedding",
  name: "Classic Khmer Gold Wedding",
  previewImage:
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80",
  defaultColorPalette: "royal-gold",
  defaultFonts: {
    heading: "Moul",
    body: "Kantumruy Pro",
  },
};

export const MOCK_PALETTE: Palette = {
  paletteId: "royal-gold",
  name: "Royal Gold",
  primary: "#c9a24b",
  primaryLight: "#e6cd8a",
  secondary: "#7a1f2b",
  background: "#fdf8f0",
};

export const MOCK_RSVPS: RsvpResponse[] = [
  {
    responseId: "rsvp-001",
    guestName: "ឯកឧត្តម ជា សុខា",
    attending: true,
    message:
      "សូមប្រសិទ្ធពរជ័យឱ្យគូស្វាមីភរិយាថ្មី ជួបតែសុភមង្គល និងស្រឡាញ់គ្នារហូតដល់ចាស់កោងខ្នង!",
    createdAt: 1726001000000,
  },
  {
    responseId: "rsvp-002",
    guestName: "Mr. & Mrs. David Miller",
    attending: true,
    message:
      "Wishing Chenda & Monyroth a lifetime of endless love and happiness. Congratulations!",
    createdAt: 1726002000000,
  },
  {
    responseId: "rsvp-003",
    guestName: "កញ្ញា លី ណារី",
    attending: false,
    message:
      "សូមអភ័យទោសដែលមិនអាចចូលរួមបានដោយសារជាប់បេសកកម្មក្រៅប្រទេស។ សូមជូនពរឱ្យពិធីមង្គលការប្រព្រឹត្តទៅដោយរលូន និងសប្បាយរីករាយ!",
    createdAt: 1726003000000,
  },
];
