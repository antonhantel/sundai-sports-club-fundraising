import type { User, Team, Lead, OutreachDraft, Asset, AgentLog } from "./types"

export const mockUser: User = {
  id: "user-1",
  email: "coach.martinez@gmail.com",
  name: "Coach Martinez",
  avatarUrl: "",
}

export const mockTeam: Team = {
  id: "team-1",
  name: "Riverside Thunder",
  sport: "Soccer",
  location: "92501",
  league: "Club",
  seasonStart: "2026-03-01",
  seasonEnd: "2026-08-15",
  audience: "Youth soccer players ages 8-14 and their families in the Riverside community. ~120 active families per season.",
  sponsorshipNeeds: "Jersey sponsorship, tournament entry fees, travel costs, equipment upgrades, end-of-season banquet.",
  targetAmount: 15000,
  existingSponsors: "Joe's Pizza, Riverside Auto Wash",
  primaryColor: "#0d9488",
  secondaryColor: "#f59e0b",
  logoUrl: "",
}

export const mockLeads: Lead[] = [
  {
    id: "lead-1",
    companyName: "Riverside Family Dentistry",
    category: "Dentist",
    contact: "Dr. Sarah Chen",
    email: "info@riversidefamilydentistry.com",
    location: "Riverside, CA",
    fitReason: "Family-oriented dental practice in your zip code. Likely interested in youth sports visibility to reach local families.",
    status: "sent",
    notes: "",
    createdAt: "2026-01-15",
  },
  {
    id: "lead-2",
    companyName: "Iron Peak Fitness",
    category: "Gym / Fitness",
    contact: "Marcus Williams",
    email: "marcus@ironpeakfitness.com",
    location: "Riverside, CA",
    fitReason: "Local gym focused on youth fitness programs. Strong alignment with athletic community and youth health messaging.",
    status: "drafted",
    notes: "Spoke with front desk, Marcus is the owner and handles sponsorships.",
    createdAt: "2026-01-16",
  },
  {
    id: "lead-3",
    companyName: "El Patron Mexican Grill",
    category: "Restaurant",
    contact: "Luis Gutierrez",
    email: "elpatrongrill@gmail.com",
    location: "Riverside, CA",
    fitReason: "Popular family restaurant near practice fields. Great fit for post-game meal sponsorships and jersey placement.",
    status: "approved",
    notes: "",
    createdAt: "2026-01-17",
  },
  {
    id: "lead-4",
    companyName: "Summit Auto Body",
    category: "Auto Repair",
    contact: "Kevin Park",
    email: "kevin@summitautobody.com",
    location: "Riverside, CA",
    fitReason: "Established local business with community roots. Auto shops frequently sponsor youth sports for brand visibility.",
    status: "new",
    notes: "",
    createdAt: "2026-01-18",
  },
  {
    id: "lead-5",
    companyName: "Bright Horizons Tutoring",
    category: "Education",
    contact: "Angela Foster",
    email: "angela@brighthorizonstutoring.com",
    location: "Riverside, CA",
    fitReason: "Education business targeting the same demographic of local families with school-age kids. Perfect brand alignment.",
    status: "new",
    notes: "",
    createdAt: "2026-01-19",
  },
  {
    id: "lead-6",
    companyName: "Riverside Credit Union",
    category: "Financial Services",
    contact: "Jennifer Muller",
    email: "community@riversidecu.org",
    location: "Riverside, CA",
    fitReason: "Community credit union with dedicated youth savings programs. Known for sponsoring local events and youth activities.",
    status: "approved",
    notes: "They have a formal sponsorship application process.",
    createdAt: "2026-01-20",
  },
  {
    id: "lead-7",
    companyName: "Pet Palace Veterinary",
    category: "Veterinary",
    contact: "Dr. James Ortiz",
    email: "frontdesk@petpalacevet.com",
    location: "Riverside, CA",
    fitReason: "Many sports families are also pet owners. Local vet offices see high foot traffic and value community presence.",
    status: "new",
    notes: "",
    createdAt: "2026-01-21",
  },
  {
    id: "lead-8",
    companyName: "Quick Stop Convenience",
    category: "Retail",
    contact: "Raj Patel",
    email: "raj@quickstopriverside.com",
    location: "Riverside, CA",
    fitReason: "Located two blocks from the main practice field. High visibility location for banner and jersey sponsorship.",
    status: "new",
    notes: "",
    createdAt: "2026-01-22",
  },
  {
    id: "lead-9",
    companyName: "Cascade Physical Therapy",
    category: "Healthcare",
    contact: "Nicole Brooks PT",
    email: "nicole@cascadept.com",
    location: "Riverside, CA",
    fitReason: "Sports-focused PT clinic. Ideal partner for injury prevention workshops and sideline presence at games.",
    status: "drafted",
    notes: "Very interested in doing a free workshop for the team.",
    createdAt: "2026-01-23",
  },
  {
    id: "lead-10",
    companyName: "Sunny Days Ice Cream",
    category: "Food & Beverage",
    contact: "Maria Santos",
    email: "maria@sunnydaysicecream.com",
    location: "Riverside, CA",
    fitReason: "Kid-friendly brand with seasonal business. Perfect match for post-game celebrations and tournament concessions.",
    status: "new",
    notes: "",
    createdAt: "2026-01-24",
  },
  {
    id: "lead-11",
    companyName: "Riverside Print & Sign Co.",
    category: "Printing",
    contact: "Tom Henderson",
    email: "tom@riversideprintsign.com",
    location: "Riverside, CA",
    fitReason: "They can provide banners, decals, and signage in exchange for sponsorship placement. Mutually beneficial partnership.",
    status: "new",
    notes: "",
    createdAt: "2026-01-25",
  },
  {
    id: "lead-12",
    companyName: "Apex Insurance Group",
    category: "Insurance",
    contact: "David Kim",
    email: "david.kim@apexinsurance.com",
    location: "Riverside, CA",
    fitReason: "Insurance agencies actively seek community engagement. Youth sports sponsorship builds trust with local families.",
    status: "approved",
    notes: "",
    createdAt: "2026-01-26",
  },
  {
    id: "lead-13",
    companyName: "Green Thumb Landscaping",
    category: "Landscaping",
    contact: "Carlos Ramirez",
    email: "carlos@greenthumblandscape.com",
    location: "Riverside, CA",
    fitReason: "Serves homeowners in the team's neighborhood. Field maintenance partnership could reduce team costs.",
    status: "new",
    notes: "",
    createdAt: "2026-01-27",
  },
  {
    id: "lead-14",
    companyName: "Valley Tech Repair",
    category: "Technology",
    contact: "Jason Wu",
    email: "jason@valleytechrepair.com",
    location: "Riverside, CA",
    fitReason: "Tech repair shop popular with families. Could sponsor a game-day photo/video setup or digital scoreboard.",
    status: "new",
    notes: "",
    createdAt: "2026-01-28",
  },
  {
    id: "lead-15",
    companyName: "Riverside Chiropractic Center",
    category: "Healthcare",
    contact: "Dr. Amy Liu",
    email: "info@riversidechiro.com",
    location: "Riverside, CA",
    fitReason: "Sports chiropractic focus. Great for wellness partnerships and pre-game stretching clinics.",
    status: "new",
    notes: "",
    createdAt: "2026-01-29",
  },
]

export const mockDrafts: OutreachDraft[] = [
  {
    id: "draft-1",
    leadId: "lead-1",
    emailSubject: "Sponsorship Opportunity - Riverside Thunder Youth Soccer",
    emailBody: `Dear team,

I'm Coach Martinez with the Riverside Thunder, a youth soccer club serving over 120 families in the Riverside community. We're reaching out to select local businesses about sponsorship opportunities for our upcoming 2026 season.

As a family-focused dental practice in our neighborhood, we believe there's a wonderful opportunity for mutual visibility. Our sponsorship packages include:

- Jersey logo placement (seen at 30+ games and tournaments)
- Banner display at home games
- Social media recognition to our 500+ follower community
- Mention in our season newsletter

We'd love to discuss a partnership. Would you have 15 minutes this week for a quick call?

Best regards,
Coach Martinez
Riverside Thunder Youth Soccer`,
    proposalText: `SPONSORSHIP PROPOSAL

Riverside Thunder Youth Soccer x Riverside Family Dentistry

ABOUT THE TEAM
The Riverside Thunder is a competitive youth soccer club with 120+ active families. We compete in the SoCal Club league with teams ages U8 through U14.

SPONSORSHIP TIERS
Gold ($2,500): Primary jersey logo, banner, social media, newsletter, event naming rights
Silver ($1,000): Jersey sleeve logo, banner, social media mention
Bronze ($500): Banner display, newsletter mention

PROJECTED VISIBILITY
- 30+ games per season
- 4 tournaments
- 500+ social media followers
- 120 family households

CONTACT
Coach Martinez | coach.martinez@gmail.com`,
    status: "sent",
    createdAt: "2026-01-15",
  },
  {
    id: "draft-2",
    leadId: "lead-2",
    emailSubject: "Partner with Riverside Thunder - Youth Fitness & Soccer",
    emailBody: `Hi Marcus,

I'm Coach Martinez from the Riverside Thunder youth soccer program. We noticed Iron Peak Fitness shares our passion for youth health and athletic development.

We're looking for local sponsors for our 2026 season and think Iron Peak would be an incredible partner. Our players and their families would benefit from knowing about your facility, and we can offer:

- Logo placement on team jerseys
- Dedicated social media shout-outs
- A "Fitness Partner" feature at our tournaments
- Cross-promotion opportunities

Would you be open to a brief conversation about how we could work together?

Thanks,
Coach Martinez`,
    proposalText: `SPONSORSHIP PROPOSAL

Riverside Thunder x Iron Peak Fitness

PARTNERSHIP VISION
A natural alliance between youth athletics and fitness. Iron Peak's brand on our jerseys sends a powerful message about health and community.

PACKAGE: GOLD SPONSOR ($2,500)
- Primary jersey placement
- "Official Fitness Partner" title
- Tournament booth space
- Social media features (monthly)
- Team discount for members' families

SEASON DETAILS
March - August 2026 | 30+ games | 4 tournaments`,
    status: "draft",
    createdAt: "2026-01-16",
  },
  {
    id: "draft-3",
    leadId: "lead-9",
    emailSubject: "Youth Sports Wellness Partnership - Riverside Thunder",
    emailBody: `Hi Nicole,

Coach Martinez here from the Riverside Thunder soccer club. As a sports-focused physical therapy clinic, Cascade PT seems like the perfect partner for our team.

We'd love to explore a sponsorship that goes beyond just logo placement. Imagine:

- Pre-season injury prevention workshops for our 120+ young athletes
- Sideline presence at weekend games
- Your logo on our jerseys and banners
- Parent education sessions on youth sports safety

This could be a meaningful partnership for the whole community. Can we chat this week?

Best,
Coach Martinez`,
    proposalText: `SPONSORSHIP PROPOSAL

Riverside Thunder x Cascade Physical Therapy

UNIQUE PARTNERSHIP
More than a logo - a true community health partnership.

INCLUDES
- Jersey logo placement
- 2 free injury prevention workshops per season
- Sideline PT station at home games
- Social media and newsletter features
- "Official Wellness Partner" designation

INVESTMENT: $1,500 (Silver+ Custom)`,
    status: "draft",
    createdAt: "2026-01-23",
  },
]

export const mockAssets: Asset[] = [
  {
    id: "asset-1",
    teamId: "team-1",
    type: "proposal",
    name: "Riverside Family Dentistry - Gold Proposal",
    url: "/assets/proposal-dentistry.pdf",
    createdAt: "2026-01-15",
  },
  {
    id: "asset-2",
    teamId: "team-1",
    type: "proposal",
    name: "Iron Peak Fitness - Gold Proposal",
    url: "/assets/proposal-fitness.pdf",
    createdAt: "2026-01-16",
  },
  {
    id: "asset-3",
    teamId: "team-1",
    type: "jersey-mockup",
    name: "Home Jersey - Teal Primary",
    url: "/assets/jersey-home.png",
    createdAt: "2026-01-10",
  },
  {
    id: "asset-4",
    teamId: "team-1",
    type: "jersey-mockup",
    name: "Away Jersey - Amber Accent",
    url: "/assets/jersey-away.png",
    createdAt: "2026-01-10",
  },
  {
    id: "asset-5",
    teamId: "team-1",
    type: "logo",
    name: "Riverside Thunder Logo",
    url: "/assets/team-logo.png",
    createdAt: "2026-01-05",
  },
]

export const mockLogs: AgentLog[] = [
  { id: "log-1", action: "lead_discovery", detail: "Discovered 15 potential sponsors near 92501", timestamp: "2026-01-15T10:00:00Z" },
  { id: "log-2", action: "outreach_generated", detail: "Generated email + proposal for Riverside Family Dentistry", timestamp: "2026-01-15T10:05:00Z" },
  { id: "log-3", action: "gmail_draft", detail: "Created Gmail draft for Riverside Family Dentistry", timestamp: "2026-01-15T10:06:00Z" },
  { id: "log-4", action: "outreach_generated", detail: "Generated email + proposal for Iron Peak Fitness", timestamp: "2026-01-16T09:00:00Z" },
  { id: "log-5", action: "lead_discovery", detail: "Added 3 new leads from expanded search radius", timestamp: "2026-01-20T14:00:00Z" },
]
