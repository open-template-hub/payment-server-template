![Logo](https://avatars2.githubusercontent.com/u/65504426?s=200&v=4)

# Payment Server Template

[![License](https://img.shields.io/github/license/open-template-hub/payment-server-template?color=2F7488&style=plastic)]()
[![Issues](https://img.shields.io/github/issues/open-template-hub/payment-server-template?color=2F7488&style=plastic)]()
[![PRCLosed](https://img.shields.io/github/issues-pr-closed-raw/open-template-hub/payment-server-template?color=2F7488&style=plastic)]()
[![LAstCommit](https://img.shields.io/github/last-commit/open-template-hub/payment-server-template?color=2F7488&style=plastic)]()
[![Release](https://img.shields.io/github/release/open-template-hub/payment-server-template?include_prereleases&color=2F7488&style=plastic)]()
[![BTC](https://img.shields.io/badge/Donate-BTC-ORANGE?color=F5922F&style=plastic&logo=bitcoin)](https://commerce.coinbase.com/checkout/8313af5f-de48-498d-b2cb-d98819ca7d5e)

Payment Server Template in Angular

## Configurations

```sh
PORT={Server Port}
MONGODB_URI={MongoDB Connection String}
DATABASE_URL={PostgreSQL Connection String}
ACCESS_TOKEN_SECRET={Access Token Secret}
```

### Stripe

* Example Product:
```sh
    {
        "productId" : "Product Template",
        "payload" : {
            "name" : "Product Name",
            "description" : "Product Description",
            "stripe" : {
                "amount" : 100,
                "currency" : "usd"
            },
            "coinbase" : {
                "amount" : 1,
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

## LICENSE

[MIT](LICENSE)
