import { useEffect, useMemo, useState } from "react";
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
import { IS_DEMO_MODE, walletService } from "@/services";

interface BankCard {
  id: string;
  gateway?: "PAYMOB" | "FAWRY" | "VODAFONE_CASH";
  last4: string;
  bank: string;
  type: "visa" | "mastercard";
  isDefault: boolean;
}

const demoCards: BankCard[] = [
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
  const [cards, setCards] = useState<BankCard[]>(IS_DEMO_MODE ? demoCards : []);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [cardSubmitting, setCardSubmitting] = useState(false);
  const [newCard, setNewCard] = useState({
    gateway: "PAYMOB" as "PAYMOB" | "FAWRY" | "VODAFONE_CASH",
    paymentTokenRef: "",
    last4: "",
    brand: "visa" as "visa" | "mastercard",
    expMonth: "",
    expYear: "",
    holderName: "",
    bank: "",
    isDefault: false,
  });
  const [balance, setBalance] = useState<number>(IS_DEMO_MODE ? 2450 : 0);
  const [monthlyEarnings, setMonthlyEarnings] = useState<number>(IS_DEMO_MODE ? 400 : 0);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (IS_DEMO_MODE) return;

    const loadWalletData = async () => {
      setCardsLoading(true);
      try {
        const [balanceResponse, transactionsResponse, cardsResponse] = await Promise.all([
          walletService.getWalletBalance(),
          walletService.getWalletTransactions(),
          walletService.getBankCards(),
        ]);

        const balanceData = (balanceResponse as any)?.data || balanceResponse || {};
        const availableBalance =
          balanceData.availableBalance ??
          balanceData.balance ??
          0;
        setBalance(Number(availableBalance) || 0);

        const transactions = Array.isArray((transactionsResponse as any)?.items)
          ? (transactionsResponse as any).items
          : Array.isArray((transactionsResponse as any)?.data)
            ? (transactionsResponse as any).data
            : Array.isArray(transactionsResponse)
              ? transactionsResponse
              : [];

        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const thisMonthRewards = transactions.filter((tx: any) => {
          const createdAtRaw = tx.createdAt || tx.date;
          if (!createdAtRaw) return false;
          const createdAt = new Date(createdAtRaw);
          return !Number.isNaN(createdAt.getTime()) && createdAt >= monthStart && tx.type === "REWARD";
        });

        const rewardsAmount = thisMonthRewards.reduce((sum: number, tx: any) => {
          return sum + Number(tx.amount || 0);
        }, 0);
        setMonthlyEarnings(rewardsAmount);

        const cardItems = Array.isArray((cardsResponse as any)?.items)
          ? (cardsResponse as any).items
          : Array.isArray((cardsResponse as any)?.data)
            ? (cardsResponse as any).data
            : Array.isArray(cardsResponse)
              ? cardsResponse
              : [];
        setCards(
          cardItems.map((item: any) => ({
            id: item.id,
            gateway: item.gateway,
            last4: item.last4 || "0000",
            bank: item.holderName || item.gateway || "Egyptian Gateway",
            type: (item.brand || "visa").toLowerCase().includes("master") ? "mastercard" : "visa",
            isDefault: !!item.isDefault,
          }))
        );
      } catch (error) {
        console.error("Failed to load wallet data", error);
        setBalance(0);
        setMonthlyEarnings(0);
        setCards([]);
      } finally {
        setCardsLoading(false);
      }
    };

    void loadWalletData();
  }, []);

  const balanceWhole = useMemo(() => Math.floor(balance), [balance]);
  const balanceFraction = useMemo(() => {
    const fraction = Math.round((balance - Math.floor(balance)) * 100);
    return String(fraction).padStart(2, "0");
  }, [balance]);

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) < 50 || withdrawing) return;
    if (IS_DEMO_MODE) return;

    setWithdrawing(true);
    try {
      await walletService.withdraw({
        amount: Math.round(parseFloat(withdrawAmount)),
        method: "BANK_TRANSFER",
      });
      setWithdrawAmount("");
    } catch (error) {
      console.error("Withdrawal request failed", error);
    } finally {
      setWithdrawing(false);
    }
  };

  const handleSetDefaultCard = async (cardId: string) => {
    if (IS_DEMO_MODE) {
      setCards((prev) => prev.map((card) => ({ ...card, isDefault: card.id === cardId })));
      return;
    }

    try {
      await walletService.updateBankCard(cardId, { isDefault: true });
      setCards((prev) => prev.map((card) => ({ ...card, isDefault: card.id === cardId })));
    } catch (error) {
      console.error("Failed to update default card", error);
    }
  };

  const handleRemoveCard = async (cardId: string) => {
    if (IS_DEMO_MODE) {
      setCards((prev) => prev.filter((card) => card.id !== cardId));
      return;
    }

    try {
      await walletService.removeBankCard(cardId);
      setCards((prev) => prev.filter((card) => card.id !== cardId));
    } catch (error) {
      console.error("Failed to remove card", error);
    }
  };

  const handleAddCard = async () => {
    if (!newCard.paymentTokenRef || newCard.last4.length !== 4 || cardSubmitting) {
      return;
    }

    if (IS_DEMO_MODE) {
      const created: BankCard = {
        id: String(Date.now()),
        gateway: newCard.gateway,
        last4: newCard.last4,
        bank: newCard.bank || "Egyptian Gateway",
        type: newCard.brand,
        isDefault: newCard.isDefault || cards.length === 0,
      };
      setCards((prev) =>
        created.isDefault
          ? prev.map((card) => ({ ...card, isDefault: false })).concat(created)
          : prev.concat(created)
      );
      setShowAddCard(false);
      return;
    }

    setCardSubmitting(true);
    try {
      const response = await walletService.addBankCard({
        gateway: newCard.gateway,
        paymentTokenRef: newCard.paymentTokenRef,
        last4: newCard.last4,
        brand: newCard.brand.toUpperCase(),
        expMonth: newCard.expMonth ? Number(newCard.expMonth) : undefined,
        expYear: newCard.expYear ? Number(newCard.expYear) : undefined,
        holderName: newCard.holderName || newCard.bank || undefined,
        isDefault: newCard.isDefault,
      });

      const data = (response as any)?.data || response || {};
      const created: BankCard = {
        id: data.id,
        gateway: data.gateway,
        last4: data.last4 || newCard.last4,
        bank: data.holderName || newCard.bank || data.gateway || "Egyptian Gateway",
        type: (data.brand || newCard.brand || "visa").toLowerCase().includes("master") ? "mastercard" : "visa",
        isDefault: !!data.isDefault,
      };

      setCards((prev) =>
        created.isDefault
          ? prev.map((card) => ({ ...card, isDefault: false })).concat(created)
          : prev.concat(created)
      );
      setShowAddCard(false);
      setNewCard({
        gateway: "PAYMOB",
        paymentTokenRef: "",
        last4: "",
        brand: "visa",
        expMonth: "",
        expYear: "",
        holderName: "",
        bank: "",
        isDefault: false,
      });
    } catch (error) {
      console.error("Failed to add bank card", error);
    } finally {
      setCardSubmitting(false);
    }
  };

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
            <span className="text-5xl font-bold">${balanceWhole}</span>
            <span className="text-xl opacity-80">.{balanceFraction}</span>
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
                  {cardsLoading ? (
                    <p className="text-sm text-muted-foreground">Loading cards...</p>
                  ) : cards.length > 0 ? (
                    <div className="space-y-2">
                      {cards.map((card) => (
                        <div
                          key={card.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                            card.isDefault ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          )}
                          onClick={() => handleSetDefaultCard(card.id)}
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

                <Button
                  className="w-full"
                  disabled={!withdrawAmount || parseFloat(withdrawAmount) < 50 || withdrawing}
                  onClick={handleWithdraw}
                >
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

              {cardsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Loading bank cards...</p>
                </div>
              ) : cards.length > 0 ? (
                <div className="space-y-2">
                  {cards.map((card) => (
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemoveCard(card.id)}
                      >
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
                  <label className="text-sm font-medium text-foreground mb-1 block">Egyptian Payment Gateway</label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={newCard.gateway}
                    onChange={(e) => setNewCard((prev) => ({ ...prev, gateway: e.target.value as any }))}
                  >
                    <option value="PAYMOB">Paymob</option>
                    <option value="FAWRY">Fawry</option>
                    <option value="VODAFONE_CASH">Vodafone Cash</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Gateway Token</label>
                    <Input
                      placeholder="tok_eg_..."
                      value={newCard.paymentTokenRef}
                      onChange={(e) => setNewCard((prev) => ({ ...prev, paymentTokenRef: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Last 4</label>
                    <Input
                      placeholder="4532"
                      maxLength={4}
                      value={newCard.last4}
                      onChange={(e) => setNewCard((prev) => ({ ...prev, last4: e.target.value.replace(/\D/g, "") }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Exp Month</label>
                    <Input
                      placeholder="MM"
                      value={newCard.expMonth}
                      onChange={(e) => setNewCard((prev) => ({ ...prev, expMonth: e.target.value.replace(/\D/g, "") }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Exp Year</label>
                    <Input
                      placeholder="YYYY"
                      value={newCard.expYear}
                      onChange={(e) => setNewCard((prev) => ({ ...prev, expYear: e.target.value.replace(/\D/g, "") }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Card Holder / Bank Label</label>
                  <Input
                    placeholder="e.g., CIB Egypt, NBE, QNB"
                    value={newCard.bank}
                    onChange={(e) => setNewCard((prev) => ({ ...prev, bank: e.target.value, holderName: e.target.value }))}
                  />
                </div>

                <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Compliance-safe mode: only tokenized card reference is stored (no PAN/CVV).
                </div>
              </div>

              <div className="p-4 border-t border-border flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddCard(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleAddCard} disabled={cardSubmitting}>
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
