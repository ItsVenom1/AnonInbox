import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface AdminLoginForm {
  username: string;
  password: string;
}

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<AdminLoginForm>({
    username: '',
    password: ''
  });
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (data: AdminLoginForm) => {
      const response = await apiRequest('POST', '/api/admin/login', data);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('admin_token', data.token);
      toast({
        title: 'Welcome back!',
        description: 'Successfully logged into admin dashboard',
      });
      navigate('/nordmail-admin/dashboard');
    },
    onError: (error) => {
      toast({
        title: 'Login Failed',
        description: 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both username and password',
        variant: 'destructive',
      });
      return;
    }
    loginMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof AdminLoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-nord-green/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-bounce" style={{animationDuration: '6s'}}></div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(179,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(179,255,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" style={{animationDuration: '4s'}}></div>
      </div>

      <Card className="w-full max-w-md bg-black/30 border-gray-800/50 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-nord-green rounded-2xl flex items-center justify-center shadow-2xl shadow-nord-green/20">
              <Shield className="w-8 h-8 text-black" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold nord-green">Admin Portal</CardTitle>
          <CardDescription className="text-gray-400">
            Secure access to NordMail administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-gray-300">Username</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange('username')}
                className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-nord-green"
                placeholder="Enter admin username"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-nord-green pr-10"
                  placeholder="Enter admin password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-nord-green text-black hover:bg-nord-green/90 font-bold py-2 shadow-lg shadow-nord-green/20"
            >
              {loginMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Secure Login
                </>
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
            <p className="text-xs text-yellow-200 text-center">
              🔒 This is a secure admin area. All access is logged and monitored.
            </p>
          </div>

          {/* Admin Credentials */}
          <div className="mt-6 p-4 bg-gray-900/30 border border-gray-700/50 rounded-lg">
            <h4 className="text-sm font-semibold text-nord-green mb-2">Default Admin Credentials:</h4>
            <div className="text-xs text-gray-300 space-y-1">
              <p><span className="text-gray-500">Username:</span> admin</p>
              <p><span className="text-gray-500">Password:</span> nordmail2024</p>
            </div>
            <p className="text-xs text-yellow-200 mt-2">💡 Change these credentials in Settings after login</p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-nord-green"
            >
              ← Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}