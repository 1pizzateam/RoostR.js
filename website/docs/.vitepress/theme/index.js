import { h } from 'vue';
import DefaultTheme from 'vitepress/theme';
import RoostRLogo from './components/RoostRLogo.vue';
import SceneDemo from './components/SceneDemo.vue';
import './demo.css';

export default {
  extends: DefaultTheme,
  // The homepage mark is the library drawing itself, standing in for the hero image
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-hero-image': () => h(RoostRLogo),
    });
  },
  enhanceApp({ app }) {
    app.component('RoostRLogo', RoostRLogo);
    app.component('SceneDemo', SceneDemo);
  },
};
