Built as a bandaid for weird HLS playlists served by Cloudflare stream.

# Problem

Every other platform let's you choose the bitrates for each level and forces the quality to these levels or drops some variants off.

Cloudflare Stream builds their playlist variants based on the ingest rate, so if your ingest bitrate is, let's say, 4Mbit/s, all the variants would be below this bitrate. Sounds good on paper, but every third party player seems to hate these. Sometimes you get a playlist with 4 variants very close to each other, even the same bandwidth. Third party players have trouble guessing the correct level.

# Not perfect solution

This little app rewrites the playlist to use pre-defined bandwidth rates, so player's have an easier time guessing which level to pick. It's not perfect, but reduces the risk of getting a bad playlist from Cloudflare.

We can only wish for Cloudflare to add a feature to make custom playlist variants, but for now, it's hacks or choosing another platform. At this point I'm too far into integrating this into our system, so no point of return.

# How to use

Set the variants to your liking on src/config.ts or use the defaults.

Host the program on a cloud provider of your choice with the following commands:

```
npm run build
npm run start
```

Make a GET request to / with a 'url' query parameter. The URL has to be URL encoded.

Example:

```
GET https://your-domain.com?url=https%3A%2F%2Fcustomer-accountid.cloudflarestream.com%2Fvideoid%2Fmanifest%2Fvideo.m3u8
```

Use as you wish. Feel free to make a PR if you find something to fix or make better.
