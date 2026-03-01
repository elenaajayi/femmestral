import { NavLink as RouterNavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

const NavLink = ({ to, children, className }: NavLinkProps) => {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "transition-colors",
          isActive ? "text-foreground font-medium" : "",
          className
        )
      }
    >
      {children}
    </RouterNavLink>
  );
};

export { NavLink };
