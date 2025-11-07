export default function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-4">ServiceHub</h3>
            <p className="text-sm opacity-80">Connecting communities with trusted services for sustainable living.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <a href="#" className="hover:opacity-100 transition">
                  Plumbing
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100 transition">
                  Electrical
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100 transition">
                  Repair
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <a href="#" className="hover:opacity-100 transition">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100 transition">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100 transition">
                  Blog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <a href="#" className="hover:opacity-100 transition">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100 transition">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm opacity-80">
          <p>&copy; 2025 ServiceHub. Built for sustainable communities.</p>
        </div>
      </div>
    </footer>
  )
}
