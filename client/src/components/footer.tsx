import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-foreground text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <i className="fas fa-parking text-primary text-2xl"></i>
              <span className="text-xl font-bold">Parq</span>
            </div>
            <p className="text-gray-300 mb-4">Making parking easy and affordable for everyone.</p>
            <div className="flex space-x-4">
              <i className="fab fa-facebook text-xl hover:text-primary cursor-pointer transition-colors" data-testid="link-facebook"></i>
              <i className="fab fa-twitter text-xl hover:text-primary cursor-pointer transition-colors" data-testid="link-twitter"></i>
              <i className="fab fa-instagram text-xl hover:text-primary cursor-pointer transition-colors" data-testid="link-instagram"></i>
              <i className="fab fa-linkedin text-xl hover:text-primary cursor-pointer transition-colors" data-testid="link-linkedin"></i>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/careers" className="hover:text-white transition-colors" data-testid="link-careers">Careers</Link></li>
              <li><Link href="/press" className="hover:text-white transition-colors" data-testid="link-press">Press</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors" data-testid="link-blog">Blog</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/help" className="hover:text-white transition-colors" data-testid="link-help">Help Center</Link></li>
              <li><Link href="/safety" className="hover:text-white transition-colors" data-testid="link-safety">Safety</Link></li>
              <li><Link href="/help" className="hover:text-white transition-colors" data-testid="link-contact">Contact Us</Link></li>
              <li><Link href="/safety" className="hover:text-white transition-colors" data-testid="link-trust">Safety</Link></li>
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h4 className="font-semibold mb-4">Hosting</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/list-space" className="hover:text-white transition-colors" data-testid="link-list-space-footer">
                  List Your Space
                </Link>
              </li>
              <li><Link href="/help" className="hover:text-white transition-colors" data-testid="link-host-resources">Host Resources</Link></li>
              <li><Link href="/help" className="hover:text-white transition-colors" data-testid="link-host-community">Host Community</Link></li>
              <li><Link href="/safety" className="hover:text-white transition-colors" data-testid="link-responsible-hosting">Safe Hosting</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-300">&copy; 2024 Parq, Inc. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors" data-testid="link-privacy">Privacy</Link>
            <Link href="/terms" className="text-gray-300 hover:text-white transition-colors" data-testid="link-terms">Terms</Link>
            <Link href="/search" className="text-gray-300 hover:text-white transition-colors" data-testid="link-sitemap">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
