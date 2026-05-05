import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  selectBPSectionA,
  selectBPSectionB,
  selectReelSectionA,
  selectReelSectionB,
  useAppStore,
} from "@/core/store/useAppStore";
import {
  Calculator,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useMemo } from "react";

// ─── Pure helpers ──────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return `${n.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} €`;
}

function valueClass(n: number): string {
  if (n > 0) return "text-green-600";
  if (n < 0) return "text-red-600";
  return "";
}

/**
 * Compound projection: annee is 1-indexed.
 * annee === 1 → returns annee1 directly (no growth applied).
 */
function projecterValeur(annee1: number, taux: number, annee: number): number {
  if (annee <= 1) return annee1;
  return annee1 * (1 + taux / 100) ** (annee - 1);
}

/** Amortization dotation for year N, exact French fiscal logic */
function calcDotationAnnuelle(
  valeurAchatHT: number,
  dureeAmortissementAns: number,
  type: "linéaire" | "dérogatoire",
  year: number,
): number {
  if (dureeAmortissementAns <= 0 || year > dureeAmortissementAns) return 0;
  if (type === "linéaire") return valeurAchatHT / dureeAmortissementAns;

  const coeff =
    dureeAmortissementAns <= 4
      ? 1.25
      : dureeAmortissementAns <= 6
        ? 1.75
        : 2.25;
  const tauxDerog = (1 / dureeAmortissementAns) * coeff;

  let vnc = valeurAchatHT;
  let dotation = 0;
  for (let y = 1; y <= year; y++) {
    const remainingYears = dureeAmortissementAns - y + 1;
    const linearDot = vnc / remainingYears;
    const derogDot = vnc * tauxDerog;
    dotation = linearDot > derogDot ? linearDot : derogDot;
    if (y < year) vnc -= dotation;
  }
  return dotation;
}

/** Annual interest for a given loan year (1-indexed, exact amortization table) */
function calcAnnualInterest(
  capitalInitial: number,
  tauxAnnuel: number,
  dureeMois: number,
  year: number,
): number {
  if (dureeMois <= 0 || capitalInitial <= 0) return 0;
  const monthlyRate = tauxAnnuel / 100 / 12;
  if (monthlyRate === 0) return 0;

  const mensualite =
    capitalInitial * (monthlyRate / (1 - (1 + monthlyRate) ** -dureeMois));
  let capital = capitalInitial;
  let totalInterest = 0;
  const startMonth = (year - 1) * 12 + 1;
  const endMonth = Math.min(year * 12, dureeMois);

  for (let m = 1; m <= endMonth; m++) {
    const interest = capital * monthlyRate;
    const principal = mensualite - interest;
    if (m >= startMonth) totalInterest += interest;
    capital -= principal;
    if (capital <= 0) break;
  }
  return Math.max(0, totalInterest);
}

/** Annual capital repayment for a given loan year (1-indexed) */
function calcAnnualCapitalRepayment(
  capitalInitial: number,
  tauxAnnuel: number,
  dureeMois: number,
  year: number,
): number {
  if (dureeMois <= 0 || capitalInitial <= 0) return 0;
  const monthlyRate = tauxAnnuel / 100 / 12;

  if (monthlyRate === 0) {
    const startMonth = (year - 1) * 12 + 1;
    const endMonth = Math.min(year * 12, dureeMois);
    if (startMonth > dureeMois) return 0;
    return (capitalInitial / dureeMois) * (endMonth - startMonth + 1);
  }

  const mensualite =
    capitalInitial * (monthlyRate / (1 - (1 + monthlyRate) ** -dureeMois));
  let capital = capitalInitial;
  let totalPrincipal = 0;
  const startMonth = (year - 1) * 12 + 1;
  const endMonth = Math.min(year * 12, dureeMois);

  for (let m = 1; m <= endMonth; m++) {
    const interest = capital * monthlyRate;
    const principal = Math.min(mensualite - interest, capital);
    if (m >= startMonth) totalPrincipal += principal;
    capital -= principal;
    if (capital <= 0) break;
  }
  return Math.max(0, totalPrincipal);
}

/** IS bracket calculation — only for SASU */
function calcIS(
  rai: number,
  bas: number,
  haut: number,
  seuil: number,
  statut: "SASU" | "SARL",
): number {
  if (statut !== "SASU" || rai <= 0) return 0;
  if (rai <= seuil) return rai * (bas / 100);
  return seuil * (bas / 100) + (rai - seuil) * (haut / 100);
}

// ─── Row types ────────────────────────────────────────────────────────────────

interface PnLRow {
  label: string;
  values: number[]; // always 5 values
  isBold?: boolean;
  isHighlight?: boolean;
  indent?: boolean;
  isDeduction?: boolean;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ComptabilitePage() {
  // ── Store reads (individual selectors — SSOT, no side effects) ───────────────
  const hypothesesBP = useAppStore((s) => s.hypothesesBP);
  const associes = useAppStore((s) => s.associes);
  const emprunts = useAppStore((s) => s.emprunts);
  const immobilisations = useAppStore((s) => s.immobilisations);
  const updateHypotheses = useAppStore((s) => s.updateHypotheses);
  // Full state snapshot for passing to pure selectors
  const storeState = useAppStore((s) => s);

  const pacteSocialActif = hypothesesBP.pacteSocialActif ?? false;
  const statutJuridique = hypothesesBP.statutJuridique ?? "SASU";

  // ── Derived selector values (read-only, computed outside useMemo for clarity) ─
  const sectionBPA = selectBPSectionA(storeState);
  const sectionBPB = selectBPSectionB(storeState);
  const sectionA = selectReelSectionA(storeState);
  const sectionB = selectReelSectionB(storeState);

  // ─────────────────────────────────────────────────────────────────────────────
  // TAB 1 — P&L Business Plan
  // ─────────────────────────────────────────────────────────────────────────────
  const bpProjection = useMemo(() => {
    const croissanceCA = hypothesesBP.croissanceCA_BP ?? 3;
    const inflationCharges = hypothesesBP.inflationCharges_BP ?? 2;
    const tauxIS_bas = hypothesesBP.tauxIS_bas ?? 15;
    const tauxIS_haut = hypothesesBP.tauxIS_haut ?? 25;
    const seuilIS = hypothesesBP.seuilIS ?? 42500;
    const tauxChargesPatronales = hypothesesBP.tauxChargesPatronales ?? 42;

    // Année 1 base values from BP selectors
    const ca1 = sectionBPA.caAnnuel;
    const matieres1 = sectionBPA.caMaterielAnnuel;
    const personnel1 = sectionBPB.masseSalarialeAnnuelle;
    const autres1 = sectionBPB.totalFraisFixesAnnuels;

    // Pacte Social: sum of (remunerationMensuelle * 12 * tauxPatronal/100) for all associes
    const impactPacteSocial = pacteSocialActif
      ? (associes ?? []).reduce(
          (sum, a) =>
            sum +
            (a.remunerationMensuelle || 0) * 12 * (tauxChargesPatronales / 100),
          0,
        )
      : 0;

    const years = [1, 2, 3, 4, 5];

    const ca = years.map((y) => projecterValeur(ca1, croissanceCA, y));
    // Matières = same food cost % of CA → scales with CA growth
    const matieres = years.map((y) =>
      projecterValeur(matieres1, croissanceCA, y),
    );
    const margeBrute = years.map((_y, i) => ca[i] - matieres[i]);
    const personnel = years.map((y) =>
      projecterValeur(personnel1, inflationCharges, y),
    );
    const autres = years.map((y) =>
      projecterValeur(autres1, inflationCharges, y),
    );
    const impactPacte = years.map(() => impactPacteSocial);

    const ebe = years.map(
      (_, i) => margeBrute[i] - personnel[i] - autres[i] - impactPacte[i],
    );

    // Dotations for each year (use actual per-year calculation)
    const amort = years.map((y) =>
      (immobilisations ?? []).reduce(
        (sum, immo) =>
          sum +
          calcDotationAnnuelle(
            immo.valeurAchatHT,
            immo.dureeAmortissementAns,
            immo.type,
            y,
          ),
        0,
      ),
    );

    const resultatExploitation = years.map((_, i) => ebe[i] - amort[i]);

    const interets = years.map((y) =>
      (emprunts ?? []).reduce(
        (sum, emp) =>
          sum +
          calcAnnualInterest(
            emp.capitalInitial,
            emp.tauxAnnuel,
            emp.dureeMois,
            y,
          ),
        0,
      ),
    );

    const rai = years.map((_, i) => resultatExploitation[i] - interets[i]);
    const is = rai.map((r) =>
      calcIS(r, tauxIS_bas, tauxIS_haut, seuilIS, statutJuridique),
    );
    const resultatNet = rai.map((r, i) => r - is[i]);

    return {
      ca,
      matieres,
      margeBrute,
      personnel,
      autres,
      impactPacte,
      ebe,
      amort,
      resultatExploitation,
      interets,
      rai,
      is,
      resultatNet,
    };
  }, [
    hypothesesBP,
    sectionBPA,
    sectionBPB,
    associes,
    emprunts,
    immobilisations,
    pacteSocialActif,
    statutJuridique,
  ]);

  const bpRows = useMemo((): PnLRow[] => {
    const {
      ca,
      matieres,
      margeBrute,
      personnel,
      autres,
      impactPacte,
      ebe,
      amort,
      resultatExploitation,
      interets,
      rai,
      is,
      resultatNet,
    } = bpProjection;
    return [
      { label: "CA HT", values: ca },
      {
        label: "Matières premières (Food Cost)",
        values: matieres.map((v) => -v),
        indent: true,
      },
      { label: "MARGE BRUTE", values: margeBrute, isBold: true },
      {
        label: "Charges de Personnel",
        values: personnel.map((v) => -v),
        indent: true,
      },
      {
        label: "Impact Pacte Social",
        values: impactPacte.map((v) => -v),
        indent: true,
        isDeduction: true,
      },
      {
        label: "Autres Charges Fixes",
        values: autres.map((v) => -v),
        indent: true,
      },
      { label: "EBE", values: ebe, isBold: true },
      {
        label: "Dotations aux Amortissements",
        values: amort.map((v) => -v),
        indent: true,
      },
      {
        label: "RÉSULTAT D'EXPLOITATION",
        values: resultatExploitation,
        isBold: true,
      },
      {
        label: "Intérêts Financiers",
        values: interets.map((v) => -v),
        indent: true,
      },
      { label: "RÉSULTAT AVANT IS", values: rai, isBold: true },
      {
        label: "IS (Impôt sur les Sociétés)",
        values: is.map((v) => -v),
        indent: true,
        isDeduction: true,
      },
      {
        label: "RÉSULTAT NET",
        values: resultatNet,
        isBold: true,
        isHighlight: true,
      },
    ];
  }, [bpProjection]);

  // ─────────────────────────────────────────────────────────────────────────────
  // TAB 2 — P&L Réel
  // ─────────────────────────────────────────────────────────────────────────────
  const reelProjection = useMemo(() => {
    const croissanceCA =
      hypothesesBP.croissanceCA_Reel ?? hypothesesBP.tauxCroissanceCA ?? 3;
    const inflationCharges =
      hypothesesBP.inflationCharges_Reel ??
      hypothesesBP.tauxInflationCharges ??
      2;
    const tauxIS_bas = hypothesesBP.tauxIS_bas ?? 15;
    const tauxIS_haut = hypothesesBP.tauxIS_haut ?? 25;
    const seuilIS = hypothesesBP.seuilIS ?? 42500;
    const tauxChargesPatronales = hypothesesBP.tauxChargesPatronales ?? 42;

    // Année 1 base values from Réel selectors
    const ca1 = sectionA.caAnnuel;
    const matieres1 = sectionA.caMaterielAnnuel;
    const personnel1 = sectionB.masseSalarialeAnnuelle;
    const autres1 = sectionB.totalFraisFixesAnnuels;

    const impactPacteSocial = pacteSocialActif
      ? (associes ?? []).reduce(
          (sum, a) =>
            sum +
            (a.remunerationMensuelle || 0) * 12 * (tauxChargesPatronales / 100),
          0,
        )
      : 0;

    const years = [1, 2, 3, 4, 5];

    const ca = years.map((y) => projecterValeur(ca1, croissanceCA, y));
    const matieres = years.map((y) =>
      projecterValeur(matieres1, croissanceCA, y),
    );
    const margeBrute = years.map((_, i) => ca[i] - matieres[i]);
    const personnel = years.map((y) =>
      projecterValeur(personnel1, inflationCharges, y),
    );
    const autres = years.map((y) =>
      projecterValeur(autres1, inflationCharges, y),
    );
    const impactPacte = years.map(() => impactPacteSocial);

    const ebe = years.map(
      (_, i) => margeBrute[i] - personnel[i] - autres[i] - impactPacte[i],
    );

    const amort = years.map((y) =>
      (immobilisations ?? []).reduce(
        (sum, immo) =>
          sum +
          calcDotationAnnuelle(
            immo.valeurAchatHT,
            immo.dureeAmortissementAns,
            immo.type,
            y,
          ),
        0,
      ),
    );

    const resultatExploitation = years.map((_, i) => ebe[i] - amort[i]);

    const interets = years.map((y) =>
      (emprunts ?? []).reduce(
        (sum, emp) =>
          sum +
          calcAnnualInterest(
            emp.capitalInitial,
            emp.tauxAnnuel,
            emp.dureeMois,
            y,
          ),
        0,
      ),
    );

    const rai = years.map((_, i) => resultatExploitation[i] - interets[i]);
    const is = rai.map((r) =>
      calcIS(r, tauxIS_bas, tauxIS_haut, seuilIS, statutJuridique),
    );
    const resultatNet = rai.map((r, i) => r - is[i]);

    return {
      ca,
      matieres,
      margeBrute,
      personnel,
      autres,
      impactPacte,
      ebe,
      amort,
      resultatExploitation,
      interets,
      rai,
      is,
      resultatNet,
    };
  }, [
    hypothesesBP,
    sectionA,
    sectionB,
    associes,
    emprunts,
    immobilisations,
    pacteSocialActif,
    statutJuridique,
  ]);

  const reelRows = useMemo((): PnLRow[] => {
    const {
      ca,
      matieres,
      margeBrute,
      personnel,
      autres,
      impactPacte,
      ebe,
      amort,
      resultatExploitation,
      interets,
      rai,
      is,
      resultatNet,
    } = reelProjection;
    return [
      { label: "CA HT", values: ca },
      {
        label: "Matières premières (Food Cost)",
        values: matieres.map((v) => -v),
        indent: true,
      },
      { label: "MARGE BRUTE", values: margeBrute, isBold: true },
      {
        label: "Charges de Personnel",
        values: personnel.map((v) => -v),
        indent: true,
      },
      {
        label: "Impact Pacte Social",
        values: impactPacte.map((v) => -v),
        indent: true,
        isDeduction: true,
      },
      {
        label: "Autres Charges Fixes",
        values: autres.map((v) => -v),
        indent: true,
      },
      { label: "EBE", values: ebe, isBold: true },
      {
        label: "Dotations aux Amortissements",
        values: amort.map((v) => -v),
        indent: true,
      },
      {
        label: "RÉSULTAT D'EXPLOITATION",
        values: resultatExploitation,
        isBold: true,
      },
      {
        label: "Intérêts Financiers",
        values: interets.map((v) => -v),
        indent: true,
      },
      { label: "RÉSULTAT AVANT IS", values: rai, isBold: true },
      {
        label: "IS (Impôt sur les Sociétés)",
        values: is.map((v) => -v),
        indent: true,
        isDeduction: true,
      },
      {
        label: "RÉSULTAT NET",
        values: resultatNet,
        isBold: true,
        isHighlight: true,
      },
    ];
  }, [reelProjection]);

  // ─────────────────────────────────────────────────────────────────────────────
  // TAB 3 — Capacité d'Autofinancement
  // ─────────────────────────────────────────────────────────────────────────────
  const cafRows = useMemo((): PnLRow[] => {
    const { resultatNet, amort } = reelProjection;

    const cafBrute = resultatNet.map((rn, i) => rn + amort[i]);

    // Capital repayment from real loan data
    const remboursementCapital = [1, 2, 3, 4, 5].map((y) =>
      (emprunts ?? []).reduce(
        (sum, emp) =>
          sum +
          calcAnnualCapitalRepayment(
            emp.capitalInitial,
            emp.tauxAnnuel,
            emp.dureeMois,
            y,
          ),
        0,
      ),
    );

    // Rémunérations des associés: direct sum from associes[], NOT remunerationAssociesAnnuelle
    const remunerationAssocies = (associes ?? []).reduce(
      (sum, a) => sum + (a.remunerationMensuelle || 0) * 12,
      0,
    );
    const remunerationLine = [1, 2, 3, 4, 5].map(() => remunerationAssocies);

    const fluxNet = cafBrute.map(
      (cb, i) => cb - remboursementCapital[i] - remunerationLine[i],
    );

    return [
      { label: "Résultat Net", values: resultatNet, indent: true },
      { label: "+ Dotations aux Amortissements", values: amort, indent: true },
      { label: "CAF BRUTE", values: cafBrute, isBold: true, isHighlight: true },
      {
        label: "− Remboursement du Capital",
        values: remboursementCapital.map((v) => -v),
        indent: true,
        isDeduction: true,
      },
      {
        label: "− Rémunérations des Associés",
        values: remunerationLine.map((v) => -v),
        indent: true,
        isDeduction: true,
      },
      {
        label: "FLUX NET DE TRÉSORERIE",
        values: fluxNet,
        isBold: true,
        isHighlight: true,
      },
    ];
  }, [reelProjection, emprunts, associes]);

  // ── KPI values (index-safe reads) ─────────────────────────────────────────────
  const bpCA1 = bpRows[0]?.values[0] ?? 0;
  const bpNet1 = bpRows[12]?.values[0] ?? 0;
  const bpIS1 = Math.abs(bpRows[11]?.values[0] ?? 0);

  const reelCA1 = reelRows[0]?.values[0] ?? 0;
  const reelNet1 = reelRows[12]?.values[0] ?? 0;
  const reelIS1 = Math.abs(reelRows[11]?.values[0] ?? 0);

  // CAF rows: index 2 = CAF BRUTE, index 5 = FLUX NET
  const cafBrute1 = cafRows[2]?.values[0] ?? 0;
  const fluxNet1 = cafRows[5]?.values[0] ?? 0;

  return (
    <div className="space-y-6" data-ocid="comptabilite.page">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Calculator className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Comptabilité
            </h2>
            <p className="text-sm text-muted-foreground">
              Projection financière 5 ans — Business Plan, Réel &amp; CAF
            </p>
          </div>
        </div>

        {/* Right controls: Statut Juridique (read-only) + Pacte Social toggle */}
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="text-xs font-semibold px-3 py-1.5 border-border"
            data-ocid="comptabilite.statut_juridique.badge"
          >
            {statutJuridique}
            {statutJuridique === "SARL" && (
              <span className="ml-1 text-muted-foreground font-normal">
                — IS = 0 €
              </span>
            )}
          </Badge>

          <div
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5 shadow-sm"
            data-ocid="comptabilite.pacte_social.card"
          >
            <Users className="h-4 w-4 text-primary shrink-0" />
            <div className="flex flex-col gap-0.5">
              <Label
                htmlFor="pacte-social-toggle"
                className="text-sm font-semibold text-foreground cursor-pointer"
              >
                Pacte Social
              </Label>
              {pacteSocialActif && (
                <Badge
                  variant="secondary"
                  className="w-fit text-[10px] bg-orange-100 text-orange-700 border-orange-200"
                  data-ocid="comptabilite.pacte_social.badge"
                >
                  Actif — cotisations associés déduites
                </Badge>
              )}
            </div>
            <Switch
              id="pacte-social-toggle"
              checked={pacteSocialActif}
              onCheckedChange={(checked) =>
                updateHypotheses({ pacteSocialActif: checked })
              }
              data-ocid="comptabilite.pacte_social.toggle"
            />
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <Tabs defaultValue="bp" data-ocid="comptabilite.tabs">
        <TabsList className="mb-4">
          <TabsTrigger value="bp" data-ocid="comptabilite.bp.tab">
            P&amp;L Business Plan
          </TabsTrigger>
          <TabsTrigger value="reel" data-ocid="comptabilite.reel.tab">
            P&amp;L Réel
          </TabsTrigger>
          <TabsTrigger value="caf" data-ocid="comptabilite.caf.tab">
            Capacité d'Autofinancement
          </TabsTrigger>
        </TabsList>

        {/* ── P&L Business Plan ──────────────────────────────────────────────── */}
        <TabsContent value="bp" className="space-y-4">
          <KpiBar
            ca={bpCA1}
            net={bpNet1}
            is={bpIS1}
            label="Business Plan — Année 1"
            statut={statutJuridique}
          />
          <PnLTable rows={bpRows} />
        </TabsContent>

        {/* ── P&L Réel ─────────────────────────────────────────────────────── */}
        <TabsContent value="reel" className="space-y-4">
          {reelCA1 === 0 && (
            <Card
              className="border-dashed border-border bg-muted/30"
              data-ocid="comptabilite.reel.empty_state"
            >
              <CardContent className="flex items-center gap-3 py-4">
                <TrendingUp className="h-5 w-5 text-muted-foreground/60 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Aucune recette avec volume hebdomadaire saisi. Renseignez des
                  volumes dans le Laboratoire pour alimenter cette vue. Les
                  Années 2 à 5 sont projetées dynamiquement depuis les
                  Paramètres.
                </p>
              </CardContent>
            </Card>
          )}
          <KpiBar
            ca={reelCA1}
            net={reelNet1}
            is={reelIS1}
            label="Données constatées — Année 1 (projection 5 ans)"
            statut={statutJuridique}
          />
          <PnLTable rows={reelRows} />
        </TabsContent>

        {/* ── CAF ────────────────────────────────────────────────────────────── */}
        <TabsContent value="caf" className="space-y-4">
          <CafKpiBar caf={cafBrute1} flux={fluxNet1} />
          <PnLTable rows={cafRows} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── KPI Bar ──────────────────────────────────────────────────────────────────

interface KpiBarProps {
  ca: number;
  net: number;
  is: number;
  label: string;
  statut: "SASU" | "SARL";
}

function KpiBar({ ca, net, is, label, statut }: KpiBarProps) {
  return (
    <Card
      className="bg-card border-border"
      data-ocid="comptabilite.kpi_bar.card"
    >
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">CA Total</p>
            <p className="text-base font-bold text-foreground">{fmt(ca)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${net >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}
          >
            {net >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Résultat Net</p>
            <p
              className={`text-base font-bold ${net >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {fmt(net)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
            <Calculator className="h-4 w-4 text-orange-500" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">IS Année 1</p>
            {statut === "SARL" ? (
              <Badge
                variant="secondary"
                className="mt-0.5 text-xs font-semibold text-muted-foreground"
              >
                SARL — 0 €
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="mt-0.5 text-xs font-semibold"
              >
                {fmt(is)}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── CAF KPI Bar ──────────────────────────────────────────────────────────────

interface CafKpiBarProps {
  caf: number;
  flux: number;
}

function CafKpiBar({ caf, flux }: CafKpiBarProps) {
  return (
    <Card
      className="bg-card border-border"
      data-ocid="comptabilite.caf_kpi_bar.card"
    >
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Capacité d'Autofinancement — Année 1
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${caf >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}
          >
            <TrendingUp
              className={`h-4 w-4 ${caf >= 0 ? "text-green-600" : "text-red-600"}`}
            />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">CAF Brute</p>
            <p
              className={`text-base font-bold ${caf >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {fmt(caf)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${flux >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}
          >
            {flux >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">
              Flux Net de Trésorerie
            </p>
            <p
              className={`text-base font-bold ${flux >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {fmt(flux)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── P&L Table ────────────────────────────────────────────────────────────────

function PnLTable({ rows }: { rows: PnLRow[] }) {
  return (
    <Card
      className="border-border bg-card overflow-hidden"
      data-ocid="comptabilite.pnl_table.card"
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[280px] font-semibold text-foreground">
                Indicateur
              </TableHead>
              {[1, 2, 3, 4, 5].map((y) => (
                <TableHead
                  key={y}
                  className="text-right font-semibold text-foreground min-w-[120px]"
                >
                  Année {y}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <PnLRowComponent key={row.label} row={row} />
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function PnLRowComponent({ row }: { row: PnLRow }) {
  const { label, values, isBold, isHighlight, indent, isDeduction } = row;

  const rowClass = isHighlight
    ? "bg-primary/10"
    : isDeduction
      ? "bg-red-50/50 dark:bg-red-950/20"
      : isBold
        ? "bg-muted/60"
        : "";

  return (
    <TableRow className={rowClass} data-ocid="comptabilite.pnl.row">
      <TableCell
        className={[
          isBold
            ? "font-bold text-foreground"
            : isDeduction
              ? "text-red-600/80"
              : "text-muted-foreground",
          indent ? "pl-8" : "",
        ].join(" ")}
      >
        {label}
      </TableCell>
      {values.map((v, yi) => {
        const cellClass = isDeduction
          ? "text-right text-red-600/80"
          : [
              "text-right",
              isBold ? "font-bold" : "font-normal",
              isHighlight || isBold ? valueClass(v) : "",
            ].join(" ");
        return (
          <TableCell key={`year-${yi + 1}`} className={cellClass}>
            {fmt(v)}
          </TableCell>
        );
      })}
    </TableRow>
  );
}
