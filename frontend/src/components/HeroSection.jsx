
const HeroSection = ({ t }) => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center text-center max-w-2xl w-full mb-20 space-y-6 z-10 transition-all duration-500 ease-in-out">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
          {t?.greeting || 'Hi there!'}
        </h1>
        <h2 className="text-4xl font-semibold text-white/90">
          {t?.prompt || 'What would you like to know?'}
        </h2>
        <p className="text-lg text-blue-200/70 max-w-lg">
          {t?.subtext || 'Use one of the most common prompts below or ask your own question to get started.'}
        </p>
    </div>
  );
};

export default HeroSection;
