import Controller from "sap/ui/core/mvc/Controller";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import UIComponent from "sap/ui/core/UIComponent";
import Router from "sap/f/routing/Router";
import Table from "sap/m/Table";
import JSONModel from "sap/ui/model/json/JSONModel";
import List from "sap/m/List";
import Wizard from "sap/m/Wizard";
import NavContainer from "sap/m/NavContainer";
import DynamicPage from "sap/f/DynamicPage";
import Page from "sap/m/Page";
import ObjectHeader from "sap/m/ObjectHeader";
import Item from "sap/ui/core/Item";
import StandardListItem from "sap/m/StandardListItem";
import { Path, Pathname } from "react-router-dom";
import Model from "sap/ui/model/Model";
import Binding from "sap/ui/model/Binding";
import Context from "sap/ui/model/Context";
import BindingPath from "sap/ui/test/matchers/BindingPath";
import MessageBox, { Action } from "sap/m/MessageBox";
import SegmentedButton from "sap/m/SegmentedButton";
import WizardStep from "sap/m/WizardStep";
import formatter from "../model/formatter";
import Input from "sap/m/Input";
import ContentManager from "sap/ui/vk/ContentManager";
import Text from "sap/m/Text";
import TextArea from "sap/m/TextArea";
import JSONPropertyBinding from "sap/ui/model/json/JSONPropertyBinding";
import PropertyBinding from "sap/ui/model/PropertyBinding";
import Integer from "sap/ui/model/type/Integer";
interface History {
    [key: string]: any;
}

export default class ProductController extends Controller {
    
    private oDataModel: ODataModel;
    private Products:[] = [];
    private _wizard: Wizard;
    private _oNavContainer: NavContainer;
    private _oDynamicPage: DynamicPage;
    private selectedMethod: string;
    private selectedMethod1: string;
    formatter = formatter;
    private model:JSONModel;
    
    public onInit():void{
        
        this._wizard = this.byId("ShoppingCartWizard") as Wizard;
        var oC = this.getOwnerComponent() as UIComponent;
        var rT = oC.getRouter() as Router;
        rT.getRoute("product");

        
        this._wizard = this.byId("ShoppingCartWizard") as Wizard;
		this._oNavContainer = this.byId("navContainer") as NavContainer;
		this._oDynamicPage = this.getPage();

        this.oDataModel = new ODataModel({
            serviceUrl: "/V2/Northwind/Northwind.svc/",
          });
        this.model = new JSONModel();
            
          this.model.setProperty("/selectedPayment", "Credit Card");
          this.model.setProperty("/selectedDeliveryMethod", "Standard Delivery");
          this.model.setProperty("/differentDeliveryAddress", false);
          this.model.setProperty("/CashOnDelivery", {});
          this.model.setProperty("/BillingAddress", {});
          this.model.setProperty("/CreditCard", {});  
          this.model.updateBindings(true);
         
         this.fetchProductData();
         this.getView()!.setModel(this.model);  
           
    }
    public getPage():DynamicPage {
        return this.byId("dynamicPage") as DynamicPage;
    }
    public sumOfPrice():void{
        
        let totalUnitPrice = 0;
        for (const product of this.Products as any) {
            
            let unitPrice = parseFloat(product.UnitPrice);
            totalUnitPrice += unitPrice;
            
        }
    
    }
    public async fetchProductData(): Promise<void> {    
        const sPath = "/Products";     
        try {
            const oData: any = await new Promise((resolve, reject) => {
                this.oDataModel.read(sPath, {
                    success: resolve,
                    error: reject,
                });
            });
            this.Products = oData.results;
          
            const list = this.getView()?.byId("prodList") as List;
            const oModel = new JSONModel(this.Products);
            oModel.setData({items:this.Products});
            list!.setModel(oModel,"prodModel");
        let totalUnitPrice = 0;
        for (const product of this.Products as any) {
            let unitPrice = parseFloat(product.UnitPrice);
            unitPrice = parseFloat(unitPrice.toFixed(2));
            totalUnitPrice += unitPrice;   
        }    
             this.model.setProperty("/ProductsTotalPrice",totalUnitPrice);   
        } catch (error) {   
        }
    }
    public selectedPaymentMethod():void{
        const selectedKey = this.model.getProperty("/selectedPayment");
        this.setDiscardableProperty({
            message: "Are you sure you want to change the payment type ? This will discard your progress.",
            discardStep: this.byId("PaymentTypeStep"),
            modelPath: "/selectedPayment",
            historyPath: "prevPaymentSelect"
        });
    }
    public selectedDeliveryMethod():void{
        this.model.getProperty("/selectedDeliveryMethod") || "Standard Delivery";
        const selectedKey = this.model.getProperty("/selectedDeliveryMethod");
        this.setDiscardableProperty({
            message: "Are you sure you want to change the payment type ? This will discard your progress.",
            discardStep: this.byId("DeliveryTypeStep"),
            modelPath: "/selectedPayment",
            historyPath: "prevPaymentSelect"
        });
       
    }

    public handleDelete(oEvent:any):void{
          const list = this.byId("prodList") as List;
          const myModel = list.getModel("prodModel") as JSONModel;
          const oBinding = list.getBinding("items") as any;
          const selectedItem = oEvent.getParameter("listItem") as StandardListItem;
          const itemIndex = list.indexOfItem(selectedItem);
          const sPath = selectedItem.getBindingContext() as any;
          const oModel = this.getView()!.getModel as any;
          const model = this.getView()!.getModel("prodModel") as any;
          
          const aItems = myModel.getData().items as any[]; 
          const nIndex = aItems.findIndex((item) => item.__metadata.uri === sPath); 

          if (itemIndex !== -1) {
            aItems.splice(itemIndex, 1); 
            myModel.refresh(); 
            let totalUnitPrice:number = 0
            list!.getBinding("items")?.refresh;
            aItems.forEach((item) => {
                
                let unitPrice = parseFloat(item.UnitPrice);
          
                if (!isNaN(unitPrice)) {
                  totalUnitPrice += unitPrice;
                }
              });
              let header = this.byId("objHeader") as ObjectHeader;
            header!.setNumber(totalUnitPrice.toString());
            
          }
    }
    public goToPaymentStep():void {
        var selectedKeyy = this.model.getProperty("/selectedPayment") as any;
        switch (selectedKeyy) {
            case "Credit Card":
                var crstep = this.byId("CreditCardStep") as WizardStep;
                var curStep = this.byId("PaymentTypeStep") as WizardStep;
                curStep.setNextStep(crstep);
                break;
             case "Bank Transfer":
                var bastep = this.byId("BankAccountStep") as WizardStep;
                var curStep = this.byId("PaymentTypeStep") as WizardStep;
                curStep.setNextStep(bastep);
                 break;
             case "Cash on Delivery":
                var codstep = this.byId("CashOnDeliveryStep") as WizardStep;
                var curStep = this.byId("PaymentTypeStep") as WizardStep;
                curStep.setNextStep(codstep);
                 break;
            default:
                var crstep = this.byId("CreditCardStep") as WizardStep;
                var curStep = this.byId("PaymentTypeStep") as WizardStep; 
                curStep.setNextStep(crstep);
                break;
        }
    }
     public setPaymentMethod():void {
        this.setDiscardableProperty({
            message: "Are you sure you want to change the payment type ? This will discard your progress.",
            discardStep: this.byId("PaymentTypeStep"),
            modelPath: "/selectedPayment",
            historyPath: "prevPaymentSelect"
        });
    }
    // public setDifferentDeliveryAddress():void {
    //     this.setDiscardableProperty({
    //         message: "Are you sure you want to change the delivery address ? This will discard your progress",
    //         discardStep: this.byId("BillingStep"),
    //         modelPath: "/differentDeliveryAddress",
    //         historyPath: "prevDiffDeliverySelect"
    //     });
    // }
    public setDiscardableProperty(params:any):void {
        const _wizard = this._wizard;
        const model = this.getView()?.getModel() as any;
        const history: History = {};
        if (this._wizard.getProgressStep() !== params.discardStep as any) {
            MessageBox.warning(params.message, {
                actions: [Action.YES,Action.CANCEL],
                onClose(oAction:any):void {
                    if (oAction === Action.YES as any) {                    
                        _wizard.discardProgress(params.discardStep,true);
                        history[params.historyPath] = model.getProperty(params.modelPath);
                        
                    } else {
                        model.setProperty(params.modelPath, history[params.historyPath]);
                    }
                }
            });
        } else {
            history[params.historyPath] = this.model.getProperty(params.modelPath);
        }
    }
    public checkCreditCardStep():void {
       
        var name = this.model.getProperty("/CreditCard/Name") || "";
        var number = this.model.getProperty("/CreditCard/CardNumber") || "";
        var code = this.model.getProperty("/CreditCard/SecurityCode") || "";
        var expire = this.model.getProperty("/CreditCard/Expire");
        const today = new Date();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const yy = String(today.getFullYear()).slice(-2);
        const formattedDate = `${mm}/${dd}/${yy}`;    
        var todayDate = new Date(formattedDate);
        var expireDate = new Date(expire)
        var nnumber = number.toString();
        var ccode = code.toString();
        // if(nnumber.length % 4 == 0 && nnumber.length>0){
            
        //     this.model.setProperty("/CreditCard/CardNumber",nnumber+" ");
        
            
        // }
			if (name.length < 3 || nnumber.length < 16 || ccode.length < 3 || expireDate < todayDate || expire == undefined) {
                
				this._wizard.invalidateStep(this.byId("CreditCardStep") as WizardStep);
			} else {
				this._wizard.validateStep(this.byId("CreditCardStep") as WizardStep);
			}
    }

    public checkCashOnDeliveryStep():void {
       
        let name = this.model.getProperty("/CashOnDelivery/FirstName")||"";
        if (name.length < 3) {
            this._wizard.invalidateStep(this.byId("CashOnDeliveryStep") as WizardStep);
        } else {
            this._wizard.validateStep(this.byId("CashOnDeliveryStep") as WizardStep);
        }
    }
    public completedHandler():void {
        var page = this.byId("wizardBranchingReviewPage") as Page;
        var myList = this.byId("reviewData") as List;
        this._oNavContainer.to(page);
        let list = this.byId("prodList") as List;
        const myModel = list.getModel("prodModel") as JSONModel;
        const aItems = myModel.getData().items as any[];
        myModel.setData({items:aItems});
        myList.setModel(myModel,"model");
        let totalUnitPrice:number = 0;
        aItems.forEach((item) => {   
            let unitPrice = parseFloat(item.UnitPrice);
            if (!isNaN(unitPrice)) {
              totalUnitPrice += unitPrice;
            }
          });
          let header = this.byId("obj") as ObjectHeader;
        header!.setNumber(totalUnitPrice.toString());
    }

    public checkBillingStep():void {
        let address = this.model.getProperty("/BillingAddress/Address") || "";
        let city = this.model.getProperty("/BillingAddress/City") || "";
        let zipcode = this.model.getProperty("/BillingAddress/ZipCode") || "";
        let country = this.model.getProperty("/BillingAddress/Country") || "";
        let note = this.model.getProperty("/BillingAddress/Note") || "";
        if (address.length < 3 || city.length < 3 || zipcode.length < 3 || country.length < 3) {
            this._wizard.invalidateStep(this.byId("BillingStep") as WizardStep);
            
        } else {
            this._wizard.validateStep(this.byId("BillingStep") as WizardStep);
        }
    }

    public billingAddressComplete():void {
        const model = this.getView()?.getModel();
        if (model!.getProperty("/differentDeliveryAddress")) {
            var curstep = this.byId("BillingStep") as WizardStep;
            var nextStep = this.byId("DeliveryAddressStep") as WizardStep;
            curstep.setNextStep(nextStep);
        } else {
            var curstep = this.byId("BillingStep") as WizardStep;
            var nextStep = this.byId("DeliveryTypeStep") as WizardStep;
            curstep.setNextStep(nextStep);
        }
    }

    public handleNavBackToList():void {
        this._navBackToStep(this.byId("ContentsStep"));
    }

    public handleNavBackToPaymentType():void {
        this._navBackToStep(this.byId("PaymentTypeStep"));
    }

    public handleNavBackToCreditCard():void{
        this._navBackToStep(this.byId("CreditCardStep"));
    }

    public handleNavBackToCashOnDelivery():void {
        this._navBackToStep(this.byId("CashOnDeliveryStep"));
    }

    public handleNavBackToBillingAddress():void {
        this._navBackToStep(this.byId("BillingStep"));
    }

    public handleNavBackToDeliveryType():void {
        this._navBackToStep(this.byId("DeliveryTypeStep"));
    }

    public _navBackToStep(step:any): void {
        const fnAfterNavigate = () => {
          this._wizard.goToStep(step,true);
          this._oNavContainer.detachAfterNavigate(fnAfterNavigate);
        };
      
        this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
        this._oNavContainer.to(this._oDynamicPage);
      }

    
}