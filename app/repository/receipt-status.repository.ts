import { ReceiptStatusDataModel } from "../data/receipt-status.data";

export class ReceiptStatusRepository {
    private dataModel: any = null;

    initialize = async(connection: any) => {
        this.dataModel = await new ReceiptStatusDataModel().getDataModel(
            connection
        );
        return this;
    }

    async getStatusses(language: string, defaultLanguage: string) {
        try {
            let dataModel = await this.dataModel.aggregate([
                { $match: { } },
                { $project: {
                    status: 1,
                    messages: {
                        $filter: {
                            input: "$messages",
                            as: "item",
                            cond: {
                                $or: [
                                    { $eq: ["$$item.language", language]},
                                    { $eq: ["$$item.language", defaultLanguage]}
                                ]
                            }
                        }
                    }
                }}
            ]);

            
            for(let i = 0; i < dataModel.length; i++) {
                let newMessagesArray: string[] = [];
              if( dataModel[i].messages?.length > 1 ) {
                for(let j = 0; j < dataModel[i].messages.length; j++ ) {
                  if( dataModel[i].messages[j].language === language ) {
                    newMessagesArray.push( dataModel[i].messages[j] );
                  }
                }
        
                if( newMessagesArray.length > 0 ) {
                  dataModel[i].messages = newMessagesArray;
                }
              }
            }

            return dataModel;

        } catch(error) {
            console.error( '> getStatusses error: ', error );
            throw error;
        }
    }
}