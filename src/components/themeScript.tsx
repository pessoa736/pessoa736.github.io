// Injeta o tema antes da hidratação pra evitar flash.
// Estratégia: lê localStorage("theme") -> aplica "light" | "dark" no <html data-theme=...>.
// Se não tem nada salvo, respeita prefers-color-scheme do SO em vez de cair pra dark sempre.

export default function ThemeScript() {
  const code = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
      return;
    }
    // Sem preferência salva: segue o SO.
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  } catch (_) {}
})();
`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
