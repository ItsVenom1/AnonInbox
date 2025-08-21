import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Message } from "@shared/schema";

interface EmailInboxProps {
  messages: Message[];
  selectedMessage: Message | null;
  onSelectMessage: (message: Message) => void;
}

export default function EmailInbox({ messages, selectedMessage, onSelectMessage }: EmailInboxProps) {
  if (messages.length === 0) {
    return (
      <Card className="bg-nord-dark border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Inbox</h3>
            <Badge className="bg-nord-green text-black">0</Badge>
          </div>
        </div>
        
        <div className="p-8 text-center">
          <Mail className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No messages yet</p>
          <p className="text-sm text-gray-500">Use your temporary email to sign up for services</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-nord-dark border-gray-800">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Inbox</h3>
          <Badge className="bg-nord-green text-black">{messages.length}</Badge>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            onClick={() => onSelectMessage(message)}
            className={`p-4 hover:bg-black/50 cursor-pointer border-b border-gray-800 last:border-b-0 transition-colors ${
              selectedMessage?.id === message.id ? 'bg-nord-green/10 border-l-4 border-l-nord-green' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.seen ? 'bg-gray-600' : 'bg-nord-green'
              }`}>
                <Mail className={`w-4 h-4 ${message.seen ? 'text-gray-300' : 'text-black'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-white truncate">
                    {message.from.name || message.from.address}
                  </p>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-gray-300 truncate mb-1 font-medium">
                  {message.subject}
                </p>
                <p className="text-xs text-gray-400 line-clamp-2">
                  {message.intro || message.text?.substring(0, 100) + "..."}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
