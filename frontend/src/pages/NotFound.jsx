import { Link } from "react-router-dom";
import Container from "../components/ui/Container";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-brand-50 grid place-items-center">
      <Container className="text-center max-w-md py-16">
        <p className="text-7xl font-extrabold bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
          404
        </p>
        <h1 className="mt-4 text-2xl sm:text-3xl font-bold">Page not found</h1>
        <p className="mt-2 text-surface-700">
          The page you're looking for doesn't exist or has moved.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/">
            <Button>Go home</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary">Sign in</Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
