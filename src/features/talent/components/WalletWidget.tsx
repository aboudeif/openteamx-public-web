import { WidgetCard } from "@/components/shared/WidgetCard";
import { Wallet, Gift, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

const recentRewards = [
  { id: 1, title: "Sprint Completion Bonus", date: "Jan 28, 2026", amount: "$150.00" },
  { id: 2, title: "Code Review Excellence", date: "Jan 25, 2026", amount: "$50.00" },
  { id: 3, title: "Team Milestone Reward", date: "Jan 20, 2026", amount: "$200.00" },
];

export function WalletWidget() {
  const navigate = useNavigate();

  return (
    <WidgetCard 
      title="Talent Wallet" 
      icon={Wallet} 
      action="View"
      onAction={() => navigate("/wallet")}
    >
      <ScrollArea className="h-[280px]">
        <div className="space-y-4 pr-2">
          {/* Balance Card */}
          <div className="p-4 rounded-xl gradient-primary text-primary-foreground">
            <p className="text-sm opacity-90 mb-1">Available Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">$2,450</span>
              <span className="text-sm opacity-80">.00</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm opacity-90">
              <TrendingUp className="w-4 h-4" />
              <span>+$400 this month</span>
            </div>
          </div>

          {/* Recent Rewards */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Recent Rewards
            </p>
            <div className="space-y-2">
              {recentRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                    <Gift className="w-4 h-4 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{reward.title}</p>
                    <p className="text-xs text-muted-foreground">{reward.date}</p>
                  </div>
                  <span className="text-sm font-semibold text-success">{reward.amount}</span>
                </div>
              ))}
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full" 
            size="sm"
            onClick={() => navigate("/rewards")}
          >
            View All Rewards
          </Button>
        </div>
      </ScrollArea>
    </WidgetCard>
  );
}
