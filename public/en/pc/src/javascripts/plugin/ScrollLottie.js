/*!  ScrollLottie */
const ScrollLottie = (lets) => {
    let playhead = { frame: 0 },
        target = gsap.utils.toArray(lets.target)[0],
        speeds = { slow: "+=2000", medium: "+=1000", fast: "+=500" },
        st = { trigger: target, pin: true, start: "top top", end: speeds[lets.speed] || "+=1000", scrub: true },
        animation = lottie.loadAnimation({
            container: target,
            renderer: lets.renderer || "svg",
            loop: false,
            autoplay: false,
            path: lets.path
        });
    for (let p in lets) {
        st[p] = lets[p];
    }
    animation.addEventListener("DOMLoaded", function () {
        gsap.to(playhead, {
            frame: animation.totalFrames - 1,
            ease: "none",
            onUpdate: () => animation.goToAndStop(playhead.frame, true),
            scrollTrigger: st,
        });
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
    });
    return animation;


}