import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getBudgetInitial,
  getPerformanceReelle,
  getProjectionActuelle,
  selectTotalFraisFixesAnnuels,
  selectTotalMasseSalarialeAnnuelle,
  useAppStore,
} from "@/core/store/useAppStore";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ClipboardList,
  Trash2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { calculerPointMortJour } from "../utils/operationsMath";

// ─── Format helpers ────────────────────────────────────────────────────────────

function formatEur(value: number): string {
  return `${value.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
}

function formatPct(value: number): string {
  return `${value.toFixed(1)} %`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface LigneVente {
  recetteId: string;
  quantite: number;
}

// ─── Shared empty state card ───────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="bg-muted/40 border-border">
      <CardContent className="flex flex-col items-center gap-3 py-12">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground text-center">{message}</p>
      </CardContent>
    </Card>
  );
}

// ─── Delta display ─────────────────────────────────────────────────────────────

function Delta({ value, suffix = "" }: { value: number; suffix?: string }) {
  const color = value >= 0 ? "text-green-600" : "text-red-600";
  const prefix = value >= 0 ? "+" : "";
  return (
    <span className={`font-semibold ${color}`}>
      {prefix}
      {formatEur(value)}
      {suffix}
    </span>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function OperationsPage() {
  // ── Shared state for current day's sales (lifted above tabs) ─────────────────
  const [ventesEnCours, setVentesEnCours] = useState<LigneVente[]>([]);
  const [selectedRecetteId, setSelectedRecetteId] = useState<string>("");
  const [quantiteInput, setQuantiteInput] = useState<string>("");
  const [_validationDone, setValidationDone] = useState(false);

  // ── Combobox state for recipe picker ─────────────────────────────────────────
  const [comboOpen, setComboOpen] = useState(false);

  // ── Sort state for historique tables ─────────────────────────────────────────
  type SortDir = "asc" | "desc";
  type HebdoSortCol = "date" | "ca";
  type MensuelSortCol = "date" | "ca";

  const [hebdoSortCol, setHebdoSortCol] = useState<HebdoSortCol>("date");
  const [hebdoSortDir, setHebdoSortDir] = useState<SortDir>("desc");
  const [mensuelSortCol, setMensuelSortCol] = useState<MensuelSortCol>("date");
  const [mensuelSortDir, setMensuelSortDir] = useState<SortDir>("asc");

  function toggleHebdoSort(col: HebdoSortCol) {
    if (hebdoSortCol === col) {
      setHebdoSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setHebdoSortCol(col);
      setHebdoSortDir(col === "date" ? "desc" : "desc");
    }
  }

  function toggleMensuelSort(col: MensuelSortCol) {
    if (mensuelSortCol === col) {
      setMensuelSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setMensuelSortCol(col);
      setMensuelSortDir(col === "date" ? "asc" : "desc");
    }
  }

  function SortIcon({
    col,
    activeCol,
    dir,
  }: {
    col: string;
    activeCol: string;
    dir: SortDir;
  }) {
    if (col !== activeCol)
      return <ChevronsUpDown className="ml-1 inline h-3.5 w-3.5 opacity-40" />;
    return dir === "asc" ? (
      <ChevronUp className="ml-1 inline h-3.5 w-3.5 text-primary" />
    ) : (
      <ChevronDown className="ml-1 inline h-3.5 w-3.5 text-primary" />
    );
  }

  // ── Store data ────────────────────────────────────────────────────────────────
  const recettesFB = useAppStore((s) => s.recettes);
  const salaries = useAppStore((s) => s.salaries);
  const fraisFixes = useAppStore((s) => s.fraisFixes);
  const hypothesesBP = useAppStore((s) => s.hypothesesBP);
  const historiqueClotures = useAppStore((s) => s.historiqueClotures);
  const validerJournee = useAppStore((s) => s.validerJournee);

  // ── Derived constants ─────────────────────────────────────────────────────────
  const joursOuvertureAn = useMemo(() => {
    if (hypothesesBP.joursOuvertureAn && hypothesesBP.joursOuvertureAn > 0) {
      return hypothesesBP.joursOuvertureAn;
    }
    return (
      hypothesesBP.semainesOuverture *
      (hypothesesBP.joursOuvertureParSemaine ?? 6)
    );
  }, [hypothesesBP]);

  const objectifJournalier = useMemo(
    () =>
      joursOuvertureAn > 0
        ? hypothesesBP.objectifCAannuel / joursOuvertureAn
        : 0,
    [hypothesesBP.objectifCAannuel, joursOuvertureAn],
  );

  const fraisFixesAnnuels = useMemo(
    () => selectTotalFraisFixesAnnuels(fraisFixes),
    [fraisFixes],
  );

  const masseSalarialeAnnuelle = useMemo(
    () => selectTotalMasseSalarialeAnnuelle(salaries),
    [salaries],
  );

  const pointMortJour = useMemo(
    () =>
      calculerPointMortJour(
        fraisFixesAnnuels,
        masseSalarialeAnnuelle,
        joursOuvertureAn,
      ),
    [fraisFixesAnnuels, masseSalarialeAnnuelle, joursOuvertureAn],
  );

  const margeCible = hypothesesBP.margeCibleGlobale ?? 70;

  // ── CA calculé depuis les lignes de ventes en cours ───────────────────────────
  const caRealise = useMemo(() => {
    return ventesEnCours.reduce((sum, ligne) => {
      const recette = recettesFB.find((r) => r.id === ligne.recetteId);
      return sum + (recette ? recette.prixVenteHT * ligne.quantite : 0);
    }, 0);
  }, [ventesEnCours, recettesFB]);

  const margeTheorique = useMemo(
    () => caRealise * (margeCible / 100),
    [caRealise, margeCible],
  );
  const coutMatiereTheorique = useMemo(
    () => caRealise * ((100 - margeCible) / 100),
    [caRealise, margeCible],
  );
  const fluxNet = useMemo(
    () => caRealise - coutMatiereTheorique - pointMortJour,
    [caRealise, coutMatiereTheorique, pointMortJour],
  );

  // ── Add vente line ────────────────────────────────────────────────────────────
  const handleAjouterVente = () => {
    if (!selectedRecetteId) return;
    const qty = Number.parseFloat(quantiteInput);
    if (!qty || qty <= 0) return;
    setVentesEnCours((prev) => {
      const existing = prev.findIndex((l) => l.recetteId === selectedRecetteId);
      if (existing >= 0) {
        return prev.map((l, i) =>
          i === existing ? { ...l, quantite: l.quantite + qty } : l,
        );
      }
      return [...prev, { recetteId: selectedRecetteId, quantite: qty }];
    });
    setQuantiteInput("");
    toast.success("Vente enregistrée", { duration: 3000 });
  };

  // ── Validate closure ──────────────────────────────────────────────────────────
  const handleValider = () => {
    if (ventesEnCours.length === 0) return;
    const today = new Date().toISOString().split("T")[0];
    validerJournee({
      date: today,
      ventes: ventesEnCours,
      caTotal: caRealise,
      chargesVariables: coutMatiereTheorique,
    });
    setVentesEnCours([]);
    setValidationDone(true);
    toast.success("Clôture journalière validée et stocks mis à jour", {
      duration: 3000,
    });
    setTimeout(() => setValidationDone(false), 5000);
  };

  // ── Today date helpers ────────────────────────────────────────────────────────
  const todayYear = new Date().getFullYear();
  const todayMonth = new Date().getMonth();

  // ── Filtered closures ─────────────────────────────────────────────────────────
  const clotures7j = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return historiqueClotures.filter((c) => {
      if (!c.valide) return false;
      return new Date(c.date) >= cutoff;
    });
  }, [historiqueClotures]);

  const clotureMois = useMemo(() => {
    return historiqueClotures.filter((c) => {
      if (!c.valide) return false;
      const d = new Date(c.date);
      return d.getFullYear() === todayYear && d.getMonth() === todayMonth;
    });
  }, [historiqueClotures, todayYear, todayMonth]);

  const cloturesAnnee = useMemo(() => {
    return historiqueClotures.filter((c) => {
      if (!c.valide) return false;
      return new Date(c.date).getFullYear() === todayYear;
    });
  }, [historiqueClotures, todayYear]);

  // ── Annual KPIs ───────────────────────────────────────────────────────────────
  const caReelAnnuel = useMemo(
    () => cloturesAnnee.reduce((sum, c) => sum + c.caTotal, 0),
    [cloturesAnnee],
  );

  const avancementPct = useMemo(
    () =>
      hypothesesBP.objectifCAannuel > 0
        ? (caReelAnnuel / hypothesesBP.objectifCAannuel) * 100
        : 0,
    [caReelAnnuel, hypothesesBP.objectifCAannuel],
  );

  const caMoyenJour = useMemo(
    () => (cloturesAnnee.length > 0 ? caReelAnnuel / cloturesAnnee.length : 0),
    [caReelAnnuel, cloturesAnnee],
  );

  const projectionAnnuelle = useMemo(
    () => caMoyenJour * joursOuvertureAn,
    [caMoyenJour, joursOuvertureAn],
  );

  // ── Monthly breakdown for annual tab ─────────────────────────────────────────
  const caParMois = useMemo(() => {
    const map: Record<number, number> = {};
    for (const c of cloturesAnnee) {
      const m = new Date(c.date).getMonth();
      map[m] = (map[m] ?? 0) + c.caTotal;
    }
    return map;
  }, [cloturesAnnee]);

  const MOIS_FR = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  // ── Dashboard: scenario selectors (pure — no mutations) ───────────────────────
  const store = useAppStore();
  const bpInitial = getBudgetInitial(store);
  const projectionActuelle = getProjectionActuelle(store);
  const performanceReelle = getPerformanceReelle(store);
  const configEtablissement = store.configEtablissement;

  const dashJoursOuvertureParAn =
    (configEtablissement?.joursOuvertureParAn ?? 0) > 0
      ? configEtablissement.joursOuvertureParAn
      : 300;
  const dashMargeJournaliereMoyenne =
    dashJoursOuvertureParAn > 0
      ? projectionActuelle.margeBrute / dashJoursOuvertureParAn
      : 0;
  const dashFraisFixesMensuels =
    selectTotalFraisFixesAnnuels(store.fraisFixes || []) / 12;
  const dashJoursTravaillesCeMois = new Date().getDate();
  const dashJoursRestants =
    dashMargeJournaliereMoyenne > 0
      ? Math.max(
          0,
          Math.round(
            dashFraisFixesMensuels / dashMargeJournaliereMoyenne -
              dashJoursTravaillesCeMois,
          ),
        )
      : 0;

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-3 pb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <ClipboardList className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Opérations
          </h2>
          <p className="text-sm text-muted-foreground">
            Pilotage de la performance — Jour, Clôture, Hebdo, Mensuel, Annuel
          </p>
        </div>
      </div>

      <Tabs defaultValue="ventes" className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          <TabsTrigger value="ventes" data-ocid="operations.tab.ventes">
            Ventes du Jour
          </TabsTrigger>
          <TabsTrigger value="cloture" data-ocid="operations.tab.cloture">
            Clôture Journalière
          </TabsTrigger>
          <TabsTrigger value="hebdo" data-ocid="operations.tab.hebdo">
            Récap. Hebdo
          </TabsTrigger>
          <TabsTrigger value="mensuel" data-ocid="operations.tab.mensuel">
            Récap. Mensuel
          </TabsTrigger>
          <TabsTrigger value="annuel" data-ocid="operations.tab.annuel">
            Clôture Annuelle
          </TabsTrigger>
          <TabsTrigger value="dashboard" data-ocid="operations.tab.dashboard">
            Tableau de Bord
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1 : Ventes du Jour ─────────────────────────────────────────── */}
        <TabsContent value="ventes" className="space-y-6">
          {/* CA en cours KPI */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="flex items-center justify-between py-4 px-6">
              <div>
                <p className="text-sm text-muted-foreground">CA en cours</p>
                <p
                  className="text-3xl font-bold font-display text-foreground tabular-nums"
                  data-ocid="operations.ca_encours.value"
                >
                  {formatEur(caRealise)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary/40" />
            </CardContent>
          </Card>

          {/* Formulaire ajout */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ajouter une vente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label>Recette</Label>
                  <Popover open={comboOpen} onOpenChange={setComboOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        aria-haspopup="listbox"
                        aria-expanded={comboOpen}
                        className="w-full justify-between font-normal"
                        data-ocid="operations.vente.recette_select"
                      >
                        <span className="truncate">
                          {selectedRecetteId
                            ? (recettesFB.find(
                                (r) => r.id === selectedRecetteId,
                              )?.nom ?? "Sélectionner une recette…")
                            : "Sélectionner une recette…"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[--radix-popover-trigger-width] p-0"
                      align="start"
                    >
                      <Command>
                        <CommandInput placeholder="Rechercher une recette…" />
                        <CommandEmpty>Aucun résultat</CommandEmpty>
                        <CommandGroup>
                          {recettesFB.map((r) => (
                            <CommandItem
                              key={r.id}
                              value={r.nom}
                              onSelect={() => {
                                setSelectedRecetteId(r.id);
                                setComboOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedRecetteId === r.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {r.nom} — {formatEur(r.prixVenteHT)}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1.5">
                  <Label>Quantité</Label>
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    value={quantiteInput}
                    placeholder="1"
                    onChange={(e) => setQuantiteInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAjouterVente()}
                    data-ocid="operations.vente.quantite_input"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleAjouterVente}
                  disabled={!selectedRecetteId || !quantiteInput}
                  data-ocid="operations.vente.add_button"
                >
                  Ajouter
                </Button>
                {ventesEnCours.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setVentesEnCours([])}
                    data-ocid="operations.vente.clear_button"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Effacer tout
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Table des ventes */}
          {ventesEnCours.length === 0 ? (
            <EmptyState message="Aucune vente ajoutée. Utilisez le formulaire ci-dessus pour enregistrer vos ventes du jour." />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recette</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead className="text-right">
                        Prix unitaire
                      </TableHead>
                      <TableHead className="text-right">Sous-total</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ventesEnCours.map((ligne, idx) => {
                      const recette = recettesFB.find(
                        (r) => r.id === ligne.recetteId,
                      );
                      const sousTotal = recette
                        ? recette.prixVenteHT * ligne.quantite
                        : 0;
                      return (
                        <TableRow
                          key={ligne.recetteId}
                          data-ocid={`operations.vente.item.${idx + 1}`}
                        >
                          <TableCell className="font-medium">
                            {recette?.nom ?? "—"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {ligne.quantite}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {recette ? formatEur(recette.prixVenteHT) : "—"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-semibold">
                            {formatEur(sousTotal)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setVentesEnCours((prev) =>
                                  prev.filter((_, i) => i !== idx),
                                );
                                toast.success("Ligne supprimée", {
                                  duration: 3000,
                                });
                              }}
                              data-ocid={`operations.vente.delete_button.${idx + 1}`}
                            >
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── TAB 2 : Clôture Journalière ───────────────────────────────────── */}
        <TabsContent value="cloture" className="space-y-6">
          {ventesEnCours.length === 0 ? (
            <EmptyState message="Ajoutez des ventes dans l'onglet Ventes du Jour avant de clôturer." />
          ) : (
            <>
              {/* Row 1 KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card data-ocid="operations.cloture.ca_realise.card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      CA Réalisé
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold tabular-nums">
                      {formatEur(caRealise)}
                    </p>
                  </CardContent>
                </Card>
                <Card data-ocid="operations.cloture.objectif_jour.card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Objectif Journalier
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold tabular-nums">
                      {formatEur(objectifJournalier)}
                    </p>
                  </CardContent>
                </Card>
                <Card data-ocid="operations.cloture.point_mort.card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Point Mort Journalier
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold tabular-nums">
                      {formatEur(pointMortJour)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Row 2 KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card data-ocid="operations.cloture.marge_brute.card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Marge Brute Théorique
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold tabular-nums">
                      {formatEur(margeTheorique)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatPct(margeCible)} de marge cible
                    </p>
                  </CardContent>
                </Card>
                <Card data-ocid="operations.cloture.cout_matiere.card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Coût Matière Théorique
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold tabular-nums">
                      {formatEur(coutMatiereTheorique)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatPct(100 - margeCible)} du CA
                    </p>
                  </CardContent>
                </Card>
                <Card
                  data-ocid="operations.cloture.flux_net.card"
                  className={
                    fluxNet >= 0
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Flux Net
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p
                      className={`text-2xl font-bold tabular-nums ${fluxNet >= 0 ? "text-green-700" : "text-red-700"}`}
                    >
                      {formatEur(fluxNet)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      CA − Coût Matière − Point Mort
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Comparison CA vs Objectif */}
              <Card>
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        CA Réalisé vs Objectif Journalier
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-foreground">
                          {formatEur(caRealise)}
                        </span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-muted-foreground">
                          {formatEur(objectifJournalier)}
                        </span>
                        <Delta value={caRealise - objectifJournalier} />
                      </div>
                    </div>
                    {caRealise >= objectifJournalier ? (
                      <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Validate button */}
              <div className="flex justify-end">
                <Button
                  size="lg"
                  disabled={ventesEnCours.length === 0}
                  onClick={handleValider}
                  data-ocid="operations.cloture.valider_button"
                  className="gap-2"
                >
                  <CalendarCheck className="h-5 w-5" />
                  Valider et Déduire les Stocks
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        {/* ── TAB 3 : Récapitulatif Hebdo ───────────────────────────────────── */}
        <TabsContent value="hebdo" className="space-y-6">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <CalendarDays className="h-4 w-4" />
            <span>Clôtures validées sur les 7 derniers jours</span>
          </div>

          {clotures7j.length === 0 ? (
            <EmptyState message="En attente de clôtures. Aucune journée validée sur les 7 derniers jours." />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card data-ocid="operations.hebdo.ca_total.card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      CA Total 7 jours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold tabular-nums">
                      {formatEur(clotures7j.reduce((s, c) => s + c.caTotal, 0))}
                    </p>
                  </CardContent>
                </Card>
                <Card data-ocid="operations.hebdo.objectif_hebdo.card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Objectif Hebdo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold tabular-nums">
                      {formatEur(hypothesesBP.objectifCAannuel / 52)}
                    </p>
                  </CardContent>
                </Card>
                <Card data-ocid="operations.hebdo.delta.card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Delta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Delta
                      value={
                        clotures7j.reduce((s, c) => s + c.caTotal, 0) -
                        hypothesesBP.objectifCAannuel / 52
                      }
                    />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className="cursor-pointer select-none hover:text-foreground"
                          onClick={() => toggleHebdoSort("date")}
                          data-ocid="operations.hebdo.sort.date"
                        >
                          Date
                          <SortIcon
                            col="date"
                            activeCol={hebdoSortCol}
                            dir={hebdoSortDir}
                          />
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer select-none hover:text-foreground"
                          onClick={() => toggleHebdoSort("ca")}
                          data-ocid="operations.hebdo.sort.ca"
                        >
                          CA Réalisé
                          <SortIcon
                            col="ca"
                            activeCol={hebdoSortCol}
                            dir={hebdoSortDir}
                          />
                        </TableHead>
                        <TableHead className="text-right">
                          Objectif Jour
                        </TableHead>
                        <TableHead className="text-right">Delta</TableHead>
                        <TableHead className="text-center">Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clotures7j.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="py-8 text-center text-sm text-muted-foreground"
                          >
                            Aucun résultat trouvé pour votre recherche
                          </TableCell>
                        </TableRow>
                      ) : (
                        [...clotures7j]
                          .sort((a, b) => {
                            if (hebdoSortCol === "date") {
                              const diff =
                                new Date(a.date).getTime() -
                                new Date(b.date).getTime();
                              return hebdoSortDir === "asc" ? diff : -diff;
                            }
                            const diff = a.caTotal - b.caTotal;
                            return hebdoSortDir === "asc" ? diff : -diff;
                          })
                          .map((c, idx) => {
                            const delta = c.caTotal - objectifJournalier;
                            const atteint = delta >= 0;
                            return (
                              <TableRow
                                key={c.id}
                                data-ocid={`operations.hebdo.item.${idx + 1}`}
                              >
                                <TableCell>{formatDate(c.date)}</TableCell>
                                <TableCell className="text-right tabular-nums">
                                  {formatEur(c.caTotal)}
                                </TableCell>
                                <TableCell className="text-right tabular-nums text-muted-foreground">
                                  {formatEur(objectifJournalier)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Delta value={delta} />
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge
                                    variant={
                                      atteint ? "default" : "destructive"
                                    }
                                    data-ocid={`operations.hebdo.statut.${idx + 1}`}
                                  >
                                    {atteint ? "Atteint" : "Non atteint"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ── TAB 4 : Récapitulatif Mensuel ─────────────────────────────────── */}
        <TabsContent value="mensuel" className="space-y-6">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <CalendarRange className="h-4 w-4" />
            <span>
              {MOIS_FR[todayMonth]} {todayYear} — clôtures du mois en cours
            </span>
          </div>

          {clotureMois.length === 0 ? (
            <EmptyState message="En attente de clôtures. Aucune journée validée ce mois-ci." />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card data-ocid="operations.mensuel.ca_cumule.card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      CA Cumulé du Mois
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold tabular-nums">
                      {formatEur(
                        clotureMois.reduce((s, c) => s + c.caTotal, 0),
                      )}
                    </p>
                  </CardContent>
                </Card>
                <Card data-ocid="operations.mensuel.objectif.card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Objectif Mensuel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold tabular-nums">
                      {formatEur(hypothesesBP.objectifCAannuel / 12)}
                    </p>
                  </CardContent>
                </Card>
                <Card data-ocid="operations.mensuel.delta.card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Delta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Delta
                      value={
                        clotureMois.reduce((s, c) => s + c.caTotal, 0) -
                        hypothesesBP.objectifCAannuel / 12
                      }
                    />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className="cursor-pointer select-none hover:text-foreground"
                          onClick={() => toggleMensuelSort("date")}
                          data-ocid="operations.mensuel.sort.date"
                        >
                          Date
                          <SortIcon
                            col="date"
                            activeCol={mensuelSortCol}
                            dir={mensuelSortDir}
                          />
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer select-none hover:text-foreground"
                          onClick={() => toggleMensuelSort("ca")}
                          data-ocid="operations.mensuel.sort.ca"
                        >
                          CA
                          <SortIcon
                            col="ca"
                            activeCol={mensuelSortCol}
                            dir={mensuelSortDir}
                          />
                        </TableHead>
                        <TableHead className="text-right">
                          Marge Brute Estimée
                        </TableHead>
                        <TableHead className="text-right">Cumul</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clotureMois.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="py-8 text-center text-sm text-muted-foreground"
                          >
                            Aucun résultat trouvé pour votre recherche
                          </TableCell>
                        </TableRow>
                      ) : (
                        [...clotureMois]
                          .sort((a, b) => {
                            if (mensuelSortCol === "date") {
                              const diff =
                                new Date(a.date).getTime() -
                                new Date(b.date).getTime();
                              return mensuelSortDir === "asc" ? diff : -diff;
                            }
                            const diff = a.caTotal - b.caTotal;
                            return mensuelSortDir === "asc" ? diff : -diff;
                          })
                          .reduce<
                            Array<{
                              c: (typeof clotureMois)[0];
                              cumul: number;
                              idx: number;
                            }>
                          >((acc, c, i) => {
                            const prev = acc[i - 1]?.cumul ?? 0;
                            acc.push({ c, cumul: prev + c.caTotal, idx: i });
                            return acc;
                          }, [])
                          .map(({ c, cumul, idx }) => (
                            <TableRow
                              key={c.id}
                              data-ocid={`operations.mensuel.item.${idx + 1}`}
                            >
                              <TableCell>{formatDate(c.date)}</TableCell>
                              <TableCell className="text-right tabular-nums">
                                {formatEur(c.caTotal)}
                              </TableCell>
                              <TableCell className="text-right tabular-nums text-muted-foreground">
                                {formatEur(c.caTotal * (margeCible / 100))}
                              </TableCell>
                              <TableCell className="text-right tabular-nums font-semibold">
                                {formatEur(cumul)}
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                      {/* Total row */}
                      {clotureMois.length > 0 && (
                        <TableRow className="bg-muted/40 font-bold">
                          <TableCell>Total</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatEur(
                              clotureMois.reduce((s, c) => s + c.caTotal, 0),
                            )}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatEur(
                              clotureMois.reduce((s, c) => s + c.caTotal, 0) *
                                (margeCible / 100),
                            )}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatEur(
                              clotureMois.reduce((s, c) => s + c.caTotal, 0),
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ── TAB 5 : Clôture Annuelle ──────────────────────────────────────── */}
        <TabsContent value="annuel" className="space-y-6">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <CalendarRange className="h-4 w-4" />
            <span>Synthèse macroscopique — Année {todayYear}</span>
          </div>

          {cloturesAnnee.length === 0 ? (
            <EmptyState message="En attente de clôtures. Aucune journée validée cette année." />
          ) : (
            <>
              {/* Row 1 KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card data-ocid="operations.annuel.ca_reel.card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      CA Réel Annuel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold tabular-nums">
                      {formatEur(caReelAnnuel)}
                    </p>
                  </CardContent>
                </Card>
                <Card data-ocid="operations.annuel.objectif.card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Objectif Annuel BP
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold tabular-nums">
                      {formatEur(hypothesesBP.objectifCAannuel)}
                    </p>
                  </CardContent>
                </Card>
                <Card
                  data-ocid="operations.annuel.avancement.card"
                  className={
                    avancementPct >= 100
                      ? "border-green-200 bg-green-50"
                      : "border-border"
                  }
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Avancement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p
                      className={`text-2xl font-bold tabular-nums ${avancementPct >= 100 ? "text-green-700" : "text-foreground"}`}
                    >
                      {formatPct(avancementPct)}
                    </p>
                    <Progress
                      value={Math.min(avancementPct, 100)}
                      className="h-2"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Row 2 KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card data-ocid="operations.annuel.jours_clotures.card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Jours Clôturés
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold tabular-nums">
                      {cloturesAnnee.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      sur {joursOuvertureAn} j prévus
                    </p>
                  </CardContent>
                </Card>
                <Card data-ocid="operations.annuel.ca_moyen_jour.card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      CA Moyen par Jour
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold tabular-nums">
                      {formatEur(caMoyenJour)}
                    </p>
                  </CardContent>
                </Card>
                <Card data-ocid="operations.annuel.projection.card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Projection Annuelle
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold tabular-nums">
                      {formatEur(projectionAnnuelle)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      CA Moyen × {joursOuvertureAn} jours
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Répartition par Mois
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mois</TableHead>
                        <TableHead className="text-right">CA Mensuel</TableHead>
                        <TableHead className="text-right">Cumul</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOIS_FR.map((moisLabel, moisIdx) => {
                        const ca = caParMois[moisIdx] ?? 0;
                        const cumul = MOIS_FR.slice(0, moisIdx + 1).reduce(
                          (sum, _, mi) => sum + (caParMois[mi] ?? 0),
                          0,
                        );
                        if (ca === 0 && moisIdx > todayMonth) return null;
                        return (
                          <TableRow
                            key={moisLabel}
                            data-ocid={`operations.annuel.mois.${moisIdx + 1}`}
                            className={ca === 0 ? "text-muted-foreground" : ""}
                          >
                            <TableCell>{moisLabel}</TableCell>
                            <TableCell className="text-right tabular-nums">
                              {ca > 0 ? formatEur(ca) : "—"}
                            </TableCell>
                            <TableCell className="text-right tabular-nums font-semibold">
                              {cumul > 0 ? formatEur(cumul) : "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ── TAB 6 : Tableau de Bord ───────────────────────────────────────── */}
        <TabsContent
          value="dashboard"
          className="space-y-6"
          data-ocid="operations.dashboard.section"
        >
          {/* ── SECTION 1 : Comparatif CA Annuel ─────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comparatif CA Annuel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const values = [
                  {
                    label: "Budget Initial",
                    color: "#3B82F6",
                    value: bpInitial.caAnnuel,
                  },
                  {
                    label: "Projection BP Réel",
                    color: "#F97316",
                    value: projectionActuelle.caAnnuel,
                  },
                  {
                    label: "Réalisé",
                    color: "#22C55E",
                    value: performanceReelle.caAnnuel,
                  },
                ];
                const maxVal = Math.max(...values.map((v) => v.value), 1);
                return values.map((item) => {
                  const pct = (item.value / maxVal) * 100;
                  return (
                    <div
                      key={item.label}
                      className="space-y-1"
                      data-ocid={`operations.dashboard.bar.${item.label.toLowerCase().replace(/\s+/g, "_")}`}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">
                          {item.label}
                        </span>
                        <span className="tabular-nums text-muted-foreground">
                          {item.value.toLocaleString("fr-FR", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}{" "}
                          €
                        </span>
                      </div>
                      <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </CardContent>
          </Card>

          {/* ── SECTION 2 : Tableau de Synthèse ──────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Synthèse des Scénarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const fmtEurInt = (n: number) =>
                  `${n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €`;

                const calcEcart = (reel: number, ref: number): string => {
                  if (ref <= 0) return "—";
                  const pct = ((reel - ref) / ref) * 100;
                  return `${pct.toFixed(1)}%`;
                };

                const ecartColor = (reel: number, ref: number): string => {
                  if (ref <= 0) return "text-muted-foreground";
                  return reel >= ref ? "text-green-600" : "text-red-600";
                };

                const rows = [
                  {
                    label: "CA Annuel",
                    bpInit: bpInitial.caAnnuel,
                    bpReel: projectionActuelle.caAnnuel,
                    reel: performanceReelle.caAnnuel,
                  },
                  {
                    label: "Marge Brute",
                    bpInit: bpInitial.margeBrute,
                    bpReel: projectionActuelle.margeBrute,
                    reel: performanceReelle.margeBrute,
                  },
                  {
                    label: "EBE",
                    bpInit: bpInitial.ebe,
                    bpReel: projectionActuelle.ebe,
                    reel: performanceReelle.ebe,
                  },
                ];

                return (
                  <>
                    <Table data-ocid="operations.dashboard.synthese.table">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Indicateur</TableHead>
                          <TableHead className="text-right">
                            BP Initial
                          </TableHead>
                          <TableHead className="text-right">BP Réel</TableHead>
                          <TableHead className="text-right">Réel</TableHead>
                          <TableHead className="text-right">Écart %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map((row, idx) => (
                          <TableRow
                            key={row.label}
                            data-ocid={`operations.dashboard.synthese.item.${idx + 1}`}
                          >
                            <TableCell className="font-medium">
                              {row.label}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-muted-foreground">
                              {fmtEurInt(row.bpInit)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-muted-foreground">
                              {fmtEurInt(row.bpReel)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums font-semibold">
                              {performanceReelle.hasData
                                ? fmtEurInt(row.reel)
                                : "0 €"}
                            </TableCell>
                            <TableCell
                              className={`text-right tabular-nums font-semibold ${ecartColor(row.reel, row.bpInit)}`}
                            >
                              {performanceReelle.hasData
                                ? calcEcart(row.reel, row.bpInit)
                                : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {!performanceReelle.hasData && (
                      <p
                        className="text-xs text-muted-foreground mt-3 italic"
                        data-ocid="operations.dashboard.synthese.empty_state"
                      >
                        * Données réelles en attente de clôtures journalières
                      </p>
                    )}
                  </>
                );
              })()}
            </CardContent>
          </Card>

          {/* ── SECTION 3 : Point Mort Dynamique ─────────────────────────────── */}
          <Card data-ocid="operations.dashboard.pointmort.card">
            <CardHeader>
              <CardTitle className="text-base">
                Objectif Rentabilité du Mois
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted/40 p-4 space-y-0.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Marge Journalière Moyenne
                  </p>
                  <p className="text-2xl font-bold tabular-nums text-foreground">
                    {dashMargeJournaliereMoyenne.toLocaleString("fr-FR", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}{" "}
                    €
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Marge BP Réel ÷ {dashJoursOuvertureParAn} jours
                  </p>
                </div>
                <div className="rounded-lg bg-muted/40 p-4 space-y-0.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Frais Fixes Mensuels
                  </p>
                  <p className="text-2xl font-bold tabular-nums text-foreground">
                    {dashFraisFixesMensuels.toLocaleString("fr-FR", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}{" "}
                    €
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Frais fixes annuels ÷ 12
                  </p>
                </div>
              </div>

              <div
                className={`rounded-lg border-2 p-5 text-center ${dashJoursRestants === 0 ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50"}`}
                data-ocid="operations.dashboard.pointmort.result"
              >
                {dashJoursRestants === 0 ? (
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-green-700">
                      ✓ Frais fixes couverts ce mois !
                    </p>
                    <p className="text-sm text-green-600">
                      Le point mort mensuel est atteint.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-amber-700">
                      Jours restants pour couvrir les frais fixes
                    </p>
                    <p className="text-4xl font-bold tabular-nums text-amber-800">
                      {dashJoursRestants}
                    </p>
                    <p className="text-sm text-amber-700">
                      jour{dashJoursRestants > 1 ? "s" : ""}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
