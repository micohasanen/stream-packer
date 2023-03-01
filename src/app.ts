import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
dotenv.config()

const app = express()
app.use(cors())
const port = process.env.PORT || 8082

import HLS from 'hls-parser'
import axios from 'axios'
import { isValidURI } from './util'
import config from './config'

const { MasterPlaylist } = HLS.types

app.get('/', async (req, res) => {
	let url = req.query?.url
	if (!url) return res.status(400).json({ message: 'URL is required.', status: 400 })

	url = decodeURIComponent(url.toString())

	// Check if URL is valid
	if (!isValidURI(url)) return res.status(400).json({ message: 'URL is not valid.', status: 400 }) 

	try {
		// Get playlist
		const { data } = await axios.get(url)
		const playlist = HLS.parse(data)

		// If no variants, send the original
		if (!playlist?.isMasterPlaylist) {
			res.set('Content-Type', 'application/x-mpegURL')
			return res.send(Buffer.from(data))
		}

		const baseUri = url.split('/').slice(0, -1).join('/')
		const variants = []

		for (const variant of playlist.variants) {
			const height = variant.resolution?.height || 0

			const closestBitrate = config.bitrates.reduce((prev, curr) => {
				return (Math.abs(curr.height - height) < Math.abs(prev.height - height) ? curr : prev);
			})

			const audio = variant.audio.map((aud) => {
				const obj = { 
					...aud
				}

				if (obj.uri) {
					obj.uri = isValidURI(obj.uri) ? obj.uri : `${baseUri}/${obj.uri}`
				}

				return obj
			})

			variants.push({
				...variant,
				uri: isValidURI(variant.uri) ? variant.uri : `${baseUri}/${variant.uri}`,
				bandwidth: closestBitrate.kbit * 1000,
				averageBandwidth: closestBitrate.kbit * 1000,
				audio
			})
		}

		const newPlaylist = new MasterPlaylist({
			...playlist,
			// Sort by highest resolution
			variants: variants.sort((a, b) => {
				return (b.resolution?.height || 0) - (a.resolution?.height || 0)
			})
		})


		res.set('Content-Type', 'application/x-mpegURL')
		return res.send(Buffer.from(HLS.stringify(newPlaylist)))
	} catch (error) {
		return res.status(500).json({ message: 'Something went wrong.', status: 500 })
	}
})

app.listen(port, () => {
	console.log('Stream Parser running on', port)
})