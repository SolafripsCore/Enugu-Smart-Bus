export const site = {
  name: "Enugu Smart Bus",
  shortName: "ESB",
  tagline: "Smart. Safe. Seamless mobility for everyone in Enugu State.",
  description:
    "Enugu Smart Bus is a modern public transport system combining eco-friendly buses, cashless fares, live tracking and AI-driven operations across Enugu State.",
  url: "https://enugusmartbus.com",
  operator: "Blue Noble Motors Limited",
  address:
    "Suite 16, Flagship Plaza, No. 16 Ezilo Street, Independence Layout, Enugu, Nigeria.",
  phone: "+234 803 319 6377",
  phoneHref: "tel:+2348033196377",
  emails: {
    info: "info@enugusmartbus.com",
    support: "support@enugusmartbus.com",
    partnerships: "partnerships@enugusmartbus.com",
    media: "media@enugusmartbus.com",
  },
  hours: "Monday – Sunday, 9:00 AM – 8:00 PM (WAT)",
} as const;

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string; description?: string }[];
};

export const navigation: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About",
    href: "/about",
    children: [
      {
        label: "About ESB",
        href: "/about",
        description: "Our mission, vision and smart features",
      },
      {
        label: "About BNML",
        href: "/blue-noble",
        description: "The operator behind Enugu Smart Bus",
      },
      {
        label: "Our Team",
        href: "/team",
        description: "The leadership driving the project",
      },
    ],
  },
  { label: "How it works", href: "/how-it-works" },
  { label: "Services", href: "/services" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const socials = [
  {
    label: "Facebook",
    handle: "Enugu Smart Bus",
    href: "https://facebook.com/EnuguSmartBus",
    icon: "/images/home/facebook.webp",
  },
  {
    label: "X",
    handle: "@EnuguSmartBus",
    href: "https://x.com/EnuguSmartBus",
    icon: "/images/home/x.webp",
  },
  {
    label: "Instagram",
    handle: "@EnuguSmartBus",
    href: "https://instagram.com/EnuguSmartBus",
    icon: "/images/home/instagram.webp",
  },
  {
    label: "YouTube",
    handle: "Enugu Smart Bus TV",
    href: "https://youtube.com/@EnuguSmartBus",
    icon: "/images/home/youtube.webp",
  },
  {
    label: "LinkedIn",
    handle: "Enugu Smart Bus",
    href: "https://linkedin.com/company/enugusmartbus",
    icon: "/images/home/linkedin.webp",
  },
];

export const footerLinks = [
  { label: "Home", href: "/" },
  { label: "About Enugu Smart Bus", href: "/about" },
  { label: "About BNML", href: "/blue-noble" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Our Services", href: "/services" },
  { label: "Our Team", href: "/team" },
  { label: "Our Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
  { label: "Register / Sign Up", href: "/signup" },
  { label: "Download Our App", href: "/download" },
];

export const rideSteps = [
  {
    title: "Register",
    duration: "60 seconds",
    body: "Create your account on the web portal or the ESB mobile app, then verify your phone number and email to secure your profile.",
    icon: "/images/how-it-works/register-icon.webp",
  },
  {
    title: "Fund your wallet",
    duration: "Instant",
    body: "Top up with debit card, bank transfer, USSD or voucher. Your balance is ready for any ESB route, anytime.",
    icon: "/images/how-it-works/wallet-icon.webp",
  },
  {
    title: "Get your smart card",
    duration: "Optional",
    body: "Request a physical ESB Smart Card from any authorised outlet and link it to your account for tap-to-pay boarding.",
    icon: "/images/how-it-works/card-icon.webp",
  },
  {
    title: "Track your bus live",
    duration: "Real time",
    body: "Open the app for live bus locations, estimated arrival times and step-by-step guidance to your stop.",
    icon: "/images/how-it-works/click-icon.webp",
  },
  {
    title: "Tap to pay & board",
    duration: "2 seconds",
    body: "At the door validator, tap your card or show your in-app QR code. Payment is processed automatically.",
    icon: "/images/how-it-works/bus-icon.webp",
  },
  {
    title: "Ride & rate",
    duration: "Every trip",
    body: "Enjoy a safe, comfortable trip, then rate your experience at your stop to help us keep improving service.",
    icon: "/images/how-it-works/rate-icon.webp",
  },
];

export const services = [
  {
    title: "City bus service",
    icon: "bus",
    points: [
      "Frequent services across major corridors and communities",
      "Predictable timetables with real-time ETAs in the app",
      "Clean, comfortable buses with professionally trained drivers",
    ],
  },
  {
    title: "ESB Smart Card & Wallet",
    icon: "card",
    points: [
      "Tap-to-pay with the ESB Smart Card or in-app QR",
      "Instant top-ups via card, bank transfer, USSD or voucher",
      "Automatic receipts, trip history and fare caps where enabled",
    ],
  },
  {
    title: "Mobile app",
    icon: "app",
    points: [
      "Register, fund your wallet and manage your profile",
      "Live bus tracking and stop-by-stop guidance",
      "In-app support, lost-and-found and service alerts",
    ],
  },
  {
    title: "Real-time tracking",
    icon: "tracking",
    points: [
      "GPS tracking and ETAs for every route",
      "Service notifications for delays, diversions and safety updates",
      "Data-driven planning for better coverage and reliability",
    ],
  },
  {
    title: "Safety & security",
    icon: "security",
    points: [
      "CCTV-enabled fleet and monitored routes",
      "Driver training, route supervision and emergency hotlines",
      "Full compliance with transport and safety regulations",
    ],
  },
  {
    title: "Accessibility & comfort",
    icon: "accessibility",
    points: [
      "Priority seating and inclusive boarding assistance",
      "Low-floor access on designated routes",
      "Onboard conveniences such as handrails, Wi-Fi and USB charging",
    ],
  },
  {
    title: "Customer care",
    icon: "support",
    points: [
      "24/7 helpdesk via app, phone and email",
      "Lost-and-found workflow linked to your trip history",
      "Feedback and service ratings that drive real improvements",
    ],
  },
  {
    title: "Corporate & institutional",
    icon: "corporate",
    points: [
      "Staff shuttle partnerships and bulk smart card issuance",
      "Student and concession programmes where applicable",
      "Route sponsorship and co-branded commuter programmes",
    ],
  },
  {
    title: "Advertising & media",
    icon: "ads",
    points: [
      "Interior and exterior bus advertising and route takeovers",
      "Digital placements across the app and terminals",
      "Community campaigns with government and brand partners",
    ],
  },
];

export const roadmap = [
  "Extended night and weekend services",
  "Electric and CNG fleet expansion for cleaner mobility",
  "Integrated ticketing with other city transport modes",
];

export const smartFeatures = [
  {
    title: "Real-time bus tracking",
    body: "Know your bus location and estimated arrival time before you leave the house.",
  },
  {
    title: "Smart payment",
    body: "Pay seamlessly using your ESB Wallet or contactless Smart Card — no cash, no change.",
  },
  {
    title: "Onboard Wi-Fi & USB charging",
    body: "Stay connected and productive while you travel across the city.",
  },
  {
    title: "Accessibility & comfort",
    body: "Designed for everyone, including the elderly and persons with disabilities.",
  },
  {
    title: "AI-driven operations",
    body: "Optimised routes, predictive maintenance and fleet management for reliable service.",
  },
];

export const objectives = [
  "Provide a cashless, seamless and secure transport experience across all routes in Enugu.",
  "Create direct and indirect jobs for citizens through operations, maintenance and service networks.",
  "Reduce traffic congestion and carbon emissions with eco-friendly CNG and hybrid buses.",
  "Strengthen public trust through transparency, safety and real-time monitoring technologies.",
  "Support the Smart Enugu Initiative by integrating intelligent mobility into the city's digital infrastructure.",
];

export const principles = [
  { title: "Safety first", body: "Every bus, every route, every trip." },
  {
    title: "Reliability",
    body: "Predictable services powered by data and automation.",
  },
  {
    title: "Accessibility",
    body: "Inclusive design for the elderly and persons with disabilities.",
  },
  {
    title: "Sustainability",
    body: "Cleaner fuels and efficient operations that reduce emissions.",
  },
  {
    title: "Transparency",
    body: "Clear processes, accountable reporting and stakeholder engagement.",
  },
];

export const stats = [
  { value: "10,000+", label: "Jobs to be created for citizens" },
  { value: "100%", label: "Cashless, contactless fare collection" },
  { value: "24/7", label: "Customer support and monitoring" },
  { value: "30%", label: "Targeted reduction in fleet emissions" },
];

export const testimonials = [
  {
    name: "Chika Okeke",
    role: "Business Owner, Ogbete Main Market",
    quote:
      "With Enugu Smart Bus, moving my goods and staff around the city will finally be easier and more reliable.",
    image: "/images/home/customer-testimonial-1.webp",
  },
  {
    name: "Uchenna Nwodo",
    role: "Student, Enugu State University of Science and Technology",
    quote:
      "I can't wait to use the Smart Bus app — no more long waits or confusion about which bus to take!",
    image: "/images/home/customer-testimonial-2.webp",
  },
  {
    name: "Ngozi Eze",
    role: "Civil Servant, Ministry of Transport",
    quote:
      "This project shows real progress. Enugu is truly becoming a modern, connected city.",
    image: "/images/home/customer-testimonial-3.webp",
  },
];

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  category: string;
  image: string;
  featured?: boolean;
};

export const posts: Post[] = [
  {
    slug: "smart-bus-project-begins",
    title:
      "Enugu residents rejoice as the Enugu Smart Bus project begins in earnest",
    excerpt:
      "Work has started across major corridors as the state rolls out its flagship smart mobility programme.",
    date: "2025-01-30",
    readingTime: "5 min read",
    category: "Project news",
    image: "/images/blogs/lead-post-img.webp",
    featured: true,
  },
  {
    slug: "empowering-students",
    title:
      "Empowering students through real-world learning inside the Enugu Smart Bus",
    excerpt:
      "Interns and graduates are gaining hands-on experience in fleet technology, operations and customer service.",
    date: "2025-01-30",
    readingTime: "5 min read",
    category: "Community",
    image: "/images/blogs/blog-img-1.webp",
  },
  {
    slug: "subsidised-student-rates",
    title: "Enugu Smart Bus subsidises rates for Enugu students",
    excerpt:
      "Concession fares make daily commuting to campus more affordable for verified students.",
    date: "2025-01-30",
    readingTime: "5 min read",
    category: "Fares",
    image: "/images/blogs/blog-img-2.webp",
  },
  {
    slug: "productive-commute",
    title: "Get to work and stay productive while you ride Enugu Smart Bus",
    excerpt:
      "Onboard Wi-Fi, USB charging and comfortable seating turn commute time into productive time.",
    date: "2025-01-30",
    readingTime: "5 min read",
    category: "Onboard",
    image: "/images/blogs/blog-img-3.webp",
  },
  {
    slug: "more-residents-register",
    title: "More Enugu residents register for the Enugu Smart Bus",
    excerpt:
      "Registration numbers keep climbing ahead of launch as citizens prepare for cashless travel.",
    date: "2025-01-30",
    readingTime: "5 min read",
    category: "Project news",
    image: "/images/blogs/blog-img-4.webp",
  },
  {
    slug: "carbon-emissions-down",
    title:
      "Environmental impact: smart bus fleet targets a 30% cut in carbon emissions",
    excerpt:
      "CNG and hybrid buses replace ageing vehicles, lowering emissions on the busiest city corridors.",
    date: "2025-05-30",
    readingTime: "5 min read",
    category: "Sustainability",
    image: "/images/blogs/blog-img-5.webp",
  },
  {
    slug: "community-feedback",
    title:
      "Community feedback drives improvements in scheduling and accessibility",
    excerpt:
      "Rider ratings and stakeholder sessions are directly shaping timetables and boarding assistance.",
    date: "2025-05-30",
    readingTime: "5 min read",
    category: "Community",
    image: "/images/blogs/blog-img-6.webp",
  },
  {
    slug: "mobile-app-available",
    title:
      "Smart Bus mobile app now available for real-time trip planning and e-ticketing",
    excerpt:
      "Plan trips, track buses and pay from your phone — the ESB app is live on Android and iOS.",
    date: "2025-05-30",
    readingTime: "5 min read",
    category: "Product",
    image: "/images/blogs/blog-img-8.webp",
  },
  {
    slug: "new-routes",
    title:
      "Enugu Smart Bus launches new routes to improve citywide connectivity",
    excerpt:
      "Additional corridors link residential districts with markets, campuses and business hubs.",
    date: "2025-05-30",
    readingTime: "5 min read",
    category: "Routes",
    image: "/images/blogs/blog-img-9.webp",
  },
  {
    slug: "discounted-fares",
    title:
      "Students and workers enjoy discounted fares with new smart packages",
    excerpt:
      "Weekly and monthly packages reward frequent riders with predictable, lower fares.",
    date: "2025-05-30",
    readingTime: "5 min read",
    category: "Fares",
    image: "/images/blogs/blog-img-10.webp",
  },
  {
    slug: "safety-partnerships",
    title:
      "Enugu Smart Bus partners with tech startups to enhance passenger safety and tracking",
    excerpt:
      "New partnerships bring smarter monitoring, incident response and rider verification tools.",
    date: "2025-05-30",
    readingTime: "5 min read",
    category: "Safety",
    image: "/images/blogs/blog-img-11.webp",
  },
];

export const faqs = [
  {
    question: "Do I need the smart card to ride?",
    answer:
      "No. You can ride with the in-app QR code or the ESB Smart Card — whichever is more convenient for you.",
  },
  {
    question: "Can I ride if my phone battery dies?",
    answer:
      "Yes. If your phone battery dies you can still board and pay using your ESB Smart Card.",
  },
  {
    question: "Where do I collect a smart card?",
    answer:
      "Smart cards can be collected at our main station counters and from authorised partner outlets across Enugu.",
  },
  {
    question: "How do I get a refund?",
    answer:
      "Request a refund directly from your account under Payments & Refunds, or email support@enugusmartbus.com.",
  },
  {
    question: "What does each trip status mean?",
    answer:
      "Trip statuses show the progress of your ride or payment. Open Help in the app for the full guide.",
  },
  {
    question: "I lost an item on a bus. What next?",
    answer:
      "Open the app, go to Help → Lost & Found and select the trip. Our team will match the item to your journey.",
  },
];

export const contactCategories = [
  "General enquiry",
  "Customer support",
  "Smart card & wallet",
  "Partnerships",
  "Press & media",
  "Careers",
];

export type TeamMember = {
  name: string;
  role: string;
  image: string;
};

export const team: TeamMember[] = [
  {
    name: "Rev. Dr. Engr. Nnamdi Obiakalusi",
    role: "Chairman / CEO, Blue Noble Motors Limited",
    image: "/images/team/team-1.webp",
  },
  {
    name: "Mrs Obiakalusi",
    role: "Executive Director",
    image: "/images/team/team-2.webp",
  },
  {
    name: "Mr Chinedum",
    role: "ICT Lead",
    image: "/images/team/team-3.webp",
  },
  {
    name: "Arch. Onubiko",
    role: "Member",
    image: "/images/team/team-4.webp",
  },
  {
    name: "Dr. Ohio O.",
    role: "Member",
    image: "/images/team/team-5.webp",
  },
  {
    name: "Mr George Osamwoyi",
    role: "General Manager",
    image: "/images/team/team-6.webp",
  },
  {
    name: "Ibeabuchi Okezie",
    role: "Admin Manager",
    image: "/images/team/team-7.webp",
  },
  {
    name: "Barr. Udigwe Victoria",
    role: "Legal",
    image: "/images/team/team-8.webp",
  },
];

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
