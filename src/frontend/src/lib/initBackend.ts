import { useAppStore } from "@/core/store/useAppStore";
import type { Immobilisation, MouvementStock } from "@/core/store/useAppStore";
import type {
  CategoriesFrais,
  FrequenceFrais,
  TypeContrat,
} from "@/core/types/models";
import { getActor } from "@/lib/actor";
import type {
  CategorieCarte,
  IngredientFB,
  RecetteFB,
} from "@/modules/restaurant/types/models";
/**
 * initBackend — fetch all entities from the backend on app load.
 * Called once after authentication, before rendering the main UI.
 * Falls back to localStorage (Zustand persist) if the backend is unavailable.
 */
import { toast } from "sonner";

export async function initializeFromBackend(): Promise<void> {
  try {
    const actor = await getActor();

    const [
      salaires,
      fraisFixes,
      ingredients,
      recettes,
      categoriesCarte,
      hypothesesBP,
      associes,
      emprunts,
      immobilisations,
      mouvementsStock,
      ventesJournalieres,
      historiqueClotures,
    ] = await Promise.all([
      actor.listSalaires(),
      actor.listFraisFixes(),
      actor.listIngredients(),
      actor.listRecettes(),
      actor.listCategoriesCarte(),
      actor.getHypothesesBP(),
      actor.listAssocies(),
      actor.listEmprunts(),
      actor.listImmobilisations(),
      actor.listMouvementsStock(),
      actor.listVentesJournalieres(),
      actor.listHistoriqueClotures(),
    ]);

    const store = useAppStore.getState();

    // Salaires
    if (salaires.length > 0) {
      store.setSalaries(
        salaires.map((s) => ({
          id: s.id,
          nom: s.nom,
          prenom: s.prenom,
          poste: s.poste,
          typeContrat: s.typeContrat as TypeContrat,
          heuresHebdo: s.heuresHebdo,
          salaireNet: s.salaireNet,
          chargesPatronales: s.chargesPatronales,
          coutTotalEmployeur: s.coutTotalEmployeur,
        })),
      );
    }

    // Frais Fixes
    if (fraisFixes.length > 0) {
      store.setFraisFixes(
        fraisFixes.map((f) => ({
          id: f.id,
          libelle: f.libelle,
          montant: f.montant,
          categorie: f.categorie as CategoriesFrais,
          frequence: f.frequence as FrequenceFrais,
        })),
      );
    }

    // Ingrédients
    if (ingredients.length > 0) {
      const mapped: IngredientFB[] = ingredients.map((i) => ({
        id: i.id,
        nom: i.nom,
        unite: i.unite as IngredientFB["unite"],
        prixAchatHT: i.prixAchatHT,
        perteMatierePct: i.perteMatierePct,
        famille: i.famille as IngredientFB["famille"] | undefined,
        seuilSecurite: i.seuilSecurite,
      }));
      useAppStore.setState({ ingredients: mapped });
    }

    // Recettes
    if (recettes.length > 0) {
      const mapped: RecetteFB[] = recettes.map((r) => ({
        id: r.id,
        nom: r.nom,
        categorie: r.categorie as RecetteFB["categorie"] | undefined,
        categorieId: r.categorieId,
        prixVenteHT: r.prixVenteHT,
        volumeHebdo: r.volumeHebdo,
        tva: r.tva,
        ingredients: r.ingredients,
      }));
      useAppStore.setState({ recettes: mapped });
    }

    // Catégories Carte
    if (categoriesCarte.length > 0) {
      const mapped: CategorieCarte[] = categoriesCarte.map((c) => ({
        id: c.id,
        nom: c.nom,
        mixCiblePct: c.mixCiblePct,
        ticketMoyen: c.ticketMoyen,
        foodCostCible: c.foodCostCible,
      }));
      useAppStore.setState({ categoriesCarte: mapped });
    }

    // Hypothèses BP
    if (hypothesesBP) {
      store.setHypothesesBP({
        ...hypothesesBP,
        statutJuridique: (hypothesesBP.statutJuridique === "SARL"
          ? "SARL"
          : "SASU") as "SASU" | "SARL",
      });
    }

    // Associés
    if (associes.length > 0) {
      useAppStore.setState({
        associes: associes.map((a) => ({
          id: a.id,
          nom: a.nom,
          remunerationMensuelle: a.remunerationMensuelle,
          apportInitial: a.apportInitial,
          montantRembourse: a.montantRembourse,
        })),
      });
    }

    // Emprunts
    if (emprunts.length > 0) {
      useAppStore.setState({
        emprunts: emprunts.map((e) => ({
          id: e.id,
          nom: e.nom,
          capitalInitial: e.capitalInitial,
          tauxAnnuel: e.tauxAnnuel,
          dateDebut: e.dateDebut,
          dureeMois: Number(e.dureeMois),
        })),
      });
    }

    // Immobilisations
    if (immobilisations.length > 0) {
      useAppStore.setState({
        immobilisations: immobilisations.map((i) => ({
          id: i.id,
          nom: i.nom,
          type: i.type as Immobilisation["type"],
          valeurAchatHT: i.valeurAchatHT,
          dureeAmortissementAns: Number(i.dureeAmortissementAns),
          dateAchat: i.dateAchat,
        })),
      });
    }

    // Mouvements de stock
    if (mouvementsStock.length > 0) {
      useAppStore.setState({
        mouvementsStock: mouvementsStock.map((m) => ({
          id: m.id,
          ingredientId: m.ingredientId,
          quantite: m.quantite,
          type: m.type as MouvementStock["type"],
          motif: m.motif as MouvementStock["motif"],
          date: m.date,
        })),
      });
    }

    // Ventes Journalières
    if (ventesJournalieres.length > 0) {
      useAppStore.setState({ ventesJournalieres });
    }

    // Historique Clôtures
    if (historiqueClotures.length > 0) {
      useAppStore.setState({
        historiqueClotures: historiqueClotures.map((c) => ({
          id: c.id,
          date: c.date,
          caTotal: c.caTotal,
          chargesVariables: c.chargesVariables,
          valide: c.valide,
          ventes: c.ventes,
        })),
      });
    }
  } catch (err) {
    console.error(
      "[initBackend] Échec du chargement des données depuis le backend:",
      err,
    );
    toast.warning(
      "Connexion au serveur impossible — utilisation des données locales",
    );
  }
}
