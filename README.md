# FeedCatch Monorepo

This project is using NX, NestJS, PlanetScale, Stripe, NextJS, TailwindCSS and more. What you need to have on your machine:

- NodeJS 18+
- Docker
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
