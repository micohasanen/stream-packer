export function isValidURI (uri: string) {
	try {
		new URL(uri)
		return true
	} catch (error) {
		return false
	}
}