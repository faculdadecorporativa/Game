import PocketBase from 'pocketbase';
export const pb = new PocketBase('https://pb.faculdadecorporativa.com.br');
pb.autoCancellation(false);