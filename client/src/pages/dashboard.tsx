import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Mail, User, Copy, Eye, Search, RefreshCw, Edit, Save, X, Settings } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "../components/Header";
import EmailInbox from "../components/EmailInbox";
import EmailViewer from "../components/EmailViewer";
import type { TempAccount, EmailAddress, Message } from "@shared/schema";

interface DashboardData {
  account: TempAccount;
  emails: EmailAddress[];
}

interface EmailWithMessages extends EmailAddress {
  messageCount?: number;
  unreadCount?: number;
}

export default function Dashboard() {
  const { accountId } = useParams<{ accountId: string }>();
  const { toast } = useToast();
  
  // State management
  const [selectedEmail, setSelectedEmail] = useState<EmailWithMessages | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCustomEmailModal, setShowCustomEmailModal] = useState(false);
  const [showAccountEditModal, setShowAccountEditModal] = useState(false);
  const [customEmailUsername, setCustomEmailUsername] = useState("");
  const [mobileView, setMobileView] = useState<'emails' | 'inbox' | 'message'>('emails');
  const [editAccountForm, setEditAccountForm] = useState({
    username: "",
    password: "",
    personalEmail: "",
  });

  // Queries
  const { data: dashboardData, refetch: refetchDashboard } = useQuery({
    queryKey: ["/api/account", accountId],
    queryFn: () => fetch(`/api/account/${accountId}`).then(res => res.json()) as Promise<DashboardData>,
    enabled: !!accountId,
  });

  const { data: messagesData, refetch: refetchMessages } = useQuery({
    queryKey: ["/api/email", selectedEmail?.id, "messages"],
    queryFn: () => fetch(`/api/email/${selectedEmail?.id}/messages`).then(res => res.json()),
    enabled: !!selectedEmail?.id,
    refetchInterval: 30000,
  });

  // Mutations
  const createEmailMutation = useMutation({
    mutationFn: async (customUsername?: string) => {
      const body = customUsername ? { customUsername } : {};
      const response = await apiRequest("POST", `/api/account/${accountId}/emails`, body);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "New email created!",
        description: `${data.email.emailAddress} is ready to use`,
      });
      refetchDashboard();
      setShowCustomEmailModal(false);
      setCustomEmailUsername("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create email address. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: async (updates: { username?: string; password?: string; personalEmail?: string }) => {
      const response = await apiRequest("PUT", `/api/account/${accountId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account updated!",
        description: "Your account information has been saved",
      });
      refetchDashboard();
      setShowAccountEditModal(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update account",
        variant: "destructive",
      });
    },
  });

  // Effects
  useEffect(() => {
    if (dashboardData && !selectedEmail && dashboardData.emails.length > 0) {
      setSelectedEmail(dashboardData.emails[0]);
    }
  }, [dashboardData]);

  useEffect(() => {
    if (dashboardData) {
      setEditAccountForm({
        username: dashboardData.account.username,
        password: dashboardData.account.password,
        personalEmail: dashboardData.account.personalEmail || "",
      });
    }
  }, [dashboardData]);

  // Helper functions
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Email address copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy email address",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    refetchDashboard();
    if (selectedEmail) {
      queryClient.invalidateQueries({ queryKey: ["/api/email", selectedEmail.id, "messages"] });
    }
    toast({
      title: "Refreshing...",
      description: "Checking for new messages",
    });
  };

  const handleCustomEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customEmailUsername.trim()) {
      createEmailMutation.mutate(customEmailUsername.trim());
    }
  };

  const handleAccountUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: any = {};
    if (editAccountForm.username !== dashboardData?.account.username) {
      updates.username = editAccountForm.username;
    }
    if (editAccountForm.password !== dashboardData?.account.password) {
      updates.password = editAccountForm.password;
    }
    if (editAccountForm.personalEmail !== dashboardData?.account.personalEmail) {
      updates.personalEmail = editAccountForm.personalEmail;
    }
    updateAccountMutation.mutate(updates);
  };

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading account...</h2>
          <p className="text-gray-400">Please wait while we load your emails.</p>
        </div>
      </div>
    );
  }

  const { account, emails } = dashboardData;
  const messages = messagesData?.messages || [];
  
  // Filter emails based on search
  const filteredEmails = emails.filter(email => 
    email.emailAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header account={account} />
      
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Mobile Navigation */}
        <div className="lg:hidden flex items-center justify-between mb-4 bg-black/50 border border-gray-800 rounded-lg p-2">
          <Button
            onClick={() => setMobileView('emails')}
            variant={mobileView === 'emails' ? 'default' : 'ghost'}
            size="sm"
            className={mobileView === 'emails' ? 'bg-nord-green text-black' : 'text-gray-400'}
          >
            <User className="w-4 h-4 mr-1" />
            Emails ({emails.length})
          </Button>
          <Button
            onClick={() => setMobileView('inbox')}
            variant={mobileView === 'inbox' ? 'default' : 'ghost'}
            size="sm"
            disabled={!selectedEmail}
            className={mobileView === 'inbox' ? 'bg-nord-green text-black' : 'text-gray-400'}
          >
            <Mail className="w-4 h-4 mr-1" />
            Inbox
          </Button>
          <Button
            onClick={() => setMobileView('message')}
            variant={mobileView === 'message' ? 'default' : 'ghost'}
            size="sm"
            disabled={!selectedMessage}
            className={mobileView === 'message' ? 'bg-nord-green text-black' : 'text-gray-400'}
          >
            <Eye className="w-4 h-4 mr-1" />
            Message
          </Button>
        </div>

        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center">
              <User className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 nord-green" />
              My Emails
            </h2>
            <Badge className="bg-nord-green text-black text-xs">
              {emails.length} Email{emails.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto overflow-x-auto">
            <Button
              onClick={() => setShowAccountEditModal(true)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-nord-green text-xs sm:text-sm flex-shrink-0"
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Account
            </Button>
            
            <Button
              onClick={handleRefresh}
              variant="ghost" 
              size="sm"
              disabled={!selectedEmail}
              className="text-gray-400 hover:text-nord-green text-xs sm:text-sm flex-shrink-0 disabled:opacity-50"
              data-testid="button-refresh-emails"
            >
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Refresh
            </Button>

            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button
                onClick={() => createEmailMutation.mutate(undefined)}
                disabled={createEmailMutation.isPending}
                className="bg-nord-green text-black hover:bg-nord-green/90 font-medium text-xs sm:text-sm flex-shrink-0"
              >
                {createEmailMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-black mr-1 sm:mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Random
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowCustomEmailModal(true)}
                variant="outline"
                className="border-nord-green text-nord-green hover:bg-nord-green/10 text-xs sm:text-sm flex-shrink-0"
              >
                Custom
              </Button>
            </div>
          </div>
        </div>

        {emails.length === 0 ? (
          <Card className="bg-nord-dark border-gray-800 p-8 text-center">
            <Mail className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium mb-2">No emails yet</h4>
            <p className="text-gray-400 mb-4">Create your first temporary email address to get started</p>
            <div className="flex items-center space-x-2 justify-center">
              <Button
                onClick={() => createEmailMutation.mutate(undefined)}
                disabled={createEmailMutation.isPending}
                className="bg-nord-green text-black hover:bg-nord-green/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Random Email
              </Button>
              <Button
                onClick={() => setShowCustomEmailModal(true)}
                variant="outline"
                className="border-nord-green text-nord-green hover:bg-nord-green/10"
              >
                Custom Email
              </Button>
            </div>
          </Card>
        ) : (
          <>
          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
            {/* Left Sidebar - Email List */}
            <div className="lg:col-span-1 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-black border-gray-700 focus:border-nord-green"
                />
              </div>

              {/* Email List */}
              <div className="space-y-2 max-h-full overflow-y-auto">
                {filteredEmails.map((email) => (
                  <Card 
                    key={email.id} 
                    className={`p-3 cursor-pointer transition-colors border-gray-800 ${
                      selectedEmail?.id === email.id 
                        ? 'bg-nord-green/10 border-nord-green/30' 
                        : 'bg-nord-dark hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedEmail(email)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-nord-green/20 rounded-lg flex items-center justify-center">
                          <Mail className="w-4 h-4 nord-green" />
                        </div>
                        {messages.filter((m: any) => !m.seen).length > 0 && selectedEmail?.id === email.id && (
                          <Badge variant="destructive" className="bg-red-500 text-white px-1 py-0 text-xs">
                            {messages.filter((m: any) => !m.seen).length}
                          </Badge>
                        )}
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(email.emailAddress);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-nord-green p-1"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-nord-green font-mono text-xs break-all mb-1">
                      {email.emailAddress}
                    </p>
                    <p className="text-xs text-gray-500">
                      Created {formatDistanceToNow(new Date(email.createdAt), { addSuffix: true })}
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Middle - Inbox */}
            <div className="lg:col-span-1">
              {selectedEmail ? (
                <EmailInbox 
                  messages={messages}
                  selectedMessage={selectedMessage}
                  onSelectMessage={setSelectedMessage}
                />
              ) : (
                <Card className="bg-nord-dark border-gray-800 p-8 text-center h-full flex items-center justify-center">
                  <div>
                    <Mail className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Select an email to view messages</p>
                  </div>
                </Card>
              )}
            </div>

            {/* Right - Email Viewer */}
            <div className="lg:col-span-2">
              <EmailViewer 
                message={selectedMessage}
                onMarkAsRead={() => {
                  if (selectedEmail) {
                    queryClient.invalidateQueries({ queryKey: ["/api/email", selectedEmail.id, "messages"] });
                  }
                }}
                onDeleteMessage={() => {
                  setSelectedMessage(null);
                  if (selectedEmail) {
                    queryClient.invalidateQueries({ queryKey: ["/api/email", selectedEmail.id, "messages"] });
                  }
                }}
              />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden">
            {/* Emails View */}
            {mobileView === 'emails' && (
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search emails..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-black border-gray-700 focus:border-nord-green"
                  />
                </div>

                {/* Email List */}
                <div className="space-y-3">
                  {filteredEmails.map((email) => (
                    <Card 
                      key={email.id} 
                      className={`p-4 cursor-pointer transition-colors border-gray-800 ${
                        selectedEmail?.id === email.id 
                          ? 'bg-nord-green/10 border-nord-green/30' 
                          : 'bg-nord-dark hover:bg-gray-800'
                      }`}
                      onClick={() => {
                        setSelectedEmail(email);
                        setMobileView('inbox');
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-nord-green/20 rounded-lg flex items-center justify-center">
                            <Mail className="w-5 h-5 nord-green" />
                          </div>
                          {messages.filter((m: any) => !m.seen).length > 0 && selectedEmail?.id === email.id && (
                            <Badge variant="destructive" className="bg-red-500 text-white px-2 py-1 text-xs">
                              {messages.filter((m: any) => !m.seen).length} new
                            </Badge>
                          )}
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(email.emailAddress);
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-nord-green p-2"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-nord-green font-mono text-sm break-all mb-2">
                        {email.emailAddress}
                      </p>
                      <p className="text-sm text-gray-500">
                        Created {formatDistanceToNow(new Date(email.createdAt), { addSuffix: true })}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Inbox View */}
            {mobileView === 'inbox' && selectedEmail && (
              <div className="h-[calc(100vh-250px)]">
                <EmailInbox 
                  messages={messages}
                  selectedMessage={selectedMessage}
                  onSelectMessage={(message) => {
                    setSelectedMessage(message);
                    setMobileView('message');
                  }}
                />
              </div>
            )}

            {/* Message View */}
            {mobileView === 'message' && selectedMessage && (
              <div className="h-[calc(100vh-250px)]">
                <EmailViewer 
                  message={selectedMessage}
                  onMarkAsRead={() => {
                    if (selectedEmail) {
                      queryClient.invalidateQueries({ queryKey: ["/api/email", selectedEmail.id, "messages"] });
                    }
                  }}
                  onDeleteMessage={() => {
                    setSelectedMessage(null);
                    setMobileView('inbox');
                    if (selectedEmail) {
                      queryClient.invalidateQueries({ queryKey: ["/api/email", selectedEmail.id, "messages"] });
                    }
                  }}
                />
              </div>
            )}
          </div>
          </>
        )}
      </div>

      {/* Custom Email Modal */}
      <Dialog open={showCustomEmailModal} onOpenChange={setShowCustomEmailModal}>
        <DialogContent className="bg-black border-gray-800">
          <DialogHeader>
            <DialogTitle className="nord-green">Create Custom Email</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCustomEmailSubmit} className="space-y-4">
            <div>
              <Label htmlFor="customUsername">Choose your email username</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  id="customUsername"
                  placeholder="myname11"
                  value={customEmailUsername}
                  onChange={(e) => setCustomEmailUsername(e.target.value)}
                  className="bg-black border-gray-700 focus:border-nord-green"
                />
                <span className="text-gray-400">@powerscrews.com</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Choose a unique username for your temporary email
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                type="submit"
                disabled={createEmailMutation.isPending || !customEmailUsername.trim()}
                className="flex-1 bg-nord-green text-black hover:bg-nord-green/90"
              >
                {createEmailMutation.isPending ? "Creating..." : "Create Custom Email"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => createEmailMutation.mutate(undefined)}
                disabled={createEmailMutation.isPending}
                className="border-gray-700"
              >
                Random Instead
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Account Edit Modal */}
      <Dialog open={showAccountEditModal} onOpenChange={setShowAccountEditModal}>
        <DialogContent className="bg-black border-gray-800">
          <DialogHeader>
            <DialogTitle className="nord-green">Edit Account Information</DialogTitle>
          </DialogHeader>
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3 mb-4">
            <p className="text-yellow-400 text-sm">
              ⚠️ <strong>Important:</strong> If you want to keep the emails you created, make sure to save your account information or add details you can remember. Without saving your credentials, you may lose access to your temporary emails.
            </p>
          </div>
          <form onSubmit={handleAccountUpdate} className="space-y-4">
            <div>
              <Label htmlFor="editUsername">Username</Label>
              <Input
                id="editUsername"
                value={editAccountForm.username}
                onChange={(e) => setEditAccountForm(prev => ({ ...prev, username: e.target.value }))}
                className="bg-black border-gray-700 focus:border-nord-green"
              />
            </div>
            <div>
              <Label htmlFor="editPassword">Password</Label>
              <Input
                id="editPassword"
                value={editAccountForm.password}
                onChange={(e) => setEditAccountForm(prev => ({ ...prev, password: e.target.value }))}
                className="bg-black border-gray-700 focus:border-nord-green"
              />
            </div>
            <div>
              <Label htmlFor="editPersonalEmail">Personal Email (Optional)</Label>
              <Input
                id="editPersonalEmail"
                placeholder="your.personal@email.com"
                value={editAccountForm.personalEmail}
                onChange={(e) => setEditAccountForm(prev => ({ ...prev, personalEmail: e.target.value }))}
                className="bg-black border-gray-700 focus:border-nord-green"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add your personal email for account recovery
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                type="submit"
                disabled={updateAccountMutation.isPending}
                className="flex-1 bg-nord-green text-black hover:bg-nord-green/90"
              >
                {updateAccountMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAccountEditModal(false)}
                className="border-gray-700"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}