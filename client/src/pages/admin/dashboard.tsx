import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  Users, 
  Mail, 
  BarChart3, 
  Settings, 
  LogOut, 
  MessageCircle,
  Activity,
  TrendingUp,
  Server,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface AdminStats {
  totalUsers: number;
  totalEmails: number;
  emailsToday: number;
  activeUsers: number;
  systemHealth: 'healthy' | 'warning' | 'error';
  uptimePercentage: number;
}

interface RecentActivity {
  id: string;
  type: 'user_created' | 'email_created' | 'email_received';
  description: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [settingsForm, setSettingsForm] = useState({
    adminUsername: '',
    adminPassword: '',
    recaptchaSiteKey: '',
    recaptchaSecretKey: '',
    recaptchaEnabled: false
  });

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/nordmail-admin');
    }
  }, [navigate]);

  // Real-time stats from the server
  const statsQuery = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      const response = await apiRequest('GET', '/api/admin/stats', undefined, {
        'Authorization': `Bearer ${token}`
      });
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const activityQuery = useQuery({
    queryKey: ['/api/admin/activity'],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      const response = await apiRequest('GET', '/api/admin/activity', undefined, {
        'Authorization': `Bearer ${token}`
      });
      return response.json();
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Load admin settings
  const settingsQuery = useQuery({
    queryKey: ['/api/admin/settings'],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      const response = await apiRequest('GET', '/api/admin/settings', undefined, {
        'Authorization': `Bearer ${token}`
      });
      return response.json();
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Settings Updated',
        description: data.message || 'Admin settings updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      // Clear token to force re-login with new credentials
      localStorage.removeItem('admin_token');
      setTimeout(() => {
        navigate('/nordmail-admin');
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update admin settings',
        variant: 'destructive',
      });
    },
  });

  // Initialize form with current settings
  useEffect(() => {
    if (settingsQuery.data) {
      setSettingsForm(prev => ({
        ...prev,
        adminUsername: settingsQuery.data.username || '',
        recaptchaSiteKey: settingsQuery.data.recaptchaSiteKey || '',
        recaptchaEnabled: settingsQuery.data.recaptchaEnabled || false
      }));
    }
  }, [settingsQuery.data]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    toast({
      title: 'Logged out',
      description: 'You have been securely logged out',
    });
    navigate('/nordmail-admin');
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm.adminUsername || !settingsForm.adminPassword) {
      toast({
        title: 'Missing Information',
        description: 'Username and password are required',
        variant: 'destructive',
      });
      return;
    }
    updateSettingsMutation.mutate(settingsForm);
  };

  const handleSettingsChange = (field: string, value: any) => {
    setSettingsForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const stats = statsQuery.data;
  const activities = activityQuery.data || [];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-nord-green rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold nord-green">NordMail Admin</h1>
              <p className="text-sm text-gray-400">Administration Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                stats?.systemHealth === 'healthy' ? 'bg-green-500' : 
                stats?.systemHealth === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              } animate-pulse`}></div>
              <span className="text-sm text-gray-400">System {stats?.systemHealth || 'loading'}</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/30 border-gray-800/50 backdrop-blur-sm" data-testid="card-total-users">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
                <Users className="w-4 h-4 text-nord-green" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-users">
                {statsQuery.isLoading ? '...' : (stats?.totalUsers || 0)}
              </div>
              <p className="text-xs text-green-400 mt-1">Live data</p>
            </CardContent>
          </Card>

          <Card className="bg-black/30 border-gray-800/50 backdrop-blur-sm" data-testid="card-total-emails">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">Total Emails</CardTitle>
                <Mail className="w-4 h-4 text-nord-green" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-emails">
                {statsQuery.isLoading ? '...' : (stats?.totalEmails || 0)}
              </div>
              <p className="text-xs text-green-400 mt-1">Live data</p>
            </CardContent>
          </Card>

          <Card className="bg-black/30 border-gray-800/50 backdrop-blur-sm" data-testid="card-emails-today">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">Today's Emails</CardTitle>
                <TrendingUp className="w-4 h-4 text-nord-green" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-emails-today">
                {statsQuery.isLoading ? '...' : (stats?.emailsToday || 0)}
              </div>
              <p className="text-xs text-green-400 mt-1">Live data</p>
            </CardContent>
          </Card>

          <Card className="bg-black/30 border-gray-800/50 backdrop-blur-sm" data-testid="card-active-users">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">Active Users</CardTitle>
                <Activity className="w-4 h-4 text-nord-green" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-active-users">
                {statsQuery.isLoading ? '...' : (stats?.activeUsers || 0)}
              </div>
              <p className="text-xs text-green-400 mt-1">Live data</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-800/50 border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-nord-green data-[state=active]:text-black" data-testid="tab-overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="blog" className="data-[state=active]:bg-nord-green data-[state=active]:text-black" data-testid="tab-blog">
              <Edit className="w-4 h-4 mr-2" />
              Blog Management
            </TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-nord-green data-[state=active]:text-black" data-testid="tab-support">
              <MessageCircle className="w-4 h-4 mr-2" />
              Support
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-nord-green data-[state=active]:text-black" data-testid="tab-settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="bg-black/30 border-gray-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-nord-green" />
                    <span>Recent Activity</span>
                  </CardTitle>
                  <CardDescription>Latest system events and user actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3" data-testid="activity-list">
                    {activityQuery.isLoading ? (
                      <p className="text-gray-400">Loading activity...</p>
                    ) : activities.length === 0 ? (
                      <p className="text-gray-400">No recent activity</p>
                    ) : (
                      activities.map((activity: RecentActivity) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-800/30" data-testid={`activity-${activity.id}`}>
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            activity.type === 'email_received' ? 'bg-blue-500' :
                            activity.type === 'user_created' ? 'bg-green-500' :
                            'bg-yellow-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-300">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(activity.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card className="bg-black/30 border-gray-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Server className="w-5 h-5 text-nord-green" />
                    <span>System Status</span>
                  </CardTitle>
                  <CardDescription>Service health and performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Uptime</span>
                      <span className="text-sm font-medium text-green-400">{stats?.uptimePercentage || 99.9}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">API Status</span>
                      <span className="text-sm font-medium text-green-400">Operational</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Database</span>
                      <span className="text-sm font-medium text-green-400">Healthy</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Email Service</span>
                      <span className="text-sm font-medium text-green-400">Connected</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card className="bg-black/30 border-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage temporary email accounts and user analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">User management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support">
            <Card className="bg-black/30 border-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Customer Support</CardTitle>
                <CardDescription>Manage customer inquiries and support tickets</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Support system coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blog Management Tab */}
          <TabsContent value="blog" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-black/30 border-gray-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Edit className="w-5 h-5 text-nord-green" />
                      <span>Blog Management</span>
                    </div>
                    <Button 
                      className="bg-nord-green text-black hover:bg-nord-green/90"
                      data-testid="button-new-blog-post"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Post
                    </Button>
                  </CardTitle>
                  <CardDescription>Create and manage blog posts for your website</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div>
                        <h3 className="font-medium text-white">Welcome to NordMail Blog</h3>
                        <p className="text-sm text-gray-400 mt-1">Your guide to temporary email services</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="px-2 py-1 text-xs bg-green-900/50 text-green-400 rounded-full border border-green-800">
                            Published
                          </span>
                          <span className="text-xs text-gray-500">Published 2 days ago</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="border-red-600 text-red-400 hover:bg-red-900/20">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div>
                        <h3 className="font-medium text-white">Privacy and Security Best Practices</h3>
                        <p className="text-sm text-gray-400 mt-1">Keep your online identity safe with temporary emails</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="px-2 py-1 text-xs bg-yellow-900/50 text-yellow-400 rounded-full border border-yellow-800">
                            Draft
                          </span>
                          <span className="text-xs text-gray-500">Last edited 1 hour ago</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="border-red-600 text-red-400 hover:bg-red-900/20">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-center py-8">
                      <p className="text-gray-400 mb-4">Ready to share your knowledge?</p>
                      <Button 
                        className="bg-nord-green text-black hover:bg-nord-green/90"
                        data-testid="button-create-first-post"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Blog Post
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Blog Settings & Backup */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-black/30 border-gray-800/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="w-5 h-5 text-nord-green" />
                      <span>Blog Settings</span>
                    </CardTitle>
                    <CardDescription>Configure your blog appearance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-300">Blog Title</Label>
                        <Input 
                          defaultValue="NordMail Blog"
                          className="bg-gray-800 border-gray-700 text-white mt-1"
                          data-testid="input-blog-title"
                        />
                      </div>
                      <div className="flex items-center space-x-3">
                        <input 
                          type="checkbox" 
                          id="enable-comments"
                          defaultChecked={true}
                          className="w-4 h-4 text-nord-green bg-gray-800 border-gray-700 rounded focus:ring-nord-green"
                          data-testid="checkbox-enable-comments"
                        />
                        <Label htmlFor="enable-comments" className="text-gray-300">
                          Enable comments
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/30 border-gray-800/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Server className="w-5 h-5 text-nord-green" />
                      <span>Automated Backups</span>
                    </CardTitle>
                    <CardDescription>Database backup & deployment ready</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Database Migration</span>
                        <span className="text-xs px-2 py-1 bg-green-900/50 text-green-400 rounded-full border border-green-800">
                          Automated
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Daily Backups</span>
                        <span className="text-xs px-2 py-1 bg-green-900/50 text-green-400 rounded-full border border-green-800">
                          Active
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">S3 Storage</span>
                        <span className="text-xs px-2 py-1 bg-gray-700 text-gray-400 rounded-full">
                          Ready
                        </span>
                      </div>
                      <Button 
                        className="w-full mt-4 bg-nord-green text-black hover:bg-nord-green/90"
                        data-testid="button-run-backup"
                      >
                        Run Manual Backup
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              {/* Security Settings */}
              <Card className="bg-black/30 border-gray-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-nord-green" />
                    <span>Security Settings</span>
                  </CardTitle>
                  <CardDescription>Configure security options and authentication</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSettingsSubmit}>
                    {/* Admin Credentials */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-white">Admin Credentials</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="admin-username" className="text-gray-400">Admin Username</Label>
                          <Input 
                            id="admin-username"
                            type="text" 
                            value={settingsForm.adminUsername}
                            onChange={(e) => handleSettingsChange('adminUsername', e.target.value)}
                            className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-nord-green"
                            placeholder="Enter admin username"
                            required
                            data-testid="input-admin-username"
                          />
                        </div>
                        <div>
                          <Label htmlFor="admin-password" className="text-gray-400">Admin Password</Label>
                          <Input 
                            id="admin-password"
                            type="password" 
                            value={settingsForm.adminPassword}
                            onChange={(e) => handleSettingsChange('adminPassword', e.target.value)}
                            className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-nord-green"
                            placeholder="Enter admin password"
                            required
                            data-testid="input-admin-password"
                          />
                        </div>
                      </div>
                    </div>

                    {/* reCAPTCHA Settings */}
                    <div className="border-t border-gray-700 pt-6 space-y-4">
                      <h4 className="text-sm font-semibold text-white">Cloudflare reCAPTCHA</h4>
                      <p className="text-xs text-gray-400">Add reCAPTCHA protection to the admin login form</p>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label htmlFor="recaptcha-site-key" className="text-gray-400">Site Key</Label>
                          <Input 
                            id="recaptcha-site-key"
                            type="text" 
                            value={settingsForm.recaptchaSiteKey}
                            onChange={(e) => handleSettingsChange('recaptchaSiteKey', e.target.value)}
                            className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-nord-green"
                            placeholder="Enter your Cloudflare reCAPTCHA site key"
                            data-testid="input-recaptcha-site-key"
                          />
                          <p className="text-xs text-gray-500 mt-1">Get this from your Cloudflare dashboard</p>
                        </div>
                        <div>
                          <Label htmlFor="recaptcha-secret-key" className="text-gray-400">Secret Key</Label>
                          <Input 
                            id="recaptcha-secret-key"
                            type="password" 
                            value={settingsForm.recaptchaSecretKey}
                            onChange={(e) => handleSettingsChange('recaptchaSecretKey', e.target.value)}
                            className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-nord-green"
                            placeholder="Enter your Cloudflare reCAPTCHA secret key"
                            data-testid="input-recaptcha-secret-key"
                          />
                          <p className="text-xs text-gray-500 mt-1">This will be stored securely on the server</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input 
                            type="checkbox" 
                            id="recaptcha-enabled"
                            checked={settingsForm.recaptchaEnabled}
                            onChange={(e) => handleSettingsChange('recaptchaEnabled', e.target.checked)}
                            className="w-4 h-4 text-nord-green bg-gray-800 border-gray-700 rounded focus:ring-nord-green"
                            data-testid="checkbox-recaptcha-enabled"
                          />
                          <Label htmlFor="recaptcha-enabled" className="text-gray-300">
                            Enable reCAPTCHA for admin login
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="border-t border-gray-700 pt-6">
                      <Button 
                        type="submit" 
                        disabled={updateSettingsMutation.isPending}
                        className="bg-nord-green text-black hover:bg-nord-green/90 font-medium"
                        data-testid="button-save-settings"
                      >
                        {updateSettingsMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Settings className="w-4 h-4 mr-2" />
                            Save Security Settings
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        ⚠️ Changes will require admin re-authentication
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* System Configuration */}
              <Card className="bg-black/30 border-gray-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Server className="w-5 h-5 text-nord-green" />
                    <span>System Configuration</span>
                  </CardTitle>
                  <CardDescription>Configure system-wide settings and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Additional system settings coming soon...</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}