type ErrorSubscriber = (message: string) => void;

const subscribers = new Set<ErrorSubscriber>();

export function subscribeErrorToast(callback: ErrorSubscriber) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

export function raiseErrorToast(message: string) {
  if (!message) return;
  subscribers.forEach((subscriber) => subscriber(message));
}
