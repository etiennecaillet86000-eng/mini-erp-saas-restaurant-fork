import { createActor } from "@/backend";
import { useActor as usePlatformActor } from "@caffeineai/core-infrastructure";

/**
 * useActor — wraps the platform's useActor hook with this project's createActor.
 * Handles canisterId resolution, HttpAgent host configuration, and IC network
 * routing automatically. Never instantiate HttpAgent or set canisterId manually.
 */
export function useActor() {
  return usePlatformActor(createActor);
}
