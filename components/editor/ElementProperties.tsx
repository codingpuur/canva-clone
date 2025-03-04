// {"code":"rate-limited","message":"You have hit the rate limit. Please <a class=\"__boltUpgradePlan__\">Upgrade</a> to keep chatting, or you can continue coding for free in the editor.","providerLimitHit":false,"isRetryable":true}
import React from "react";
import { Button } from "@/components/ui/button";

interface ElementPropertiesProps {
  onClose: () => void;
}

const ElementProperties: React.FC<ElementPropertiesProps> = ({ onClose }) => {
  return (
    <div className="fixed right-0 top-0 w-80 h-full bg-white shadow-lg p-4 border-l border-gray-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Element Properties</h2>
        <Button variant="ghost" onClick={onClose}>
          ✕
        </Button>
      </div>
      <div>
        {/* Add properties form here */}
        <p className="text-sm text-gray-500">Edit element properties here...</p>
      </div>
    </div>
  );
};

export default ElementProperties;
