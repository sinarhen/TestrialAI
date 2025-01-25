import { customAlphabet, nanoid } from 'nanoid';
import crypto from 'crypto';


export function generateId(
	length = 16,
	alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
) {
	const nanoId = customAlphabet(alphabet, length);
	return nanoId();
}

  
export function generateCodeVerifier() {
	const array = new Uint32Array(56 / 2);
	crypto.getRandomValues(array);
	return Array.from(array, (dec) => ("0" + dec.toString(16)).substring(-2)).join("");
}

export function generateState() {
	return nanoid(15)
}