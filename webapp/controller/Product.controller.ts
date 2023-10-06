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
          var myMod = this.getView()!.getModel! as any;
         this.model.attachEventOnce("requestCompleted", ():void => {
            
            
            this.model.setProperty("/differentDeliveryAddress", false);
            this.model.setProperty("/CashOnDelivery", {});
            //myMod.setProperty("/BillingAddress", {});
            this.model.setProperty("/CreditCard",{});
            this.model.setProperty("/selectedPaymentt", "Credit Cardd");
            //this.model.setProperty("/CreditCard/Name",true);
            this.model.setProperty("/CreditCard", { Name: "berker" });
            //this.model.setProperty("/BillingAddress",{Address: "asdasd"}) as any;
            
            //this.model.setProperty("/BillingAddress",{});
            this.model.updateBindings(true);

            // console.log("lolol"+this.model.getProperty("/ProductsTotalPrice"));
            // this.model.setProperty("/ProductsTotalPrice",123123);
            // console.log(this.model.getProperty("/ProductsTotalPrice"));
            // this.model.refresh();
         }).bindProperty("/selectedPaymentt"); 
         this.fetchProductData();
         this.getView()!.setModel(this.model);  
        // })
        

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
            
             this.model.setProperty("/ProductsTotalPrice",totalUnitPrice);
             
            //  console.log("asdasd"+this.oDataModel.getProperty("/ProductsTotalPrice"));
            // let header = this.byId("objHeader") as ObjectHeader;
            // header!.setNumber(totalUnitPrice.toString());
            
            
        } catch (error) {
            
        }
        //const oModel = this.getView()!.getModel as any;
        
        
        
    }
    public selectedPaymentMethod():void{
        
        
        //this.model.getProperty("/selectedPayment") || "CreditCard";

        const selectedKey = this.model.getProperty("/selectedPayment");
        // const segmentedButton = this.getView()!.byId("paymentMethodSelection") as SegmentedButton;
        // this.selectedMethod = segmentedButton.getSelectedKey();
        console.log("Selected Payment Method:",selectedKey);
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
        console.log(typeof(selectedKey));
        // const segmentedButton1 = this.getView()!.byId("deliveryid") as SegmentedButton;
        // this.selectedMethod1 = segmentedButton1.getSelectedKey();
        console.log("Selected Delivery Method:",selectedKey);
        this.setDiscardableProperty({
            message: "Are you sure you want to change the payment type ? This will discard your progress.",
            discardStep: this.byId("DeliveryTypeStep"),
            modelPath: "/selectedPayment",
            historyPath: "prevPaymentSelect"
        });
        debugger;
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
        var selectedKeyy = this.model.getProperty("/selectedPayment") as any;
        console.log("ddddd"+selectedKeyy);
        switch (selectedKeyy) {
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
            history[params.historyPath] = this.model.getProperty(params.modelPath);
        }
    }
    public checkCreditCardStep():void {
        if(!this.model.getProperty("/selectedPayment")){
            this.model.setProperty("/selectedPayment","CreditCard");
        }
        if(!this.model.getProperty("/CreditCard")){
            this.model.setProperty("/CreditCard",{});
        }
        

        if(!this.model.getProperty("/CreditCard/Name")){
            this.model.setProperty("/CreditCard/Name","");
        }
        if(!this.model.getProperty("/CreditCard/CardNumber")){
            this.model.setProperty("/CreditCard/CardNumber",0);
        }
        if(!this.model.getProperty("/CreditCard/SecurityCode")){
            this.model.setProperty("/CreditCard/SecurityCode",0);
        }
        if(!this.model.getProperty("/CreditCard/Expire")){
            this.model.setProperty("/CreditCard/Expire","");
        }

        var name = this.model.getProperty("/CreditCard/Name") as String;
        var number = this.model.getProperty("/CreditCard/CardNumber") as Number;
        var code = this.model.getProperty("/CreditCard/SecurityCode") as Number;
        var expire = this.model.getProperty("/CreditCard/Expire") as Date;
        var mod = this.model as Model;
        //var mm = this.getView()!.getModel()! as Model;
        console.log("tt"+typeof(this.model));
        console.log("xdxd" + this.model.getProperty("/selectedPayment"));
        //console.log(mm.getJSON());
        // const model = this.getView()?.getModel();
        // let x=model?.getProperty("CustomerName");
        // console.log("asasas"+x);
        // console.log(model!.getProperty("CreditCard/Name"));
        
        
        // var input = this.byId("crname") as Input;
        // var cardNamee = input.getValue();
        // console.log("Nameee"+cardNamee.length);
        // var cardName:any = model!.getProperty("CreditCard/Name");
        // console.log("card name is "+cardName);
        // if (cardNamee.length < 3) {
            
        //     this._wizard.invalidateStep(this.byId("CreditCardStep") as WizardStep);
        // }
        // else{
        //     this._wizard.validateStep(this.byId("CreditCardStep") as WizardStep);
        // }
        // console.log("pp"+mm.getProperty("/selectedPayment"));
        // console.log("pp"+mm.getProperty("/selectedPaymentt"));
        // console.log("pp"+mm.getProperty("/CreditCard"));
        //console.log("pp"+mm.getProperty("/selectedPayment"));
        
        //var cardName = this.model.getProperty("/CreditCard/Name") || "";
        const today = new Date();
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0
        const dd = String(today.getDate()).padStart(2, '0');
        const yy = String(today.getFullYear()).slice(-2); // Get the last 2 digits of the year

        const formattedDate = `${mm}/${dd}/${yy}`;
        console.log(expire);
        //console.log(expire.getTime());
        console.log(formattedDate);
        console.log(number);
        debugger;
        var nnumber = number.toString();
        var ccode = code.toString();
			if (name.length < 3 || nnumber.length < 16 || ccode.length < 3 || expire < today) {
                
				this._wizard.invalidateStep(this.byId("CreditCardStep") as WizardStep);
			} else {
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
               
        // const segmentedButton = this.getView()!.byId("paymentMethodSelection") as SegmentedButton;
        // this.selectedMethod = segmentedButton.getSelectedKey();
        // console.log("selmet "+this.selectedMethod);
        // text.setText(this.selectedMethod);
        let input = this.byId("bsad") as Input;
        let input1 = this.byId("bscity") as Input;
        let input2 = this.byId("bszip") as Input;
        let input3 = this.byId("bsct") as Input;
        let inp = input.getValue();
        let inp1 = input1.getValue();
        let inp2 = input2.getValue();
        let inp3 = input3.getValue();
        
        // var selectedKeyy = this.model.getProperty("/selectedDeliveryMethod") as any;
        // console.log("ddddd"+selectedKeyy);

        // let selectedDel = this.byId("selectedDel") as Text;

        // const segmentedButton1 = this.getView()!.byId("deliveryid") as SegmentedButton;
        
        // this.selectedMethod1 = segmentedButton1.getSelectedKey();///////////////////
        

        // selectedDel.setText(this.selectedMethod1);   
    }

    public checkBillingStep():void {
        //const model = this.getView()?.getModel();
        if(!this.model.getProperty("/BillingAddress")){
            this.model.setProperty("/BillingAddress",{});
        }
        if(!this.model.getProperty("/BillingAddress/Address")){
            this.model.setProperty("/BillingAddress/Address","");
        }
        if(!this.model.getProperty("/BillingAddress/City")){
            this.model.setProperty("/BillingAddress/City","");
        }
        if(!this.model.getProperty("/BillingAddress/ZipCode")){
            this.model.setProperty("/BillingAddress/ZipCode","");
        }
        if(!this.model.getProperty("/BillingAddress/Country")){
            this.model.setProperty("/BillingAddress/Country","");
        }
        if(!this.model.getProperty("/BillingAddress/Note")){
            this.model.setProperty("/BillingAddress/Note","");
        }
        let address = this.model.getProperty("/BillingAddress/Address") as String;
        console.log(address);
        console.log(address.length);
        let city = this.model.getProperty("/BillingAddress/City") as String;
        let zipcode = this.model.getProperty("/BillingAddress/ZipCode") as String;
        let country = this.model.getProperty("/BillingAddress/Country") as String;
        let note = this.model.getProperty("/BillingAddress/Note") as String;
        console.log("aw"+this.model.getProperty("/BillingAddress/Address"));
        //debugger;
        //console.log(this.model.getProperty("/selectedPayment"));
        //var xx = this.getView()?.getModel();
        
        //console.log(this.model);
        //this.model.setProperty("/xxx","qweqwe");
        //console.log(this.model);
        //console.log(this.model.getProperty("/xxx"));
        // debugger;
        // var address = this.getView()?.getModel()!.getProperty("/BillingAddress") as Object;
        //address.getValue()
        //console.log(address);
        // var mymodel=this.getView()?.getModel()! as Model;
        // console.log("lol"+mymodel.bindList("/BillingAddress/Address"));

        // this.model.setProperty("/BillingAddress/Address",address);
        //address.getValue();
        //let value = address['Address'];

        // console.log(address.hasOwnProperty("Address"));
        // console.log(address.valueOf);
        // console.log(address);
        //let input = this.byId("bsad") as Input;
        // let input1 = this.byId("bscity") as Input;
        // let input2 = this.byId("bszip") as Input;
        // let input3 = this.byId("bsct") as Input;
        // let input4 = this.byId("note") as TextArea;
        // //let inp = input.getValue();
        // let inp1 = input1.getValue();
        // let inp2 = input2.getValue();
        // let inp3 = input3.getValue();
        // let inp4 = input4.getValue();

        // var text1 = this.byId("ba") as Text;
        // var text2 = this.byId("bc") as Text;
        // var text3 = this.byId("bz") as Text;
        // var text4 = this.byId("bco") as Text;
        // var text5 = this.byId("bn") as Text;
        
        // //text1.setText(inp);
        // text2.setText(inp1);
        // text3.setText(inp2);
        // text4.setText(inp3);
        // text5.setText(inp4);
        //text5.setText(inp);

        // var address = model!.getProperty("/BillingAddress/Address") || "";
        // var city = model!.getProperty("/BillingAddress/City") || "";
        // var zipCode = model!.getProperty("/BillingAddress/ZipCode") || "";
        // var country = model!.getProperty("/BillingAddress/Country") || "";
        
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