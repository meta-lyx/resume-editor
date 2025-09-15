import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Eye, Download, ArrowRight } from 'lucide-react';

// Mock resume template data
const resumeTemplates = [
  {
    id: 1,
    name: 'Modern Minimalist',
    category: 'General',
    imageUrl: '/images/templates/template-1.jpg',
    popular: true,
  },
  {
    id: 2,
    name: 'Professional Business',
    category: 'Business',
    imageUrl: '/images/templates/template-2.jpg',
    popular: false,
  },
  {
    id: 3,
    name: 'Creative Design',
    category: 'Creative',
    imageUrl: '/images/templates/template-3.jpg',
    popular: true,
  },
  {
    id: 4,
    name: 'Tech Professional',
    category: 'Technology',
    imageUrl: '/images/templates/template-4.jpg',
    popular: false,
  },
  {
    id: 5,
    name: 'Executive Leadership',
    category: 'Management',
    imageUrl: '/images/templates/template-5.jpg',
    popular: true,
  },
  {
    id: 6,
    name: 'Entry Level',
    category: 'Graduate',
    imageUrl: '/images/templates/template-6.jpg',
    popular: false,
  },
];

const categories = ['All', 'General', 'Business', 'Creative', 'Technology', 'Management', 'Graduate'];

export function TemplatesPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // 根据筛选条件过滤模板
  const filteredTemplates = resumeTemplates.filter((template) => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Resume Templates</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Browse our collection of professional resume templates, all ATS-tested and optimized to help you stand out.
        </p>
      </div>

      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${selectedCategory === category ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="w-full md:w-auto">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No templates found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
              <div className="relative">
                <img
                  src={template.imageUrl}
                  alt={template.name}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-3">
                    <Button size="sm" variant="outline" className="bg-white">
                      <Eye className="h-4 w-4 mr-1" /> Preview
                    </Button>
                    {user ? (
                      <Button size="sm" className="bg-primary">
                        <Download className="h-4 w-4 mr-1" /> Use
                      </Button>
                    ) : (
                      <Link to="/login">
                        <Button size="sm" className="bg-primary">
                          <Download className="h-4 w-4 mr-1" /> Use
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
                {template.popular && (
                  <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
                    Popular
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                <p className="text-gray-500 text-sm">Category: {template.category}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-16 text-center bg-primary/5 py-12 px-4 rounded-xl border border-primary/10">
        <h2 className="text-2xl font-bold mb-4">Can't find the right template?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          No matter which template you choose, our AI optimization tool can help you improve your resume quality. Start optimizing your resume content today!
        </p>
        {user ? (
          <Link to="/dashboard">
            <Button className="px-6">
              Start Optimizing Resume <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Link to="/login">
            <Button className="px-6">
              Try Free Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
