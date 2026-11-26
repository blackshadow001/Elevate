import Link from "next/link";
import { Mail, Globe, MessageCircle, ExternalLink, Share2, Sparkles, Award, ShieldCheck, Code2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { brand } from "@/lib/brand";
import { FOOTER_DIRECTORY_COLUMNS } from "@/data/megaMenuData";

export function Footer() {
  return (
    <footer className="bg-[#172033] text-white pt-14 pb-12 border-t border-[#26344D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top SEO Directory: Explore top skills and certifications (from reference) */}
        <section className="pb-12 mb-12 border-b border-[#26344D]" aria-label="Top skills and certifications">
          <h3 className="text-base font-bold text-white mb-8 tracking-tight">
            Explore top skills and certifications
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
            {FOOTER_DIRECTORY_COLUMNS.map((col, idx) => (
              <div key={idx} className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/95">
                  {col.title}
                </h4>
                <ul className="space-y-2 text-xs text-[#94A3B8]">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link
                        href={link.href}
                        className="hover:text-white transition-colors duration-150 inline-block py-0.5"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Middle Columns: Brand & Company Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Logo inverse size="large" />
            <p className="text-[#94A3B8] text-xs sm:text-sm leading-relaxed max-w-sm">
              {brand.tagline} Master in-demand AI, software engineering, cloud, and business skills with top industry practitioners and hands-on coding practice.
            </p>
            <div className="flex items-center gap-3 pt-2 text-[#94A3B8]">
              <Link href="/community" className="w-8 h-8 rounded-full bg-[#26344D] flex items-center justify-center hover:text-white hover:bg-[#FF6B35] transition-colors" aria-label="Community updates">
                <Share2 className="w-3.5 h-3.5" />
              </Link>
              <Link href="/community" className="w-8 h-8 rounded-full bg-[#26344D] flex items-center justify-center hover:text-white hover:bg-[#FF6B35] transition-colors" aria-label="Community">
                <MessageCircle className="w-3.5 h-3.5" />
              </Link>
              <Link href="/contact" className="w-8 h-8 rounded-full bg-[#26344D] flex items-center justify-center hover:text-white hover:bg-[#FF6B35] transition-colors" aria-label="Contact support">
                <Mail className="w-3.5 h-3.5" />
              </Link>
              <Link href="/" className="w-8 h-8 rounded-full bg-[#26344D] flex items-center justify-center hover:text-white hover:bg-[#FF6B35] transition-colors" aria-label="Elevate home">
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* About */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/95">About</h4>
            <ul className="space-y-2 text-xs text-[#94A3B8]">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Engineering Blog</Link></li>
              <li><Link href="/instructor/apply" className="hover:text-white transition-colors">Teach on Elevate</Link></li>
            </ul>
          </div>

          {/* Discover Elevate */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/95">Discover Elevate</h4>
            <ul className="space-y-2 text-xs text-[#94A3B8]">
              <li><Link href="/practice" className="hover:text-white transition-colors">Practice Platform</Link></li>
              <li><Link href="/practice/codearena" className="hover:text-white transition-colors">CodeArena 100 Lvls</Link></li>
              <li><Link href="/career-paths" className="hover:text-white transition-colors">Career Accelerators</Link></li>
              <li><Link href="/live" className="hover:text-white transition-colors">Live Interactive Classes</Link></li>
              <li><Link href="/certificates/verify" className="hover:text-white transition-colors">Verify Certificate</Link></li>
            </ul>
          </div>

          {/* Elevate for Business & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/95">Elevate for Business</h4>
            <ul className="space-y-2 text-xs text-[#94A3B8]">
              <li><Link href="/personal-plan" className="hover:text-white transition-colors">Personal Plan Subscriptions</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Enterprise Team Training</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/help" className="hover:text-white transition-colors">Accessibility Statement</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#26344D] flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center text-xs text-[#94A3B8] gap-4">
          <p className="text-center lg:text-left lg:justify-self-start">
            © 2026 {brand.name}. All rights reserved.
          </p>
          <p className="text-center lg:justify-self-center">
            Powered by{" "}
            <a
              href="https://www.gentizeinnovations.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white/90 hover:text-[#FF6B35] underline decoration-[#475569] underline-offset-4 transition-colors"
            >
              Gentize
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-x-6 gap-y-2 lg:justify-self-end">
            <span className="flex items-center gap-1.5 text-white/80">
              <Globe className="w-3.5 h-3.5 text-[#FF6B35]" aria-hidden="true" />
              English (India) · INR (₹)
            </span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
