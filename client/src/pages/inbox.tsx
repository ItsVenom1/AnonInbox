import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "../components/Header";
import EmailGenerator from "../components/EmailGenerator";
import EmailInbox from "../components/EmailInbox";
import EmailViewer from "../components/EmailViewer";
import { useState } from "react";
import type { Message } from "@shared/schema";

export default function Inbox() {
  const { emailId } = useParams<{ emailId: string }>();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const { data: emailData } = useQuery({
    queryKey: ["/api/email", emailId],
    queryFn: () => fetch(`/api/email/${emailId}`).then(res => res.json()),
    enabled: !!emailId,
  });

  const { data: messagesData, refetch: refetchMessages } = useQuery({
    queryKey: ["/api/email", emailId, "messages"],
    queryFn: () => fetch(`/api/email/${emailId}/messages`).then(res => res.json()),
    enabled: !!emailId,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  if (!emailId || !emailData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Email not found</h2>
          <p className="text-gray-400">Please go back to your dashboard.</p>
        </div>
      </div>
    );
  }

  const messages = messagesData?.messages || [];

  return (
    <>
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <EmailGenerator 
          emailData={emailData}
          onRefresh={refetchMessages}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <EmailInbox 
              messages={messages}
              selectedMessage={selectedMessage}
              onSelectMessage={setSelectedMessage}
            />
          </div>
          
          <div className="lg:col-span-2">
            <EmailViewer 
              message={selectedMessage}
              onMarkAsRead={refetchMessages}
              onDeleteMessage={() => {
                setSelectedMessage(null);
                refetchMessages();
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
