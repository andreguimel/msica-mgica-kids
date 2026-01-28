import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MagicButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "accent";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
}

const variants = {
  primary: "bg-primary text-primary-foreground shadow-pink hover:shadow-magic",
  secondary: "bg-secondary text-secondary-foreground shadow-blue hover:shadow-[0_12px_40px_-5px_hsl(200_85%_75%_/_0.4)]",
  accent: "bg-accent text-accent-foreground shadow-yellow hover:shadow-[0_12px_40px_-5px_hsl(45_95%_65%_/_0.4)]",
};

const sizes = {
  sm: "py-2 px-4 text-sm",
  md: "py-3 px-6 text-base",
  lg: "py-4 px-8 text-lg",
};

export function MagicButton({
  children,
  onClick,
  className,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
}: MagicButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "relative overflow-hidden rounded-full font-bold transition-all duration-300",
        "hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"
        animate={!disabled ? { translateX: ["100%", "-100%"] } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1,
        }}
      />
      
      {/* Content */}
      <span className="relative flex items-center justify-center gap-2">
        {loading ? (
          <>
            <motion.span
              className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            Criando magia...
          </>
        ) : (
          children
        )}
      </span>
    </motion.button>
  );
}
