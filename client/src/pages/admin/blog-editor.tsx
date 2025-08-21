import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Eye, Globe, X } from 'lucide-react';
import { Link } from 'wouter';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  status: string;
  author: string;
  tags: string[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function BlogEditor() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute('/nordmail-admin/blog/:action/:id?');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const isEdit = params?.action === 'edit' && params?.id;
  const postId = params?.id;
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    status: 'draft',
    author: 'Admin',
    tags: [] as string[],
    metaTitle: '',
    metaDescription: '',
  });
  
  const [tagInput, setTagInput] = useState('');

  // Fetch existing post if editing
  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ['/api/admin/blog/posts', postId],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/blog/posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch blog post');
      }
      return response.json();
    },
    enabled: !!isEdit && !!postId,
  });

  // Load post data into form when editing
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt || '',
        featuredImage: post.featuredImage || '',
        status: post.status,
        author: post.author,
        tags: post.tags || [],
        metaTitle: post.metaTitle || '',
        metaDescription: post.metaDescription || '',
      });
    }
  }, [post]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !isEdit) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, isEdit]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = localStorage.getItem('admin_token');
      const url = isEdit ? `/api/admin/blog/posts/${postId}` : '/api/admin/blog/posts';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          publishedAt: data.status === 'published' ? new Date().toISOString() : null,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save blog post');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: isEdit ? 'Post Updated' : 'Post Created',
        description: `Blog post has been ${isEdit ? 'updated' : 'created'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/posts'] });
      navigate('/nordmail-admin/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: 'Save Failed',
        description: error.message || 'Failed to save blog post',
        variant: 'destructive',
      });
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast({
        title: 'Missing Information',
        description: 'Title and content are required',
        variant: 'destructive',
      });
      return;
    }
    saveMutation.mutate(formData);
  };

  const handlePublish = () => {
    if (!formData.title || !formData.content) {
      toast({
        title: 'Missing Information',
        description: 'Title and content are required',
        variant: 'destructive',
      });
      return;
    }
    
    const publishData = {
      ...formData,
      status: 'published',
      publishedAt: new Date().toISOString()
    };
    
    saveMutation.mutate(publishData);
  };

  if (isEdit && isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nord-green mx-auto mb-4" />
          <p className="text-gray-400">Loading blog post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link href="/nordmail-admin/dashboard">
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">
              {isEdit ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => handleInputChange('status', formData.status === 'draft' ? 'published' : 'draft')}
              className={formData.status === 'published' 
                ? 'border-green-600 text-green-400' 
                : 'border-yellow-600 text-yellow-400'
              }
              data-testid="button-toggle-status"
            >
              {formData.status === 'published' ? (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Published
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Draft
                </>
              )}
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={saveMutation.isPending}
              className="bg-nord-green text-black hover:bg-nord-green/90"
              data-testid="button-save-post"
            >
              {saveMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Post
                </>
              )}
            </Button>
            
            {formData.status === 'draft' && (
              <Button
                onClick={handlePublish}
                disabled={saveMutation.isPending}
                className="bg-green-600 text-white hover:bg-green-600/90"
                data-testid="button-publish-post"
              >
                <Globe className="w-4 h-4 mr-2" />
                Publish
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title & Slug */}
              <Card className="bg-black/30 border-gray-800/50">
                <CardHeader>
                  <CardTitle>Post Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                      placeholder="Enter blog post title"
                      required
                      data-testid="input-post-title"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-gray-300">Slug</Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                      placeholder="post-url-slug"
                      data-testid="input-post-slug"
                    />
                    <p className="text-xs text-gray-500 mt-1">URL: /blog/{formData.slug}</p>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300">Content *</Label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white mt-1 min-h-[400px]"
                      placeholder="Write your blog post content here..."
                      required
                      data-testid="textarea-post-content"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-gray-300">Excerpt</Label>
                    <Textarea
                      value={formData.excerpt}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                      placeholder="Brief summary for previews..."
                      rows={3}
                      data-testid="textarea-post-excerpt"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Post Settings */}
              <Card className="bg-black/30 border-gray-800/50">
                <CardHeader>
                  <CardTitle>Post Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Author</Label>
                    <Input
                      value={formData.author}
                      onChange={(e) => handleInputChange('author', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                      data-testid="input-post-author"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-gray-300">Featured Image URL</Label>
                    <Input
                      value={formData.featuredImage}
                      onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                      placeholder="https://example.com/image.jpg"
                      data-testid="input-post-image"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card className="bg-black/30 border-gray-800/50">
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="bg-gray-800 border-gray-700 text-white flex-1"
                      placeholder="Add tag"
                      data-testid="input-add-tag"
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      variant="outline"
                      className="border-gray-600"
                      data-testid="button-add-tag"
                    >
                      Add
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-nord-green/20 text-nord-green border-nord-green/30 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                        data-testid={`tag-${tag}`}
                      >
                        {tag}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* SEO */}
              <Card className="bg-black/30 border-gray-800/50">
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                  <CardDescription>Optimize for search engines</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Meta Title</Label>
                    <Input
                      value={formData.metaTitle}
                      onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                      placeholder="SEO title (60 chars max)"
                      maxLength={60}
                      data-testid="input-meta-title"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-gray-300">Meta Description</Label>
                    <Textarea
                      value={formData.metaDescription}
                      onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                      placeholder="SEO description (160 chars max)"
                      maxLength={160}
                      rows={3}
                      data-testid="textarea-meta-description"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}