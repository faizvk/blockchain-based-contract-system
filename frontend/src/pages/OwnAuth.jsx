import { useNavigate } from "react-router-dom";
import Container from "../components/ui/Container";
import Button from "../components/ui/Button";
import { Card, CardBody } from "../components/ui/Card";

export default function OwnAuth() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-brand-50">
      <Container className="py-12 sm:py-20 max-w-xl">
        <Card>
          <CardBody>
            <h1 className="text-2xl font-bold text-surface-900">
              Register as
            </h1>
            <p className="mt-2 text-sm text-surface-700">
              Pick your registration type.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button fullWidth onClick={() => navigate("./signown")}>
                Owner
              </Button>
              <Button fullWidth variant="secondary" onClick={() => navigate("./signauth")}>
                Authenticator
              </Button>
            </div>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
}
