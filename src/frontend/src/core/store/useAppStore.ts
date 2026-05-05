import type { FraisFixe, Salarie } from "@/core/types/models";
import {
  syncAddAssocie,
  syncAddCategorie,
  syncAddCloture,
  syncAddEmprunt,
  syncAddImmobilisation,
  syncAddIngredient,
  syncAddMouvementStock,
  syncAddRecette,
  syncAddVenteJournaliere,
  syncDeleteAssocie,
  syncDeleteCategorie,
  syncDeleteEmprunt,
  syncDeleteImmobilisation,
  syncDeleteIngredient,
  syncDeleteRecette,
  syncDeleteVenteJournaliere,
  syncReplaceFraisFixes,
  syncReplaceSalaires,
  syncSaveHypotheses,
  syncUpdateAssocie,
  syncUpdateCategorie,
  syncUpdateEmprunt,
  syncUpdateImmobilisation,
  syncUpdateIngredient,
  syncUpdateRecette,
} from "@/lib/syncBackend";
import type {
  CategorieCarte,
  IngredientFB,
  RecetteFB,
} from "@/modules/restaurant/types/models";
import { calculerFoodCostRecette } from "@/modules/restaurant/utils/calculations";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HypothesesBP {
  couvertsParJour: number;
  semainesOuverture: number;
  tauxCroissanceAnnuel: number;
  tauxInflationAnnuel: number;
  joursOuvertureAn: number;
  objectifCAannuel: number;
  joursOuvertureParSemaine: number;
  ticketMoyenCible: number;
  margeCibleGlobale: number; // marge brute globale cible (%)
  tauxChargesSalariales: number; // taux charges salariales (%) — défaut 22
  tauxChargesPatronales: number; // taux charges patronales (%) — défaut 42
  statutJuridique: "SASU" | "SARL"; // statut juridique de la société — défaut SASU
  tauxIS_bas: number; // taux IS réduit (%) — défaut 15
  tauxIS_haut: number; // taux IS normal (%) — défaut 25
  seuilIS: number; // seuil d'application IS (€) — défaut 42500
  tauxCroissanceCA: number; // alias croissanceCA_Reel — défaut 3
  tauxInflationCharges: number; // alias inflationCharges_Reel — défaut 2
  croissanceCA_BP: number; // taux de croissance CA spécifique au BP (%) — défaut 3
  inflationCharges_BP: number; // taux d'inflation charges spécifique au BP (%) — défaut 2
  croissanceCA_Reel: number; // taux de croissance CA spécifique au Réel (%) — défaut 3
  inflationCharges_Reel: number; // taux d'inflation charges spécifique au Réel (%) — défaut 2
  pacteSocialActif: boolean; // Pacte Social — majore les charges personnel de 5% — défaut false
  remunerationAssociesAnnuelle: number; // rémunération annuelle totale des associés (€) — défaut 0
}

export interface ClotureJournaliere {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  ventes: Array<{ recetteId: string; quantite: number }>;
  caTotal: number;
  chargesVariables: number;
  valide: boolean;
}

export interface MouvementStock {
  id: string;
  ingredientId: string;
  quantite: number;
  type: "entree" | "sortie";
  date: string; // ISO string — généré automatiquement
  motif: "Achat" | "Vente" | "Perte" | "Péremption";
}

export interface VenteJournaliere {
  id: string;
  date: string; // ISO date string
  montant: number; // CA HT
}

export interface Associe {
  id: string;
  nom: string;
  remunerationMensuelle: number;
  apportInitial: number; // CCA
  montantRembourse: number; // CCA
}

export interface Emprunt {
  id: string;
  nom: string;
  capitalInitial: number;
  tauxAnnuel: number; // en %, ex: 3.5 pour 3.5%
  dureeMois: number;
  dateDebut: string; // ISO date string
}

export interface Immobilisation {
  id: string;
  nom: string;
  valeurAchatHT: number;
  dureeAmortissementAns: number;
  type: "linéaire" | "dérogatoire";
  dateAchat: string; // ISO date string
}

interface AppStore {
  // ── State ──────────────────────────────────────────────────────────────────
  salaries: Salarie[];
  fraisFixes: FraisFixe[];
  hypothesesBP: HypothesesBP;
  configEtablissement: ConfigEtablissement;
  ingredients: IngredientFB[];
  recettes: RecetteFB[];
  categoriesCarte: CategorieCarte[];
  associes: Associe[];
  emprunts: Emprunt[];
  immobilisations: Immobilisation[];
  mouvementsStock: MouvementStock[];
  ventesJournalieres: VenteJournaliere[];
  historiqueClotures: ClotureJournaliere[];

  // ── Actions ────────────────────────────────────────────────────────────────
  setSalaries: (salaries: Salarie[]) => void;
  setFraisFixes: (fraisFixes: FraisFixe[]) => void;
  setHypothesesBP: (hypotheses: Partial<HypothesesBP>) => void;
  updateHypotheses: (updates: Partial<HypothesesBP>) => void;
  updateConfigEtablissement: (config: Partial<ConfigEtablissement>) => void;

  // Ingrédients F&B
  addIngredient: (ing: IngredientFB) => void;
  updateIngredient: (id: string, updates: Partial<IngredientFB>) => void;
  deleteIngredient: (id: string) => void;

  // Fiches Techniques (Recettes)
  addRecette: (r: RecetteFB) => void;
  updateRecette: (id: string, updates: Partial<RecetteFB>) => void;
  deleteRecette: (id: string) => void;

  // Catégories Carte
  updateCategorie: (id: string, updates: Partial<CategorieCarte>) => void;
  addCategorie: (categorie: CategorieCarte) => void;
  deleteCategorie: (id: string) => void;

  // Bulk actions
  resetVolumes: () => void;

  // Associés
  addAssocie: (associe: Omit<Associe, "id">) => void;
  updateAssocie: (id: string, updates: Partial<Omit<Associe, "id">>) => void;
  removeAssocie: (id: string) => void;

  // Emprunts
  addEmprunt: (emprunt: Emprunt) => void;
  updateEmprunt: (id: string, updates: Partial<Emprunt>) => void;
  removeEmprunt: (id: string) => void;

  // Immobilisations
  addImmobilisation: (immobilisation: Immobilisation) => void;
  updateImmobilisation: (id: string, updates: Partial<Immobilisation>) => void;
  removeImmobilisation: (id: string) => void;

  // Mouvements de Stock
  addMouvementStock: (mvt: Omit<MouvementStock, "id" | "date">) => void;
  deduireStockDepuisVentes: (recetteId: string, quantiteVendue: number) => void;

  // Ventes Journalières
  addVenteJournaliere: (vente: VenteJournaliere) => void;
  removeVenteJournaliere: (id: string) => void;

  // Clotures Journalieres
  validerJournee: (cloture: Omit<ClotureJournaliere, "id" | "valide">) => void;
}

// ─── ConfigEtablissement ──────────────────────────────────────────────────────

export interface ConfigEtablissement {
  nom: string;
  joursOuvertureParAn: number;
  tvaParDefaut: number;
  devise: string;
}

const DEFAULT_CONFIG_ETABLISSEMENT: ConfigEtablissement = {
  nom: "Mon Restaurant",
  joursOuvertureParAn: 300,
  tvaParDefaut: 10,
  devise: "€",
};

// ─── AppState type alias (for use in selectors) ───────────────────────────────
export type AppState = AppStore;

// ─── Default data (mirrors Sprint 2 mock values) ─────────────────────────────

const DEFAULT_SALARIES: Salarie[] = [
  {
    id: "1",
    prenom: "Marie",
    nom: "Dupont",
    poste: "Cuisinière",
    typeContrat: "CDI",
    heuresHebdo: 39,
    salaireNet: 1800,
    chargesPatronales: 720,
    coutTotalEmployeur: 2520,
  },
  {
    id: "2",
    prenom: "Jean",
    nom: "Martin",
    poste: "Serveur",
    typeContrat: "CDD",
    heuresHebdo: 35,
    salaireNet: 1450,
    chargesPatronales: 580,
    coutTotalEmployeur: 2030,
  },
  {
    id: "3",
    prenom: "Léa",
    nom: "Petit",
    poste: "Aide-cuisine",
    typeContrat: "Apprenti",
    heuresHebdo: 35,
    salaireNet: 760,
    chargesPatronales: 0,
    coutTotalEmployeur: 760,
  },
];

const DEFAULT_FRAIS_FIXES: FraisFixe[] = [
  {
    id: "1",
    libelle: "Loyer du local commercial",
    montant: 2800,
    categorie: "Loyer",
    frequence: "Mensuel",
  },
  {
    id: "2",
    libelle: "Assurance multirisque pro",
    montant: 1200,
    categorie: "Assurance",
    frequence: "Annuel",
  },
  {
    id: "3",
    libelle: "Logiciel de caisse (Abonnement)",
    montant: 89,
    categorie: "Abonnement SaaS",
    frequence: "Mensuel",
  },
  {
    id: "4",
    libelle: "EDF — électricité",
    montant: 420,
    categorie: "Énergie",
    frequence: "Mensuel",
  },
];

const DEFAULT_HYPOTHESES_BP: HypothesesBP = {
  couvertsParJour: 50,
  semainesOuverture: 48,
  tauxCroissanceAnnuel: 5,
  tauxInflationAnnuel: 2,
  joursOuvertureAn: 300,
  objectifCAannuel: 500000,
  joursOuvertureParSemaine: 5,
  ticketMoyenCible: 20,
  margeCibleGlobale: 70,
  tauxChargesSalariales: 22,
  tauxChargesPatronales: 42,
  statutJuridique: "SASU",
  tauxIS_bas: 15,
  tauxIS_haut: 25,
  seuilIS: 42500,
  tauxCroissanceCA: 3,
  tauxInflationCharges: 2,
  croissanceCA_BP: 3,
  inflationCharges_BP: 2,
  croissanceCA_Reel: 3,
  inflationCharges_Reel: 2,
  pacteSocialActif: false,
  remunerationAssociesAnnuelle: 0,
};

const DEFAULT_CATEGORIES_CARTE: CategorieCarte[] = [
  {
    id: "cat_boissons",
    nom: "Boissons",
    mixCiblePct: 15,
    ticketMoyen: 3.5,
    foodCostCible: 15,
  },
  {
    id: "cat_snacking",
    nom: "Snacking",
    mixCiblePct: 15,
    ticketMoyen: 5.5,
    foodCostCible: 35,
  },
  {
    id: "cat_plats",
    nom: "Plats chauds",
    mixCiblePct: 30,
    ticketMoyen: 12.0,
    foodCostCible: 32,
  },
  {
    id: "cat_desserts",
    nom: "Desserts",
    mixCiblePct: 20,
    ticketMoyen: 4.5,
    foodCostCible: 28,
  },
  {
    id: "cat_acc",
    nom: "Accompagnements",
    mixCiblePct: 10,
    ticketMoyen: 3.0,
    foodCostCible: 25,
  },
  {
    id: "cat_formules",
    nom: "Formules",
    mixCiblePct: 10,
    ticketMoyen: 14.0,
    foodCostCible: 30,
  },
];

// ─── Selectors (pure helpers — use outside the store) ────────────────────────

/** Somme annuelle des coûts employeur (mensuel × 12) */
export function selectTotalMasseSalarialeAnnuelle(salaries: Salarie[]): number {
  return salaries.reduce((sum, s) => sum + s.coutTotalEmployeur * 12, 0);
}

/** Somme annuelle des frais fixes (Mensuel × 12 ou Annuel × 1) */
export function selectTotalFraisFixesAnnuels(fraisFixes: FraisFixe[]): number {
  return fraisFixes.reduce(
    (sum, f) => sum + (f.frequence === "Mensuel" ? f.montant * 12 : f.montant),
    0,
  );
}

/**
 * Section A — Réel : CA annuel, marge réelle et coût matières annuel
 * calculés depuis les recettes et leurs volumes réels hebdomadaires.
 * Selector pur : ne modifie jamais le store.
 */
export const selectReelSectionA = (
  state: AppState,
): { caAnnuel: number; margeReelle: number; caMaterielAnnuel: number } => {
  const { recettes, ingredients, hypothesesBP } = state;
  const semaines = hypothesesBP.semainesOuverture || 45;

  const caHebdoGlobal = recettes.reduce(
    (acc, r) =>
      acc + (Number(r.volumeHebdo) || 0) * (Number(r.prixVenteHT) || 0),
    0,
  );

  const coutMatiereHebdo = recettes.reduce((acc, r) => {
    const { coutMatiereTotalHT } = calculerFoodCostRecette(r, ingredients);
    return acc + coutMatiereTotalHT * (Number(r.volumeHebdo) || 0);
  }, 0);

  const caAnnuel = caHebdoGlobal * semaines;
  const caMaterielAnnuel = coutMatiereHebdo * semaines;
  const margeReelle =
    caAnnuel > 0 ? ((caAnnuel - caMaterielAnnuel) / caAnnuel) * 100 : 0;

  return { caAnnuel, margeReelle, caMaterielAnnuel };
};

/**
 * Section B — Réel : masse salariale annuelle, frais fixes annuels et total charges.
 * Selector pur : ne modifie jamais le store.
 */
export const selectReelSectionB = (
  state: AppState,
): {
  masseSalarialeAnnuelle: number;
  totalFraisFixesAnnuels: number;
  totalChargesAnnuelles: number;
} => {
  const { salaries, fraisFixes } = state;

  const masseSalarialeAnnuelle = salaries.reduce(
    (sum, s) => sum + (s.coutTotalEmployeur || 0) * 12,
    0,
  );

  const totalFraisFixesAnnuels = fraisFixes.reduce(
    (sum, f) => sum + (f.frequence === "Mensuel" ? f.montant * 12 : f.montant),
    0,
  );

  const totalChargesAnnuelles = masseSalarialeAnnuelle + totalFraisFixesAnnuels;

  return {
    masseSalarialeAnnuelle,
    totalFraisFixesAnnuels,
    totalChargesAnnuelles,
  };
};

/**
 * Section A — Business Plan : CA annuel, coût matières et marge cible
 * calculés depuis les hypothèses stratégiques du store.
 * Selector pur : ne modifie jamais le store.
 */
export const selectBPSectionA = (
  state: AppState,
): { caAnnuel: number; caMaterielAnnuel: number; margeReelle: number } => {
  const { hypothesesBP } = state;

  const caAnnuel = hypothesesBP.objectifCAannuel || 0;
  const foodCostPct = 100 - (hypothesesBP.margeCibleGlobale || 70);
  const caMaterielAnnuel = (caAnnuel * foodCostPct) / 100;
  const margeReelle = hypothesesBP.margeCibleGlobale || 70;

  return { caAnnuel, caMaterielAnnuel, margeReelle };
};

/**
 * Section B — Business Plan : masse salariale annuelle, frais fixes annuels et total charges.
 * Identique à selectReelSectionB — lit salaries et fraisFixes du store.
 * Selector pur : ne modifie jamais le store.
 */
export const selectBPSectionB = (
  state: AppState,
): {
  masseSalarialeAnnuelle: number;
  totalFraisFixesAnnuels: number;
  totalChargesAnnuelles: number;
} => selectReelSectionB(state);

// ─── Phase 17 Selectors ───────────────────────────────────────────────────────

/**
 * getBudgetInitial : indicateurs du Business Plan Initial (objectifs stratégiques).
 * - caAnnuel : objectif CA annuel du BP
 * - margeBrute : CA × (margeCibleGlobale / 100)
 * - ebe : margeBrute − frais fixes annuels − masse salariale annuelle
 */
export function getBudgetInitial(state: AppState): {
  caAnnuel: number;
  margeBrute: number;
  ebe: number;
} {
  const caAnnuel = state.hypothesesBP?.objectifCAannuel || 0;
  if (caAnnuel === 0) return { caAnnuel: 0, margeBrute: 0, ebe: 0 };

  const margePct = state.hypothesesBP?.margeCibleGlobale || 0;
  const margeBrute = caAnnuel * (margePct / 100);

  const masseSalariale = selectTotalMasseSalarialeAnnuelle(
    state.salaries || [],
  );
  const fraisFixes = selectTotalFraisFixesAnnuels(state.fraisFixes || []);
  const ebe = margeBrute - fraisFixes - masseSalariale;

  return { caAnnuel, margeBrute, ebe };
}

/**
 * getProjectionActuelle : indicateurs issus du Business Plan Réel (projections simulées).
 * - caAnnuel : CA annuel calculé depuis les volumes recettes du BP Réel
 * - margeBrute : caAnnuel × (margeReelle / 100)
 * - ebe : margeBrute − totalChargesAnnuelles (salaires + frais fixes)
 */
export function getProjectionActuelle(state: AppState): {
  caAnnuel: number;
  margeBrute: number;
  ebe: number;
} {
  const sectionA = selectReelSectionA(state);
  const sectionB = selectReelSectionB(state);

  const caAnnuel = sectionA.caAnnuel || 0;
  if (caAnnuel === 0) return { caAnnuel: 0, margeBrute: 0, ebe: 0 };

  const margeReelle = sectionA.margeReelle || 0;
  const margeBrute = caAnnuel * (margeReelle / 100);
  const ebe = margeBrute - (sectionB.totalChargesAnnuelles || 0);

  return { caAnnuel, margeBrute, ebe };
}

/**
 * getPerformanceReelle : agrégation des données réelles des clôtures journalières validées.
 * - caAnnuel : somme des caTotal des clôtures validées
 * - margeBrute : caAnnuel − somme des chargesVariables des clôtures validées
 * - ebe : margeBrute − frais fixes annuels totaux (annualisé)
 * - hasData : true si au moins une clôture validée existe
 */
export function getPerformanceReelle(state: AppState): {
  caAnnuel: number;
  margeBrute: number;
  ebe: number;
  hasData: boolean;
} {
  const clotures = (state.historiqueClotures || []).filter(
    (c) => c.valide === true,
  );

  const hasData = clotures.length > 0;

  if (!hasData) {
    return { caAnnuel: 0, margeBrute: 0, ebe: 0, hasData: false };
  }

  const caAnnuel = clotures.reduce((sum, c) => sum + (c.caTotal || 0), 0);
  const totalChargesVariables = clotures.reduce(
    (sum, c) => sum + (c.chargesVariables || 0),
    0,
  );
  const margeBrute = caAnnuel - totalChargesVariables;
  const fraisFixes = selectTotalFraisFixesAnnuels(state.fraisFixes || []);
  const ebe = margeBrute - fraisFixes;

  return { caAnnuel, margeBrute, ebe, hasData };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      salaries: DEFAULT_SALARIES,
      fraisFixes: DEFAULT_FRAIS_FIXES,
      hypothesesBP: DEFAULT_HYPOTHESES_BP,
      configEtablissement: DEFAULT_CONFIG_ETABLISSEMENT,
      ingredients: [],
      recettes: [],
      categoriesCarte: DEFAULT_CATEGORIES_CARTE,
      associes: [],
      emprunts: [],
      immobilisations: [],
      mouvementsStock: [],
      ventesJournalieres: [],
      historiqueClotures: [],

      setSalaries: (salaries) => {
        set((state) => {
          void syncReplaceSalaires(salaries, state.salaries);
          return { salaries };
        });
      },
      setFraisFixes: (fraisFixes) => {
        set((state) => {
          void syncReplaceFraisFixes(fraisFixes, state.fraisFixes);
          return { fraisFixes };
        });
      },
      setHypothesesBP: (hypotheses) =>
        set((state) => ({
          hypothesesBP: { ...state.hypothesesBP, ...hypotheses },
        })),
      updateHypotheses: (updates) =>
        set((state) => {
          const next = { ...state.hypothesesBP, ...updates };
          syncSaveHypotheses(next);
          return { hypothesesBP: next };
        }),

      updateConfigEtablissement: (config) =>
        set((state) => ({
          configEtablissement: { ...state.configEtablissement, ...config },
        })),

      addIngredient: (ing) => {
        syncAddIngredient(ing);
        set((state) => ({ ingredients: [...state.ingredients, ing] }));
      },
      updateIngredient: (id, updates) =>
        set((state) => {
          const current = state.ingredients.find((i) => i.id === id);
          if (current) syncUpdateIngredient(id, updates, current);
          return {
            ingredients: state.ingredients.map((i) =>
              i.id === id ? { ...i, ...updates } : i,
            ),
          };
        }),
      deleteIngredient: (id) => {
        syncDeleteIngredient(id);
        set((state) => ({
          ingredients: state.ingredients.filter((i) => i.id !== id),
        }));
      },

      addRecette: (r) => {
        syncAddRecette(r);
        set((state) => ({ recettes: [...state.recettes, r] }));
      },
      updateRecette: (id, updates) =>
        set((state) => {
          const current = state.recettes.find((r) => r.id === id);
          if (current) syncUpdateRecette(id, updates, current);
          return {
            recettes: state.recettes.map((r) =>
              r.id === id ? { ...r, ...updates } : r,
            ),
          };
        }),
      deleteRecette: (id) => {
        syncDeleteRecette(id);
        set((state) => ({
          recettes: state.recettes.filter((r) => r.id !== id),
        }));
      },

      updateCategorie: (id, updates) =>
        set((state) => {
          const current = state.categoriesCarte.find((c) => c.id === id);
          if (current) syncUpdateCategorie(id, updates, current);
          return {
            categoriesCarte: state.categoriesCarte.map((c) =>
              c.id === id ? { ...c, ...updates } : c,
            ),
          };
        }),
      addCategorie: (categorie) => {
        syncAddCategorie(categorie);
        set((state) => ({
          categoriesCarte: [...state.categoriesCarte, categorie],
        }));
      },
      deleteCategorie: (id) => {
        syncDeleteCategorie(id);
        set((state) => ({
          categoriesCarte: state.categoriesCarte.filter((c) => c.id !== id),
        }));
      },

      resetVolumes: () =>
        set((state) => ({
          recettes: state.recettes.map((r) => ({ ...r, volumeHebdo: 0 })),
        })),

      addAssocie: (associe) => {
        const full = { ...associe, id: crypto.randomUUID() };
        syncAddAssocie(full);
        set((state) => ({ associes: [...state.associes, full] }));
      },
      updateAssocie: (id, updates) =>
        set((state) => {
          const current = state.associes.find((a) => a.id === id);
          if (current) syncUpdateAssocie(id, updates, current);
          return {
            associes: state.associes.map((a) =>
              a.id === id ? { ...a, ...updates } : a,
            ),
          };
        }),
      removeAssocie: (id) => {
        syncDeleteAssocie(id);
        set((state) => ({
          associes: state.associes.filter((a) => a.id !== id),
        }));
      },

      addEmprunt: (emprunt) => {
        syncAddEmprunt(emprunt);
        set((state) => ({ emprunts: [...state.emprunts, emprunt] }));
      },
      updateEmprunt: (id, updates) =>
        set((state) => {
          const current = state.emprunts.find((e) => e.id === id);
          if (current) syncUpdateEmprunt(id, updates, current);
          return {
            emprunts: state.emprunts.map((e) =>
              e.id === id ? { ...e, ...updates } : e,
            ),
          };
        }),
      removeEmprunt: (id) => {
        syncDeleteEmprunt(id);
        set((state) => ({
          emprunts: state.emprunts.filter((e) => e.id !== id),
        }));
      },

      addImmobilisation: (immobilisation) => {
        syncAddImmobilisation(immobilisation);
        set((state) => ({
          immobilisations: [...state.immobilisations, immobilisation],
        }));
      },
      updateImmobilisation: (id, updates) =>
        set((state) => {
          const current = state.immobilisations.find((i) => i.id === id);
          if (current) syncUpdateImmobilisation(id, updates, current);
          return {
            immobilisations: state.immobilisations.map((i) =>
              i.id === id ? { ...i, ...updates } : i,
            ),
          };
        }),
      removeImmobilisation: (id) => {
        syncDeleteImmobilisation(id);
        set((state) => ({
          immobilisations: state.immobilisations.filter((i) => i.id !== id),
        }));
      },

      addMouvementStock: (mvt) =>
        set((state) => {
          const full = {
            ...mvt,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
          };
          syncAddMouvementStock(full);
          return { mouvementsStock: [...state.mouvementsStock, full] };
        }),

      deduireStockDepuisVentes: (recetteId, quantiteVendue) =>
        set((state) => {
          const recette = state.recettes.find((r) => r.id === recetteId);
          if (!recette) return {};
          const nouveauxMvts = recette.ingredients.map((ligne) => {
            const qte =
              Math.round(quantiteVendue * ligne.quantiteNette * 10000) / 10000;
            return {
              id: crypto.randomUUID(),
              ingredientId: ligne.ingredientId,
              quantite: qte,
              type: "sortie" as const,
              motif: "Vente" as const,
              date: new Date().toISOString(),
            };
          });
          nouveauxMvts.forEach(syncAddMouvementStock);
          return {
            mouvementsStock: [...state.mouvementsStock, ...nouveauxMvts],
          };
        }),

      addVenteJournaliere: (vente) => {
        syncAddVenteJournaliere(vente);
        set((state) => ({
          ventesJournalieres: [...state.ventesJournalieres, vente],
        }));
      },
      removeVenteJournaliere: (id) => {
        syncDeleteVenteJournaliere(id);
        set((state) => ({
          ventesJournalieres: state.ventesJournalieres.filter(
            (v) => v.id !== id,
          ),
        }));
      },

      validerJournee: (cloture) =>
        set((state) => {
          const newCloture: ClotureJournaliere = {
            ...cloture,
            id: crypto.randomUUID(),
            valide: true,
          };

          // Déduire le stock pour chaque vente de la clôture
          const nouveauxMvtsStock: MouvementStock[] = [];
          for (const vente of cloture.ventes) {
            const recette = state.recettes.find(
              (r) => r.id === vente.recetteId,
            );
            if (!recette) continue;
            for (const ligne of recette.ingredients) {
              const qte =
                Math.round(vente.quantite * ligne.quantiteNette * 10000) /
                10000;
              nouveauxMvtsStock.push({
                id: crypto.randomUUID(),
                ingredientId: ligne.ingredientId,
                quantite: qte,
                type: "sortie" as const,
                motif: "Vente" as const,
                date: new Date().toISOString(),
              });
            }
          }

          // Enregistrer la vente journalière pour sync de l'historique
          const nouvelleVente: VenteJournaliere = {
            id: crypto.randomUUID(),
            date: cloture.date,
            montant: cloture.caTotal,
          };

          syncAddCloture(newCloture);
          nouveauxMvtsStock.forEach(syncAddMouvementStock);
          syncAddVenteJournaliere(nouvelleVente);
          return {
            historiqueClotures: [...state.historiqueClotures, newCloture],
            mouvementsStock: [...state.mouvementsStock, ...nouveauxMvtsStock],
            ventesJournalieres: [...state.ventesJournalieres, nouvelleVente],
          };
        }),
    }),
    {
      name: "mini-erp-store",
      version: 18,
      migrate: (persistedState: unknown, _version: number): unknown => {
        // Force a full reset to defaults if required fields are absent.
        // This guarantees a clean data environment after schema migrations.
        if (!persistedState) return undefined;
        const ps = persistedState as {
          hypothesesBP?: Partial<HypothesesBP>;
          configEtablissement?: Partial<ConfigEtablissement>;
          mouvementsStock?: unknown;
          historiqueClotures?: unknown;
        };
        if (
          ps.hypothesesBP?.croissanceCA_BP === undefined ||
          ps.hypothesesBP?.statutJuridique === undefined ||
          ps.hypothesesBP?.inflationCharges_BP === undefined ||
          ps.hypothesesBP?.croissanceCA_Reel === undefined ||
          ps.hypothesesBP?.inflationCharges_Reel === undefined
        ) {
          return undefined;
        }
        // Ensure configEtablissement is always present (added in v18)
        if (!ps.configEtablissement) {
          ps.configEtablissement = { ...DEFAULT_CONFIG_ETABLISSEMENT };
        } else {
          // Backfill any missing fields
          ps.configEtablissement = {
            ...DEFAULT_CONFIG_ETABLISSEMENT,
            ...ps.configEtablissement,
          };
        }
        // Ensure mouvementsStock is always an array
        if (!Array.isArray(ps.mouvementsStock)) {
          ps.mouvementsStock = [];
        }
        // Migrate legacy motif values to strict union
        if (Array.isArray(ps.mouvementsStock)) {
          const MOTIF_MAP: Record<string, MouvementStock["motif"]> = {
            achat: "Achat",
            vente: "Vente",
            perte: "Perte",
            péremption: "Péremption",
            Achat: "Achat",
            Vente: "Vente",
            Perte: "Perte",
            Péremption: "Péremption",
          };
          ps.mouvementsStock = (
            ps.mouvementsStock as Array<{ motif?: string }>
          ).map((m) => ({
            ...m,
            motif: MOTIF_MAP[m.motif ?? ""] ?? "Achat",
          }));
        }
        // Ensure historiqueClotures is always an array (added in v17)
        if (!Array.isArray(ps.historiqueClotures)) {
          ps.historiqueClotures = [];
        }
        return persistedState;
      },
    },
  ),
);
