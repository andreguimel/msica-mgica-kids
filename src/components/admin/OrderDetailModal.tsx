import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Music, Mail, Calendar, User, Palette, Clock } from "lucide-react";

interface Order {
  id: string;
  child_name: string;
  theme: string;
  user_email: string | null;
  payment_status: string | null;
  status: string;
  created_at: string;
  billing_id: string | null;
  music_style: string | null;
  age_group: string;
  lyrics: string | null;
  audio_url: string | null;
  download_url: string | null;
  access_code: string | null;
  download_expires_at: string | null;
}

function statusBadge(status: string | null) {
  switch (status) {
    case "paid": return <Badge className="bg-green-500/10 text-green-600 border-green-200">Pago</Badge>;
    case "pending": return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Pendente</Badge>;
    case "expired": return <Badge className="bg-red-500/10 text-red-600 border-red-200">Expirado</Badge>;
    case "cancelled": return <Badge className="bg-red-500/10 text-red-600 border-red-200">Cancelado</Badge>;
    default: return <Badge variant="secondary">{status || "—"}</Badge>;
  }
}

interface Props {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function OrderDetailModal({ order, open, onOpenChange }: Props) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> {order.child_name}
          </DialogTitle>
          <DialogDescription>Detalhes do pedido</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1"><Palette className="h-3.5 w-3.5" /> Tema</p>
            <p className="font-medium">{order.theme}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1"><Music className="h-3.5 w-3.5" /> Estilo</p>
            <p className="font-medium">{order.music_style || "—"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Faixa Etária</p>
            <p className="font-medium">{order.age_group}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> Email</p>
            <p className="font-medium">{order.user_email || "—"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Pagamento</p>
            {statusBadge(order.payment_status)}
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Status Música</p>
            <Badge variant="secondary">{order.status}</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Criado em</p>
            <p className="font-medium">{new Date(order.created_at).toLocaleString("pt-BR")}</p>
          </div>
          {order.access_code && (
            <div className="space-y-1">
              <p className="text-muted-foreground">Código de Acesso</p>
              <p className="font-mono font-bold text-primary">{order.access_code}</p>
            </div>
          )}
        </div>

        {order.download_expires_at && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Download expira em: {new Date(order.download_expires_at).toLocaleString("pt-BR")}
          </div>
        )}

        {/* Audio Player */}
        {order.audio_url && (
          <div className="space-y-2">
            <p className="text-sm font-medium">🎵 Áudio Gerado</p>
            <audio controls className="w-full" src={order.audio_url} preload="metadata" />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <a href={order.audio_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> Abrir
                </a>
              </Button>
              {order.download_url && (
                <Button size="sm" variant="outline" asChild>
                  <a href={order.download_url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-3.5 w-3.5 mr-1" /> Baixar MP3
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Lyrics */}
        {order.lyrics && (
          <div className="space-y-2">
            <p className="text-sm font-medium">📝 Letra</p>
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg max-h-60 overflow-y-auto font-sans">
              {order.lyrics}
            </pre>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
