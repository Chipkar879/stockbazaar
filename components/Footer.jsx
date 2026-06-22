export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white py-6 mt-12 text-center text-xs text-slate-400">
      <p>&copy; {new Date().getFullYear()} Stockbazaar Sandbox Engine. All rights reserved.</p>
    </footer>
  );
}