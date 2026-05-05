import Map "mo:core/Map";
import Types "../types/erp";

module {

  // ---- ID generation helpers ----
  public func nextId(counter : Nat, prefix : Text) : Text {
    prefix # "-" # counter.toText();
  };

  // ---- Salaires ----
  public func listSalaires(store : Map.Map<Text, Types.Salaire>) : [Types.Salaire] {
    store.values().toArray();
  };

  public func getSalaire(store : Map.Map<Text, Types.Salaire>, id : Text) : ?Types.Salaire {
    store.get(id);
  };

  public func createSalaire(
    store : Map.Map<Text, Types.Salaire>,
    counter : Nat,
    input : Types.SalaireInput,
  ) : Text {
    let id = nextId(counter, "sal");
    let record : Types.Salaire = { id; nom = input.nom; prenom = input.prenom; poste = input.poste; typeContrat = input.typeContrat; heuresHebdo = input.heuresHebdo; salaireNet = input.salaireNet; chargesPatronales = input.chargesPatronales; coutTotalEmployeur = input.coutTotalEmployeur };
    store.add(id, record);
    id;
  };

  public func updateSalaire(
    store : Map.Map<Text, Types.Salaire>,
    id : Text,
    input : Types.SalaireInput,
  ) : Bool {
    switch (store.get(id)) {
      case null false;
      case (?_existing) {
        let updated : Types.Salaire = { id; nom = input.nom; prenom = input.prenom; poste = input.poste; typeContrat = input.typeContrat; heuresHebdo = input.heuresHebdo; salaireNet = input.salaireNet; chargesPatronales = input.chargesPatronales; coutTotalEmployeur = input.coutTotalEmployeur };
        store.add(id, updated);
        true;
      };
    };
  };

  public func deleteSalaire(store : Map.Map<Text, Types.Salaire>, id : Text) : Bool {
    switch (store.get(id)) {
      case null false;
      case (?_) { store.remove(id); true };
    };
  };

  // ---- FraisFixes ----
  public func listFraisFixes(store : Map.Map<Text, Types.FraisFixe>) : [Types.FraisFixe] {
    store.values().toArray();
  };

  public func getFraisFixe(store : Map.Map<Text, Types.FraisFixe>, id : Text) : ?Types.FraisFixe {
    store.get(id);
  };

  public func createFraisFixe(
    store : Map.Map<Text, Types.FraisFixe>,
    counter : Nat,
    input : Types.FraisFixeInput,
  ) : Text {
    let id = nextId(counter, "ff");
    let record : Types.FraisFixe = { id; libelle = input.libelle; montant = input.montant; categorie = input.categorie; frequence = input.frequence };
    store.add(id, record);
    id;
  };

  public func updateFraisFixe(
    store : Map.Map<Text, Types.FraisFixe>,
    id : Text,
    input : Types.FraisFixeInput,
  ) : Bool {
    switch (store.get(id)) {
      case null false;
      case (?_) {
        store.add(id, { id; libelle = input.libelle; montant = input.montant; categorie = input.categorie; frequence = input.frequence });
        true;
      };
    };
  };

  public func deleteFraisFixe(store : Map.Map<Text, Types.FraisFixe>, id : Text) : Bool {
    switch (store.get(id)) {
      case null false;
      case (?_) { store.remove(id); true };
    };
  };

  // ---- Ingredients ----
  public func listIngredients(store : Map.Map<Text, Types.Ingredient>) : [Types.Ingredient] {
    store.values().toArray();
  };

  public func getIngredient(store : Map.Map<Text, Types.Ingredient>, id : Text) : ?Types.Ingredient {
    store.get(id);
  };

  public func createIngredient(
    store : Map.Map<Text, Types.Ingredient>,
    counter : Nat,
    input : Types.IngredientInput,
  ) : Text {
    let id = nextId(counter, "ing");
    let record : Types.Ingredient = { id; nom = input.nom; unite = input.unite; prixAchatHT = input.prixAchatHT; perteMatierePct = input.perteMatierePct; famille = input.famille; seuilSecurite = input.seuilSecurite };
    store.add(id, record);
    id;
  };

  public func updateIngredient(
    store : Map.Map<Text, Types.Ingredient>,
    id : Text,
    input : Types.IngredientInput,
  ) : Bool {
    switch (store.get(id)) {
      case null false;
      case (?_) {
        store.add(id, { id; nom = input.nom; unite = input.unite; prixAchatHT = input.prixAchatHT; perteMatierePct = input.perteMatierePct; famille = input.famille; seuilSecurite = input.seuilSecurite });
        true;
      };
    };
  };

  public func deleteIngredient(store : Map.Map<Text, Types.Ingredient>, id : Text) : Bool {
    switch (store.get(id)) {
      case null false;
      case (?_) { store.remove(id); true };
    };
  };

  // ---- Recettes ----
  public func listRecettes(store : Map.Map<Text, Types.Recette>) : [Types.Recette] {
    store.values().toArray();
  };

  public func getRecette(store : Map.Map<Text, Types.Recette>, id : Text) : ?Types.Recette {
    store.get(id);
  };

  public func createRecette(
    store : Map.Map<Text, Types.Recette>,
    counter : Nat,
    input : Types.RecetteInput,
  ) : Text {
    let id = nextId(counter, "rec");
    let record : Types.Recette = { id; nom = input.nom; categorie = input.categorie; categorieId = input.categorieId; prixVenteHT = input.prixVenteHT; volumeHebdo = input.volumeHebdo; tva = input.tva; ingredients = input.ingredients };
    store.add(id, record);
    id;
  };

  public func updateRecette(
    store : Map.Map<Text, Types.Recette>,
    id : Text,
    input : Types.RecetteInput,
  ) : Bool {
    switch (store.get(id)) {
      case null false;
      case (?_) {
        store.add(id, { id; nom = input.nom; categorie = input.categorie; categorieId = input.categorieId; prixVenteHT = input.prixVenteHT; volumeHebdo = input.volumeHebdo; tva = input.tva; ingredients = input.ingredients });
        true;
      };
    };
  };

  public func deleteRecette(store : Map.Map<Text, Types.Recette>, id : Text) : Bool {
    switch (store.get(id)) {
      case null false;
      case (?_) { store.remove(id); true };
    };
  };

  // ---- CategoriesCarte ----
  public func listCategoriesCarte(store : Map.Map<Text, Types.CategorieCarte>) : [Types.CategorieCarte] {
    store.values().toArray();
  };

  public func getCategorieCarte(store : Map.Map<Text, Types.CategorieCarte>, id : Text) : ?Types.CategorieCarte {
    store.get(id);
  };

  public func createCategorieCarte(
    store : Map.Map<Text, Types.CategorieCarte>,
    counter : Nat,
    input : Types.CategorieCarteInput,
  ) : Text {
    let id = nextId(counter, "cat");
    let record : Types.CategorieCarte = { id; nom = input.nom; mixCiblePct = input.mixCiblePct; ticketMoyen = input.ticketMoyen; foodCostCible = input.foodCostCible };
    store.add(id, record);
    id;
  };

  public func updateCategorieCarte(
    store : Map.Map<Text, Types.CategorieCarte>,
    id : Text,
    input : Types.CategorieCarteInput,
  ) : Bool {
    switch (store.get(id)) {
      case null false;
      case (?_) {
        store.add(id, { id; nom = input.nom; mixCiblePct = input.mixCiblePct; ticketMoyen = input.ticketMoyen; foodCostCible = input.foodCostCible });
        true;
      };
    };
  };

  public func deleteCategorieCarte(store : Map.Map<Text, Types.CategorieCarte>, id : Text) : Bool {
    switch (store.get(id)) {
      case null false;
      case (?_) { store.remove(id); true };
    };
  };

  // ---- HypothesesBP (singleton) ----
  public func getHypothesesBP(store : Map.Map<Text, Types.HypothesesBP>) : ?Types.HypothesesBP {
    store.get("singleton");
  };

  public func saveHypothesesBP(
    store : Map.Map<Text, Types.HypothesesBP>,
    hypotheses : Types.HypothesesBP,
  ) : Bool {
    store.add("singleton", hypotheses);
    true;
  };

  // ---- Associes ----
  public func listAssocies(store : Map.Map<Text, Types.Associe>) : [Types.Associe] {
    store.values().toArray();
  };

  public func getAssocie(store : Map.Map<Text, Types.Associe>, id : Text) : ?Types.Associe {
    store.get(id);
  };

  public func createAssocie(
    store : Map.Map<Text, Types.Associe>,
    counter : Nat,
    input : Types.AssocieInput,
  ) : Text {
    let id = nextId(counter, "ass");
    let record : Types.Associe = { id; nom = input.nom; remunerationMensuelle = input.remunerationMensuelle; apportInitial = input.apportInitial; montantRembourse = input.montantRembourse };
    store.add(id, record);
    id;
  };

  public func updateAssocie(
    store : Map.Map<Text, Types.Associe>,
    id : Text,
    input : Types.AssocieInput,
  ) : Bool {
    switch (store.get(id)) {
      case null false;
      case (?_) {
        store.add(id, { id; nom = input.nom; remunerationMensuelle = input.remunerationMensuelle; apportInitial = input.apportInitial; montantRembourse = input.montantRembourse });
        true;
      };
    };
  };

  public func deleteAssocie(store : Map.Map<Text, Types.Associe>, id : Text) : Bool {
    switch (store.get(id)) {
      case null false;
      case (?_) { store.remove(id); true };
    };
  };

  // ---- Emprunts ----
  public func listEmprunts(store : Map.Map<Text, Types.Emprunt>) : [Types.Emprunt] {
    store.values().toArray();
  };

  public func getEmprunt(store : Map.Map<Text, Types.Emprunt>, id : Text) : ?Types.Emprunt {
    store.get(id);
  };

  public func createEmprunt(
    store : Map.Map<Text, Types.Emprunt>,
    counter : Nat,
    input : Types.EmpruntInput,
  ) : Text {
    let id = nextId(counter, "emp");
    let record : Types.Emprunt = { id; nom = input.nom; capitalInitial = input.capitalInitial; tauxAnnuel = input.tauxAnnuel; dureeMois = input.dureeMois; dateDebut = input.dateDebut };
    store.add(id, record);
    id;
  };

  public func updateEmprunt(
    store : Map.Map<Text, Types.Emprunt>,
    id : Text,
    input : Types.EmpruntInput,
  ) : Bool {
    switch (store.get(id)) {
      case null false;
      case (?_) {
        store.add(id, { id; nom = input.nom; capitalInitial = input.capitalInitial; tauxAnnuel = input.tauxAnnuel; dureeMois = input.dureeMois; dateDebut = input.dateDebut });
        true;
      };
    };
  };

  public func deleteEmprunt(store : Map.Map<Text, Types.Emprunt>, id : Text) : Bool {
    switch (store.get(id)) {
      case null false;
      case (?_) { store.remove(id); true };
    };
  };

  // ---- Immobilisations ----
  public func listImmobilisations(store : Map.Map<Text, Types.Immobilisation>) : [Types.Immobilisation] {
    store.values().toArray();
  };

  public func getImmobilisation(store : Map.Map<Text, Types.Immobilisation>, id : Text) : ?Types.Immobilisation {
    store.get(id);
  };

  public func createImmobilisation(
    store : Map.Map<Text, Types.Immobilisation>,
    counter : Nat,
    input : Types.ImmobilisationInput,
  ) : Text {
    let id = nextId(counter, "immo");
    let record : Types.Immobilisation = { id; nom = input.nom; valeurAchatHT = input.valeurAchatHT; dureeAmortissementAns = input.dureeAmortissementAns; type_ = input.type_; dateAchat = input.dateAchat };
    store.add(id, record);
    id;
  };

  public func updateImmobilisation(
    store : Map.Map<Text, Types.Immobilisation>,
    id : Text,
    input : Types.ImmobilisationInput,
  ) : Bool {
    switch (store.get(id)) {
      case null false;
      case (?_) {
        store.add(id, { id; nom = input.nom; valeurAchatHT = input.valeurAchatHT; dureeAmortissementAns = input.dureeAmortissementAns; type_ = input.type_; dateAchat = input.dateAchat });
        true;
      };
    };
  };

  public func deleteImmobilisation(store : Map.Map<Text, Types.Immobilisation>, id : Text) : Bool {
    switch (store.get(id)) {
      case null false;
      case (?_) { store.remove(id); true };
    };
  };

  // ---- MouvementsStock ----
  public func listMouvementsStock(store : Map.Map<Text, Types.MouvementStock>) : [Types.MouvementStock] {
    store.values().toArray();
  };

  public func getMouvementStock(store : Map.Map<Text, Types.MouvementStock>, id : Text) : ?Types.MouvementStock {
    store.get(id);
  };

  public func createMouvementStock(
    store : Map.Map<Text, Types.MouvementStock>,
    counter : Nat,
    input : Types.MouvementStockInput,
  ) : Text {
    let id = nextId(counter, "mvt");
    let record : Types.MouvementStock = { id; ingredientId = input.ingredientId; quantite = input.quantite; type_ = input.type_; date = input.date; motif = input.motif };
    store.add(id, record);
    id;
  };

  public func updateMouvementStock(
    store : Map.Map<Text, Types.MouvementStock>,
    id : Text,
    input : Types.MouvementStockInput,
  ) : Bool {
    switch (store.get(id)) {
      case null false;
      case (?_) {
        store.add(id, { id; ingredientId = input.ingredientId; quantite = input.quantite; type_ = input.type_; date = input.date; motif = input.motif });
        true;
      };
    };
  };

  public func deleteMouvementStock(store : Map.Map<Text, Types.MouvementStock>, id : Text) : Bool {
    switch (store.get(id)) {
      case null false;
      case (?_) { store.remove(id); true };
    };
  };

  // ---- VentesJournalieres ----
  public func listVentesJournalieres(store : Map.Map<Text, Types.VenteJournaliere>) : [Types.VenteJournaliere] {
    store.values().toArray();
  };

  public func getVenteJournaliere(store : Map.Map<Text, Types.VenteJournaliere>, id : Text) : ?Types.VenteJournaliere {
    store.get(id);
  };

  public func createVenteJournaliere(
    store : Map.Map<Text, Types.VenteJournaliere>,
    counter : Nat,
    input : Types.VenteJournaliereInput,
  ) : Text {
    let id = nextId(counter, "vj");
    let record : Types.VenteJournaliere = { id; date = input.date; montant = input.montant };
    store.add(id, record);
    id;
  };

  public func updateVenteJournaliere(
    store : Map.Map<Text, Types.VenteJournaliere>,
    id : Text,
    input : Types.VenteJournaliereInput,
  ) : Bool {
    switch (store.get(id)) {
      case null false;
      case (?_) {
        store.add(id, { id; date = input.date; montant = input.montant });
        true;
      };
    };
  };

  public func deleteVenteJournaliere(store : Map.Map<Text, Types.VenteJournaliere>, id : Text) : Bool {
    switch (store.get(id)) {
      case null false;
      case (?_) { store.remove(id); true };
    };
  };

  // ---- HistoriqueClotures ----
  public func listHistoriqueClotures(store : Map.Map<Text, Types.HistoriqueCloture>) : [Types.HistoriqueCloture] {
    store.values().toArray();
  };

  public func getHistoriqueClotureById(store : Map.Map<Text, Types.HistoriqueCloture>, id : Text) : ?Types.HistoriqueCloture {
    store.get(id);
  };

  public func createHistoriqueClotureEntry(
    store : Map.Map<Text, Types.HistoriqueCloture>,
    counter : Nat,
    input : Types.HistoriqueClotureInput,
  ) : Text {
    let id = nextId(counter, "clot");
    let record : Types.HistoriqueCloture = { id; date = input.date; caTotal = input.caTotal; chargesVariables = input.chargesVariables; valide = input.valide; ventes = input.ventes };
    store.add(id, record);
    id;
  };

  public func updateHistoriqueClotureEntry(
    store : Map.Map<Text, Types.HistoriqueCloture>,
    id : Text,
    input : Types.HistoriqueClotureInput,
  ) : Bool {
    switch (store.get(id)) {
      case null false;
      case (?_) {
        store.add(id, { id; date = input.date; caTotal = input.caTotal; chargesVariables = input.chargesVariables; valide = input.valide; ventes = input.ventes });
        true;
      };
    };
  };

  public func deleteHistoriqueClotureEntry(store : Map.Map<Text, Types.HistoriqueCloture>, id : Text) : Bool {
    switch (store.get(id)) {
      case null false;
      case (?_) { store.remove(id); true };
    };
  };

};
