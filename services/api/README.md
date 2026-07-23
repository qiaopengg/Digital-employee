# Digital Employee API PoC

This service is the server-side boundary between the mobile app and DeepSeek.
The mobile bundle never receives the provider API key.

## Local run

Use Node.js 24 or newer and set `DEEPSEEK_API_KEY` in the shell or a local
secret manager. Do not put the value in source control.

```sh
export DEEPSEEK_API_KEY="<set locally>"
npm start
```

The iOS simulator connects to `http://127.0.0.1:8787`; the Android emulator
uses `http://10.0.2.2:8787`.

## Endpoints

- `GET /health`
- `GET /v1/providers/deepseek/models`
- `POST /v1/tasks` with an `Idempotency-Key` header

This is a reversible PoC boundary using Node's built-in HTTP and `fetch`
support. It validates the real provider contract without introducing a second
client-side credential path. The production service still follows the
documented NestJS, Fastify, Temporal, PostgreSQL, entitlement, and KMS gates.
