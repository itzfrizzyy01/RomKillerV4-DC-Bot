# Uploading this project to GitHub

1. Extract this ZIP on your computer.
2. Open the extracted `RomKillerV4-Discord-Bot` folder.
3. On GitHub, create a new empty repository.
4. Click **Add file → Upload files**.
5. Select everything inside this folder, including `package.json`, `pnpm-lock.yaml`, `artifacts`, and `lib`.
6. Do not upload `node_modules`, `.local`, `.git`, or build output.
7. Commit the files.

## Replit Secrets

Never commit these values to GitHub:

- `DISCORD_BOT_TOKEN`
- `DISCORD_GUILD_ID`
- `MC_SERVER_HOST`
- `MC_SERVER_PORT`
- `DATABASE_URL`

Add them as environment variables or Secrets when running the project.