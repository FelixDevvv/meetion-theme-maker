import { Link } from "@tanstack/react-router";
import { Copy, Play, ShoppingCart, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import heroBg from "@/assets/vortex-hero-bg.jpg";
import vortexMark from "@/assets/vortexsmp.png.asset.json";
import vortexTitle from "@/assets/vortexmc-network.png.asset.json";
import { useBasket } from "@/components/basket-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { STORE_CONFIG } from "@/lib/tebex";

export function StoreHero({ storeName }: { storeName?: string }) {
  const { username, setUsername, itemCount, setOpen } = useBasket();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const copyIp = () => {
    navigator.clipboard
      .writeText(STORE_CONFIG.serverIp)
      .then(() => toast.success("IP copiada al portapapeles"))
      .catch(() => toast.error("No se pudo copiar la IP"));
  };

  return (
    <header>
      <div className="gradient-primary flex flex-wrap items-center justify-center gap-3 px-4 py-2 text-center">
        <span className="label-caps text-primary-foreground">
          🔥 {STORE_CONFIG.promoBanner.text} 🔥
        </span>
        <Link
          to="/"
          className="label-caps rounded-md bg-background/80 px-3 py-1 text-foreground transition-colors hover:bg-background"
        >
          {STORE_CONFIG.promoBanner.ctaLabel}
        </Link>
      </div>

      <div className="relative overflow-hidden">
        <img
          src={heroBg}
          alt="Arte del servidor"
          width={1920}
          height={900}
          className="absolute inset-0 h-full w-full object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background" />

        <div className="relative mx-auto flex min-h-[420px] max-w-6xl flex-col px-4 py-5">
          <div className="flex items-start justify-between gap-3">
            <Link
              to="/"
              aria-label="Volver al inicio"
              className="panel-card flex size-14 items-center justify-center p-1.5 text-foreground transition-transform hover:scale-105"
            >
              <img
                src={vortexMark.url}
                alt="VortexMC Network"
                className="h-full w-full object-contain"
              />
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpen(true)}
                className="panel-card relative flex items-center gap-2 px-3 py-2"
              >
                <ShoppingCart className="size-4 text-primary-glow" />
                <span className="label-caps">Cesta</span>
                {itemCount > 0 && (
                  <span className="gradient-primary absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full text-[11px] font-bold text-primary-foreground">
                    {itemCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setDraft(username ?? "");
                  setDialogOpen(true);
                }}
                className="panel-card flex items-center gap-2 px-3 py-2 text-right"
              >
                <div className="leading-tight">
                  <div className="font-display text-sm">{username ?? "Invitado"}</div>
                  <div className="label-caps text-[10px] text-muted-foreground">
                    {username ? "Cambiar cuenta" : "Haz clic para iniciar sesión"}
                  </div>
                </div>
                <User className="size-5 text-primary-glow" />
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center py-8">
            <img
              src={vortexTitle.url}
              alt={storeName ?? STORE_CONFIG.serverName}
              width={1024}
              height={310}
              className="animate-brand-pulse w-[min(88vw,680px)] object-contain"
            />
            <h1 className="sr-only">{storeName ?? STORE_CONFIG.serverName}</h1>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <button onClick={copyIp} className="flex items-center gap-3 text-left">
              <span className="relative">
                <span className="gradient-primary flex size-10 items-center justify-center rounded-full text-primary-foreground">
                  <Play className="size-4 fill-current" />
                </span>
                <span className="gradient-primary absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-2 text-[11px] font-bold text-primary-foreground">
                  {STORE_CONFIG.playersOnline}
                </span>
              </span>
              <span>
                <span className="font-display block text-sm uppercase tracking-wider text-primary-glow">
                  {STORE_CONFIG.serverIp}
                </span>
                <span className="label-caps flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Copy className="size-3" /> Haz clic para copiar
                </span>
              </span>
            </button>

            <a
              href={STORE_CONFIG.discordUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-right"
            >
              <span>
                <span className="font-display block text-sm uppercase tracking-wider text-primary-glow">
                  Servidor de Discord
                </span>
                <span className="label-caps text-[10px] text-muted-foreground">
                  Haz clic para unirte
                </span>
              </span>
              <span className="relative">
                <span className="gradient-primary flex size-10 items-center justify-center rounded-full text-primary-foreground">
                  <DiscordIcon />
                </span>
                <span className="gradient-primary absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-2 text-[11px] font-bold text-primary-foreground">
                  {STORE_CONFIG.discordMembers}
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciar sesión</DialogTitle>
            <DialogDescription>
              Introduce tu nombre de usuario del juego para que los paquetes se entreguen a
              tu cuenta.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="TuNombreDeUsuario"
          />
          <DialogFooter>
            {username && (
              <Button
                variant="ghost"
                onClick={() => {
                  setUsername(null);
                  setDialogOpen(false);
                }}
              >
                Cerrar sesión
              </Button>
            )}
            <Button
              onClick={() => {
                if (!draft.trim()) {
                  toast.error("Escribe un nombre de usuario");
                  return;
                }
                setUsername(draft.trim());
                setDialogOpen(false);
                toast.success("¡Bienvenido!");
              }}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
      <path d="M20.317 4.369A19.79 19.79 0 0 0 15.885 3a13.9 13.9 0 0 0-.62 1.28 18.3 18.3 0 0 0-5.53 0A13.9 13.9 0 0 0 9.11 3a19.74 19.74 0 0 0-4.432 1.37C1.9 8.51 1.14 12.54 1.52 16.51a19.9 19.9 0 0 0 5.99 3.03c.48-.66.9-1.36 1.27-2.09-.7-.26-1.36-.58-1.99-.96.17-.12.33-.25.49-.38a14.2 14.2 0 0 0 12.44 0c.16.14.32.26.49.38-.63.38-1.3.7-2 .96.36.73.79 1.43 1.27 2.09a19.86 19.86 0 0 0 6-3.03c.44-4.6-.76-8.6-3.16-12.14ZM8.68 14.09c-1.18 0-2.15-1.08-2.15-2.4 0-1.32.95-2.41 2.15-2.41 1.21 0 2.18 1.09 2.16 2.41 0 1.32-.95 2.4-2.16 2.4Zm6.64 0c-1.18 0-2.15-1.08-2.15-2.4 0-1.32.95-2.41 2.15-2.41 1.21 0 2.18 1.09 2.16 2.41 0 1.32-.95 2.4-2.16 2.4Z" />
    </svg>
  );
}
