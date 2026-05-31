import { Navbar }            from '@/components/landing/Navbar'
import { HeroSection }       from '@/components/landing/HeroSection'
import { AgentsSection }     from '@/components/landing/AgentsSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { PricingSection }    from '@/components/landing/PricingSection'
import { FAQSection }        from '@/components/landing/FAQSection'
import { ContactSection }    from '@/components/landing/ContactSection'
import { Footer }            from '@/components/landing/Footer'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-shark-dark">
      <Navbar />
      <HeroSection />
      <AgentsSection />
      <HowItWorksSection />
      <PricingSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
