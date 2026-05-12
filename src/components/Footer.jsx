export default function Footer() {
  return (
    <footer className="mt-auto py-10 border-t border-gray-100 bg-white">
      <div className="flex flex-col items-center">
        <p className="text-sm font-bold tracking-widest mb-4">LOGO</p>
        <p className="text-xs text-gray-400">© 2026 E-shop Inc. Tous droits réservés.</p>
        <div className="flex gap-6 mt-6 text-xs font-semibold text-gray-500">
          <span className="opacity-30">INSTAGRAM</span>
          <span className="opacity-30">FACEBOOK</span>
          <span className="opacity-30">TWITTER</span>
        </div>
      </div>
    </footer>
  );
}