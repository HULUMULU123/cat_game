import React from "react";
import styled from "styled-components";
import bg_image from "../../assets/bg_image.png";
interface ModelProps {
  // URL картинки для фона
  children?: React.ReactNode; // чтобы можно было вставить внутрь контент
}

const ModelWrapper = styled.div<{ backgroundImage: string }>`
  position: relative;

  height: 100vh; /* на весь экран по высоте */
  background-image: url(${(props) => props.backgroundImage});
  background-size: 110%;
  /* растянуть, сохраняя пропорции */
  background-position: center; /* центрировать */
  background-repeat: no-repeat;
`;

const Content = styled.div`
  z-index: 1; /* поверх фона */
`;

const Model: React.FC<ModelProps> = ({ children }) => {
  return (
    <ModelWrapper backgroundImage={bg_image}>
      <Content>{children}</Content>
    </ModelWrapper>
  );
};

export default Model;
