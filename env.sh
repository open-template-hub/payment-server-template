#!/usr/bin/env bash

if [ ! -f .env ]; then
  echo "Generating .env file.."
  touch .env
  {
    echo "PORT=4003"

    echo "PROJECT=OTH"
    echo "MODULE=PaymentServer"
    echo "ENVIRONMENT=Local"

    echo "MONGODB_URI={Database Connection Url}"
    echo "MONGODB_CONNECTION_LIMIT={MongoDB Connection Limit}"

    echo "DATABASE_URL={Database Connection Url}"
    echo "POSTGRESQL_CONNECTION_LIMIT={Postgresql Connection Limit}"

    echo "CLOUDAMQP_APIKEY={MQ Api Key}"
    echo "CLOUDAMQP_URL={MQ Connection Url}"

    echo "PAYMENT_SERVER_QUEUE_CHANNEL=oth_payment_queue"
    echo "ORCHESTRATION_SERVER_QUEUE_CHANNEL=oth_orchestration_queue"

    echo "ACCESS_TOKEN_SECRET={Access Token Secret}"
    echo "RESPONSE_ENCRYPTION_SECRET={Response Encryption Secret}"

    echo "DEFAULT_LANGUAGE=en"
  } >>.env
else
  echo ".env file already exists. Nothing to do..."
fi
