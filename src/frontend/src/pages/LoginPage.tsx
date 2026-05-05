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
import { useState } from "react";

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (username === "admin" && password === "admin123") {
      setError("");
      onLogin();
    } else {
      setError("Identifiant ou mot de passe incorrect.");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            Mini-ERP Restaurant
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Espace de gestion interne
          </p>
        </div>

        <Card className="border-border shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Connexion</CardTitle>
            <CardDescription>
              Veuillez vous identifier pour accéder à l'application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username">Identifiant</Label>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Votre identifiant"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  data-ocid="login.input"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-ocid="login.password_input"
                />
              </div>

              {error && (
                <p
                  className="text-sm text-destructive font-medium"
                  data-ocid="login.error_state"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                data-ocid="login.submit_button"
              >
                Se connecter
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
