import "./style.css";

export default function Footer() {
  const anoAtual = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>© {anoAtual} Help Desk TI. Todos os direitos reservados.</p>
    </footer>
  );
}