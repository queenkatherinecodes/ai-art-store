import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Parallax, ParallaxLayer } from '@react-spring/parallax';
import { useSpring, animated } from 'react-spring';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { logService } from '../services/logService';

const LandingPage = () => {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();

    // Hook for the first section
    const [ref1, inView1] = useInView({ triggerOnce: true, threshold: 0.5 });
    const fadeInText1 = useSpring({
        opacity: inView1 ? 1 : 0,
        transform: inView1 ? 'translateY(0px)' : 'translateY(20px)',
        config: { duration: 3000 },
    });

    // Hook for the second section
    const [ref2, inView2] = useInView({ triggerOnce: true, threshold: 0.5 });
    const fadeInText2 = useSpring({
        opacity: inView2 ? 1 : 0,
        transform: inView2 ? 'translateX(0px)' : 'translateX(20px)',
        config: { duration: 3000 },
    });

    // Hook for the third section
    const [ref3, inView3] = useInView({ triggerOnce: true, threshold: 0.5 });
    const fadeInText3 = useSpring({
        opacity: inView3 ? 1 : 0,
        transform: inView3 ? 'translateX(0px)' : 'translateX(-20px)',
        config: { duration: 3000 },
    });

    const handleBrowseProductsClick = () => {
        // send telemetry to server
        logService.logLoginFromLandingPage();
        navigate('/products');
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            <Parallax pages={3}>
                <ParallaxLayer offset={0} speed={0.5} factor={1} style={{
                    backgroundImage: `${isDarkMode ? 'url(/assets/landing1.jpg)' : 'url(/assets/landing1light.jpg)'}`,
                    backgroundSize: 'cover',
                }}>
                    <div className="container mx-auto px-4">
                        <section className="hero min-h-screen flex items-center justify-left">
                            <animated.div style={fadeInText1} ref={ref1} className="text-center">
                                <h1 className="text-5xl font-bold mb-4">welcome to ai art.</h1>
                                <animated.p className="text-xl mb-8">discover unique artwork you wouldn't believe is ai generated.</animated.p>
                            </animated.div>
                        </section>
                    </div>
                </ParallaxLayer>
                <ParallaxLayer offset={1} speed={1} factor={1} style={{
                    backgroundImage: `${isDarkMode ? 'url(/assets/landing2.jpg)' : 'url(/assets/landing2light.jpg)'}`,
                    backgroundSize: 'cover',
                }}>
                    <div className="container mx-auto px-4">
                        <section className="hero min-h-screen flex items-center justify-right">
                            <animated.div style={fadeInText2} ref={ref2} className="text-center">
                                <h2 className="text-4xl font-bold mb-4">explore our collection of masterpieces.</h2>
                                <p className="text-xl">immerse yourself in the sheer wonder of ai art.</p>
                            </animated.div>
                        </section>
                    </div>
                </ParallaxLayer>
                <ParallaxLayer offset={2} speed={0.3} factor={1} style={{
                    backgroundImage: `${isDarkMode ? 'url(/assets/landing3.jpg)' : 'url(/assets/landing3light.jpg)'}`,
                    backgroundSize: 'cover',
                }}>
                    <div className="container mx-auto px-4">
                        <section className="hero min-h-screen flex items-center justify-center">
                            <animated.div style={fadeInText3} ref={ref3} className="text-center">
                                <h2 className="text-4xl font-bold mb-4">what are you waiting for? get started today.</h2>
                                <button 
                                    onClick={handleBrowseProductsClick}
                                    className={`cta-button px-6 py-2 rounded-full transition-transform duration-300 ease-in-out transform hover:scale-105 ${isDarkMode ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'}`}>
                                    browse products
                                </button>
                            </animated.div>
                        </section>
                    </div>
                </ParallaxLayer>
            </Parallax>
        </div>
    );
};

export default LandingPage;
