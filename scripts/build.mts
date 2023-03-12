import { build, BuildOptions } from 'esbuild'

// import { dependencies } from '../package.json'

const entryFile = 'src/index.ts'
const shared: BuildOptions = {
  bundle: true,
  entryPoints: [entryFile],
  // external: Object.keys(dependencies),
  minify: true,
  sourcemap: false,
}

build({
  ...shared,
  format: 'esm',
  outfile: './dist/index.esm.js',
  target: ['ES6'],
})

build({
  ...shared,
  format: 'cjs',
  outfile: './dist/index.cjs.js',
  target: ['ES6'],
})
