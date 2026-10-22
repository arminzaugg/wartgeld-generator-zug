import { ScrollArea } from 'wartgeld-generator-zug';

const gemeinden = ['Baar', 'Cham', 'Hünenberg', 'Menzingen', 'Neuheim', 'Oberägeri', 'Risch', 'Steinhausen', 'Unterägeri', 'Walchwil', 'Zug'];

export const MunicipalityList = () => (
  <ScrollArea type="always" className="h-48 w-64 rounded-md border">
    <div className="p-4">
      <h4 className="mb-4 text-sm font-medium leading-none">Gemeinden im Kanton Zug</h4>
      {gemeinden.map((g) => (
        <div key={g} className="border-b py-2 text-sm">{g}</div>
      ))}
    </div>
  </ScrollArea>
);
