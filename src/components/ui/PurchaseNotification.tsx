import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music } from "lucide-react";

const names = [
  "Ana", "Carlos", "Juliana", "Pedro", "Mariana", "Lucas", "Fernanda",
  "Rafael", "Camila", "Bruno", "Letícia", "Gustavo", "Isabela", "Thiago",
  "Larissa", "Diego", "Patrícia", "Matheus", "Bianca", "Felipe",
];

const cities = [
  "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Porto Alegre",
  "Salvador", "Brasília", "Recife", "Fortaleza", "Florianópolis",
  "Goiânia", "Manaus", "Campinas", "Vitória", "Belém",
];

const childNames = [
  "Miguel", "Helena", "Arthur", "Alice", "Gael", "Laura", "Theo",
  "Valentina", "Noah", "Sophia", "Davi", "Isabella", "Bernardo", "Manuela",
  "Heitor", "Júlia", "Lorenzo", "Cecília", "Gabriel", "Eloá",
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomMinutesAgo(): string {
  const mins = Math.floor(Math.random() * 12) + 1;
  return `${mins} min atrás`;
}

export function PurchaseNotification() {
  const [visible, setVisible] = useState(false);
  const [notification, setNotification] = useState({
    buyerName: "",
    city: "",
    childName: "",
    timeAgo: "",
  });

  useEffect(() => {
    const showNotification = () => {
      setNotification({
        buyerName: getRandomItem(names),
        city: getRandomItem(cities),
        childName: getRandomItem(childNames),
        timeAgo: getRandomMinutesAgo(),
      });
      setVisible(true);
      setTimeout(() => setVisible(false), 4000);
    };

    // First notification after 3-5 seconds
    const initialTimer = setTimeout(showNotification, 3000 + Math.random() * 2000);

    // Then every 7 seconds
    const interval = setInterval(showNotification, 7000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -80, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -80 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-6 left-6 z-50 max-w-xs"
        >
          <div className="bg-card border border-border rounded-2xl shadow-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Music className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground leading-tight">
                {notification.buyerName} de {notification.city}
              </p>
              <p className="text-xs text-muted-foreground leading-tight">
                comprou uma música para <span className="font-semibold text-foreground">{notification.childName}</span>
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                {notification.timeAgo}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
