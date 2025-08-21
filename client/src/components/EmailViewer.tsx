import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Trash2, Mail, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@shared/schema";

interface EmailViewerProps {
  message: Message | null;
  onMarkAsRead: () => void;
  onDeleteMessage: () => void;
}

export default function EmailViewer({ message, onMarkAsRead, onDeleteMessage }: EmailViewerProps) {
  const { toast } = useToast();

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await apiRequest("PATCH", `/api/message/${messageId}/read`);
    },
    onSuccess: () => {
      onMarkAsRead();
      toast({
        title: "Message marked as read",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await apiRequest("DELETE", `/api/message/${messageId}`);
    },
    onSuccess: () => {
      onDeleteMessage();
      toast({
        title: "Message deleted",
      });
    },
  });

  if (!message) {
    return (
      <Card className="bg-nord-dark border-gray-800 h-full flex items-center justify-center">
        <div className="text-center">
          <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Select an email to view</h3>
          <p className="text-gray-400">Choose a message from your inbox to read its contents</p>
        </div>
      </Card>
    );
  }

  const handleMarkAsRead = () => {
    if (!message.seen) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const handleDeleteMessage = () => {
    deleteMutation.mutate(message.id);
  };

  return (
    <Card className="bg-nord-dark border-gray-800 h-full">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{message.subject}</h3>
            {!message.seen && (
              <Badge variant="secondary" className="bg-nord-green/20 text-nord-green border-nord-green/20">
                Unread
              </Badge>
            )}
          </div>
          <div className="flex space-x-2">
            {!message.seen && (
              <Button
                onClick={handleMarkAsRead}
                disabled={markAsReadMutation.isPending}
                variant="ghost"
                size="sm"
              >
                <Check className="w-4 h-4" />
              </Button>
            )}
            <Button
              onClick={handleDeleteMessage}
              disabled={deleteMutation.isPending}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center flex-wrap gap-4 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <span>From:</span>
            <span className="text-white">{message.from.name || message.from.address}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>To:</span>
            <span className="nord-green">{message.to[0]?.address}</span>
          </div>
          <span className="ml-auto">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
      
      <div className="p-6 max-h-96 overflow-y-auto">
        <div className="prose prose-invert max-w-none">
          {message.html ? (
            <div 
              dangerouslySetInnerHTML={{ __html: message.html }} 
              className="text-white [&_a]:text-nord-green [&_a]:no-underline hover:[&_a]:underline"
            />
          ) : (
            <div className="whitespace-pre-wrap text-white">
              {message.text || message.intro}
            </div>
          )}
        </div>
        
        {message.hasAttachments && message.attachments && message.attachments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-800">
            <h4 className="text-sm font-medium mb-3">Attachments</h4>
            <div className="space-y-2">
              {message.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-black rounded-lg">
                  <Download className="w-4 h-4 text-gray-400" />
                  <span className="flex-1">{attachment.filename}</span>
                  <span className="text-sm text-gray-400">
                    {(attachment.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-nord-green hover:text-nord-green/80"
                    onClick={() => window.open(attachment.downloadUrl, '_blank')}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
