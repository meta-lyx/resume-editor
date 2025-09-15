import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Resume Builder</h3>
            <p className="text-gray-600 mb-4">Professional AI-powered resume building tailored for specific job descriptions.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary">Home</Link>
              </li>
              <li>
                <Link to="/features" className="text-gray-600 hover:text-primary">Features</Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 hover:text-primary">Pricing</Link>
              </li>
              <li>
                <Link to="/templates" className="text-gray-600 hover:text-primary">Templates</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Help Center</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-primary">FAQ</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-primary">Contact Us</Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 hover:text-primary">Blog</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-primary">Terms of Use</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-primary">Privacy Policy</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Resume Builder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
