import Map "mo:core/Map";
import ErpLib "../lib/erp";
import Types "../types/erp";

mixin (
  salaires : Map.Map<Text, Types.Salaire>,
  fraisFixes : Map.Map<Text, Types.FraisFixe>,
  ingredients : Map.Map<Text, Types.Ingredient>,
  recettes : Map.Map<Text, Types.Recette>,
  categoriesCarte : Map.Map<Text, Types.CategorieCarte>,
  hypothesesBP : Map.Map<Text, Types.HypothesesBP>,
  associes : Map.Map<Text, Types.Associe>,
  emprunts : Map.Map<Text, Types.Emprunt>,
  immobilisations : Map.Map<Text, Types.Immobilisation>,
  mouvementsStock : Map.Map<Text, Types.MouvementStock>,
  ventesJournalieres : Map.Map<Text, Types.VenteJournaliere>,
  historiqueClotures : Map.Map<Text, Types.HistoriqueCloture>,
  counters : Map.Map<Text, Nat>,
) {

  // ---- Salaires ----
  public query func listSalaires() : async [Types.Salaire] {
    ErpLib.listSalaires(salaires);
  };

  public query func getSalaireById(id : Text) : async ?Types.Salaire {
    ErpLib.getSalaire(salaires, id);
  };

  public func createSalaire(input : Types.SalaireInput) : async Text {
    let n = switch (counters.get("sal")) { case (?v) v + 1; case null 1 };
    counters.add("sal", n);
    ErpLib.createSalaire(salaires, n, input);
  };

  public func updateSalaire(id : Text, input : Types.SalaireInput) : async Bool {
    ErpLib.updateSalaire(salaires, id, input);
  };

  public func deleteSalaire(id : Text) : async Bool {
    ErpLib.deleteSalaire(salaires, id);
  };

  // ---- FraisFixes ----
  public query func listFraisFixes() : async [Types.FraisFixe] {
    ErpLib.listFraisFixes(fraisFixes);
  };

  public query func getFraisFixeById(id : Text) : async ?Types.FraisFixe {
    ErpLib.getFraisFixe(fraisFixes, id);
  };

  public func createFraisFixe(input : Types.FraisFixeInput) : async Text {
    let n = switch (counters.get("ff")) { case (?v) v + 1; case null 1 };
    counters.add("ff", n);
    ErpLib.createFraisFixe(fraisFixes, n, input);
  };

  public func updateFraisFixe(id : Text, input : Types.FraisFixeInput) : async Bool {
    ErpLib.updateFraisFixe(fraisFixes, id, input);
  };

  public func deleteFraisFixe(id : Text) : async Bool {
    ErpLib.deleteFraisFixe(fraisFixes, id);
  };

  // ---- Ingredients ----
  public query func listIngredients() : async [Types.Ingredient] {
    ErpLib.listIngredients(ingredients);
  };

  public query func getIngredientById(id : Text) : async ?Types.Ingredient {
    ErpLib.getIngredient(ingredients, id);
  };

  public func createIngredient(input : Types.IngredientInput) : async Text {
    let n = switch (counters.get("ing")) { case (?v) v + 1; case null 1 };
    counters.add("ing", n);
    ErpLib.createIngredient(ingredients, n, input);
  };

  public func updateIngredient(id : Text, input : Types.IngredientInput) : async Bool {
    ErpLib.updateIngredient(ingredients, id, input);
  };

  public func deleteIngredient(id : Text) : async Bool {
    ErpLib.deleteIngredient(ingredients, id);
  };

  // ---- Recettes ----
  public query func listRecettes() : async [Types.Recette] {
    ErpLib.listRecettes(recettes);
  };

  public query func getRecetteById(id : Text) : async ?Types.Recette {
    ErpLib.getRecette(recettes, id);
  };

  public func createRecette(input : Types.RecetteInput) : async Text {
    let n = switch (counters.get("rec")) { case (?v) v + 1; case null 1 };
    counters.add("rec", n);
    ErpLib.createRecette(recettes, n, input);
  };

  public func updateRecette(id : Text, input : Types.RecetteInput) : async Bool {
    ErpLib.updateRecette(recettes, id, input);
  };

  public func deleteRecette(id : Text) : async Bool {
    ErpLib.deleteRecette(recettes, id);
  };

  // ---- CategoriesCarte ----
  public query func listCategoriesCarte() : async [Types.CategorieCarte] {
    ErpLib.listCategoriesCarte(categoriesCarte);
  };

  public query func getCategorieCarteById(id : Text) : async ?Types.CategorieCarte {
    ErpLib.getCategorieCarte(categoriesCarte, id);
  };

  public func createCategorieCarte(input : Types.CategorieCarteInput) : async Text {
    let n = switch (counters.get("cat")) { case (?v) v + 1; case null 1 };
    counters.add("cat", n);
    ErpLib.createCategorieCarte(categoriesCarte, n, input);
  };

  public func updateCategorieCarte(id : Text, input : Types.CategorieCarteInput) : async Bool {
    ErpLib.updateCategorieCarte(categoriesCarte, id, input);
  };

  public func deleteCategorieCarte(id : Text) : async Bool {
    ErpLib.deleteCategorieCarte(categoriesCarte, id);
  };

  // ---- HypothesesBP (singleton) ----
  public query func getHypothesesBP() : async ?Types.HypothesesBP {
    ErpLib.getHypothesesBP(hypothesesBP);
  };

  public func saveHypothesesBP(hypotheses : Types.HypothesesBP) : async Bool {
    ErpLib.saveHypothesesBP(hypothesesBP, hypotheses);
  };

  // ---- Associes ----
  public query func listAssocies() : async [Types.Associe] {
    ErpLib.listAssocies(associes);
  };

  public query func getAssocieById(id : Text) : async ?Types.Associe {
    ErpLib.getAssocie(associes, id);
  };

  public func createAssocie(input : Types.AssocieInput) : async Text {
    let n = switch (counters.get("ass")) { case (?v) v + 1; case null 1 };
    counters.add("ass", n);
    ErpLib.createAssocie(associes, n, input);
  };

  public func updateAssocie(id : Text, input : Types.AssocieInput) : async Bool {
    ErpLib.updateAssocie(associes, id, input);
  };

  public func deleteAssocie(id : Text) : async Bool {
    ErpLib.deleteAssocie(associes, id);
  };

  // ---- Emprunts ----
  public query func listEmprunts() : async [Types.Emprunt] {
    ErpLib.listEmprunts(emprunts);
  };

  public query func getEmpruntById(id : Text) : async ?Types.Emprunt {
    ErpLib.getEmprunt(emprunts, id);
  };

  public func createEmprunt(input : Types.EmpruntInput) : async Text {
    let n = switch (counters.get("emp")) { case (?v) v + 1; case null 1 };
    counters.add("emp", n);
    ErpLib.createEmprunt(emprunts, n, input);
  };

  public func updateEmprunt(id : Text, input : Types.EmpruntInput) : async Bool {
    ErpLib.updateEmprunt(emprunts, id, input);
  };

  public func deleteEmprunt(id : Text) : async Bool {
    ErpLib.deleteEmprunt(emprunts, id);
  };

  // ---- Immobilisations ----
  public query func listImmobilisations() : async [Types.Immobilisation] {
    ErpLib.listImmobilisations(immobilisations);
  };

  public query func getImmobilisationById(id : Text) : async ?Types.Immobilisation {
    ErpLib.getImmobilisation(immobilisations, id);
  };

  public func createImmobilisation(input : Types.ImmobilisationInput) : async Text {
    let n = switch (counters.get("immo")) { case (?v) v + 1; case null 1 };
    counters.add("immo", n);
    ErpLib.createImmobilisation(immobilisations, n, input);
  };

  public func updateImmobilisation(id : Text, input : Types.ImmobilisationInput) : async Bool {
    ErpLib.updateImmobilisation(immobilisations, id, input);
  };

  public func deleteImmobilisation(id : Text) : async Bool {
    ErpLib.deleteImmobilisation(immobilisations, id);
  };

  // ---- MouvementsStock ----
  public query func listMouvementsStock() : async [Types.MouvementStock] {
    ErpLib.listMouvementsStock(mouvementsStock);
  };

  public query func getMouvementStockById(id : Text) : async ?Types.MouvementStock {
    ErpLib.getMouvementStock(mouvementsStock, id);
  };

  public func createMouvementStock(input : Types.MouvementStockInput) : async Text {
    let n = switch (counters.get("mvt")) { case (?v) v + 1; case null 1 };
    counters.add("mvt", n);
    ErpLib.createMouvementStock(mouvementsStock, n, input);
  };

  public func updateMouvementStock(id : Text, input : Types.MouvementStockInput) : async Bool {
    ErpLib.updateMouvementStock(mouvementsStock, id, input);
  };

  public func deleteMouvementStock(id : Text) : async Bool {
    ErpLib.deleteMouvementStock(mouvementsStock, id);
  };

  // ---- VentesJournalieres ----
  public query func listVentesJournalieres() : async [Types.VenteJournaliere] {
    ErpLib.listVentesJournalieres(ventesJournalieres);
  };

  public query func getVenteJournaliereById(id : Text) : async ?Types.VenteJournaliere {
    ErpLib.getVenteJournaliere(ventesJournalieres, id);
  };

  public func createVenteJournaliere(input : Types.VenteJournaliereInput) : async Text {
    let n = switch (counters.get("vj")) { case (?v) v + 1; case null 1 };
    counters.add("vj", n);
    ErpLib.createVenteJournaliere(ventesJournalieres, n, input);
  };

  public func updateVenteJournaliere(id : Text, input : Types.VenteJournaliereInput) : async Bool {
    ErpLib.updateVenteJournaliere(ventesJournalieres, id, input);
  };

  public func deleteVenteJournaliere(id : Text) : async Bool {
    ErpLib.deleteVenteJournaliere(ventesJournalieres, id);
  };

  // ---- HistoriqueClotures ----
  public query func listHistoriqueClotures() : async [Types.HistoriqueCloture] {
    ErpLib.listHistoriqueClotures(historiqueClotures);
  };

  public query func getHistoriqueClotureById(id : Text) : async ?Types.HistoriqueCloture {
    ErpLib.getHistoriqueClotureById(historiqueClotures, id);
  };

  public func createHistoriqueClotureEntry(input : Types.HistoriqueClotureInput) : async Text {
    let n = switch (counters.get("clot")) { case (?v) v + 1; case null 1 };
    counters.add("clot", n);
    ErpLib.createHistoriqueClotureEntry(historiqueClotures, n, input);
  };

  public func updateHistoriqueClotureEntry(id : Text, input : Types.HistoriqueClotureInput) : async Bool {
    ErpLib.updateHistoriqueClotureEntry(historiqueClotures, id, input);
  };

  public func deleteHistoriqueClotureEntry(id : Text) : async Bool {
    ErpLib.deleteHistoriqueClotureEntry(historiqueClotures, id);
  };

};
