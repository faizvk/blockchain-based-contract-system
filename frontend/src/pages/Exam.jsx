import { Link, useNavigate } from "react-router-dom";
import Container from "../components/ui/Container";
import { Card, CardBody } from "../components/ui/Card";

const choices = [
  {
    role: "owner",
    title: "Organization",
    description:
      "Create tenders, evaluate sealed bids, and award contracts on-chain.",
    accent: "from-brand-500 to-brand-700",
  },
  {
    role: "contractor",
    title: "Contractor",
    description:
      "Submit sealed bids with safety deposits and compete transparently.",
    accent: "from-emerald-500 to-emerald-700",
  },
];

export default function Main() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-brand-50">
      <Container className="py-12 sm:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-surface-900">
            Create your account
          </h1>
          <p className="mt-3 text-surface-700">
            Choose how you'll use Smart Chain Contracts.
          </p>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {choices.map((c) => (
            <button
              key={c.role}
              onClick={() => navigate(`/signup/${c.role}`)}
              className="text-left group focus:outline-none"
            >
              <Card className="group-hover:-translate-y-0.5 transition-transform">
                <CardBody>
                  <div
                    className={`h-12 w-12 rounded-xl bg-gradient-to-br ${c.accent} text-white grid place-items-center font-bold shadow-md`}
                  >
                    {c.title[0]}
                  </div>
                  <h3 className="mt-4 font-semibold text-lg text-surface-900">
                    {c.title}
                  </h3>
                  <p className="mt-1 text-sm text-surface-700">{c.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-brand-700 font-medium text-sm">
                    Continue →
                  </span>
                </CardBody>
              </Card>
            </button>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-surface-700">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-900">
            Sign in
          </Link>
        </p>
      </Container>
    </div>
  );
}
