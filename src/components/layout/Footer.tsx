import Link from "next/link";
import { Mail, Globe, MessageCircle, ExternalLink, Share2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { brand } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="bg-[#172033] text-white pt-16 pb-12 border-t border-[#26344D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-14">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Logo inverse size="large" />
            <p className="text-[#94A3B8] text-sm leading-relaxed max-w-sm">
              {brand.tagline} Explore in-demand technical, design, and career skills with experienced instructors.
            </p>
            <div className="flex items-center gap-3 pt-2 text-[#94A3B8]">
              <Link href="/community" className="w-9 h-9 rounded-full bg-[#26344D] flex items-center justify-center hover:text-white hover:bg-[#FF6B35] transition-colors" aria-label="Community updates">
                <Share2 className="w-4 h-4" />
              </Link>
              <Link href="/community" className="w-9 h-9 rounded-full bg-[#26344D] flex items-center justify-center hover:text-white hover:bg-[#FF6B35] transition-colors" aria-label="Community">
                <MessageCircle className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="w-9 h-9 rounded-full bg-[#26344D] flex items-center justify-center hover:text-white hover:bg-[#FF6B35] transition-colors" aria-label="Contact support">
                <Mail className="w-4 h-4" />
              </Link>
              <Link href="/" className="w-9 h-9 rounded-full bg-[#26344D] flex items-center justify-center hover:text-white hover:bg-[#FF6B35] transition-colors" aria-label="Elevate home">
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Column: Platform */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-white/90">Platform</h4>
            <ul className="space-y-2.5 text-sm text-[#94A3B8]">
              <li>
                <Link href="/courses" className="hover:text-white transition-colors">All Courses</Link>
              </li>
              <li>
                <Link href="/career-paths" className="hover:text-white transition-colors">Career Paths</Link>
              </li>
              <li>
                <Link href="/programs/beginner" className="hover:text-white transition-colors">Beginner Programs</Link>
              </li>
              <li>
                <Link href="/instructor/apply" className="hover:text-white transition-colors">Become an Instructor</Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">Student Portal</Link>
              </li>
            </ul>
          </div>

          {/* Column: Resources */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-white/90">Resources</h4>
            <ul className="space-y-2.5 text-sm text-[#94A3B8]">
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">Engineering Blog</Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-white transition-colors">Community</Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white transition-colors">Help Center</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link>
              </li>
              <li>
                <Link href="/certificates/verify" className="hover:text-white transition-colors">Verify Certificate</Link>
              </li>
            </ul>
          </div>

          {/* Column: Company */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-white/90">Company</h4>
            <ul className="space-y-2.5 text-sm text-[#94A3B8]">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">About {brand.name}</Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white transition-colors">Careers <span className="text-[10px] bg-[#FF6B35] text-white px-1.5 py-0.5 rounded font-bold ml-1">HIRING</span></Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#26344D] flex flex-col sm:flex-row items-center justify-between text-xs text-[#94A3B8] gap-4">
          <p>© 2026 {brand.name}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#FF6B35]" />
              English (India) · INR (₹)
            </span>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/faq" className="hover:text-white">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
