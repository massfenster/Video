import {defineConfig} from 'astro/config';

export default defineConfig({
  site: 'https://massfensternrw.de',
  trailingSlash: 'ignore',
  build: {format: 'directory'},
});
