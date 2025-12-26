import { createGlobalStyle } from "styled-components";

import GilroyLight from "../../assets/fonts/Gilroy-Light.otf";
import ConthraxTTF from "../../assets/fonts/Conthrax.ttf";
import Roboto from "../../assets/fonts/Roboto.ttf";

const GlobalStyle = createGlobalStyle`
  :root {
    --color-white-text: rgb(224, 255, 251);
  }

  @font-face {
    font-family: 'Gilroy';

    src: url(${GilroyLight}) format('opentype');
    font-style: normal;
    font-display: swap;

    src: url('../assets/fonts/Gilroy-Light.otf') format('opentype');

  }

  @font-face {
    font-family: 'Conthrax';
    src: url(${ConthraxTTF}) format('truetype');
    font-style: normal;
    font-display: swap;
    src: url('../assets/fonts/Conthrax.ttf') format('truetype');
    font-style: normal;
  }

  @font-face {
    font-family: 'Roboto';

    src: url(${Roboto}) format('truetype');
    font-style: normal;
    font-display: swap;

    src: url('../assets/fonts/Roboto.ttf') format('truetype');
    font-style: normal;

  }

  a {
    font-weight: 500;
    color: #646cff;
    text-decoration: inherit;

    &:hover {
      color: #535bf2;
    }
  }

  html {
    overflow: hidden;
    touch-action: none;
    -ms-touch-action: none;
  }

  body {
    margin: 0;
    padding: 0;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    touch-action: none;
    -ms-touch-action: none;
    overscroll-behavior: none;
    background-color: #00ff0d;
    font-family: 'Gilroy', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  #root {
    max-width: 100vh;
    width: 100%;
    min-height: 100vh;
  }

  .orientation-lock {
    position: fixed;
    inset: 0;
    z-index: 2147483646;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(4, 8, 14, 0.92);
    color: #e6f7ff;
    text-align: center;
    padding: 24px;
  }

  .orientation-lock__card {
    max-width: 420px;
    width: 100%;
    padding: 22px 18px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: radial-gradient(140% 140% at 20% 10%, rgba(9, 40, 30, 0.6), rgba(10, 16, 24, 0.9));
    box-shadow: 0 18px 48px rgba(0, 0, 0, 0.35);
  }

  .orientation-lock__title {
    font-family: "Conthrax", sans-serif;
    font-size: 18px;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .orientation-lock__text {
    font-size: 14px;
    line-height: 1.45;
    opacity: 0.9;
  }

  .orientation-lock__icon {
    width: 76px;
    height: 76px;
    margin: 0 auto 14px;
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
  }
`;

export default GlobalStyle;
