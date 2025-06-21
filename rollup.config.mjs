import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { swc } from '@rollup/plugin-swc';
import postcss from 'rollup-plugin-postcss';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const packageJson = require('./package.json');

export default [
  // Main bundle for CJS and ESM
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      swc({
        swc: {
          jsc: {
            transform: {
              react: {
                runtime: 'automatic',
              },
            },
            parser: {
              syntax: 'typescript',
              tsx: true,
            },
          },
        },
      }),
      postcss({
        extract: 'styles.css',
        modules: true,
        use: ['sass'],
        minimize: true,
      }),
      terser(),
    ],
    external: ['react', 'react-dom', 'antd'],
  },
  // TypeScript declaration file bundle
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/types/index.d.ts', format: 'esm' }],
    plugins: [dts.default()],
    external: [/\.css$/u, 'react', 'react-dom', 'antd'],
  },
];
