import { useState, useEffect, useRef, useCallback } from "react";
import { WorkspaceLayout } from "@/components/layout/WorkspaceLayout";
import { Gift, Star, Trophy, Target, Zap, Award, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Reward {
  id: string;
  title: string;
  company: string;
  recruiterName?: string;
  date: string;
  amount: string;
  rating?: number;
  comment?: string;
}

const initialRewards: Reward[] = [
  {
    id: "1",
    title: "Sprint Completion Bonus",
    company: "TechVentures Inc.",
    recruiterName: "Ahmed Hassan",
    date: "Jan 28, 2026",
    amount: "$150.00",
    rating: 5,
    comment: "Excellent work on the dashboard redesign. Delivered ahead of schedule!",
  },
  {
    id: "2",
    title: "Code Review Excellence",
    company: "DesignCo Agency",
    date: "Jan 25, 2026",
    amount: "$50.00",
  },
  {
    id: "3",
    title: "Team Milestone Reward",
    company: "TechVentures Inc.",
    recruiterName: "Sara Mohamed",
    date: "Jan 20, 2026",
    amount: "$200.00",
    rating: 4,
    comment: "Great collaboration with the team. Keep up the good work!",
  },
  {
    id: "4",
    title: "Bug Fix Bounty",
    company: "StartupX Labs",
    date: "Jan 15, 2026",
    amount: "$75.00",
  },
  {
    id: "5",
    title: "Feature Implementation",
    company: "CodeCraft Studio",
    recruiterName: "Omar Ali",
    date: "Jan 10, 2026",
    amount: "$300.00",
    rating: 5,
    comment: "Outstanding implementation of the payment module. Very clean code.",
  },
];

// Generate more rewards for infinite scroll demo
const generateMoreRewards = (startId: number, count: number): Reward[] => {
  const titles = ["Project Bonus", "Performance Reward", "Quality Award", "Sprint Reward", "Innovation Prize"];
  const companies = ["TechVentures Inc.", "DesignCo Agency", "StartupX Labs", "CodeCraft Studio"];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `${startId + i}`,
    title: titles[Math.floor(Math.random() * titles.length)],
    company: companies[Math.floor(Math.random() * companies.length)],
    date: `Jan ${Math.floor(Math.random() * 28) + 1}, 2026`,
    amount: `$${(Math.floor(Math.random() * 10) + 1) * 25}.00`,
    rating: Math.random() > 0.5 ? Math.floor(Math.random() * 2) + 4 : undefined,
    comment: Math.random() > 0.6 ? "Great work on this project!" : undefined,
  }));
};

export default function Rewards() {
  const [rewards, setRewards] = useState<Reward[]>(initialRewards);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    setTimeout(() => {
      const newRewards = generateMoreRewards(rewards.length + 1, 5);
      setRewards((prev) => [...prev, ...newRewards]);
      setLoading(false);
      if (rewards.length >= 25) setHasMore(false);
    }, 1000);
  }, [loading, hasMore, rewards.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  const totalEarnings = rewards.reduce((sum, r) => {
    const amount = parseFloat(r.amount.replace("$", ""));
    return sum + amount;
  }, 0);

  return (
    <WorkspaceLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-3">
            <Gift className="w-7 h-7 text-primary" />
            Rewards
          </h1>
          <p className="text-muted-foreground mt-1">Track your achievements and earnings</p>
        </div>

        {/* How Rewards Work */}
        <div className="widget-card mb-8">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning" />
            How Rewards Work
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Complete Tasks</h3>
              <p className="text-sm text-muted-foreground">
                Finish assigned tasks on time and meet quality standards to earn rewards
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Get Rated</h3>
              <p className="text-sm text-muted-foreground">
                Recruiters and team leads rate your work based on quality and collaboration
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center mb-4">
                <Award className="w-8 h-8 text-warning" />
              </div>
              <h3 className="font-semibold mb-2">Earn Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Receive financial rewards directly to your wallet based on your performance
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="widget-card text-center">
            <p className="text-3xl font-bold text-primary">{rewards.length}</p>
            <p className="text-sm text-muted-foreground">Total Rewards</p>
          </div>
          <div className="widget-card text-center">
            <p className="text-3xl font-bold text-success">${totalEarnings.toFixed(0)}</p>
            <p className="text-sm text-muted-foreground">Total Earned</p>
          </div>
          <div className="widget-card text-center">
            <p className="text-3xl font-bold text-warning">4.8</p>
            <p className="text-sm text-muted-foreground">Avg. Rating</p>
          </div>
          <div className="widget-card text-center">
            <div className="flex items-center justify-center gap-1 text-success">
              <TrendingUp className="w-5 h-5" />
              <span className="text-xl font-bold">+15%</span>
            </div>
            <p className="text-sm text-muted-foreground">This Month</p>
          </div>
        </div>

        {/* Rewards List */}
        <div className="widget-card">
          <h2 className="text-lg font-semibold mb-4">Rewards History</h2>

          {rewards.length === 0 ? (
            <div className="text-center py-16">
              <Gift className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Rewards Yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Complete tasks and contribute to your teams to start earning rewards
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="p-4 rounded-xl border border-border hover:border-primary/20 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                        <Gift className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{reward.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {reward.company}
                          {reward.recruiterName && ` • ${reward.recruiterName}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-success">{reward.amount}</p>
                      <p className="text-xs text-muted-foreground">{reward.date}</p>
                    </div>
                  </div>

                  {(reward.rating || reward.comment) && (
                    <div className="mt-3 pt-3 border-t border-border">
                      {reward.rating && (
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-4 h-4",
                                i < reward.rating! ? "text-warning fill-warning" : "text-muted"
                              )}
                            />
                          ))}
                          <span className="text-sm text-muted-foreground ml-1">
                            {reward.rating}/5
                          </span>
                        </div>
                      )}
                      {reward.comment && (
                        <p className="text-sm text-muted-foreground italic">
                          "{reward.comment}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Infinite scroll loader */}
              <div ref={loaderRef} className="py-4 text-center">
                {loading && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Loading more rewards...</span>
                  </div>
                )}
                {!hasMore && (
                  <p className="text-sm text-muted-foreground">You've reached the end</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
