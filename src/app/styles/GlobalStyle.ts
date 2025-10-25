import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  :root {
    --color-white-text: rgb(224, 255, 251);
  }

  @font-face {
    font-family: 'Gilroy';
    src: url('../assets/fonts/Gilroy-Light.otf') format('opentype');
  }

  @font-face {
    font-family: 'Conthrax';
    src: url('../assets/fonts/Conthrax.ttf') format('truetype');
    font-style: normal;
  }

  @font-face {
    font-family: 'Roboto';
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
  }

  body {
    margin: 0;
    padding: 0;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
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
`;

export default GlobalStyle;
