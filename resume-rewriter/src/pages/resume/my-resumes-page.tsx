import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { getUserResumes } from '@/services/resume-service';
import { FileText, ChevronRight, Calendar, Clock, Plus } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';

export function MyResumesPage() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResumes() {
      if (!user) return;

      try {
        const resumesData = await getUserResumes(user.id);
        setResumes(resumesData);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load resume list');
      } finally {
        setLoading(false);
      }
    }

    loadResumes();
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Resumes</h1>
        <Link to="/dashboard">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Resume
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">You don't have any saved resumes yet</h2>
          <p className="text-gray-500 mb-6">Start creating your resume to optimize it with artificial intelligence.</p>
          <Link to="/dashboard">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Resume
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {resumes.map((resume) => (
            <Link
              key={resume.id}
              to={`/optimize/${resume.id}`}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex justify-between items-center"
            >
              <div>
                <h2 className="text-xl font-medium mb-2">{resume.title}</h2>
                <div className="flex items-center text-gray-500 text-sm space-x-4">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Created on {formatDate(resume.created_at)}
                  </span>
                  {resume.updated_at && resume.updated_at !== resume.created_at && (
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Updated on {formatDate(resume.updated_at)}
                    </span>
                  )}
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {resume.optimized_content ? 'Optimized' : 'Draft'}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
