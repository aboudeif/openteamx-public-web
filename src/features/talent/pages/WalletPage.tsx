import { useState } from "react";
import { WorkspaceLayout } from "@/components/layout/WorkspaceLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Wallet as WalletIcon,
  TrendingUp,
  CreditCard,
  Plus,
  Building2,
  AlertCircle,
  Shield,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BankCard {
  id: string;
  last4: string;
  bank: string;
  type: "visa" | "mastercard";
  isDefault: boolean;
}

const savedCards: BankCard[] = [
  { id: "1", last4: "4532", bank: "CIB Egypt", type: "visa", isDefault: true },
];

const withdrawalConditions = [
  "Minimum withdrawal amount: $50.00",
  "Maximum withdrawal per transaction: $5,000.00",
  "Processing time: 3-5 business days",
  "Withdrawals are processed through licensed Egyptian payment providers",
  "A small processing fee (2.5%) applies to all withdrawals",
];

export default function Wallet() {
  const [showAddCard, setShowAddCard] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const balance = 2450.0;
  const monthlyEarnings = 400.0;

  return (
    <WorkspaceLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-3">
            <WalletIcon className="w-7 h-7 text-primary" />
            My Wallet
          </h1>
          <p className="text-muted-foreground mt-1">Manage your earnings and withdrawals</p>
        </div>

        {/* Balance Card */}
        <div className="p-6 rounded-2xl gradient-primary text-primary-foreground mb-8">
          <p className="text-sm opacity-90 mb-2">Available Balance</p>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-5xl font-bold">${Math.floor(balance)}</span>
            <span className="text-xl opacity-80">.{String(balance).split(".")[1] || "00"}</span>
          </div>
          <div className="flex items-center gap-1 text-sm opacity-90">
            <TrendingUp className="w-4 h-4" />
            <span>+${monthlyEarnings.toFixed(2)} this month</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Withdrawal Section */}
          <div className="space-y-6">
            <div className="widget-card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Withdraw Funds
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Amount to Withdraw
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0.00"
                      className="pl-8"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Available: ${balance.toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Withdraw To
                  </label>
                  {savedCards.length > 0 ? (
                    <div className="space-y-2">
                      {savedCards.map((card) => (
                        <div
                          key={card.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                            card.isDefault ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          )}
                        >
                          <div className="w-10 h-7 rounded bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
                            <span className="text-white text-[8px] font-bold uppercase">{card.type}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">•••• {card.last4}</p>
                            <p className="text-xs text-muted-foreground">{card.bank}</p>
                          </div>
                          {card.isDefault && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No cards added yet</p>
                  )}
                </div>

                <Button className="w-full" disabled={!withdrawAmount || parseFloat(withdrawAmount) < 50}>
                  Withdraw Funds
                </Button>
              </div>
            </div>

            {/* Bank Cards */}
            <div className="widget-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Bank Cards
                </h2>
                <Button variant="outline" size="sm" onClick={() => setShowAddCard(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Card
                </Button>
              </div>

              {savedCards.length > 0 ? (
                <div className="space-y-2">
                  {savedCards.map((card) => (
                    <div
                      key={card.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold uppercase">{card.type}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">•••• •••• •••• {card.last4}</p>
                        <p className="text-xs text-muted-foreground">{card.bank}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No bank cards added</p>
                  <p className="text-xs">Add a card to start withdrawing funds</p>
                </div>
              )}
            </div>
          </div>

          {/* Conditions Section */}
          <div className="space-y-6">
            <div className="widget-card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-warning" />
                Withdrawal Terms
              </h2>

              <div className="space-y-3">
                {withdrawalConditions.map((condition, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{condition}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="widget-card bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Secure Payments</h3>
                  <p className="text-sm text-muted-foreground">
                    All transactions are processed through licensed Egyptian financial intermediaries 
                    regulated by the Central Bank of Egypt (CBE). Your funds are protected by 
                    industry-standard security protocols.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Card Modal */}
        {showAddCard && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold">Add Bank Card</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowAddCard(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Card Number</label>
                  <Input placeholder="1234 5678 9012 3456" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Expiry Date</label>
                    <Input placeholder="MM/YY" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">CVV</label>
                    <Input placeholder="123" type="password" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Bank Name</label>
                  <Input placeholder="e.g., CIB Egypt, NBE, QNB" />
                </div>

                <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Your card details are encrypted and securely stored through our licensed payment partner.
                </div>
              </div>

              <div className="p-4 border-t border-border flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddCard(false)}>
                  Cancel
                </Button>
                <Button className="flex-1">
                  Add Card
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
