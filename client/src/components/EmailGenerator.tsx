import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, RotateCcw, Mail, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { TempAccount } from "@shared/schema";

interface EmailGeneratorProps {
  emailData: { emailAddress: string; createdAt: string };
  onRefresh: () => void;
}

export default function EmailGenerator({ emailData, onRefresh }: EmailGeneratorProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailData.emailAddress);
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

  const handleRefreshInbox = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card className="bg-nord-dark border-gray-800 p-6 mb-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-2">Your Temporary Email</h2>
          <div className="flex items-center space-x-3 bg-black border border-gray-700 rounded-lg p-4">
            <div className="flex-1">
              <span className="nord-green font-mono text-lg break-all">
                {emailData.emailAddress}
              </span>
              <p className="text-sm text-gray-400 mt-1">Click to copy to clipboard</p>
            </div>
            <Button
              onClick={handleCopyEmail}
              className="bg-nord-green text-black hover:bg-nord-green/90 font-medium"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button
            onClick={handleRefreshInbox}
            disabled={isRefreshing}
            className="bg-nord-green/20 text-nord-green hover:bg-nord-green/30 border-nord-green/20"
            variant="outline"
          >
            {isRefreshing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Mail className="w-4 h-4 mr-2" />
            )}
            Check Mail
          </Button>
        </div>
      </div>
    </Card>
  );
}
