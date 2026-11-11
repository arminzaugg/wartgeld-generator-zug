import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Input, Label } from 'wartgeld-generator-zug';

export const SettingsSection = () => (
  <Card className="w-full max-w-md">
    <CardHeader>
      <CardTitle>Absender</CardTitle>
      <CardDescription>Ihre Angaben erscheinen im Kopf jeder Rechnung.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" defaultValue="Anna Muster, Hebamme" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="iban">IBAN</Label>
        <Input id="iban" defaultValue="CH93 0076 2011 6238 5295 7" />
      </div>
    </CardContent>
    <CardFooter className="justify-end">
      <Button>Speichern</Button>
    </CardFooter>
  </Card>
);

export const InvoiceSummary = () => (
  <Card className="w-full max-w-md">
    <CardHeader>
      <CardTitle className="text-xl">Rechnung Hebammenwartgeld</CardTitle>
      <CardDescription>An: Einwohnergemeinde Baar, Rathausstrasse 2, 6340 Baar</CardDescription>
    </CardHeader>
    <CardContent className="space-y-2 text-sm">
      <div className="flex justify-between"><span>Betreuung der Gebärenden zuhause</span><span>CHF 400.00</span></div>
      <div className="flex justify-between"><span>Pflege der Wöchnerin zuhause</span><span>CHF 400.00</span></div>
      <div className="flex justify-between border-t pt-2 font-semibold"><span>Total</span><span>CHF 800.00</span></div>
    </CardContent>
  </Card>
);

export const Plain = () => (
  <Card className="w-full max-w-md p-6">
    <p className="text-sm text-muted-foreground">
      Alle Patientinnendaten bleiben in Ihrem Browser. Es werden keine Personendaten auf einem Server gespeichert.
    </p>
  </Card>
);
