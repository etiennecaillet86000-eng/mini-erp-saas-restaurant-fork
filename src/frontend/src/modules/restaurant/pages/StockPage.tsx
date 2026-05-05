/**
 * StockPage.tsx — Module de gestion des stocks (Logistique)
 * Onglets : Entrées · Sorties · Inventaire et Réconciliation
 * RÈGLE SSOT : zéro calcul hors fonctions pures, zéro setState en rendu.
 */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/core/store/useAppStore";
import type { MouvementStock } from "@/core/store/useAppStore";
import type { IngredientFB } from "@/modules/restaurant/types/models";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ClipboardList,
  PackageX,
  RefreshCw,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type MotifSortieManuelle = "Perte" | "Péremption";
type MotifEntree = "Achat";

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function fmtQty(n: number): string {
  return (Math.round(n * 1000) / 1000).toLocaleString("fr-FR", {
    maximumFractionDigits: 3,
  });
}

/**
 * Calcule le stock actuel d'un ingrédient depuis les mouvements.
 * Retourne 0 (jamais NaN/undefined) si aucun mouvement n'existe.
 */
function calcStockActuel(
  ingredientId: string,
  mouvementsStock: MouvementStock[],
): { entrees: number; sorties: number; actuel: number } {
  const mvts = mouvementsStock.filter((m) => m.ingredientId === ingredientId);
  const entrees = mvts
    .filter((m) => m.type === "entree")
    .reduce((s, m) => s + (Number(m.quantite) || 0), 0);
  const sorties = mvts
    .filter((m) => m.type === "sortie")
    .reduce((s, m) => s + (Number(m.quantite) || 0), 0);
  const raw = entrees - sorties;
  return {
    entrees: Math.round(entrees * 1000) / 1000,
    sorties: Math.round(sorties * 1000) / 1000,
    actuel: Number.isFinite(raw) ? Math.round(raw * 1000) / 1000 : 0,
  };
}

function getIngredientLabel(ing: IngredientFB): string {
  return `${ing.nom} (${ing.unite})`;
}

// ─── Tab 1 — Entrées ──────────────────────────────────────────────────────────

function EntreesTab() {
  const ingredients = useAppStore((s) => s.ingredients);
  const addMouvementStock = useAppStore((s) => s.addMouvementStock);

  const [ingredientId, setIngredientId] = useState("");
  const [quantite, setQuantite] = useState("");

  const handleSubmit = () => {
    const qty = Number.parseFloat(quantite);
    if (!ingredientId || !qty || qty <= 0) return;
    const motif: MotifEntree = "Achat";
    addMouvementStock({ ingredientId, quantite: qty, type: "entree", motif });
    setIngredientId("");
    setQuantite("");
    toast.success("Entrée de stock enregistrée", { duration: 3000 });
  };

  return (
    <Card data-ocid="stock.entrees.card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ArrowDownCircle className="h-5 w-5 text-green-500" />
          Enregistrer une entrée de stock
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Indiquez l'ingrédient reçu et la quantité livrée. Le motif sera
          automatiquement "Achat".
        </p>
      </CardHeader>
      <CardContent className="space-y-4 max-w-md">
        <div className="space-y-1.5">
          <Label htmlFor="entree-ingredient">Ingrédient</Label>
          <Select value={ingredientId} onValueChange={setIngredientId}>
            <SelectTrigger
              id="entree-ingredient"
              className="bg-background"
              data-ocid="stock.entrees.ingredient.select"
            >
              <SelectValue placeholder="Sélectionner un ingrédient…" />
            </SelectTrigger>
            <SelectContent>
              {ingredients.length === 0 ? (
                <SelectItem value="__none__" disabled>
                  Aucun ingrédient disponible
                </SelectItem>
              ) : (
                ingredients.map((ing) => (
                  <SelectItem key={ing.id} value={ing.id}>
                    {getIngredientLabel(ing)}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="entree-quantite">Quantité reçue</Label>
          <Input
            id="entree-quantite"
            type="number"
            min={0}
            step={0.001}
            placeholder="0"
            value={quantite}
            onChange={(e) => setQuantite(e.target.value)}
            className="bg-background"
            data-ocid="stock.entrees.quantite.input"
            onFocus={(e) => e.target.select()}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={
            !ingredientId || !quantite || Number.parseFloat(quantite) <= 0
          }
          className="gap-2"
          data-ocid="stock.entrees.submit_button"
        >
          <ArrowDownCircle className="h-4 w-4" />
          Enregistrer l'entrée
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Tab 2 — Sorties ──────────────────────────────────────────────────────────

function SortiesTab() {
  const ingredients = useAppStore((s) => s.ingredients);
  const mouvementsStock = useAppStore((s) => s.mouvementsStock);
  const addMouvementStock = useAppStore((s) => s.addMouvementStock);

  const [ingredientId, setIngredientId] = useState("");
  const [quantite, setQuantite] = useState("");
  const [motif, setMotif] = useState<MotifSortieManuelle | "">("");

  const handleSubmit = () => {
    const qty = Number.parseFloat(quantite);
    if (!ingredientId || !qty || qty <= 0 || !motif) return;
    addMouvementStock({
      ingredientId,
      quantite: qty,
      type: "sortie",
      motif: motif as "Perte" | "Péremption",
    });
    setIngredientId("");
    setQuantite("");
    setMotif("");
    toast.success("Sortie de stock enregistrée", { duration: 3000 });
  };

  // Sorties automatiques (Vente) — triées par date décroissante
  const sortiesAutomatiques = useMemo(() => {
    return [...mouvementsStock]
      .filter((m) => m.type === "sortie" && m.motif === "Vente")
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [mouvementsStock]);

  const findIngredient = (id: string) => ingredients.find((i) => i.id === id);

  return (
    <div className="space-y-6">
      {/* Zone A — Saisies Manuelles */}
      <Card data-ocid="stock.sorties.manuel.card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ArrowUpCircle className="h-5 w-5 text-orange-500" />
            Saisies Manuelles
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enregistrez les pertes et péremptions manuellement.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <Label htmlFor="sortie-ingredient">Ingrédient</Label>
            <Select value={ingredientId} onValueChange={setIngredientId}>
              <SelectTrigger
                id="sortie-ingredient"
                className="bg-background"
                data-ocid="stock.sorties.ingredient.select"
              >
                <SelectValue placeholder="Sélectionner un ingrédient…" />
              </SelectTrigger>
              <SelectContent>
                {ingredients.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    Aucun ingrédient disponible
                  </SelectItem>
                ) : (
                  ingredients.map((ing) => (
                    <SelectItem key={ing.id} value={ing.id}>
                      {getIngredientLabel(ing)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sortie-quantite">Quantité</Label>
            <Input
              id="sortie-quantite"
              type="number"
              min={0}
              step={0.001}
              placeholder="0"
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              className="bg-background"
              data-ocid="stock.sorties.quantite.input"
              onFocus={(e) => e.target.select()}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sortie-motif">Motif</Label>
            <Select
              value={motif}
              onValueChange={(v) => setMotif(v as MotifSortieManuelle)}
            >
              <SelectTrigger
                id="sortie-motif"
                className="bg-background"
                data-ocid="stock.sorties.motif.select"
              >
                <SelectValue placeholder="Choisir un motif…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Perte">Perte</SelectItem>
                <SelectItem value="Péremption">Péremption</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={
              !ingredientId ||
              !quantite ||
              Number.parseFloat(quantite) <= 0 ||
              !motif
            }
            variant="destructive"
            className="gap-2"
            data-ocid="stock.sorties.submit_button"
          >
            <ArrowUpCircle className="h-4 w-4" />
            Enregistrer la sortie
          </Button>
        </CardContent>
      </Card>

      {/* Zone B — Sorties Automatiques (Ventes) — lecture seule */}
      <Card data-ocid="stock.sorties.auto.card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <RefreshCw className="h-4 w-4 text-primary" />
            Sorties Automatiques (Ventes)
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Déductions générées automatiquement depuis les ventes. Lecture
            seule.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {sortiesAutomatiques.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-10 text-center px-6"
              data-ocid="stock.sorties.auto.empty_state"
            >
              <PackageX className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">
                Aucune sortie automatique enregistrée
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="pl-6">Date</TableHead>
                    <TableHead>Ingrédient</TableHead>
                    <TableHead className="text-right">Quantité</TableHead>
                    <TableHead className="pr-6">Motif</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortiesAutomatiques.map((mvt, idx) => {
                    const ing = findIngredient(mvt.ingredientId);
                    return (
                      <TableRow
                        key={mvt.id}
                        className="border-border hover:bg-muted/40"
                        data-ocid={`stock.sorties.auto.item.${idx + 1}`}
                      >
                        <TableCell className="pl-6 text-sm text-muted-foreground tabular-nums">
                          {fmtDate(mvt.date)}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {ing ? getIngredientLabel(ing) : mvt.ingredientId}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm">
                          {fmtQty(mvt.quantite)}
                        </TableCell>
                        <TableCell className="pr-6">
                          <Badge variant="default" className="text-xs">
                            {mvt.motif}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tab 3 — Inventaire et Réconciliation ────────────────────────────────────

type InventaireSortCol = "nom" | "actuel";
type SortDir = "asc" | "desc";

interface InventaireDialogProps {
  ingredient: IngredientFB;
  stockTheorique: number;
  open: boolean;
  onClose: () => void;
  onValider: (stockReel: number) => void;
}

function InventaireDialog({
  ingredient,
  stockTheorique,
  open,
  onClose,
  onValider,
}: InventaireDialogProps) {
  const [stockReelStr, setStockReelStr] = useState("");

  const stockReel = Number.parseFloat(stockReelStr);
  const isValid =
    stockReelStr !== "" && !Number.isNaN(stockReel) && stockReel >= 0;
  const diff = isValid
    ? Math.round((stockReel - stockTheorique) * 1000) / 1000
    : null;

  const handleValider = () => {
    if (!isValid || diff === null) return;
    onValider(stockReel);
    setStockReelStr("");
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      setStockReelStr("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm" data-ocid="stock.inventaire.dialog">
        <DialogHeader>
          <DialogTitle className="text-base">
            Faire l'inventaire — {ingredient.nom}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span>Stock théorique</span>
              <span className="font-medium text-foreground tabular-nums">
                {fmtQty(stockTheorique)} {ingredient.unite}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="stock-reel">
              Stock réel constaté ({ingredient.unite})
            </Label>
            <Input
              id="stock-reel"
              type="number"
              min={0}
              step={0.001}
              placeholder="0"
              value={stockReelStr}
              onChange={(e) => setStockReelStr(e.target.value)}
              className="bg-background"
              data-ocid="stock.inventaire.reel.input"
              onFocus={(e) => e.target.select()}
            />
          </div>

          {diff !== null && diff !== 0 && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                diff < 0
                  ? "border-destructive/40 bg-destructive/5 text-destructive"
                  : "border-green-300 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800"
              }`}
            >
              <p className="font-medium">
                {diff < 0
                  ? `Ecart : ${fmtQty(Math.abs(diff))} ${ingredient.unite} manquant(s)`
                  : `Ecart : +${fmtQty(diff)} ${ingredient.unite} en surplus`}
              </p>
              <p className="text-xs mt-0.5 opacity-80">
                {diff < 0
                  ? "Un mouvement de Perte sera généré automatiquement."
                  : "Un mouvement d'Achat sera généré automatiquement."}
              </p>
            </div>
          )}
          {diff === 0 && isValid && (
            <p className="text-sm text-muted-foreground text-center">
              Stock réel identique au stock théorique. Aucun ajustement
              nécessaire.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="stock.inventaire.cancel_button"
          >
            Annuler
          </Button>
          <Button
            onClick={handleValider}
            disabled={!isValid}
            data-ocid="stock.inventaire.confirm_button"
          >
            Valider l'inventaire
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InventaireTab() {
  const ingredients = useAppStore((s) => s.ingredients);
  const mouvementsStock = useAppStore((s) => s.mouvementsStock);
  const addMouvementStock = useAppStore((s) => s.addMouvementStock);

  const [dialogIngId, setDialogIngId] = useState<string | null>(null);

  // ── New UI state ──────────────────────────────────────────────────────────
  const [inventaireSearch, setInventaireSearch] = useState<string>("");
  const [inventaireFilter, setInventaireFilter] = useState<"tous" | "alerte">(
    "tous",
  );
  const [sortCol, setSortCol] = useState<InventaireSortCol>("nom");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSortClick = (col: InventaireSortCol) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir(col === "actuel" ? "asc" : "asc");
    }
  };

  // ── Base rows ─────────────────────────────────────────────────────────────
  const rows = useMemo(() => {
    return ingredients.map((ing) => {
      const { entrees, sorties, actuel } = calcStockActuel(
        ing.id,
        mouvementsStock,
      );
      const seuil = Number(ing.seuilSecurite) || 0;
      const rupture = seuil > 0 && actuel <= seuil;
      return { ing, entrees, sorties, actuel, seuil, rupture };
    });
  }, [ingredients, mouvementsStock]);

  // ── Filtered + sorted rows ────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    let result = rows;

    // 1. Search filter
    const q = inventaireSearch.trim().toLowerCase();
    if (q) {
      result = result.filter((r) => r.ing.nom.toLowerCase().includes(q));
    }

    // 2. Status filter
    if (inventaireFilter === "alerte") {
      result = result.filter((r) => r.rupture);
    }

    // 3. Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortCol === "nom") {
        cmp = a.ing.nom.localeCompare(b.ing.nom, "fr", { sensitivity: "base" });
      } else {
        cmp = a.actuel - b.actuel;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [rows, inventaireSearch, inventaireFilter, sortCol, sortDir]);

  const dialogRow = dialogIngId
    ? rows.find((r) => r.ing.id === dialogIngId)
    : null;

  const handleValiderInventaire = (stockReel: number) => {
    if (!dialogRow) return;
    const diff = Math.round((stockReel - dialogRow.actuel) * 1000) / 1000;
    if (diff === 0) {
      setDialogIngId(null);
      return;
    }
    if (diff < 0) {
      addMouvementStock({
        ingredientId: dialogRow.ing.id,
        quantite: Math.abs(diff),
        type: "sortie",
        motif: "Perte",
      });
    } else {
      addMouvementStock({
        ingredientId: dialogRow.ing.id,
        quantite: diff,
        type: "entree",
        motif: "Achat",
      });
    }
    toast.success("Inventaire mis à jour", { duration: 3000 });
    setDialogIngId(null);
  };

  // ── Sort header helper ─────────────────────────────────────────────────────
  function SortIcon({ col }: { col: InventaireSortCol }) {
    if (sortCol !== col)
      return (
        <ChevronsUpDown className="ml-1 inline h-3.5 w-3.5 text-muted-foreground/50" />
      );
    return sortDir === "asc" ? (
      <ChevronUp className="ml-1 inline h-3.5 w-3.5 text-primary" />
    ) : (
      <ChevronDown className="ml-1 inline h-3.5 w-3.5 text-primary" />
    );
  }

  return (
    <>
      <Card data-ocid="stock.inventaire.card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-5 w-5 text-primary" />
            Stock en cours — Inventaire et Réconciliation
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Stocks calculés en temps réel. Cliquez sur "Faire l'inventaire" pour
            saisir le stock réel et générer l'ajustement automatique.
          </p>

          {/* ── Search + Filter bar ── */}
          {ingredients.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Rechercher un ingrédient..."
                  value={inventaireSearch}
                  onChange={(e) => setInventaireSearch(e.target.value)}
                  className="pl-8 bg-background h-9 text-sm"
                  data-ocid="stock.inventaire.search_input"
                />
              </div>

              <Select
                value={inventaireFilter}
                onValueChange={(v) =>
                  setInventaireFilter(v as "tous" | "alerte")
                }
              >
                <SelectTrigger
                  className="w-[160px] h-9 bg-background text-sm"
                  data-ocid="stock.inventaire.filter.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les stocks</SelectItem>
                  <SelectItem value="alerte">Alerte Rupture</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {ingredients.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-center px-6"
              data-ocid="stock.inventaire.empty_state"
            >
              <ClipboardList className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-foreground">
                Aucun ingrédient enregistré
              </p>
              <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                Ajoutez des ingrédients depuis la page Ingrédients F&amp;B pour
                les voir apparaître ici.
              </p>
            </div>
          ) : filteredRows.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-center px-6"
              data-ocid="stock.inventaire.search_empty_state"
            >
              <Search className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-foreground">
                Aucun résultat trouvé pour votre recherche
              </p>
              <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                Modifiez votre recherche ou réinitialisez les filtres.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead
                      className="pl-6 font-semibold text-foreground cursor-pointer select-none whitespace-nowrap"
                      onClick={() => handleSortClick("nom")}
                      data-ocid="stock.inventaire.sort_nom"
                    >
                      Ingrédient
                      <SortIcon col="nom" />
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Unité
                    </TableHead>
                    <TableHead
                      className="text-right font-semibold text-foreground cursor-pointer select-none whitespace-nowrap"
                      onClick={() => handleSortClick("actuel")}
                      data-ocid="stock.inventaire.sort_actuel"
                    >
                      Stock Théorique
                      <SortIcon col="actuel" />
                    </TableHead>
                    <TableHead className="text-right font-semibold text-foreground">
                      Seuil Sécurité
                    </TableHead>
                    <TableHead className="text-center font-semibold text-foreground">
                      Statut
                    </TableHead>
                    <TableHead className="pr-4 text-right font-semibold text-foreground">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((row, idx) => (
                    <TableRow
                      key={row.ing.id}
                      className="border-border hover:bg-muted/40 transition-colors"
                      data-ocid={`stock.inventaire.item.${idx + 1}`}
                    >
                      <TableCell className="pl-6 font-medium text-sm">
                        {row.ing.nom || (
                          <span className="text-muted-foreground italic">
                            Sans nom
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {row.ing.unite}
                      </TableCell>
                      <TableCell
                        className={`text-right tabular-nums text-sm font-bold ${
                          row.rupture ? "text-destructive" : "text-foreground"
                        }`}
                      >
                        {fmtQty(row.actuel)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                        {row.seuil > 0 ? fmtQty(row.seuil) : "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.rupture ? (
                          <Badge
                            variant="destructive"
                            className="text-xs font-bold"
                            data-ocid={`stock.inventaire.rupture.${idx + 1}`}
                          >
                            Rupture
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-xs text-green-600 bg-green-100 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800"
                            data-ocid={`stock.inventaire.ok.${idx + 1}`}
                          >
                            OK
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="pr-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs h-8"
                          onClick={() => setDialogIngId(row.ing.id)}
                          data-ocid={`stock.inventaire.inventorier_button.${idx + 1}`}
                        >
                          <ClipboardList className="h-3.5 w-3.5" />
                          Faire l'inventaire
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {dialogRow && (
        <InventaireDialog
          ingredient={dialogRow.ing}
          stockTheorique={dialogRow.actuel}
          open={dialogIngId !== null}
          onClose={() => setDialogIngId(null)}
          onValider={handleValiderInventaire}
        />
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StockPage() {
  return (
    <div className="space-y-6" data-ocid="stock.page">
      <div>
        <h1 className="text-xl font-display font-semibold text-foreground">
          Gestion des Stocks
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Suivez vos flux de matières, enregistrez entrées et sorties, consultez
          et réconciliez l'inventaire en temps réel.
        </p>
      </div>

      <Tabs defaultValue="entrees" data-ocid="stock.tabs">
        <TabsList className="mb-4">
          <TabsTrigger
            value="entrees"
            className="gap-2"
            data-ocid="stock.entrees.tab"
          >
            <ArrowDownCircle className="h-4 w-4" />
            Entrées
          </TabsTrigger>
          <TabsTrigger
            value="sorties"
            className="gap-2"
            data-ocid="stock.sorties.tab"
          >
            <ArrowUpCircle className="h-4 w-4" />
            Sorties
          </TabsTrigger>
          <TabsTrigger
            value="inventaire"
            className="gap-2"
            data-ocid="stock.inventaire.tab"
          >
            <ClipboardList className="h-4 w-4" />
            Inventaire
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entrees">
          <EntreesTab />
        </TabsContent>

        <TabsContent value="sorties">
          <SortiesTab />
        </TabsContent>

        <TabsContent value="inventaire">
          <InventaireTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
