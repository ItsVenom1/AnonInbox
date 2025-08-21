import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Users, 
  Mail, 
  BarChart3, 
  Settings, 
  LogOut, 
  FileText, 
  MessageCircle,
  Activity,
  TrendingUp,
  Globe,
  Server
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/nordmail-admin');
    }
  }, [navigate]);

  // Mock data - replace with real API calls
  const statsQuery = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      // This would be a real API call
      return {
        totalUsers: 15847,
        totalEmails: 234562,
        emailsToday: 1247,
        activeUsers: 892,
        systemHealth: 'healthy' as const,
        uptimePercentage: 99.9
      } as AdminStats;
    },
  });

  const activityQuery = useQuery({
    queryKey: ['/api/admin/activity'],
    queryFn: async () => {
      // This would be a real API call
      return [
        {
          id: '1',
          type: 'email_received' as const,
          description: 'Email received for user@temp123.mail.tm',
          timestamp: new Date().toISOString()
        },
        {
          id: '2', 
          type: 'user_created' as const,
          description: 'New temporary account created',
          timestamp: new Date(Date.now() - 300000).toISOString()
        },
        {
          id: '3',
          type: 'email_created' as const,
          description: 'New email address generated: random@temp456.mail.tm',
          timestamp: new Date(Date.now() - 600000).toISOString()
        }
      ] as RecentActivity[];
    },
  });

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    toast({
      title: 'Logged out',
      description: 'You have been securely logged out',
    });
    navigate('/nordmail-admin');
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
          <Card className="bg-black/30 border-gray-800/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
                <Users className="w-4 h-4 text-nord-green" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString() || '...'}</div>
              <p className="text-xs text-green-400 mt-1">↗ +12% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-black/30 border-gray-800/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">Total Emails</CardTitle>
                <Mail className="w-4 h-4 text-nord-green" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalEmails.toLocaleString() || '...'}</div>
              <p className="text-xs text-green-400 mt-1">↗ +8% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-black/30 border-gray-800/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">Today's Emails</CardTitle>
                <TrendingUp className="w-4 h-4 text-nord-green" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.emailsToday.toLocaleString() || '...'}</div>
              <p className="text-xs text-green-400 mt-1">↗ +5% from yesterday</p>
            </CardContent>
          </Card>

          <Card className="bg-black/30 border-gray-800/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">Active Users</CardTitle>
                <Activity className="w-4 h-4 text-nord-green" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeUsers.toLocaleString() || '...'}</div>
              <p className="text-xs text-green-400 mt-1">↗ Currently online</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-800/50 border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-nord-green data-[state=active]:text-black">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-nord-green data-[state=active]:text-black">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="blog" className="data-[state=active]:bg-nord-green data-[state=active]:text-black">
              <FileText className="w-4 h-4 mr-2" />
              Blog
            </TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-nord-green data-[state=active]:text-black">
              <MessageCircle className="w-4 h-4 mr-2" />
              Support
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-nord-green data-[state=active]:text-black">
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
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-800/30">
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
                    ))}
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

          <TabsContent value="blog">
            <Card className="bg-black/30 border-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Blog Management</CardTitle>
                <CardDescription>Create and manage blog posts with AI translation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Blog management system coming soon...</p>
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
                  {/* Admin Credentials */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-white">Admin Credentials</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Admin Username</label>
                        <input 
                          type="text" 
                          defaultValue="admin"
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-nord-green"
                          placeholder="Enter admin username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Admin Password</label>
                        <input 
                          type="password" 
                          defaultValue="nordmail2024"
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-nord-green"
                          placeholder="Enter admin password"
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
                        <label className="block text-sm text-gray-400 mb-2">Site Key</label>
                        <input 
                          type="text" 
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-nord-green"
                          placeholder="Enter your Cloudflare reCAPTCHA site key"
                        />
                        <p className="text-xs text-gray-500 mt-1">Get this from your Cloudflare dashboard</p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Secret Key</label>
                        <input 
                          type="password" 
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-nord-green"
                          placeholder="Enter your Cloudflare reCAPTCHA secret key"
                        />
                        <p className="text-xs text-gray-500 mt-1">This will be stored securely on the server</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input 
                          type="checkbox" 
                          id="recaptcha-enabled"
                          className="w-4 h-4 text-nord-green bg-gray-800 border-gray-700 rounded focus:ring-nord-green"
                        />
                        <label htmlFor="recaptcha-enabled" className="text-sm text-gray-300">
                          Enable reCAPTCHA for admin login
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="border-t border-gray-700 pt-6">
                    <Button className="bg-nord-green text-black hover:bg-nord-green/90 font-medium">
                      <Settings className="w-4 h-4 mr-2" />
                      Save Security Settings
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      ⚠️ Changes will require admin re-authentication
                    </p>
                  </div>
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