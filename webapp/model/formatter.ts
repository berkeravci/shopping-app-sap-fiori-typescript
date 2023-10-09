export default {
    
    formatUnitPrice(unitPrice: any): any {
        
      const parsedUnitPrice = typeof unitPrice === "string" ? parseFloat(unitPrice) : unitPrice;
  
      if (!isNaN(parsedUnitPrice)) {
        
        
        
        return parsedUnitPrice.toFixed(2) + " EUR";

      } else {
        
        return "N/A";
      }
    },
  };