import { verifySession, getCompany } from "@/lib/auth/dal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await verifySession();
  const company = await getCompany();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Your company profile</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">Company name</span>
            <p className="font-medium">{company?.name ?? "Unknown"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Email</span>
            <p className="font-medium">{company?.email ?? "Unknown"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Account ID</span>
            <p className="font-mono text-xs">{session.userId}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
