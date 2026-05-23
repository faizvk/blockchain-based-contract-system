import Container from "./ui/Container";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-surface-200 bg-white">
      <Container className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-surface-700">
        <p>© {new Date().getFullYear()} Smart Chain Contracts</p>
        <p className="text-surface-700/70">
          On-chain procurement, AI-evaluated bids.
        </p>
      </Container>
    </footer>
  );
}
