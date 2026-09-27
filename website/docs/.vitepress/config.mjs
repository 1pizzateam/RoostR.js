import { defineConfig } from 'vitepress';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const production = process.env.NODE_ENV === 'production';

const base = process.env.VITEPRESS_BASE || (production ? '/RoostR.js/' : '/docs/');

const here = path.dirname(fileURLToPath(import.meta.url));

function localEntry() {
  const entry = [
    path.resolve(here, '../../../src/roostr.ts'),
    path.resolve(here, '../../dist/roostr.js'),
    path.resolve(here, '../../../dist/roostr.js'),
  ].find(candidate => fs.existsSync(candidate));

  if (!entry)
    throw new Error('Local build not found. Run "npm run build:lib" in the repository root first.');

  return entry;
}

const alias = {
  '@1pizzateam/roostr': localEntry(),
};

export default defineConfig({
  title: 'RoostR.js',
  description: 'A lightweight, modular WebGL 3D rendering engine in TypeScript with Spock math integration.',
  base,
  cleanUrls: true,
  vite: {
    server: {
      host: '0.0.0.0',
      port: 5176,
      allowedHosts: true,
    },
    resolve: { alias },
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}favicon.svg` }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: `${base}favicon-32x32.png` }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: `${base}favicon-16x16.png` }],
    ['link', { rel: 'icon', type: 'image/x-icon', href: `${base}favicon.ico` }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: `${base}apple-touch-icon.png` }],
    ['meta', { name: 'theme-color', content: '#f57c00' }],
  ],
  themeConfig: {
    siteTitle: 'RoostR.js',
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Overview', link: '/guide/overview' },
          { text: 'Installation', link: '/guide/installation' },
          { text: 'Examples', link: '/guide/examples' },
        ],
      },
      {
        text: 'API overview',
        link: '/api/',
      },
      {
        text: 'Scene & Core',
        collapsed: false,
        items: [
          { text: 'Scene', link: '/api/scene' },
          { text: 'Mesh', link: '/api/mesh' },
          { text: 'Material', link: '/api/material' },
          { text: 'Texture', link: '/api/texture' },
        ],
      },
      {
        text: 'Cameras & Controls',
        collapsed: false,
        items: [
          { text: 'PerspectiveCamera', link: '/api/perspective-camera' },
          { text: 'OrthographicCamera', link: '/api/orthographic-camera' },
          { text: 'OrbitControls', link: '/api/orbit-controls' },
        ],
      },
      {
        text: 'Lighting',
        collapsed: false,
        items: [
          { text: 'Lights Overview', link: '/api/lights' },
          { text: 'DirectionalLight', link: '/api/directional-light' },
          { text: 'PointLight', link: '/api/point-light' },
          { text: 'SpotLight', link: '/api/spot-light' },
          { text: 'AmbientLight', link: '/api/ambient-light' },
        ],
      },
      {
        text: 'Geometry & Meshes',
        collapsed: false,
        items: [
          { text: 'Primitives', link: '/api/geometry' },
          { text: 'Procedural Models', link: '/api/models' },
          { text: 'CustomMesh & SubMesh', link: '/api/custom-mesh' },
        ],
      },
      {
        text: 'Spatial & Raycasting',
        collapsed: false,
        items: [
          { text: 'BoundingBox', link: '/api/box3' },
          { text: 'BoundingSphere', link: '/api/sphere' },
          { text: 'Frustum Culling', link: '/api/frustum' },
          { text: 'Ray & Intersections', link: '/api/ray' },
        ],
      },
      {
        text: 'Renderer & Shaders',
        collapsed: false,
        items: [
          { text: 'Renderer', link: '/api/renderer' },
          { text: 'RenderTarget', link: '/api/render-target' },
          { text: 'Shaders & Programs', link: '/api/shaders' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/1pizzateam/RoostR.js' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/@1pizzateam/roostr' },
    ],
    search: {
      provider: 'local',
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2017-present 1 Pizza Team',
    },
  },
});
