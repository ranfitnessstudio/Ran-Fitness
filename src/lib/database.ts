/* eslint-disable */
import { neon } from '@neondatabase/serverless';

// Define TS Interfaces
export interface WebsiteSettings {
  hero_title: string;
  hero_subtitle: string;
  about_text: string;
  why_choose_us: string;
  business_hours: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  google_maps_link: string;
  offer_banner_active: boolean;
  offer_banner_text: string;
  announcement_active: boolean;
  announcement_text: string;
}

export interface SocialLinks {
  instagram_url: string;
  whatsapp_number: string;
  facebook_url: string;
  youtube_url: string;
  google_maps_link: string;
}

export interface Trainer {
  id: string;
  name: string;
  designation: string;
  experience: string;
  specialization: string;
  quote: string;
  image_url: string;
  instagram_url: string;
  contact_number: string;
  badges: string[];
}

export interface Equipment {
  id: string;
  name: string;
  category: 'Strength' | 'Cardio' | 'Functional' | 'CrossFit';
  brand: string;
  description: string;
  spec_details: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  benefits: string[];
  popular_badge: boolean;
}

export interface Transformation {
  id: string;
  member_name: string;
  before_image: string;
  after_image: string;
  story: string;
  weight_lost?: string;
  muscle_gained?: string;
  description: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  goal: string;
  preferred_time: string;
  source: string;
  created_at: string;
  status: string;
  priority: 'Hot Lead 🔥' | 'Warm Lead 🟡' | 'Cold Lead ⚪';
}

export interface GymEvent {
  id: string;
  name: string;
  date: string;
  description: string;
  tag: string;
  image_url?: string;
}

export interface VirtualTour {
  id: number;
  video_url: string;
  thumbnail_url: string;
  updated_at: string;
}

export interface CareerApplication {
  id: string;
  name: string;
  phone: string;
  role: 'Trainer' | 'Receptionist' | 'Sales Executive' | 'Other';
  experience: string;
  status: 'Pending' | 'Reviewing' | 'Accepted' | 'Declined';
  created_at: string;
}

export interface AiMetric {
  id?: number;
  provider: string;
  response_time_ms: number;
  success: boolean;
  error_message?: string;
  created_at: string;
}

export interface AiProviderStatus {
  provider: string;
  healthy: boolean;
  response_time_ms: number;
  last_checked_at: string;
}

export interface Member {
  id?: number;
  member_id: string;
  name: string;
  phone: string;
  email: string;
  password_hash?: string;
  membership_type: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly';
  start_date: string;
  end_date: string;
  status: 'Active' | 'Expiring Soon' | 'Expired' | 'Suspended';
  notes?: string;
  created_at?: string;
  telegram_chat_id?: string;
}

export interface MemberProgress {
  id?: number;
  member_id: string;
  weight: number;
  body_fat: number;
  chest: number;
  waist: number;
  arms: number;
  bmi: number;
  notes?: string;
  created_at?: string;
}

export interface WorkoutDay {
  id?: number;
  day: string;
  title: string;
  description?: string;
}

export interface Announcement {
  id?: number;
  title: string;
  message: string;
  created_at?: string;
}

export interface Attendance {
  id?: number;
  member_id: string;
  check_in_time: string;
}

// ---------------------------------------------------------------------------
// INITIAL SEED DATA FOR DEMO MODE
// ---------------------------------------------------------------------------
const SEED_SETTINGS: WebsiteSettings = {
  hero_title: "BIG DREAMS NEED BIG LIFTS",
  hero_subtitle: "RAN FITNESS • HABSIGUDA",
  about_text: "RAN Fitness is Habsiguda's premier hybrid fitness training center. Blending advanced science-backed training programs with high-energy coaching, we are dedicated to helping you achieve extraordinary health transformations. Whether your goal is fat loss, muscle hypertrophy, athletic conditioning, or general mobility, our state-of-the-art facility is equipped to elevate your training standards.",
  why_choose_us: "We bring elite coaching, high-performance Aerofit equipment, comprehensive CrossFit routines, and customizable plans under one roof. Our community is built on discipline, sweat, and results.",
  business_hours: "Monday - Saturday: 5:00 AM - 10:00 PM | Sunday: Closed",
  contact_phone: "9666345644",
  contact_email: "info@ranfitness.com",
  contact_address: "Street No. 8, Habsiguda, Hyderabad, Telangana 500007",
  google_maps_link: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.2185579979313!2d78.537233!3d17.432658!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9a4055555555%3A0x8bb11bb3b680cb18!2sHabsiguda%2C%20Hyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1718380000000!5m2!1sen!2sin",
  offer_banner_active: false, // Turn off top yellow banner as requested
  offer_banner_text: "🔥 FESTIVAL PROMO: 50% OFF JOINING FEE + FREE DIET CONSULTATION THIS WEEK ONLY! 🔥",
  announcement_active: true,
  announcement_text: "📢 HOLIDAY NOTICE: Gym will operate on shortened hours (5:00 AM - 12:00 PM) on next Tuesday for the regional festival."
};

const SEED_SOCIALS: SocialLinks = {
  instagram_url: "https://www.instagram.com/ranfitnessstudio/",
  whatsapp_number: "9666345644",
  facebook_url: "https://facebook.com/ranfitness",
  youtube_url: "https://youtube.com/@ranfitness",
  google_maps_link: "https://maps.google.com/?q=Ran+Fitness+Habsiguda"
};

const SEED_TRAINERS: Trainer[] = [
  {
    id: "t1",
    name: "Vikram Ran",
    designation: "Head Strength Coach & Founder",
    experience: "10+ Years",
    specialization: "Powerlifting, Body Recomposition & Hypertrophy",
    quote: "Discipline beats motivation every single day. The work doesn't care how you feel.",
    image_url: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=600",
    instagram_url: "https://www.instagram.com/ranfitnessstudio/",
    contact_number: "9666345644",
    badges: ["Certified Trainer", "Transformation Specialist"]
  },
  {
    id: "t2",
    name: "Aisha Patel",
    designation: "CrossFit & Conditioning Specialist",
    experience: "6 Years",
    specialization: "Olympic Lifting, Gymnastics & High-Intensity Conditioning",
    quote: "Your only limit is you. Break your mental barrier, the body will follow.",
    image_url: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&q=80&w=600",
    instagram_url: "https://www.instagram.com/ranfitnessstudio/",
    contact_number: "9666345644",
    badges: ["CrossFit Coach", "Certified Trainer"]
  }
];

const SEED_EQUIPMENT: Equipment[] = [
  {
    id: "e1",
    name: "Aerofit Smith Machine",
    category: "Strength",
    brand: "Aerofit",
    description: "Commercial dual-rail guided smith system for guided squats, bench pressing, and shoulder work.",
    spec_details: "7-degree slant angle, 300kg weight capacity, linear bearings."
  },
  {
    id: "e2",
    name: "Aerofit Cable Crossover",
    category: "Strength",
    brand: "Aerofit",
    description: "Dual adjustable pulley system featuring 18 selector slots for multi-angle isolation.",
    spec_details: "95kg stack on each side, aircraft-grade steel cables, chin-up bar."
  },
  {
    id: "e3",
    name: "Aerofit Olympic Bench Press",
    category: "Strength",
    brand: "Aerofit",
    description: "Heavy-duty structural bench for flat, incline, and decline barbell pressing.",
    spec_details: "3-level spotter racks, double-stitched vinyl pads, solid steel pegs."
  },
  {
    id: "e4",
    name: "Aerofit Commercial Treadmill T9",
    category: "Cardio",
    brand: "Aerofit",
    description: "High-performance AC treadmill with dual shock absorption and multi-program virtual display.",
    spec_details: "5.0 HP AC motor, 0-18% incline, max speed 22 km/h, 160kg max weight."
  },
  {
    id: "e5",
    name: "Aerofit Professional Dumbbell Set",
    category: "Strength",
    brand: "Aerofit",
    description: "Premium rubber-coated hexagonal dumbbells ranging from 2.5kg to 40kg, complete with heavy-duty three-tier racking.",
    spec_details: "2.5kg - 40kg range, solid steel knurled handles, protective rubber casing."
  },
  {
    id: "e6",
    name: "Aerofit Olympic Barbells & Plate Set",
    category: "Strength",
    brand: "Aerofit",
    description: "Competition-grade 7ft Olympic bars, EZ curl bars, and high-density rubber bumper plates.",
    spec_details: "220cm barbell length, 50mm sleeve diameter, 450kg max load."
  },
  {
    id: "e7",
    name: "Aerofit Heavy-Duty Power Squat Rack",
    category: "Strength",
    brand: "Aerofit",
    description: "Industrial strength steel power cage equipped with safety spotter arms, J-hooks, and multi-grip pull-up bars.",
    spec_details: "3.0mm steel tubing, 18 adjustment levels, integrated plate storage."
  },
  {
    id: "e8",
    name: "Aerofit Leg Press Machine (45-degree)",
    category: "Strength",
    brand: "Aerofit",
    description: "Plate-loaded 45-degree leg press with extra-large non-slip footplate and adjustable back support.",
    spec_details: "480kg max plate load capacity, linear bearing guide rods, safety locks."
  },
  {
    id: "e9",
    name: "Aerofit Lat Pulldown & Low Row Station",
    category: "Strength",
    brand: "Aerofit",
    description: "Dual-function pulley station for vertical lat pulldowns and horizontal seated rows with pin selection.",
    spec_details: "100kg heavy selector stack, solid steel guide rods, multi-grip attachment bars."
  },
  {
    id: "e10",
    name: "Aerofit Commercial Elliptical Trainer",
    category: "Cardio",
    brand: "Aerofit",
    description: "Self-powered commercial elliptical trainer with smooth stride length and heart rate monitoring sensors.",
    spec_details: "20 resistance levels, 21-inch stride length, LED dot-matrix display console."
  },
  {
    id: "e11",
    name: "Aerofit Studio Spin Bike",
    category: "Cardio",
    brand: "Aerofit",
    description: "High-performance indoor stationary cycle featuring magnetic resistance and silent belt drive system.",
    spec_details: "22kg flywheel, micro-adjustable seat and handlebars, SPD dual pedals."
  },
  {
    id: "e12",
    name: "Aerofit Competition Kettlebell Set",
    category: "Functional",
    brand: "Aerofit",
    description: "Premium steel competition kettlebells color-coded by weight for functional dynamic movements.",
    spec_details: "8kg to 32kg range, standardized steel body, smooth unpainted handle grip."
  },
  {
    id: "e13",
    name: "Aerofit Conditioning Battle Ropes",
    category: "Functional",
    brand: "Aerofit",
    description: "Poly-dacron heavy braided battle conditioning ropes with shrink-wrapped ends for optimal grip.",
    spec_details: "50ft length, 1.5-inch diameter, 15kg total rope weight."
  },
  {
    id: "e14",
    name: "Aerofit Textured Core Slam Balls",
    category: "Functional",
    brand: "Aerofit",
    description: "No-bounce sand-filled rubber slam balls for high-velocity core conditioning and throws.",
    spec_details: "5kg, 10kg, 15kg, 20kg weight sets, textured anti-slip outer shell."
  },
  {
    id: "e15",
    name: "Aerofit 3-in-1 Wooden Plyometric Box",
    category: "Functional",
    brand: "Aerofit",
    description: "Multi-height wooden box with reinforced internal puzzle-joint structure for box jumps.",
    spec_details: "20\" x 24\" x 30\" height options, sanded safety edges, 150kg load limit."
  },
  {
    id: "e16",
    name: "Aerofit Powerlifting Resistance Bands",
    category: "Functional",
    brand: "Aerofit",
    description: "Premium layered natural latex resistance loop bands for assisted pull-ups, stretching, and lifting.",
    spec_details: "5 levels (Extra Light to Extra Heavy), 41-inch loop length."
  }
];

const SEED_PLANS: MembershipPlan[] = [
  {
    id: "p1",
    name: "Basic Strength & Cardio",
    price: 1500,
    duration: "Monthly",
    benefits: [
      "Access to Strength Training floor",
      "Full use of Cardio Equipment area",
      "Locker & Shower facilities",
      "Lounge & general Wi-Fi",
      "Operating hours flex entry"
    ],
    popular_badge: false
  },
  {
    id: "p2",
    name: "CrossFit Elite Program",
    price: 2500,
    duration: "Monthly",
    benefits: [
      "All Cardio & Strength benefits",
      "Dedicated CrossFit Training Zone",
      "Unlimited Zumba Group Sessions",
      "Weekly trainer assessment checklist",
      "1 Custom Workout template/mo"
    ],
    popular_badge: true
  },
  {
    id: "p3",
    name: "VIP Personalized Guidance",
    price: 5000,
    duration: "Monthly",
    benefits: [
      "All CrossFit Elite benefits",
      "1-on-1 Personal Trainer sessions (3x/week)",
      "Fully customized Diet & Nutrition guide",
      "Priority equipment booking access",
      "Monthly health metrics evaluation",
      "Direct WhatsApp access to Head Coach"
    ],
    popular_badge: false
  }
];

const SEED_TRANSFORMATIONS: Transformation[] = [
  {
    id: "tr1",
    member_name: "Amit Sharma",
    before_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    after_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
    story: "Amit joined RAN Fitness feeling sluggish and carrying excess weight. Through our CrossFit program and custom nutritional layout, he shaved off 27kg of fat while gaining raw lifting power.",
    weight_lost: "27 kg Lost",
    muscle_gained: "+2.5 kg Muscle",
    description: "Lost 27kg in 4 months of consistent CrossFit!"
  }
];

const SEED_LEADS: Lead[] = [
  {
    id: "l1",
    name: "Vivek",
    phone: "9876543210",
    goal: "Weight Loss",
    preferred_time: "Morning (6:00 AM - 8:00 AM)",
    source: "Website Form",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "Pending",
    priority: "Warm Lead 🟡"
  }
];

const SEED_EVENTS: GymEvent[] = [
  {
    id: "ev1",
    name: "Habsiguda CrossFit Challenge",
    date: "July 15, 2026",
    description: "Our signature fitness event! Compete in deadlifts, box jumps, and high-intensity battle rope runs. Open for all skill levels. Exciting prizes for top finishers!",
    tag: "CrossFit Competition",
    image_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600"
  }
];

const SEED_CAREERS: CareerApplication[] = [
  {
    id: "c1",
    name: "Nikhil Raj",
    phone: "9848022338",
    role: "Trainer",
    experience: "4 Years (Kettlebell certified)",
    status: "Pending",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

const SEED_WORKOUT_SCHEDULE: WorkoutDay[] = [
  { day: 'Monday', title: 'Chest + Triceps', description: 'Heavy bench press, incline dumbbells, and tricep pushdowns.' },
  { day: 'Tuesday', title: 'Back + Biceps', description: 'Deadlifts, lat pulldowns, seated rows, and barbell bicep curls.' },
  { day: 'Wednesday', title: 'Cardio + Abs', description: 'HIIT treadmill intervals, rowing machine, planks, and hanging leg raises.' },
  { day: 'Thursday', title: 'Shoulders', description: 'Overhead barbell press, lateral raises, face pulls, and shrugs.' },
  { day: 'Friday', title: 'Legs', description: 'Barbell squats, leg press, extensions, and calf raises.' },
  { day: 'Saturday', title: 'Full Body', description: 'Clean and press, kettlebell swings, pull-ups, and push-ups.' },
  { day: 'Sunday', title: 'Recovery', description: 'Light mobility work, stretching, and foam rolling.' }
];

const SEED_ANNOUNCEMENTS: Announcement[] = [
  { id: 1, title: 'Welcome to the RAN Fitness Member Portal!', message: 'Check in daily, track your body measurements progress, and view your workout routines here.', created_at: new Date().toISOString() }
];

// ---------------------------------------------------------------------------
// NEON DB CONFIG & PROXY MECHANISM
// ---------------------------------------------------------------------------
const databaseUrl = process.env.DATABASE_URL || '';
export const isNeonConfigured = !!databaseUrl;

// Lazy initialization tracker
let dbInitialized = false;

async function ensureDbInitialized() {
  if (dbInitialized || typeof window !== 'undefined' || !databaseUrl) return;

  try {
    const sql = neon(databaseUrl);

    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS website_settings (
        id INT PRIMARY KEY,
        hero_title TEXT,
        hero_subtitle TEXT,
        about_text TEXT,
        why_choose_us TEXT,
        business_hours TEXT,
        contact_phone TEXT,
        contact_email TEXT,
        contact_address TEXT,
        google_maps_link TEXT,
        offer_banner_active BOOLEAN,
        offer_banner_text TEXT,
        announcement_active BOOLEAN,
        announcement_text TEXT
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS social_links (
        id INT PRIMARY KEY,
        instagram_url TEXT,
        whatsapp_number TEXT,
        facebook_url TEXT,
        youtube_url TEXT,
        google_maps_link TEXT
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS trainers (
        id TEXT PRIMARY KEY,
        name TEXT,
        designation TEXT,
        experience TEXT,
        specialization TEXT,
        quote TEXT,
        image_url TEXT,
        instagram_url TEXT,
        contact_number TEXT,
        badges TEXT[]
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS equipment (
        id TEXT PRIMARY KEY,
        name TEXT,
        category TEXT,
        brand TEXT,
        description TEXT,
        spec_details TEXT
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS plans (
        id TEXT PRIMARY KEY,
        name TEXT,
        price NUMERIC,
        duration TEXT,
        benefits TEXT[],
        popular_badge BOOLEAN
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS transformations (
        id TEXT PRIMARY KEY,
        member_name TEXT,
        before_image TEXT,
        after_image TEXT,
        story TEXT,
        weight_lost TEXT,
        muscle_gained TEXT,
        description TEXT
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        name TEXT,
        phone TEXT,
        goal TEXT,
        preferred_time TEXT,
        source TEXT,
        created_at TIMESTAMPTZ,
        status TEXT,
        priority TEXT
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        name TEXT,
        date TEXT,
        description TEXT,
        tag TEXT,
        image_url TEXT
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS careers (
        id TEXT PRIMARY KEY,
        name TEXT,
        phone TEXT,
        role TEXT,
        experience TEXT,
        status TEXT,
        created_at TIMESTAMPTZ
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS page_visits (
        id SERIAL PRIMARY KEY,
        ip_hash TEXT,
        created_at TIMESTAMPTZ
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS ai_metrics (
        id SERIAL PRIMARY KEY,
        provider TEXT NOT NULL,
        response_time_ms INT NOT NULL,
        success BOOLEAN NOT NULL,
        error_message TEXT,
        created_at TIMESTAMPTZ NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS ai_provider_status (
        provider TEXT PRIMARY KEY,
        healthy BOOLEAN NOT NULL,
        response_time_ms INT NOT NULL,
        last_checked_at TIMESTAMPTZ NOT NULL
      )
    `;

    // Seed data if empty
    const aiStatusCount = await sql`SELECT COUNT(*)::int as count FROM ai_provider_status`;
    if (aiStatusCount[0].count === 0) {
      const now = new Date().toISOString();
      await sql`
        INSERT INTO ai_provider_status (provider, healthy, response_time_ms, last_checked_at)
        VALUES 
          ('groq', true, 0, ${now}),
          ('gemini', true, 0, ${now}),
          ('alert_state', false, 0, '1970-01-01T00:00:00.000Z')
      `;
    }

    await sql`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        member_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        email TEXT,
        password_hash TEXT,
        membership_type TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        status TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS member_progress (
        id SERIAL PRIMARY KEY,
        member_id TEXT NOT NULL,
        weight NUMERIC NOT NULL,
        body_fat NUMERIC NOT NULL,
        chest NUMERIC NOT NULL,
        waist NUMERIC NOT NULL,
        arms NUMERIC NOT NULL,
        bmi NUMERIC NOT NULL,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS workout_schedule (
        id SERIAL PRIMARY KEY,
        day TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS member_attendance (
        id SERIAL PRIMARY KEY,
        member_id TEXT NOT NULL,
        check_in_time TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS member_goals (
        id SERIAL PRIMARY KEY,
        member_id TEXT UNIQUE NOT NULL,
        goal TEXT NOT NULL,
        start_weight NUMERIC NOT NULL,
        target_weight NUMERIC NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS diet_plans (
        id SERIAL PRIMARY KEY,
        member_id TEXT UNIQUE NOT NULL,
        breakfast TEXT,
        lunch TEXT,
        dinner TEXT,
        snacks TEXT,
        supplements TEXT,
        calories_target INT DEFAULT 2000,
        protein_target INT DEFAULT 150,
        meal_schedule TEXT,
        compliance_pct INT DEFAULT 100,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS trainer_notes (
        id SERIAL PRIMARY KEY,
        member_id TEXT NOT NULL,
        note TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS progress_photos (
        id SERIAL PRIMARY KEY,
        member_id TEXT NOT NULL,
        front_photo TEXT,
        side_photo TEXT,
        back_photo TEXT,
        month_label TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS achievements (
        id SERIAL PRIMARY KEY,
        member_id TEXT NOT NULL,
        badge_name TEXT NOT NULL,
        badge_type TEXT NOT NULL,
        unlocked_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS telegram_commands_log (
        id SERIAL PRIMARY KEY,
        command TEXT NOT NULL,
        chat_id TEXT NOT NULL,
        username TEXT,
        response TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS telegram_announcements (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        sent_by_chat_id TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS member_qr_cards (
        id SERIAL PRIMARY KEY,
        member_id TEXT UNIQUE NOT NULL,
        qr_code_data TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS telegram_sessions (
        chat_id TEXT PRIMARY KEY,
        state TEXT NOT NULL,
        data TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS workout_plans (
        id SERIAL PRIMARY KEY,
        member_id TEXT UNIQUE NOT NULL,
        today_workout TEXT,
        sets_reps TEXT,
        exercises TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS body_metrics (
        id SERIAL PRIMARY KEY,
        member_id TEXT NOT NULL,
        weight NUMERIC NOT NULL,
        body_fat NUMERIC NOT NULL,
        bmi NUMERIC NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS member_ai_chats (
        id SERIAL PRIMARY KEY,
        member_id TEXT NOT NULL,
        question TEXT NOT NULL,
        provider TEXT NOT NULL,
        response_time_ms INT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT`;
    await sql`ALTER TABLE diet_plans ADD COLUMN IF NOT EXISTS calories_target INT DEFAULT 2000`;
    await sql`ALTER TABLE diet_plans ADD COLUMN IF NOT EXISTS protein_target INT DEFAULT 150`;
    await sql`ALTER TABLE diet_plans ADD COLUMN IF NOT EXISTS meal_schedule TEXT`;
    await sql`ALTER TABLE diet_plans ADD COLUMN IF NOT EXISTS compliance_pct INT DEFAULT 100`;

    await sql`
      CREATE TABLE IF NOT EXISTS virtual_tour (
        id INT PRIMARY KEY DEFAULT 1,
        video_url TEXT NOT NULL DEFAULT '',
        thumbnail_url TEXT NOT NULL DEFAULT '',
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS visitor_analytics (
        id SERIAL PRIMARY KEY,
        visitor_id TEXT NOT NULL,
        page TEXT NOT NULL,
        session_id TEXT NOT NULL,
        visited_at TIMESTAMPTZ DEFAULT NOW(),
        user_agent TEXT NOT NULL,
        book_trial_clicks INT DEFAULT 0,
        virtual_tour_opens INT DEFAULT 0,
        trainer_card_clicks INT DEFAULT 0,
        equipment_views INT DEFAULT 0
      )
    `;

    await sql`
      ALTER TABLE visitor_analytics ADD COLUMN IF NOT EXISTS book_trial_clicks INT DEFAULT 0;
      ALTER TABLE visitor_analytics ADD COLUMN IF NOT EXISTS virtual_tour_opens INT DEFAULT 0;
      ALTER TABLE visitor_analytics ADD COLUMN IF NOT EXISTS trainer_card_clicks INT DEFAULT 0;
      ALTER TABLE visitor_analytics ADD COLUMN IF NOT EXISTS equipment_views INT DEFAULT 0;
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS admin_credentials (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    const adminCount = await sql`SELECT COUNT(*)::int as count FROM admin_credentials`;
    if (adminCount[0].count === 0) {
      const bcrypt = require('bcryptjs');
      const hash = bcrypt.hashSync('RanFitness2026!', 10);
      await sql`INSERT INTO admin_credentials (username, password_hash) VALUES ('admin', ${hash})`;
    }

    // Seed virtual_tour if empty
    const vtCount = await sql`SELECT COUNT(*)::int as count FROM virtual_tour`;
    if (vtCount[0].count === 0) {
      await sql`INSERT INTO virtual_tour (id, video_url, thumbnail_url) VALUES (1, '', '')`;
    }

    // Seed workout schedule if empty
    const scheduleCount = await sql`SELECT COUNT(*)::int as count FROM workout_schedule`;
    if (scheduleCount[0].count === 0) {
      await sql`
        INSERT INTO workout_schedule (day, title, description)
        VALUES 
          ('Monday', 'Chest + Triceps', 'Heavy bench press, incline dumbbells, and tricep pushdowns.'),
          ('Tuesday', 'Back + Biceps', 'Deadlifts, lat pulldowns, seated rows, and barbell bicep curls.'),
          ('Wednesday', 'Cardio + Abs', 'HIIT treadmill intervals, rowing machine, planks, and hanging leg raises.'),
          ('Thursday', 'Shoulders', 'Overhead barbell press, lateral raises, face pulls, and shrugs.'),
          ('Friday', 'Legs', 'Barbell squats, leg press, extensions, and calf raises.'),
          ('Saturday', 'Full Body', 'Clean and press, kettlebell swings, pull-ups, and push-ups.'),
          ('Sunday', 'Recovery', 'Light mobility work, stretching, and foam rolling.')
      `;
    }

    // Seed announcements if empty
    const announcementsCount = await sql`SELECT COUNT(*)::int as count FROM announcements`;
    if (announcementsCount[0].count === 0) {
      await sql`
        INSERT INTO announcements (title, message, created_at)
        VALUES ('Welcome to the RAN Fitness Member Portal!', 'Check in daily, track your body measurements progress, and view your workout routines here.', NOW())
      `;
    }

    // Seed data if empty
    const settingsCount = await sql`SELECT COUNT(*)::int as count FROM website_settings`;
    if (settingsCount[0].count === 0) {
      await sql`
        INSERT INTO website_settings (
          id, hero_title, hero_subtitle, about_text, why_choose_us, business_hours,
          contact_phone, contact_email, contact_address, google_maps_link,
          offer_banner_active, offer_banner_text, announcement_active, announcement_text
        ) VALUES (
          1, ${SEED_SETTINGS.hero_title}, ${SEED_SETTINGS.hero_subtitle}, ${SEED_SETTINGS.about_text},
          ${SEED_SETTINGS.why_choose_us}, ${SEED_SETTINGS.business_hours}, ${SEED_SETTINGS.contact_phone},
          ${SEED_SETTINGS.contact_email}, ${SEED_SETTINGS.contact_address}, ${SEED_SETTINGS.google_maps_link},
          ${SEED_SETTINGS.offer_banner_active}, ${SEED_SETTINGS.offer_banner_text}, ${SEED_SETTINGS.announcement_active},
          ${SEED_SETTINGS.announcement_text}
        )
      `;
    }

    const socialsCount = await sql`SELECT COUNT(*)::int as count FROM social_links`;
    if (socialsCount[0].count === 0) {
      await sql`
        INSERT INTO social_links (
          id, instagram_url, whatsapp_number, facebook_url, youtube_url, google_maps_link
        ) VALUES (
          1, ${SEED_SOCIALS.instagram_url}, ${SEED_SOCIALS.whatsapp_number},
          ${SEED_SOCIALS.facebook_url}, ${SEED_SOCIALS.youtube_url}, ${SEED_SOCIALS.google_maps_link}
        )
      `;
    }

    const trainersCount = await sql`SELECT COUNT(*)::int as count FROM trainers`;
    if (trainersCount[0].count === 0) {
      for (const t of SEED_TRAINERS) {
        await sql`
          INSERT INTO trainers (id, name, designation, experience, specialization, quote, image_url, instagram_url, contact_number, badges)
          VALUES (${t.id}, ${t.name}, ${t.designation}, ${t.experience}, ${t.specialization}, ${t.quote}, ${t.image_url}, ${t.instagram_url}, ${t.contact_number}, ${t.badges})
        `;
      }
    }

    const equipCount = await sql`SELECT COUNT(*)::int as count FROM equipment`;
    if (equipCount[0].count === 0) {
      for (const e of SEED_EQUIPMENT) {
        await sql`
          INSERT INTO equipment (id, name, category, brand, description, spec_details)
          VALUES (${e.id}, ${e.name}, ${e.category}, ${e.brand}, ${e.description}, ${e.spec_details})
        `;
      }
    }

    const plansCount = await sql`SELECT COUNT(*)::int as count FROM plans`;
    if (plansCount[0].count === 0) {
      for (const p of SEED_PLANS) {
        await sql`
          INSERT INTO plans (id, name, price, duration, benefits, popular_badge)
          VALUES (${p.id}, ${p.name}, ${p.price}, ${p.duration}, ${p.benefits}, ${p.popular_badge})
        `;
      }
    }

    const transCount = await sql`SELECT COUNT(*)::int as count FROM transformations`;
    if (transCount[0].count === 0) {
      for (const tr of SEED_TRANSFORMATIONS) {
        await sql`
          INSERT INTO transformations (id, member_name, before_image, after_image, story, weight_lost, muscle_gained, description)
          VALUES (${tr.id}, ${tr.member_name}, ${tr.before_image}, ${tr.after_image}, ${tr.story}, ${tr.weight_lost}, ${tr.muscle_gained}, ${tr.description})
        `;
      }
    }

    const leadsCount = await sql`SELECT COUNT(*)::int as count FROM leads`;
    if (leadsCount[0].count === 0) {
      for (const l of SEED_LEADS) {
        await sql`
          INSERT INTO leads (id, name, phone, goal, preferred_time, source, created_at, status, priority)
          VALUES (${l.id}, ${l.name}, ${l.phone}, ${l.goal}, ${l.preferred_time}, ${l.source}, ${l.created_at}, ${l.status}, ${l.priority})
        `;
      }
    }

    const eventsCount = await sql`SELECT COUNT(*)::int as count FROM events`;
    if (eventsCount[0].count === 0) {
      for (const ev of SEED_EVENTS) {
        await sql`
          INSERT INTO events (id, name, date, description, tag, image_url)
          VALUES (${ev.id}, ${ev.name}, ${ev.date}, ${ev.description}, ${ev.tag}, ${ev.image_url})
        `;
      }
    }

    const careersCount = await sql`SELECT COUNT(*)::int as count FROM careers`;
    if (careersCount[0].count === 0) {
      for (const c of SEED_CAREERS) {
        await sql`
          INSERT INTO careers (id, name, phone, role, experience, status, created_at)
          VALUES (${c.id}, ${c.name}, ${c.phone}, ${c.role}, ${c.experience}, ${c.status}, ${c.created_at})
        `;
      }
    }

    dbInitialized = true;
    console.log("Neon DB Schema successfully bootstrapped!");
  } catch (err) {
    console.error("Neon DB Bootstrap Error:", err);
  }
}

// Client browser proxy helper to keep secrets on server
async function clientProxy<T>(action: string, args: unknown[] = []): Promise<T | null> {
  try {
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, args })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data.result as T;
    }
  } catch (e) {
    console.warn(`Client DB proxy failed for ${action}:`, e);
  }
  return null;
}

// Helper to get local storage safe data
const getLocal = <T>(key: string, seed: T): T => {
  if (typeof window === 'undefined') return seed;
  const item = localStorage.getItem(`ran_fitness_${key}`);
  if (!item) {
    localStorage.setItem(`ran_fitness_${key}`, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(item);
  } catch {
    return seed;
  }
};

const setLocal = <T>(key: string, data: T): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`ran_fitness_${key}`, JSON.stringify(data));
  }
};

function notifyTelegramNewMember(name: string, phone: string, memberId: string, plan: string, expiry: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return;

  const istExpiry = new Date(expiry).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const text = `🎉 NEW MEMBER REGISTERED\nName: ${name}\nPhone: ${phone}\nMember ID: ${memberId}\nPlan: ${plan}\nExpiry: ${istExpiry}`;

  fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  }).catch(err => console.error('Telegram new member notification failed:', err));
}

function notifyTelegramMemberUpdate(name: string, plan: string, status: string, expiry: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return;

  const istExpiry = new Date(expiry).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const text = `👤 MEMBER UPDATE\n\nName:\n${name}\n\nPlan:\n${plan}\n\nStatus:\n${status}\n\nExpiry:\n${istExpiry}`;

  fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  }).catch(err => console.error('Telegram member update notification failed:', err));
}

// ---------------------------------------------------------------------------
// DATA API INTERFACE
// ---------------------------------------------------------------------------
export const db = {
  // --- SETTINGS ---
  async getSettings(): Promise<WebsiteSettings> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<WebsiteSettings>('getSettings');
      if (res !== null) return res;
      return getLocal('settings', SEED_SETTINGS);
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`SELECT * FROM website_settings LIMIT 1`;
      if (rows.length > 0) return rows[0] as unknown as WebsiteSettings;
    }
    return SEED_SETTINGS;
  },

  async updateSettings(settings: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<WebsiteSettings>('updateSettings', [settings]);
      if (res !== null) return res;
      const current = getLocal('settings', SEED_SETTINGS);
      const updated = { ...current, ...settings };
      setLocal('settings', updated);
      return updated;
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      await sql`
        UPDATE website_settings SET
          hero_title = COALESCE(${settings.hero_title}, hero_title),
          hero_subtitle = COALESCE(${settings.hero_subtitle}, hero_subtitle),
          about_text = COALESCE(${settings.about_text}, about_text),
          why_choose_us = COALESCE(${settings.why_choose_us}, why_choose_us),
          business_hours = COALESCE(${settings.business_hours}, business_hours),
          contact_phone = COALESCE(${settings.contact_phone}, contact_phone),
          contact_email = COALESCE(${settings.contact_email}, contact_email),
          contact_address = COALESCE(${settings.contact_address}, contact_address),
          google_maps_link = COALESCE(${settings.google_maps_link}, google_maps_link),
          offer_banner_active = COALESCE(${settings.offer_banner_active}, offer_banner_active),
          offer_banner_text = COALESCE(${settings.offer_banner_text}, offer_banner_text),
          announcement_active = COALESCE(${settings.announcement_active}, announcement_active),
          announcement_text = COALESCE(${settings.announcement_text}, announcement_text)
        WHERE id = 1
      `;
      const rows = await sql`SELECT * FROM website_settings LIMIT 1`;
      return rows[0] as unknown as WebsiteSettings;
    }

    const current = getLocal('settings', SEED_SETTINGS);
    const updated = { ...current, ...settings };
    setLocal('settings', updated);
    return updated;
  },

  // --- SOCIAL LINKS ---
  async getSocialLinks(): Promise<SocialLinks> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<SocialLinks>('getSocialLinks');
      if (res !== null) return res;
      return getLocal('socials', SEED_SOCIALS);
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`SELECT * FROM social_links LIMIT 1`;
      if (rows.length > 0) return rows[0] as unknown as SocialLinks;
    }
    return SEED_SOCIALS;
  },

  async updateSocialLinks(socials: Partial<SocialLinks>): Promise<SocialLinks> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<SocialLinks>('updateSocialLinks', [socials]);
      if (res !== null) return res;
      const current = getLocal('socials', SEED_SOCIALS);
      const updated = { ...current, ...socials };
      setLocal('socials', updated);
      return updated;
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      await sql`
        UPDATE social_links SET
          instagram_url = COALESCE(${socials.instagram_url}, instagram_url),
          whatsapp_number = COALESCE(${socials.whatsapp_number}, whatsapp_number),
          facebook_url = COALESCE(${socials.facebook_url}, facebook_url),
          youtube_url = COALESCE(${socials.youtube_url}, youtube_url),
          google_maps_link = COALESCE(${socials.google_maps_link}, google_maps_link)
        WHERE id = 1
      `;
      const rows = await sql`SELECT * FROM social_links LIMIT 1`;
      return rows[0] as unknown as SocialLinks;
    }

    const current = getLocal('socials', SEED_SOCIALS);
    const updated = { ...current, ...socials };
    setLocal('socials', updated);
    return updated;
  },

  // --- TRAINERS ---
  async getTrainers(): Promise<Trainer[]> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<Trainer[]>('getTrainers');
      if (res !== null) return res;
      return getLocal('trainers', SEED_TRAINERS);
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`SELECT * FROM trainers ORDER BY name`;
      return rows as unknown as Trainer[];
    }
    return getLocal('trainers', SEED_TRAINERS);
  },

  async saveTrainer(trainer: Omit<Trainer, 'id'> & { id?: string }): Promise<Trainer> {
    const id = trainer.id || `t_${Date.now()}`;
    const newTrainer: Trainer = { ...trainer, id, badges: trainer.badges || [] } as Trainer;

    if (typeof window !== 'undefined') {
      const res = await clientProxy<Trainer>('saveTrainer', [trainer]);
      if (res !== null) return res;
      const current = getLocal('trainers', SEED_TRAINERS);
      const index = current.findIndex(t => t.id === id);
      if (index > -1) current[index] = newTrainer;
      else current.push(newTrainer);
      setLocal('trainers', current);
      return newTrainer;
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      await sql`
        INSERT INTO trainers (id, name, designation, experience, specialization, quote, image_url, instagram_url, contact_number, badges)
        VALUES (${id}, ${newTrainer.name}, ${newTrainer.designation}, ${newTrainer.experience}, ${newTrainer.specialization}, ${newTrainer.quote}, ${newTrainer.image_url}, ${newTrainer.instagram_url}, ${newTrainer.contact_number}, ${newTrainer.badges})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          designation = EXCLUDED.designation,
          experience = EXCLUDED.experience,
          specialization = EXCLUDED.specialization,
          quote = EXCLUDED.quote,
          image_url = EXCLUDED.image_url,
          instagram_url = EXCLUDED.instagram_url,
          contact_number = EXCLUDED.contact_number,
          badges = EXCLUDED.badges
      `;
      return newTrainer;
    }

    const current = getLocal('trainers', SEED_TRAINERS);
    const index = current.findIndex(t => t.id === id);
    if (index > -1) {
      current[index] = newTrainer;
    } else {
      current.push(newTrainer);
    }
    setLocal('trainers', current);
    return newTrainer;
  },

  async deleteTrainer(id: string): Promise<boolean> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<boolean>('deleteTrainer', [id]);
      if (res !== null) return res;
      const current = getLocal('trainers', SEED_TRAINERS);
      const filtered = current.filter(t => t.id !== id);
      setLocal('trainers', filtered);
      return true;
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      await sql`DELETE FROM trainers WHERE id = ${id}`;
      return true;
    }

    const current = getLocal('trainers', SEED_TRAINERS);
    const filtered = current.filter(t => t.id !== id);
    setLocal('trainers', filtered);
    return true;
  },

  // --- EQUIPMENT ---
  async getEquipment(): Promise<Equipment[]> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<Equipment[]>('getEquipment');
      if (res !== null) return res;
      return getLocal('equipment_v3', SEED_EQUIPMENT);
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`SELECT * FROM equipment ORDER BY name`;
      return rows as unknown as Equipment[];
    }
    return getLocal('equipment_v3', SEED_EQUIPMENT);
  },

  async saveEquipment(equip: Omit<Equipment, 'id'> & { id?: string }): Promise<Equipment> {
    const id = equip.id || `e_${Date.now()}`;
    const newEquip = { ...equip, id } as Equipment;

    if (typeof window !== 'undefined') {
      const res = await clientProxy<Equipment>('saveEquipment', [equip]);
      if (res !== null) return res;
      const current = getLocal('equipment_v3', SEED_EQUIPMENT);
      const index = current.findIndex(e => e.id === id);
      if (index > -1) current[index] = newEquip;
      else current.push(newEquip);
      setLocal('equipment_v3', current);
      return newEquip;
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      await sql`
        INSERT INTO equipment (id, name, category, brand, description, spec_details)
        VALUES (${id}, ${newEquip.name}, ${newEquip.category}, ${newEquip.brand}, ${newEquip.description}, ${newEquip.spec_details})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          brand = EXCLUDED.brand,
          description = EXCLUDED.description,
          spec_details = EXCLUDED.spec_details
      `;
      return newEquip;
    }

    const current = getLocal('equipment_v3', SEED_EQUIPMENT);
    const index = current.findIndex(e => e.id === id);
    if (index > -1) {
      current[index] = newEquip;
    } else {
      current.push(newEquip);
    }
    setLocal('equipment_v3', current);
    return newEquip;
  },

  async deleteEquipment(id: string): Promise<boolean> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<boolean>('deleteEquipment', [id]);
      if (res !== null) return res;
      const current = getLocal('equipment_v3', SEED_EQUIPMENT);
      const filtered = current.filter(e => e.id !== id);
      setLocal('equipment_v3', filtered);
      return true;
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      await sql`DELETE FROM equipment WHERE id = ${id}`;
      return true;
    }

    const current = getLocal('equipment_v3', SEED_EQUIPMENT);
    const filtered = current.filter(e => e.id !== id);
    setLocal('equipment_v3', filtered);
    return true;
  },

  // --- PLANS ---
  async getPlans(): Promise<MembershipPlan[]> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<MembershipPlan[]>('getPlans');
      if (res !== null) return res;
      return getLocal('plans', SEED_PLANS);
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`SELECT * FROM plans ORDER BY price`;
      return rows as unknown as MembershipPlan[];
    }
    return getLocal('plans', SEED_PLANS);
  },

  async savePlan(plan: Omit<MembershipPlan, 'id'> & { id?: string }): Promise<MembershipPlan> {
    const id = plan.id || `p_${Date.now()}`;
    const newPlan = { ...plan, id } as MembershipPlan;

    if (typeof window !== 'undefined') {
      const res = await clientProxy<MembershipPlan>('savePlan', [plan]);
      if (res !== null) return res;
      const current = getLocal('plans', SEED_PLANS);
      const index = current.findIndex(p => p.id === id);
      if (index > -1) current[index] = newPlan;
      else current.push(newPlan);
      setLocal('plans', current);
      return newPlan;
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      await sql`
        INSERT INTO plans (id, name, price, duration, benefits, popular_badge)
        VALUES (${id}, ${newPlan.name}, ${newPlan.price}, ${newPlan.duration}, ${newPlan.benefits}, ${newPlan.popular_badge})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          duration = EXCLUDED.duration,
          benefits = EXCLUDED.benefits,
          popular_badge = EXCLUDED.popular_badge
      `;
      return newPlan;
    }

    const current = getLocal('plans', SEED_PLANS);
    const index = current.findIndex(p => p.id === id);
    if (index > -1) {
      current[index] = newPlan;
    } else {
      current.push(newPlan);
    }
    setLocal('plans', current);
    return newPlan;
  },

  async deletePlan(id: string): Promise<boolean> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<boolean>('deletePlan', [id]);
      if (res !== null) return res;
      const current = getLocal('plans', SEED_PLANS);
      const filtered = current.filter(p => p.id !== id);
      setLocal('plans', filtered);
      return true;
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      await sql`DELETE FROM plans WHERE id = ${id}`;
      return true;
    }

    const current = getLocal('plans', SEED_PLANS);
    const filtered = current.filter(p => p.id !== id);
    setLocal('plans', filtered);
    return true;
  },

  // --- TRANSFORMATIONS ---
  async getTransformations(): Promise<Transformation[]> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<Transformation[]>('getTransformations');
      if (res !== null) return res;
      return getLocal('transformations', SEED_TRANSFORMATIONS);
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`SELECT * FROM transformations`;
      return rows as unknown as Transformation[];
    }
    return getLocal('transformations', SEED_TRANSFORMATIONS);
  },

  async saveTransformation(trans: Omit<Transformation, 'id'> & { id?: string }): Promise<Transformation> {
    const id = trans.id || `tr_${Date.now()}`;
    const newTrans = { ...trans, id } as Transformation;

    if (typeof window !== 'undefined') {
      const res = await clientProxy<Transformation>('saveTransformation', [trans]);
      if (res !== null) return res;
      const current = getLocal('transformations', SEED_TRANSFORMATIONS);
      const index = current.findIndex(t => t.id === id);
      if (index > -1) current[index] = newTrans;
      else current.push(newTrans);
      setLocal('transformations', current);
      return newTrans;
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      await sql`
        INSERT INTO transformations (id, member_name, before_image, after_image, story, weight_lost, muscle_gained, description)
        VALUES (${id}, ${newTrans.member_name}, ${newTrans.before_image}, ${newTrans.after_image}, ${newTrans.story}, ${newTrans.weight_lost}, ${newTrans.muscle_gained}, ${newTrans.description})
        ON CONFLICT (id) DO UPDATE SET
          member_name = EXCLUDED.member_name,
          before_image = EXCLUDED.before_image,
          after_image = EXCLUDED.after_image,
          story = EXCLUDED.story,
          weight_lost = EXCLUDED.weight_lost,
          muscle_gained = EXCLUDED.muscle_gained,
          description = EXCLUDED.description
      `;
      return newTrans;
    }

    const current = getLocal('transformations', SEED_TRANSFORMATIONS);
    const index = current.findIndex(t => t.id === id);
    if (index > -1) {
      current[index] = newTrans;
    } else {
      current.push(newTrans);
    }
    setLocal('transformations', current);
    return newTrans;
  },

  async deleteTransformation(id: string): Promise<boolean> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<boolean>('deleteTransformation', [id]);
      if (res !== null) return res;
      const current = getLocal('transformations', SEED_TRANSFORMATIONS);
      const filtered = current.filter(t => t.id !== id);
      setLocal('transformations', filtered);
      return true;
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      await sql`DELETE FROM transformations WHERE id = ${id}`;
      return true;
    }

    const current = getLocal('transformations', SEED_TRANSFORMATIONS);
    const filtered = current.filter(t => t.id !== id);
    setLocal('transformations', filtered);
    return true;
  },

  // --- LEADS ---
  async getLeads(): Promise<Lead[]> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<Lead[]>('getLeads');
      if (res !== null) return res;
      return getLocal('leads', SEED_LEADS);
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`SELECT * FROM leads ORDER BY created_at DESC`;
      return rows as unknown as Lead[];
    }
    return getLocal('leads', SEED_LEADS);
  },

  async saveLead(lead: Omit<Lead, 'id' | 'created_at' | 'status' | 'priority'> & { id?: string; created_at?: string; status?: string; priority?: string }): Promise<Lead> {
    const id = lead.id || `lead_${Date.now()}`;
    const created_at = lead.created_at || new Date().toISOString();
    const status = lead.status || 'Pending';

    let priority: 'Hot Lead 🔥' | 'Warm Lead 🟡' | 'Cold Lead ⚪' = 'Warm Lead 🟡';
    if (lead.source === 'AI Coach Recommendation' || lead.source.includes('Plan:')) {
      priority = 'Hot Lead 🔥';
    } else if (lead.source.includes('Career') || lead.source.includes('Emergency')) {
      priority = 'Cold Lead ⚪';
    }

    const newLead: Lead = { ...lead, id, created_at, status, priority } as Lead;

    if (typeof window !== 'undefined') {
      const res = await clientProxy<Lead>('saveLead', [lead]);
      if (res !== null) return res;
      const current = getLocal('leads', SEED_LEADS);
      current.unshift(newLead);
      setLocal('leads', current);
      return newLead;
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      await sql`
        INSERT INTO leads (id, name, phone, goal, preferred_time, source, created_at, status, priority)
        VALUES (${id}, ${newLead.name}, ${newLead.phone}, ${newLead.goal}, ${newLead.preferred_time}, ${newLead.source}, ${newLead.created_at}, ${newLead.status}, ${newLead.priority})
      `;
      return newLead;
    }

    const current = getLocal('leads', SEED_LEADS);
    current.unshift(newLead);
    setLocal('leads', current);
    return newLead;
  },

  async updateLeadStatus(id: string, status: string): Promise<boolean> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<boolean>('updateLeadStatus', [id, status]);
      if (res !== null) return res;
      const current = getLocal('leads', SEED_LEADS);
      const index = current.findIndex(l => l.id === id);
      if (index > -1) {
        current[index].status = status;
        setLocal('leads', current);
      }
      return true;
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      await sql`UPDATE leads SET status = ${status} WHERE id = ${id}`;
      return true;
    }

    const current = getLocal('leads', SEED_LEADS);
    const index = current.findIndex(l => l.id === id);
    if (index > -1) {
      current[index].status = status;
      setLocal('leads', current);
    }
    return true;
  },

  async deleteLead(id: string): Promise<boolean> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<boolean>('deleteLead', [id]);
      if (res !== null) return res;
      const current = getLocal('leads', SEED_LEADS);
      const filtered = current.filter(l => l.id !== id);
      setLocal('leads', filtered);
      return true;
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      await sql`DELETE FROM leads WHERE id = ${id}`;
      return true;
    }

    const current = getLocal('leads', SEED_LEADS);
    const filtered = current.filter(l => l.id !== id);
    setLocal('leads', filtered);
    return true;
  },

  // --- EVENTS ---
  async getEvents(): Promise<GymEvent[]> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<GymEvent[]>('getEvents');
      if (res !== null) return res;
      return getLocal('events', SEED_EVENTS);
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`SELECT * FROM events ORDER BY date`;
      return rows as unknown as GymEvent[];
    }
    return getLocal('events', SEED_EVENTS);
  },

  async saveEvent(event: Omit<GymEvent, 'id'> & { id?: string }): Promise<GymEvent> {
    const id = event.id || `ev_${Date.now()}`;
    const newEvent = { ...event, id } as GymEvent;

    if (typeof window !== 'undefined') {
      const res = await clientProxy<GymEvent>('saveEvent', [event]);
      if (res !== null) return res;
      const current = getLocal('events', SEED_EVENTS);
      const index = current.findIndex(e => e.id === id);
      if (index > -1) current[index] = newEvent;
      else current.push(newEvent);
      setLocal('events', current);
      return newEvent;
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      await sql`
        INSERT INTO events (id, name, date, description, tag, image_url)
        VALUES (${id}, ${newEvent.name}, ${newEvent.date}, ${newEvent.description}, ${newEvent.tag}, ${newEvent.image_url})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          date = EXCLUDED.date,
          description = EXCLUDED.description,
          tag = EXCLUDED.tag,
          image_url = EXCLUDED.image_url
      `;
      return newEvent;
    }

    const current = getLocal('events', SEED_EVENTS);
    const index = current.findIndex(e => e.id === id);
    if (index > -1) {
      current[index] = newEvent;
    } else {
      current.push(newEvent);
    }
    setLocal('events', current);
    return newEvent;
  },

  async deleteEvent(id: string): Promise<boolean> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<boolean>('deleteEvent', [id]);
      if (res !== null) return res;
      const current = getLocal('events', SEED_EVENTS);
      const filtered = current.filter(e => e.id !== id);
      setLocal('events', filtered);
      return true;
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      await sql`DELETE FROM events WHERE id = ${id}`;
      return true;
    }

    const current = getLocal('events', SEED_EVENTS);
    const filtered = current.filter(e => e.id !== id);
    setLocal('events', filtered);
    return true;
  },

  // --- CAREER APPLICATIONS ---
  async getCareers(): Promise<CareerApplication[]> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<CareerApplication[]>('getCareers');
      if (res !== null) return res;
      return getLocal('careers', SEED_CAREERS);
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`SELECT * FROM careers ORDER BY created_at DESC`;
      return rows as unknown as CareerApplication[];
    }
    return getLocal('careers', SEED_CAREERS);
  },

  async saveCareer(app: Omit<CareerApplication, 'id' | 'created_at' | 'status'> & { id?: string; created_at?: string; status?: string }): Promise<CareerApplication> {
    const id = app.id || `c_${Date.now()}`;
    const created_at = app.created_at || new Date().toISOString();
    const status = app.status || 'Pending';
    const newApp: CareerApplication = { ...app, id, created_at, status } as CareerApplication;

    if (typeof window !== 'undefined') {
      const res = await clientProxy<CareerApplication>('saveCareer', [app]);
      if (res !== null) return res;
      const current = getLocal('careers', SEED_CAREERS);
      current.unshift(newApp);
      setLocal('careers', current);
      return newApp;
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      await sql`
        INSERT INTO careers (id, name, phone, role, experience, status, created_at)
        VALUES (${id}, ${newApp.name}, ${newApp.phone}, ${newApp.role}, ${newApp.experience}, ${newApp.status}, ${newApp.created_at})
      `;
      return newApp;
    }

    const current = getLocal('careers', SEED_CAREERS);
    current.unshift(newApp);
    setLocal('careers', current);
    return newApp;
  },

  async deleteCareer(id: string): Promise<boolean> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<boolean>('deleteCareer', [id]);
      if (res !== null) return res;
      const current = getLocal('careers', SEED_CAREERS);
      const filtered = current.filter(c => c.id !== id);
      setLocal('careers', filtered);
      return true;
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      await sql`DELETE FROM careers WHERE id = ${id}`;
      return true;
    }

    const current = getLocal('careers', SEED_CAREERS);
    const filtered = current.filter(c => c.id !== id);
    setLocal('careers', filtered);
    return true;
  },

  // --- VISITS / ANALYTICS ---
  async logVisit(): Promise<number> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<number>('logVisit');
      if (res !== null) return res;
      const current = getLocal('visits', 128);
      const updated = current + 1;
      setLocal('visits', updated);
      return updated;
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      try {
        const sql = neon(databaseUrl);
        await sql`INSERT INTO page_visits (ip_hash, created_at) VALUES ('anonymous', ${new Date().toISOString()})`;
        const rows = await sql`SELECT COUNT(*)::int as count FROM page_visits`;
        return rows[0].count;
      } catch (err) {
        console.warn('Neon visit log failed:', err);
      }
    }
    const current = getLocal('visits', 128);
    const updated = current + 1;
    setLocal('visits', updated);
    return updated;
  },

  async getVisitsCount(): Promise<number> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<number>('getVisitsCount');
      if (res !== null) return res;
      return getLocal('visits', 128);
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      try {
        const sql = neon(databaseUrl);
        const rows = await sql`SELECT COUNT(*)::int as count FROM page_visits`;
        return rows[0].count;
      } catch (err) {
        console.warn('Neon getVisitsCount failed:', err);
      }
    }
    return getLocal('visits', 128);
  },

  // --- AI INFRASTRUCTURE HARDENING METRICS & STATUS ---
  async saveAiMetric(metric: Omit<AiMetric, 'id' | 'created_at'>): Promise<AiMetric> {
    const newMetric: AiMetric = {
      ...metric,
      created_at: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      const res = await clientProxy<AiMetric>('saveAiMetric', [metric]);
      if (res !== null) return res;
      const current = getLocal<AiMetric[]>('ai_metrics', []);
      const updated = [newMetric, ...current].slice(0, 1000);
      setLocal('ai_metrics', updated);
      return newMetric;
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`
        INSERT INTO ai_metrics (provider, response_time_ms, success, error_message, created_at)
        VALUES (${metric.provider}, ${metric.response_time_ms}, ${metric.success}, ${metric.error_message || null}, ${newMetric.created_at})
        RETURNING *
      `;
      console.log('[AI METRIC SAVED]');
      return rows[0] as unknown as AiMetric;
    }

    const current = getLocal<AiMetric[]>('ai_metrics', []);
    const updated = [newMetric, ...current].slice(0, 1000);
    setLocal('ai_metrics', updated);
    console.log('[AI METRIC SAVED]');
    return newMetric;
  },

  async getAiMetrics(limit = 100): Promise<AiMetric[]> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<AiMetric[]>('getAiMetrics', [limit]);
      if (res !== null) return res;
      return getLocal<AiMetric[]>('ai_metrics', []).slice(0, limit);
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`
        SELECT * FROM ai_metrics 
        ORDER BY created_at DESC 
        LIMIT ${limit}
      `;
      return rows as unknown as AiMetric[];
    }

    return getLocal<AiMetric[]>('ai_metrics', []).slice(0, limit);
  },

  async getAiMetricsLast24Hours(): Promise<AiMetric[]> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<AiMetric[]>('getAiMetricsLast24Hours');
      if (res !== null) return res;
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
      return getLocal<AiMetric[]>('ai_metrics', []).filter(m => new Date(m.created_at).getTime() >= dayAgo);
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const rows = await sql`
        SELECT * FROM ai_metrics 
        WHERE created_at >= ${dayAgo}
        ORDER BY created_at DESC
      `;
      return rows as unknown as AiMetric[];
    }

    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return getLocal<AiMetric[]>('ai_metrics', []).filter(m => new Date(m.created_at).getTime() >= dayAgo);
  },

  async getAiProviderStatus(): Promise<AiProviderStatus[]> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<AiProviderStatus[]>('getAiProviderStatus');
      if (res !== null) return res;
      const now = new Date().toISOString();
      return getLocal<AiProviderStatus[]>('ai_provider_status', [
        { provider: 'groq', healthy: true, response_time_ms: 0, last_checked_at: now },
        { provider: 'gemini', healthy: true, response_time_ms: 0, last_checked_at: now },
        { provider: 'alert_state', healthy: false, response_time_ms: 0, last_checked_at: '1970-01-01T00:00:00.000Z' }
      ]);
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`SELECT * FROM ai_provider_status`;
      return rows as unknown as AiProviderStatus[];
    }

    const now = new Date().toISOString();
    return getLocal<AiProviderStatus[]>('ai_provider_status', [
      { provider: 'groq', healthy: true, response_time_ms: 0, last_checked_at: now },
      { provider: 'gemini', healthy: true, response_time_ms: 0, last_checked_at: now },
      { provider: 'alert_state', healthy: false, response_time_ms: 0, last_checked_at: '1970-01-01T00:00:00.000Z' }
    ]);
  },

  async updateAiProviderStatus(provider: string, healthy: boolean, responseTimeMs: number): Promise<void> {
    const lastChecked = new Date().toISOString();

    if (typeof window !== 'undefined') {
      await clientProxy<void>('updateAiProviderStatus', [provider, healthy, responseTimeMs]);
      return;
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      await sql`
        INSERT INTO ai_provider_status (provider, healthy, response_time_ms, last_checked_at)
        VALUES (${provider}, ${healthy}, ${responseTimeMs}, ${lastChecked})
        ON CONFLICT (provider) DO UPDATE SET
          healthy = EXCLUDED.healthy,
          response_time_ms = EXCLUDED.response_time_ms,
          last_checked_at = EXCLUDED.last_checked_at
      `;
      return;
    }

    const now = new Date().toISOString();
    const current = getLocal<AiProviderStatus[]>('ai_provider_status', [
      { provider: 'groq', healthy: true, response_time_ms: 0, last_checked_at: now },
      { provider: 'gemini', healthy: true, response_time_ms: 0, last_checked_at: now },
      { provider: 'alert_state', healthy: false, response_time_ms: 0, last_checked_at: '1970-01-01T00:00:00.000Z' }
    ]);
    const updated = current.map(item => 
      item.provider === provider 
        ? { ...item, healthy, response_time_ms: responseTimeMs, last_checked_at: lastChecked } 
        : item
    );
    setLocal('ai_provider_status', updated);
  },

  async getAlertState(): Promise<{ lastAlertedAt: string }> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<{ lastAlertedAt: string }>('getAlertState');
      if (res !== null) return res;
      const statuses = getLocal<AiProviderStatus[]>('ai_provider_status', []);
      const alertState = statuses.find(s => s.provider === 'alert_state');
      return { lastAlertedAt: alertState ? alertState.last_checked_at : '1970-01-01T00:00:00.000Z' };
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`
        SELECT last_checked_at FROM ai_provider_status 
        WHERE provider = 'alert_state'
      `;
      if (rows.length > 0) {
        return { lastAlertedAt: rows[0].last_checked_at };
      }
    }

    const statuses = getLocal<AiProviderStatus[]>('ai_provider_status', []);
    const alertState = statuses.find(s => s.provider === 'alert_state');
    return { lastAlertedAt: alertState ? alertState.last_checked_at : '1970-01-01T00:00:00.000Z' };
  },

  async updateAlertState(lastAlertedAt: string): Promise<void> {
    if (typeof window !== 'undefined') {
      await clientProxy<void>('updateAlertState', [lastAlertedAt]);
      return;
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      await sql`
        UPDATE ai_provider_status 
        SET last_checked_at = ${lastAlertedAt}
        WHERE provider = 'alert_state'
      `;
      return;
    }

    const now = new Date().toISOString();
    const current = getLocal<AiProviderStatus[]>('ai_provider_status', [
      { provider: 'groq', healthy: true, response_time_ms: 0, last_checked_at: now },
      { provider: 'gemini', healthy: true, response_time_ms: 0, last_checked_at: now },
      { provider: 'alert_state', healthy: false, response_time_ms: 0, last_checked_at: '1970-01-01T00:00:00.000Z' }
    ]);
    const updated = current.map(item => 
      item.provider === 'alert_state' 
        ? { ...item, last_checked_at: lastAlertedAt } 
        : item
    );
    setLocal('ai_provider_status', updated);
  }
,

// --- MEMBER PORTAL & MANAGEMENT ---
  async isNeonActive(): Promise<boolean> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<boolean>('isNeonActive');
      return res ?? false;
    }
    return !!databaseUrl;
  },

async getMembers(): Promise<Member[]> {
  await db.autoUpdateMembershipStatuses();

  if (typeof window !== 'undefined') {
    const res = await clientProxy<Member[]>('getMembers');
    if (res !== null) return res;
    return getLocal<Member[]>('members', []);
  }

  if (databaseUrl) {
    await ensureDbInitialized();
    const sql = neon(databaseUrl);
    const rows = await sql`SELECT * FROM members ORDER BY member_id ASC`;
    return rows as unknown as Member[];
  }

  return getLocal<Member[]>('members', []);
},

async getMemberById(id: string | number): Promise<Member | null> {
  if (typeof window !== 'undefined') {
    const res = await clientProxy<Member | null>('getMemberById', [id]);
    if (res !== null) return res;
    const current = getLocal<Member[]>('members', []);
    return current.find(m => String(m.id) === String(id) || m.member_id === String(id)) || null;
  }

  if (databaseUrl) {
    await ensureDbInitialized();
    const sql = neon(databaseUrl);
    const numericId = parseInt(String(id));
    const isNumeric = !isNaN(numericId) && String(numericId) === String(id);
    let rows;
    if (isNumeric) {
      rows = await sql`SELECT * FROM members WHERE id = ${numericId} OR member_id = ${String(id)}`;
    } else {
      rows = await sql`SELECT * FROM members WHERE member_id = ${String(id)}`;
    }
    return rows.length > 0 ? (rows[0] as unknown as Member) : null;
  }

  const current = getLocal<Member[]>('members', []);
  return current.find(m => String(m.id) === String(id) || m.member_id === String(id)) || null;
},

async getMemberByPhone(phone: string): Promise<Member | null> {
  if (typeof window !== 'undefined') {
    const res = await clientProxy<Member | null>('getMemberByPhone', [phone]);
    if (res !== null) return res;
    const current = getLocal<Member[]>('members', []);
    return current.find(m => m.phone === phone) || null;
  }

  if (databaseUrl) {
    await ensureDbInitialized();
    const sql = neon(databaseUrl);
    const rows = await sql`SELECT * FROM members WHERE phone = ${phone}`;
    return rows.length > 0 ? (rows[0] as unknown as Member) : null;
  }

  const current = getLocal<Member[]>('members', []);
  return current.find(m => m.phone === phone) || null;
},

async saveMember(member: Partial<Member>): Promise<Member> {
  let member_id = member.member_id;
  const isNew = !member.id && !member.member_id;

  if (isNew) {
    let nextNum = 1001;
    if (typeof window !== 'undefined') {
      const current = getLocal<Member[]>('members', []);
      if (current.length > 0) {
        const ids = current.map(m => parseInt(m.member_id.replace('RF', ''))).filter(n => !isNaN(n));
        if (ids.length > 0) nextNum = Math.max(...ids) + 1;
      }
    } else if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`SELECT member_id FROM members ORDER BY id DESC LIMIT 1`;
      if (rows.length > 0) {
        const matchNum = parseInt(rows[0].member_id.replace('RF', ''));
        if (!isNaN(matchNum)) nextNum = matchNum + 1;
      }
    }
    member_id = `RF${nextNum}`;
  }

  const start_date = member.start_date || new Date().toISOString().split('T')[0];
  let status = member.status || 'Active';
  if (status !== 'Suspended' && member.end_date) {
    const todayStr = new Date().toISOString().split('T')[0];
    const diffDays = Math.ceil((new Date(member.end_date).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      status = 'Expired';
    } else if (diffDays <= 7) {
      status = 'Expiring Soon';
    } else {
      status = 'Active';
    }
  }

  const newMember: Member = {
    id: member.id,
    member_id: member_id!,
    name: member.name!,
    phone: member.phone!,
    email: member.email || '',
    password_hash: member.password_hash || '',
    membership_type: member.membership_type!,
    start_date,
    end_date: member.end_date!,
    status,
    notes: member.notes || '',
    created_at: member.created_at || new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    const res = await clientProxy<Member>('saveMember', [member]);
    if (res !== null) return res;
    const current = getLocal<Member[]>('members', []);
    if (member.id) {
      const idx = current.findIndex(m => m.id === member.id);
      if (idx !== -1) {
        const oldStatus = current[idx].status;
        current[idx] = { ...current[idx], ...newMember };
        if (oldStatus !== newMember.status || member.notes === 'RENEWAL') {
          const label = member.notes === 'RENEWAL' ? 'Renewed 🟢' : newMember.status;
          notifyTelegramMemberUpdate(newMember.name, newMember.membership_type, label, newMember.end_date);
        }
      }
    } else {
      newMember.id = current.length + 1;
      current.unshift(newMember);
      notifyTelegramNewMember(newMember.name, newMember.phone, newMember.member_id, newMember.membership_type, newMember.end_date);
    }
    setLocal('members', current);
    return newMember;
  }

  if (databaseUrl) {
    await ensureDbInitialized();
    const sql = neon(databaseUrl);
    let savedRow;
    if (member.id) {
      const rows = await sql`
        UPDATE members SET
          name = ${newMember.name},
          phone = ${newMember.phone},
          email = ${newMember.email},
          membership_type = ${newMember.membership_type},
          start_date = ${newMember.start_date},
          end_date = ${newMember.end_date},
          status = ${newMember.status},
          notes = ${newMember.notes}
        WHERE id = ${member.id}
        RETURNING *
      `;
      savedRow = rows[0] as unknown as Member;
      const label = member.notes === 'RENEWAL' ? 'Renewed 🟢' : newMember.status;
      notifyTelegramMemberUpdate(newMember.name, newMember.membership_type, label, newMember.end_date);
    } else {
      const rows = await sql`
        INSERT INTO members (member_id, name, phone, email, password_hash, membership_type, start_date, end_date, status, notes, created_at)
        VALUES (${newMember.member_id}, ${newMember.name}, ${newMember.phone}, ${newMember.email}, ${newMember.password_hash}, ${newMember.membership_type}, ${newMember.start_date}, ${newMember.end_date}, ${newMember.status}, ${newMember.notes}, ${newMember.created_at})
        RETURNING *
      `;
      savedRow = rows[0] as unknown as Member;
      notifyTelegramNewMember(savedRow.name, savedRow.phone, savedRow.member_id, savedRow.membership_type, savedRow.end_date);
    }
    return savedRow;
  }

  const current = getLocal<Member[]>('members', []);
  if (member.id) {
    const idx = current.findIndex(m => m.id === member.id);
    if (idx !== -1) current[idx] = { ...current[idx], ...newMember };
  } else {
    newMember.id = current.length + 1;
    current.unshift(newMember);
  }
  setLocal('members', current);
  return newMember;
},

async deleteMember(id: string | number): Promise<boolean> {
  if (typeof window !== 'undefined') {
    const res = await clientProxy<boolean>('deleteMember', [id]);
    if (res !== null) return res;
    const current = getLocal<Member[]>('members', []);
    const updated = current.filter(m => String(m.id) !== String(id));
    setLocal('members', updated);
    return true;
  }

  if (databaseUrl) {
    await ensureDbInitialized();
    const sql = neon(databaseUrl);
    await sql`DELETE FROM members WHERE id = ${parseInt(String(id)) || 0}`;
    return true;
  }

  const current = getLocal<Member[]>('members', []);
  const updated = current.filter(m => String(m.id) !== String(id));
  setLocal('members', updated);
  return true;
},

async updateMemberPassword(memberId: string, passwordHash: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    const res = await clientProxy<boolean>('updateMemberPassword', [memberId, passwordHash]);
    if (res !== null) return res;
    const current = getLocal<Member[]>('members', []);
    const idx = current.findIndex(m => m.member_id === memberId || String(m.id) === String(memberId));
    if (idx !== -1) {
      current[idx].password_hash = passwordHash;
      setLocal('members', current);
      return true;
    }
    return false;
  }

  if (databaseUrl) {
    await ensureDbInitialized();
    const sql = neon(databaseUrl);
    await sql`UPDATE members SET password_hash = ${passwordHash} WHERE member_id = ${memberId} OR id = ${parseInt(memberId) || 0}`;
    return true;
  }

  const current = getLocal<Member[]>('members', []);
  const idx = current.findIndex(m => m.member_id === memberId || String(m.id) === String(memberId));
  if (idx !== -1) {
    current[idx].password_hash = passwordHash;
    setLocal('members', current);
    return true;
  }
  return false;
},

async getMemberProgress(memberId: string): Promise<MemberProgress[]> {
  if (typeof window !== 'undefined') {
    const res = await clientProxy<MemberProgress[]>('getMemberProgress', [memberId]);
    if (res !== null) return res;
    return getLocal<MemberProgress[]>('member_progress', []).filter(p => p.member_id === memberId);
  }

  if (databaseUrl) {
    await ensureDbInitialized();
    const sql = neon(databaseUrl);
    const rows = await sql`SELECT * FROM member_progress WHERE member_id = ${memberId} ORDER BY created_at DESC`;
    return rows as unknown as MemberProgress[];
  }

  return getLocal<MemberProgress[]>('member_progress', []).filter(p => p.member_id === memberId);
},

async saveMemberProgress(progress: Partial<MemberProgress>): Promise<MemberProgress> {
  const newProgress: MemberProgress = {
    id: progress.id,
    member_id: progress.member_id!,
    weight: Number(progress.weight) || 0,
    body_fat: Number(progress.body_fat) || 0,
    chest: Number(progress.chest) || 0,
    waist: Number(progress.waist) || 0,
    arms: Number(progress.arms) || 0,
    bmi: Number(progress.bmi) || 0,
    notes: progress.notes || '',
    created_at: progress.created_at || new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    const res = await clientProxy<MemberProgress>('saveMemberProgress', [progress]);
    if (res !== null) return res;
    const current = getLocal<MemberProgress[]>('member_progress', []);
    newProgress.id = current.length + 1;
    current.unshift(newProgress);
    setLocal('member_progress', current);
    return newProgress;
  }

  if (databaseUrl) {
    await ensureDbInitialized();
    const sql = neon(databaseUrl);
    const rows = await sql`
      INSERT INTO member_progress (member_id, weight, body_fat, chest, waist, arms, bmi, notes, created_at)
      VALUES (${newProgress.member_id}, ${newProgress.weight}, ${newProgress.body_fat}, ${newProgress.chest}, ${newProgress.waist}, ${newProgress.arms}, ${newProgress.bmi}, ${newProgress.notes}, ${newProgress.created_at})
      RETURNING *
    `;
    return rows[0] as unknown as MemberProgress;
  }

  const current = getLocal<MemberProgress[]>('member_progress', []);
  newProgress.id = current.length + 1;
  current.unshift(newProgress);
  setLocal('member_progress', current);
  return newProgress;
},

async getWorkoutSchedule(): Promise<WorkoutDay[]> {
  if (typeof window !== 'undefined') {
    const res = await clientProxy<WorkoutDay[]>('getWorkoutSchedule');
    if (res !== null) return res;
    return getLocal<WorkoutDay[]>('workout_schedule', SEED_WORKOUT_SCHEDULE);
  }

  if (databaseUrl) {
    await ensureDbInitialized();
    const sql = neon(databaseUrl);
    const rows = await sql`SELECT * FROM workout_schedule ORDER BY id ASC`;
    return rows as unknown as WorkoutDay[];
  }

  return getLocal<WorkoutDay[]>('workout_schedule', SEED_WORKOUT_SCHEDULE);
},

async saveWorkoutScheduleDay(day: string, title: string, description: string): Promise<void> {
  if (typeof window !== 'undefined') {
    await clientProxy<void>('saveWorkoutScheduleDay', [day, title, description]);
    return;
  }

  if (databaseUrl) {
    await ensureDbInitialized();
    const sql = neon(databaseUrl);
    await sql`
      INSERT INTO workout_schedule (day, title, description)
      VALUES (${day}, ${title}, ${description})
      ON CONFLICT (day) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description
    `;
    return;
  }

  const current = getLocal<WorkoutDay[]>('workout_schedule', SEED_WORKOUT_SCHEDULE);
  const idx = current.findIndex(w => w.day === day);
  if (idx !== -1) {
    current[idx].title = title;
    current[idx].description = description;
  } else {
    current.push({ day, title, description });
  }
  setLocal('workout_schedule', current);
},

async getAnnouncements(): Promise<Announcement[]> {
  if (typeof window !== 'undefined') {
    const res = await clientProxy<Announcement[]>('getAnnouncements');
    if (res !== null) return res;
    return getLocal<Announcement[]>('announcements', SEED_ANNOUNCEMENTS);
  }

  if (databaseUrl) {
    await ensureDbInitialized();
    const sql = neon(databaseUrl);
    const rows = await sql`SELECT * FROM announcements ORDER BY created_at DESC`;
    return rows as unknown as Announcement[];
  }

  return getLocal<Announcement[]>('announcements', SEED_ANNOUNCEMENTS);
},

async saveAnnouncement(ann: Partial<Announcement>): Promise<Announcement> {
  const newAnn: Announcement = {
    id: ann.id,
    title: ann.title!,
    message: ann.message!,
    created_at: ann.created_at || new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    const res = await clientProxy<Announcement>('saveAnnouncement', [ann]);
    if (res !== null) return res;
    const current = getLocal<Announcement[]>('announcements', SEED_ANNOUNCEMENTS);
    newAnn.id = current.length + 1;
    current.unshift(newAnn);
    setLocal('announcements', current);
    return newAnn;
  }

  if (databaseUrl) {
    await ensureDbInitialized();
    const sql = neon(databaseUrl);
    const rows = await sql`
      INSERT INTO announcements (title, message, created_at)
      VALUES (${newAnn.title}, ${newAnn.message}, ${newAnn.created_at})
      RETURNING *
    `;
    return rows[0] as unknown as Announcement;
  }

  const current = getLocal<Announcement[]>('announcements', SEED_ANNOUNCEMENTS);
  newAnn.id = current.length + 1;
  current.unshift(newAnn);
  setLocal('announcements', current);
  return newAnn;
},

async deleteAnnouncement(id: string | number): Promise<boolean> {
  if (typeof window !== 'undefined') {
    const res = await clientProxy<boolean>('deleteAnnouncement', [id]);
    if (res !== null) return res;
    const current = getLocal<Announcement[]>('announcements', SEED_ANNOUNCEMENTS);
    const updated = current.filter(a => String(a.id) !== String(id));
    setLocal('announcements', updated);
    return true;
  }

  if (databaseUrl) {
    await ensureDbInitialized();
    const sql = neon(databaseUrl);
    await sql`DELETE FROM announcements WHERE id = ${parseInt(String(id)) || 0}`;
    return true;
  }

  const current = getLocal<Announcement[]>('announcements', SEED_ANNOUNCEMENTS);
  const updated = current.filter(a => String(a.id) !== String(id));
  setLocal('announcements', updated);
  return true;
},

async checkInMember(memberId: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    const res = await clientProxy<boolean>('checkInMember', [memberId]);
    if (res !== null) return res;
    const current = getLocal<Attendance[]>('member_attendance', []);
    current.unshift({ member_id: memberId, check_in_time: new Date().toISOString() });
    setLocal('member_attendance', current);
    return true;
  }

  if (databaseUrl) {
    await ensureDbInitialized();
    const sql = neon(databaseUrl);
    await sql`INSERT INTO member_attendance (member_id, check_in_time) VALUES (${memberId}, NOW())`;
    return true;
  }

  const current = getLocal<Attendance[]>('member_attendance', []);
  current.unshift({ member_id: memberId, check_in_time: new Date().toISOString() });
  setLocal('member_attendance', current);
  return true;
},

async getMemberAttendance(memberId: string, limit = 100): Promise<Attendance[]> {
  if (typeof window !== 'undefined') {
    const res = await clientProxy<Attendance[]>('getMemberAttendance', [memberId, limit]);
    if (res !== null) return res;
    return getLocal<Attendance[]>('member_attendance', []).filter(a => a.member_id === memberId).slice(0, limit);
  }

  if (databaseUrl) {
    await ensureDbInitialized();
    const sql = neon(databaseUrl);
    const rows = await sql`
      SELECT * FROM member_attendance 
      WHERE member_id = ${memberId} 
      ORDER BY check_in_time DESC 
      LIMIT ${limit}
    `;
    return rows as unknown as Attendance[];
  }

  return getLocal<Attendance[]>('member_attendance', []).filter(a => a.member_id === memberId).slice(0, limit);
},

async getDailyAttendance(dateString: string): Promise<Attendance[]> {
  if (typeof window !== 'undefined') {
    const res = await clientProxy<Attendance[]>('getDailyAttendance', [dateString]);
    if (res !== null) return res;
    return getLocal<Attendance[]>('member_attendance', []).filter(a => a.check_in_time.startsWith(dateString));
  }

  if (databaseUrl) {
    await ensureDbInitialized();
    const sql = neon(databaseUrl);
    const startOfDay = `${dateString} 00:00:00+05:30`;
    const endOfDay = `${dateString} 23:59:59+05:30`;
    const rows = await sql`
      SELECT * FROM member_attendance 
      WHERE check_in_time >= ${startOfDay} AND check_in_time <= ${endOfDay}
      ORDER BY check_in_time DESC
    `;
    return rows as unknown as Attendance[];
  }

  return getLocal<Attendance[]>('member_attendance', []).filter(a => a.check_in_time.startsWith(dateString));
},

async autoUpdateMembershipStatuses(): Promise<void> {
  if (typeof window !== 'undefined') {
    return;
  }

  try {
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (databaseUrl) {
      const sql = neon(databaseUrl);
      const members = await sql`SELECT * FROM members WHERE status != 'Suspended'`;
      
      for (const m of members) {
        let newStatus = m.status;
        const diffDays = Math.ceil((new Date(m.end_date).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
          newStatus = 'Expired';
        } else if (diffDays <= 7) {
          newStatus = 'Expiring Soon';
        } else {
          newStatus = 'Active';
        }
        
        if (newStatus !== m.status) {
          await sql`UPDATE members SET status = ${newStatus} WHERE id = ${m.id}`;
          console.log(`[AUTO STATUS UPDATE] Member ${m.name} changed status to ${newStatus}`);
          if (newStatus === 'Expired') {
            notifyTelegramMemberUpdate(m.name, m.membership_type, 'Expired 🔴', m.end_date);
          }
        }
      }
      return;
    }
    
    const current = getLocal<Member[]>('members', []);
    let updated = false;
    const nextMembers = current.map(m => {
      if (m.status === 'Suspended') return m;
      let newStatus = m.status;
      const diffDays = Math.ceil((new Date(m.end_date).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        newStatus = 'Expired';
      } else if (diffDays <= 7) {
        newStatus = 'Expiring Soon';
      } else {
        newStatus = 'Active';
      }
      
      if (newStatus !== m.status) {
        updated = true;
        if (newStatus === 'Expired') {
          notifyTelegramMemberUpdate(m.name, m.membership_type, 'Expired 🔴', m.end_date);
        }
        return { ...m, status: newStatus };
      }
      return m;
    });
    
    if (updated) {
      setLocal('members', nextMembers);
    }
  } catch (err) {
    console.error('Failed to run autoUpdateMembershipStatuses:', err);
  }
},

  async getMemberGoal(memberId: string): Promise<any> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<any>('getMemberGoal', [memberId]);
      if (res !== null) return res;
      return getLocal(`member_goal_${memberId}`, null);
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`SELECT * FROM member_goals WHERE member_id = ${memberId} LIMIT 1`;
      return rows.length > 0 ? rows[0] : null;
    }
    return getLocal(`member_goal_${memberId}`, null);
  },

  async saveMemberGoal(goal: { member_id: string; goal: string; start_weight: number; target_weight: number }): Promise<any> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<any>('saveMemberGoal', [goal]);
      if (res !== null) return res;
      setLocal(`member_goal_${goal.member_id}`, goal);
      return goal;
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`
        INSERT INTO member_goals (member_id, goal, start_weight, target_weight)
        VALUES (${goal.member_id}, ${goal.goal}, ${goal.start_weight}, ${goal.target_weight})
        ON CONFLICT (member_id) DO UPDATE SET
          goal = EXCLUDED.goal,
          start_weight = EXCLUDED.start_weight,
          target_weight = EXCLUDED.target_weight
        RETURNING *
      `;
      return rows[0];
    }
    setLocal(`member_goal_${goal.member_id}`, goal);
    return goal;
  },

  async getDietPlan(memberId: string): Promise<any> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<any>('getDietPlan', [memberId]);
      if (res !== null) return res;
      return getLocal(`diet_plan_${memberId}`, null);
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`SELECT * FROM diet_plans WHERE member_id = ${memberId} LIMIT 1`;
      return rows.length > 0 ? rows[0] : null;
    }
    return getLocal(`diet_plan_${memberId}`, null);
  },

  async saveDietPlan(diet: { member_id: string; breakfast: string; lunch: string; dinner: string; snacks: string; supplements: string; calories_target?: number; protein_target?: number; meal_schedule?: string; compliance_pct?: number }): Promise<any> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<any>('saveDietPlan', [diet]);
      if (res !== null) return res;
      setLocal(`diet_plan_${diet.member_id}`, diet);
      return diet;
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`
        INSERT INTO diet_plans (member_id, breakfast, lunch, dinner, snacks, supplements, calories_target, protein_target, meal_schedule, compliance_pct)
        VALUES (${diet.member_id}, ${diet.breakfast}, ${diet.lunch}, ${diet.dinner}, ${diet.snacks}, ${diet.supplements}, ${diet.calories_target ?? 2000}, ${diet.protein_target ?? 150}, ${diet.meal_schedule ?? ''}, ${diet.compliance_pct ?? 100})
        ON CONFLICT (member_id) DO UPDATE SET
          breakfast = EXCLUDED.breakfast,
          lunch = EXCLUDED.lunch,
          dinner = EXCLUDED.dinner,
          snacks = EXCLUDED.snacks,
          supplements = EXCLUDED.supplements,
          calories_target = EXCLUDED.calories_target,
          protein_target = EXCLUDED.protein_target,
          meal_schedule = EXCLUDED.meal_schedule,
          compliance_pct = EXCLUDED.compliance_pct
        RETURNING *
      `;
      return rows[0];
    }
    setLocal(`diet_plan_${diet.member_id}`, diet);
    return diet;
  },

  async getTrainerNotes(memberId: string): Promise<any[]> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<any[]>('getTrainerNotes', [memberId]);
      if (res !== null) return res;
      return getLocal(`trainer_notes_${memberId}`, []);
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`SELECT * FROM trainer_notes WHERE member_id = ${memberId} ORDER BY id DESC`;
      return rows;
    }
    return getLocal(`trainer_notes_${memberId}`, []);
  },

  async saveTrainerNote(memberId: string, note: string): Promise<any> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<any>('saveTrainerNote', [memberId, note]);
      if (res !== null) return res;
      const current = getLocal<any[]>(`trainer_notes_${memberId}`, []);
      const newNote = { id: current.length + 1, member_id: memberId, note, created_at: new Date().toISOString() };
      current.unshift(newNote);
      setLocal(`trainer_notes_${memberId}`, current);
      return newNote;
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`
        INSERT INTO trainer_notes (member_id, note)
        VALUES (${memberId}, ${note})
        RETURNING *
      `;
      return rows[0];
    }
    const current = getLocal<any[]>(`trainer_notes_${memberId}`, []);
    const newNote = { id: current.length + 1, member_id: memberId, note, created_at: new Date().toISOString() };
    current.unshift(newNote);
    setLocal(`trainer_notes_${memberId}`, current);
    return newNote;
  },

  async deleteTrainerNote(id: number, memberId: string): Promise<boolean> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<boolean>('deleteTrainerNote', [id, memberId]);
      if (res !== null) return res;
      const current = getLocal<any[]>(`trainer_notes_${memberId}`, []);
      const filtered = current.filter(n => n.id !== id);
      setLocal(`trainer_notes_${memberId}`, filtered);
      return true;
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      await sql`DELETE FROM trainer_notes WHERE id = ${id}`;
      return true;
    }
    const current = getLocal<any[]>(`trainer_notes_${memberId}`, []);
    const filtered = current.filter(n => n.id !== id);
    setLocal(`trainer_notes_${memberId}`, filtered);
    return true;
  },

  async getWorkoutPlan(memberId: string): Promise<any> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<any>('getWorkoutPlan', [memberId]);
      if (res !== null) return res;
      return getLocal(`workout_plan_${memberId}`, null);
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`SELECT * FROM workout_plans WHERE member_id = ${memberId} LIMIT 1`;
      return rows.length > 0 ? rows[0] : null;
    }
    return getLocal(`workout_plan_${memberId}`, null);
  },

  async saveWorkoutPlan(workout: { member_id: string; today_workout: string; sets_reps: string; exercises: string }): Promise<any> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<any>('saveWorkoutPlan', [workout]);
      if (res !== null) return res;
      setLocal(`workout_plan_${workout.member_id}`, workout);
      return workout;
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`
        INSERT INTO workout_plans (member_id, today_workout, sets_reps, exercises)
        VALUES (${workout.member_id}, ${workout.today_workout}, ${workout.sets_reps}, ${workout.exercises})
        ON CONFLICT (member_id) DO UPDATE SET
          today_workout = EXCLUDED.today_workout,
          sets_reps = EXCLUDED.sets_reps,
          exercises = EXCLUDED.exercises
        RETURNING *
      `;
      return rows[0];
    }
    setLocal(`workout_plan_${workout.member_id}`, workout);
    return workout;
  },

  async getBodyMetrics(memberId: string): Promise<any[]> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<any[]>('getBodyMetrics', [memberId]);
      if (res !== null) return res;
      return getLocal(`body_metrics_${memberId}`, []);
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`SELECT * FROM body_metrics WHERE member_id = ${memberId} ORDER BY created_at ASC`;
      return rows;
    }
    return getLocal(`body_metrics_${memberId}`, []);
  },

  async saveBodyMetrics(metric: { member_id: string; weight: number; body_fat: number; bmi: number }): Promise<any> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<any>('saveBodyMetrics', [metric]);
      if (res !== null) return res;
      const current = getLocal<any[]>(`body_metrics_${metric.member_id}`, []);
      const newMetric = { id: current.length + 1, ...metric, created_at: new Date().toISOString() };
      current.push(newMetric);
      setLocal(`body_metrics_${metric.member_id}`, current);
      return newMetric;
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`
        INSERT INTO body_metrics (member_id, weight, body_fat, bmi)
        VALUES (${metric.member_id}, ${metric.weight}, ${metric.body_fat}, ${metric.bmi})
        RETURNING *
      `;
      return rows[0];
    }
    const current = getLocal<any[]>(`body_metrics_${metric.member_id}`, []);
    const newMetric = { id: current.length + 1, ...metric, created_at: new Date().toISOString() };
    current.push(newMetric);
    setLocal(`body_metrics_${metric.member_id}`, current);
    return newMetric;
  },

  async getProgressPhotos(memberId: string): Promise<any[]> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<any[]>('getProgressPhotos', [memberId]);
      if (res !== null) return res;
      return getLocal(`progress_photos_${memberId}`, []);
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`SELECT * FROM progress_photos WHERE member_id = ${memberId} ORDER BY id DESC`;
      return rows;
    }
    return getLocal(`progress_photos_${memberId}`, []);
  },

  async saveProgressPhotos(photo: { member_id: string; front_photo: string; side_photo: string; back_photo: string; month_label: string }): Promise<any> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<any>('saveProgressPhotos', [photo]);
      if (res !== null) return res;
      const current = getLocal<any[]>(`progress_photos_${photo.member_id}`, []);
      const newPhoto = { id: current.length + 1, ...photo, created_at: new Date().toISOString() };
      current.unshift(newPhoto);
      setLocal(`progress_photos_${photo.member_id}`, current);
      return newPhoto;
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`
        INSERT INTO progress_photos (member_id, front_photo, side_photo, back_photo, month_label)
        VALUES (${photo.member_id}, ${photo.front_photo}, ${photo.side_photo}, ${photo.back_photo}, ${photo.month_label})
        RETURNING *
      `;
      return rows[0];
    }
    const current = getLocal<any[]>(`progress_photos_${photo.member_id}`, []);
    const newPhoto = { id: current.length + 1, ...photo, created_at: new Date().toISOString() };
    current.unshift(newPhoto);
    setLocal(`progress_photos_${photo.member_id}`, current);
    return newPhoto;
  },

  async getAchievements(memberId: string): Promise<any[]> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<any[]>('getAchievements', [memberId]);
      if (res !== null) return res;
      return getLocal(`achievements_${memberId}`, []);
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`SELECT * FROM achievements WHERE member_id = ${memberId} ORDER BY unlocked_at DESC`;
      return rows;
    }
    return getLocal(`achievements_${memberId}`, []);
  },

  async saveAchievement(ach: { member_id: string; badge_name: string; badge_type: string }): Promise<any> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<any>('saveAchievement', [ach]);
      if (res !== null) return res;
      const current = getLocal<any[]>(`achievements_${ach.member_id}`, []);
      const newAch = { id: current.length + 1, ...ach, unlocked_at: new Date().toISOString() };
      current.unshift(newAch);
      setLocal(`achievements_${ach.member_id}`, current);
      return newAch;
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`
        INSERT INTO achievements (member_id, badge_name, badge_type)
        VALUES (${ach.member_id}, ${ach.badge_name}, ${ach.badge_type})
        RETURNING *
      `;
      return rows[0];
    }
    const current = getLocal<any[]>(`achievements_${ach.member_id}`, []);
    const newAch = { id: current.length + 1, ...ach, unlocked_at: new Date().toISOString() };
    current.unshift(newAch);
    setLocal(`achievements_${ach.member_id}`, current);
    return newAch;
  },

  async logTelegramCommand(cmd: { command: string; chat_id: string; username: string; response: string }): Promise<any> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<any>('logTelegramCommand', [cmd]);
      return res;
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`
        INSERT INTO telegram_commands_log (command, chat_id, username, response)
        VALUES (${cmd.command}, ${cmd.chat_id}, ${cmd.username}, ${cmd.response})
        RETURNING *
      `;
      return rows[0];
    }
    return null;
  },

  async saveTelegramAnnouncement(message: string, sentByChatId: string): Promise<any> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<any>('saveTelegramAnnouncement', [message, sentByChatId]);
      return res;
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`
        INSERT INTO telegram_announcements (message, sent_by_chat_id)
        VALUES (${message}, ${sentByChatId})
        RETURNING *
      `;
      return rows[0];
    }
    return null;
  },

  async getMemberQrCard(memberId: string): Promise<any> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<any>('getMemberQrCard', [memberId]);
      if (res !== null) return res;
      return getLocal(`qr_card_${memberId}`, null);
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`SELECT * FROM member_qr_cards WHERE member_id = ${memberId} LIMIT 1`;
      return rows.length > 0 ? rows[0] : null;
    }
    return getLocal(`qr_card_${memberId}`, null);
  },

  async saveMemberQrCard(memberId: string, qrCodeData: string): Promise<any> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<any>('saveMemberQrCard', [memberId, qrCodeData]);
      if (res !== null) return res;
      const data = { member_id: memberId, qr_code_data: qrCodeData, created_at: new Date().toISOString() };
      setLocal(`qr_card_${memberId}`, data);
      return data;
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`
        INSERT INTO member_qr_cards (member_id, qr_code_data)
        VALUES (${memberId}, ${qrCodeData})
        ON CONFLICT (member_id) DO UPDATE SET
          qr_code_data = EXCLUDED.qr_code_data
        RETURNING *
      `;
      return rows[0];
    }
    const data = { member_id: memberId, qr_code_data: qrCodeData, created_at: new Date().toISOString() };
    setLocal(`qr_card_${memberId}`, data);
    return data;
  },

  async getTelegramSession(chatId: string): Promise<any> {
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`SELECT * FROM telegram_sessions WHERE chat_id = ${chatId}`;
      if (rows.length > 0) {
        return {
          chat_id: rows[0].chat_id,
          state: rows[0].state,
          data: JSON.parse(rows[0].data)
        };
      }
      return null;
    }
    return getLocal(`tg_session_${chatId}`, null);
  },

  async saveTelegramSession(chatId: string, state: string, data: any): Promise<void> {
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const dataStr = JSON.stringify(data || {});
      await sql`
        INSERT INTO telegram_sessions (chat_id, state, data, updated_at)
        VALUES (${chatId}, ${state}, ${dataStr}, NOW())
        ON CONFLICT (chat_id) DO UPDATE SET
          state = EXCLUDED.state,
          data = EXCLUDED.data,
          updated_at = NOW()
      `;
      return;
    }
    setLocal(`tg_session_${chatId}`, { chat_id: chatId, state, data });
  },

  async deleteTelegramSession(chatId: string): Promise<void> {
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      await sql`DELETE FROM telegram_sessions WHERE chat_id = ${chatId}`;
      return;
    }
    setLocal(`tg_session_${chatId}`, null);
  },

  async getAllAttendance(): Promise<Attendance[]> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<Attendance[]>('getAllAttendance');
      if (res !== null) return res;
      return getLocal<Attendance[]>('member_attendance', []);
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`SELECT * FROM member_attendance ORDER BY check_in_time DESC`;
      return rows as unknown as Attendance[];
    }
    return getLocal<Attendance[]>('member_attendance', []);
  },

  // --- VIRTUAL TOUR ---
  async getVirtualTour(): Promise<VirtualTour> {
    const fallback: VirtualTour = { id: 1, video_url: '', thumbnail_url: '', updated_at: new Date().toISOString() };
    if (typeof window !== 'undefined') {
      const res = await clientProxy<VirtualTour>('getVirtualTour');
      if (res !== null) return res;
      return getLocal('virtual_tour', fallback);
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`SELECT * FROM virtual_tour ORDER BY updated_at DESC LIMIT 1`;
      console.log("[VIRTUAL TOUR DB RESULT]", rows.length > 0 ? rows[0] : null);
      if (rows.length > 0) return rows[0] as unknown as VirtualTour;
    }
    console.log("[VIRTUAL TOUR DB RESULT] fallback", fallback);
    return fallback;
  },

  async saveVirtualTour(data: { video_url: string; thumbnail_url: string }): Promise<VirtualTour> {
    console.log("[VIRTUAL TOUR SAVE]", {
      video_url: data.video_url,
      thumbnail_url: data.thumbnail_url
    });
    const fallback: VirtualTour = { id: 1, video_url: data.video_url, thumbnail_url: data.thumbnail_url, updated_at: new Date().toISOString() };
    if (typeof window !== 'undefined') {
      const res = await clientProxy<VirtualTour>('saveVirtualTour', [data]);
      if (res !== null) return res;
      setLocal('virtual_tour', fallback);
      return fallback;
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      await sql`
        INSERT INTO virtual_tour (id, video_url, thumbnail_url, updated_at)
        VALUES (1, ${data.video_url}, ${data.thumbnail_url}, NOW())
        ON CONFLICT (id) DO UPDATE SET
          video_url = ${data.video_url},
          thumbnail_url = ${data.thumbnail_url},
          updated_at = NOW()
      `;
      const rows = await sql`SELECT * FROM virtual_tour ORDER BY updated_at DESC LIMIT 1`;
      console.log("[VIRTUAL TOUR SAVE DB RESULT]", rows.length > 0 ? rows[0] : null);
      if (rows.length > 0) return rows[0] as unknown as VirtualTour;
    }
    setLocal('virtual_tour', fallback);
    return fallback;
  },

  async saveMemberAiChat(chat: { member_id: string; question: string; provider: string; response_time_ms: number }): Promise<any> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<any>('saveMemberAiChat', [chat]);
      return res;
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`
        INSERT INTO member_ai_chats (member_id, question, provider, response_time_ms)
        VALUES (${chat.member_id}, ${chat.question}, ${chat.provider}, ${chat.response_time_ms})
        RETURNING *
      `;
      return rows[0];
    }
    return null;
  },

  async getAiCoachStatus(): Promise<{ activeMembers: number; totalChats: number; avgResponseTime: number }> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<{ activeMembers: number; totalChats: number; avgResponseTime: number }>('getAiCoachStatus');
      if (res !== null) return res;
      return { activeMembers: 1, totalChats: 10, avgResponseTime: 450 };
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const activeCount = await sql`SELECT COUNT(*)::int as count FROM members WHERE status = 'Active'`;
      const chatStats = await sql`SELECT COUNT(*)::int as count, COALESCE(AVG(response_time_ms)::int, 0) as avg_time FROM member_ai_chats`;
      return {
        activeMembers: activeCount[0].count,
        totalChats: chatStats[0].count,
        avgResponseTime: chatStats[0].avg_time
      };
    }
    return { activeMembers: 1, totalChats: 10, avgResponseTime: 450 };
  },

  async getMemberAiChats(memberId: string): Promise<any[]> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<any[]>('getMemberAiChats', [memberId]);
      if (res !== null) return res;
      return [];
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      return await sql`SELECT * FROM member_ai_chats WHERE member_id = ${memberId} ORDER BY created_at DESC LIMIT 20`;
    }
    return [];
  },

  async saveVisitorAnalytics(data: { visitorId: string; page: string; sessionId: string; userAgent: string; eventType?: 'book_trial_click' | 'virtual_tour_open' | 'trainer_card_click' | 'equipment_view' }): Promise<any> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<any>('saveVisitorAnalytics', [data]);
      return res;
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);

      if (data.eventType) {
        // UPSERT: insert row if it doesn't exist, then increment the event counter
        await sql`
          INSERT INTO visitor_analytics (visitor_id, page, session_id, user_agent)
          VALUES (${data.visitorId}, ${data.page}, ${data.sessionId}, ${data.userAgent})
          ON CONFLICT (visitor_id, session_id) DO NOTHING
        `;

        const columnMap: Record<string, string> = {
          book_trial_click: 'book_trial_clicks',
          virtual_tour_open: 'virtual_tour_opens',
          trainer_card_click: 'trainer_card_clicks',
          equipment_view: 'equipment_views'
        };
        const column = columnMap[data.eventType];

        if (column === 'book_trial_clicks') {
          const rows = await sql`UPDATE visitor_analytics SET book_trial_clicks = COALESCE(book_trial_clicks, 0) + 1 WHERE visitor_id = ${data.visitorId} AND session_id = ${data.sessionId} RETURNING *`;
          return rows[0];
        } else if (column === 'virtual_tour_opens') {
          const rows = await sql`UPDATE visitor_analytics SET virtual_tour_opens = COALESCE(virtual_tour_opens, 0) + 1 WHERE visitor_id = ${data.visitorId} AND session_id = ${data.sessionId} RETURNING *`;
          return rows[0];
        } else if (column === 'trainer_card_clicks') {
          const rows = await sql`UPDATE visitor_analytics SET trainer_card_clicks = COALESCE(trainer_card_clicks, 0) + 1 WHERE visitor_id = ${data.visitorId} AND session_id = ${data.sessionId} RETURNING *`;
          return rows[0];
        } else if (column === 'equipment_views') {
          const rows = await sql`UPDATE visitor_analytics SET equipment_views = COALESCE(equipment_views, 0) + 1 WHERE visitor_id = ${data.visitorId} AND session_id = ${data.sessionId} RETURNING *`;
          return rows[0];
        }
      }

      // Default: plain page visit insert
      const rows = await sql`
        INSERT INTO visitor_analytics (visitor_id, page, session_id, user_agent)
        VALUES (${data.visitorId}, ${data.page}, ${data.sessionId}, ${data.userAgent})
        RETURNING *
      `;
      return rows[0];
    }
    return null;
  },

  async getVisitorAnalyticsStats(): Promise<any> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<any>('getVisitorAnalyticsStats');
      if (res !== null) return res;
      return { totalVisitors: 120, todayVisitors: 15, weekVisitors: 84, returningVisitors: 42, conversionRate: 12.5, trialSubmissions: 15, bookTrialClicks: 8, virtualTourOpens: 23, trainerCardClicks: 14, equipmentViews: 31 };
    }
    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const totalVis = await sql`SELECT COUNT(DISTINCT visitor_id)::int as count FROM visitor_analytics`;
      const todayVis = await sql`SELECT COUNT(DISTINCT visitor_id)::int as count FROM visitor_analytics WHERE visited_at >= NOW() - INTERVAL '1 day'`;
      const weekVis = await sql`SELECT COUNT(DISTINCT visitor_id)::int as count FROM visitor_analytics WHERE visited_at >= NOW() - INTERVAL '7 days'`;
      const returningVis = await sql`SELECT COUNT(DISTINCT visitor_id)::int as count FROM (SELECT visitor_id FROM visitor_analytics GROUP BY visitor_id HAVING COUNT(DISTINCT session_id) > 1) as t`;
      const leadsCount = await sql`SELECT COUNT(*)::int as count FROM leads`;
      const eventSums = await sql`SELECT COALESCE(SUM(book_trial_clicks), 0)::int as book_trial_clicks, COALESCE(SUM(virtual_tour_opens), 0)::int as virtual_tour_opens, COALESCE(SUM(trainer_card_clicks), 0)::int as trainer_card_clicks, COALESCE(SUM(equipment_views), 0)::int as equipment_views FROM visitor_analytics`;
      
      const total = totalVis[0].count || 0;
      const subs = leadsCount[0].count || 0;
      const rate = total > 0 ? Number(((subs / total) * 100).toFixed(1)) : 0.0;

      return {
        totalVisitors: total,
        todayVisitors: todayVis[0].count || 0,
        weekVisitors: weekVis[0].count || 0,
        returningVisitors: returningVis[0].count || 0,
        conversionRate: rate,
        trialSubmissions: subs,
        bookTrialClicks: eventSums[0].book_trial_clicks || 0,
        virtualTourOpens: eventSums[0].virtual_tour_opens || 0,
        trainerCardClicks: eventSums[0].trainer_card_clicks || 0,
        equipmentViews: eventSums[0].equipment_views || 0
      };
    }
    return { totalVisitors: 120, todayVisitors: 15, weekVisitors: 84, returningVisitors: 42, conversionRate: 12.5, trialSubmissions: 15, bookTrialClicks: 8, virtualTourOpens: 23, trainerCardClicks: 14, equipmentViews: 31 };
  },

  async getAdminCredentials(username: string): Promise<any> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<any>('getAdminCredentials', [username]);
      if (res !== null) return res;
      const list = getLocal('admin_credentials', [{ username: 'admin', password_hash: require('bcryptjs').hashSync('RanFitness2026!', 10), updated_at: new Date().toISOString() }]);
      return list.find((u: any) => u.username === username) || null;
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const rows = await sql`SELECT * FROM admin_credentials WHERE username = ${username} LIMIT 1`;
      if (rows.length > 0) return rows[0];
    } else {
      const list = [{ username: 'admin', password_hash: require('bcryptjs').hashSync('RanFitness2026!', 10), updated_at: new Date().toISOString() }];
      return list.find((u: any) => u.username === username) || null;
    }
    return null;
  },

  async updateAdminPassword(username: string, newPasswordHash: string): Promise<boolean> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<boolean>('updateAdminPassword', [username, newPasswordHash]);
      if (res !== null) return res;
      const list = getLocal('admin_credentials', [{ username: 'admin', password_hash: '', updated_at: '' }]);
      const index = list.findIndex((u: any) => u.username === username);
      if (index !== -1) {
        list[index].password_hash = newPasswordHash;
        list[index].updated_at = new Date().toISOString();
        setLocal('admin_credentials', list);
        return true;
      }
      return false;
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const result = await sql`
        UPDATE admin_credentials 
        SET password_hash = ${newPasswordHash}, updated_at = NOW() 
        WHERE username = ${username}
        RETURNING *
      `;
      return result.length > 0;
    } else {
      return true;
    }
  },

  async updateAdminUsername(currentUsername: string, newUsername: string): Promise<boolean> {
    if (typeof window !== 'undefined') {
      const res = await clientProxy<boolean>('updateAdminUsername', [currentUsername, newUsername]);
      if (res !== null) return res;
      const list = getLocal('admin_credentials', [{ username: 'admin', password_hash: '', updated_at: '' }]);
      const index = list.findIndex((u: any) => u.username === currentUsername);
      if (index !== -1) {
        list[index].username = newUsername;
        list[index].updated_at = new Date().toISOString();
        setLocal('admin_credentials', list);
        return true;
      }
      return false;
    }

    if (databaseUrl) {
      await ensureDbInitialized();
      const sql = neon(databaseUrl);
      const exists = await sql`SELECT 1 FROM admin_credentials WHERE username = ${newUsername} LIMIT 1`;
      if (exists.length > 0) {
        throw new Error('Username already exists');
      }
      const result = await sql`
        UPDATE admin_credentials 
        SET username = ${newUsername}, updated_at = NOW() 
        WHERE username = ${currentUsername}
        RETURNING *
      `;
      return result.length > 0;
    } else {
      return true;
    }
  }
};
