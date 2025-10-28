import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-soft p-4">
      <Card className="w-full max-w-md text-center shadow-elevated">
        <CardContent className="pt-6">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="mb-2 text-6xl font-bold text-primary">404</h1>
          <h2 className="mb-2 text-2xl font-semibold">Page Not Found</h2>
          <p className="mb-6 text-muted-foreground">
            Oops! The page you're looking for doesn't exist.
          </p>
          <Link to="/dashboard">
            <Button variant="gradient">Return to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
