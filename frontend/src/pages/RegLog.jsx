import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Container from "../components/ui/Container";

export default function RegLog() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-surface-50 via-white to-brand-50">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 [background:radial-gradient(60%_60%_at_70%_10%,rgba(38,64,236,0.15),transparent_60%),radial-gradient(50%_60%_at_10%_90%,rgba(95,130,255,0.18),transparent_55%)]"
      />

      <Container className="min-h-screen flex flex-col">
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white font-bold shadow-md">
              ⌬
            </span>
            <span className="font-bold tracking-tight">Smart Chain Contracts</span>
          </div>
          <Link
            to="/login"
            className="text-sm font-medium text-brand-700 hover:text-brand-900"
          >
            Already a member? Login →
          </Link>
        </header>

        <section className="flex-1 grid lg:grid-cols-2 gap-10 items-center py-8 lg:py-16">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold">
              ● On-chain Procurement
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-surface-900">
              Tender smarter.
              <br />
              <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                Settle on-chain.
              </span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-surface-700 max-w-xl">
              A transparent, AI-evaluated bidding platform backed by Ethereum
              smart contracts and IPFS-pinned documents.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/info" className="block sm:inline-block">
                <Button size="lg" fullWidth>
                  Get started
                </Button>
              </Link>
              <Link to="/login" className="block sm:inline-block">
                <Button size="lg" variant="secondary" fullWidth>
                  I have an account
                </Button>
              </Link>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              {[
                { k: "Secure", v: "Commit/Reveal" },
                { k: "Auto", v: "AI scoring" },
                { k: "Open", v: "On-chain" },
              ].map((s) => (
                <div key={s.k} className="rounded-xl bg-white/70 border border-surface-200 p-3">
                  <dt className="text-xs text-surface-700/70">{s.k}</dt>
                  <dd className="font-semibold text-surface-900">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-brand-500/20 to-brand-300/10 blur-2xl rounded-3xl" />
            <div className="relative rounded-3xl border border-surface-200 bg-white shadow-xl p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Live tender</h3>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                  Bidding open
                </span>
              </div>
              <p className="mt-2 text-sm text-surface-700">
                Construction · Phase II
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  ["Budget", "120 ETH"],
                  ["Min bid", "8 ETH"],
                  ["Bidders", "12"],
                  ["Ends in", "23h 41m"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-surface-50 p-3 border border-surface-100">
                    <div className="text-xs text-surface-700/70">{k}</div>
                    <div className="font-semibold mt-0.5">{v}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 h-2 w-full rounded-full bg-surface-100 overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-brand-500 to-brand-700" />
              </div>
              <p className="mt-2 text-xs text-surface-700/70">Bidding progress</p>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
