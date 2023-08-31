# FeedCatch Monorepo

This project is using NX, NestJS, PlanetScale, Stripe, NextJS, TailwindCSS and more. What you need to have on your machine:

- NodeJS 18+
- PNPM installed as global package
- [PlanetScale CLI](https://github.com/planetscale/cli) (to connect on database)
- [Stripe CLI](https://github.com/stripe/stripe-cli) (to test checkout)

## Instructions to run

Install all the packages and tools above, then clone the project, go to the folder and install the dependencies

```bash
pnpm install
```

After installing you can start the database and the checkout.

```bash
pnpm run:db
pnpm run:checkout # this is optional
```

To run the projects you can use the following commands

```bash
pnpm run:services
pnpm run:app
```

You can access the **services** running on URL `http://localhost:3000`.

You can access the **web app** running on URL `http://localhost:4200`.

## Other points

### How to test the checkout

To test via API ask [Gus](https://github.com/guscsales) for the Postman collection.

For payment: you may use those default tests payment methods listed on [Stripe Docs](https://stripe.com/docs/testing?testing-method=card-numbers#americas).

### Creating email templates

We're using [Resend](https://resend.com/) + [React Email](https://react.email/) to handle email templates. The templates should be created on `libs/react-email/emails` folder and consumed from the place you want using the alias `@email/<your_path_here>`.

The static files comes from [Thon Labs CDN](https://github.com/thon-labs/thon-static-bucket), so every static should be stored there and consumed on emails using the domain `https://static.thonlabs.io`.

**Note for sending email: it's missing create a encapsulation class yet, but it's on backlog. So it's possible to see some example on auth or checkout services.**
