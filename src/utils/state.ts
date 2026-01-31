type BalanceCallback = (balance: string | null) => void;

class StateStore {
  private balance: string | null = null;
  private listeners: Set<BalanceCallback> = new Set();

  setBalance(newBalance: string | null) {
    this.balance = newBalance;
    this.listeners.forEach((cb) => cb(newBalance));
  }

  getBalance() {
    return this.balance;
  }

  subscribe(cb: BalanceCallback) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
}

export const sharedState = new StateStore();
