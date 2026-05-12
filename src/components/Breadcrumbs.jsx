import { Link, useLocation } from "react-router-dom";

const LABELS = {
  "": "Accueil",
  shop: "Boutique",
  cart: "Panier",
  login: "Connexion",
  register: "Inscription",
  "add-product": "Ajouter un produit",
  dashboard: "Tableau de bord",
  "seller-orders": "Ventes",
  payment: "Paiement",
  admin: "Administration",
  notifications: "Notifications",
  "my-orders": "Mes achats",
};

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, index) => {
    const path = "/" + segments.slice(0, index + 1).join("/");
    const isLast = index === segments.length - 1;
    const label = LABELS[segment] || segment.replace(/-/g, " ");

    return { path, label, isLast };
  });

  return (
    <nav className="max-w-[1100px] mx-auto px-6 pt-8" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <li>
          <Link to="/" className="hover:text-black transition-colors">Accueil</Link>
        </li>
        {crumbs.map((crumb) => (
          <li key={crumb.path} className="flex items-center gap-2">
            <span className="text-gray-300">/</span>
            {crumb.isLast ? (
              <span className="text-black">{crumb.label}</span>
            ) : (
              <Link to={crumb.path} className="hover:text-black transition-colors">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
