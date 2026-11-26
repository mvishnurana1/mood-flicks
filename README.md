# MoodFlicks

MoodFlicks recommends movies by mood, genre, and era. The React UI calls an Express API that fetches movie data from TMDB.

## Deploy on Ubuntu 24.04 LTS

The nginx config uses `movies.vishnurana.app`. Update its `server_name` and the commands below if you choose a different hostname.

### 1. Prepare the VPS

Provision Ubuntu 24.04 LTS and install your **public** SSH key. Connect over SSH with a user who can run `sudo`. If the SSH service uses a custom port, allow that port before enabling the firewall.

```bash
sudo apt update
sudo apt install curl git nginx ufw certbot python3-certbot-nginx
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

Install [Node.js 22 with NodeSource](https://github.com/nodesource/distributions/blob/master/DEV_README.md#using-ubuntu-nodejs-22) for the build and API. The systemd unit expects Node.js at `/usr/bin/node`.

### 2. Build and configure MoodFlicks

Clone a revision containing these deployment files. Substitute your repository URL for `REPO_URL`. You can also upload a copy with `API`, `UI`, `deploy`, and `nginx.conf` directly inside `/opt/moodflicks`. Build as your SSH user.

```bash
sudo install -d -m 0755 -o "$(id -un)" /opt/moodflicks
git clone REPO_URL /opt/moodflicks
cd /opt/moodflicks
(cd API && npm ci --omit=dev)
(cd UI && npm ci --include=dev --omit=optional && npm run build)
sudo install -d -m 0755 /var/www/moodflicks
sudo cp -a UI/build/. /var/www/moodflicks/
```

Use your [TMDB API Read Access Token](https://developer.themoviedb.org/docs/authentication-application). Store it in the server-side environment file.

```bash
sudo touch /etc/moodflicks.env
sudo chmod 0600 /etc/moodflicks.env
sudoedit /etc/moodflicks.env
```

Add `TMDB_TOKEN=your-api-read-access-token` to the file. For later token changes, run only `sudoedit` and restart the API.

```bash
sudo install -m 0644 deploy/moodflicks.service /etc/systemd/system/moodflicks.service
sudo systemctl daemon-reload
sudo systemctl enable --now moodflicks.service
sudo install -m 0644 nginx.conf /etc/nginx/sites-available/moodflicks
sudo ln -s /etc/nginx/sites-available/moodflicks /etc/nginx/sites-enabled/moodflicks
sudo nginx -t && sudo systemctl reload nginx
```

### 3. Verify, then point DNS at the VPS

Test nginx and TMDB on the server before changing any DNS records.

```bash
curl -fsS -o /dev/null -H 'Host: movies.vishnurana.app' http://127.0.0.1/
curl -fsS -H 'Host: movies.vishnurana.app' http://127.0.0.1/API/top-rated
curl -fsS -H 'Host: movies.vishnurana.app' \
  'http://127.0.0.1/API/recommendations?releaseDateGte=1970-01-01&releaseDateLte=1989-12-31&genre_code=80'
```

Set the hostname's DNS A record to the new VPS IPv4 address. If it has an AAAA record, update it to the VPS IPv6 address or remove it if the VPS has no IPv6. Once DNS resolves to the VPS, issue the certificate and check renewal.

```bash
sudo certbot --nginx -d movies.vishnurana.app
sudo certbot renew --dry-run
```

Open the HTTPS site, complete the quiz, and open a movie. Use `sudo journalctl -u moodflicks -n 50` for API logs.

To deploy a later version, update the checkout, rerun the install and build commands, copy the refreshed UI, and run `sudo systemctl restart moodflicks`.
