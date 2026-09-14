import { forwardRef, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const forestNormal = '/assets/hero/forest-normal.jpg';
const forestFire = '/assets/hero/forest-fire.jpg';

const ForestHeroSection = forwardRef(function ForestHeroSection(
    { children, pinHeightVh = 200 },
    forwardedRef
) {
    const containerRef = useRef(null);

    const setRefs = (node) => {
        containerRef.current = node;
        if (typeof forwardedRef === 'function') {
            forwardedRef(node);
        } else if (forwardedRef) {
            forwardedRef.current = node;
        }
    };

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    });

    const fireInsetTop = useTransform(scrollYProgress, [0.1, 0.9], [100, 0], {
        clamp: true,
    });
    const fireClipPath = useTransform(fireInsetTop, (v) => `inset(${v}% 0% 0% 0%)`);

    return (
        <div ref={setRefs} className="relative" style={{ height: `${pinHeightVh}vh` }}>
            <div className="sticky top-0 h-screen overflow-hidden border-b border-black/5">
                <img
                    src={forestNormal}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover"
                />

                <motion.img
                    src={forestFire}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ clipPath: fireClipPath }}
                />

                <div className="absolute inset-0 bg-black/25" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_50%_50%,rgba(0,0,0,0.55),rgba(0,0,0,0)_70%)]" />

                <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6">
                    {children}
                </div>
            </div>
        </div>
    );
});

export default ForestHeroSection;