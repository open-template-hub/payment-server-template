/**
 * @description holds payment controller
 */

import {
  BusinessLogicActionType,
  MessageQueueChannelType,
  MessageQueueProvider,
  MongoDbProvider,
  NotificationParams,
  PostgreSqlProvider,
  QueueMessage
} from '@open-template-hub/common';
import mongoose from 'mongoose';
import { Environment } from '../../environment';
import { ReceiptStatus } from '../constant';
import { CustomerActivityRepository } from '../repository/customer-activity.repository';
import { PaymentConfigRepository } from '../repository/payment-config.repository';
import { ProductRepository } from '../repository/product.repository';
import { ReceiptRepository } from '../repository/receipt.repository';
import { TransactionHistoryRepository } from '../repository/transaction-history.repository';
import { PaymentWrapper } from '../wrapper/payment.wrapper';

export class PaymentController {

  environment: Environment;

  constructor() {
    this.environment = new Environment();
  }

  /**
   * initializes a payment
   * @param mongodb_provider mongodb provider
   * @param username username
   * @param payment_config_key payment config key
   * @param product_id product id
   * @param quantity quantity
   * @returns payment session
   */
  initPayment = async (
      mongodb_provider: MongoDbProvider,
      username: string,
      payment_config_key: string,
      product_id: string,
      quantity: number,
      origin: string
  ) => {
    const productRepository = await new ProductRepository().initialize(
        mongodb_provider.getConnection()
    );

    let product: any = await productRepository.getProductByProductId(
        product_id
    );
    if ( product === null ) {
      throw new Error( 'Product not found' );
    }

    const paymentConfigRepository = await new PaymentConfigRepository().initialize(
      mongodb_provider.getConnection()
    );

    let paymentConfig: any = await paymentConfigRepository.getPaymentConfigByKey(
        payment_config_key
    );

    if ( paymentConfig === null ) {
      throw new Error( 'Payment method can not be found' );
    }

    const paymentWrapper = new PaymentWrapper( paymentConfig.payload.method );
    
    const mode = paymentWrapper.getModeFromProduct(product.payload);

    if(mode === "payment") {
      return this.initOneTimePayment(
        mongodb_provider,
        payment_config_key,
        username,
        product,
        quantity,
        origin
      );
    } else if(mode === "subscription") {
      return this.initSubscription(
        mongodb_provider,
        payment_config_key,
        username,
        product,
        origin
      );
    } else {
      throw new Error("Unhandled mode");
    }
  };

  private async initOneTimePayment(
    mongodb_provider: MongoDbProvider,
    payment_config_key: string,
    username: string,
    product: any,
    quantity: number,
    origin: string
  ) {
    const paymentConfigRepository = await new PaymentConfigRepository().initialize(
      mongodb_provider.getConnection()
    );

    let paymentConfig: any = await paymentConfigRepository.getPaymentConfigByKey(
        payment_config_key
    );

    if ( paymentConfig === null ) {
      throw new Error( 'Payment method can not be found' );
    }

    const paymentWrapper = new PaymentWrapper( paymentConfig.payload.method );

    const transactionHistoryRepository = await new TransactionHistoryRepository().initialize(
        mongodb_provider.getConnection()
    );

    let transaction_history = await transactionHistoryRepository.createTransactionHistory(
      payment_config_key,
      username,
      product.product_id
    );

    let external_transaction = await paymentWrapper.initOneTimePayment(
      mongodb_provider.getConnection(),
      paymentConfig,
      product,
      quantity,
      transaction_history._id,
      origin
    );

    if ( external_transaction === null ) {
      throw new Error( 'Payment can not be initiated' );
    }

    await transactionHistoryRepository.updateTransactionHistoryWithId(
      transaction_history._id,
      external_transaction.id,
      external_transaction.history
    );

    /** build method is important because other providers might have special build
     * rather than returning session from init
     * that's why build is attached
     */
    return paymentWrapper.build(
        paymentConfig,
        external_transaction
    );
  }

  private async initSubscription(
    mongodb_provider: MongoDbProvider,
    payment_config_key: string,
    username: string,
    product: any,
    origin: string
  ) {
    const paymentConfigRepository = await new PaymentConfigRepository().initialize(
      mongodb_provider.getConnection()
    );

    let paymentConfig: any = await paymentConfigRepository.getPaymentConfigByKey(
        payment_config_key
    );

    if ( paymentConfig === null ) {
      throw new Error( 'Payment method can not be found' );
    }

    const paymentWrapper = new PaymentWrapper( paymentConfig.payload.method );

    const customerActivityRepository = await new CustomerActivityRepository().initialize(
      mongodb_provider.getConnection()
    );

    let customerActivity = await this.getCustomerActivityWithUsername(mongodb_provider, username);

    let externalUserId;

    if(!customerActivity) {
      const customer = await paymentWrapper.createCustomer(paymentConfig, username);

      externalUserId = customer.id;

      customerActivityRepository.createCustomerActivity(
        payment_config_key,
        username,
        customer.id,
        {}
      );
    } else {
      externalUserId = customerActivity.external_user_id;
    }

    const session = await paymentWrapper.initSubscription(
      mongodb_provider.getConnection(),
      paymentConfig,
      product,
      externalUserId,
      origin
    )

    /** build method is important because other providers might have special build
     * rather than returning session from init
     * that's why build is attached
    */
    return paymentWrapper.build(
      paymentConfig,
      { session_id: session.session_id }
    );
  }

  async createPortalSession(
    mongodb_provider: MongoDbProvider,
    username: string,
    payment_config_key: string,
    product_id: string,
    origin: string
  ) {
    const paymentConfigRepository = await new PaymentConfigRepository().initialize(
      mongodb_provider.getConnection()
    );

    let paymentConfig: any = await paymentConfigRepository.getPaymentConfigByKey(
        payment_config_key
    );

    if ( paymentConfig === null ) {
      throw new Error( 'Payment method can not be found' );
    }

    const paymentWrapper = new PaymentWrapper( paymentConfig.payload.method );

    let customerActivity = await this.getCustomerActivityWithUsername(mongodb_provider, username);

    return paymentWrapper.createPortalSession(paymentConfig, customerActivity.external_user_id, origin);
  }

  /**
   * refreshes transaction history with transaction id
   * returns refreshed transaction history
   * @param mongodb_provider
   * @param postgresql_provider
   * @param message_queue_provider
   * @param username
   * @param payment_config_key
   * @param transaction_history_id
   */
  verifyPayment = async (
      mongodb_provider: MongoDbProvider,
      postgresql_provider: PostgreSqlProvider,
      message_queue_provider: MessageQueueProvider,
      username: string,
      payment_config_key: string,
      transaction_history_id: string
  ) => {
    try {
      const paymentConfigRepository = await new PaymentConfigRepository().initialize(
          mongodb_provider.getConnection()
      );

      let paymentConfig: any = await paymentConfigRepository.getPaymentConfigByKey(
          payment_config_key
      );

      if ( paymentConfig === null )
        throw new Error( 'Payment method can not be found' );

      const paymentWrapper = new PaymentWrapper( paymentConfig.payload.method );

      if ( !mongoose.isValidObjectId( transaction_history_id ) ) {
        throw new Error( 'transaction not found' );
      }

      const transactionHistoryRepository = await new TransactionHistoryRepository().initialize(
          mongodb_provider.getConnection()
      );

      const transaction_history = await transactionHistoryRepository.findTransactionHistory( transaction_history_id );

      if ( !transaction_history ) {
        throw new Error( 'transaction not found' );
      }

      if ( transaction_history.username !== username ) {
        throw new Error( 'Bad request' );
      }

      // If current status is succeeded, do not check it again from payment provider
      if ( transaction_history.payload.transaction_history.status === paymentWrapper.paymentMethod?.getSuccessStatus() ) {
        return;
      }

      const refreshed_transaction_history = await paymentWrapper.getTransactionHistory(
          paymentConfig,
          transaction_history.external_transaction_id
      );

      const updated_transaction_history = await transactionHistoryRepository.updateTransactionHistoryWithExternalId(
          paymentConfig,
          transaction_history.external_transaction_id,
          refreshed_transaction_history
      );

      const status = await paymentWrapper.receiptStatusUpdate(
          postgresql_provider,
          paymentConfig,
          transaction_history.external_transaction_id,
          updated_transaction_history
      );

      if ( status && ReceiptStatus.SUCCESS === status ) {
        await this.sendPaymentSuccessNotificationToQueue( message_queue_provider, {
          timestamp: new Date().getTime(),
          username: updated_transaction_history.username,
          message: 'Product paid successfully'
        } );
      }

      if ( updated_transaction_history.payload.transaction_history.status !== paymentWrapper.paymentMethod?.getSuccessStatus() ) {
        throw new Error( 'Payment not found' );
      }

    } catch ( error ) {
      console.error( '> refreshTransactionHistoryWithTransactionId error: ', error );
      throw error;
    }
  };

  async getCustomerActivityWithUsername(mongodb_provider: MongoDbProvider, username: string) {
    const customerActivityRepository = await new CustomerActivityRepository().initialize(
      mongodb_provider.getConnection()
    );

    return customerActivityRepository.getCustomerActivityWithUsername(username);
  }

  /**
   * initializes a payment with external transaction id
   * @param mongodb_provider mongodb provider
   * @param username username
   * @param payment_config_key payment config key
   * @param product_id product id
   * @param external_transaction_id external transaction id
   * @returns external transaction id
   */
  initPaymentWithExternalTransactionId = async (
      mongodb_provider: MongoDbProvider,
      username: string,
      payment_config_key: string,
      product_id: string,
      external_transaction_id: string
  ) => {
    try {
      const transactionHistoryRepository = await new TransactionHistoryRepository().initialize(
          mongodb_provider.getConnection()
      );
      await transactionHistoryRepository.createTransactionHistory(
          payment_config_key,
          username,
          product_id,
          external_transaction_id,
          {}
      );
      return {
        external_transaction_id: external_transaction_id,
      };
    } catch ( error ) {
      console.error( '> initPaymentWithExternalTransactionId error: ', error );
      throw error;
    }
  };

  /**
   * refreshes transaction history
   * @param mongodb_provider mongodb provider
   * @param postgresql_provider postgresql provider
   * @param message_queue_provider
   * @param payment_config_key payment config key
   * @param external_transaction_id external transaction id
   */
  refreshTransactionHistory = async (
      mongodb_provider: MongoDbProvider,
      postgresql_provider: PostgreSqlProvider,
      message_queue_provider: MessageQueueProvider,
      payment_config_key: string,
      external_transaction_id: string
  ) => {
    try {
      const paymentConfigRepository = await new PaymentConfigRepository().initialize(
          mongodb_provider.getConnection()
      );

      let paymentConfig: any = await paymentConfigRepository.getPaymentConfigByKey(
          payment_config_key
      );

      if ( paymentConfig === null )
        throw new Error( 'Payment method can not be found' );
      const paymentWrapper = new PaymentWrapper( paymentConfig.payload.method );

      const transaction_history = await paymentWrapper.getTransactionHistory(
          paymentConfig,
          external_transaction_id
      );

      const transactionHistoryRepository = await new TransactionHistoryRepository().initialize(
          mongodb_provider.getConnection()
      );

      const updated_transaction_history = await transactionHistoryRepository.updateTransactionHistoryWithExternalId(
          paymentConfig,
          external_transaction_id,
          transaction_history
      );

      const status: string = await paymentWrapper.receiptStatusUpdate(
          postgresql_provider,
          paymentConfig,
          external_transaction_id,
          updated_transaction_history
      );

      if ( status && ReceiptStatus.SUCCESS === status ) {
        await this.sendPaymentSuccessNotificationToQueue( message_queue_provider, {
          timestamp: new Date().getTime(),
          username: updated_transaction_history.username,
          message: 'Product paid successfully'
        } );
      }

    } catch ( error ) {
      console.error( '> refreshTransactionHistory error: ', error );
      throw error;
    }
  };

  /**
   * confirms a payment
   * only for admin usage, test purpose
   * @param mongodb_provider mongodb provider
   * @param payment_config_key payment config key
   * @param external_transaction_id external transaction id
   * @returns external transaction id
   */
  confirmPayment = async (
      mongodb_provider: MongoDbProvider,
      payment_config_key: string,
      external_transaction_id: string
  ) => {
    try {
      const paymentConfigRepository = await new PaymentConfigRepository().initialize(
          mongodb_provider.getConnection()
      );

      let paymentConfig: any = await paymentConfigRepository.getPaymentConfigByKey(
          payment_config_key
      );

      if ( paymentConfig === null )
        throw new Error( 'Payment method can not be found' );
      const paymentWrapper = new PaymentWrapper( paymentConfig.payload.method );

      await paymentWrapper.confirmPayment(
          paymentConfig,
          external_transaction_id
      );

      return external_transaction_id;
    } catch ( error ) {
      console.error( '> refreshTransactionHistory error: ', error );
      throw error;
    }
  };

  private async sendPaymentSuccessNotificationToQueue(
      messageQueueProvider: MessageQueueProvider,
      notificationParams: NotificationParams
  ) {
    const orchestrationChannelTag = this.environment.args().mqArgs?.orchestrationServerMessageQueueChannel;

    const message = {
      sender: MessageQueueChannelType.PAYMENT,
      receiver: MessageQueueChannelType.BUSINESS_LOGIC,
      message: {
        notification: {
          params: notificationParams
        }
      } as BusinessLogicActionType,
    } as QueueMessage;

    await messageQueueProvider.publish(
        message,
        orchestrationChannelTag as string
    );
  }

  async createInvoiceForSubscription(
    mongodb_provider: MongoDbProvider,
    postgresql_provider: PostgreSqlProvider,
    payment_config_key: string,
    object: any
  ) {

    if(object.lines.data.length > 0 && object.amount_paid > 0) {
      const customerId = object.customer;
      const expireDate = object.lines.data[object.lines.data.length - 1].period.end as string;
      const startDate = object.lines.data[object.lines.data.length - 1].period.start as string;
      const externalProductId = object.lines.data[object.lines.data.length - 1].plan.product;
      const totalAmount = object.amount_paid;
      const currencyCode = object.lines.data[object.lines.data.length - 1].plan.currency;
      const status = object.status === "paid" ? ReceiptStatus.SUCCESS : ReceiptStatus.OTHER;
      const externalTransactionId = object.payment_intent ?? "";

      // get product
      const productRepository = await new ProductRepository().initialize(
        mongodb_provider.getConnection()
      );
      let product: any = await productRepository.getProductByExternalStripeProductId(
          externalProductId
      );

      // get paymentConfig
      const paymentConfigRepository = await new PaymentConfigRepository().initialize(
        mongodb_provider.getConnection()
      );
      let paymentConfig: any = await paymentConfigRepository.getPaymentConfigByKey(
          payment_config_key
      );
      if ( paymentConfig === null )
        throw new Error( 'Payment method can not be found' );
      
      const paymentWrapper = new PaymentWrapper( paymentConfig.payload.method );
      const username = await paymentWrapper.getUsernameByExternalCustomerId(mongodb_provider, payment_config_key, customerId);
      
      if( !username ) {
        throw new Error("Username can not be found")
      }
      
      const receiptRepository = new ReceiptRepository( postgresql_provider );
      await receiptRepository.createReceipt(
        {
          username: username,
          external_transaction_id: externalTransactionId,
          product_id: product.product_id,
          payment_config_key: payment_config_key,
          created_time: startDate,
          total_amount: totalAmount / 100,
          currency_code: currencyCode.toUpperCase(),
          status: status,
          external_customer_id: customerId,
          expire_date: expireDate,
          priority_order: product.priority_order
        }
      );
    }
  }

  async updateCustomerActivity(
    mongodb_provider: MongoDbProvider,
    payment_config_key: string,
    object: any
  ) {
    const customerActivityRepository = await new CustomerActivityRepository().initialize(
      mongodb_provider.getConnection()
    );

    const data = object.items.data as any[]
    if(data.length > 0) {
      customerActivityRepository.addOrUpdateSubscription(payment_config_key, object.customer, object);
    }
  }

  async processRefund(
    postgresql_provider: PostgreSqlProvider,
    payment_config_key: string,
    customerId: string,
    createdTime: number
  ) {
      const receiptRepository = new ReceiptRepository( postgresql_provider );
      receiptRepository.changeStatusOfSubscriptionsWithExpireDates(payment_config_key, customerId, createdTime.toString(), ReceiptStatus.REFUND)
  }

  async constructEvent(
    mongodb_provider: MongoDbProvider,
    payment_config_key: string,
    body: any,
    signature: any
  ) {
    // get paymentConfig
    const paymentConfigRepository = await new PaymentConfigRepository().initialize(
      mongodb_provider.getConnection()
    );

    let paymentConfig: any = await paymentConfigRepository.getPaymentConfigByKey(
        payment_config_key
    );

    const paymentWrapper = new PaymentWrapper( paymentConfig.payload.method );

    return paymentWrapper.constructEvent(
      paymentConfig,
      body,
      signature
    )
  }
}
