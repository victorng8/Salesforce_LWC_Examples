import { LightningElement, track, api, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import {updateRecord} from "lightning/uiRecordApi";

import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import ACCOUNT_TYPE from '@salesforce/schema/Account.Type';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

const fields = [ACCOUNT_TYPE];

export default class Updaterecord extends LightningElement {
  
    // Parameters for updating record
    @api recordId;
    @track accountId;
    @track name;
    @track type;

    // To display picklist values dynamically
    @track selectedOption;
    @track options

    //Event handler to actually update record
    handleChange(event) {
        this.accountId = undefined;
        if (event.target.label === "Name") {
            this.name = event.target.value;
        }

        if (event.target.label === "Type") {
            this.type = event.target.value;
        }
    }

    // private
    _recordTypeId;

    // Step 1
    @wire(getRecord, {recordId:'$recordId', fields})
    account({error, data}) {
        if (data) {
        let typeValue = getFieldValue(data, ACCOUNT_TYPE);
        this.selectedOption = typeValue;
        this._recordTypeId = '$objectInfo.data.defaultRecordTypeId'; // setting this value will re-invoke the wire
        } else if (error) {
        //console.log(error);
        }
    }

    // Step 2, determined by when the reactive bind is changed
    @wire(getPicklistValues, { recordTypeId: '$_recordTypeId', fieldApiName: ACCOUNT_TYPE })
    setPicklistOptions({error, data}) {
        if (data) {
        // Apparently combobox doesn't like it if you dont supply any options at all.
        // Even though selectedOption was assigned in step 1, it wont "select" it unless it also has options
        this.options = data.values;
        } else if (error) {
        //console.log(error);
        }
    }

    updateAccount() {
        let record = {
            fields: {
                Id: this.recordId,
                Name: this.name,
                Type: this.type
            }
        };
        updateRecord(record)
        // eslint-disable-next-line no-unused-vars
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "Success",
                    message: "Record Is Updated",
                    variant: "success"
                })
            );
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "Error on data save",
                    message: error.message.body,
                    variant: "error"
                })
            );
        });
    }
}
