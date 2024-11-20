import { StreetSummary } from '@/types/address';

export const mockStreetData: StreetSummary[] = [
  { 
    STRID: 1001, 
    streetName: "Bahnhofstrasse", 
    zipCode: "6300", 
    city: "Zug",
    houseNumbers: [
      { number: "1" },
      { number: "2", addition: "A" },
      { number: "2", addition: "B" },
      { number: "3" },
      { number: "5" },
      { number: "7", addition: "A" },
      { number: "7", addition: "B" },
      { number: "7", addition: "C" },
    ]
  },
  { 
    STRID: 1002, 
    streetName: "Poststrasse", 
    zipCode: "6300", 
    city: "Zug",
    houseNumbers: [
      { number: "10" },
      { number: "12" },
      { number: "14", addition: "A" },
      { number: "14", addition: "B" },
      { number: "16" },
    ]
  },
  { 
    STRID: 1003, 
    streetName: "Bundesplatz", 
    zipCode: "6300", 
    city: "Zug",
    houseNumbers: [
      { number: "1" },
      { number: "3" },
      { number: "5", addition: "A" },
      { number: "5", addition: "B" },
    ]
  },
  { 
    STRID: 1004, 
    streetName: "Baarerstrasse", 
    zipCode: "6300", 
    city: "Zug",
    houseNumbers: [
      { number: "20" },
      { number: "22", addition: "A" },
      { number: "22", addition: "B" },
      { number: "24" },
    ]
  },
  { 
    STRID: 1005, 
    streetName: "Industriestrasse", 
    zipCode: "6300", 
    city: "Zug",
    houseNumbers: [
      { number: "15" },
      { number: "17" },
      { number: "19", addition: "A" },
      { number: "21" },
    ]
  },
  { 
    STRID: 2001, 
    streetName: "Bahnhofplatz", 
    zipCode: "6330", 
    city: "Cham",
    houseNumbers: [
      { number: "1" },
      { number: "2" },
      { number: "3", addition: "A" },
      { number: "3", addition: "B" },
    ]
  },
  { 
    STRID: 2002, 
    streetName: "Zugerstrasse", 
    zipCode: "6330", 
    city: "Cham",
    houseNumbers: [
      { number: "30" },
      { number: "32" },
      { number: "34", addition: "A" },
      { number: "36" },
    ]
  },
  { 
    STRID: 2003, 
    streetName: "Dorfstrasse", 
    zipCode: "6330", 
    city: "Cham",
    houseNumbers: [
      { number: "5" },
      { number: "7" },
      { number: "9", addition: "A" },
      { number: "11" },
    ]
  },
  { 
    STRID: 3001, 
    streetName: "Hauptstrasse", 
    zipCode: "6331", 
    city: "Hünenberg",
    houseNumbers: [
      { number: "40" },
      { number: "42" },
      { number: "44", addition: "A" },
      { number: "46" },
    ]
  },
  { 
    STRID: 3002, 
    streetName: "Chamerstrasse", 
    zipCode: "6331", 
    city: "Hünenberg",
    houseNumbers: [
      { number: "25" },
      { number: "27" },
      { number: "29", addition: "A" },
      { number: "31" },
    ]
  },
  { 
    STRID: 3003, 
    streetName: "Bahnhofstrasse", 
    zipCode: "6331", 
    city: "Hünenberg",
    houseNumbers: [
      { number: "50" },
      { number: "52" },
      { number: "54", addition: "A" },
      { number: "56" },
    ]
  },
];
