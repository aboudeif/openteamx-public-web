import { api } from "@/lib/api";

export class ApiWalletService {
  async getWalletBalance(): Promise<any> {
    return api.get<any>("/wallet/balance");
  }

  async getWalletTransactions(): Promise<any[]> {
    return api.get<any[]>("/wallet/transactions");
  }

  async withdraw(withdrawalInfo: any): Promise<void> {
    return api.post("/wallet/withdraw", withdrawalInfo);
  }

  async getRewards(): Promise<any[]> {
    return api.get<any[]>("/rewards");
  }

  async claimReward(rewardId: string): Promise<void> {
    return api.post("/rewards/claim", { rewardId });
  }
}
