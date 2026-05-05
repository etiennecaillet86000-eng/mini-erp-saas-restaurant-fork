import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface VenteJournaliere {
    id: string;
    date: string;
    montant: number;
}
export interface RecetteIngredient {
    quantiteNette: number;
    ingredientId: string;
}
export interface MouvementStockInput {
    motif: string;
    date: string;
    type: string;
    quantite: number;
    ingredientId: string;
}
export interface Recette {
    id: string;
    nom: string;
    tva: number;
    categorie: string;
    prixVenteHT: number;
    volumeHebdo: number;
    categorieId: string;
    ingredients: Array<RecetteIngredient>;
}
export interface RecetteInput {
    nom: string;
    tva: number;
    categorie: string;
    prixVenteHT: number;
    volumeHebdo: number;
    categorieId: string;
    ingredients: Array<RecetteIngredient>;
}
export interface FraisFixeInput {
    categorie: string;
    libelle: string;
    montant: number;
    frequence: string;
}
export interface SalaireInput {
    nom: string;
    chargesPatronales: number;
    typeContrat: string;
    salaireNet: number;
    coutTotalEmployeur: number;
    heuresHebdo: number;
    prenom: string;
    poste: string;
}
export interface FraisFixe {
    id: string;
    categorie: string;
    libelle: string;
    montant: number;
    frequence: string;
}
export interface VenteJournaliereInput {
    date: string;
    montant: number;
}
export interface MouvementStock {
    id: string;
    motif: string;
    date: string;
    type: string;
    quantite: number;
    ingredientId: string;
}
export interface Immobilisation {
    id: string;
    nom: string;
    type: string;
    valeurAchatHT: number;
    dureeAmortissementAns: bigint;
    dateAchat: string;
}
export interface IngredientInput {
    nom: string;
    seuilSecurite: number;
    famille: string;
    prixAchatHT: number;
    unite: string;
    perteMatierePct: number;
}
export interface HistoriqueCloture {
    id: string;
    chargesVariables: number;
    date: string;
    valide: boolean;
    caTotal: number;
    ventes: Array<CloturVente>;
}
export interface HypothesesBP {
    croissanceCA_Reel: number;
    joursOuvertureParSemaine: number;
    inflationCharges_Reel: number;
    inflationCharges_BP: number;
    objectifCAannuel: number;
    pacteSocialActif: boolean;
    semainesOuverture: number;
    tauxIS_haut: number;
    croissanceCA_BP: number;
    margeCibleGlobale: number;
    remunerationAssociesAnnuelle: number;
    couvertsParJour: number;
    tauxCroissanceCA: number;
    joursOuvertureAn: number;
    tauxCroissanceAnnuel: number;
    seuilIS: number;
    ticketMoyenCible: number;
    tauxInflationCharges: number;
    statutJuridique: string;
    tauxChargesPatronales: number;
    tauxInflationAnnuel: number;
    tauxChargesSalariales: number;
    tauxIS_bas: number;
}
export interface HistoriqueClotureInput {
    chargesVariables: number;
    date: string;
    valide: boolean;
    caTotal: number;
    ventes: Array<CloturVente>;
}
export interface Ingredient {
    id: string;
    nom: string;
    seuilSecurite: number;
    famille: string;
    prixAchatHT: number;
    unite: string;
    perteMatierePct: number;
}
export interface Emprunt {
    id: string;
    nom: string;
    capitalInitial: number;
    tauxAnnuel: number;
    dateDebut: string;
    dureeMois: bigint;
}
export interface CloturVente {
    recetteId: string;
    quantite: number;
}
export interface CategorieCarte {
    id: string;
    nom: string;
    ticketMoyen: number;
    foodCostCible: number;
    mixCiblePct: number;
}
export interface AssocieInput {
    nom: string;
    montantRembourse: number;
    apportInitial: number;
    remunerationMensuelle: number;
}
export interface Associe {
    id: string;
    nom: string;
    montantRembourse: number;
    apportInitial: number;
    remunerationMensuelle: number;
}
export interface ImmobilisationInput {
    nom: string;
    type: string;
    valeurAchatHT: number;
    dureeAmortissementAns: bigint;
    dateAchat: string;
}
export interface Salaire {
    id: string;
    nom: string;
    chargesPatronales: number;
    typeContrat: string;
    salaireNet: number;
    coutTotalEmployeur: number;
    heuresHebdo: number;
    prenom: string;
    poste: string;
}
export interface EmpruntInput {
    nom: string;
    capitalInitial: number;
    tauxAnnuel: number;
    dateDebut: string;
    dureeMois: bigint;
}
export interface CategorieCarteInput {
    nom: string;
    ticketMoyen: number;
    foodCostCible: number;
    mixCiblePct: number;
}
export interface backendInterface {
    createAssocie(input: AssocieInput): Promise<string>;
    createCategorieCarte(input: CategorieCarteInput): Promise<string>;
    createEmprunt(input: EmpruntInput): Promise<string>;
    createFraisFixe(input: FraisFixeInput): Promise<string>;
    createHistoriqueClotureEntry(input: HistoriqueClotureInput): Promise<string>;
    createImmobilisation(input: ImmobilisationInput): Promise<string>;
    createIngredient(input: IngredientInput): Promise<string>;
    createMouvementStock(input: MouvementStockInput): Promise<string>;
    createRecette(input: RecetteInput): Promise<string>;
    createSalaire(input: SalaireInput): Promise<string>;
    createVenteJournaliere(input: VenteJournaliereInput): Promise<string>;
    deleteAssocie(id: string): Promise<boolean>;
    deleteCategorieCarte(id: string): Promise<boolean>;
    deleteEmprunt(id: string): Promise<boolean>;
    deleteFraisFixe(id: string): Promise<boolean>;
    deleteHistoriqueClotureEntry(id: string): Promise<boolean>;
    deleteImmobilisation(id: string): Promise<boolean>;
    deleteIngredient(id: string): Promise<boolean>;
    deleteMouvementStock(id: string): Promise<boolean>;
    deleteRecette(id: string): Promise<boolean>;
    deleteSalaire(id: string): Promise<boolean>;
    deleteVenteJournaliere(id: string): Promise<boolean>;
    getAssocieById(id: string): Promise<Associe | null>;
    getCategorieCarteById(id: string): Promise<CategorieCarte | null>;
    getEmpruntById(id: string): Promise<Emprunt | null>;
    getFraisFixeById(id: string): Promise<FraisFixe | null>;
    getHistoriqueClotureById(id: string): Promise<HistoriqueCloture | null>;
    getHypothesesBP(): Promise<HypothesesBP | null>;
    getImmobilisationById(id: string): Promise<Immobilisation | null>;
    getIngredientById(id: string): Promise<Ingredient | null>;
    getMouvementStockById(id: string): Promise<MouvementStock | null>;
    getRecetteById(id: string): Promise<Recette | null>;
    getSalaireById(id: string): Promise<Salaire | null>;
    getVenteJournaliereById(id: string): Promise<VenteJournaliere | null>;
    listAssocies(): Promise<Array<Associe>>;
    listCategoriesCarte(): Promise<Array<CategorieCarte>>;
    listEmprunts(): Promise<Array<Emprunt>>;
    listFraisFixes(): Promise<Array<FraisFixe>>;
    listHistoriqueClotures(): Promise<Array<HistoriqueCloture>>;
    listImmobilisations(): Promise<Array<Immobilisation>>;
    listIngredients(): Promise<Array<Ingredient>>;
    listMouvementsStock(): Promise<Array<MouvementStock>>;
    listRecettes(): Promise<Array<Recette>>;
    listSalaires(): Promise<Array<Salaire>>;
    listVentesJournalieres(): Promise<Array<VenteJournaliere>>;
    saveHypothesesBP(hypotheses: HypothesesBP): Promise<boolean>;
    updateAssocie(id: string, input: AssocieInput): Promise<boolean>;
    updateCategorieCarte(id: string, input: CategorieCarteInput): Promise<boolean>;
    updateEmprunt(id: string, input: EmpruntInput): Promise<boolean>;
    updateFraisFixe(id: string, input: FraisFixeInput): Promise<boolean>;
    updateHistoriqueClotureEntry(id: string, input: HistoriqueClotureInput): Promise<boolean>;
    updateImmobilisation(id: string, input: ImmobilisationInput): Promise<boolean>;
    updateIngredient(id: string, input: IngredientInput): Promise<boolean>;
    updateMouvementStock(id: string, input: MouvementStockInput): Promise<boolean>;
    updateRecette(id: string, input: RecetteInput): Promise<boolean>;
    updateSalaire(id: string, input: SalaireInput): Promise<boolean>;
    updateVenteJournaliere(id: string, input: VenteJournaliereInput): Promise<boolean>;
}
