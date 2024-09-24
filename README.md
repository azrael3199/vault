# Vault

This is an app to store your images safely. Vault encrypts the images you upload and serves them through a server, which means you do not have to download a jpg in your local system.

# Steps to run

1. Download Node
2. Use npm to install pnpm globally `npm i -g pnpm`
3. Use npm to install serve globally `npm i -g serve`
4. Download and install MongoDB Compass
5. Create a database and get the connection string
6. In the server folder, create a .env file as a copy of the existing .env.example file
7. Paste the DB connection string in the appropriate env variable
8. Assign a static IP to your PC in your LAN
9. Create a .env.production file in the root folder and put the server's URL with Port number in the env vars
10. With your server online, make a manual api call to `/api/users/register` with username and passcode in the body, this will create your user
11. Now run the `run.bat` script and enjoy!
