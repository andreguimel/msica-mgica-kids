import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { RefreshCw, LogOut, ShoppingCart, CheckCircle, XCircle, TrendingUp, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface Metrics {
  total: number;
  paid: number;
  pending: number;
  expired: number;
  completed: number;
  conversionRate: number;
  estimatedRevenue: number;
}

interface FunnelItem {
  stage: string;
  count: number;
}

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
}

const FUNNEL_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(142 76% 36%)", "hsl(262 83% 58%)"];

function statusBadge(status: string | null) {
  switch (status) {
    case "paid": return <Badge className="bg-green-500/10 text-green-600 border-green-200">Pago</Badge>;
    case "pending": return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Pendente</Badge>;
    case "expired": return <Badge className="bg-red-500/10 text-red-600 border-red-200">Expirado</Badge>;
    case "cancelled": return <Badge className="bg-red-500/10 text-red-600 border-red-200">Cancelado</Badge>;
    default: return <Badge variant="secondary">{status || "—"}</Badge>;
  }
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [funnel, setFunnel] = useState<FunnelItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  const token = sessionStorage.getItem("admin_token");

  const fetchData = async (p: string = period) => {
    if (!token) { navigate("/admin"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-dashboard?period=${p}`, {
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        sessionStorage.removeItem("admin_token");
        navigate("/admin");
        return;
      }

      const data = await res.json();
      setMetrics(data.metrics);
      setFunnel(data.funnel);
      setOrders(data.orders);
    } catch {
      toast({ title: "Erro", description: "Falha ao carregar dados", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) { navigate("/admin"); return; }
    fetchData();
  }, []);

  const handlePeriodChange = (v: string) => {
    setPeriod(v);
    fetchData(v);
  };

  const filteredOrders = statusFilter === "all"
    ? orders
    : statusFilter === "abandoned"
      ? orders.filter(o => o.payment_status === "expired" || o.payment_status === "cancelled")
      : orders.filter(o => o.payment_status === statusFilter);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-baloo font-bold text-foreground">Painel Administrativo</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchData()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" /> Sair
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <ShoppingCart className="h-4 w-4" /> Total Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">{metrics.total}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" /> Pagos
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-2xl font-bold text-green-600">{metrics.paid}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <XCircle className="h-4 w-4 text-red-500" /> Abandonados
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-2xl font-bold text-red-600">{metrics.expired}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-4 w-4" /> Conversão
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">{metrics.conversionRate}%</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-green-500" /> Receita
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">R$ {metrics.estimatedRevenue.toFixed(2)}</p></CardContent>
          </Card>
        </div>
      )}

      {/* Funnel Chart */}
      {funnel.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Funil de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnel} layout="vertical" margin={{ left: 120 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="stage" width={110} tick={{ fontSize: 13 }} />
                  <Tooltip formatter={(v: number) => [v, "Pedidos"]} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {funnel.map((_, i) => (
                      <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters + Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg">Pedidos</CardTitle>
          <div className="flex gap-2">
            <Select value={period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="paid">Pagos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="abandoned">Abandonados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Criança</TableHead>
                <TableHead>Tema</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="hidden md:table-cell">Música</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.child_name}</TableCell>
                  <TableCell>{o.theme}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-xs">{o.user_email || "—"}</TableCell>
                  <TableCell>{statusBadge(o.payment_status)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary" className="text-xs">{o.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(o.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                </TableRow>
              ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhum pedido encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
