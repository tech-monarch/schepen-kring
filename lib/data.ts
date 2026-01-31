import {
  Inbox,
  DraftingCompassIcon as Drafts,
  Users,
  Archive,
  Trash2,
  Star,
  Mail,
  FileText,
  BarChart,
  Briefcase,
} from "lucide-react"

export const navLinks = [
  {
    name: "Mailboxes",
    icon: Mail,
    dropdown: [
      { name: "Inbox", href: "#" },
      { name: "Sent", href: "#" },
      { name: "Archived", href: "#" },
    ],
  },
  {
    name: "Docs",
    icon: FileText,
    dropdown: [
      { name: "Guides", href: "#" },
      { name: "API Reference", href: "#" },
    ],
  },
  {
    name: "Reports",
    icon: BarChart,
    dropdown: [
      { name: "Daily", href: "#" },
      { name: "Monthly", href: "#" },
    ],
  },
  {
    name: "Manage",
    icon: Briefcase,
    dropdown: [
      { name: "Users", href: "#" },
      { name: "Settings", href: "#" },
    ],
  },
]

export const sidebarLinks = [
  {
    name: "Unassigned",
    shortName: "Unassigned",
    icon: Inbox,
    count: 8,
    href: "#",
    category: "unassigned",
  },
  {
    name: "Mine",
    shortName: "Mine",
    icon: Star,
    count: 0,
    href: "#",
    category: "mine",
  },
  {
    name: "Drafts",
    shortName: "Drafts",
    icon: Drafts,
    count: 2,
    href: "#",
    category: "drafts",
  },
  {
    name: "Assigned",
    shortName: "Assigned",
    icon: Users,
    count: 10,
    href: "#",
    category: "assigned",
  },
  {
    name: "Closed",
    shortName: "Closed",
    icon: Archive,
    count: 0,
    href: "#",
    category: "closed",
  },
  {
    name: "Spam",
    shortName: "Spam",
    icon: Trash2,
    count: 3,
    href: "#",
    category: "spam",
  },
]

export const folders = [
  {
    name: "VIP Conversations",
    href: "#",
    category: "vip",
  },
  {
    name: "Waiting 2 Days",
    href: "#",
    category: "waiting",
  },
]

export const mailData = [
  {
    id: "1",
    customer: "Emanuel Larson",
    subject: "Re: Redeeming Gift Cards",
    snippet: "Hello, I was hoping to redeem a gift card, but didn't see a price",
    number: "169661",
    lastUpdated: "5:30 PM",
    tags: [],
    category: "unassigned",
    content: `
      <p>Hi Emanuel,</p>
      <p>Thanks for reaching out! To redeem your gift card, please visit our website and enter the code at checkout. If you have any issues, please reply to this email or call our support line.</p>
      <p>Best regards,<br/>J&G Clothing Support</p>
    `,
  },
  {
    id: "2",
    customer: "Matt Craig",
    subject: "Re: Shipping delay",
    snippet: "Okay, that sounds great... thank you!",
    number: "169659",
    lastUpdated: "4:54 PM",
    tags: [],
    category: "unassigned",
    content: `
      <p>Hi Matt,</p>
      <p>We apologize for the delay in your shipment. We've escalated your case and expect it to be delivered within the next 24 hours. You can track your order using this link: <a href="#">[Tracking Link]</a>. Thank you for your patience.</p>
      <p>Sincerely,<br/>J&G Clothing</p>
    `,
  },
  {
    id: "3",
    customer: "Cheryl Sullivan",
    subject: "Re: Belt Sizes?",
    snippet: "Do you guys happen to have a sizing chart for belts",
    number: "169646",
    lastUpdated: "2:51 PM",
    tags: [{ text: "Bulk", variant: "secondary" }],
    category: "assigned",
    content: `
      <p>Hi Cheryl,</p>
      <p>Yes, we do have a sizing chart for our belts! You can find it on our product page under the 'Size Guide' tab. If you need further assistance, feel free to ask!</p>
      <p>Thanks,<br/>J&G Clothing</p>
    `,
  },
  {
    id: "4",
    customer: "Betsy Green",
    subject: "Re: Holiday Promo?",
    snippet: "That's great! I'll keep an eye out for it in my inbox :)",
    number: "169648",
    lastUpdated: "5:30 PM",
    tags: [
      { text: "VIP", variant: "default" },
      { text: "Promotion", variant: "outline" },
    ],
    category: "vip",
    content: `
      <p>Hi Betsy,</p>
      <p>We're glad you're excited about our holiday promo! We'll be sending out the details soon. Make sure to check your inbox for exclusive offers. Happy holidays!</p>
      <p>J&G Clothing</p>
    `,
  },
  {
    id: "5",
    customer: "Kathryn Gibbs",
    subject: "Newsletter signup?",
    snippet: "Hi guys, did I miss a newsletter signup on my blog? I'd love",
    number: "169188",
    lastUpdated: "1:34 PM",
    tags: [],
    category: "unassigned",
    content: `
      <p>Hi Kathryn,</p>
      <p>Thanks for your interest in our newsletter! You can sign up directly on our blog page. We send out updates on new arrivals, sales, and exclusive content. Let us know if you have any trouble signing up.</p>
      <p>Best,<br/>J&G Clothing</p>
    `,
  },
  {
    id: "6",
    customer: "Jonathan Alison",
    subject: "Re: Linen Ties?",
    snippet: "Do you think you guys can ship them to me by the end of the week",
    number: "169633",
    lastUpdated: "12:10 PM",
    tags: [],
    category: "waiting",
    content: `
      <p>Hi Jonathan,</p>
      <p>We can definitely ship the linen ties to you by the end of the week. Please confirm your order details and shipping address, and we'll get it processed right away.</p>
      <p>Thanks,<br/>J&G Clothing</p>
    `,
  },
  {
    id: "7",
    customer: "Tamara Ferguson",
    subject: "Bulk Pricing",
    snippet: "Can I see a pricing list for bulk quantities on knit shirts?",
    number: "169643",
    lastUpdated: "11:09 AM",
    tags: [{ text: "Bulk", variant: "secondary" }],
    category: "assigned",
    content: `
      <p>Hi Tamara,</p>
      <p>For bulk pricing on knit shirts, please provide us with the specific quantities and styles you're interested in. We'll then send you a customized quote. Looking forward to hearing from you!</p>
      <p>Regards,<br/>J&G Clothing</p>
    `,
  },
  {
    id: "8",
    customer: "Greg Davis",
    subject: "Re: Broken glasses",
    snippet: "Okay sounds good. I can get them shipped back by friday",
    number: "169641",
    lastUpdated: "9:40 AM",
    tags: [],
    category: "closed",
    content: `
      <p>Hi Greg,</p>
      <p>We've processed your return for the broken glasses. A replacement pair has been shipped and should arrive by Friday. We apologize for the inconvenience. Please let us know if you have any other questions.</p>
      <p>Sincerely,<br/>J&G Clothing</p>
    `,
  },
]

export const PRIMARY_TAB_COUNT = 4 // Number of tabs to show directly in the bottom bar
