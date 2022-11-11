import { ReceiptStatusDataModel } from '../data/receipt-status.data';

export class ReceiptStatusRepository {
  private dataModel: any = null;

  initialize = async ( connection: any ) => {
    this.dataModel = await new ReceiptStatusDataModel().getDataModel(
        connection
    );
    return this;
  };

  async getStatuses( language: string, defaultLanguage: string ) {
    try {
      let dataModel = await this.dataModel.aggregate( [
        { $match: {} },
        {
          $project: {
            status: 1,
            messages: {
              $filter: {
                input: '$messages',
                as: 'item',
                cond: {
                  $or: [
                    { $eq: [ '$$item.language', language ] },
                    { $eq: [ '$$item.language', defaultLanguage ] }
                  ]
                }
              }
            }
          }
        }
      ] );

      for ( const element of dataModel ) {
        let newMessagesArray: string[] = [];
        if ( element.messages?.length > 1 ) {
          const messages = element.messages;
          for ( const message of messages ) {
            if ( message.language === language ) {
              newMessagesArray.push( message );
            }
          }

          if ( newMessagesArray.length > 0 ) {
            element.messages = newMessagesArray;
          }
        }
      }

      return dataModel;

    } catch ( error ) {
      console.error( '> getStatuses error: ', error );
      throw error;
    }
  }
}
