// Injeta o tema antes da hidratação pra evitar flash.
// Estratégia: lê localStorage("theme") -> aplica "light" | "dark" no <html data-theme=...>.
// Em fallback (sem nada setado), deixa o CSS padrão agir via prefers-color-scheme,
// sem mexer no html — evita hydration mismatch no ThemeToggle.

export default function ThemeScript() {
  const code = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch (_) {}
})();
`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
