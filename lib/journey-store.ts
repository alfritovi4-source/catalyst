import { sceneById } from "@/content/journey";
import {
  clearState,
  initialState,
  loadState,
  saveState,
  type JourneyState,
} from "@/lib/journey";

/**
 * Крошечное внешнее хранилище для useSyncExternalStore.
 * На сервере всегда отдаёт начальное состояние; в браузере лениво читает localStorage
 * при первом обращении, а каждое изменение сразу пишет обратно.
 */

const SERVER_STATE: JourneyState = initialState();
const listeners = new Set<() => void>();
let cached: JourneyState | null = null;

function read(): JourneyState {
  if (cached) return cached;
  const loaded = loadState();
  // Сцена могла исчезнуть после обновления контента — тогда честнее начать с начала.
  cached = loaded && sceneById[loaded.sceneId] ? loaded : initialState();
  return cached;
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): JourneyState {
  return read();
}

export function getServerSnapshot(): JourneyState {
  return SERVER_STATE;
}

export function setJourneyState(next: JourneyState) {
  cached = next;
  saveState(next);
  listeners.forEach((l) => l());
}

export function resetJourneyState() {
  clearState();
  setJourneyState(initialState());
}
