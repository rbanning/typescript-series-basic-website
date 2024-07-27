export type CounterPayload = {
  changed: number;
  value: number;
  updated: string;
}

const emptyCounterPayload: CounterPayload = {
  changed: 0,
  value: 0,
  updated: 'never'
}

export type CounterSubscriber = (current: CounterPayload) => void;

class Counter {
  private _cache: Record<string, CounterPayload> = {};
  private _subscriptions: CounterSubscriber[] = []; 

  get(id: string): CounterPayload {
    return {...this._getCounterRef(id)}; //shallow copy
  }
  
  reset(id: string): Counter { 
    const counter = this._getCounterRef(id);
    counter.changed = 0;
    counter.value = 0;
    counter.updated = this._timestamp();
    return this.publish();
  }

  add(id: string, amt: number) {
    const counter = this._getCounterRef(id);
    counter.changed++;
    counter.value += amt;
    counter.updated = this._timestamp();
    return this.publish();
  }

  delete(id: string) {
    delete this._cache[id];
    this.publish();
  }

  totals(): CounterPayload {
    return Object.keys(this._cache).reduce((ret, key) => {
      const curr = this._getCounterRef(key);
      ret.changed += curr.changed;
      ret.value += curr.value;
      return ret;
    }, {...emptyCounterPayload, updated: this._timestamp()});
  }

  // publish-subscribe pattern
  subscribe(callback: CounterSubscriber) {
    this._subscriptions.push(callback);
  }

  private publish() {
    const current = this.totals();
    this._subscriptions.forEach(sub => sub(current));
    return this;
  }

  private _getCounterRef(id: string): CounterPayload {
    if (!(id in this._cache)) {
      this._cache[id] = {
        changed: 0,
        value: 0,
        updated: this._timestamp()
      };
    }

    return this._cache[id];  
  }

  private _timestamp(): string {
    return new Date().toLocaleTimeString();
  }

}

export const globalCounter = new Counter();