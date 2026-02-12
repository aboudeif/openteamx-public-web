import { api } from "@/lib/api";

export class ApiWalletService {
  async getWalletBalance(): Promise<any> {
    return api.get<any>("/wallet/balance");
  }

  async getWalletTransactions(): Promise<any[]> {
    return api.get<any[]>("/wallet/transactions");
  }

  async getBankCards(): Promise<any> {
    return api.get<any>("/wallet/cards");
  }

  async addBankCard(payload: any): Promise<any> {
    return api.post<any>("/wallet/cards", payload);
  }

  async updateBankCard(cardId: string, payload: any): Promise<any> {
    return api.patch<any>(`/wallet/cards/${cardId}`, payload);
  }

  async removeBankCard(cardId: string): Promise<any> {
    return api.delete<any>(`/wallet/cards/${cardId}`);
  }

  async withdraw(withdrawalInfo: any): Promise<void> {
    return api.post("/wallet/withdraw", withdrawalInfo);
  }

  async getRewards(): Promise<any[]> {
    return api.get<any[]>("/rewards");
  }

  async getRewardsStats(): Promise<any> {
    return api.get<any>("/rewards/stats");
  }

  async claimReward(rewardId: string): Promise<void> {
    return api.post("/rewards/claim", { rewardId });
  }
}
