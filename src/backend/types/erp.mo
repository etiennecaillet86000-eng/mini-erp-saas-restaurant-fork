
module {

  // ---------- Salaries ----------
  public type Salaire = {
    id : Text;
    nom : Text;
    prenom : Text;
    poste : Text;
    typeContrat : Text;
    heuresHebdo : Float;
    salaireNet : Float;
    chargesPatronales : Float;
    coutTotalEmployeur : Float;
  };

  public type SalaireInput = {
    nom : Text;
    prenom : Text;
    poste : Text;
    typeContrat : Text;
    heuresHebdo : Float;
    salaireNet : Float;
    chargesPatronales : Float;
    coutTotalEmployeur : Float;
  };

  // ---------- FraisFixes ----------
  public type FraisFixe = {
    id : Text;
    libelle : Text;
    montant : Float;
    categorie : Text;
    frequence : Text;
  };

  public type FraisFixeInput = {
    libelle : Text;
    montant : Float;
    categorie : Text;
    frequence : Text;
  };

  // ---------- Ingredients ----------
  public type Ingredient = {
    id : Text;
    nom : Text;
    unite : Text;
    prixAchatHT : Float;
    perteMatierePct : Float;
    famille : Text;
    seuilSecurite : Float;
  };

  public type IngredientInput = {
    nom : Text;
    unite : Text;
    prixAchatHT : Float;
    perteMatierePct : Float;
    famille : Text;
    seuilSecurite : Float;
  };

  // ---------- Recettes ----------
  public type RecetteIngredient = {
    ingredientId : Text;
    quantiteNette : Float;
  };

  public type Recette = {
    id : Text;
    nom : Text;
    categorie : Text;
    categorieId : Text;
    prixVenteHT : Float;
    volumeHebdo : Float;
    tva : Float;
    ingredients : [RecetteIngredient];
  };

  public type RecetteInput = {
    nom : Text;
    categorie : Text;
    categorieId : Text;
    prixVenteHT : Float;
    volumeHebdo : Float;
    tva : Float;
    ingredients : [RecetteIngredient];
  };

  // ---------- CategoriesCarte ----------
  public type CategorieCarte = {
    id : Text;
    nom : Text;
    mixCiblePct : Float;
    ticketMoyen : Float;
    foodCostCible : Float;
  };

  public type CategorieCarteInput = {
    nom : Text;
    mixCiblePct : Float;
    ticketMoyen : Float;
    foodCostCible : Float;
  };

  // ---------- HypothesesBP (singleton) ----------
  public type HypothesesBP = {
    couvertsParJour : Float;
    joursOuvertureParSemaine : Float;
    semainesOuverture : Float;
    tauxCroissanceAnnuel : Float;
    tauxInflationAnnuel : Float;
    joursOuvertureAn : Float;
    objectifCAannuel : Float;
    ticketMoyenCible : Float;
    margeCibleGlobale : Float;
    tauxChargesSalariales : Float;
    tauxChargesPatronales : Float;
    tauxIS_bas : Float;
    tauxIS_haut : Float;
    seuilIS : Float;
    tauxCroissanceCA : Float;
    tauxInflationCharges : Float;
    croissanceCA_BP : Float;
    inflationCharges_BP : Float;
    croissanceCA_Reel : Float;
    inflationCharges_Reel : Float;
    remunerationAssociesAnnuelle : Float;
    pacteSocialActif : Bool;
    statutJuridique : Text;
  };

  // ---------- Associes ----------
  public type Associe = {
    id : Text;
    nom : Text;
    remunerationMensuelle : Float;
    apportInitial : Float;
    montantRembourse : Float;
  };

  public type AssocieInput = {
    nom : Text;
    remunerationMensuelle : Float;
    apportInitial : Float;
    montantRembourse : Float;
  };

  // ---------- Emprunts ----------
  public type Emprunt = {
    id : Text;
    nom : Text;
    capitalInitial : Float;
    tauxAnnuel : Float;
    dureeMois : Int;
    dateDebut : Text;
  };

  public type EmpruntInput = {
    nom : Text;
    capitalInitial : Float;
    tauxAnnuel : Float;
    dureeMois : Int;
    dateDebut : Text;
  };

  // ---------- Immobilisations ----------
  public type Immobilisation = {
    id : Text;
    nom : Text;
    valeurAchatHT : Float;
    dureeAmortissementAns : Int;
    type_ : Text;
    dateAchat : Text;
  };

  public type ImmobilisationInput = {
    nom : Text;
    valeurAchatHT : Float;
    dureeAmortissementAns : Int;
    type_ : Text;
    dateAchat : Text;
  };

  // ---------- MouvementsStock ----------
  public type MouvementStock = {
    id : Text;
    ingredientId : Text;
    quantite : Float;
    type_ : Text;
    date : Text;
    motif : Text;
  };

  public type MouvementStockInput = {
    ingredientId : Text;
    quantite : Float;
    type_ : Text;
    date : Text;
    motif : Text;
  };

  // ---------- VentesJournalieres ----------
  public type VenteJournaliere = {
    id : Text;
    date : Text;
    montant : Float;
  };

  public type VenteJournaliereInput = {
    date : Text;
    montant : Float;
  };

  // ---------- HistoriqueClotures ----------
  public type CloturVente = {
    recetteId : Text;
    quantite : Float;
  };

  public type HistoriqueClotureInput = {
    date : Text;
    caTotal : Float;
    chargesVariables : Float;
    valide : Bool;
    ventes : [CloturVente];
  };

  public type HistoriqueCloture = {
    id : Text;
    date : Text;
    caTotal : Float;
    chargesVariables : Float;
    valide : Bool;
    ventes : [CloturVente];
  };

};
