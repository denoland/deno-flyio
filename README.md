# Deno KV on fly.io

This example application demonstrates how to run a Deno server on
[fly.io](https://fly.io) that uses [Deno KV](https://www.deno.com/kv) for
persistence thanks to
[KV remote connection strings](https://deno.com/deploy/docs/kv#connect-to-managed-databases-from-outside-of-deno-deploy).

## Local development

The server is set up by default to load a KV database in the default location
for local development. You can run the server with:

```bash
deno task start
```

## Deployment

To deploy this application to [fly.io](https://fly.io), you will need to:

- [Sign up for fly.io and install the `flyctl` command line utility](https://fly.io/docs/hands-on/install-flyctl/)
- [Sign up for Deno Deploy and create a blank project (we'll just use KV)](https://dash.deno.com/signin)

After signing up for both services, edit the code in `server.tsx` to use a
remote KV database instead of a local one. Comment out this line on line 9 near
the top of the file:

```ts
// const kv = await Deno.openKv();
```

Then, uncomment these three lines beneath it around line 12:

```ts
const dbId = "7dd0d727-3fb0-4c06-84ff-a7062921f940";
const dbUrl = `https://api.deno.com/databases/${dbId}/connect`;
const kv = await Deno.openKv(dbUrl);
```

Replace the `dbId` variable with the ID for a KV database in your Deno Deploy
project. This ID can be found on a project dashboard under the "KV" tab.

![Deno KV UUID string location](/docs/deno-dash.png?raw=true "Deno KV UUID string location")

After configuring the database connection URL, you'll also need to export an
environment variable:

```bash
export DENO_KV_ACCESS_TOKEN=xxxxxxxxx
```

This access token will be used by the Deno runtime to authenticate your
connection to the database on Deno Deploy. You can create an access token in the
Deno dashboard [here](https://dash.deno.com/account#access-tokens).

After making this change to your code, run it locally to ensure it's properly
connected to and interacting with your remote KV database.

Once things are looking good with your app code, you can optionally deploy it to
fly.io to see how it works in a non-Deno Deploy hosting environment.

### Deploying to fly.io

[Create an application](https://fly.io/docs/flyctl/apps-create/) on fly.io.
Replace the name of your application in line 6 of `fly.toml`.

```toml
app = "deno-flyio3" # your app ID here
primary_region = "dfw"
```

After creating the application, you'll need to configure a
`DENO_KV_ACCESS_TOKEN` environment variable, just as we did above. You can use
the same access token as before, or a different one. Environment variables are
defined under the "Secrets" tab of your fly.io application.

![Configure a fly.io env variable](/docs/fly-dash.png?raw=true "Configure a fly.io env variable")

The `Dockerfile` for this project should be fine without further editing. With
your app ID and Deno Deploy access token configured, you should be able to run:

```bash
fly deploy
```

This will send your app to the cloud, where it should happily connect to 
Deno KV.

## License

MIT
