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
        this.fetchProductData();
        this.oDataModel.setProperty("/selectedPayment", "Credit Card");
        this.oDataModel.setProperty("/selectedDeliveryMethod", "Standard Delivery");
        this.oDataModel.setProperty("/differentDeliveryAddress", false);
        this.oDataModel.setProperty("/CashOnDelivery", {});
        this.oDataModel.setProperty("/BillingAddress", {});
        this.oDataModel.setProperty("/CreditCard", {});
        this.oDataModel.updateBindings();
        //this.calcTotal();
        
    }
    public getPage():DynamicPage {
        return this.byId("dynamicPage") as DynamicPage;
    }
    public sumOfPrice():void{
        console.log(this.Products);
        let totalUnitPrice = 0;
        for (const product of this.Products as any) {
            
            let unitPrice = parseFloat(product.UnitPrice);
            totalUnitPrice += unitPrice;
            
        }
       
        
    // for (const product of this.Products) {
    
    //     totalUnitPrice += product.UnitPrice
        
    // }
    
    }
    // public calcTotal():void {
    //     var data = this.oDataModel.getProperty("/Products/UnitPrice");
    //     debugger;
    //     if (data) {
    //         var total = data.reduce(function (prev:any, current:any) {
    //             prev = prev.Price || prev;
    //             return prev + current.Price;
    //         });
    //         this.oDataModel.setProperty("/ProductsTotalPrice", total.Price || total);
    //         debugger;
    //     } else {
    //         this.oDataModel.setProperty("/ProductsTotalPrice", 0);
    //     }
    // }
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
            console.log(this.Products)
            const list = this.getView()?.byId("prodList") as List;
            const oModel = new JSONModel(this.Products);
            oModel.setData({items:this.Products});
            list!.setModel(oModel,"prodModel");
            //this.sumOfPrice();
            console.log(this.Products);
        let totalUnitPrice = 0;
        for (const product of this.Products as any) {
            
            let unitPrice = parseFloat(product.UnitPrice);
            
            unitPrice = parseFloat(unitPrice.toFixed(2));
            
            totalUnitPrice += unitPrice;
            
            
        }
        
             //this.oDataModel.setProperty("/ProductsTotalPrice",totalUnitPrice);
             console.log("asdasd"+this.oDataModel.getProperty("/ProductsTotalPrice"));
            let header = this.byId("objHeader") as ObjectHeader;
            header!.setNumber(totalUnitPrice.toString());
            
            
        } catch (error) {
            
        }
        //const oModel = this.getView()!.getModel as any;
        
        
        
    }
    public selectedPaymentMethod():void{
        const segmentedButton = this.getView()!.byId("paymentMethodSelection") as SegmentedButton;
        this.selectedMethod = segmentedButton.getSelectedKey();
        console.log("Selected Payment Method:",this.selectedMethod);
        this.setDiscardableProperty({
            message: "Are you sure you want to change the payment type ? This will discard your progress.",
            discardStep: this.byId("PaymentTypeStep"),
            modelPath: "/selectedPayment",
            historyPath: "prevPaymentSelect"
        });
    }

    public selectedDeliveryMethod():void{
        const segmentedButton1 = this.getView()!.byId("deliveryid") as SegmentedButton;
        this.selectedMethod1 = segmentedButton1.getSelectedKey();
        console.log("Selected Payment Method:",this.selectedMethod1);
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
          console.log(myModel);
          const oBinding = list.getBinding("items") as any;
          const selectedItem = oEvent.getParameter("listItem") as StandardListItem;
          console.log(selectedItem);
          const itemIndex = list.indexOfItem(selectedItem);
          console.log("index"+itemIndex);
          const sPath = selectedItem.getBindingContext() as any;
          //const sPath = oBindingContext ? oBindingContext.getPath() : undefined;  
          //const sPath = selectedItem.getBindingContext()?.getPath as any;
          console.log("asdad"+sPath);
        //   const oBindingContext = selectedItem.getBindingContext() as any;
          const oModel = this.getView()!.getModel as any;
          const model = this.getView()!.getModel("prodModel") as any;
          
          const aItems = myModel.getData().items as any[]; 
          const nIndex = aItems.findIndex((item) => item.__metadata.uri === sPath); 
          console.log(nIndex);

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
            // this.sumOfPrice();
          }      //   console.log("Selected List Item:", selectedItem);
          
          //const sPath = oBindingContext!.getPath() as any;
        //   const oSelectedProduct = model!.getProperty(sPath);
          
        //   list.attachEventOnce("updateFinished", list.focus, list);

		// 	// send a delete request to the odata service

        //     if(oModel!){
        //         console.log("empty model");
        //     }
        //     else{
        //         oModel.remove(sPath);
        //     }
        //   debugger;
    }
    public goToPaymentStep():void {
        //this._wizard.setCurrentStep("PaymentTypeStep") as any;
        //console.log("current step "+this._wizard.getCurrentStep());

        console.log("model is"+this.oDataModel);
        var selectedKey = this.oDataModel.getProperty("/selectedPayment") as any;
        console.log(selectedKey);
        switch (this.selectedMethod) {
            case "Credit Card":
                
                //this._wizard.nextStep();
                var crstep = this.byId("CreditCardStep") as WizardStep;
                var curStep = this.byId("PaymentTypeStep") as WizardStep;
                
                curStep.setNextStep(crstep);
                //debugger;
                
                //this._wizard.goToStep(crstep,true);

                //console.log("current step "+this._wizard.getCurrentStep());
                //debugger;
                //this._wizard.goToStep(this.byId("PaymentTypeStep") as any, true);
                
                //this._wizard.goToStep(this.byId("CreditCardStep") as any, true);
                //this.byId("PaymentTypeStep").this.getView()!.byId("CreditCardStep"));  //Cant use it it because its not reached yet!
                break;
             case "Bank Transfer":
                var bastep = this.byId("BankAccountStep") as WizardStep;
                var curStep = this.byId("PaymentTypeStep") as WizardStep;
                
                curStep.setNextStep(bastep);
            //     this.byId("PaymentTypeStep")!.setNextStep(this.getView()!.byId("BankAccountStep"));
                 break;
             case "Cash on Delivery":
             //default:
                var codstep = this.byId("CashOnDeliveryStep") as WizardStep;
                var curStep = this.byId("PaymentTypeStep") as WizardStep;
                
                curStep.setNextStep(codstep);
            //     this.byId("PaymentTypeStep")!.setNextStep(this.getView()!.byId("CashOnDeliveryStep"));
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
            //history[params.historyPath] = this.model.getProperty(params.modelPath);
        }
    }
    public checkCreditCardStep():void {
        const model = this.getView()?.getModel();
        let x=model?.getProperty("CustomerName");
        console.log("asasas"+x);
        console.log(model!.getProperty("CreditCard/Name"));
        
        
        var input = this.byId("crname") as Input;
        var cardNamee = input.getValue();
        console.log("Nameee"+cardNamee.length);
        var cardName:any = model!.getProperty("CreditCard/Name");
        console.log("card name is "+cardName);
        if (cardNamee.length < 3) {
            
            this._wizard.invalidateStep(this.byId("CreditCardStep") as WizardStep);
        }
        else{
            this._wizard.validateStep(this.byId("CreditCardStep") as WizardStep);
        }
    }

    public checkCashOnDeliveryStep():void {
        const model = this.getView()?.getModel();
        let input = this.byId("cod") as Input;
        let namee = input.getValue();
        //var firstName = model!.getProperty("/CashOnDelivery/FirstName") || "";
        if (namee.length < 3) {
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
        console.log(aItems);
        myModel.setData({items:aItems});
        console.log(myModel.getData());
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

        let text = this.byId("selPay") as Text;
               
        const segmentedButton = this.getView()!.byId("paymentMethodSelection") as SegmentedButton;
        this.selectedMethod = segmentedButton.getSelectedKey();
        console.log("selmet "+this.selectedMethod);
        text.setText(this.selectedMethod);
        let input = this.byId("bsad") as Input;
        let input1 = this.byId("bscity") as Input;
        let input2 = this.byId("bszip") as Input;
        let input3 = this.byId("bsct") as Input;
        let inp = input.getValue();
        let inp1 = input1.getValue();
        let inp2 = input2.getValue();
        let inp3 = input3.getValue();
        
        let selectedDel = this.byId("selectedDel") as Text;

        const segmentedButton1 = this.getView()!.byId("deliveryid") as SegmentedButton;
        debugger;
        this.selectedMethod1 = segmentedButton1.getSelectedKey();///////////////////
        debugger;

        selectedDel.setText(this.selectedMethod1);   
    }

    public checkBillingStep():void {
        const model = this.getView()?.getModel();
        let input = this.byId("bsad") as Input;
        let input1 = this.byId("bscity") as Input;
        let input2 = this.byId("bszip") as Input;
        let input3 = this.byId("bsct") as Input;
        let input4 = this.byId("note") as TextArea;
        let inp = input.getValue();
        let inp1 = input1.getValue();
        let inp2 = input2.getValue();
        let inp3 = input3.getValue();
        let inp4 = input4.getValue();

        var text1 = this.byId("ba") as Text;
        var text2 = this.byId("bc") as Text;
        var text3 = this.byId("bz") as Text;
        var text4 = this.byId("bco") as Text;
        var text5 = this.byId("bn") as Text;
        
        text1.setText(inp);
        text2.setText(inp1);
        text3.setText(inp2);
        text4.setText(inp3);
        text5.setText(inp4);
        //text5.setText(inp);

        // var address = model!.getProperty("/BillingAddress/Address") || "";
        // var city = model!.getProperty("/BillingAddress/City") || "";
        // var zipCode = model!.getProperty("/BillingAddress/ZipCode") || "";
        // var country = model!.getProperty("/BillingAddress/Country") || "";

        if (inp.length < 3 || inp1.length < 3 || inp2.length < 3 || inp3.length < 3) {
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
            //this.byId("BillingStep").setNextStep(this.getView().byId("DeliveryAddressStep"));
        } else {
            var curstep = this.byId("BillingStep") as WizardStep;
            var nextStep = this.byId("DeliveryTypeStep") as WizardStep;
            curstep.setNextStep(nextStep);
            //this.byId("BillingStep").setNextStep(this.getView().byId("DeliveryTypeStep"));
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