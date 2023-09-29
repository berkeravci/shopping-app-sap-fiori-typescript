import Router from "sap/f/routing/Router";
import Table from "sap/m/Table";
import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import JSONModel from "sap/ui/model/json/JSONModel";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
export default class CustomerController extends Controller {
    private oDataModel: ODataModel;
    private Customers:[] = [];
    public onInit():void{
        var oC = this.getOwnerComponent() as UIComponent;
        var rT = oC.getRouter() as Router;
        rT.getRoute("customer");


        this.oDataModel = new ODataModel({
            serviceUrl: "/V2/Northwind/Northwind.svc/",
          });
        this.fetchCustomerData();
    }

    public async fetchCustomerData(): Promise<void> {
        
        const sPath = "/Customers"; 
        
        try {
            const oData: any = await new Promise((resolve, reject) => {
                this.oDataModel.read(sPath, {
                    success: resolve,
                    error: reject,
                });
            });
            this.Customers = oData.results;
            console.log(this.Customers)
            const table = this.getView()?.byId("customerTable") as Table;
            const oModel = new JSONModel(this.Customers);
            oModel.setData({items:this.Customers});
            table!.setModel(oModel,"custModel");
            
            
        } catch (error) {
            
        }
    }
    

}