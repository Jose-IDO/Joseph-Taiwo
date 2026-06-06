# wedding-website

This repository contains a multi-project workspace centered around a wedding website built with Next.js.

## Repository structure

- `wedding-site/` - The main wedding website application.
- `impeccable/` - A separate project containing a large codebase with its own docs and tooling.
- `skill/` - A supporting skill package.
- `taste-skill/` - Another supporting skill package.

## Getting started

The primary app in this repository is located in `wedding-site`.

### Run the wedding site locally

```bash
cd wedding-site
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

### Build for production

```bash
cd wedding-site
npm run build
```

### Lint

```bash
cd wedding-site
npm run lint
```

## Notes

- Each subdirectory is a separate project with its own `package.json` and tooling.
- The root `package.json` currently only contains a single dependency and is not the main application package.
- For details about the `wedding-site` app, see `wedding-site/README.md`.
- For details about the `impeccable` project, see `impeccable/README.md`.
- GitHub Pages deployment is configured with a workflow that builds `wedding-site` and publishes the output via GitHub Pages Actions.
- To use this deployment, set GitHub Pages source to "GitHub Actions" in repository settings.

## Useful links

- `wedding-site/README.md`
- `impeccable/README.md`

## License

See the individual subproject license files for licensing information.
