import PocketBase from 'https://cdn.jsdelivr.net/npm/pocketbase@0.21.3/+esm';

export const pb = new PocketBase('https://pb.faculdadecorporativa.com.br');
pb.autoCancellation(false);
window.pb = pb;