'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { legalPagesService, LegalPage } from '@/lib/legalPages';
import { useTranslations } from '@/hooks/useTranslations';
import { Edit, Save, X, Clock, User } from 'lucide-react';

// Mock user role - in real app, this would come from auth context
const mockUserRole = 'admin';

export default function LegalPageClient() {
  const [page, setPage] = useState<LegalPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [saving, setSaving] = useState(false);
  
  const params = useParams();
  const locale = useLocale();
  const slug = params.slug as string;
  const t = useTranslations();

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        setError(null);
        const pageData = await legalPagesService.getPageBySlug(slug, locale);
        setPage(pageData);
        setEditContent(pageData?.content || '');
        setEditTitle(pageData?.title || '');
      } catch (err) {
        console.error('Error fetching legal page:', err);
        setError('Failed to load legal page');
      } finally {
        setLoading(false);
      }
    };

    if (slug && locale) {
      fetchPage();
    }
  }, [slug, locale]);

  const handleEdit = () => {
    if (page) {
      setIsEditing(true);
      setEditContent(page.content);
      setEditTitle(page.title);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(page?.content || '');
    setEditTitle(page?.title || '');
  };

  const handleSave = async () => {
    if (!page) return;

    try {
      setSaving(true);
      await legalPagesService.updatePage(page.slug, locale, {
        title: editTitle,
        content: editContent,
      });

      // Refresh the page data
      const updatedPage = await legalPagesService.getPageBySlug(slug, locale);
      setPage(updatedPage);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving legal page:', err);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600">
            {error || 'The requested legal page could not be found.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-600 w-full"
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
              )}
            </div>
            
            {mockUserRole === 'admin' && (
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Last updated: {new Date(page.last_updated_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>Status: {page.is_active ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter page content..."
            />
          ) : (
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
