import Container from '../ui/Container'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50 py-10">
      <Container>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-900">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>Women</li>
              <li>Men</li>
              <li>Accessories</li>
              <li>Beauty</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-900">Help</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>FAQ</li>
              <li>Shipping</li>
              <li>Returns</li>
              <li>Order Status</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-900">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>About Us</li>
              <li>Careers</li>
              <li>Press</li>
              <li>Sustainability</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-900">Follow</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>Instagram</li>
              <li>Pinterest</li>
              <li>YouTube</li>
              <li>TikTok</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          © 2024 Fashion Mall. All rights reserved.
        </div>
      </Container>
    </footer>
  )
}
