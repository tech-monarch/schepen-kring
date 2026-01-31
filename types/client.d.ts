export interface ClientHomepageData {
    id: string
    name: string
    logoUrl: string
    seoTitle: string
    seoDescription: string
    introText: string
    aiGeneratedContent: {
      title: string
      paragraphs: string[]
    }
    whatsappLink: string
    contactInfo: {
      email: string
      phone: string
      address: string
    }
    pages: {
      slug: string
      title: string
      aiText: string
    }[]
  }
  
  export interface DomainStatus {
    clientName: string
    domain: string
    status: "Active" | "Pending DNS" | "Error" | "Registered"
    lastUpdated: string
  }
  