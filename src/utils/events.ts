type Callback = () => void;

class EventBus {
  private listeners: Set<Callback> = new Set();

  subscribe(callback: Callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  emit() {
    this.listeners.forEach((callback) => callback());
  }
}

export const refreshBus = new EventBus();
