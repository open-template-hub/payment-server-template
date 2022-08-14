import { CustomerActivityDataModel } from "../data/customer-activity.data";

export class CustomerActivityRepository {
    private dataModel: any = null;
  
    initialize = async ( connection: any ) => {
      this.dataModel = await new CustomerActivityDataModel().getDataModel(
          connection
      );
      return this;
    };

    createCustomerActivity = async (
        payment_config_key: string,
        username: string,
        external_user_id: string,
        payload: any
    ) => {
      try {
        return await this.dataModel.create( {
            payment_config_key,
            username,
            external_user_id,
            payload
        } );
      } catch ( error ) {
        console.error( '> createCustomerActivity error: ', error );
        throw error;
      }
    };
    
    async getCustomerActivityWithUsername(username: string) {
        try {
            return await this.dataModel.findOne({
                username
            })
        } catch(error) {
            console.error( '> getCustomerActivityWithUsername error: ', error );
            throw error;
        }
    }

    async addOrUpdateSubscription(external_user_id: string, subscription: any) {
      try {
        // if document exist
        let doc: any;

        doc = await this.dataModel.updateOne(
          { external_user_id, "subscriptions.id": subscription.id },
          { $set: { "subscriptions.$.event": subscription } }
        )

        if(doc.matchedCount === 0) {
          return await this.dataModel.updateOne (
            { external_user_id },
            { $addToSet: { "subscriptions": { id: subscription.id, event: subscription } } },
            { upsert: true }
          )
        }

        return doc
      } catch(error) {
        console.error( '> addOrUpdateSubscription error: ', error );
        throw error; 
      }
    }

    
    async getCustomerActivityByExternalStripeCustomerId(external_user_id: string) {
      try {
        return await this.dataModel.findOne(
          {external_user_id}
        )
      } catch(error) {
        console.error( '> getUsernameByExternalStripeCustomerId error: ', error );
        throw error; 
      }
    }
}