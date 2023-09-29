export default {
    
    formatUnitPrice(unitPrice: any): any {
        
      // Ensure unitPrice is a number
      const parsedUnitPrice = typeof unitPrice === "string" ? parseFloat(unitPrice) : unitPrice;
  
      // Check if parsedUnitPrice is NaN or not
      if (!isNaN(parsedUnitPrice)) {
        // Format to two decimal places and add " EUR"
        
        console.log(parsedUnitPrice.toFixed(2) + " EUR");
        return parsedUnitPrice.toFixed(2) + " EUR";

      } else {
        // Handle the case where unitPrice is not a valid number
        return "N/A";
      }
    },
  };