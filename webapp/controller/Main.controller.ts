import Controller from "sap/ui/core/mvc/Controller";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import GenericTile from "sap/m/GenericTile";
import TileContent from "sap/m/TileContent";
import Router from "sap/f/routing/Router";
import UIComponent from "sap/ui/core/UIComponent";

export default class MainController extends Controller {
  private oDataModel: ODataModel;

  onInit(): void {
    this.oDataModel = new ODataModel({
      serviceUrl: "/V2/Northwind/Northwind.svc/$metadata",
    });

    this.fetchAllEntityNames();
  }
  public onTap():void{
      
    const oComponent = this.getOwnerComponent() as UIComponent;
    const oRouter = oComponent.getRouter() as Router;
    oRouter.navTo("customer");
    
  }
  public onProductTap():void{
      
    const oComponent = this.getOwnerComponent() as UIComponent;
    const oRouter = oComponent.getRouter() as Router;
    oRouter.navTo("product");
    
  }
  async fetchAllEntityNames(): Promise<void> {
    const metadataUrl = "/V2/Northwind/Northwind.svc/$metadata";
    const view = this.getView();

    try {
      const metadataResponse = await fetch(metadataUrl);
      if (!metadataResponse.ok) {
        throw new Error("Failed to fetch metadata");
      }

      const metadataText = await metadataResponse.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(metadataText, "application/xml");

      var entityNames: string[] = [];
      const entityElements = xmlDoc.querySelectorAll("EntityType");
      entityElements.forEach((entityElement) => {
        const entityName = entityElement.getAttribute("Name");
        if (entityName) {
          entityNames.push(entityName);
        }
      });
      entityNames = entityNames.map((name) => this.transformEntityName(name));
      for (let index = 1; index < entityNames.length; index++) {
          const element = entityNames[index];
          let id = index.toString();
          var oGenericTile = this.byId(id) as GenericTile;
          oGenericTile!.setHeader(element);
          
      }
    //   var oGenericTile = this.byId("1") as GenericTile;
    //   oGenericTile.setHeader("asdasd");
      entityNames.forEach((entityName) => {
        const tile = new GenericTile({
          header: entityName, 
          press: function () {
            alert(`Clicked on ${entityName}`);
          }
          
        });
        view!.addContent(tile);
      });
      console.log("Available entities:", entityNames);
    } catch (error) {
      
      console.error("Error:", error);
    }
  }
  private transformEntityName(name: string): string {
    const words = name.split("_");
    const transformedName = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    return transformedName;
  }
}
