import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { format } from 'date-fns';

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

export default function Blog() {
  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog/posts'],
    queryFn: async () => {
      const response = await fetch('/api/blog/posts?status=published');
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-nord-green">NordMail Blog</h1>
              <p className="text-gray-400 mt-2">Your guide to secure temporary email services</p>
            </div>
            <Link href="/" className="text-nord-green hover:text-nord-green/80">
              <Button variant="outline" className="border-nord-green text-nord-green hover:bg-nord-green hover:text-black">
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Back to NordMail
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-gray-900/50 border-gray-800 animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-800 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-800 rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !posts || posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-nord-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-nord-green" />
            </div>
            <h2 className="text-xl font-semibold text-gray-300 mb-2">No blog posts yet</h2>
            <p className="text-gray-500">Check back soon for helpful guides and tips about temporary email services.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <Card key={post.id} className="bg-gray-900/50 border-gray-800 hover:border-nord-green/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-white hover:text-nord-green transition-colors">
                        {post.title}
                      </CardTitle>
                      {post.excerpt && (
                        <CardDescription className="text-gray-400 mt-2 text-base">
                          {post.excerpt}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  
                  {/* Meta information */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-4">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {post.publishedAt 
                          ? format(new Date(post.publishedAt), 'MMM dd, yyyy')
                          : format(new Date(post.createdAt), 'MMM dd, yyyy')
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{Math.ceil(post.content.length / 1000)} min read</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className="bg-nord-green/20 text-nord-green border-nord-green/30"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>

                <CardContent>
                  <div className="prose prose-invert max-w-none">
                    {/* Show first few lines of content */}
                    <div 
                      className="text-gray-300 line-clamp-3"
                      dangerouslySetInnerHTML={{ 
                        __html: post.content.substring(0, 300) + (post.content.length > 300 ? '...' : '')
                      }}
                    />
                  </div>
                  
                  <Button 
                    className="mt-4 bg-nord-green text-black hover:bg-nord-green/90"
                    data-testid={`button-read-more-${post.id}`}
                    onClick={() => {
                      // For now, show full content in alert (can be replaced with modal or separate page)
                      const newWindow = window.open('', '_blank');
                      if (newWindow) {
                        newWindow.document.write(`
                          <html>
                            <head>
                              <title>${post.title} - NordMail Blog</title>
                              <style>
                                body { 
                                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                                  line-height: 1.6; 
                                  max-width: 800px; 
                                  margin: 0 auto; 
                                  padding: 2rem;
                                  background: #0f0f0f;
                                  color: #e4e4e7;
                                }
                                h1 { color: #8fbcbb; margin-bottom: 0.5rem; }
                                .meta { color: #9ca3af; font-size: 0.9rem; margin-bottom: 2rem; }
                                .content { line-height: 1.8; }
                                a { color: #8fbcbb; }
                                code { background: #1f2937; padding: 2px 4px; border-radius: 3px; }
                                pre { background: #1f2937; padding: 1rem; border-radius: 6px; overflow-x: auto; }
                              </style>
                            </head>
                            <body>
                              <h1>${post.title}</h1>
                              <div class="meta">
                                By ${post.author} • ${post.publishedAt 
                                  ? format(new Date(post.publishedAt), 'MMMM dd, yyyy')
                                  : format(new Date(post.createdAt), 'MMMM dd, yyyy')
                                }
                              </div>
                              <div class="content">${post.content}</div>
                            </body>
                          </html>
                        `);
                        newWindow.document.close();
                      }
                    }}
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-500">
          <p>© 2025 NordMail. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}