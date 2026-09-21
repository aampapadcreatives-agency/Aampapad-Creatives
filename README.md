# Aampapad-Creatives
Independent Creative Agency

## Run locally

```bash
npm install
npm run dev:public
# In a second terminal:
npm run dev:admin
```

- Public website: http://localhost:4174/
- Admin website: http://localhost:4175/admin

Run `npm run dev:public` and `npm run dev:admin` in separate terminals to open both ports. Studio Edit is disabled on the public port and visible on the admin port. Publishing from the admin port writes shared state to `site-state.json`; the public port checks for updates and refreshes automatically.
