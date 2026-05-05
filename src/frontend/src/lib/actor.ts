import { type Backend, createActor } from "@/backend";
import { createActorWithConfig } from "@caffeineai/core-infrastructure";

/**
 * getActor — resolves the backend actor via the platform's createActorWithConfig.
 * This reads env.json at runtime, sets the correct IC host and canisterId,
 * and handles both local and production network routing automatically.
 *
 * Returns a cached promise so concurrent calls await the same initialization.
 */
let _actorPromise: Promise<Backend> | null = null;

export function getActor(): Promise<Backend> {
  if (!_actorPromise) {
    _actorPromise = createActorWithConfig(createActor).catch((err) => {
      // Reset so next call retries rather than caching the failure
      _actorPromise = null;
      console.error("[actor] Failed to initialize backend actor:", err);
      throw err;
    });
  }
  return _actorPromise;
}
