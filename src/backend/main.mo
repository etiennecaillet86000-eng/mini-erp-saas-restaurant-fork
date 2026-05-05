import Map "mo:core/Map";
import Types "types/erp";
import ErpApi "mixins/erp-api";

actor {

  stable var salaires = Map.empty<Text, Types.Salaire>();
  stable var fraisFixes = Map.empty<Text, Types.FraisFixe>();
  stable var ingredients = Map.empty<Text, Types.Ingredient>();
  stable var recettes = Map.empty<Text, Types.Recette>();
  stable var categoriesCarte = Map.empty<Text, Types.CategorieCarte>();
  stable var hypothesesBP = Map.empty<Text, Types.HypothesesBP>();
  stable var associes = Map.empty<Text, Types.Associe>();
  stable var emprunts = Map.empty<Text, Types.Emprunt>();
  stable var immobilisations = Map.empty<Text, Types.Immobilisation>();
  stable var mouvementsStock = Map.empty<Text, Types.MouvementStock>();
  stable var ventesJournalieres = Map.empty<Text, Types.VenteJournaliere>();
  stable var historiqueClotures = Map.empty<Text, Types.HistoriqueCloture>();
  // counter store: entity prefix -> current counter
  stable var counters = Map.empty<Text, Nat>();

  include ErpApi(
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
    counters,
  );

};

