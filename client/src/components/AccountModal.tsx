import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { X, User, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TempAccount } from "@shared/schema";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccount?: TempAccount;
}

export default function AccountModal({ isOpen, onClose, currentAccount }: AccountModalProps) {
  const [, navigate] = useLocation();
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const { toast } = useToast();

  const createNewEmailMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/account/create");
      return response.json();
    },
    onSuccess: (data: { account: TempAccount }) => {
      toast({
        title: "New email created!",
        description: "Your new temporary email is ready to use",
      });
      navigate(`/dashboard/${data.account.id}`);
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create new temporary email. Please try again.",
        variant: "destructive",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/account/login", credentials);
      return response.json();
    },
    onSuccess: (data: { account: TempAccount }) => {
      toast({
        title: "Login successful!",
        description: "Welcome back to your temporary email account",
      });
      navigate(`/dashboard/${data.account.id}`);
      onClose();
    },
    onError: () => {
      toast({
        title: "Login failed",
        description: "Invalid username or password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      toast({
        title: "Missing fields",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(loginForm);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-nord-dark border-gray-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Account Information</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Account Info */}
          {currentAccount && (
            <Card className="bg-black border-gray-700 p-4">
              <h4 className="font-medium mb-3 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Current Account
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Username:</span>
                  <span className="font-mono">{currentAccount.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Password:</span>
                  <span className="font-mono">{currentAccount.password}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="font-mono nord-green text-xs break-all">
                    {currentAccount.emailAddress}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Created:</span>
                  <span>
                    {formatDistanceToNow(new Date(currentAccount.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Use these credentials to access your temporary emails later
              </p>
            </Card>
          )}

          {/* Create New Email Section */}
          <div className="space-y-3">
            <h4 className="font-medium">Need another temporary email?</h4>
            <Button
              onClick={() => createNewEmailMutation.mutate()}
              disabled={createNewEmailMutation.isPending}
              className="w-full bg-nord-green text-black hover:bg-nord-green/90 font-medium"
              variant="outline"
            >
              {createNewEmailMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Email Address
                </>
              )}
            </Button>
          </div>

          {/* Login Form */}
          <div className="space-y-4">
            <h4 className="font-medium">Have an existing account?</h4>
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  className="bg-black border-gray-700 focus:border-nord-green"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-black border-gray-700 focus:border-nord-green"
                />
              </div>
              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-nord-green text-black hover:bg-nord-green/90 font-medium"
              >
                {loginMutation.isPending ? "Logging in..." : "Login to Existing Account"}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


