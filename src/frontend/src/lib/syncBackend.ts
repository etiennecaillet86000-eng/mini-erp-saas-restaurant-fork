import type {
  Associe,
  ClotureJournaliere,
  Emprunt,
  HypothesesBP,
  Immobilisation,
  MouvementStock,
  VenteJournaliere,
} from "@/core/store/useAppStore";
import type { FraisFixe, Salarie } from "@/core/types/models";
import { getActor } from "@/lib/actor";
import type {
  CategorieCarte,
  IngredientFB,
  RecetteFB,
} from "@/modules/restaurant/types/models";
/**
 * syncBackend — lightweight async sync helpers.
 * Each function calls a backend write op, catches errors, and shows a toast.
 * Store actions call these AFTER updating local state (optimistic UI).
 */
import { toast } from "sonner";

const ERR_SYNC =
  "Erreur de synchronisation — les données sont sauvegardées localement";

async function safe(fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
  } catch (err) {
    console.error("[syncBackend] Erreur de synchronisation backend:", err);
    toast.error(ERR_SYNC);
  }
}

// ─── Ingrédients ──────────────────────────────────────────────────────────────

export function syncAddIngredient(ing: IngredientFB): void {
  void safe(async () =>
    (await getActor()).createIngredient({
      nom: ing.nom,
      unite: ing.unite,
      prixAchatHT: ing.prixAchatHT,
      perteMatierePct: ing.perteMatierePct,
      famille: ing.famille ?? "",
      seuilSecurite: ing.seuilSecurite ?? 0,
    }),
  );
}

export function syncUpdateIngredient(
  id: string,
  updates: Partial<IngredientFB>,
  current: IngredientFB,
): void {
  const merged = { ...current, ...updates };
  void safe(async () =>
    (await getActor()).updateIngredient(id, {
      nom: merged.nom,
      unite: merged.unite,
      prixAchatHT: merged.prixAchatHT,
      perteMatierePct: merged.perteMatierePct,
      famille: merged.famille ?? "",
      seuilSecurite: merged.seuilSecurite ?? 0,
    }),
  );
}

export function syncDeleteIngredient(id: string): void {
  void safe(async () => (await getActor()).deleteIngredient(id));
}

// ─── Recettes ─────────────────────────────────────────────────────────────────

export function syncAddRecette(r: RecetteFB): void {
  void safe(async () =>
    (await getActor()).createRecette({
      nom: r.nom,
      categorie: r.categorie ?? "",
      categorieId: r.categorieId,
      prixVenteHT: r.prixVenteHT,
      volumeHebdo: r.volumeHebdo,
      tva: r.tva,
      ingredients: r.ingredients,
    }),
  );
}

export function syncUpdateRecette(
  id: string,
  updates: Partial<RecetteFB>,
  current: RecetteFB,
): void {
  const merged = { ...current, ...updates };
  void safe(async () =>
    (await getActor()).updateRecette(id, {
      nom: merged.nom,
      categorie: merged.categorie ?? "",
      categorieId: merged.categorieId,
      prixVenteHT: merged.prixVenteHT,
      volumeHebdo: merged.volumeHebdo,
      tva: merged.tva,
      ingredients: merged.ingredients,
    }),
  );
}

export function syncDeleteRecette(id: string): void {
  void safe(async () => (await getActor()).deleteRecette(id));
}

// ─── Catégories Carte ─────────────────────────────────────────────────────────

export function syncAddCategorie(cat: CategorieCarte): void {
  void safe(async () =>
    (await getActor()).createCategorieCarte({
      nom: cat.nom,
      mixCiblePct: cat.mixCiblePct,
      ticketMoyen: cat.ticketMoyen,
      foodCostCible: cat.foodCostCible,
    }),
  );
}

export function syncUpdateCategorie(
  id: string,
  updates: Partial<CategorieCarte>,
  current: CategorieCarte,
): void {
  const merged = { ...current, ...updates };
  void safe(async () =>
    (await getActor()).updateCategorieCarte(id, {
      nom: merged.nom,
      mixCiblePct: merged.mixCiblePct,
      ticketMoyen: merged.ticketMoyen,
      foodCostCible: merged.foodCostCible,
    }),
  );
}

export function syncDeleteCategorie(id: string): void {
  void safe(async () => (await getActor()).deleteCategorieCarte(id));
}

// ─── Salaires (replaceAll pattern) ───────────────────────────────────────────

export async function syncReplaceSalaires(
  incoming: Salarie[],
  existing: Salarie[],
): Promise<void> {
  await safe(async () => {
    const actor = await getActor();
    // Delete all existing backend records
    await Promise.allSettled(existing.map((s) => actor.deleteSalaire(s.id)));
    // Re-create from local list
    await Promise.allSettled(
      incoming.map((s) =>
        actor.createSalaire({
          nom: s.nom,
          prenom: s.prenom,
          poste: s.poste,
          typeContrat: s.typeContrat,
          heuresHebdo: s.heuresHebdo,
          salaireNet: s.salaireNet,
          chargesPatronales: s.chargesPatronales,
          coutTotalEmployeur: s.coutTotalEmployeur,
        }),
      ),
    );
  });
}

// ─── Frais Fixes (replaceAll pattern) ────────────────────────────────────────

export async function syncReplaceFraisFixes(
  incoming: FraisFixe[],
  existing: FraisFixe[],
): Promise<void> {
  await safe(async () => {
    const actor = await getActor();
    await Promise.allSettled(existing.map((f) => actor.deleteFraisFixe(f.id)));
    await Promise.allSettled(
      incoming.map((f) =>
        actor.createFraisFixe({
          libelle: f.libelle,
          montant: f.montant,
          categorie: f.categorie,
          frequence: f.frequence,
        }),
      ),
    );
  });
}

// ─── Hypothèses BP ────────────────────────────────────────────────────────────

export function syncSaveHypotheses(h: HypothesesBP): void {
  void safe(async () => (await getActor()).saveHypothesesBP(h));
}

// ─── Associés ─────────────────────────────────────────────────────────────────

export function syncAddAssocie(a: Associe): void {
  void safe(async () =>
    (await getActor()).createAssocie({
      nom: a.nom,
      remunerationMensuelle: a.remunerationMensuelle,
      apportInitial: a.apportInitial,
      montantRembourse: a.montantRembourse,
    }),
  );
}

export function syncUpdateAssocie(
  id: string,
  updates: Partial<Omit<Associe, "id">>,
  current: Associe,
): void {
  const merged = { ...current, ...updates };
  void safe(async () =>
    (await getActor()).updateAssocie(id, {
      nom: merged.nom,
      remunerationMensuelle: merged.remunerationMensuelle,
      apportInitial: merged.apportInitial,
      montantRembourse: merged.montantRembourse,
    }),
  );
}

export function syncDeleteAssocie(id: string): void {
  void safe(async () => (await getActor()).deleteAssocie(id));
}

// ─── Emprunts ─────────────────────────────────────────────────────────────────

export function syncAddEmprunt(e: Emprunt): void {
  void safe(async () =>
    (await getActor()).createEmprunt({
      nom: e.nom,
      capitalInitial: e.capitalInitial,
      tauxAnnuel: e.tauxAnnuel,
      dateDebut: e.dateDebut,
      dureeMois: BigInt(e.dureeMois),
    }),
  );
}

export function syncUpdateEmprunt(
  id: string,
  updates: Partial<Emprunt>,
  current: Emprunt,
): void {
  const merged = { ...current, ...updates };
  void safe(async () =>
    (await getActor()).updateEmprunt(id, {
      nom: merged.nom,
      capitalInitial: merged.capitalInitial,
      tauxAnnuel: merged.tauxAnnuel,
      dateDebut: merged.dateDebut,
      dureeMois: BigInt(merged.dureeMois),
    }),
  );
}

export function syncDeleteEmprunt(id: string): void {
  void safe(async () => (await getActor()).deleteEmprunt(id));
}

// ─── Immobilisations ──────────────────────────────────────────────────────────

export function syncAddImmobilisation(immo: Immobilisation): void {
  void safe(async () =>
    (await getActor()).createImmobilisation({
      nom: immo.nom,
      type: immo.type,
      valeurAchatHT: immo.valeurAchatHT,
      dureeAmortissementAns: BigInt(immo.dureeAmortissementAns),
      dateAchat: immo.dateAchat,
    }),
  );
}

export function syncUpdateImmobilisation(
  id: string,
  updates: Partial<Immobilisation>,
  current: Immobilisation,
): void {
  const merged = { ...current, ...updates };
  void safe(async () =>
    (await getActor()).updateImmobilisation(id, {
      nom: merged.nom,
      type: merged.type,
      valeurAchatHT: merged.valeurAchatHT,
      dureeAmortissementAns: BigInt(merged.dureeAmortissementAns),
      dateAchat: merged.dateAchat,
    }),
  );
}

export function syncDeleteImmobilisation(id: string): void {
  void safe(async () => (await getActor()).deleteImmobilisation(id));
}

// ─── Mouvements de stock ──────────────────────────────────────────────────────

export function syncAddMouvementStock(mvt: MouvementStock): void {
  void safe(async () =>
    (await getActor()).createMouvementStock({
      ingredientId: mvt.ingredientId,
      quantite: mvt.quantite,
      type: mvt.type,
      date: mvt.date,
      motif: mvt.motif,
    }),
  );
}

// ─── Ventes Journalières ──────────────────────────────────────────────────────

export function syncAddVenteJournaliere(v: VenteJournaliere): void {
  void safe(async () =>
    (await getActor()).createVenteJournaliere({
      date: v.date,
      montant: v.montant,
    }),
  );
}

export function syncDeleteVenteJournaliere(id: string): void {
  void safe(async () => (await getActor()).deleteVenteJournaliere(id));
}

// ─── Clotures Journalières (via historique) ───────────────────────────────────

export function syncAddCloture(cloture: ClotureJournaliere): void {
  void safe(async () =>
    (await getActor()).createHistoriqueClotureEntry({
      date: cloture.date,
      caTotal: cloture.caTotal,
      chargesVariables: cloture.chargesVariables,
      valide: cloture.valide,
      ventes: cloture.ventes,
    }),
  );
}
