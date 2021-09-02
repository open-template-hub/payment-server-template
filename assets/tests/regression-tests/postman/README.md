# POSTMAN REGRESSION TESTS

## Prerequisite

To run all the scenarios, these items must be configured:

* Stripe Payment Config
* Coinbase Payment Config
* PayPal Payment Config

Please check README.md to get more information to configure them

* RESPONSE_ENCRYPTION_SECRET must be disabled on environment variables

* REGRESSION must be set to true on environment variables

## Configuration

* Import **payment-server-regression.postman_environment.json** as environment to Postman

* Import **payment-server-regression.postman_collection.json** as collection to Postman

* Update imported environment variables and run collection on Postman
