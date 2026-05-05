import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/core/store/useAppStore";
import {
  AlertTriangle,
  Building2,
  Download,
  Save,
  Scale,
  Settings,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Parametres() {
  const configEtablissement = useAppStore((s) => s.configEtablissement);
  const updateConfigEtablissement = useAppStore(
    (s) => s.updateConfigEtablissement,
  );
  const hypothesesBP = useAppStore((s) => s.hypothesesBP);
  const updateHypotheses = useAppStore((s) => s.updateHypotheses);

  // Local state ONLY for the reset confirmation input
  const [confirmReset, setConfirmReset] = useState("");

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleExport = () => {
    const state = useAppStore.getState();
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "erp-restaurant-data.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Export téléchargé avec succès", { duration: 3000 });
  };

  const handleReset = () => {
    if (confirmReset !== "CONFIRMER") return;
    toast.success("ERP réinitialisé", { duration: 3000 });
    localStorage.clear();
    window.location.reload();
  };

  // ── Derived display values ─────────────────────────────────────────────────

  const tauxChargesSalariales = hypothesesBP.tauxChargesSalariales ?? 22;
  const tauxChargesPatronales = hypothesesBP.tauxChargesPatronales ?? 42;
  const statutJuridique = hypothesesBP.statutJuridique ?? "SASU";
  const pacteSocialActif = hypothesesBP.pacteSocialActif ?? false;
  const tauxIS_bas = hypothesesBP.tauxIS_bas ?? 15;
  const tauxIS_haut = hypothesesBP.tauxIS_haut ?? 25;
  const seuilIS = hypothesesBP.seuilIS ?? 42500;
  const croissanceCA_BP = hypothesesBP.croissanceCA_BP ?? 3;
  const inflationCharges_BP = hypothesesBP.inflationCharges_BP ?? 2;
  const croissanceCA_Reel = hypothesesBP.croissanceCA_Reel ?? 3;
  const inflationCharges_Reel = hypothesesBP.inflationCharges_Reel ?? 2;
  const remunerationAssociesAnnuelle =
    hypothesesBP.remunerationAssociesAnnuelle ?? 0;

  return (
    <div className="space-y-6" data-ocid="parametres.page">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-5 w-5 text-primary" />
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Paramètres
          </h2>
          <p className="text-sm text-muted-foreground">
            Configuration générale, fiscalité et maintenance de l'application
          </p>
        </div>
      </div>

      {/* ── CARD 1 : Identité de l'Établissement ─────────────────────────── */}
      <Card
        className="border-border bg-card"
        data-ocid="parametres.identite.card"
      >
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
          <Building2 className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              Identité de l'Établissement
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Informations de base utilisées dans les calculs et rapports
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="nom-etablissement" className="text-sm">
                Nom de l'établissement
              </Label>
              <Input
                id="nom-etablissement"
                type="text"
                value={configEtablissement.nom}
                onChange={(e) =>
                  updateConfigEtablissement({ nom: e.target.value })
                }
                placeholder="Mon Restaurant"
                data-ocid="parametres.nom_etablissement.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="jours-ouverture" className="text-sm">
                Jours d'ouverture par an
              </Label>
              <Input
                id="jours-ouverture"
                type="number"
                min={1}
                max={365}
                value={configEtablissement.joursOuvertureParAn}
                onChange={(e) =>
                  updateConfigEtablissement({
                    joursOuvertureParAn: Number(e.target.value) || 300,
                  })
                }
                data-ocid="parametres.jours_ouverture.input"
              />
              <p className="text-xs text-muted-foreground">
                Utilisé pour le calcul de la marge journalière dans le Tableau
                de Bord
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tva-defaut" className="text-sm">
                TVA par défaut (%)
              </Label>
              <Input
                id="tva-defaut"
                type="number"
                min={0}
                max={100}
                value={configEtablissement.tvaParDefaut}
                onChange={(e) =>
                  updateConfigEtablissement({
                    tvaParDefaut: Number(e.target.value) || 0,
                  })
                }
                data-ocid="parametres.tva_defaut.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="devise" className="text-sm">
                Devise
              </Label>
              <Input
                id="devise"
                type="text"
                value={configEtablissement.devise}
                readOnly
                className="bg-muted cursor-not-allowed text-muted-foreground"
                data-ocid="parametres.devise.input"
              />
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <Button
              size="sm"
              className="gap-2"
              onClick={() =>
                toast.success("Paramètres enregistrés", { duration: 3000 })
              }
              data-ocid="parametres.identite.save_button"
            >
              <Save className="h-3.5 w-3.5" />
              Enregistrer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── CARD 2 : Fiscalité & Social ───────────────────────────────────── */}
      <Card
        className="border-border bg-card"
        data-ocid="parametres.fiscalite_social.card"
      >
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
          <Scale className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              Fiscalité & Social
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Statut juridique, charges sociales et paramètres fiscaux
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Statut juridique + Pacte Social */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="statut-juridique" className="text-sm">
                Statut Juridique
              </Label>
              <Select
                value={statutJuridique}
                onValueChange={(v) =>
                  updateHypotheses({
                    statutJuridique: v as "SASU" | "SARL",
                  })
                }
              >
                <SelectTrigger
                  id="statut-juridique"
                  data-ocid="parametres.statut_juridique.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SASU">SASU</SelectItem>
                  <SelectItem value="SARL">SARL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Pacte Social</Label>
              <div className="flex items-center gap-3 h-9 rounded-md border border-input bg-background px-3">
                <Switch
                  id="pacte-social"
                  checked={pacteSocialActif}
                  onCheckedChange={(checked) =>
                    updateHypotheses({ pacteSocialActif: checked })
                  }
                  data-ocid="parametres.pacte_social.switch"
                />
                <Label
                  htmlFor="pacte-social"
                  className="text-sm cursor-pointer select-none"
                >
                  {pacteSocialActif ? "Activé" : "Désactivé"}
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Active une majoration de 5% sur les charges de personnel dans
                les projections
              </p>
            </div>
          </div>

          {/* Charges sociales */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="taux-salarial" className="text-sm">
                Taux de charges salariales (%)
              </Label>
              <Input
                id="taux-salarial"
                type="number"
                min={0}
                max={100}
                value={tauxChargesSalariales}
                onChange={(e) =>
                  updateHypotheses({
                    tauxChargesSalariales: Number(e.target.value) || 0,
                  })
                }
                data-ocid="parametres.taux_salarial.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taux-patronal" className="text-sm">
                Taux de charges patronales (%)
              </Label>
              <Input
                id="taux-patronal"
                type="number"
                min={0}
                max={100}
                value={tauxChargesPatronales}
                onChange={(e) =>
                  updateHypotheses({
                    tauxChargesPatronales: Number(e.target.value) || 0,
                  })
                }
                data-ocid="parametres.taux_patronal.input"
              />
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Paramètres IS */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">
              Paramètres IS (Impôt sur les Sociétés)
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="taux-is-bas" className="text-sm">
                  Taux IS réduit (%)
                </Label>
                <Input
                  id="taux-is-bas"
                  type="number"
                  min={0}
                  max={100}
                  value={tauxIS_bas}
                  onChange={(e) =>
                    updateHypotheses({
                      tauxIS_bas: Number(e.target.value) || 0,
                    })
                  }
                  data-ocid="parametres.taux_is_bas.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="taux-is-haut" className="text-sm">
                  Taux IS normal (%)
                </Label>
                <Input
                  id="taux-is-haut"
                  type="number"
                  min={0}
                  max={100}
                  value={tauxIS_haut}
                  onChange={(e) =>
                    updateHypotheses({
                      tauxIS_haut: Number(e.target.value) || 0,
                    })
                  }
                  data-ocid="parametres.taux_is_haut.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seuil-is" className="text-sm">
                  Seuil IS (€)
                </Label>
                <Input
                  id="seuil-is"
                  type="number"
                  min={0}
                  value={seuilIS}
                  onChange={(e) =>
                    updateHypotheses({
                      seuilIS: Number(e.target.value) || 0,
                    })
                  }
                  data-ocid="parametres.seuil_is.input"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              L'IS n'est calculé que pour les structures SASU. Pour les SARL,
              l'IS est forcé à 0 €.
            </p>
          </div>
          <div className="flex justify-end pt-1">
            <Button
              size="sm"
              className="gap-2"
              onClick={() =>
                toast.success("Paramètres fiscaux enregistrés", {
                  duration: 3000,
                })
              }
              data-ocid="parametres.fiscalite.save_button"
            >
              <Save className="h-3.5 w-3.5" />
              Enregistrer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── CARD 3 : Projections Financières ─────────────────────────────── */}
      <Card
        className="border-border bg-card"
        data-ocid="parametres.projections.card"
      >
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
          <TrendingUp className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              Projections Financières
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Taux de croissance et d'inflation utilisés pour les projections
              sur 5 ans
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* BP Initial */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">
              Business Plan Initial
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="croissance-ca-bp" className="text-sm">
                  Croissance CA (%/an)
                </Label>
                <Input
                  id="croissance-ca-bp"
                  type="number"
                  min={-100}
                  max={200}
                  value={croissanceCA_BP}
                  onChange={(e) =>
                    updateHypotheses({
                      croissanceCA_BP: Number(e.target.value) || 0,
                    })
                  }
                  data-ocid="parametres.croissance_ca_bp.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inflation-charges-bp" className="text-sm">
                  Inflation charges (%/an)
                </Label>
                <Input
                  id="inflation-charges-bp"
                  type="number"
                  min={-100}
                  max={200}
                  value={inflationCharges_BP}
                  onChange={(e) =>
                    updateHypotheses({
                      inflationCharges_BP: Number(e.target.value) || 0,
                    })
                  }
                  data-ocid="parametres.inflation_charges_bp.input"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-border" />

          {/* BP Réel */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">
              Business Plan Réel
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="croissance-ca-reel" className="text-sm">
                  Croissance CA (%/an)
                </Label>
                <Input
                  id="croissance-ca-reel"
                  type="number"
                  min={-100}
                  max={200}
                  value={croissanceCA_Reel}
                  onChange={(e) =>
                    updateHypotheses({
                      croissanceCA_Reel: Number(e.target.value) || 0,
                    })
                  }
                  data-ocid="parametres.croissance_ca_reel.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inflation-charges-reel" className="text-sm">
                  Inflation charges (%/an)
                </Label>
                <Input
                  id="inflation-charges-reel"
                  type="number"
                  min={-100}
                  max={200}
                  value={inflationCharges_Reel}
                  onChange={(e) =>
                    updateHypotheses({
                      inflationCharges_Reel: Number(e.target.value) || 0,
                    })
                  }
                  data-ocid="parametres.inflation_charges_reel.input"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Rémunération associés */}
          <div className="space-y-1.5">
            <Label htmlFor="remuneration-associes" className="text-sm">
              Rémunération annuelle des associés (€)
            </Label>
            <Input
              id="remuneration-associes"
              type="number"
              min={0}
              value={remunerationAssociesAnnuelle}
              onChange={(e) =>
                updateHypotheses({
                  remunerationAssociesAnnuelle: Number(e.target.value) || 0,
                })
              }
              data-ocid="parametres.remuneration_associes.input"
            />
            <p className="text-xs text-muted-foreground">
              Ce montant est déduit de la CAF brute dans l'onglet "Capacité
              d'Autofinancement".
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── CARD 4 : Maintenance & Sécurité des Données ──────────────────── */}
      <Card
        className="border-border bg-card"
        data-ocid="parametres.maintenance.card"
      >
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
          <Settings className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              Maintenance & Sécurité des Données
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Export des données et réinitialisation sécurisée de l'application
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Export</p>
            <p className="text-xs text-muted-foreground mb-3">
              Téléchargez l'intégralité de vos données au format JSON pour les
              archiver ou les migrer.
            </p>
            <Button
              variant="outline"
              onClick={handleExport}
              className="gap-2"
              data-ocid="parametres.export.button"
            >
              <Download className="h-4 w-4" />
              Télécharger les données (JSON)
            </Button>
          </div>

          <Separator className="bg-border" />

          {/* Réinitialisation sécurisée */}
          <div
            className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 space-y-4"
            data-ocid="parametres.reset_zone.section"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-destructive">
                  Réinitialisation Sécurisée
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cette action est irréversible. Toutes les données seront
                  perdues.
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="confirm-reset"
                className="text-sm text-muted-foreground"
              >
                Tapez{" "}
                <span className="font-mono font-semibold text-foreground">
                  CONFIRMER
                </span>{" "}
                pour activer
              </Label>
              <Input
                id="confirm-reset"
                type="text"
                placeholder="Tapez CONFIRMER pour activer"
                value={confirmReset}
                onChange={(e) => setConfirmReset(e.target.value)}
                className="border-destructive/40 focus-visible:ring-destructive/30"
                data-ocid="parametres.confirm_reset.input"
              />
            </div>
            <Button
              variant="destructive"
              disabled={confirmReset !== "CONFIRMER"}
              onClick={handleReset}
              className="gap-2"
              data-ocid="parametres.reset.button"
            >
              <AlertTriangle className="h-4 w-4" />
              Réinitialiser tout l'ERP
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
