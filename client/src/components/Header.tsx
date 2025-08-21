import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import AccountModal from "./AccountModal";
import type { TempAccount } from "@shared/schema";

interface HeaderProps {
  account?: TempAccount;
}

export default function Header({ account }: HeaderProps = {}) {
  const [showAccountModal, setShowAccountModal] = useState(false);

  return (
    <>
      <header className="border-b border-gray-800 sticky top-0 bg-black z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-nord-green rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-xl font-bold nord-green">NordMail</h1>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAccountModal(true)}
            className="p-2 hover:bg-nord-dark"
          >
            <div className="w-6 h-6 bg-nord-green rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-black rounded-full" />
            </div>
          </Button>
        </div>
      </header>

      <AccountModal 
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        currentAccount={account}
      />
    </>
  );
}
