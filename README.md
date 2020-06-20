![Logo](https://avatars2.githubusercontent.com/u/65504426?s=200&v=4)

# Payment Server Template

[![License](https://img.shields.io/github/license/open-template-hub/payment-server-template?color=2F7488&style=for-the-badge)](LICENSE)
[![Issues](https://img.shields.io/github/issues/open-template-hub/payment-server-template?color=2F7488&style=for-the-badge)](https://github.com/open-template-hub/payment-server-template/issues)
[![PRCLosed](https://img.shields.io/github/issues-pr-closed-raw/open-template-hub/payment-server-template?color=2F7488&style=for-the-badge)](https://github.com/open-template-hub/payment-server-template/pulls?q=is%3Apr+is%3Aclosed)
[![LastCommit](https://img.shields.io/github/last-commit/open-template-hub/payment-server-template?color=2F7488&style=for-the-badge)](https://github.com/open-template-hub/payment-server-template/commits/master)
[![Release](https://img.shields.io/github/release/open-template-hub/payment-server-template?include_prereleases&color=2F7488&style=for-the-badge)](https://github.com/open-template-hub/payment-server-template/releases)
[![SonarCloud](https://img.shields.io/sonar/quality_gate/open-template-hub_payment-server-template?server=https%3A%2F%2Fsonarcloud.io&label=Sonar%20Cloud&style=for-the-badge&logo=sonarcloud)](https://sonarcloud.io/dashboard?id=open-template-hub_payment-server-template)
[![BTC](https://img.shields.io/badge/Donate-BTC-ORANGE?color=F5922F&style=for-the-badge&logo=bitcoin)](https://commerce.coinbase.com/checkout/8313af5f-de48-498d-b2cb-d98819ca7d5e)

Payment Server Template in NodeJS Express.js

## Express Deploy

Deploy this template to Heroku

[![Deploy](https://img.shields.io/badge/Deploy_to-Heroku-7056bf.svg?style=for-the-badge&logo=heroku)](https://heroku.com/deploy?template=https://github.com/open-template-hub/payment-server-template)

## Configurations

```sh
PORT={Server Port}
MONGODB_URI={MongoDB Connection String}
DATABASE_URL={PostgreSQL Connection String}
ACCESS_TOKEN_SECRET={Access Token Secret}
RESPONSE_ENCRYPTION_SECRET={Response Encryption Secret}
```

If you don't give **RESPONSE_ENCRYPTION_SECRET**, response encryption mechanism will be disabled automatically.

### Stripe

* Example Product:
```sh
    {
        "product_id" : "0276d8d1-0945-412b-92d1-084a6e3f7554",
        "name" : "Premium",
        "description" : "full access to premium features!",
        "payload" : {
            "stripe" : {
                "amount" : 1999,
                "currency" : "usd"
            },
            "coinbase" : {
                "amount" : 19.99,
                "currency" : "usd"
            },
            "paypal" : {
                "amount" : 19.99,
                "currency" : "usd"
            }
        }
    }
```

* Example Stripe Payment Config:
```sh
  {
        "key": "STRIPE",
        "payload": {
            "method": "stripe",
            "secret": "{Your Payment Secret on Stripe}",
            "payment_method_types": [
                "card"
            ],
            "mode": "payment",
            "success_url": "https://localhost:4000/success?session_id={CHECKOUT_SESSION_ID}",
            "cancel_url": "https://localhost:4000/cancel"
        }
  }
```

* Example Coinbase Payment Config:
```sh
    {
        "key" : "COINBASE",
        "payload" : {
            "method" : "coinbase",
            "secret" : "{Your Payment Secret on Coinbase}",
            "charge_url" : "https://api.commerce.coinbase.com/charges",
            "success_url" : "https://localhost:4000/success",
            "cancel_url" : "https://localhost:4000/cancel"
        }
    }
```

* Example PayPal Payment Config:
```sh
    {
        "key" : "PAYPAL",
        "payload" : {
            "method" : "paypal",
            "env" : "sandbox",
            "secret" : "{Your Payment Secret on PayPal}",
            "client_id" : "{Your Client Id on PayPal}",
            "success_url" : "https://basic-angular-ui-template-st.herokuapp.com/success",
            "cancel_url" : "https://basic-angular-ui-template-st.herokuapp.com/cancel"
        }
    }
```

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/furknyavuz"><img src="https://avatars0.githubusercontent.com/u/2248168?s=460&u=435ef6ade0785a7a135ce56cae751fb3ade1d126&v=4" width="100px;" alt=""/><br /><sub><b>Furkan Yavuz</b></sub></a><br /><a href="https://github.com/open-template-hub/payment-server-template/issues/created_by/furknyavuz" title="Answering Questions">💬</a> <a href="https://github.com/open-template-hub/payment-server-template/commits?author=furknyavuz" title="Documentation">📖</a> <a href="https://github.com/open-template-hub/payment-server-template/pulls?q=is%3Apr+reviewed-by%3Afurknyavuz" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/fatihturker"><img src="https://avatars1.githubusercontent.com/u/2202179?s=460&u=261b1129e7106c067783cb022ab9999aad833bdc&v=4" width="100px;" alt=""/><br /><sub><b>Fatih Turker</b></sub></a><br /><a href="https://github.com/open-template-hub/payment-server-template/issues/created_by/fatihturker" title="Answering Questions">💬</a> <a href="https://github.com/open-template-hub/payment-server-template/commits?author=fatihturker" title="Documentation">📖</a> <a href="https://github.com/open-template-hub/payment-server-template/pulls?q=is%3Apr+reviewed-by%3Afatihturker" title="Reviewed Pull Requests">👀</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

## Contributing

* Fork it
* Create your update branch (git checkout -b my-feature-branch)
* Commit your changes (git commit -am 'Add some features')
* Push to the branch (git push origin my-feature-branch)
* Create new Pull Request

## LICENSE

[MIT](LICENSE)
