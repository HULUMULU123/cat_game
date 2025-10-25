import StakanLoader from "../../shared/components/stakan/StakanLoader";
import wordmark from "../../assets/STAKAN.svg";

interface AppLoaderProps {
  isVisible: boolean;
}

const AppLoader = ({ isVisible }: AppLoaderProps) => {
  if (!isVisible) {
    return null;
  }

  return (
    <StakanLoader
      wordmarkSrc={wordmark}
      subtitle="Грею лапки на клавиатуре…"
    />
  );
};

export default AppLoader;
