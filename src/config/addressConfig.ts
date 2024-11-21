interface CantonConfig {
  enabled: boolean;
  zipCodes: string[];
}

export const addressConfig = {
  zipFilter: {
    cantons: {
      ZG: {
        enabled: true,
        zipCodes: [
          "6300", "6301", "6302", "6303", "6312", "6313", 
          "6314", "6315", "6317", "6318", "6319", "6330", 
          "6331", "6332", "6333", "6340", "6341", "6343", "6345"
        ]
      }
    } as Record<string, CantonConfig>
  }
};