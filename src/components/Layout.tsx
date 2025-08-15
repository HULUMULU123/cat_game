// src/components/Layout.jsx
import { Outlet, Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import tasks from "../assets/icons/tasks.svg";
import logo from "../assets/icons/logo.svg";
import rain  from "../assets/icons/rain.svg";
import quiz from "../assets/icons/quiz.svg";
import prize from "../assets/icons/prize.svg";
import bg from "../assets/bg_image.png"
import MyIcon from "./tasks/CoinCount";
const LayoutWrapper = styled.div`
  /* padding-bottom: 70px; отступ под меню */
  /* ограничение ширины высотой экрана */
  width: 100%;
  min-height: 100vh; /* ограничиваем ширину высотой окна */
  margin: 0 auto; /* центрируем по горизонтали */
  box-sizing: border-box;
  /* background-color: #f9f9f9; */

  background-image: url(${bg});
  background-position: center; /* центрировать */
  background-repeat: no-repeat;
  background-size: 110%;
  position: relative;
`;

const BottomNav = styled.nav`
  position: fixed;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 80vh;

  border-radius: 7px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 4px 25px;
  z-index: 1000;
  background: #4fc5bf;
  background: linear-gradient(
    0deg,
    rgba(79, 197, 191, 0.2) 15%,
    rgba(150, 238, 172, 0.08) 100%
  );
  box-shadow: 1px 3px 6px 0px rgba(0, 223, 152, 0.19) inset;
  -webkit-box-shadow: 1px 3px 6px 0px rgba(0, 223, 152, 0.19) inset;
  -moz-box-shadow: 1px 3px 6px 0px rgba(0, 223, 152, 0.19) inset;
  /* Размытие заднего фона */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  overflow: hidden;
`;

const NavButton = styled(Link)`
  position:relative;
  background: ${({ $main, $active }) => {
    if ($main && $active) return "white";
    if ($main) return "#2CC2A9";
    return ""; // цвет по умолчанию
  }};

  padding: 12px;
  border-radius: ${({ $main }) => ($main ? "7px" : "0px")};
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  fill: white;
  transition: background 0.2s;
  width: ${({ $main }) => ($main ? "50px" : "10px")};
  height: ${({ $main }) => ($main ? "30px" : "10px")};
  box-shadow: ${({ $main }) =>
    $main ? "1px 1px 18px 0px rgba(0, 223, 152, 0.75)" : "none"};
  -webkit-box-shadow: ${({ $main }) =>
    $main ? "1px 1px 18px 0px rgba(0, 223, 152, 0.75)" : "none"};
  -moz-box-shadow: ${({ $main }) =>
    $main ? "1px 1px 18px 0px rgba(0, 223, 152, 0.75)" : "none"};
  
`;

const StyledIcon = styled.img`
  width: ${({ $main }) => ($main ? "40px" : "30px")};
  height: ${({ $main }) => ($main ? "40px" : "30px")};

  fill: ${({ $main, $active }) => {
    if ($main && $active) return "#2CC2A9";
    return "white"; // цвет по умолчанию
  }};
`;

const StyledActiveIndicator = styled.div`
  opacity: ${({$active}) => ($active ? "1" : '0')};
  position: absolute;
  width:120%;
  height:100%;
  background: #2cc2a9;
  border-radius: 10px;
  bottom: -130%;
  display:flex;
`
const StyledLight = styled.div`
  margin: 0 auto;
  height:2px;
  width: 100%;
  box-shadow: 1px -76px 51px -1px rgba(44,194,169,0.75);
-webkit-box-shadow: 1px -76px 51px -1px rgba(44,194,169,0.75);
-moz-box-shadow: 1px -76px 51px -1px rgba(44,194,169,0.75);
`
export default function Layout() {
  const location = useLocation();

  return (
    <>
      <LayoutWrapper>
        <Outlet />
      </LayoutWrapper>

      <BottomNav>
        <NavButton to="/tasks" $active={location.pathname === "/tasks" ? 1 : 0}>
          <StyledIcon src={tasks} />
          <StyledActiveIndicator $active={location.pathname === "/tasks" ? 1 : 0}>
            <StyledLight></StyledLight>
          </StyledActiveIndicator>
        </NavButton>
        <NavButton
          to="/simulation"
          active={location.pathname === "/simulation" ? 1 : 0}
        >
          <StyledIcon src={logo} />
        </NavButton>

        <NavButton
          to="/"
          $main={true}
          $active={location.pathname === "/" ? 1 : 0}
        >
          <MyIcon height={40} width={40} fill={location.pathname === "/" ? '#2CC2A9' : "#fff" }/>
        </NavButton>

        <NavButton to="/quiz" active={location.pathname === "/quiz" ? 1 : 0}>
          <StyledIcon src={quiz} />
        </NavButton>

        <NavButton to="/prize" active={location.pathname === "/prize" ? 1 : 0}>
          <StyledIcon src={prize} />
        </NavButton>
      </BottomNav>
    </>
  );
}
